import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execFileAsync = promisify(execFile);

/**
 * Validates that a file path is safe to pass to ffmpeg:
 * - Must be absolute
 * - Must resolve within one of the allowed base directories
 * Throws if the path fails validation — never pass user input to exec without this.
 */
function assertSafePath(filePath: string, allowedBases: string[]): void {
  if (!path.isAbsolute(filePath)) {
    throw new Error(`Unsafe path rejected (not absolute): ${filePath}`);
  }
  const resolved = path.normalize(filePath);
  const ok = allowedBases.some(base =>
    resolved.startsWith(path.normalize(base) + path.sep) || resolved === path.normalize(base)
  );
  if (!ok) {
    throw new Error(`Unsafe path rejected (outside allowed directories): ${filePath}`);
  }
}

export type StoryboardItem = {
  id: number;
  timing: string; // "0:00 - 0:05"
  lyricSnippet: string;
  imagePrompt: string;
  videoPrompt: string;
  cameraMotion: string;
  suggestedType: string;

  // Appended in UI after asset drops
  type?: 'image' | 'video';
  assetPath?: string;
  assetData?: string; // base64 data url
};

/**
 * Creates a looping pan/zoom (Ken Burns) effect on an image and converts it to a short video clip.
 */
export async function animateImage(imagePath: string, outputClipPath: string, durationSeconds: number, motion: string, allowedBases: string[]) {
  assertSafePath(imagePath, allowedBases);
  assertSafePath(outputClipPath, allowedBases);

  const m = motion.toLowerCase();
  const frames = Math.floor(durationSeconds * 25);

  let zp = '';
  if (m.includes('zoom in') || m.includes('push')) {
    zp = `zoompan=z='min(zoom+0.0015,1.5)':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080:fps=25`;
  } else if (m.includes('zoom out') || m.includes('pull')) {
    zp = `zoompan=z='max(1.5-0.0015*on,1)':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080:fps=25`;
  } else if (m.includes('pan right')) {
    zp = `zoompan=z=1.2:x='min(x+2,iw-iw/zoom)':y='ih/2-(ih/zoom/2)':d=${frames}:s=1920x1080:fps=25`;
  } else if (m.includes('pan left')) {
    zp = `zoompan=z=1.2:x='max(iw-iw/zoom-on*2,0)':y='ih/2-(ih/zoom/2)':d=${frames}:s=1920x1080:fps=25`;
  } else {
    // Default slow zoom in
    zp = `zoompan=z='min(zoom+0.001,1.2)':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080:fps=25`;
  }

  // Safely scale up first to cover 1920x1080 to prevent zoompan jitter on weird dimensions
  const filter = `scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,${zp}`;

  await execFileAsync('ffmpeg', [
    '-y', '-loop', '1', '-i', imagePath,
    '-vf', filter,
    '-c:v', 'libx264',
    '-t', String(durationSeconds),
    '-pix_fmt', 'yuv420p',
    '-r', '25',
    outputClipPath
  ]);
  return outputClipPath;
}

/**
 * Normalizes an external video clip to 1080p, 25fps, standard SAR to ensure concat works seamlessly.
 */
export async function normalizeVideo(inputPath: string, outputPath: string, allowedBases: string[]) {
  assertSafePath(inputPath, allowedBases);
  assertSafePath(outputPath, allowedBases);

  await execFileAsync('ffmpeg', [
    '-y', '-i', inputPath,
    '-vf', 'scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-r', '25',
    '-c:a', 'aac',
    outputPath
  ]);
  return outputPath;
}

/**
 * Stitches all clips together, overlays the Suno `audioPath`, and applies a simple crossfade.
 */
export async function assembleMusicVideo(
  timeline: StoryboardItem[],
  audioPath: string,
  outputPath: string,
  tempDir: string
) {
  // All paths passed to ffmpeg must resolve within these directories
  const allowedBases = [tempDir, path.dirname(outputPath)];

  assertSafePath(audioPath, allowedBases.concat([path.dirname(audioPath)]));
  assertSafePath(outputPath, [path.dirname(outputPath)]);

  // 1. Prepare all clips (Animate images OR normalize videos)
  const preparedClips: string[] = [];

  for (let i = 0; i < timeline.length; i++) {
    const item = timeline[i];
    if (!item.assetPath) continue; // Skip if no asset provided for this scene

    // Naively assume time span from "0:00 - 0:05" etc.
    const times = item.timing.split(' - ');
    let duration = 5; // fallback
    if (times.length === 2) {
      const startParts = times[0].split(':').map(Number);
      const endParts = times[1].split(':').map(Number);
      const startSec = (startParts[0] * 60) + startParts[1];
      const endSec = (endParts[0] * 60) + endParts[1];
      duration = Math.max(endSec - startSec, 2); // Minimum 2s
    }

    const outClip = path.join(tempDir, `clip_${i}.mp4`);

    // Handle base64 assetData from frontend drag-and-drop
    if (item.assetData && item.assetData.startsWith('data:')) {
      const match = item.assetData.match(/^data:(.+?);base64,(.*)$/);
      if (match) {
        const mime = match[1];
        const b64 = match[2];
        const buf = Buffer.from(b64, 'base64');
        const diskExt = mime.includes('video') || mime.includes('mp4') ? '.mp4' : '.jpg';
        const savedPath = path.join(tempDir, `raw_asset_${i}${diskExt}`);
        await fs.writeFile(savedPath, buf);
        item.assetPath = savedPath;
      }
    }

    if (!item.assetPath) {
      console.warn(`No asset path or data provided for scene ${item.id}`);
      continue;
    }

    const ext = path.extname(item.assetPath).toLowerCase();

    if (ext === '.jpg' || ext === '.png' || ext === '.jpeg') {
      await animateImage(item.assetPath, outClip, duration, item.cameraMotion, [tempDir, path.dirname(item.assetPath)]);
    } else if (ext === '.mp4' || ext === '.mov') {
      await normalizeVideo(item.assetPath, outClip, [tempDir, path.dirname(item.assetPath)]);
    } else {
      console.warn(`Unsupported asset type for scene ${item.id}: ${item.assetPath}`);
      continue;
    }

    preparedClips.push(outClip);
  }

  if (preparedClips.length === 0) {
    throw new Error("No valid clips were prepared for video assembly.");
  }

  // 2. Create the concat demuxer file
  const concatFilePath = path.join(tempDir, 'concat_list.txt');
  const concatData = preparedClips.map(c => `file '${c}'`).join('\n');
  await fs.writeFile(concatFilePath, concatData);

  // 3. Concat clips into ONE silent master video
  const silentMaster = path.join(tempDir, 'silent_master.mp4');
  await execFileAsync('ffmpeg', [
    '-y', '-f', 'concat', '-safe', '0',
    '-i', concatFilePath,
    '-c', 'copy',
    silentMaster
  ]);

  // 4. Mux the silent video with the final Suno Audio track
  await execFileAsync('ffmpeg', [
    '-y',
    '-i', silentMaster,
    '-i', audioPath,
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-map', '0:v:0',
    '-map', '1:a:0',
    '-shortest',
    outputPath
  ]);

  console.log(`[Lux Vids] Successfully assembled video at: ${outputPath}`);
  return outputPath;
}
