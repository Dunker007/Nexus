import { genkit, z } from 'genkit';
import { ollama } from 'genkitx-ollama';
import { ollamaConfig } from './config.js';
import { getPrisma } from './db.js';

// Genkit AI instance with Ollama plugin.
// Dev tracing UI: run `npm run genkit:start` then open http://localhost:4000
// Traces are automatically captured for all defineFlow calls.
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
      const tracks = await getPrisma().pipeline_tracks.findMany({ orderBy: { created_at: 'desc' } });
      return { status: 'success', tracks };
    } catch (err: any) {
      return { error: err.message };
    }
  }
);
