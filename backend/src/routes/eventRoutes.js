const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authenticateToken = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');

router.get('/', authenticateToken, eventController.getEvents);
router.get('/:id', authenticateToken, eventController.getEventById);
router.post('/', authenticateToken, requireRole('ADMIN'), eventController.createEvent);
router.post('/:id/register', authenticateToken, eventController.registerEvent);
router.post('/:id/unregister', authenticateToken, eventController.unregisterEvent);

module.exports = router;
