import { genkit, z } from 'genkit';
import { ollama } from 'genkitx-ollama';
import { ollamaConfig } from './config.js';

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
      // Typically imported from db.ts but keeping it simple for the example tool
      return { status: 'success', message: 'Pipeline query available via socket emission or db directly.' };
    } catch (err: any) {
      return { error: err.message };
    }
  }
);
