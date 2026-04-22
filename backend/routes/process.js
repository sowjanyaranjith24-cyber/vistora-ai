const express = require('express');
const path = require('path');
const fs = require('fs');

const imageService = require('../services/imageService');
const videoService = require('../services/videoService');

const router = express.Router();
const uploadsDir = path.join(__dirname, '..', 'uploads');
const outputsDir = path.join(__dirname, '..', 'outputs');

/**
 * POST /api/process
 * Body: {
 *   filenames: string[],       // filenames returned by /api/upload
 *   useCase: 'creator' | 'album' | 'general'
 * }
 */
router.post('/', async (req, res) => {
  try {
    const { filenames, useCase } = req.body;

    if (!Array.isArray(filenames) || filenames.length === 0) {
      return res.status(400).json({ error: 'filenames array is required' });
    }
    if (!['creator', 'album', 'general'].includes(useCase)) {
      return res.status(400).json({ error: 'Invalid useCase. Use creator | album | general' });
    }

    // Split files into images and videos by extension
    const images = [];
    const videos = [];
    const imageExts = ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.bmp', '.gif'];
    const videoExts = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'];

    for (const name of filenames) {
      const full = path.join(uploadsDir, name);
      if (!fs.existsSync(full)) continue;
      const ext = path.extname(name).toLowerCase();
      if (imageExts.includes(ext)) images.push(full);
      else if (videoExts.includes(ext)) videos.push(full);
    }

    const result = { useCase, images: [], video: null, logs: [] };

    // ---------- Image pipeline ----------
    if (images.length > 0) {
      result.logs.push(`Received ${images.length} image(s)`);

      // 1. Remove near-duplicates (by perceptual hash)
      const { unique, duplicatesRemoved } = await imageService.removeDuplicates(images);
      result.logs.push(`Removed ${duplicatesRemoved} duplicate image(s)`);

      // 2. Sort images (by created timestamp in filename UUID order, stable)
      const sorted = imageService.sortImages(unique);
      result.logs.push(`Sorted ${sorted.length} image(s)`);

      // 3. Enhance based on use case
      const enhanced = [];
      for (const imgPath of sorted) {
        const outName = `enhanced-${Date.now()}-${path.basename(imgPath)}`;
        const outPath = path.join(outputsDir, outName);
        await imageService.enhanceImage(imgPath, outPath, useCase);
        enhanced.push({
          filename: outName,
          url: `/outputs/${outName}`,
          downloadUrl: `/api/download/${outName}`
        });
      }
      result.images = enhanced;
      result.logs.push(`Enhanced ${enhanced.length} image(s) with "${useCase}" preset`);
    }

    // ---------- Video pipeline ----------
    if (videos.length > 0) {
      result.logs.push(`Received ${videos.length} video(s)`);
      const outName = `vistora-${Date.now()}.mp4`;
      const outPath = path.join(outputsDir, outName);

      if (videos.length === 1) {
        await videoService.transcodeSingle(videos[0], outPath);
        result.logs.push(`Transcoded single video`);
      } else {
        await videoService.mergeWithTransitions(videos, outPath);
        result.logs.push(`Merged ${videos.length} clips with fade transitions`);
      }

      result.video = {
        filename: outName,
        url: `/outputs/${outName}`,
        downloadUrl: `/api/download/${outName}`
      };
    }

    if (images.length === 0 && videos.length === 0) {
      return res.status(400).json({ error: 'No valid image or video files found' });
    }

    res.json({ success: true, result });
  } catch (err) {
    console.error('[Process error]', err);
    res.status(500).json({ error: err.message || 'Processing failed' });
  }
});

module.exports = router;
