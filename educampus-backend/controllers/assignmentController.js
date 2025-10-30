const Assignment = require('../models/assignmentModel');
const SubjectRoom = require('../models/subjectRoomModel');

// @desc    Get all assignments for a specific room
// @route   GET /api/assignments/:roomId
const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ room: req.params.roomId })
      .populate('postedBy', 'username') // Get the teacher's name
      .sort({ createdAt: 'desc' }); // Show newest first
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Post a new assignment in a room
// @route   POST /api/assignments
const postAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, roomId } = req.body;

    // 1. Find the room
    const room = await SubjectRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // 2. Check if the user is the "Teacher" (creator) of the room
    if (room.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the room creator can post assignments' });
    }

    // 3. Create the assignment
    const newAssignment = await Assignment.create({
      title,
      description,
      dueDate,
      room: roomId,
      postedBy: req.user._id,
    });

    // 4. Populate and send back the new assignment
    await newAssignment.populate('postedBy', 'username');
    res.status(201).json(newAssignment);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAssignments,
  postAssignment,
};