// Replace direct ChromaDB import with a polyfill for browser
// import { ChromaClient, Collection } from 'chromadb';
// Using type definitions instead
type ChromaClient = any;
type Collection = any;

import { CustomServerEmbeddingFunction } from './custom-embedding';

type Property = {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  description: string;
  user_id: string;
};

type Unit = {
  unit_id: string;
  name: string;
  bedroom: number;
  baths: number;
  kitchen: number;
  property_name: string;
  rent: number;
  deposit_amount: number;
  rent_type: string;
  rent_duration: string;
  deposit_type: string;
  start_date: string;
  end_date: string;
  notes: string;
  user_id: string;
  property_id: string;
  tenant_id: string;
};

// ---------------- EMBEDDING FUNCTION ----------------

// Create a proper embedding function for ChromaDB using the API endpoint
const embedFn = new CustomServerEmbeddingFunction();

// ---------------- FORMATTERS ----------------

const propertyToChromaDocument = (property: Property) => ({
  id: property.id,
  document: `
    ${property.name} is a ${property.type.toLowerCase()} property located at 
    ${property.address}, ${property.city}, ${property.state}, ${property.country}, 
    zip code ${property.zip_code}. Description: ${property.description}
  `,
  metadata: {
    user_id: property.user_id,
    service: 'property',
    type: property.type,
    country: property.country,
    state: property.state,
    city: property.city,
    zip_code: property.zip_code,
    name: property.name,
    searchable: true
  }
});

const unitToChromaDocument = (unit: Unit) => ({
  id: unit.unit_id,
  document: `
    ${unit.name} is a ${unit.bedroom}-bedroom, ${unit.baths}-bathroom unit with ${unit.kitchen} kitchen(s)
    in ${unit.property_name}. The rent is ₹${unit.rent} with a deposit of ₹${unit.deposit_amount}.
    Lease from ${new Date(unit.start_date).toDateString()} to ${new Date(unit.end_date).toDateString()}.
    Notes: ${unit.notes}
  `,
  metadata: {
    user_id: unit.user_id,
    service: 'unit',
    property_id: unit.property_id,
    tenant_id: unit.tenant_id,
    searchable: true
  }
});

// ---------------- CRUD OPERATIONS ----------------

export async function createCollection(client: ChromaClient, name: string) {
  return await client.getOrCreateCollection({
    name,
    embeddingFunction: embedFn
  });
}

export async function getCollection(client: ChromaClient, name: string) {
  try {
    return await client.getCollection({
      name,
      embeddingFunction: embedFn
    });
  } catch (e: any) {
    console.error(`❌ Collection "${name}" not found.`, e.message);
    return null;
  }
}

export async function getAllCollections(client: ChromaClient) {
  try {
    const collections = await client.listCollections();
    return collections;
  } catch (error) {
    console.error('Error fetching collections:', error);
    throw new Error('Failed to retrieve collections');
  }
}

export async function listCollections(client: ChromaClient) {
  const collections = await getAllCollections(client);
  console.log('📚 Collections:', collections);
  return collections;
}

export async function deleteCollection(client: ChromaClient, name: string) {
  try {
    await client.deleteCollection({ name });
    console.log(`🗑️ Deleted collection: ${name}`);
  } catch (e: any) {
    console.error(`❌ Error deleting collection "${name}":`, e.message);
  }
}

export async function addDocuments(collection: Collection, docs: { id: string; document: string; metadata: any }[]) {
  await collection.add({
    ids: docs.map(d => d.id),
    documents: docs.map(d => d.document),
    metadatas: docs.map(d => d.metadata)
    // embeddings are handled automatically by the embeddingFunction
  });
  console.log(`✅ Added ${docs.length} documents`);
}

export async function queryDocuments(collection: Collection, query: string, topK: number = 3) {
  const results = await collection.query({
    queryTexts: [query],
    nResults: topK
  });
  // Add threshold filtering to only return high-quality matches
  const threshold = 1;
  const filteredResults = {
    ...results,
    ids: [results.ids?.[0]?.filter((_, i) => results.distances?.[0]?.[i] !== undefined && results.distances[0][i] <= threshold) || []],
    distances: [results.distances?.[0]?.filter(distance => distance <= threshold) || []],
    metadatas: [results.metadatas?.[0]?.filter((_, i) => results.distances?.[0]?.[i] !== undefined && results.distances[0][i] <= threshold) || []],
    documents: [results.documents?.[0]?.filter((_, i) => results.distances?.[0]?.[i] !== undefined && results.distances[0][i] <= threshold) || []]
  };

  console.log(`🔍 Query Results for "${query}":`, filteredResults);
  return filteredResults;
}

