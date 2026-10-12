const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const authenticateToken = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');

router.get('/', authenticateToken, complaintController.getComplaints);
router.get('/:id', authenticateToken, complaintController.getComplaintById);
router.post('/', authenticateToken, complaintController.createComplaint);
router.put('/:id/status', authenticateToken, requireRole('STAFF', 'ADMIN'), complaintController.updateComplaintStatus);

module.exports = router;
