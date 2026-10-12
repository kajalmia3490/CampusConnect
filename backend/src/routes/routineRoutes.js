const express = require('express');
const router = express.Router();
const routineController = require('../controllers/routineController');
const authenticateToken = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');

router.get('/', authenticateToken, routineController.getRoutines);
router.get('/today', authenticateToken, routineController.getTodayRoutines);
router.post('/', authenticateToken, requireRole('ADMIN'), routineController.createRoutine);
router.delete('/:id', authenticateToken, requireRole('ADMIN'), routineController.deleteRoutine);

module.exports = router;
