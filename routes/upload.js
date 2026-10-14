const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dgoe6emli';
const apiKey = process.env.CLOUDINARY_API_KEY || '691483461292698';
const apiSecret = process.env.CLOUDINARY_API_SECRET || 'kjx0fkzxGQZChwTYTINErnhBsgg';

const hasCloudinaryConfig =
  !!process.env.CLOUDINARY_URL ||
  (!!cloudName && !!apiKey && !!apiSecret);

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });
}

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
});

const uploadToCloudinary = async (file) => {
  if (!hasCloudinaryConfig) return null;

  const uploadResult = await cloudinary.uploader.upload(file.path, {
    folder: 'web-tech-illusion',
    resource_type: 'image',
    transformation: [{ quality: 'auto', fetch_format: 'auto' }]
  });

  return uploadResult.secure_url;
};

// Single image upload
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a valid image' });
    }

    if (hasCloudinaryConfig) {
      const cloudinaryUrl = await uploadToCloudinary(req.file);

      if (cloudinaryUrl) {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }

        return res.status(200).json({
          success: true,
          message: 'Image uploaded successfully to Cloudinary!',
          url: cloudinaryUrl
        });
      }
    }

    // Fallback for local environments without Cloudinary credentials
    const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : req.protocol) || 'https';
    const host = req.get('host');
    const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully!',
      url: imageUrl
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: error.message || 'Image upload failed' });
  }
});

module.exports = router;
