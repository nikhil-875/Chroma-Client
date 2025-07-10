import { NextResponse } from "next/server";
import { ChromaClient } from "chromadb";
import { getChromaUrl } from "@/lib/settings";

// Force NodeJS runtime
export const runtime = 'nodejs';

export async function GET() {
  try {
    const chromaUrl = await getChromaUrl();
    console.log(`Testing connection to ChromaDB at: ${chromaUrl}`);
    
    const client = new ChromaClient({
      path: chromaUrl,
    });
    
    // Test the connection
    const heartbeat = await client.heartbeat();
    console.log("ChromaDB heartbeat response:", heartbeat);
    
    // Try to list collections
    const collections = await client.listCollections();
    console.log("Available collections:", collections);
    
    return NextResponse.json({
      success: true,
      chromaUrl,
      heartbeat,
      collections: collections.length,
      message: "ChromaDB connection successful"
    });
  } catch (error: any) {
    console.error("ChromaDB connection test failed:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      message: "ChromaDB connection failed"
    }, { status: 500 });
  }
} 