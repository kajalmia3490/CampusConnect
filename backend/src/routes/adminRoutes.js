const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateToken = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');

// All admin routes require ADMIN role
router.use(authenticateToken, requireRole('ADMIN'));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id/toggle', adminController.toggleUserStatus);
router.get('/departments', adminController.getDepartments);
router.post('/departments', adminController.createDepartment);

module.exports = router;