export async function updateDocument(collection: Collection, id: string, newDocument: string, newMetadata: any) {
  await collection.update({
    ids: [id],
    documents: [newDocument],
    metadatas: [newMetadata]
    // embeddings are handled automatically by the embeddingFunction
  });

  console.log(`✏️ Updated document with id "${id}"`);
}

export async function deleteDocument(collection: Collection, id: string) {
  await collection.delete({ ids: [id] });
  console.log(`🗑️ Deleted document with id "${id}"`);
}

// ---------------- TEST DATA & EXECUTION ----------------

export async function addTestData(userId: string, collection: Collection) {
  const properties: Property[] = [
    {
      id: 'prop_001',
      name: 'Skyview Apartments',
      type: 'Apartment',
      address: '123 Palm Street',
      city: 'Noida',
      state: 'Uttar Pradesh',
      country: 'India',
      zip_code: '201301',
      description: 'Modern high-rise apartment complex with amenities like gym, pool, and rooftop garden.',
      user_id: userId,
    },
    {
      id: 'prop_002',
      name: 'Green Meadows Villa',
      type: 'Villa',
      address: '45 Banyan Avenue',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      zip_code: '560103',
      description: 'Luxury villa in gated community with private lawn and parking.',
      user_id: userId,
    }
  ];

  const units: Unit[] = [
    {
      unit_id: 'unit_001',
      name: 'Unit A101',
      bedroom: 2,
      baths: 2,
      kitchen: 1,
      property_name: 'Skyview Apartments',
      rent: 28000,
      deposit_amount: 56000,
      rent_type: 'Monthly',
      rent_duration: '12 Months',
      deposit_type: 'Refundable',
      start_date: '2025-04-01',
      end_date: '2026-03-31',
      notes: 'Ideal for families or couples.',
      user_id: userId,
      property_id: 'prop_001',
      tenant_id: 'tenant_001'
    },
    {
      unit_id: 'unit_002',
      name: 'Villa B2',
      bedroom: 3,
      baths: 3,
      kitchen: 1,
      property_name: 'Green Meadows Villa',
      rent: 65000,
      deposit_amount: 130000,
      rent_type: 'Monthly',
      rent_duration: '24 Months',
      deposit_type: 'Refundable',
      start_date: '2025-05-15',
      end_date: '2027-05-14',
      notes: 'Comes with private garden and parking.',
      user_id: userId,
      property_id: 'prop_002',
      tenant_id: 'tenant_002'
    }
  ];

  const docs = [...properties.map(propertyToChromaDocument), ...units.map(unitToChromaDocument)];
  await addDocuments(collection, docs);
}

// Export run tests function
export async function runTests() {
  const client = new ChromaClient();
  const collectionName = 'test_properties';
  const userId = 'user_001';

  const collection = await createCollection(client, collectionName);

  await listCollections(client);

  await addTestData(userId, collection);

  await addDocuments(collection, [{
    id: 'tenant_003',
    document: `
        Unit 101 assigned to 
        Name: New Tenant. 
        Email: newtenant@example.com, 
        Phone: +91-9876543210, 
        Address: 123 New Street, Noida, Uttar Pradesh, India - 201301. 
        Notes: New tenant with valid ID proof.
      `,
    metadata: {
      user_id: userId,
      service: 'tenant',
      unit_id: 'unit_001',
      name: 'New Tenant',
      email: 'newtenant@example.com',
      phone: '+919876543210',
      address: '123 New Street',
      city: 'Noida',
      state: 'Uttar Pradesh',
      country: 'India',
      zip_code: '201301',
      notes: 'New tenant with a valid ID proof',
      searchable: true
    }
  }]);

  await queryDocuments(collection, 'who is the tenant of unit 001');
  await queryDocuments(collection, 'villa with garden in Bangalore');
  await updateDocument(collection, 'prop_002', 'Green Meadows Villa - Updated description.', {
    updated: true,
    service: 'property'
  });

  // delete a document
  await deleteDocument(collection, 'unit_001');

  // Optional: Delete the entire collection
  await deleteCollection(client, collectionName);

  console.log('✅ All tests completed successfully');
} 