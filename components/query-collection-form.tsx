"use client"

import type React from "react"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { search, Document } from "@/lib/client-api"
import { useToast } from "@/hooks/use-toast"

interface QueryResult {
  id: string
  document: string
  metadata: Record<string, any>
  distance: number
}

export function QueryCollectionForm({ collectionName }: { collectionName: string }) {
  const [queryText, setQueryText] = useState("")
  const [nResults, setNResults] = useState(5)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<QueryResult[]>([])
  const { toast } = useToast()

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
      const searchResults = await search(queryText, [collectionName], nResults)
      // Convert Document[] to QueryResult[] and ensure distance is a number
      setResults(searchResults.map(result => ({
        ...result,
        distance: result.distance ?? 1 // Default to 1 (furthest) if distance is undefined
      } as QueryResult)))
    } catch (err: any) {
      console.error("Failed to query collection:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to query collection. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
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
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-sm truncate">{result.id}</div>
                    <Badge variant="outline">Similarity: {(1 - result.distance).toFixed(4)}</Badge>
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
