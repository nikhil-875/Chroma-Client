import { SearchForm } from "@/components/search-form"

export default function SearchPage() {
  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Search Across Collections</h1>
      <SearchForm />
    </div>
  )
}
