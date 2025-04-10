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

// GET: List all collections
export async function GET() {
  try {
    const client = await getClient();
    const collections = await client.listCollections();
    return NextResponse.json({ collections });
  } catch (error: any) {
    console.error("Error listing collections:", error);
    return NextResponse.json(
      { error: error.message || "Failed to list collections" },
      { status: 500 }
    );
  }
}

// POST: Create a new collection
export async function POST(request: Request) {
  try {
    const { name, metadata = {} } = await request.json();
    
    if (!name) {
      return NextResponse.json(
        { error: "Collection name is required" },
        { status: 400 }
      );
    }
    
    const client = await getClient();
    
    // Check if collection exists
    const existingCollections = await client.listCollections();
    if (existingCollections.some((c: any) => c.name === name)) {
      return NextResponse.json(
        { error: `Collection "${name}" already exists` },
        { status: 409 }
      );
    }
    
    await client.createCollection({
      name,
      metadata,
      embeddingFunction: embedFn
    });
    
    return NextResponse.json({ 
      success: true, 
      message: `Collection "${name}" created successfully` 
    });
  } catch (error: any) {
    console.error("Error creating collection:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create collection" },
      { status: 500 }
    );
  }
} 