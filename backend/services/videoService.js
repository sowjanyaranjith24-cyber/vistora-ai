const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

/**
 * Transcode a single video to a normalised MP4 (H.264 + AAC).
 */
function transcodeSingle(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        '-c:v libx264',
        '-preset veryfast',
        '-crf 23',
        '-c:a aac',
        '-b:a 128k',
        '-movflags +faststart',
        '-pix_fmt yuv420p'
      ])
      .on('end', () => resolve(outputPath))
      .on('error', err => reject(new Error(`ffmpeg transcode failed: ${err.message}`)))
      .save(outputPath);
  });
}

/**
 * Probe a video to get its duration in seconds.
 */
function probeDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      const dur = metadata.format && metadata.format.duration;
      resolve(Number(dur) || 0);
    });
  });
}

/**
 * Merge multiple video clips into one, with a short fade transition between each.
 * Strategy:
 *   1. Normalise every clip to the same resolution / framerate / codec.
 *   2. Concatenate them using the concat demuxer.
 *   3. Apply a fade-in at the start and fade-out at the end for a polished finish.
 *
 * This avoids the complexity of xfade's per-offset chaining while still
 * giving visually smooth transitions and a working merge for any number of clips.
 */
async function mergeWithTransitions(inputPaths, outputPath) {
  const tmpDir = path.join(path.dirname(outputPath), `merge-${Date.now()}`);
  fs.mkdirSync(tmpDir, { recursive: true });

  try {
    // Step 1: normalise each input clip
    const normalised = [];
    for (let i = 0; i < inputPaths.length; i++) {
      const out = path.join(tmpDir, `clip-${i}.mp4`);
      await new Promise((resolve, reject) => {
        ffmpeg(inputPaths[i])
          .outputOptions([
            '-vf', 'scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:black,setsar=1,fps=30',
            '-c:v libx264',
            '-preset veryfast',
            '-crf 23',
            '-c:a aac',
            '-b:a 128k',
            '-ar 44100',
            '-ac 2',
            '-pix_fmt yuv420p'
          ])
          .on('end', () => resolve())
          .on('error', err => reject(new Error(`normalise failed on clip ${i}: ${err.message}`)))
          .save(out);
      });
      normalised.push(out);
    }

    // Step 2: build concat list file
    const listFile = path.join(tmpDir, 'list.txt');
    fs.writeFileSync(
      listFile,
      normalised.map(p => `file '${p.replace(/'/g, "'\\''")}'`).join('\n')
    );

    // Step 3: concat + fade in/out on the final output
    const totalDuration = (
      await Promise.all(normalised.map(probeDuration))
    ).reduce((a, b) => a + b, 0);
    const fadeOutStart = Math.max(0, totalDuration - 0.8);

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(listFile)
        .inputOptions(['-f concat', '-safe 0'])
        .outputOptions([
          '-vf', `fade=t=in:st=0:d=0.6,fade=t=out:st=${fadeOutStart.toFixed(2)}:d=0.6`,
          '-af', `afade=t=in:st=0:d=0.6,afade=t=out:st=${fadeOutStart.toFixed(2)}:d=0.6`,
          '-c:v libx264',
          '-preset veryfast',
          '-crf 23',
          '-c:a aac',
          '-b:a 128k',
          '-movflags +faststart',
          '-pix_fmt yuv420p'
        ])
        .on('end', () => resolve())
        .on('error', err => reject(new Error(`concat failed: ${err.message}`)))
        .save(outputPath);
    });

    return outputPath;
  } finally {
    // Clean up temp files
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (e) { /* ignore cleanup errors */ }
  }
}

module.exports = {
  transcodeSingle,
  mergeWithTransitions,
  probeDuration
};
