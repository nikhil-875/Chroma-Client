"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { addDocuments } from "@/lib/chroma-client"
import { useToast } from "@/hooks/use-toast"

interface DocumentInput {
  id: string
  document: string
  metadata: string
}

export function AddDocumentsForm({ collectionName }: { collectionName: string }) {
  const [documents, setDocuments] = useState<DocumentInput[]>([{ id: "", document: "", metadata: "" }])
  const [batchInput, setBatchInput] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const addDocument = () => {
    setDocuments([...documents, { id: "", document: "", metadata: "" }])
  }

  const removeDocument = (index: number) => {
    const newDocuments = [...documents]
    newDocuments.splice(index, 1)
    setDocuments(newDocuments)
  }

  const updateDocument = (index: number, field: keyof DocumentInput, value: string) => {
    const newDocuments = [...documents]
    newDocuments[index][field] = value
    setDocuments(newDocuments)
  }

  const handleIndividualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate inputs
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i]
      if (!doc.id.trim() || !doc.document.trim()) {
        toast({
          title: "Error",
          description: `Document #${i + 1} is missing required fields`,
          variant: "destructive",
        })
        return
      }

      if (doc.metadata.trim()) {
        try {
          JSON.parse(doc.metadata)
        } catch (err) {
          toast({
            title: "Error",
            description: `Invalid JSON in metadata for document #${i + 1}`,
            variant: "destructive",
          })
          return
        }
      }
    }

    try {
      setLoading(true)

      const formattedDocs = documents.map((doc) => ({
        id: doc.id,
        document: doc.document,
        metadata: doc.metadata.trim() ? JSON.parse(doc.metadata) : {},
      }))

      await addDocuments(collectionName, formattedDocs)

      toast({
        title: "Success",
        description: `${documents.length} document(s) added successfully`,
      })

      router.push(`/collections/${encodeURIComponent(collectionName)}`)
    } catch (err) {
      console.error("Failed to add documents:", err)
      toast({
        title: "Error",
        description: "Failed to add documents. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!batchInput.trim()) {
      toast({
        title: "Error",
        description: "Batch input is empty",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      let batchDocuments
      try {
        batchDocuments = JSON.parse(batchInput)

        if (!Array.isArray(batchDocuments)) {
          throw new Error("Input must be an array of documents")
        }

        // Validate structure
        for (const doc of batchDocuments) {
          if (!doc.id || !doc.document) {
            throw new Error("Each document must have an id and document field")
          }
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Invalid JSON format. Please check your input.",
          variant: "destructive",
        })
        return
      }

      await addDocuments(collectionName, batchDocuments)

      toast({
        title: "Success",
        description: `${batchDocuments.length} document(s) added successfully`,
      })

      router.push(`/collections/${encodeURIComponent(collectionName)}`)
    } catch (err) {
      console.error("Failed to add documents:", err)
      toast({
        title: "Error",
        description: "Failed to add documents. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Tabs defaultValue="individual" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="individual">Individual Documents</TabsTrigger>
        <TabsTrigger value="batch">Batch Upload</TabsTrigger>
      </TabsList>

      <TabsContent value="individual">
        <form onSubmit={handleIndividualSubmit} className="space-y-6">
          {documents.map((doc, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Document #{index + 1}</h3>
                {documents.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeDocument(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`id-${index}`}>Document ID</Label>
                <Input
                  id={`id-${index}`}
                  value={doc.id}
                  onChange={(e) => updateDocument(index, "id", e.target.value)}
                  placeholder="unique_id_123"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`document-${index}`}>Document Content</Label>
                <Textarea
                  id={`document-${index}`}
                  value={doc.document}
                  onChange={(e) => updateDocument(index, "document", e.target.value)}
                  placeholder="Document text content..."
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`metadata-${index}`}>Metadata (Optional JSON)</Label>
                <Textarea
                  id={`metadata-${index}`}
                  value={doc.metadata}
                  onChange={(e) => updateDocument(index, "metadata", e.target.value)}
                  placeholder='{"author": "John Doe", "tags": ["important"]}'
                  className="min-h-[80px]"
                />
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addDocument} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Another Document
          </Button>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding Documents..." : "Add Documents"}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="batch">
        <form onSubmit={handleBatchSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="batch-input">JSON Array of Documents</Label>
            <Textarea
              id="batch-input"
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              placeholder={`[
  {
    "id": "doc1",
    "document": "This is the first document",
    "metadata": { "author": "John Doe" }
  },
  {
    "id": "doc2",
    "document": "This is the second document",
    "metadata": { "author": "Jane Smith" }
  }
]`}
              className="min-h-[300px] font-mono text-sm"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding Documents..." : "Add Documents"}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  )
}
