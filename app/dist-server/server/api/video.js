import { Router } from 'express';
import { required } from '../middleware/validate.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { assembleMusicVideo } from '../ffmpegService.js';
import fs from 'fs/promises';
import path from 'path';
export const videoRouter = Router();
videoRouter.post('/storyboard', required(['lyrics']), async (req, res) => {
    try {
        const { lyrics, songTitle, artist, vibe } = req.body;
        let contextStr = '';
        if (songTitle)
            contextStr += `Song: ${songTitle}\n`;
        if (artist)
            contextStr += `Artist: ${artist}\n`;
        if (vibe)
            contextStr += `Vibe/Theme: ${vibe}\n`;
        const systemPrompt = `You are an expert music video director and AI prompt engineer. 
Your task is to break down the provided song lyrics into a structured music video storyboard.
Create 8 to 15 consecutive scenes. Each scene should represent a 3-8 second visual.

For each scene, you must provide:
1. "id": Sequential scene number.
2. "timing": Approximate timestamp (e.g. "0:00 - 0:05").
3. "lyricSnippet": The 1-2 lines of lyrics sung during this scene.
4. "imagePrompt": A highly detailed, cinematic image generation prompt optimized for Grok Imagine / Midjourney. Describe the subject, action, environment, lighting, and camera angle.
5. "videoPrompt": A concise action-oriented video generation prompt optimized for Veo/Kling/Runway. Focus on motion, fluidity, physics, and cinematic camera movement.
6. "cameraMotion": If using the static image, what post-production animation effect to apply (e.g., "Slow pan right", "Dramatic zoom in").
7. "suggestedType": Your recommendation for this scene: "image" or "video".

OUTPUT STRICTLY A VALID JSON ARRAY. No markdown formatting, no explanatory text.
Example format:
[
  { 
    "id": 1, 
    "timing": "0:00 - 0:05", 
    "lyricSnippet": "Intro music...", 
    "imagePrompt": "Cinematic wide shot of a neon city in rain...", 
    "videoPrompt": "Drone shot flying through a glowing blue neon city in the rain, hyperrealistic motion...",
    "cameraMotion": "Slow push in",
    "suggestedType": "image"
  }
]`;
        const prompt = `Here are the lyrics to build the hybrid image/video storyboard for:\n\n${contextStr}\n${lyrics}`;
        // Use the existing local LLM endpoint to avoid circular dependencies
        const port = process.env.PORT || '3000';
        const llmRes = await fetch(`http://127.0.0.1:${port}/api/brain-link`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, systemPrompt })
        });
        if (!llmRes.ok) {
            throw new Error(`LLM Engine unreachable: ${llmRes.statusText}`);
        }
        const llmData = (await llmRes.json());
        const textResponse = llmData.text || '';
        // Attempt to parse JSON
        let storyboard = [];
        try {
            // Find JSON array in the response just in case the LLM wrapped it in markdown
            const jsonMatch = textResponse.match(/\[[\s\S]*\]/);
            let jsonStr = jsonMatch ? jsonMatch[0] : textResponse;
            // Strip trailing commas typical in local LLM output
            jsonStr = jsonStr.replace(/,(?=\s*[\]}])/g, '');
            storyboard = JSON.parse(jsonStr);
        }
        catch (parseError) {
            console.error("[video/storyboard] Failed to parse LLM response as JSON", textResponse);
            return res.status(500).json({ error: "Failed to parse storyboard. The AI did not return valid JSON.", raw: textResponse });
        }
        res.json({ success: true, storyboard });
    }
    catch (error) {
        console.error("[video/storyboard] Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});
// Render the final music video from the assembled timeline
videoRouter.post('/render', requireAuth, required(['timeline', 'audioPath']), async (req, res) => {
    try {
        const { timeline, audioPath, outputName } = req.body;
        // Create a strict temp directory for this render job
        const tempDir = path.join(process.cwd(), '.temp_render', Date.now().toString());
        await fs.mkdir(tempDir, { recursive: true });
        // Sanitize outputName — basename only, no path traversal
        const safeName = path.basename(outputName || `MusicVideo_${Date.now()}.mp4`).replace(/[^a-zA-Z0-9._-]/g, '_');
        const dropboxDir = path.resolve(process.cwd(), '..', '_Dropbox');
        const outputPath = path.join(dropboxDir, safeName);
        // Kick off async render (maybe don't await if we want to return immediately, but here we await for simplicity)
        const resultPath = await assembleMusicVideo(timeline, audioPath, outputPath, tempDir);
        // Cleanup temp
        await fs.rm(tempDir, { recursive: true, force: true }).catch(console.error);
        res.json({ success: true, videoPath: resultPath });
    }
    catch (error) {
        console.error("[video/render] Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});
