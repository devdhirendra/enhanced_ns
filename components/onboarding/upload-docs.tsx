"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { apiClient, type OnboardingDoc } from "@/lib/api"

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

  const allowedMime = new Set(["application/pdf", "image/png", "image/jpeg"])
  const maxBytes = 2 * 1024 * 1024 // 2MB

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

      // Upload files one by one to map to types
      const docs: OnboardingDoc[] = []
      for (const r of rows) {
        const f = r.file as File
        // double-check on submit as well
        if (!allowedMime.has(f.type) || f.size > maxBytes) {
          throw new Error("One or more files are invalid (type/size)")
        }
        const { fileUrl } = await apiClient.uploadOnboardingFile(f)
        docs.push({ type: r.type, url: fileUrl })
      }

      await apiClient.createOnboarding({ userId: user.user_id, doc: docs })
      toast({ title: "Submitted", description: "Documents uploaded for verification." })
      setRows([{ type: "" }])
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

  return (
    <DashboardLayout title="Onboarding" description="Upload your documents for verification">
      <Card>
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
              {submitting ? "Submitting..." : "Submit for Review"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}

export default UploadDocs
