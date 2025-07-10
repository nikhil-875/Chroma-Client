// Replace direct import with interface definition
// import { IEmbeddingFunction } from "chromadb"

// Define the embedding function interface inline for browser compatibility
interface IEmbeddingFunction {
  generate(texts: string[]): Promise<number[][]>;
}

/**
 * A custom embedding function that uses the API to generate embeddings
 * Works in both browser and server contexts
 */
export class CustomServerEmbeddingFunction implements IEmbeddingFunction {
  private apiUrl: string;

  constructor(options: { apiUrl?: string } = {}) {
    // Default to the relative URL of our API endpoint
    this.apiUrl = options.apiUrl || '/api/embeddings';
  }

  // This method is called by ChromaDB to generate embeddings
  async generate(texts: string[]): Promise<number[][]> {
    try {
      // Make sure we have texts to process
      if (!texts || texts.length === 0) {
        return [];
      }

      console.log(`Generating embeddings for ${texts.length} texts`);

      // Different fetch approach based on environment
      let response;
      
      if (typeof window === 'undefined') {
        // Server-side: use node-fetch or custom implementation
        if (this.apiUrl.startsWith('/')) {
          // If it's a relative URL and we're on the server, we need to prepend the host
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
          const url = `${baseUrl}${this.apiUrl}`;
          
          console.log(`Server-side embedding request to: ${url}`);
          
          // Use node-fetch (already available in Next.js)
          response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ texts }),
          });
        } else {
          // Absolute URL
          console.log(`Server-side embedding request to: ${this.apiUrl}`);
          response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ texts }),
          });
        }
      } else {
        // Client-side: use browser fetch
        console.log(`Client-side embedding request to: ${this.apiUrl}`);
        response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ texts }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || response.statusText;
        console.error(`Embedding API error: ${response.status} - ${errorMessage}`);
        throw new Error(`API error: ${errorMessage}`);
      }

      const data = await response.json();
      
      if (!data.embeddings || !Array.isArray(data.embeddings)) {
        throw new Error('Invalid response format from embedding API');
      }
      
      console.log(`Successfully generated ${data.embeddings.length} embeddings`);
      return data.embeddings;
    } catch (error) {
      console.error('Error generating embeddings:', error);
      
      // If embedding generation fails, we can't create the collection
      // This is a critical error that should prevent collection creation
      throw new Error(`Failed to generate embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 