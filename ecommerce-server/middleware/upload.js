const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter to validate image types
const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only image files are allowed'), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
  },
});

// Middleware to upload images to Cloudinary
const uploadToCloudinary = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next();
    }

    const uploadPromises = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'ecommerce/products',
            resource_type: 'image',
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result.secure_url);
            }
          }
        );

        uploadStream.end(file.buffer);
      });
    });

    const imageUrls = await Promise.all(uploadPromises);
    req.imageUrls = imageUrls;

    next();
  } catch (error) {
    next(new ApiError(500, 'Error uploading images to Cloudinary'));
  }
};

// Helper function to delete images from Cloudinary
const deleteFromCloudinary = async (imageUrls) => {
  try {
    const deletePromises = imageUrls.map((url) => {
      // Extract public_id from URL
      const parts = url.split('/');
      const filename = parts[parts.length - 1];
      const publicId = `ecommerce/products/${filename.split('.')[0]}`;
      
      return cloudinary.uploader.destroy(publicId);
    });

    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting images from Cloudinary:', error);
  }
};

module.exports = {
  upload,
  uploadToCloudinary,
  deleteFromCloudinary,
};
