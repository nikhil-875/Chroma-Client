"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Info, AlertCircle } from "lucide-react"

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
  const [errors, setErrors] = useState<{ name?: string; metadata?: string }>({})
  const router = useRouter()
  const { toast } = useToast()

  const validateForm = () => {
    const newErrors: { name?: string; metadata?: string } = {}

    // Validate collection name
    if (!name.trim()) {
      newErrors.name = "Collection name is required"
    } else if (!/^[a-zA-Z0-9_-]+$/.test(name.trim())) {
      newErrors.name = "Collection name can only contain letters, numbers, underscores, and hyphens"
    } else if (name.trim().length < 2) {
      newErrors.name = "Collection name must be at least 2 characters long"
    } else if (name.trim().length > 50) {
      newErrors.name = "Collection name must be less than 50 characters"
    }

    // Validate metadata JSON
    if (metadata.trim()) {
      try {
        JSON.parse(metadata)
      } catch (err) {
        newErrors.metadata = "Invalid JSON format"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)

      let parsedMetadata: Record<string, any> = {}
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
      
      // Ensure we have at least a description in metadata
      if (!parsedMetadata.description) {
        parsedMetadata.description = `Collection: ${name.trim()}`
      }
      
      console.log(`Creating collection "${name}" with metadata:`, parsedMetadata)
      
      // Call the client-side API to create a collection
      await createCollection(name.trim(), parsedMetadata);

      toast({
        title: "Success",
        description: `Collection "${name}" created successfully`,
      })

      // Navigate to the collections page
      router.push("/collections")
    } catch (err: any) {
      console.error("Failed to create collection:", err)
      
      let errorMessage = err.message || "Failed to create collection. Please try again."
      
      // Provide more specific error messages
      if (err.message?.includes("already exists")) {
        errorMessage = `Collection "${name}" already exists. Please choose a different name.`
      } else if (err.message?.includes("connection")) {
        errorMessage = "Unable to connect to the database. Please check your settings."
      } else if (err.message?.includes("timeout")) {
        errorMessage = "Request timed out. Please try again."
      } else if (err.message?.includes("embeddings")) {
        errorMessage = "Failed to initialize embedding model. Please try again."
      } else if (err.message?.includes("metadata") && err.message?.includes("empty")) {
        errorMessage = "Invalid metadata format. Please check your metadata JSON."
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setName(value)
    
    // Clear name error when user starts typing
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: undefined }))
    }
  }

  const handleMetadataChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setMetadata(value)
    
    // Clear metadata error when user starts typing
    if (errors.metadata) {
      setErrors(prev => ({ ...prev, metadata: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Collection Name</Label>
        <Input 
          id="name" 
          value={name} 
          onChange={handleNameChange}
          placeholder="my_collection" 
          className={errors.name ? "border-red-500" : ""}
          disabled={loading}
        />
        {errors.name && (
          <div className="flex items-center gap-2 text-sm text-red-500">
            <AlertCircle className="h-4 w-4" />
            {errors.name}
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          Use only letters, numbers, underscores, and hyphens. 2-50 characters.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="use-embedding">Use Free Xenova Embeddings</Label>
          <Switch 
            id="use-embedding" 
            checked={useEmbedding} 
            onCheckedChange={setUseEmbedding}
            disabled={loading}
          />
        </div>

        {useEmbedding && (
          <div className="space-y-2 mt-4">
            <Alert>
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
          onChange={handleMetadataChange}
          placeholder='{"description": "My collection description", "tags": ["tag1", "tag2"]}'
          className={`min-h-[100px] ${errors.metadata ? "border-red-500" : ""}`}
          disabled={loading}
        />
        {errors.metadata && (
          <div className="flex items-center gap-2 text-sm text-red-500">
            <AlertCircle className="h-4 w-4" />
            {errors.metadata}
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          Optional metadata to describe your collection. Must be valid JSON. A description will be automatically added if not provided.
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating Collection..." : "Create Collection"}
      </Button>
    </form>
  )
}
