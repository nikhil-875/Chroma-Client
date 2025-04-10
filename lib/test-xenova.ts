import { ChromaClient } from 'chromadb';
import { runTests } from './xenova-chroma-client';

async function main() {
  console.log('🚀 Testing Xenova embeddings with ChromaDB');
  try {
    await runTests();
  } catch (error) {
    console.error('Error during test:', error);
  }
}

main(); 