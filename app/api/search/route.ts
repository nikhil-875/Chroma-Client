import { NextResponse } from "next/server";
import { ChromaClient } from "chromadb";
import { CustomServerEmbeddingFunction } from "@/lib/custom-embedding";
import { getChromaUrl } from "@/lib/settings";

// Force NodeJS runtime
export const runtime = 'nodejs';

// Create a singleton client
let client: ChromaClient | null = null;

async function getClient() {
  if (!client) {
    const chromaUrl = await getChromaUrl();
    client = new ChromaClient({
      path: chromaUrl,
    });
  }
  return client;
}

// Get embeddings function
const embedFn = new CustomServerEmbeddingFunction({
  apiUrl: process.env.EMBEDDINGS_API_URL || 'http://localhost:3000/api/embeddings'
});

// Helper to get a collection by name
async function getCollection(name: string) {
  const client = await getClient();
  try {
    return await client.getCollection({
      name,
      embeddingFunction: embedFn
    });
  } catch (error) {
    console.error(`Error getting collection "${name}":`, error);
    return null;
  }
}

// POST: Search/query across collections
export async function POST(request: Request) {
  try {
    const { query, collectionNames, nResults = 5 } = await request.json();
    
    if (!query) {
      return NextResponse.json(
        { error: "Query text is required" },
        { status: 400 }
      );
    }
    
    if (!collectionNames || !Array.isArray(collectionNames) || collectionNames.length === 0) {
      return NextResponse.json(
        { error: "At least one collection name is required" },
        { status: 400 }
      );
    }
    
    const results = [];
    
    // Query each collection
    for (const collectionName of collectionNames) {
      const collection = await getCollection(collectionName);
      
      if (!collection) {
        console.warn(`Collection "${collectionName}" not found. Skipping.`);
        continue;
      }
      
      try {
        const queryResult = await collection.query({
          queryTexts: [query],
          nResults,
        });
        
        // Format the results
        if (queryResult.ids[0] && queryResult.ids[0].length > 0) {
          for (let i = 0; i < queryResult.ids[0].length; i++) {
            results.push({
              id: queryResult.ids[0][i],
              document: queryResult.documents?.[0]?.[i] || "",
              metadata: queryResult.metadatas?.[0]?.[i] || {},
              distance: queryResult.distances?.[0]?.[i] || 0,
              collection: collectionName,
            });
          }
        }
      } catch (error) {
        console.error(`Error querying collection "${collectionName}":`, error);
      }
    }
    
    // Sort by distance (similarity)
    results.sort((a, b) => a.distance - b.distance);
    
    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Error searching:", error);
    return NextResponse.json(
      { error: error.message || "Failed to search" },
      { status: 500 }
    );
  }
} 