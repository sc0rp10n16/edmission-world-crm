// app/dashboard/manager/leads/upload/page.tsx
'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { 
  Upload, 
  FileSpreadsheet, 
  X, 
  Download,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"
import { useDropzone } from 'react-dropzone'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface Telecaller {
  id: string
  name: string
  activeLeads: number
}

interface UploadHistory {
  id: string
  fileName: string
  status: string
  uploadedAt: string
  assignedTo: {
    name: string
  }
}

export default function UploadLeadsPage() {
  const [telecallers, setTelecallers] = useState<Telecaller[]>([])
  const [selectedTelecaller, setSelectedTelecaller] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadHistory, setUploadHistory] = useState<UploadHistory[]>([])
  const { toast } = useToast()

  const downloadTemplate = () => {
  const headers = ['Name', 'Email', 'Phone', 'Source']
  const sampleData = [
    ['John Doe', 'john@example.com', '+1234567890', 'Website'],
    ['Jane Smith', 'jane@example.com', '+1234567891', 'Referral']
  ]

  const csvContent = [
    headers.join(','),
    ...sampleData.map(row => row.join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'leads_template.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

  const onDrop = (acceptedFiles: File[]) => {
    // Filter only csv files
    const csvFiles = acceptedFiles.filter(file => 
      file.type === 'text/csv' || file.name.endsWith('.csv')
    )
    if (csvFiles.length !== acceptedFiles.length) {
      toast({
        title: "Invalid file type",
        description: "Only CSV files are allowed",
        variant: "destructive"
      })
    }
    setFiles(prev => [...prev, ...csvFiles])
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    }
  })

  useEffect(() => {
    fetchTelecallers()
    fetchUploadHistory()
  }, [])

  const fetchTelecallers = async () => {
    try {
      const response = await fetch('/api/managers/telecallers')
      if (!response.ok) throw new Error('Failed to fetch telecallers')
      const data = await response.json()
      setTelecallers(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch telecallers",
        variant: "destructive"
      })
    }
  }

  const fetchUploadHistory = async () => {
    try {
      const response = await fetch('/api/managers/leads/csv')
      if (!response.ok) throw new Error('Failed to fetch upload history')
      const data = await response.json()
      setUploadHistory(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch upload history",
        variant: "destructive"
      })
    }
  }

  const handleUpload = async () => {
    if (!selectedTelecaller || files.length === 0) {
      toast({
        title: "Error",
        description: "Please select a telecaller and at least one file",
        variant: "destructive"
      })
      return
    }

    setUploading(true)
    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('telecallerId', selectedTelecaller)

        const response = await fetch('/api/managers/leads/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) throw new Error(`Failed to upload ${file.name}`)

        const result = await response.json()
        
        if (result.errors?.length) {
          toast({
            title: "Upload completed with errors",
            description: `${result.imported} leads imported. ${result.errors.length} errors found.`,
            variant: "default"
          })
        } else {
          toast({
            title: "Success",
            description: `${result.imported} leads imported successfully`,
          })
        }
      }

      // Reset form and refresh history
      setFiles([])
      setSelectedTelecaller("")
      fetchUploadHistory()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload leads",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  const downloadCSV = async (id: string, fileName: string) => {
    try {
      const response = await fetch(`/api/managers/leads/csv/${id}`)
      if (!response.ok) throw new Error('Failed to download CSV')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download CSV",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-6 p-8">
      <h2 className="text-3xl font-bold tracking-tight">Upload Leads</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Lead Data</CardTitle>
            <Button 
              variant="outline" 
              onClick={downloadTemplate}
              size="sm"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              value={selectedTelecaller}
              onValueChange={setSelectedTelecaller}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a telecaller" />
              </SelectTrigger>
              <SelectContent>
                {telecallers.map((telecaller) => (
                  <SelectItem key={telecaller.id} value={telecaller.id}>
                    {telecaller.name} ({telecaller.activeLeads} active leads)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
                isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'
              }`}
            >
              <input {...getInputProps()} />
              <FileSpreadsheet className="h-10 w-10 text-gray-400 mx-auto mb-4" />
              {isDragActive ? (
                <p>Drop the CSV files here...</p>
              ) : (
                <p>Drag & drop CSV files here, or click to select files</p>
              )}
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-secondary p-2 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFiles(files.filter((_, i) => i !== index))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Button 
              onClick={handleUpload} 
              disabled={!selectedTelecaller || files.length === 0 || uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Files
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Upload History */}
        <Card>
          <CardHeader>
            <CardTitle>Upload History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploadHistory.map((upload) => (
                  <TableRow key={upload.id}>
                    <TableCell>{upload.fileName}</TableCell>
                    <TableCell>{upload.assignedTo.name}</TableCell>
                    <TableCell>
                      <Badge variant={
                        upload.status === 'PROCESSED' ? 'default' :
                        upload.status === 'PENDING' ? 'secondary' : 'destructive'
                      }>
                        {upload.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(upload.uploadedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadCSV(upload.id, upload.fileName)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}