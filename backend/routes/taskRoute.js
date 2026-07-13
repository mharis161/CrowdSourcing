import express from 'express';
import { createTask, getCompanyTasks, updateTaskStatus, updateTask, getTaskById, getTaskResponses } from '../controllers/taskController.js';
import { protect, companyOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, companyOnly, createTask);
router.get('/my-tasks', protect, companyOnly, getCompanyTasks);
router.get('/:id', protect, companyOnly, getTaskById);
router.get('/:id/responses', protect, companyOnly, getTaskResponses);
router.patch('/:id/status', protect, companyOnly, updateTaskStatus);
router.put('/:id', protect, companyOnly, updateTask);

export default router;
