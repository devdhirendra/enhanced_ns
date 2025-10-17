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
import { apiClient } from "@/lib/api"
import { FileText, Loader2 } from "lucide-react"

type Row = { type: string; file?: File }
type Preset = string[]

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
  const [onboardingRecord, setOnboardingRecord] = useState<any | null>(null)
  const [loadingRecord, setLoadingRecord] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const allowedMime = new Set(["application/pdf", "image/png", "image/jpeg"])
  const maxBytes = 2 * 1024 * 1024 // 2MB

  useEffect(() => {
    if (!user?.user_id) return
    const fetchRecord = async () => {
      setLoadingRecord(true)
      try {
        const records = await apiClient.getAllOnboardings()
        const userRecords = records.filter((r: any) => r.userId === user.user_id)
        if (userRecords.length > 0) {
          // Use the most recent record
          const latestRecord = userRecords.sort(
            (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )[0]
          setOnboardingRecord(latestRecord)
          setCurrentPage(1)
        }
      } catch (e: any) {
        console.error("Failed to fetch onboarding record:", e)
      } finally {
        setLoadingRecord(false)
      }
    }
    fetchRecord()
  }, [user?.user_id])

  const addRow = () => setRows((r) => [...r, { type: "" }])
  const removeRow = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i))

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
    // avoid duplicates, add empty file placeholder
    setRows((r) => {
      if (r.some((row) => row.type.toLowerCase() === presetType.toLowerCase())) return r
      return [...r, { type: presetType }]
    })
  }

  const submit = async () => {
    if (!user?.user_id) {
      toast({ title: "Not authenticated", description: "Please login again.", variant: "destructive" })
      return
    }
    const invalid = rows.some((r) => !r.type || !r.file)
    if (invalid) {
      toast({
        title: "Missing fields",
        description: "Each row requires a document type and file.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      const docUrls: string[] = []
      for (const r of rows) {
        const f = r.file as File
        if (!allowedMime.has(f.type) || f.size > maxBytes) {
          throw new Error("One or more files are invalid (type/size)")
        }
        const { fileUrl } = await apiClient.uploadOnboardingFile(f)
        docUrls.push(fileUrl)
      }

      await apiClient.createOnboarding({ userId: user.user_id, doc: docUrls })
      toast({ title: "Submitted", description: "Documents uploaded for verification." })
      setRows([{ type: "" }])

      const records = await apiClient.getAllOnboardings()
      const userRecords = records.filter((r: any) => r.userId === user.user_id)
      if (userRecords.length > 0) {
        const latestRecord = userRecords.sort(
          (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0]
        setOnboardingRecord(latestRecord)
        setCurrentPage(1)
      }
    } catch (e: any) {
      toast({
        title: "Submission failed",
        description: e?.message || "Unable to submit documents right now.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const getPaginatedDocs = () => {
    if (!onboardingRecord?.doc || onboardingRecord.doc.length === 0) return []
    const startIdx = (currentPage - 1) * itemsPerPage
    const endIdx = startIdx + itemsPerPage
    return onboardingRecord.doc.slice(startIdx, endIdx)
  }

  const totalPages = onboardingRecord?.doc ? Math.ceil(onboardingRecord.doc.length / itemsPerPage) : 0

  return (
    <DashboardLayout title="Onboarding" description="Upload your documents for verification">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-pretty">{title}</CardTitle>
          <CardDescription className="text-pretty">
            {description} Accepted types: PDF, PNG, JPG. Max size: 2MB per file.
          </CardDescription>
          {presets.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => quickAdd(p)}
                  className="inline-flex items-center"
                  aria-label={`Add ${p}`}
                >
                  <Badge variant="secondary" className="cursor-pointer capitalize">
                    + {p.replaceAll("_", " ")}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <Label htmlFor={`type-${i}`}>Document Type</Label>
                <Input
                  id={`type-${i}`}
                  placeholder="e.g. gst_certificate, company_pan, id_proof"
                  value={row.type}
                  onChange={(e) => setType(i, e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`file-${i}`}>File (PDF/PNG/JPG, ≤ 2MB)</Label>
                <Input
                  id={`file-${i}`}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setFile(i, e.currentTarget.files?.[0])}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={addRow}>
                  Add
                </Button>
                {rows.length > 1 && (
                  <Button variant="destructive" onClick={() => removeRow(i)}>
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ))}
          <div className="pt-2">
            <Button onClick={submit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit for Review"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loadingRecord && (
        <Card className="mb-6">
          <CardContent className="py-8 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading submission status...</span>
          </CardContent>
        </Card>
      )}

      {onboardingRecord && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status History</CardTitle>
            <CardDescription>View all your document submissions and their verification status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {onboardingRecord.comment && (
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-xs font-semibold text-blue-900">Admin Comment:</p>
                <p className="text-sm mt-1">{onboardingRecord.comment}</p>
              </div>
            )}

            {onboardingRecord.rejectionReason && (
              <div className="p-3 bg-red-50 rounded border border-red-200">
                <p className="text-xs font-semibold text-red-900">Rejection Reason:</p>
                <p className="text-sm mt-1">{onboardingRecord.rejectionReason}</p>
              </div>
            )}

            {onboardingRecord.doc && onboardingRecord.doc.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gray-300 bg-gray-100">
                        <th className="text-left p-3 font-semibold text-gray-700">Doc Type</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Document</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Status</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Verification</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Submitted</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Comment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPaginatedDocs().map((item: any, i: number) => {
                        const url = typeof item === "string" ? item : item?.url
                        const docType = typeof item === "string" ? "Document" : item?.type || "Document"
                        const filename = url ? url.split("/").pop() || "Document" : "Document"
                        return (
                          <tr key={i} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                            <td className="p-3 capitalize font-medium">{docType.replaceAll("_", " ")}</td>
                            <td className="p-3">
                              <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                <FileText className="h-4 w-4" />
                                <span className="truncate max-w-xs">{filename}</span>
                              </a>
                            </td>
                            <td className="p-3">
                              <Badge className={getStatusColor(onboardingRecord.processStatus)}>
                                {onboardingRecord.processStatus}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <Badge variant="outline">{onboardingRecord.verify || "pending"}</Badge>
                            </td>
                            <td className="p-3 text-xs">{new Date(onboardingRecord.createdAt).toLocaleDateString()}</td>
                            <td className="p-3 text-xs max-w-xs">
                              {onboardingRecord.comment ? (
                                <span className="text-gray-700">{onboardingRecord.comment}</span>
                              ) : (
                                <span className="text-gray-400 italic">—</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                      {Math.min(currentPage * itemsPerPage, onboardingRecord.doc.length)} of{" "}
                      {onboardingRecord.doc.length} documents
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
              <div className="py-8 text-center">
                <p className="text-muted-foreground">No documents submitted yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  )
}

export default UploadDocs
