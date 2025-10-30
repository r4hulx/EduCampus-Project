const mongoose = require('mongoose');

const messageSchema = mongoose.Schema(
  {
    content: { type: String, trim: true },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubjectRoom',
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;