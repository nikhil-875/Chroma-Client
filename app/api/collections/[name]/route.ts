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

// GET: Get all documents in a collection
export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const { name } = params;
    const collection = await getCollection(name);
    
    if (!collection) {
      return NextResponse.json(
        { error: `Collection "${name}" not found` },
        { status: 404 }
      );
    }
    
    const result = await collection.get();
    
    const documents = [];
    for (let i = 0; i < result.ids.length; i++) {
      documents.push({
        id: result.ids[i],
        document: result.documents[i],
        metadata: result.metadatas?.[i] || {},
      });
    }
    
    return NextResponse.json({ documents });
  } catch (error: any) {
    console.error("Error getting documents:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get documents" },
      { status: 500 }
    );
  }
}

// POST: Add documents to a collection
export async function POST(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const { name } = params;
    const { documents } = await request.json();
    
    if (!documents || !Array.isArray(documents)) {
      return NextResponse.json(
        { error: "Invalid input. Expected an array of documents." },
        { status: 400 }
      );
    }
    
    const collection = await getCollection(name);
    
    if (!collection) {
      return NextResponse.json(
        { error: `Collection "${name}" not found` },
        { status: 404 }
      );
    }
    
    await collection.add({
      ids: documents.map(doc => doc.id),
      documents: documents.map(doc => doc.document),
      metadatas: documents.map(doc => doc.metadata || {})
    });
    
    return NextResponse.json({
      success: true,
      message: `Added ${documents.length} documents to collection "${name}"`
    });
  } catch (error: any) {
    console.error("Error adding documents:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add documents" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a collection
export async function DELETE(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const { name } = params;
    const client = await getClient();
    
    await client.deleteCollection({ name });
    
    return NextResponse.json({
      success: true,
      message: `Collection "${name}" deleted successfully`
    });
  } catch (error: any) {
    console.error("Error deleting collection:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete collection" },
      { status: 500 }
    );
  }
} 