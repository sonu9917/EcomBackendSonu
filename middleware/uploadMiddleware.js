import multer from 'multer';

// Set up storage engine
const imgconfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads'); // Upload destination folder
  },
  filename: (req, file, cb) => {
    cb(null, `image-${Date.now()}-${file.originalname}`);
  }
});

// Image filter
const isImage = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"));
  }
};

// Configure multer to handle multiple files
const upload = multer({
  storage: imgconfig,
  fileFilter: isImage
}).array('images', 5); // Handle up to 5 files with the field name 'images'

export default upload;
