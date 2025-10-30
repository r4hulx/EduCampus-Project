const SubjectRoom = require('../models/subjectRoomModel');
const Message = require('../models/messageModel'); // ADDED
const Assignment = require('../models/assignmentModel'); // ADDED

// @desc    Create a new subject room
// @route   POST /api/rooms
const createRoom = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Please provide a room name' });
    }

    const room = await SubjectRoom.create({
      name,
      description,
      createdBy: req.user._id,
      members: [req.user._id],
    });

    res.status(201).json(room);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: 'A room with this name already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all rooms a user is a member of
// @route   GET /api/rooms
const getMyRooms = async (req, res) => {
  try {
    const rooms = await SubjectRoom.find({ members: req.user._id });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get ALL public rooms
// @route   GET /api/rooms/all
const getAllRooms = async (req, res) => {
  try {
    const rooms = await SubjectRoom.find({}).select('name description _id');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join a room
// @route   POST /api/rooms/:roomId/join
const joinRoom = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const userId = req.user._id;

    const room = await SubjectRoom.findByIdAndUpdate(
      roomId,
      { $addToSet: { members: userId } },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a room
// @route   DELETE /api/rooms/:roomId
const deleteRoom = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const userId = req.user._id;

    const room = await SubjectRoom.findById(roomId);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // 1. Check if the user is the Teacher who created the room
    if (
      room.createdBy.toString() !== userId.toString() ||
      req.user.role !== 'teacher'
    ) {
      return res
        .status(403)
        .json({ message: 'Not authorized to delete this room' });
    }

    // 2. Delete the room itself
    await room.deleteOne();

    // 3. Delete all associated messages
    await Message.deleteMany({ room: roomId });

    // 4. Delete all associated assignments
    await Assignment.deleteMany({ room: roomId });

    res.json({ message: 'Room and all associated data deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRoom,
  getMyRooms,
  getAllRooms,
  joinRoom,
  deleteRoom, // Exported new function
};