const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Generate a simple perceptual hash for an image.
 * Resize to 8x8 grayscale, compare each pixel to average → 64-bit hash.
 */
async function perceptualHash(imagePath) {
  const { data } = await sharp(imagePath)
    .grayscale()
    .resize(8, 8, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const avg = data.reduce((s, v) => s + v, 0) / data.length;
  let hash = '';
  for (let i = 0; i < data.length; i++) {
    hash += data[i] > avg ? '1' : '0';
  }
  return hash;
}

/** Hamming distance between two equal-length binary strings */
function hamming(a, b) {
  let d = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
  return d;
}

/**
 * Remove near-duplicate images.
 * Two images are considered duplicates if their pHash Hamming distance <= 5.
 */
async function removeDuplicates(imagePaths) {
  const hashes = [];
  const unique = [];
  let duplicatesRemoved = 0;

  for (const p of imagePaths) {
    try {
      const h = await perceptualHash(p);
      const isDup = hashes.some(existing => hamming(existing, h) <= 5);
      if (isDup) {
        duplicatesRemoved++;
      } else {
        hashes.push(h);
        unique.push(p);
      }
    } catch (err) {
      // If hashing fails, keep the image (better to over-include than drop)
      console.warn(`[pHash] skipped ${p}: ${err.message}`);
      unique.push(p);
    }
  }

  return { unique, duplicatesRemoved };
}

/**
 * Sort images by file modification time (ascending) so albums read chronologically.
 */
function sortImages(imagePaths) {
  return [...imagePaths].sort((a, b) => {
    const sa = fs.statSync(a).mtimeMs;
    const sb = fs.statSync(b).mtimeMs;
    return sa - sb;
  });
}

/**
 * Enhance an image based on the chosen use case.
 * - creator: punchy, high-contrast, slightly saturated
 * - album:   warm, soft, gentle sharpening
 * - general: balanced auto-enhance
 */
async function enhanceImage(inputPath, outputPath, useCase) {
  let pipeline = sharp(inputPath).rotate(); // auto-orient from EXIF

  switch (useCase) {
    case 'creator':
      pipeline = pipeline
        .modulate({ brightness: 1.05, saturation: 1.25 })
        .linear(1.15, -8)        // contrast boost
        .sharpen({ sigma: 1.2 });
      break;
    case 'album':
      pipeline = pipeline
        .modulate({ brightness: 1.03, saturation: 1.08, hue: 5 })
        .sharpen({ sigma: 0.6 });
      break;
    case 'general':
    default:
      pipeline = pipeline
        .normalise()             // auto-levels
        .sharpen({ sigma: 0.8 });
      break;
  }

  // Always output as high-quality JPEG for consistency
  await pipeline.jpeg({ quality: 92, mozjpeg: true }).toFile(outputPath);
  return outputPath;
}

module.exports = {
  perceptualHash,
  removeDuplicates,
  sortImages,
  enhanceImage
};
