// Using a custom type definition instead to avoid Node.js imports issues
type ChromaClient = any;
type Collection = any;

import * as XenovaClient from './xenova-chroma-client';

// Create a single shared client instance
let _client: ChromaClient | null = null;

// Get or initialize the ChromaClient
const getClient = (): ChromaClient => {
  if (!_client) {
    // Don't initialize real client on client-side
    if (typeof window !== 'undefined') {
      // Create a dummy client for client-side
      _client = {} as ChromaClient;
    } else {
      // This will only run server-side
      const { ChromaClient } = require('chromadb');
      _client = new ChromaClient();
    }
  }
  return _client;
};

// Settings interface - kept for backwards compatibility
interface ChromaSettings {
  chromaUrl: string;
  openaiApiKey?: string;
}

// Get settings from localStorage - kept for backwards compatibility
export const getSettings = async (): Promise<ChromaSettings> => {
  if (typeof window === "undefined") {
    return {
      chromaUrl: "http://localhost:8000",
    };
  }

  const settings = localStorage.getItem("chroma-settings");
  return settings
    ? JSON.parse(settings)
    : {
        chromaUrl: "http://localhost:8000",
      };
};

// Update settings in localStorage - kept for backwards compatibility 
export const updateSettings = async (settings: ChromaSettings): Promise<void> => {
  if (typeof window === "undefined") return;

  localStorage.setItem("chroma-settings", JSON.stringify(settings));
};

// Get all collections
export const getCollections = async (): Promise<string[]> => {
  const client = getClient();
  const collections = await XenovaClient.getAllCollections(client);
  
  // Cast the collections to any[] first to avoid TypeScript errors
  return (collections as any[]).map(collection => collection.name || "");
};

// Create a new collection - new interface with backward compatibility
export const createCollection = async (
  clientOrOptions: ChromaClient | { 
    name: string; 
    embeddingFunction?: string | null; 
    metadata?: Record<string, any>;
  },
  name?: string
): Promise<void> => {
  // Handle both new and old API calls
  if (clientOrOptions instanceof ChromaClient) {
    // New API: client, name
    await XenovaClient.createCollection(clientOrOptions, name || "");
  } else {
    // Old API: { name, embeddingFunction, metadata }
    const client = getClient();
    await XenovaClient.createCollection(client, clientOrOptions.name);
  }
};

// Delete a collection
export const deleteCollection = async (name: string): Promise<void> => {
  const client = getClient();
  await XenovaClient.deleteCollection(client, name);
};

// Get documents from a collection
export const getDocuments = async (collectionName: string) => {
  const client = getClient();
  const collection = await XenovaClient.getCollection(client, collectionName);
  if (!collection) return [];
  
  const result = await collection.get();
  
  const documents = [];
  for (let i = 0; i < result.ids.length; i++) {
    documents.push({
      id: result.ids[i],
      document: result.documents[i],
      metadata: result.metadatas?.[i] || {},
    });
  }
  
  return documents;
};

// Add documents to a collection
export const addDocuments = async (collectionName: string, documents: any[]) => {
  const client = getClient();
  const collection = await XenovaClient.getCollection(client, collectionName);
  if (!collection) return;
  
  const docs = documents.map(doc => ({
    id: doc.id,
    document: doc.document,
    metadata: doc.metadata || {}
  }));
  
  await XenovaClient.addDocuments(collection, docs);
};

// Delete a document from a collection
export const deleteDocument = async (collectionName: string, id: string) => {
  const client = getClient();
  const collection = await XenovaClient.getCollection(client, collectionName);
  if (!collection) return;
  
  await XenovaClient.deleteDocument(collection, id);
};

// Query a collection
export const queryCollection = async (collectionName: string, queryText: string, nResults = 5) => {
  const client = getClient();
  const collection = await XenovaClient.getCollection(client, collectionName);
  if (!collection) return [];
  
  const result = await XenovaClient.queryDocuments(collection, queryText, nResults);
  
  // Format results to match old API
  const documents = [];
  if (result.ids[0] && result.ids[0].length > 0) {
    for (let i = 0; i < result.ids[0].length; i++) {
      documents.push({
        id: result.ids[0][i],
        document: result.documents[0][i],
        metadata: result.metadatas?.[0]?.[i] || {},
        collection: collectionName,
        distance: result.distances?.[0]?.[i] || 0,
      });
    }
  }
  
  return documents;
}; 