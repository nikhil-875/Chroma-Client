import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { QueryCollectionForm } from "@/components/query-collection-form"

export default function QueryCollectionPage({ params }: { params: { name: string } }) {
  const decodedName = decodeURIComponent(params.name)

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <div className="flex items-center mb-2">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/collections/${params.name}`}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Collection
          </Link>
        </Button>
      </div>

      <h1 className="text-3xl font-bold mb-6">Query Collection: {decodedName}</h1>
      <QueryCollectionForm collectionName={decodedName} />
    </div>
  )
}
