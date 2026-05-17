import express from 'express';
import { createAgent, SongwriterRoom } from '../services/agents.js';
import { asyncHandler, ValidationError } from '../services/errors.js';

const router = express.Router();

// Create songwriter room instance
const songwriterRoom = new SongwriterRoom();

// Get songwriter agent personas
router.get('/agents', (req, res) => {
    res.json({
        agents: songwriterRoom.getAgentPersonas(),
        description: 'Songwriter agents for collaborative music creation'
    });
});

// Create a song with the songwriter room
router.post('/create', asyncHandler(async (req, res) => {
    const { theme, genre = 'pop', mood = 'uplifting', rounds = 2 } = req.body;

    if (!theme) {
        throw new ValidationError('Theme is required', 'theme');
    }

    const result = await songwriterRoom.createSong(theme, { genre, mood, rounds });
    res.json(result);
}));

// Get Suno prompt directly (quick mode)
router.post('/prompt', asyncHandler(async (req, res) => {
    const { theme, genre = 'pop', mood = 'uplifting' } = req.body;

    if (!theme) {
        throw new ValidationError('Theme is required', 'theme');
    }

    // Quick prompt generation without full collaboration
    const producer = createAgent('producer');
    const composer = createAgent('composer');

    const style = await composer.processTask({
        action: 'suggest-style',
        theme,
        genre,
        mood
    });

    const prompt = await producer.processTask({
        action: 'generate-suno-prompt',
        content: { theme, genre, mood, style }
    });

    res.json({
        theme,
        genre,
        mood,
        sunoPrompt: prompt.fullPrompt,
        styleTags: prompt.styleTags,
        instructions: prompt.instructions
    });
}));

// Create political rap with Newsician
router.post('/political', asyncHandler(async (req, res) => {
    const { focusArea = 'minnesota', headlines = [] } = req.body;

    console.log(`🎤 Newsician creating political rap for ${focusArea}...`);

    const result = await songwriterRoom.createPoliticalRap(headlines, focusArea);
    res.json(result);
}));

// Create platform-friendly political track with Midwest Sentinel
router.post('/sentinel', asyncHandler(async (req, res) => {
    const { focusArea = 'minnesota', headlines = [] } = req.body;

    console.log(`🎧 Midwest Sentinel creating boom bap track for ${focusArea}...`);

    const result = await songwriterRoom.createSentinelTrack(headlines, focusArea);
    res.json(result);
}));

export default router;
