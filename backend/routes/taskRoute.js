import express from 'express';
import { createTask, getCompanyTasks, updateTaskStatus, updateTask, getTaskById, getTaskResponses, runAssignmentQA, reviewAssignment } from '../controllers/taskController.js';
import { protect, companyOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, companyOnly, createTask);
router.get('/my-tasks', protect, companyOnly, getCompanyTasks);
router.get('/:id', protect, companyOnly, getTaskById);
router.get('/:id/responses', protect, companyOnly, getTaskResponses);
router.post('/:id/assignments/:assignmentId/run-qa', protect, companyOnly, runAssignmentQA);
router.patch('/:id/assignments/:assignmentId/review', protect, companyOnly, reviewAssignment);
router.patch('/:id/status', protect, companyOnly, updateTaskStatus);
router.put('/:id', protect, companyOnly, updateTask);

export default router;
