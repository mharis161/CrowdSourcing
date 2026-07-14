import prisma from '../lib/prisma.js';
import { runQA } from '../services/qaService.js';

export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      reward,
      maxParticipants,
      startDate,
      endDate,
      locations,
      surveyConfig
    } = req.body;

    if (!title || !description || !type || reward === undefined || !maxParticipants) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (!locations || !Array.isArray(locations) || locations.length === 0) {
      return res.status(400).json({ message: 'At least one location is required' });
    }

    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        type,
        reward: parseFloat(reward),
        maxParticipants: parseInt(maxParticipants),
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        companyId: req.user.company.id,
        status: 'ACTIVE',
        surveyConfig: surveyConfig || null,
        locations: {
          create: locations.map(loc => ({
            locationName: loc.locationName,
            latitude: parseFloat(loc.latitude),
            longitude: parseFloat(loc.longitude),
            radius: parseFloat(loc.radius || 1000)
          }))
        }
      },
      include: {
        locations: true
      }
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error while creating task' });
  }
};

export const getCompanyTasks = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { companyId: req.user.company.id },
      orderBy: { createdAt: 'desc' },
      include: { locations: true }
    });
    res.json(tasks);
  } catch (error) {
    console.error('Get company tasks error:', error);
    res.status(500).json({ message: 'Server error while fetching tasks' });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Verify task belongs to this company
    const task = await prisma.task.findFirst({
      where: { id, companyId: req.user.company.id }
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status }
    });

    res.json(updatedTask);
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ message: 'Server error while updating task' });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, reward, maxParticipants, startDate, endDate, locations, surveyConfig } = req.body;

    // Verify task belongs to this company
    const task = await prisma.task.findFirst({
      where: { id, companyId: req.user.company.id }
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Update task
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        type,
        reward: reward ? parseFloat(reward) : undefined,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : undefined,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        surveyConfig: surveyConfig !== undefined ? surveyConfig : undefined,
      }
    });

    // Handle locations explicitly if they are sent in edit
    if (locations && Array.isArray(locations) && locations.length > 0) {
      await prisma.taskLocation.deleteMany({ where: { taskId: id } });
      await prisma.taskLocation.createMany({
        data: locations.map(loc => ({
          taskId: id,
          locationName: loc.locationName,
          latitude: parseFloat(loc.latitude),
          longitude: parseFloat(loc.longitude),
          radius: parseFloat(loc.radius || 1000)
        }))
      });
    }

    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error while editing task' });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await prisma.task.findFirst({
      where: {
        id,
        companyId: req.user.company.id
      },
      include: { locations: true }
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task by id error:', error);
    res.status(500).json({ message: 'Server error while fetching task' });
  }
};

export const getTaskResponses = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify task belongs to this company
    const task = await prisma.task.findFirst({
      where: { id, companyId: req.user.company.id },
      include: { locations: true }
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const assignments = await prisma.taskAssignment.findMany({
      where: { taskId: id },
      include: { participant: { select: { name: true, email: true } } },
      orderBy: { submittedAt: 'desc' }
    });

    const submitted = assignments.filter((a) => a.status === 'SUBMITTED' || a.status === 'APPROVED');
    const budgetBurned = submitted.reduce((sum, a) => sum + a.reward, 0);

    res.json({
      task,
      totalAssignments: assignments.length,
      submittedCount: submitted.length,
      budgetBurned,
      assignments
    });
  } catch (error) {
    console.error('Get task responses error:', error);
    res.status(500).json({ message: 'Server error while fetching task responses' });
  }
};

export const runAssignmentQA = async (req, res) => {
  try {
    const { id, assignmentId } = req.params;

    const task = await prisma.task.findFirst({
      where: { id, companyId: req.user.company.id }
    });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const assignment = await prisma.taskAssignment.findFirst({
      where: { id: assignmentId, taskId: id }
    });
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const updated = await runQA(id, assignmentId);
    res.json(updated);
  } catch (error) {
    console.error('Run assignment QA error:', error);
    res.status(500).json({ message: 'Server error while running QA' });
  }
};

export const reviewAssignment = async (req, res) => {
  try {
    const { id, assignmentId } = req.params;
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: "status must be 'APPROVED' or 'REJECTED'" });
    }

    const task = await prisma.task.findFirst({
      where: { id, companyId: req.user.company.id }
    });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const assignment = await prisma.taskAssignment.findFirst({
      where: { id: assignmentId, taskId: id }
    });
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const updated = await prisma.taskAssignment.update({
      where: { id: assignmentId },
      data: status === 'APPROVED'
        ? { status, approvedAt: new Date() }
        : { status, rejectedAt: new Date() }
    });
    res.json(updated);
  } catch (error) {
    console.error('Review assignment error:', error);
    res.status(500).json({ message: 'Server error while reviewing assignment' });
  }
};

