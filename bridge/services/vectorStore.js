/**
 * Vector Store Service - Knowledge Base RAG
 * Uses in-memory storage with simple cosine similarity
 * Future: Can be upgraded to PGLite vector extension
 */

class VectorStore {
    constructor() {
        this.documents = [];
        this.embeddings = [];
        this.initialized = false;
    }

    async initialize() {
        console.log('[VectorStore] Initializing in-memory vector store...');
        this.initialized = true;
        return true;
    }

    /**
     * Generate embeddings using LM Studio (or fallback to simple hash)
     */
    async generateEmbedding(text) {
        try {
            // Try to use LM Studio's embedding endpoint if available
            const response = await fetch('http://localhost:1234/v1/embeddings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    input: text,
                    model: 'text-embedding-nomic-embed-text-v1.5'
                })
            });

            if (response.ok) {
                const data = await response.json();
                return data.data[0].embedding;
            }
        } catch (e) {
            // Fallback: simple hash-based pseudo-embedding
        }

        // Fallback: Create a simple 128-dim pseudo-embedding from text
        return this.createPseudoEmbedding(text);
    }

    createPseudoEmbedding(text, dims = 128) {
        const embedding = new Array(dims).fill(0);
        const words = text.toLowerCase().split(/\s+/);

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            for (let j = 0; j < word.length; j++) {
                const idx = (word.charCodeAt(j) + i * 7) % dims;
                embedding[idx] += 1;
            }
        }

        // Normalize
        const magnitude = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0)) || 1;
        return embedding.map(v => v / magnitude);
    }

    /**
     * Add a document to the store
     */
    async addDocument(content, metadata = {}) {
        const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const chunks = this.chunkText(content);

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const embedding = await this.generateEmbedding(chunk);

            this.documents.push({
                id: `${id}_chunk_${i}`,
                parentId: id,
                content: chunk,
                metadata: { ...metadata, chunkIndex: i },
                createdAt: new Date().toISOString()
            });

            this.embeddings.push(embedding);
        }

        console.log(`[VectorStore] Added document ${id} with ${chunks.length} chunks`);
        return { id, chunks: chunks.length };
    }

    /**
     * Split text into chunks
     */
    chunkText(text, chunkSize = 500, overlap = 50) {
        const chunks = [];
        let start = 0;

        while (start < text.length) {
            const end = Math.min(start + chunkSize, text.length);
            chunks.push(text.slice(start, end));
            start = end - overlap;
            if (start >= text.length - overlap) break;
        }

        return chunks.length > 0 ? chunks : [text];
    }

    /**
     * Cosine similarity between two vectors
     */
    cosineSimilarity(a, b) {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Search for similar documents
     */
    async search(query, topK = 5) {
        if (this.documents.length === 0) {
            return [];
        }

        const queryEmbedding = await this.generateEmbedding(query);

        const results = this.documents.map((doc, i) => ({
            ...doc,
            score: this.cosineSimilarity(queryEmbedding, this.embeddings[i])
        }));

        results.sort((a, b) => b.score - a.score);

        return results.slice(0, topK);
    }

    /**
     * List all documents (unique by parentId)
     */
    listDocuments() {
        const seen = new Set();
        const docs = [];

        for (const doc of this.documents) {
            if (!seen.has(doc.parentId)) {
                seen.add(doc.parentId);
                docs.push({
                    id: doc.parentId,
                    name: doc.metadata.name || doc.parentId,
                    type: doc.metadata.type || 'text',
                    size: doc.metadata.size || 'Unknown',
                    date: doc.createdAt,
                    category: doc.metadata.category || 'General'
                });
            }
        }

        return docs;
    }

    /**
     * Delete a document
     */
    deleteDocument(parentId) {
        const initialLength = this.documents.length;
        const indicesToRemove = [];

        this.documents = this.documents.filter((doc, i) => {
            if (doc.parentId === parentId) {
                indicesToRemove.push(i);
                return false;
            }
            return true;
        });

        // Remove corresponding embeddings (in reverse order to maintain indices)
        indicesToRemove.reverse().forEach(i => {
            this.embeddings.splice(i, 1);
        });

        return initialLength !== this.documents.length;
    }

    /**
     * Get stats
     */
    getStats() {
        const uniqueDocs = new Set(this.documents.map(d => d.parentId)).size;
        return {
            totalChunks: this.documents.length,
            totalDocuments: uniqueDocs,
            embeddingDimensions: this.embeddings[0]?.length || 0,
            initialized: this.initialized
        };
    }
}

// Singleton instance
const vectorStore = new VectorStore();

export default vectorStore;
