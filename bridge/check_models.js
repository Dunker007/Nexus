import fetch from 'node-fetch';

const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

console.log('Checking models with key:', key ? 'FOUND' : 'MISSING');

fetch(url)
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            console.error('Error:', data.error);
        } else {
            console.log('Available Models:');
            const models = data.models || [];
            models
                .filter(m => m.name.includes('gemini'))
                .forEach(m => console.log(`- ${m.name}`));
        }
    })
    .catch(err => console.error('Fetch failed:', err));
