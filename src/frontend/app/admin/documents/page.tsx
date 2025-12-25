"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, CheckCircle2, Loader2, Calendar, Database } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/lib/auth-store"

interface Document {
  _id: string
  filename: string
  subject: string
  topic: string
  total_chunks: number
  upload_date: string
}

export default function AdminDocumentsPage() {
  const { toast } = useToast()
  const token = useAuthStore((state) => state.token)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  // Upload form state
  const [file, setFile] = useState<File | null>(null)
  const [subject, setSubject] = useState<string>("Math")
  const [topic, setTopic] = useState<string>("")
  const [source, setSource] = useState<string>("Ministry of Education")

  useEffect(() => {
    if (token) {
      fetchDocuments()
    }
  }, [token])

  const fetchDocuments = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/documents", {
        method: "GET",
        headers: {
          "x-access-token": token || "",
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch documents")
      }

      const data = await response.json()
      console.log("Documents response:", data)
      
      // Handle both array and object responses
      const docs = Array.isArray(data) ? data : data.documents || []
      setDocuments(docs)
    } catch (error) {
      console.error("Failed to fetch documents:", error)
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file || !topic) {
      toast({
        title: "Missing information",
        description: "Please select a file and fill in all fields",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("subject", subject)
      formData.append("topic", topic)
      formData.append("source", source)

      const response = await fetch("http://localhost:8000/api/documents/upload", {
        method: "POST",
        headers: {
          "x-access-token": token || "",
        },
        body: formData,
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Upload failed")
      }

      const data = await response.json()

      toast({
        title: "Success!",
        description: `${data.filename} uploaded successfully`,
      })

      // Reset form
      setFile(null)
      setTopic("")
      const fileInput = document.getElementById("file-upload") as HTMLInputElement
      if (fileInput) fileInput.value = ""

      // Refresh documents list
      fetchDocuments()
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
            <p className="text-muted-foreground mt-2">
              Upload and manage curriculum documents for AI question generation
            </p>
          </div>

          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Upload New Document</CardTitle>
              <CardDescription>
                Upload PDF or DOCX files. Documents will be processed and used for generating test questions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="file-upload">Document File</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="flex-1"
                  />
                  {file && (
                    <Badge variant="secondary" className="gap-2">
                      <FileText className="h-3 w-3" />
                      {file.name}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger id="subject">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Math">Math</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Georgian">Georgian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Algebra, Grammar, etc."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={uploading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                  <Input
                    id="source"
                    placeholder="e.g., Ministry of Education"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    disabled={uploading}
                  />
                </div>
              </div>

              {/* Upload Button */}
              <Button onClick={handleUpload} disabled={uploading || !file} className="w-full sm:w-auto gap-2" size="lg">
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing document...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload Document
                  </>
                )}
              </Button>

              {uploading && (
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription>
                    Processing document: extracting text, creating chunks, and generating embeddings. This may take a
                    few moments...
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Documents List */}
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Documents</CardTitle>
              <CardDescription>All curriculum materials available for question generation</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No documents uploaded yet</p>
                  <p className="text-sm mt-1">Upload your first curriculum document to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors gap-3"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="mt-1">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{doc.filename}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge variant="secondary">{doc.subject}</Badge>
                            <Badge variant="outline">{doc.topic}</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground sm:pl-4">
                        <div className="flex items-center gap-1">
                          <Database className="h-4 w-4" />
                          <span>{doc.total_chunks} chunks</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(doc.upload_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Box */}
          <Alert className="bg-accent/50 border-accent">
            <FileText className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold mb-2">How document processing works:</p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Documents are split into manageable chunks (approximately 500 characters each)</li>
                <li>Each chunk is analyzed and embedded for semantic search</li>
                <li>The AI uses these chunks to generate contextually relevant questions</li>
                <li>Questions include source references for transparency and trust</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
