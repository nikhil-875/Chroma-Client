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

// PUT: Update a document
export async function PUT(
  request: Request,
  { params }: { params: { name: string; id: string } }
) {
  try {
    const { name, id } = params;
    const { document, metadata } = await request.json();
    
    if (!document) {
      return NextResponse.json(
        { error: "Document content is required" },
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
    
    await collection.update({
      ids: [id],
      documents: [document],
      metadatas: [metadata || {}]
    });
    
    return NextResponse.json({
      success: true,
      message: `Document "${id}" updated successfully`
    });
  } catch (error: any) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update document" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a document
export async function DELETE(
  request: Request,
  { params }: { params: { name: string; id: string } }
) {
  try {
    const { name, id } = params;
    const collection = await getCollection(name);
    
    if (!collection) {
      return NextResponse.json(
        { error: `Collection "${name}" not found` },
        { status: 404 }
      );
    }
    
    await collection.delete({
      ids: [id]
    });
    
    return NextResponse.json({
      success: true,
      message: `Document "${id}" deleted successfully`
    });
  } catch (error: any) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete document" },
      { status: 500 }
    );
  }
} 