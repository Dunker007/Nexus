import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

async function listModels() {
    console.log('Using API Key:', GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 10) + '...' : 'MISSING');
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.models) {
            console.log('Available Models:');
            data.models.forEach(m => console.log(`- ${m.name}`));
        } else {
            console.error('Error:', data);
        }
    } catch (e) {
        console.error('Fetch error:', e);
    }
}

listModels();
