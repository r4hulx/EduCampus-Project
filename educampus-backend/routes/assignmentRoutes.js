const express = require('express');
const router = express.Router();
const { getAssignments, postAssignment } = require('../controllers/assignmentController');
const { protect } = require('../middleware/authMiddleware');

// POST route to create a new assignment
router.route('/').post(protect, postAssignment);

// GET route to fetch all assignments for a specific room
router.route('/:roomId').get(protect, getAssignments);

module.exports = router;