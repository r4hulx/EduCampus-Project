const express = require('express');
const router = express.Router();
const {
  createRoom,
  getMyRooms,
  getAllRooms,
  joinRoom,
  deleteRoom, // 1. Import this
} = require('../controllers/subjectRoomController');
const { protect } = require('../middleware/authMiddleware');

router.route('/all').get(protect, getAllRooms);

router.route('/').get(protect, getMyRooms).post(protect, createRoom);

router.route('/:roomId/join').post(protect, joinRoom);

// 2. Add the new DELETE route
router.route('/:roomId').delete(protect, deleteRoom);

module.exports = router;