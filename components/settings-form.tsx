"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getSettings, updateSettings } from "@/lib/settings"
import { useToast } from "@/hooks/use-toast"

export function SettingsForm() {
  const [chromaUrl, setChromaUrl] = useState("http://localhost:8000")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true)
        const settings = await getSettings()
        setChromaUrl(settings.chromaUrl || "http://localhost:8000")
      } catch (err) {
        console.error("Failed to load settings:", err)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!chromaUrl.trim()) {
      toast({
        title: "Error",
        description: "Chroma URL is required",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)

      await updateSettings({
        chromaUrl,
      })

      toast({
        title: "Success",
        description: "Settings saved successfully",
      })

      // Refresh the page to apply new settings
      router.refresh()
    } catch (err) {
      console.error("Failed to save settings:", err)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-pulse">Loading settings...</div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Connection Settings</CardTitle>
          <CardDescription>Configure your connection to Chroma</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chroma-url">Chroma URL</Label>
            <Input
              id="chroma-url"
              value={chromaUrl}
              onChange={(e) => setChromaUrl(e.target.value)}
              placeholder="http://localhost:8000"
              required
            />
            <p className="text-xs text-muted-foreground">
              The URL of your Chroma server. Default is http://localhost:8000
            </p>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertDescription>
          These settings are stored in your browser&apos;s local storage. 
          The application uses Xenova embeddings which are completely free and don't require any API keys.
        </AlertDescription>
      </Alert>

      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  )
}
