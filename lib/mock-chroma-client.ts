/**
 * Mock ChromaDB client for browser use
 * This prevents imports of Node.js specific modules in client components
 */

// Mock Collection type
export interface Collection {
  name: string;
  metadata?: Record<string, any>;
}

// Mock ChromaSettings
export interface ChromaSettings {
  chromaUrl: string;
}

// Get settings from localStorage
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

// Update settings in localStorage
export const updateSettings = async (settings: ChromaSettings): Promise<void> => {
  if (typeof window === "undefined") return;
  localStorage.setItem("chroma-settings", JSON.stringify(settings));
};

// Mock collections data
let mockCollections: Collection[] = [
  { name: "sample_collection", metadata: { description: "A sample collection" } }
];

// Mock documents data per collection
const mockDocuments: Record<string, any[]> = {
  "sample_collection": [
    { id: "doc1", document: "This is a sample document", metadata: { type: "text" } },
    { id: "doc2", document: "Another sample document", metadata: { type: "text" } }
  ]
};

// Get all collections
export const getCollections = async (): Promise<string[]> => {
  return mockCollections.map(collection => collection.name);
};

// Create a new collection
export const createCollection = async (options: { name: string, embeddingFunction?: any, metadata?: Record<string, any> }): Promise<void> => {
  const { name, metadata = {} } = options;
  mockCollections.push({ name, metadata });
  mockDocuments[name] = [];
};

// Delete a collection
export const deleteCollection = async (name: string): Promise<void> => {
  mockCollections = mockCollections.filter(collection => collection.name !== name);
  delete mockDocuments[name];
};

// Get documents from a collection
export const getDocuments = async (collectionName: string) => {
  return mockDocuments[collectionName] || [];
};

// Add documents to a collection
export const addDocuments = async (collectionName: string, documents: any[]) => {
  if (!mockDocuments[collectionName]) {
    mockDocuments[collectionName] = [];
  }
  mockDocuments[collectionName].push(...documents);
};

// Delete a document from a collection
export const deleteDocument = async (collectionName: string, id: string) => {
  if (mockDocuments[collectionName]) {
    mockDocuments[collectionName] = mockDocuments[collectionName].filter(doc => doc.id !== id);
  }
};

// Query a collection
export const queryCollection = async (collectionName: string, queryText: string, nResults = 5) => {
  // Simple mock implementation that returns documents containing the query text
  const documents = mockDocuments[collectionName] || [];
  
  const results = documents
    .filter(doc => doc.document.toLowerCase().includes(queryText.toLowerCase()))
    .slice(0, nResults)
    .map(doc => ({
      ...doc,
      collection: collectionName,
      distance: 0.1, // Mock distance
    }));

  return results;
}; 