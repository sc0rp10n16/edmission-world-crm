// components/leads/leads-upload.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { 
  Upload, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2,
  Download 
} from "lucide-react"
import { useDropzone } from "react-dropzone"
import Papa from 'papaparse'
import { toast } from "sonner"

interface PreviewData {
  date: string
  name: string
  phone: string
  interestedCountry: string
  status: string
  email: string
}

interface LeadsUploadProps {
  onUploadComplete: () => void
}

export function LeadsUpload({ onUploadComplete }: LeadsUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [previewData, setPreviewData] = useState<PreviewData[]>([])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0]
      if (!file) return

      setUploading(true)
      setProgress(0)

      try {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: async (results) => {
            try {
              // Map CSV data to our format
              const mappedData = results.data.map((row: any) => ({
                date: row['Date'] || '',
                name: row['Namw'] || '', // Handle the typo in CSV
                phone: row['Number'] || '',
                interestedCountry: row['Interested Country'] || '',
                status: row['Status'] || 'NEW',
                email: row['mail id'] || '',
                followUpBy: row['Follow up by'] || '',
                followUp1: row['Follow up 1'] || '',
                followUp2: row['Follow Up 2'] || '',
                followUp3: row['Follow Up 3'] || '',
                followUp4: row['Follow up 4'] || '',
                feedback: row['Feedback'] || ''
              }))

              // Set preview data
              setPreviewData(mappedData.slice(0, 5))
              setProgress(50)

              // Upload to server
              const response = await fetch('/api/leads/upload', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ leads: mappedData }),
              })

              if (!response.ok) {
                throw new Error('Failed to upload leads')
              }

              setProgress(100)
              toast.success(`Successfully uploaded ${mappedData.length} leads`)
              onUploadComplete()

            } catch (error) {
              console.error('Upload error:', error)
              toast.error('Failed to upload leads')
            }
          },
          error: (error) => {
            console.error('Parse error:', error)
            toast.error('Failed to parse CSV file')
          }
        })
      } catch (error) {
        console.error('File reading error:', error)
        toast.error('Failed to read file')
      } finally {
        setUploading(false)
      }
    }
  })

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between">
            <span>Upload Leads</span>
            <Button variant="outline" size="sm" asChild>
              <a href="/sample-leads-template.csv" download>
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </a>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors
              ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-200'}
            `}
          >
            <input {...getInputProps()} />
            <FileSpreadsheet className="h-10 w-10 mx-auto mb-4 text-gray-400" />
            {isDragActive ? (
              <p>Drop the CSV file here</p>
            ) : (
              <div className="space-y-2">
                <p>Drag & drop a CSV file here, or click to select</p>
                <p className="text-sm text-muted-foreground">
                  Make sure your CSV matches the template format
                </p>
              </div>
            )}
          </div>

          {uploading && (
            <div className="mt-4 space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {progress === 100 ? 'Processing complete' : 'Processing file...'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Section */}
      {previewData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Data Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Phone
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Country
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Email
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.map((row, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">{row.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{row.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{row.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{row.interestedCountry}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{row.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}