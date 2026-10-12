const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const authenticateToken = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');

router.get('/', authenticateToken, materialController.getMaterials);
router.post('/', authenticateToken, requireRole('TEACHER', 'ADMIN'), materialController.uploadMaterial);
router.delete('/:id', authenticateToken, requireRole('TEACHER', 'ADMIN'), materialController.deleteMaterial);

module.exports = router;
