/**
 * Client-side API adaptors for interacting with the server-side ChromaDB
 * This file contains pure browser-compatible code with no Node.js dependencies
 */

// Collection types
export interface Collection {
  name: string;
}

// Document types
export interface Document {
  id: string;
  document: string;
  metadata: Record<string, any>;
  collection?: string;
  distance?: number;
}

// API response types
interface ApiResponse {
  success?: boolean;
  error?: string;
  message?: string;
}

interface CollectionsResponse extends ApiResponse {
  collections?: Collection[];
}

interface DocumentsResponse extends ApiResponse {
  documents?: Document[];
}

interface SearchResponse extends ApiResponse {
  results?: Document[];
}

// API adaptors

/**
 * Get all collections
 */
export async function getCollections(): Promise<Collection[]> {
  const response = await fetch('/api/collections');
  
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to fetch collections');
  }
  
  const data = await response.json() as CollectionsResponse;
  return data.collections || [];
}

/**
 * Create a new collection
 */
export async function createCollection(name: string, metadata: Record<string, any> = {}): Promise<void> {
  try {
    console.log(`Client API: Creating collection "${name}" with metadata:`, metadata);
    
    const response = await fetch('/api/collections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, metadata }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`Client API: Collection creation failed with status ${response.status}:`, data);
      throw new Error(data.error || `Failed to create collection (${response.status})`);
    }
    
    console.log(`Client API: Collection "${name}" created successfully`);
  } catch (error) {
    console.error('Client API: Error in createCollection:', error);
    
    // Re-throw with more context if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your connection.');
    }
    
    throw error;
  }
}

/**
 * Delete a collection
 */
export async function deleteCollection(name: string): Promise<void> {
  const response = await fetch(`/api/collections/${name}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to delete collection');
  }
}

/**
 * Get all documents in a collection
 */
export async function getDocuments(collectionName: string): Promise<Document[]> {
  const response = await fetch(`/api/collections/${collectionName}`);
  
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to fetch documents');
  }
  
  const data = await response.json() as DocumentsResponse;
  return data.documents || [];
}

/**
 * Add documents to a collection
 */
export async function addDocuments(collectionName: string, documents: Document[]): Promise<void> {
  const response = await fetch(`/api/collections/${collectionName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ documents }),
  });
  
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to add documents');
  }
}

/**
 * Update a document
 */
export async function updateDocument(
  collectionName: string, 
  id: string, 
  document: string, 
  metadata: Record<string, any> = {}
): Promise<void> {
  const response = await fetch(`/api/collections/${collectionName}/documents/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ document, metadata }),
  });
  
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to update document');
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(collectionName: string, id: string): Promise<void> {
  const response = await fetch(`/api/collections/${collectionName}/documents/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to delete document');
  }
}

/**
 * Search across collections
 */
export async function search(
  query: string, 
  collectionNames: string[], 
  nResults: number = 5
): Promise<Document[]> {
  const response = await fetch('/api/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, collectionNames, nResults }),
  });
  
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to search');
  }
  
  const data = await response.json() as SearchResponse;
  return data.results || [];
} 