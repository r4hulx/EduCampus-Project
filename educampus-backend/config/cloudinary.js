const cloudinary = require('cloudinary').v2;

// This configures the Cloudinary SDK using your .env variables
const connectCloudinary = () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log('Cloudinary connected');
  } catch (error) {
    console.error('Failed to connect to Cloudinary', error);
  }
};

module.exports = { cloudinary, connectCloudinary };