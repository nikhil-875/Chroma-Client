"use client"

import { useState, useEffect } from "react"
import { FileText, Loader2, Search, Trash2, Edit } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose 
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { getDocuments, deleteDocument, updateDocument, Document } from "@/lib/client-api"
import { useToast } from "@/hooks/use-toast"

export function DocumentsList({ collectionName }: { collectionName: string }) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  
  // Edit document state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingDocument, setEditingDocument] = useState<Document | null>(null)
  const [editedContent, setEditedContent] = useState("")
  const [editedMetadata, setEditedMetadata] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    async function fetchDocuments() {
      try {
        setLoading(true)
        const docs = await getDocuments(collectionName)
        setDocuments(docs)
        setError(null)
      } catch (err: any) {
        console.error("Failed to fetch documents:", err)
        setError(err.message || "Failed to load documents. Please check your connection to Chroma.")
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [collectionName])

  const handleDelete = async (id: string) => {
    if (confirm(`Are you sure you want to delete this document? This action cannot be undone.`)) {
      try {
        await deleteDocument(collectionName, id)
        setDocuments(documents.filter((doc) => doc.id !== id))
        toast({
          title: "Document deleted",
          description: `Document has been deleted successfully.`,
        })
      } catch (err) {
        console.error("Failed to delete document:", err)
        toast({
          title: "Error",
          description: "Failed to delete document. Please try again.",
          variant: "destructive",
        })
      }
    }
  }
  
  const handleEditClick = (doc: Document) => {
    setEditingDocument(doc)
    setEditedContent(doc.document)
    setEditedMetadata(JSON.stringify(doc.metadata, null, 2))
    setIsEditDialogOpen(true)
  }
  
  const handleUpdate = async () => {
    if (!editingDocument) return
    
    try {
      setIsUpdating(true)
      
      // Parse metadata JSON
      let metadata = {}
      try {
        metadata = JSON.parse(editedMetadata)
      } catch (err) {
        toast({
          title: "Invalid metadata",
          description: "Please enter valid JSON for metadata",
          variant: "destructive",
        })
        return
      }
      
      // Update document
      await updateDocument(collectionName, editingDocument.id, editedContent, metadata)
      
      // Update local state
      setDocuments(documents.map(doc => 
        doc.id === editingDocument.id 
          ? { ...doc, document: editedContent, metadata } 
          : doc
      ))
      
      // Close dialog
      setIsEditDialogOpen(false)
      
      toast({
        title: "Document updated",
        description: "Document has been updated successfully",
      })
    } catch (err: any) {
      console.error("Failed to update document:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to update document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.document.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(doc.metadata).toLowerCase().includes(searchTerm.toLowerCase()),
  )

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

  if (documents.length === 0) {
    return (
      <div className="text-center py-10">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No documents found</h3>
        <p className="text-muted-foreground mb-6">Add documents to this collection to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search documents..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredDocuments.map((doc) => (
          <Card key={doc.id} className="overflow-hidden">
            <CardHeader className="bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <div className="font-mono text-sm truncate">{doc.id}</div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEditClick(doc)}>
                    <Edit className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(doc.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="text-sm whitespace-pre-wrap break-words">
                {doc.document.length > 300 ? `${doc.document.substring(0, 300)}...` : doc.document}
              </div>
            </CardContent>
            {Object.keys(doc.metadata).length > 0 && (
              <CardFooter className="border-t p-4 flex flex-wrap gap-2">
                {Object.entries(doc.metadata).map(([key, value]) => (
                  <Badge key={key} variant="outline" className="text-xs">
                    {key}: {typeof value === "object" ? JSON.stringify(value) : String(value)}
                  </Badge>
                ))}
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
      
      {/* Edit Document Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="document-id">Document ID (read-only)</Label>
              <Input 
                id="document-id" 
                value={editingDocument?.id || ''} 
                readOnly 
                className="bg-muted/50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="document-content">Document Content</Label>
              <Textarea 
                id="document-content" 
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[200px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="document-metadata">
                Metadata (JSON format)
              </Label>
              <Textarea 
                id="document-metadata" 
                value={editedMetadata}
                onChange={(e) => setEditedMetadata(e.target.value)}
                className="min-h-[150px] font-mono text-sm"
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button 
              onClick={handleUpdate} 
              disabled={isUpdating}
            >
              {isUpdating ? "Updating..." : "Update Document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
