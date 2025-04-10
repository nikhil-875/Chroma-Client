"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { getCollections, createCollection, search } from "@/lib/client-api";

export default function TestServerPage() {
  const [collections, setCollections] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newCollection, setNewCollection] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  const fetchCollections = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await getCollections();
      setCollections(result.map(c => c.name));
    } catch (err: any) {
      setError(err.message || "Failed to fetch collections");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateCollection = async () => {
    if (!newCollection.trim()) return;
    
    try {
      setLoading(true);
      setError("");
      await createCollection(newCollection);
      setNewCollection("");
      await fetchCollections();
    } catch (err: any) {
      setError(err.message || "Failed to create collection");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = async () => {
    if (!searchQuery.trim() || collections.length === 0) return;
    
    try {
      setLoading(true);
      setError("");
      const results = await search(searchQuery, collections);
      setSearchResults(results);
    } catch (err: any) {
      setError(err.message || "Failed to search");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Test Server-Side ChromaDB</h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Collections</CardTitle>
            <CardDescription>Manage your collections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={fetchCollections} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Fetch Collections
              </Button>
            </div>
            
            {collections.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Available Collections:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {collections.map(name => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="pt-4 border-t mt-4">
              <h3 className="font-medium mb-2">Create New Collection:</h3>
              <div className="flex gap-2">
                <Input 
                  value={newCollection}
                  onChange={(e) => setNewCollection(e.target.value)}
                  placeholder="Collection name"
                />
                <Button onClick={handleCreateCollection} disabled={loading || !newCollection.trim()}>
                  Create
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Search</CardTitle>
            <CardDescription>Search across all collections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search query"
              />
              <Button 
                onClick={handleSearch} 
                disabled={loading || !searchQuery.trim() || collections.length === 0}
              >
                Search
              </Button>
            </div>
            
            {searchResults.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Search Results:</h3>
                <div className="space-y-2">
                  {searchResults.map((result, i) => (
                    <div key={i} className="border rounded p-3 text-sm">
                      <div className="font-mono text-xs text-muted-foreground">ID: {result.id}</div>
                      <div className="mt-1">{result.document}</div>
                      {result.collection && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Collection: {result.collection}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {error && (
        <div className="mt-6 p-4 bg-destructive/10 border border-destructive text-destructive rounded-md">
          {error}
        </div>
      )}
    </div>
  );
} 