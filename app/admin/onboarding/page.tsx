"use client"

import { useEffect, useMemo, useState } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Check, X, FileText } from "lucide-react"
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
  doc?: Array<string | { type: string; url: string }>
}

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

  const fetchAll = async () => {
    setLoading(true)
    try {
      const data = await apiClient.getAllOnboardings()
      setRows(data as any)
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

  const view = async (id: string) => {
    try {
      const rec = await apiClient.getOnboardingById(id)
      setSelected(rec)
      setOpen(true)
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Failed to load record", variant: "destructive" })
    }
  }

  const updateStatus = async (id: string, status: "approved" | "rejected" | "pending" | "in-progress") => {
    try {
      await apiClient.updateOnboardingStatus(id, {
        status,
        whoApproveUserId: user?.user_id,
      })
      toast({ title: "Updated", description: `Status changed to ${status}.` })
      fetchAll()
      if (selected?.onboard_id === id) {
        setSelected({ ...selected, processStatus: status })
      }
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Failed to update status", variant: "destructive" })
    }
  }

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
            <CardDescription>Incoming documentation submissions awaiting verification</CardDescription>
          </CardHeader>
          <CardContent>
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
                  {!loading &&
                    filtered.map((r) => {
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
                                  : r.verify === "failed"
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
                    })}
                  {!loading && filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No records
                      </TableCell>
                    </TableRow>
                  )}
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={7}>Loading...</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
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
                <div className="space-y-2">
                  <strong>Documents</strong>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(selected.doc ?? []).length > 0 ? (
                      (selected.doc as Array<string | { type: string; url: string }>).map((d, i) => {
                        const url = typeof d === "string" ? d : d?.url
                        const label =
                          typeof d === "string"
                            ? d.split("/").pop() || d
                            : d?.type || d?.url?.split("/").pop() || d?.url

                        if (!url) return null

                        return (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded border p-2 hover:bg-accent"
                          >
                            <FileText className="h-4 w-4" /> <span className="truncate">{label}</span>
                          </a>
                        )
                      })
                    ) : (
                      <div className="text-muted-foreground">No documents</div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="secondary"
                    onClick={() => updateStatus(selected.onboard_id, "in-progress")}
                    disabled={selected.processStatus === "in-progress"}
                  >
                    Mark In-Progress
                  </Button>
                  <Button
                    onClick={() => updateStatus(selected.onboard_id, "approved")}
                    disabled={selected.processStatus === "approved"}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => updateStatus(selected.onboard_id, "rejected")}
                    disabled={selected.processStatus === "rejected"}
                  >
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
