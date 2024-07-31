import multer from 'multer';

// Set up storage engine
const imgconfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/invoices'); // Upload destination folder
  },
  filename: (req, file, cb) => {
    cb(null, `invoice-${Date.now()}_${file.originalname}`);
  }
});

// Image filter
const isImage = (req, file, cb) => {
  if (file.mimetype=== 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type, only PDFs are allowed!"));
  }
};

// Configure multer to handle multiple files
const uploadInvoice = multer({
  storage: imgconfig,
  fileFilter: isImage,
  limits: { fileSize: 10 * 1024 * 1024 }
})

export default uploadInvoice;
