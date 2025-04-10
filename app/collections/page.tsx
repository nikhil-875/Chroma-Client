import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CollectionsList } from "@/components/collections-list"

export default function CollectionsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Collections</h1>
        <Button asChild>
          <Link href="/collections/new">
            <Plus className="h-4 w-4 mr-2" />
            New Collection
          </Link>
        </Button>
      </div>

      <CollectionsList />
    </div>
  )
}
