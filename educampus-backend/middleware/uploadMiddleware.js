const multer = require('multer');
const path = require('path');

// Configure multer to store files in memory
const storage = multer.memoryStorage();

// Set up the multer instance
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // You can add filters here, e.g., check for file type
    // For now, we'll accept all files
    cb(null, true);
  },
});

// Export the middleware to handle a single file upload
// 'file' is the name of the form field we will use
module.exports = upload.single('file');