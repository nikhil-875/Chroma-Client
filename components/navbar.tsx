import Link from "next/link"
import { Database, Home, Search, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navbar() {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Database className="h-5 w-5" />
          <span>Chroma Client</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button asChild variant="ghost" size="sm">
            <Link href="/" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/collections" className="flex items-center gap-1">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Collections</span>
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/search" className="flex items-center gap-1">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/settings" className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
          </Button>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
