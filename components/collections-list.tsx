"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Database, Loader2, Trash2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getCollections, deleteCollection } from "@/lib/client-api"
import { useToast } from "@/hooks/use-toast"

export function CollectionsList() {
  const [collections, setCollections] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchCollections() {
      try {
        setLoading(true)
        const response = await fetch('/api/collections');
        const data = await response.json();
        console.log('Raw API response:', data);
        
        // Use a safe approach to handle the collections
        if (data && data.collections) {
          console.log('Collections from API:', data.collections);
          // Map the collections to extract names safely
          const collectionNames = Array.isArray(data.collections) 
            ? data.collections.map((c: any) => {
                if (typeof c === 'string') return c;
                if (c && typeof c === 'object' && c.name) return c.name;
                return JSON.stringify(c); // Fallback for debugging
              })
            : [];
          
          console.log('Collection names extracted:', collectionNames);
          setCollections(collectionNames);
          setError(null);
        } else {
          console.error('Unexpected API response format:', data);
          setError('Failed to parse collections data. See console for details.');
          setCollections([]);
        }
      } catch (err: any) {
        console.error("Failed to fetch collections:", err)
        setError(err.message || "Failed to load collections. Please check your connection to Chroma.")
        setCollections([]);
      } finally {
        setLoading(false)
      }
    }

    fetchCollections()
  }, [])

  const handleDelete = async (collectionName: string) => {
    if (confirm(`Are you sure you want to delete the collection "${collectionName}"? This action cannot be undone.`)) {
      try {
        await deleteCollection(collectionName)
        setCollections(collections.filter((name) => name !== collectionName))
        toast({
          title: "Collection deleted",
          description: `Collection "${collectionName}" has been deleted successfully.`,
        })
      } catch (err: any) {
        console.error("Failed to delete collection:", err)
        toast({
          title: "Error",
          description: err.message || "Failed to delete collection. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (collections.length === 0) {
    return (
      <div className="text-center py-10">
        <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No collections found</h3>
        <p className="text-muted-foreground mb-6">Create your first collection to get started.</p>
        <Button asChild>
          <Link href="/collections/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Collection
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {collections.map((collection) => (
        <Card key={collection}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              {collection}
            </CardTitle>
            <CardDescription>Collection</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-between">
            <Button asChild variant="outline">
              <Link href={`/collections/${collection}`}>View Documents</Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(collection)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
