"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

const uploadHistory = [
  {
    id: "UP001",
    date: "2024-01-15",
    filename: "bsnl_customers_jan2024.xlsx",
    isp: "BSNL",
    totalRecords: 150,
    imported: 145,
    skipped: 3,
    failed: 2,
    status: "completed",
    uploadedBy: "operator@example.com",
  },
  {
    id: "UP002",
    date: "2024-01-10",
    filename: "railtel_customers_dec2023.csv",
    isp: "RailTel",
    totalRecords: 89,
    imported: 89,
    skipped: 0,
    failed: 0,
    status: "completed",
    uploadedBy: "operator@example.com",
  },
]

export default function BulkUploadPage() {
  const [selectedISP, setSelectedISP] = useState("")
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResults, setUploadResults] = useState<any>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadFile(file)
    }
  }

  const handleUpload = async () => {
    if (!uploadFile || !selectedISP) {
      toast.error("Please select ISP and upload file")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          setUploadResults({
            totalRecords: 125,
            imported: 120,
            skipped: 3,
            failed: 2,
            errors: [
              { row: 15, error: "Invalid phone number format" },
              { row: 47, error: "Missing required field: address" },
            ],
          })
          toast.success("Upload completed successfully!")
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  const downloadTemplate = () => {
    // Create a sample CSV template
    const csvContent = `Customer Name,Phone Number,Address,ISP Name,Plan Name,Status,Connection Date
Rajesh Kumar,9876543210,"123 MG Road, Delhi",BSNL,50 Mbps Fiber,Active,2024-01-15
Priya Sharma,9876543211,"456 Park Street, Mumbai",RailTel,100 Mbps Unlimited,Active,2024-01-10`

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "customer_upload_template.csv"
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success("Template downloaded successfully!")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6">
      <div className="container mx-auto max-w-3xl p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/operator/customers">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Customers
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bulk Customer Upload</h1>
            <p className="text-gray-600 mt-1">Import customers from ISP portals in bulk</p>
          </div>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upload">Upload Customers</TabsTrigger>
            <TabsTrigger value="history">Upload History</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            {/* Instructions */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Upload Instructions
                </CardTitle>
                <CardDescription>Follow these steps to upload customer data from your ISP portal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Download customer data from your ISP portal</p>
                      <p className="text-sm text-gray-600">
                        Export data in Excel or CSV format from BSNL, RailTel, Pioneer, etc.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Download our template for reference</p>
                      <p className="text-sm text-gray-600">Ensure your data matches the required format</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Select ISP and upload your file</p>
                      <p className="text-sm text-gray-600">The system will automatically merge and tag customers</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Button onClick={downloadTemplate} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Upload Form */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Upload Customer Data</CardTitle>
                <CardDescription>Select ISP and upload your customer file</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="isp">Select ISP *</Label>
                    <Select value={selectedISP} onValueChange={setSelectedISP}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose ISP source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bsnl">BSNL</SelectItem>
                        <SelectItem value="railtel">RailTel</SelectItem>
                        <SelectItem value="pioneer">Pioneer</SelectItem>
                        <SelectItem value="excitel">Excitel</SelectItem>
                        <SelectItem value="alliance">Alliance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="file">Upload File *</Label>
                    <Input id="file" type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} />
                  </div>
                </div>

                {uploadFile && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{uploadFile.name}</p>
                        <p className="text-sm text-gray-600">Size: {(uploadFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                  </div>
                )}

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                {uploadResults && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{uploadResults.totalRecords}</div>
                        <div className="text-sm text-gray-600">Total Records</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{uploadResults.imported}</div>
                        <div className="text-sm text-gray-600">Imported</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{uploadResults.skipped}</div>
                        <div className="text-sm text-gray-600">Skipped</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{uploadResults.failed}</div>
                        <div className="text-sm text-gray-600">Failed</div>
                      </div>
                    </div>

                    {uploadResults.errors && uploadResults.errors.length > 0 && (
                      <div className="border border-red-200 rounded-lg p-4">
                        <h4 className="font-medium text-red-800 mb-2">Errors Found:</h4>
                        <div className="space-y-1">
                          {uploadResults.errors.map((error: any, index: number) => (
                            <div key={index} className="text-sm text-red-600">
                              Row {error.row}: {error.error}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    onClick={handleUpload}
                    disabled={!uploadFile || !selectedISP || isUploading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Customers
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Upload History</CardTitle>
                <CardDescription>View past customer upload records and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Upload ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Filename</TableHead>
                        <TableHead>ISP</TableHead>
                        <TableHead>Records</TableHead>
                        <TableHead>Results</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uploadHistory.map((upload) => (
                        <TableRow key={upload.id}>
                          <TableCell className="font-medium">{upload.id}</TableCell>
                          <TableCell>{upload.date}</TableCell>
                          <TableCell>{upload.filename}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{upload.isp}</Badge>
                          </TableCell>
                          <TableCell>{upload.totalRecords}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                {upload.imported} imported
                              </div>
                              {upload.skipped > 0 && (
                                <div className="flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3 text-yellow-600" />
                                  {upload.skipped} skipped
                                </div>
                              )}
                              {upload.failed > 0 && (
                                <div className="flex items-center gap-1">
                                  <XCircle className="h-3 w-3 text-red-600" />
                                  {upload.failed} failed
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(upload.status)}>{upload.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
