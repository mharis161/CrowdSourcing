import express from 'express';
import {
  updateHomeLocation,
  updateProfileDetails,
  getAvailableTasks,
  acceptTask,
  getMyAssignments,
  getAssignmentById,
  submitAssignment
} from '../controllers/participantTaskController.js';
import { protect, participantOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.patch('/profile/location', protect, participantOnly, updateHomeLocation);
router.patch('/profile/details', protect, participantOnly, updateProfileDetails);
router.get('/available', protect, participantOnly, getAvailableTasks);
router.post('/:id/accept', protect, participantOnly, acceptTask);
router.get('/my-assignments', protect, participantOnly, getMyAssignments);
router.get('/assignments/:id', protect, participantOnly, getAssignmentById);
router.post('/assignments/:id/submit', protect, participantOnly, submitAssignment);

export default router;
