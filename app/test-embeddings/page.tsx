"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestEmbeddingsPage() {
  const [text, setText] = useState("Hello, how are you?");
  const [embedding, setEmbedding] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateEmbedding = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch("/api/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ texts: [text] }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate embedding");
      }
      
      const data = await response.json();
      setEmbedding(data.embeddings[0]);
    } catch (err: any) {
      setError(err.message || "An error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Test Xenova Embeddings</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Generate Embedding</CardTitle>
          <CardDescription>
            Test the Xenova embedding model by generating an embedding for some text.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to generate embedding"
            className="min-h-[100px]"
          />
          
          <Button 
            onClick={generateEmbedding} 
            disabled={loading || !text.trim()}
            className="w-full"
          >
            {loading ? "Generating..." : "Generate Embedding"}
          </Button>
          
          {error && <p className="text-red-500">{error}</p>}
          
          {embedding.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Embedding (first 10 values):</h3>
              <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
                {JSON.stringify(embedding.slice(0, 10), null, 2)}...
                <div className="text-muted-foreground mt-2">
                  Total dimensions: {embedding.length}
                </div>
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="text-center text-sm text-muted-foreground">
        This page demonstrates that Xenova embeddings are working properly through the server-side API.
      </div>
    </div>
  );
} 