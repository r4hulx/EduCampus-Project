const express = require('express');
const router = express.Router();
const { cloudinary } = require('../config/cloudinary');
const uploadMiddleware = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/upload
// @desc    Upload a file and get a URL
router.post('/', protect, uploadMiddleware, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // Multer gives us the file as a buffer
  // We need to upload it to Cloudinary
  // We'll use a "stream" to upload
  const stream = cloudinary.uploader.upload_stream(
    { resource_type: 'auto' }, // Automatically detect file type
    (error, result) => {
      if (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ message: 'Upload failed' });
      }
      // Send back the secure URL
      res.status(200).json({ url: result.secure_url });
    }
  );

  // Write the file buffer to the Cloudinary stream
  stream.end(req.file.buffer);
});

module.exports = router;