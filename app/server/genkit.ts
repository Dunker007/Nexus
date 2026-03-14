import { genkit, z } from 'genkit';
import { ollama } from 'genkitx-ollama';
import { ollamaConfig } from './config.js';
import { db } from './db.js';

export const ai = genkit({
  plugins: [
    ollama({
      models: [{ name: ollamaConfig.defaultModel, type: 'chat' }],
      serverAddress: ollamaConfig.baseUrl,
    }),
  ],
});

export const getPipelineTracksTool = ai.defineTool(
  {
    name: 'getPipelineTracks',
    description: 'Retrieves the current tracks in the project pipeline, including their step progress and metadata.',
    inputSchema: z.object({}),
    outputSchema: z.any()
  },
  async () => {
    try {
      const tracks = db.prepare('SELECT * FROM pipeline_tracks ORDER BY created_at DESC').all();
      return { status: 'success', tracks };
    } catch (err: any) {
      return { error: err.message };
    }
  }
);
