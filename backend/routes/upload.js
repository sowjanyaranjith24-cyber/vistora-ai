const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const uploadsDir = path.join(__dirname, '..', 'uploads');

// Multer storage: keep original name but prepend a UUID to avoid collisions
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const unique = `${uuidv4()}-${base}${ext}`;
    cb(null, unique);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /^(image|video)\//;
  if (allowed.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 200 * 1024 * 1024 } // 200 MB per file
});

// POST /api/upload  (multipart/form-data, field name "files")
router.post('/', upload.array('files', 50), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const files = req.files.map(f => ({
    filename: f.filename,
    originalName: f.originalname,
    size: f.size,
    mimetype: f.mimetype,
    type: f.mimetype.startsWith('video/') ? 'video' : 'image',
    url: `/uploads/${f.filename}`
  }));

  res.json({
    success: true,
    count: files.length,
    files
  });
});

// GET /api/upload/list - list all uploaded files
router.get('/list', (req, res) => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) return res.status(500).json({ error: err.message });
    const list = files.map(name => ({
      filename: name,
      url: `/uploads/${name}`
    }));
    res.json({ count: list.length, files: list });
  });
});

// DELETE /api/upload/:filename
router.delete('/:filename', (req, res) => {
  const filePath = path.join(uploadsDir, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  fs.unlinkSync(filePath);
  res.json({ success: true, deleted: req.params.filename });
});

module.exports = router;
