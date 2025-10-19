"use client"

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { onboardingApi, type OnboardingRecord, type OnboardingDoc } from "@/lib/onboarding-api"
import { FileText, Loader2, Trash2, Plus, Filter, ArrowUpDown, Calendar, Upload, Shield, CheckCircle, AlertCircle } from "lucide-react"

type Row = { type: string; file?: File }
type Preset = string[]

// Helper type for normalized documents
type NormalizedDoc = {
  type: string
  url?: string
  status: "pending" | "approved" | "rejected" | "deleted"
  submittedAt: string
  comment?: string
  originalIndex: number
}

export function UploadDocs({
  title,
  description,
  presets = [],
}: {
  title: string
  description: string
  presets?: Preset
}) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [rows, setRows] = useState<Row[]>([{ type: "" }])
  const [submitting, setSubmitting] = useState(false)
  const [onboardingRecords, setOnboardingRecords] = useState<OnboardingRecord[]>([])
  const [loadingRecord, setLoadingRecord] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<"submittedAt" | "type">("submittedAt")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [deletingDocIndex, setDeletingDocIndex] = useState<{ recordId: string; docIndex: number } | null>(null)
  const itemsPerPage = 10

  const allowedMime = new Set(["application/pdf", "image/png", "image/jpeg"])
  const maxBytes = 2 * 1024 * 1024 // 2MB

  // Fetch ALL user's onboarding records (not just latest)
  useEffect(() => {
    if (!user?.user_id) return
    
    const fetchRecords = async () => {
      setLoadingRecord(true)
      try {
        const response = await onboardingApi.getOnboardingsByUserId(user.user_id)
        console.log("Fetched ALL onboarding records:", response)
        
        if (response.data && response.data.length > 0) {
          // Show ALL records, not just the latest
          const allRecords = response.data
          setOnboardingRecords(allRecords)
          setCurrentPage(1)
        }
      } catch (e: any) {
        console.error("Failed to fetch onboarding records:", e)
        if (!e.message?.includes("No onboarding records") && !e.message?.includes("404")) {
          toast({
            title: "Failed to load records",
            description: "Unable to fetch your submission history",
            variant: "destructive",
          })
        }
      } finally {
        setLoadingRecord(false)
      }
    }
    fetchRecords()
  }, [user?.user_id, toast])

  // Form management functions
  const addRow = () => setRows((r) => [...r, { type: "" }])
  
  const removeRow = (i: number) => {
    if (rows.length > 1) {
      setRows((r) => r.filter((_, idx) => idx !== i))
    }
  }

  const setType = (i: number, type: string) => {
    const next = [...rows]
    next[i].type = type.trim()
    setRows(next)
  }

  const setFile = (i: number, file?: File) => {
    if (!file) {
      const next = [...rows]
      next[i].file = undefined
      setRows(next)
      return
    }

    if (!allowedMime.has(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only PDF, PNG, or JPG files are allowed.",
        variant: "destructive",
      })
      return
    }

    if (file.size > maxBytes) {
      toast({
        title: "File too large",
        description: "Each file must be 2MB or less.",
        variant: "destructive",
      })
      return
    }

    const next = [...rows]
    next[i].file = file
    setRows(next)
  }

  const quickAdd = (presetType: string) => {
    setRows((r) => {
      if (r.some((row) => row.type.toLowerCase() === presetType.toLowerCase())) {
        return r
      }
      return [...r, { type: presetType }]
    })
  }

  const clearForm = () => {
    setRows([{ type: "" }])
  }

  // Submit documents for onboarding
  const submit = async () => {
    if (!user?.user_id) {
      toast({ 
        title: "Not authenticated", 
        description: "Please login again.", 
        variant: "destructive" 
      })
      return
    }
    
    const invalidRows = rows.filter(r => !r.type.trim() || !r.file)
    if (invalidRows.length > 0) {
      toast({
        title: "Missing fields",
        description: "Each row requires a document type and file.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      const docData: Array<{ type: string; file: string }> = []
      
      for (const r of rows) {
        const file = r.file as File
        
        if (!allowedMime.has(file.type) || file.size > maxBytes) {
          throw new Error(`File "${r.type}" is invalid (type/size)`)
        }

        const { fileUrl } = await onboardingApi.uploadFile(file)
        docData.push({ 
          type: r.type.trim(), 
          file: fileUrl 
        })
      }

      const response = await onboardingApi.createOnboarding({ 
        userId: user.user_id, 
        doc: docData 
      })
      
      toast({ 
        title: "Documents Submitted", 
        description: `${docData.length} document(s) uploaded for verification.` 
      })
      
      clearForm()

      // Refresh ALL records
      const recordsResponse = await onboardingApi.getOnboardingsByUserId(user.user_id)
      if (recordsResponse.data && recordsResponse.data.length > 0) {
        setOnboardingRecords(recordsResponse.data)
      }
      setCurrentPage(1)
      
    } catch (e: any) {
      console.error("Submission error:", e)
      toast({
        title: "Submission failed",
        description: e?.message || "Unable to submit documents right now. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Delete a specific document - FIXED
  const handleDeleteDocument = async (recordId: string, docIndex: number) => {
    console.log("Deleting document:", { recordId, docIndex })

    setDeletingDocIndex({ recordId, docIndex })
    try {
      const response = await onboardingApi.deleteDocument(recordId, docIndex)
      console.log("Delete response:", response)
      
      toast({ 
        title: "Document Removed", 
        description: "Document has been removed from your submission." 
      })

      // Refresh ALL records
      const recordsResponse = await onboardingApi.getOnboardingsByUserId(user!.user_id)
      if (recordsResponse.data && recordsResponse.data.length > 0) {
        setOnboardingRecords(recordsResponse.data)
      }
      setCurrentPage(1)
    } catch (e: any) {
      console.error("Delete error details:", e)
      toast({
        title: "Delete failed",
        description: e?.message || "Unable to delete document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingDocIndex(null)
    }
  }

  // Utility functions
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "deleted":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-3 w-3 mr-1" />
      case "rejected":
        return <AlertCircle className="h-3 w-3 mr-1" />
      default:
        return <Shield className="h-3 w-3 mr-1" />
    }
  }

  // FIXED: Get ALL documents from ALL records with proper indexing
  const getAllNormalizedDocs = (): NormalizedDoc[] => {
    if (onboardingRecords.length === 0) {
      console.log("No records found")
      return []
    }

    const allDocs: NormalizedDoc[] = []

    onboardingRecords.forEach((record, recordIndex) => {
      if (!record.doc || record.doc.length === 0) return

      record.doc.forEach((docItem, docIndex) => {
        // Case 1: String format (legacy)
        if (typeof docItem === 'string') {
          allDocs.push({
            type: `Document ${docIndex + 1}`,
            url: docItem,
            status: (record.processStatus as "pending" | "approved" | "rejected" | "deleted") || 'pending',
            submittedAt: record.createdAt,
            comment: record.comment, // Use record-level comment
            originalIndex: docIndex
          })
          return
        }
        
        // Case 2: Object format
        if (docItem && typeof docItem === 'object') {
          const fileUrl = docItem.file || docItem.url
          
          allDocs.push({
            type: docItem.type || `Document ${docIndex + 1}`,
            url: fileUrl,
            status: (docItem.status || record.processStatus as "pending" | "approved" | "rejected" | "deleted") || 'pending',
            submittedAt: docItem.submittedAt || record.createdAt,
            comment: docItem.comment || record.comment, // Use document-level comment first, then record-level
            originalIndex: docIndex
          })
          return
        }
      })
    })

    console.log("All normalized documents:", allDocs)
    return allDocs
  }

  // Pagination and filtering for ALL documents
  const getFilteredAndSortedDocs = (): NormalizedDoc[] => {
    const allDocs = getAllNormalizedDocs()
    console.log("Filtering and sorting ALL docs:", allDocs)
    
    if (allDocs.length === 0) return []

    let filtered = [...allDocs]
    
    if (filterStatus !== "all") {
      filtered = filtered.filter((doc) => doc.status === filterStatus)
    }

    const sorted = filtered.sort((a, b) => {
      if (sortBy === "submittedAt") {
        const aDate = new Date(a.submittedAt).getTime()
        const bDate = new Date(b.submittedAt).getTime()
        return sortDir === "asc" ? aDate - bDate : bDate - aDate
      } else {
        const aType = a.type?.toLowerCase() || ""
        const bType = b.type?.toLowerCase() || ""
        return sortDir === "asc" 
          ? aType.localeCompare(bType)
          : bType.localeCompare(aType)
      }
    })

    return sorted
  }

  const getPaginatedDocs = (): NormalizedDoc[] => {
    const sortedDocs = getFilteredAndSortedDocs()
    const startIdx = (currentPage - 1) * itemsPerPage
    const endIdx = startIdx + itemsPerPage
    return sortedDocs.slice(startIdx, endIdx)
  }

  const getTotalPages = (): number => {
    const sortedDocs = getFilteredAndSortedDocs()
    return Math.ceil(sortedDocs.length / itemsPerPage)
  }

  // Find the record ID for a document
  const findRecordIdForDoc = (doc: NormalizedDoc): string => {
    const record = onboardingRecords.find(record => 
      record.doc.some((docItem, index) => {
        if (typeof docItem === 'string') {
          return docItem === doc.url && index === doc.originalIndex
        } else {
          const fileUrl = docItem.file || docItem.url
          return fileUrl === doc.url && index === doc.originalIndex
        }
      })
    )
    return record?.onboard_id || ""
  }

  const totalPages = getTotalPages()
  const totalDocs = getAllNormalizedDocs().length
  const filteredDocs = getFilteredAndSortedDocs()

  console.log("Rendering with:", {
    totalRecords: onboardingRecords.length,
    totalDocs,
    filteredDocs: filteredDocs.length,
    currentPage,
    totalPages
  })

  return (
    <DashboardLayout title="Document Onboarding" description="Upload and manage your verification documents">
{/* Upload Form Card - CLEAN PROFESSIONAL DESIGN */}
<Card className="mb-8 border shadow-sm">
  <CardHeader className="pb-6 pt-6 px-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2.5 bg-gray-100 rounded-lg">
        <Upload className="h-6 w-6 text-gray-700" />
      </div>
      <div className="flex-1">
        <CardTitle className="text-xl font-semibold text-gray-900">{title}</CardTitle>
        <CardDescription className="text-sm text-gray-600 mt-1">
          {description}
        </CardDescription>
      </div>
    </div>
    
    {/* Requirements
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-700">
            PDF, PNG, JPG • Max 2MB • Clear documents • All fields required
          </p>
        </div>
      </div>
    </div> */}

    {/* Quick Add */}
    {presets.length > 0 && (
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-700 mb-2.5">Quick Add</p>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => quickAdd(preset)}
              className="transition-all hover:scale-105 active:scale-95"
              aria-label={`Add ${preset}`}
            >
              <Badge 
                variant="secondary" 
                className="cursor-pointer capitalize font-normal bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors px-3 py-1.5 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                {preset.replaceAll("_", " ")}
              </Badge>
            </button>
          ))}
        </div>
      </div>
    )}
  </CardHeader>
  
  <CardContent className="space-y-4 px-6 pb-6">
    {/* Document Rows */}
    {rows.map((row, index) => (
      <div 
        key={index} 
        className="relative rounded-lg border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm transition-all p-5"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Number Badge */}
          <div className="absolute -top-2.5 -left-2.5 w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center text-white font-semibold text-xs shadow">
            {index + 1}
          </div>

          <div className="lg:col-span-4">
            <Label htmlFor={`type-${index}`} className="text-xs font-semibold text-gray-700 mb-2 block">
              Document Type *
            </Label>
            <Input
              id={`type-${index}`}
              placeholder="e.g., License"
              value={row.type}
              onChange={(e) => setType(index, e.target.value)}
              className="h-10 bg-white border border-gray-300 focus:border-gray-900 transition-all rounded-md text-sm"
            />
          </div>
          
          <div className="lg:col-span-5">
            <Label htmlFor={`file-${index}`} className="text-xs font-semibold text-gray-700 mb-2 block">
              Upload Document *
            </Label>
            <div className="space-y-2.5">
              <Input
                id={`file-${index}`}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setFile(index, e.currentTarget.files?.[0])}
                className="h-10 bg-white border border-gray-300 focus:border-gray-900 transition-all rounded-md text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-gray-900 file:text-white hover:file:bg-gray-800 file:transition-colors cursor-pointer"
              />
              {row.file && (
                <div className="flex items-center gap-2.5 text-xs bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                  <CheckCircle className="h-3.5 w-3.5 text-gray-600 flex-shrink-0" />
                  <span className="truncate flex-1 text-gray-700 font-medium">{row.file.name}</span>
                  <span className="text-gray-600 font-medium whitespace-nowrap">
                    {(row.file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-3 flex gap-2 py-5">
            <Button 
              type="button" 
              variant="outline" 
              onClick={addRow}
              className="flex-1 h-10 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors rounded-md text-xs font-medium"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add
            </Button>
            {rows.length > 1 && (
              <Button 
                type="button"
                variant="outline" 
                onClick={() => removeRow(index)}
                className="flex-1 h-10 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors rounded-md text-xs font-medium"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>
    ))}
    
    {/* Action Buttons */}
    <div className="flex flex-col sm:flex-row gap-3 pt-4">
      <Button 
        onClick={submit} 
        disabled={submitting}
        className="sm:flex-1 h-11 bg-gray-900 hover:bg-gray-800 text-white shadow-sm transition-colors rounded-md font-medium text-sm disabled:opacity-50"
        size="lg"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Submit Documents
          </>
        )}
      </Button>
      <Button 
        type="button"
        variant="outline" 
        onClick={clearForm}
        disabled={submitting}
        className="h-11 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors rounded-md font-medium text-sm"
      >
        <Trash2 className="h-3.5 w-3.5 mr-2" />
        Clear All
      </Button>
    </div>
  </CardContent>
</Card>

      {/* Loading State */}
      {loadingRecord && (
        <Card className="mb-6">
          <CardContent className="py-8 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading your submission history...</span>
          </CardContent>
        </Card>
      )}

      {/* Document History - Show ALL Records */}
      {onboardingRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Submission History ({onboardingRecords.length} submissions)
            </CardTitle>
            <CardDescription>
              View all your document submissions across all submissions and their verification status
              {totalDocs > 0 && ` - ${totalDocs} total document(s) submitted`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters and Controls */}
            {totalDocs > 0 && (
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Filter:</span>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    <Button
                      variant={filterStatus === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setFilterStatus("all")
                        setCurrentPage(1)
                      }}
                    >
                      All ({totalDocs})
                    </Button>
                    <Button
                      variant={filterStatus === "pending" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setFilterStatus("pending")
                        setCurrentPage(1)
                      }}
                    >
                      Pending
                    </Button>
                    <Button
                      variant={filterStatus === "approved" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setFilterStatus("approved")
                        setCurrentPage(1)
                      }}
                    >
                      Approved
                    </Button>
                    <Button
                      variant={filterStatus === "rejected" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setFilterStatus("rejected")
                        setCurrentPage(1)
                      }}
                    >
                      Rejected
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
                  >
                    <ArrowUpDown className="h-4 w-4 mr-1" />
                    Sort {sortDir === "asc" ? "↑" : "↓"}
                  </Button>
                </div>
              </div>
            )}

            {/* Documents Table */}
            {totalDocs > 0 ? (
              <>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-3 font-semibold text-gray-700">Document Type</th>
                        <th className="text-left p-3 font-semibold text-gray-700">File</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Status</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Verification</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Submitted</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Admin Comment</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPaginatedDocs().map((doc, index) => {
                        const recordId = findRecordIdForDoc(doc)
                        const url = doc.url || ""
                        const filename = url ? url.split("/").pop() || "Document" : "Document"
                        const docType = doc.type || "Document"
                        const docStatus = doc.status || "pending"
                        const docComment = doc.comment || ""

                        const isDeleting = deletingDocIndex?.recordId === recordId && 
                                          deletingDocIndex?.docIndex === doc.originalIndex

                        return (
                          <tr key={`${recordId}-${doc.originalIndex}-${index}`} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="p-3 font-medium capitalize">
                              {docType.replaceAll("_", " ")}
                            </td>
                            <td className="p-3">
                              {url ? (
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  <FileText className="h-4 w-4 flex-shrink-0" />
                                  <span className="truncate max-w-[200px]">{filename}</span>
                                </a>
                              ) : (
                                <span className="text-gray-400 italic">No file</span>
                              )}
                            </td>
                            <td className="p-3">
                              <Badge className={`${getStatusColor(docStatus)} border flex items-center w-fit`}>
                                {getStatusIcon(docStatus)}
                                {docStatus}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <Badge variant="outline" className="border-yellow-300 text-yellow-700 bg-yellow-50">
                                pending
                              </Badge>
                            </td>
                            <td className="p-3 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(doc.submittedAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            </td>
                            <td className="p-3 max-w-[200px]">
                              {docComment ? (
                                <div 
                                  className="text-xs text-gray-700 truncate" 
                                  title={docComment}
                                >
                                  {docComment}
                                </div>
                              ) : (
                                <span className="text-gray-400 italic text-xs">—</span>
                              )}
                            </td>
                            <td className="p-3">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteDocument(recordId, doc.originalIndex)}
                                disabled={isDeleting}
                                className="w-9 h-9 p-0"
                              >
                                {isDeleting ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                      {Math.min(currentPage * itemsPerPage, filteredDocs.length)} of{' '}
                      {filteredDocs.length} document(s)
                    </p>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="py-12 text-center border rounded-lg bg-gray-50">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">No documents submitted yet</p>
                <p className="text-sm text-gray-500">
                  Use the form above to upload your documents for verification
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  )
}

export default UploadDocs