const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const outputsDir = path.join(__dirname, '..', 'outputs');

// GET /api/download/:filename - forces download of a processed file
router.get('/:filename', (req, res) => {
  // Prevent directory traversal
  const safeName = path.basename(req.params.filename);
  const filePath = path.join(outputsDir, safeName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.download(filePath, safeName, err => {
    if (err) {
      console.error('[Download error]', err);
      if (!res.headersSent) res.status(500).json({ error: 'Download failed' });
    }
  });
});

module.exports = router;
