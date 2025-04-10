"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getCollections, search } from "@/lib/client-api"
import { useToast } from "@/hooks/use-toast"

interface SearchResult {
  id: string
  document: string
  metadata: Record<string, any>
  distance: number
  collection: string
}

export function SearchForm() {
  const [collections, setCollections] = useState<string[]>([])
  const [selectedCollection, setSelectedCollection] = useState<string>("all")
  const [queryText, setQueryText] = useState("")
  const [nResults, setNResults] = useState(5)
  const [loading, setLoading] = useState(false)
  const [collectionsLoading, setCollectionsLoading] = useState(true)
  const [results, setResults] = useState<SearchResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchCollections() {
      try {
        setCollectionsLoading(true)
        const collectionsList = await getCollections()
        setCollections(collectionsList)
        setError(null)
      } catch (err: any) {
        console.error("Failed to fetch collections:", err)
        setError(err.message || "Failed to load collections. Please check your connection to Chroma.")
      } finally {
        setCollectionsLoading(false)
      }
    }

    fetchCollections()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!queryText.trim()) {
      toast({
        title: "Error",
        description: "Query text is required",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      setResults([])

      if (selectedCollection === "all") {
        // Query all collections
        const searchResults = await search(queryText, collections, nResults);
        setResults(searchResults);
      } else {
        // Query single collection
        const searchResults = await search(queryText, [selectedCollection], nResults);
        setResults(searchResults);
      }
    } catch (err: any) {
      console.error("Failed to search:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to search. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (collectionsLoading) {
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

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="collection">Collection</Label>
          <Select value={selectedCollection} onValueChange={setSelectedCollection}>
            <SelectTrigger>
              <SelectValue placeholder="Select collection" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Collections</SelectItem>
              {collections.map((collection) => (
                <SelectItem key={collection} value={collection}>
                  {collection}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="query-text">Query Text</Label>
          <Textarea
            id="query-text"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Enter your query text here..."
            className="min-h-[100px]"
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="n-results">Number of Results: {nResults}</Label>
          </div>
          <Slider
            id="n-results"
            min={1}
            max={20}
            step={1}
            value={[nResults]}
            onValueChange={(value) => setNResults(value[0])}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </form>

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Results</h2>
          <div className="grid grid-cols-1 gap-4">
            {results.map((result, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="bg-muted/50 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="font-mono text-sm truncate">{result.id}</div>
                    <div className="flex flex-wrap gap-2">
                      <Badge>{result.collection}</Badge>
                      <Badge variant="outline">Similarity: {(1 - result.distance).toFixed(4)}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="text-sm whitespace-pre-wrap break-words">{result.document}</div>
                </CardContent>
                {Object.keys(result.metadata).length > 0 && (
                  <CardFooter className="border-t p-4 flex flex-wrap gap-2">
                    {Object.entries(result.metadata).map(([key, value]) => (
                      <Badge key={key} variant="outline" className="text-xs">
                        {key}: {typeof value === "object" ? JSON.stringify(value) : String(value)}
                      </Badge>
                    ))}
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
