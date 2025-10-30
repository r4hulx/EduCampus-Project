const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  updateUserProfile, // Import new function
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // Import protect middleware

router.post('/register', registerUser);
router.post('/login', loginUser);

// Add new protected PUT route
router.route('/profile').put(protect, updateUserProfile);

module.exports = router;