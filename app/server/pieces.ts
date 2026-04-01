import { Configuration, QGPTApi, SearchApi } from '@pieces.app/pieces-os-client';

const configuration = new Configuration({
    basePath: 'http://localhost:1000'
});

const qgptApi = new QGPTApi(configuration);
const searchApi = new SearchApi(configuration);

/**
 * Perform a semantic query against the local Pieces OS LTM.
 * @param query The natural language query to search Pieces OS.
 * @returns A formatted string containing the AI summary or context from LTM.
 */
export async function getPiecesContext(query: string): Promise<string> {
    try {
        const response = await qgptApi.relevance({
            qGPTRelevanceInput: {
                query,
                options: { 
                    database: true,
                    question: true
                },
                paths: []
            }
        });

        if (response.answer && response.answer.answers && response.answer.answers.iterable.length > 0) {
            return response.answer.answers.iterable[0].text;
        }

        return "No relevant context found in Pieces LTM for this query.";
    } catch (e: any) {
        console.error('[Pieces OS] Error querying context:', e.message);
        return "Pieces OS LTM Unavailable";
    }
}
