import { NextResponse } from "next/server";

// Force the Node.js runtime rather than Edge runtime
export const runtime = 'nodejs';

// A simplified embedding function for testing
// This function produces random vectors for demonstration
function generateEmbedding(text: string, dimension = 384): number[] {
  // Simple deterministic hash-based embedding generator
  // In a real implementation, you would use a proper embedding model
  
  // Create a seed from the text
  let seed = 0;
  for (let i = 0; i < text.length; i++) {
    seed = ((seed << 5) - seed) + text.charCodeAt(i);
    seed = seed & seed; // Convert to 32bit integer
  }
  
  // Generate a deterministic embedding based on the seed
  const embedding = [];
  for (let i = 0; i < dimension; i++) {
    // Use a simple PRNG algorithm with the seed
    seed = (seed * 9301 + 49297) % 233280;
    const value = seed / 233280.0;
    
    // Generate values between -1 and 1
    embedding.push(value * 2 - 1);
  }
  
  // Normalize the vector to unit length
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / magnitude);
}

export async function POST(request: Request) {
  try {
    const { texts } = await request.json();

    if (!texts || !Array.isArray(texts)) {
      return NextResponse.json(
        { error: "Invalid input. Expected an array of texts." }, 
        { status: 400 }
      );
    }
    
    // Generate embeddings for each text
    const embeddings = texts.map(text => generateEmbedding(text));

    return NextResponse.json({ embeddings });
  } catch (error: any) {
    console.error("Error generating embeddings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate embeddings" },
      { status: 500 }
    );
  }
} 