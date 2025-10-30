const mongoose = require('mongoose');

const subjectRoomSchema = mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: false },
    // 'members' will be an array of User IDs
    members: [
      {
        type: mongoose.Schema.Types.ObjectId, // This is a special type for IDs
        ref: 'User', // This links to our 'User' model
      },
    ],
    // 'createdBy' will be the User ID of the person who made the room
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const SubjectRoom = mongoose.model('SubjectRoom', subjectRoomSchema);

module.exports = SubjectRoom;