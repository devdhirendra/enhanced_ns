"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye, Clock, AlertTriangle, CheckCircle, Headphones, RefreshCw, Loader2 } from "lucide-react"
import { complaintApi } from "@/lib/complaint-api"
import { useToast } from "@/hooks/use-toast"

interface Complaint {
  complaint_id: string
  description: string
  type: string
  priority: string
  status: string
  createdAt: string
  updatedAt: string
  technicianNotes?: string
}

export default function VendorComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [sortBy, setSortBy] = useState("created")
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const { toast } = useToast()
  const itemsPerPage = 10

  const fetchComplaintsData = async () => {
    try {
      setLoading(true)
      console.log("[v0] Fetching complaints from API...")

      const complaintsData = await complaintApi.getAllComplaints()
      console.log("[v0] Complaints fetched:", complaintsData)

      const complaintsArray = Array.isArray(complaintsData?.data)
        ? complaintsData.data
        : Array.isArray(complaintsData)
          ? complaintsData
          : []

      setComplaints(complaintsArray)

      toast({
        title: "Data Loaded",
        description: "Complaints data loaded successfully!",
      })
    } catch (error) {
      console.error("[v0] Error fetching complaints data:", error)
      toast({
        title: "Error Loading Data",
        description: "Failed to load complaints data. Please try again.",
        variant: "destructive",
      })
      setComplaints([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComplaintsData()
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
      case "in-progress":
        return "bg-orange-100 text-orange-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "escalated":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredComplaints = complaints
    .filter((complaint: Complaint) => {
      const matchesSearch =
        complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.complaint_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.type.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || complaint.status === statusFilter
      const matchesPriority = priorityFilter === "all" || complaint.priority === priorityFilter
      return matchesSearch && matchesStatus && matchesPriority
    })
    .sort((a: Complaint, b: Complaint) => {
      switch (sortBy) {
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "updated":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case "priority":
          const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 }
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
        default:
          return 0
      }
    })

  const paginatedComplaints = filteredComplaints.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage)

  const complaintStats = {
    total: complaints.length,
    open: complaints.filter((c: Complaint) => c.status === "open").length,
    inProgress: complaints.filter((c: Complaint) => c.status === "in_progress" || c.status === "in-progress").length,
    resolved: complaints.filter((c: Complaint) => c.status === "resolved").length,
  }

  return (
    <DashboardLayout title="Complaints & Returns" description="Track complaints related to your products and services">
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={fetchComplaintsData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span className="text-gray-600">Loading complaints data...</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Complaints</CardTitle>
              <Headphones className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{complaintStats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Open</CardTitle>
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{complaintStats.open}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
              <Clock className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{complaintStats.inProgress}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Resolved</CardTitle>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{complaintStats.resolved}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Complaints List ({filteredComplaints.length})</CardTitle>
            <CardDescription>View all complaints related to your products and services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search complaints..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created">Created Date</SelectItem>
                  <SelectItem value="updated">Updated Date</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Complaint ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedComplaints.map((complaint: Complaint) => (
                    <TableRow key={complaint.complaint_id}>
                      <TableCell className="font-medium">{complaint.complaint_id}</TableCell>
                      <TableCell className="max-w-xs truncate">{complaint.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {complaint.type.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(complaint.priority)}>{complaint.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(complaint.status)}>{complaint.status.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{new Date(complaint.createdAt).toLocaleDateString()}</div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedComplaint(complaint)
                            setIsDetailsDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredComplaints.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                        No complaints found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
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

        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Complaint Details - {selectedComplaint?.complaint_id}</DialogTitle>
              <DialogDescription>Complete information about the complaint</DialogDescription>
            </DialogHeader>
            {selectedComplaint && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Complaint Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Type:</span> {selectedComplaint.type.replace("_", " ")}
                      </div>
                      <div>
                        <span className="font-medium">Priority:</span>{" "}
                        <Badge className={getPriorityColor(selectedComplaint.priority)}>
                          {selectedComplaint.priority}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>{" "}
                        <Badge className={getStatusColor(selectedComplaint.status)}>
                          {selectedComplaint.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Timeline</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Created:</span>{" "}
                        {new Date(selectedComplaint.createdAt).toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Last Updated:</span>{" "}
                        {new Date(selectedComplaint.updatedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedComplaint.description}</p>
                </div>
                {selectedComplaint.technicianNotes && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Technician Notes</h4>
                    <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg">
                      {selectedComplaint.technicianNotes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
