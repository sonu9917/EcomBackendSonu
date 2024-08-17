import multer from 'multer';

import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
import cloudinary from '../utils/cloudinaryConfig.js';

// Load environment variables from .env file
dotenv.config();


// Set up Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'uploads', // Folder name in your Cloudinary account
    format: async (req, file) => {
      return 'jpg'; // Or 'png', etc., based on your requirements
    },
    public_id: (req, file) => `image-${Date.now()}-${file.originalname}`,
  },
});

// Image filter
const isImage = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"));
  }
};

// Configure multer to handle specific fields
const upload = multer({
  storage: storage,
  fileFilter: isImage,
}).fields([
  { name: 'banner', maxCount: 1 },
  { name: 'profilePicture', maxCount: 1 },
  {
    name: 'biographyPicture', maxCount: 1
  }
]);

export default upload;
