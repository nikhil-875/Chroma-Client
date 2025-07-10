"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, Info } from "lucide-react"

interface TestResult {
  success: boolean
  chromaUrl?: string
  heartbeat?: any
  collections?: number
  message?: string
  error?: string
  stack?: string
}

export default function TestServerPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)

  const testConnection = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/test-server')
      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
        message: "Failed to test connection"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">ChromaDB Connection Test</h1>
        <p className="text-muted-foreground">
          Test the connection to your ChromaDB server to diagnose any issues.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Connection Test</CardTitle>
            <CardDescription>
              Click the button below to test the connection to your ChromaDB server.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testConnection} 
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Connection Successful
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    Connection Failed
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {result.message}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.chromaUrl && (
                <div>
                  <strong>ChromaDB URL:</strong> {result.chromaUrl}
                </div>
              )}
              
              {result.success && (
                <div className="space-y-2">
                  <div>
                    <strong>Heartbeat Response:</strong>
                    <pre className="mt-1 p-2 bg-muted rounded text-sm overflow-x-auto">
                      {JSON.stringify(result.heartbeat, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <strong>Collections Count:</strong> {result.collections}
                  </div>
                </div>
              )}
              
              {result.error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div><strong>Error:</strong> {result.error}</div>
                      {result.stack && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm">Show Stack Trace</summary>
                          <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                            {result.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              Troubleshooting Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-semibold">If the connection fails:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Check if your ChromaDB server is running</li>
                <li>Verify the ChromaDB URL in your settings</li>
                <li>Ensure the server is accessible from your network</li>
                <li>Check for any firewall or CORS issues</li>
                <li>Verify that the ChromaDB version is compatible</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Common Issues:</h4>
              <div className="space-y-1">
                <Badge variant="outline" className="text-xs">CORS errors</Badge>
                <Badge variant="outline" className="text-xs">Network timeout</Badge>
                <Badge variant="outline" className="text-xs">Authentication required</Badge>
                <Badge variant="outline" className="text-xs">Invalid URL format</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 