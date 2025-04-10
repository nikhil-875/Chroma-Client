import { CreateCollectionForm } from "@/components/create-collection-form"

export default function NewCollectionPage() {
  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Create New Collection</h1>
      <CreateCollectionForm />
    </div>
  )
}
