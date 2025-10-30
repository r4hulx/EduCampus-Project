const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['student', 'teacher'],
      default: 'student',
    },
    // --- ADDED THIS ---
    avatar: {
      type: String,
      default: 'https://i.imgur.com/6VBx3io.png', // A generic default avatar
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;