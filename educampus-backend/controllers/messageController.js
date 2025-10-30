const Message = require('../models/messageModel');

// @desc    Get all messages for a room
// @route   GET /api/messages/:roomId
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.roomId })
      .populate('sender', 'username avatar') // <-- UPDATED THIS LINE
      .sort({ createdAt: 'asc' });
      
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMessages,
};