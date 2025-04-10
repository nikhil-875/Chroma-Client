import { ChevronRight } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">Chroma Client</h1>
        <p className="max-w-[700px] text-muted-foreground md:text-xl">
          A user-friendly interface for managing your Chroma vector database collections and documents.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Button asChild size="lg">
            <Link href="/collections">View Collections</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/collections/new">Create Collection</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
        <Card>
          <CardHeader>
            <CardTitle>Manage Collections</CardTitle>
            <CardDescription>Create, view, and delete collections in your Chroma database.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Collections are containers for your documents and embeddings. Create collections with custom embedding
              functions.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="ghost" className="w-full justify-between">
              <Link href="/collections">
                View Collections <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage Documents</CardTitle>
            <CardDescription>Add, view, and delete documents in your collections.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Documents are stored with their embeddings and metadata. Add documents individually or in batch.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="ghost" className="w-full justify-between">
              <Link href="/collections">
                Select Collection <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Search & Query</CardTitle>
            <CardDescription>Search for similar documents using vector similarity.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Query your collections by text or embeddings to find the most similar documents.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="ghost" className="w-full justify-between">
              <Link href="/search">
                Go to Search <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
