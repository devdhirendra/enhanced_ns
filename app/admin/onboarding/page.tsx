"use client"

import { useEffect, useMemo, useState } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Check, X, FileText, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"

type OnboardingRow = {
  onboard_id: string
  userId: string
  profileName?: string
  processStatus: string
  verify?: string
  createdAt: string
  updatedAt: string
  doc?: string[]
}

const ITEMS_PER_PAGE = 10

export default function AdminOnboardingPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [rows, setRows] = useState<OnboardingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<string>("all")
  const [selected, setSelected] = useState<any | null>(null)
  const [open, setOpen] = useState(false)
  const [sortBy, setSortBy] = useState<"createdAt" | "status">("createdAt")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [comment, setComment] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const data = await apiClient.getAllOnboardings()
      setRows(data as any)
      setCurrentPage(1)
    } catch (e: any) {
      toast({
        title: "Failed to load",
        description: e?.message || "Could not load onboarding records",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const toggleSort = (key: "createdAt" | "status") => {
    if (sortBy !== key) {
      setSortBy(key)
      setSortDir("asc")
    } else {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    }
  }

  const filtered = useMemo(() => {
    const base = rows.filter((r) => {
      const okSearch =
        !search ||
        r.profileName?.toLowerCase().includes(search.toLowerCase()) ||
        r.userId?.toLowerCase().includes(search.toLowerCase()) ||
        r.onboard_id?.toLowerCase().includes(search.toLowerCase())
      const okFilter = filter === "all" || r.processStatus === filter
      return okSearch && okFilter
    })
    return [...base].sort((a, b) => {
      if (sortBy === "createdAt") {
        const cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        return sortDir === "asc" ? cmp : -cmp
      } else {
        const order = ["pending", "in-progress", "approved", "rejected"]
        const cmp = order.indexOf(a.processStatus) - order.indexOf(b.processStatus)
        return sortDir === "asc" ? cmp : -cmp
      }
    })
  }, [rows, search, filter, sortBy, sortDir])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedRows = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const view = async (id: string) => {
    try {
      const rec = await apiClient.getOnboardingById(id)
      setSelected(rec)
      setComment(rec.comment || "")
      setRejectionReason(rec.rejectionReason || "")
      setOpen(true)
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Failed to load record", variant: "destructive" })
    }
  }

  const updateStatus = async (id: string, status: "approved" | "rejected" | "pending" | "in-progress") => {
    if (status === "rejected" && !rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Rejection reason is required",
        variant: "destructive",
      })
      return
    }

    setActionLoading(true)
    try {
      await apiClient.updateOnboardingStatus(id, {
        status,
        whoApproveUserId: user?.user_id,
        comment: comment.trim() || undefined,
        rejectionReason: status === "rejected" ? rejectionReason.trim() : undefined,
      })
      toast({ title: "Updated", description: `Status changed to ${status}.` })
      fetchAll()
      setOpen(false)
      setComment("")
      setRejectionReason("")
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Failed to update status", variant: "destructive" })
    } finally {
      setActionLoading(false)
    }
  }

  const LoadingSkeleton = () => (
    <TableRow>
      <TableCell colSpan={7} className="text-center py-8">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading records...
        </div>
      </TableCell>
    </TableRow>
  )

  return (
    <DashboardLayout
      title="Onboarding Review"
      description="Review documentation and approve or reject onboarding requests"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Search and filter onboarding requests</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search by name, userId, onboard_id"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="secondary" onClick={fetchAll}>
              Refresh
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Onboarding Requests</CardTitle>
            <CardDescription>
              Incoming documentation submissions awaiting verification ({filtered.length} total)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Onboard ID</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Profile</TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("status")}>
                      Status {sortBy === "status" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                    </TableHead>
                    <TableHead>Verify</TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("createdAt")}>
                      Created {sortBy === "createdAt" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <LoadingSkeleton />
                  ) : paginatedRows.length > 0 ? (
                    paginatedRows.map((r) => {
                      const isApproved = r.processStatus === "approved"
                      const isRejected = r.processStatus === "rejected"
                      return (
                        <TableRow key={r.onboard_id}>
                          <TableCell className="font-mono text-xs">{r.onboard_id}</TableCell>
                          <TableCell className="font-mono text-xs">{r.userId}</TableCell>
                          <TableCell>{r.profileName || "-"}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                isApproved
                                  ? "bg-green-100 text-green-800"
                                  : isRejected
                                    ? "bg-red-100 text-red-800"
                                    : r.processStatus === "in-progress"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {r.processStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                r.verify === "success"
                                  ? "border-green-300 text-green-700"
                                  : r.verify === "rejected"
                                    ? "border-red-300 text-red-700"
                                    : "border-yellow-300 text-yellow-700"
                              }
                            >
                              {r.verify || "pending"}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
                          <TableCell className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => view(r.onboard_id)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => updateStatus(r.onboard_id, "approved")}
                              disabled={isApproved}
                            >
                              <Check className="h-4 w-4 mr-1" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateStatus(r.onboard_id, "rejected")}
                              disabled={isRejected}
                            >
                              <X className="h-4 w-4 mr-1" /> Reject
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
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
          </CardContent>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Onboarding Details</DialogTitle>
              <DialogDescription>Review documents and update status</DialogDescription>
            </DialogHeader>
            {selected && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <strong>Onboard ID:</strong> <span className="font-mono text-xs">{selected.onboard_id}</span>
                  </div>
                  <div>
                    <strong>User ID:</strong> <span className="font-mono text-xs">{selected.userId}</span>
                  </div>
                  <div>
                    <strong>Name:</strong> {selected.profileName || "-"}
                  </div>
                  <div>
                    <strong>Status:</strong> {selected.processStatus}
                  </div>
                  <div>
                    <strong>Verify:</strong> {selected.verify || "pending"}
                  </div>
                </div>

                {selected.comment && (
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <strong className="text-sm">Admin Comment:</strong>
                    <p className="text-sm mt-1">{selected.comment}</p>
                  </div>
                )}
                {selected.rejectionReason && (
                  <div className="p-3 bg-red-50 rounded border border-red-200">
                    <strong className="text-sm">Rejection Reason:</strong>
                    <p className="text-sm mt-1">{selected.rejectionReason}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <strong>Documents</strong>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(selected.doc ?? []).length > 0 ? (
                      (selected.doc as string[]).map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded border p-2 hover:bg-accent"
                        >
                          <FileText className="h-4 w-4" />{" "}
                          <span className="truncate text-sm">{url.split("/").pop()}</span>
                        </a>
                      ))
                    ) : (
                      <div className="text-muted-foreground">No documents</div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Admin Comment (Optional)</label>
                  <Textarea
                    placeholder="Add a comment for the user..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Rejection Reason (Required if rejecting)</label>
                  <Textarea
                    placeholder="Explain why the documents are being rejected..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="min-h-20"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="secondary"
                    onClick={() => updateStatus(selected.onboard_id, "in-progress")}
                    disabled={selected.processStatus === "in-progress" || actionLoading}
                  >
                    Mark In-Progress
                  </Button>
                  <Button
                    onClick={() => updateStatus(selected.onboard_id, "approved")}
                    disabled={selected.processStatus === "approved" || actionLoading}
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => updateStatus(selected.onboard_id, "rejected")}
                    disabled={selected.processStatus === "rejected" || actionLoading}
                  >
                    {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
                    Reject
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
