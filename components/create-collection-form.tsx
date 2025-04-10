"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createCollection } from "@/lib/client-api"
import { useToast } from "@/hooks/use-toast"

export function CreateCollectionForm() {
  const [name, setName] = useState("")
  const [metadata, setMetadata] = useState("")
  const [useEmbedding, setUseEmbedding] = useState(true)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Collection name is required",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      let parsedMetadata = {}
      if (metadata.trim()) {
        try {
          parsedMetadata = JSON.parse(metadata)
        } catch (err) {
          toast({
            title: "Error",
            description: "Invalid JSON in metadata field",
            variant: "destructive",
          })
          return
        }
      }
      
      // Call the client-side API to create a collection
      await createCollection(name, parsedMetadata);

      toast({
        title: "Success",
        description: `Collection "${name}" created successfully`,
      })

      router.push("/collections")
    } catch (err: any) {
      console.error("Failed to create collection:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to create collection. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Collection Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="my_collection" required />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="use-embedding">Use Free Xenova Embeddings</Label>
          <Switch id="use-embedding" checked={useEmbedding} onCheckedChange={setUseEmbedding} />
        </div>

        {useEmbedding && (
          <div className="space-y-2 mt-4">
            <Alert className="mt-2">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Using free Xenova embedding model (all-MiniLM-L6-v2). No API key required!
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="metadata">Collection Metadata (Optional JSON)</Label>
        <Textarea
          id="metadata"
          value={metadata}
          onChange={(e) => setMetadata(e.target.value)}
          placeholder='{"description": "My collection description", "tags": ["tag1", "tag2"]}'
          className="min-h-[100px]"
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating..." : "Create Collection"}
      </Button>
    </form>
  )
}
