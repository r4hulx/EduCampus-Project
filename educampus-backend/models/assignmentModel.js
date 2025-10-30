const mongoose = require('mongoose');

const assignmentSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: false },
    dueDate: { type: Date, required: false },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubjectRoom',
      required: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds 'createdAt'
  }
);

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;