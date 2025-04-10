import Link from "next/link"
import { ChevronLeft, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DocumentsList } from "@/components/documents-list"

export default async function CollectionPage({ params }: { params: { name: string } }) {
  const decodedName = decodeURIComponent(params.name)

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/collections">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Collections
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{decodedName}</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/collections/${params.name}/add`}>
              <Plus className="h-4 w-4 mr-2" />
              Add Documents
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/collections/${params.name}/query`}>Query Collection</Link>
          </Button>
        </div>
      </div>

      <DocumentsList collectionName={decodedName} />
    </div>
  )
}
