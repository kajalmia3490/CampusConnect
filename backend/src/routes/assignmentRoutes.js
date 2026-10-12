const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const authenticateToken = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');

router.get('/', authenticateToken, assignmentController.getAssignments);
router.get('/:id', authenticateToken, assignmentController.getAssignmentById);
router.post('/', authenticateToken, requireRole('TEACHER', 'ADMIN'), assignmentController.createAssignment);
router.post('/:id/submit', authenticateToken, requireRole('STUDENT'), assignmentController.submitAssignment);
router.put('/submissions/:submissionId/grade', authenticateToken, requireRole('TEACHER', 'ADMIN'), assignmentController.gradeSubmission);

module.exports = router;
