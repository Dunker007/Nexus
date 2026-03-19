import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function testSDK() {
  const apiKey = process.env.GEMINI_FREE_KEY;
  if (!apiKey) {
    console.error("No free key found");
    return;
  }
  
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    console.log("Testing text generation (gemini-2.5-flash)...");
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Say hi very briefly.',
    });
    console.log("Success! Text response:", response.text);
    
    console.log("\nTesting Veo 3.1 endpoint...");
    // Testing veo-2.0-generate-exp or veo-3.1-generate-preview
    let success = false;
    for (const modelId of ['veo-3.1-generate-preview', 'veo-2.0-generate-exp']) {
       console.log("Trying", modelId);
       const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:predict?key=${apiKey}`;
       const res = await fetch(url, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           instances: [{ prompt: "A glowing blue neon sign in rain" }],
           parameters: { sampleCount: 1 }
         })
       });
       const data = await res.json();
       if (data.error) {
         console.log(modelId, "Error:", data.error.message);
       } else {
         console.log(modelId, "Success!");
         success = true;
         break;
       }
    }
    
  } catch (err: any) {
    console.error("SDK Error:", err.message);
  }
}

testSDK();
