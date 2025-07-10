import { NextResponse } from "next/server";
import { ChromaClient } from "chromadb";
import { CustomServerEmbeddingFunction } from "@/lib/custom-embedding";
import { getChromaUrl } from "@/lib/settings";

// Force NodeJS runtime
export const runtime = 'nodejs';

// Create a singleton client
let client: ChromaClient | null = null;
let clientError: string | null = null;

async function getClient() {
  if (clientError) {
    throw new Error(clientError);
  }
  
  if (!client) {
    try {
      const chromaUrl = await getChromaUrl();
      console.log("Connecting to ChromaDB at:", chromaUrl);
      
      client = new ChromaClient({
        path: chromaUrl,
      });
      
      // Test the connection
      await client.heartbeat();
      console.log("Successfully connected to ChromaDB");
    } catch (error) {
      console.error("Failed to initialize ChromaDB client:", error);
      clientError = `Failed to connect to ChromaDB at ${await getChromaUrl()}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      throw new Error(clientError);
    }
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
    
    // If it's a connection error, provide helpful guidance
    if (error.message?.includes("Failed to connect")) {
      return NextResponse.json(
        { 
          error: "ChromaDB connection failed. Please check your settings and ensure the server is running.",
          details: error.message,
          suggestion: "Visit /test-server to diagnose connection issues."
        },
        { status: 503 }
      );
    }
    
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
    
    // Validate collection name format
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
      return NextResponse.json(
        { error: "Collection name can only contain letters, numbers, underscores, and hyphens" },
        { status: 400 }
      );
    }
    
    const client = await getClient();
    
    // Check if collection exists
    try {
      const existingCollections = await client.listCollections();
      if (existingCollections.some((c: any) => c.name === name)) {
        return NextResponse.json(
          { error: `Collection "${name}" already exists` },
          { status: 409 }
        );
      }
    } catch (error) {
      console.warn("Could not check existing collections:", error);
      // Continue with creation attempt
    }
    
    // Ensure metadata is not empty - ChromaDB requires at least some metadata
    const finalMetadata = {
      created_at: new Date().toISOString(),
      created_by: "chroma-client",
      description: metadata.description || `Collection: ${name}`,
      ...metadata
    };
    
    console.log(`Creating collection "${name}" with metadata:`, finalMetadata);
    
    await client.createCollection({
      name,
      metadata: finalMetadata,
      embeddingFunction: embedFn
    });
    
    console.log(`Successfully created collection "${name}"`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Collection "${name}" created successfully` 
    });
  } catch (error: any) {
    console.error("Error creating collection:", error);
    
    // Provide more specific error messages
    let errorMessage = error.message || "Failed to create collection";
    let statusCode = 500;
    
    if (error.message?.includes("already exists")) {
      errorMessage = `Collection "${name}" already exists`;
      statusCode = 409;
    } else if (error.message?.includes("connection") || error.message?.includes("Failed to connect")) {
      errorMessage = "Unable to connect to ChromaDB. Please check your settings and ensure the server is running.";
      statusCode = 503;
    } else if (error.message?.includes("timeout")) {
      errorMessage = "Request timed out. Please try again.";
      statusCode = 408;
    } else if (error.message?.includes("embeddings")) {
      errorMessage = "Failed to initialize embedding model. Please try again.";
      statusCode = 500;
    } else if (error.message?.includes("metadata") && error.message?.includes("empty")) {
      errorMessage = "Invalid metadata format. Please check your metadata JSON.";
      statusCode = 400;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error.message,
        suggestion: statusCode === 503 ? "Visit /test-server to diagnose connection issues." : undefined
      },
      { status: statusCode }
    );
  }
} 