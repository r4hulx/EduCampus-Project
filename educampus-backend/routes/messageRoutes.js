const express = require('express');
const router = express.Router();
const { getMessages } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// :roomId is a "URL parameter"
router.route('/:roomId').get(protect, getMessages);

module.exports = router;