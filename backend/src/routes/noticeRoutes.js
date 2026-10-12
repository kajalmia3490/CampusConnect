const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');
const authenticateToken = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');

router.get('/', authenticateToken, noticeController.getNotices);
router.get('/:id', authenticateToken, noticeController.getNoticeById);
router.post('/', authenticateToken, requireRole('ADMIN', 'TEACHER'), noticeController.createNotice);
router.delete('/:id', authenticateToken, requireRole('ADMIN'), noticeController.deleteNotice);

module.exports = router;
