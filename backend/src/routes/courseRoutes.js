const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authenticateToken = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');

router.get('/', authenticateToken, courseController.getCourses);
router.get('/:id', authenticateToken, courseController.getCourseById);
router.post('/', authenticateToken, requireRole('ADMIN'), courseController.createCourse);
router.post('/:id/enroll', authenticateToken, requireRole('STUDENT'), courseController.enrollCourse);

module.exports = router;
