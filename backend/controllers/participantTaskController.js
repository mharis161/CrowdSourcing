import prisma from '../lib/prisma.js';

const taskInclude = {
  locations: true,
  company: { select: { companyName: true } }
};

const toRad = (deg) => (deg * Math.PI) / 180;

// Returns meters, to compare directly against TaskLocation.radius (also meters).
function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const updateHomeLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'latitude and longitude are required' });
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { homeLatitude: parseFloat(latitude), homeLongitude: parseFloat(longitude) }
    });

    res.json({ homeLatitude: user.homeLatitude, homeLongitude: user.homeLongitude });
  } catch (error) {
    console.error('Update home location error:', error);
    res.status(500).json({ message: 'Server error while updating location' });
  }
};

export const getAvailableTasks = async (req, res) => {
  try {
    const { homeLatitude, homeLongitude } = req.user;

    if (homeLatitude === null || homeLongitude === null || homeLatitude === undefined || homeLongitude === undefined) {
      return res.json({ tasks: [], message: 'Set your location in your profile to see available tasks' });
    }

    const existingAssignments = await prisma.taskAssignment.findMany({
      where: { participantId: req.user.id },
      select: { taskId: true }
    });
    const assignedTaskIds = existingAssignments.map((a) => a.taskId);

    const tasks = await prisma.task.findMany({
      where: {
        status: 'ACTIVE',
        id: { notIn: assignedTaskIds }
      },
      include: taskInclude,
      orderBy: { createdAt: 'desc' }
    });

    // Hard filter: only tasks with at least one location whose own
    // company-configured radius covers the participant's home location.
    const withDistance = tasks
      .map((task) => {
        const distances = task.locations
          .map((loc) => ({
            meters: haversineMeters(homeLatitude, homeLongitude, loc.latitude, loc.longitude),
            radius: loc.radius
          }))
          .filter((d) => d.meters <= d.radius);
        if (distances.length === 0) return null;
        const nearestMeters = Math.min(...distances.map((d) => d.meters));
        return { ...task, distanceKm: nearestMeters / 1000 };
      })
      .filter(Boolean);

    withDistance.sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({ tasks: withDistance });
  } catch (error) {
    console.error('Get available tasks error:', error);
    res.status(500).json({ message: 'Server error while fetching available tasks' });
  }
};

export const acceptTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task || task.status !== 'ACTIVE') {
      return res.status(404).json({ message: 'Task not found' });
    }

    const acceptedCount = await prisma.taskAssignment.count({ where: { taskId: id } });
    if (acceptedCount >= task.maxParticipants) {
      return res.status(409).json({ message: 'This task has reached its participant limit' });
    }

    const assignment = await prisma.taskAssignment.create({
      data: {
        taskId: id,
        participantId: req.user.id,
        status: 'IN_PROGRESS',
        reward: task.reward
      },
      include: { task: { include: taskInclude } }
    });

    res.status(201).json(assignment);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'You have already accepted this task' });
    }
    console.error('Accept task error:', error);
    res.status(500).json({ message: 'Server error while accepting task' });
  }
};

export const getMyAssignments = async (req, res) => {
  try {
    const { status } = req.query;

    const assignments = await prisma.taskAssignment.findMany({
      where: {
        participantId: req.user.id,
        ...(status ? { status } : {})
      },
      include: { task: { include: taskInclude } }
    });

    res.json(assignments);
  } catch (error) {
    console.error('Get my assignments error:', error);
    res.status(500).json({ message: 'Server error while fetching assignments' });
  }
};

export const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await prisma.taskAssignment.findFirst({
      where: { id, participantId: req.user.id },
      include: { task: { include: taskInclude } }
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json(assignment);
  } catch (error) {
    console.error('Get assignment by id error:', error);
    res.status(500).json({ message: 'Server error while fetching assignment' });
  }
};

export const submitAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { responseData } = req.body;

    const assignment = await prisma.taskAssignment.findFirst({
      where: { id, participantId: req.user.id }
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.status !== 'IN_PROGRESS') {
      return res.status(400).json({ message: 'This task has already been submitted' });
    }

    const updated = await prisma.taskAssignment.update({
      where: { id },
      data: {
        responseData: responseData ?? {},
        status: 'SUBMITTED',
        submittedAt: new Date()
      },
      include: { task: { include: taskInclude } }
    });

    res.json(updated);
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ message: 'Server error while submitting assignment' });
  }
};
