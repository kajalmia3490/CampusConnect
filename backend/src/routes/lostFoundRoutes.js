const express = require('express');
const router = express.Router();
const lostFoundController = require('../controllers/lostFoundController');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, lostFoundController.getItems);
router.post('/', authenticateToken, lostFoundController.createItem);
router.put('/:id/status', authenticateToken, lostFoundController.updateItemStatus);

module.exports = router;
