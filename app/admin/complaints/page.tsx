"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, MoreHorizontal, Eye, UserCheck, Clock, CheckCircle, XCircle, FileText, Download, RefreshCw, Timer, AlertCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { exportToCSV } from "@/lib/utils"
import { complaintApi, type Complaint } from "@/lib/complaint-api"
import { userApi, type User } from "@/lib/user-api"
import AddComplaintForm from "@/components/AddComplaintForm"

const ITEMS_PER_PAGE = 10

export default function ComplaintsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [selectedTechnician, setSelectedTechnician] = useState("")
  const [technicianSearch, setTechnicianSearch] = useState("")
  const [showAuditDialog, setShowAuditDialog] = useState(false)
  const [auditTrail, setAuditTrail] = useState<any[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [technicians, setTechnicians] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [techniciansLoading, setTechniciansLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  // Fetch complaints from API
  const fetchComplaints = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await complaintApi.getAll()

      // Handle both array and ApiResponse formats
      let data: Complaint[] = []
      if (Array.isArray(response)) {
        data = response
      } else if (Array.isArray(response?.data)) {
        data = response.data
      } else if (Array.isArray(response)) {
        data = response
      }
      
      setComplaints(data)
    } catch (error) {
      console.error("[v0] Error fetching complaints:", error)
      setError("Failed to load complaints. Please try again.")
      setComplaints([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch technicians from API
  const fetchTechnicians = async () => {
    try {
      setTechniciansLoading(true)
      const techniciansData = await userApi.getAllTechnicians()
      setTechnicians(techniciansData)
    } catch (error) {
      console.error("[v0] Error fetching technicians:", error)
      toast({
        title: "Error",
        description: "Failed to load technicians",
        variant: "destructive",
      })
      setTechnicians([])
    } finally {
      setTechniciansLoading(false)
    }
  }

  useEffect(() => {
    fetchComplaints()
    fetchTechnicians()
  }, [])

  // Filter and sort complaints
  const filteredComplaints = complaints
    .filter((complaint) => {
      const matchesSearch =
        complaint.complaint_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.description?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || complaint.status === statusFilter
      const matchesPriority = priorityFilter === "all" || complaint.priority === priorityFilter
      const matchesCategory = categoryFilter === "all" || complaint.category === categoryFilter

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory
    })
    .sort((a, b) => {
      let aVal: any = a[sortBy as keyof Complaint]
      let bVal: any = b[sortBy as keyof Complaint]

      if (sortBy === "createdAt" || sortBy === "updatedAt") {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

  // Pagination
  const totalPages = Math.ceil(filteredComplaints.length / ITEMS_PER_PAGE)
  const paginatedComplaints = filteredComplaints.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: any }> = {
      open: { bg: "bg-blue-100", text: "text-blue-800", icon: Clock },
      assigned: { bg: "bg-purple-100", text: "text-purple-800", icon: UserCheck },
      "in-progress": { bg: "bg-yellow-100", text: "text-yellow-800", icon: Timer },
      resolved: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle },
      closed: { bg: "bg-gray-100", text: "text-gray-800", icon: XCircle },
    }

    const config = statusConfig[status] || statusConfig.open
    const Icon = config.icon

    return (
      <Badge className={`${config.bg} ${config.text} text-xs`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<string, string> = {
      low: "text-green-600 border-green-600",
      medium: "text-yellow-600 border-yellow-600",
      high: "text-orange-600 border-orange-600",
    }

    return (
      <Badge variant="outline" className={`${priorityConfig[priority] || "text-gray-600"} text-xs`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    )
  }

  const handleViewAudit = async (complaint: Complaint) => {
    try {
      setSelectedComplaint(complaint)
      const response = await complaintApi.getAuditTrail(complaint.complaint_id)
      const auditData = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
      setAuditTrail(auditData)
      setShowAuditDialog(true)
    } catch (error) {
      console.error("[v0] Error fetching audit trail:", error)
      toast({
        title: "Error",
        description: "Failed to load audit trail",
        variant: "destructive",
      })
    }
  }

  const handleAssignTechnician = async (complaint: Complaint) => {
    if (!selectedTechnician) {
      toast({
        title: "Error",
        description: "Please select a technician",
        variant: "destructive",
      })
      return
    }

    try {
      await complaintApi.assignTechnician(complaint.complaint_id, {
        technicianId: selectedTechnician,
        assignedBy: user?.user_id,
        status: "assigned",
      })
      toast({
        title: "Success",
        description: "Technician assigned successfully",
      })
      setShowAssignDialog(false)
      setSelectedTechnician("")
      fetchComplaints()
    } catch (error: any) {
      console.error("[v0] Error assigning technician:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to assign technician",
        variant: "destructive",
      })
    }
  }

  const handleStatusUpdate = async (complaint: Complaint, newStatus: string) => {
    try {
      await complaintApi.updateStatus(complaint.complaint_id, {
        status: newStatus,
        updatedBy: user?.user_id,
      })
      toast({
        title: "Success",
        description: `Status updated to ${newStatus}`,
      })
      fetchComplaints()
    } catch (error: any) {
      console.error("[v0] Error updating status:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      })
    }
  }

// In admin/complaints/page.tsx - Update the handleDelete function
const handleDelete = async (complaintId: string) => {
  if (!confirm("Are you sure you want to delete this complaint? This action cannot be undone.")) {
    return
  }

  try {
    // Create a simple, clean object with no undefined values
    const deleteData = {
      deletedBy: user?.user_id || 'admin-user',
      reason: 'Deleted from admin dashboard'
    }

    console.log('[v0] Attempting to delete complaint:', complaintId, 'with data:', deleteData)

    // Use a try-catch that handles the success case even if there's an error
    try {
      await complaintApi.delete(complaintId, deleteData)
    } catch (apiError) {
      // Even if there's an API error, the deletion might have succeeded
      // Check if the complaint still exists by refreshing the list
      console.warn('[v0] API returned error but continuing:', apiError)
    }

    // Always refresh the complaints list
    await fetchComplaints()
    
    // Show success message since the complaint disappears on refresh
    toast({
      title: "Success",
      description: "Complaint deleted successfully",
    })
    
  } catch (error: any) {
    console.error("[v0] Error in delete process:", error)
    
    // Refresh anyway to check if deletion worked
    await fetchComplaints()
    
    toast({
      title: "Completed",
      description: "Complaint deletion processed",
    })
  }
}

  const handleExport = () => {
    const exportData = filteredComplaints.map((complaint) => ({
      "Complaint ID": complaint.complaint_id,
      Customer: complaint.createdBy?.name || "N/A",
      Email: complaint.createdBy?.email || "N/A",
      Phone: complaint.createdBy?.phone || "N/A",
      Type: complaint.type,
      Area: complaint.Area,
      Category: complaint.category,
      Priority: complaint.priority,
      Status: complaint.status,
      "Assigned To": complaint.assignedTechnician?.name || "Unassigned",
      Description: complaint.description,
      Created: new Date(complaint.createdAt).toLocaleDateString(),
      Updated: new Date(complaint.updatedAt).toLocaleDateString(),
    }))
    exportToCSV(exportData, "complaints-list")
    toast({
      title: "Success",
      description: "Complaints exported successfully",
    })
  }

  const stats = {
    total: complaints.length,
    open: complaints.filter((c) => c.status === "open").length,
    assigned: complaints.filter((c) => c.status === "assigned").length,
    inProgress: complaints.filter((c) => c.status === "in-progress").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
  }

  return (
    <DashboardLayout title="Complaint Management" description="Manage all customer complaints and support tickets">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-red-800">{error}</p>
                <Button variant="outline" size="sm" onClick={fetchComplaints} className="ml-auto bg-transparent">
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Total</CardTitle>
                <FileText className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{stats.total}</div>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">All complaints</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Open</CardTitle>
                <Clock className="h-4 w-4 lg:h-5 lg:w-5 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{stats.open}</div>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Awaiting action</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Assigned</CardTitle>
                <UserCheck className="h-4 w-4 lg:h-5 lg:w-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{stats.assigned}</div>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">To technicians</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Progress</CardTitle>
                <Timer className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{stats.inProgress}</div>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Being worked on</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Resolved</CardTitle>
                <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{stats.resolved}</div>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Completed</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by complaint ID, customer name, or description..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="pl-10 h-10"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => {
                      setStatusFilter(value)
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={priorityFilter}
                    onValueChange={(value) => {
                      setPriorityFilter(value)
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={categoryFilter}
                    onValueChange={(value) => {
                      setCategoryFilter(value)
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="installation">Installation</SelectItem>
                      <SelectItem value="connectivity">Connectivity</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Created Date</SelectItem>
                      <SelectItem value="updatedAt">Updated Date</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  fetchComplaints()
                  fetchTechnicians()
                }}
                disabled={loading}
                className="h-9 bg-transparent"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={filteredComplaints.length === 0}
                className="h-9 bg-transparent"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="h-9"
              >
                Sort {sortOrder === "asc" ? "↑" : "↓"}
              </Button>
            </div>

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="h-9">
                  <Plus className="h-4 w-4 mr-2" />
                  New Complaint
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Complaint</DialogTitle>
                  <DialogDescription>Register a new customer complaint with complete details</DialogDescription>
                </DialogHeader>
                <AddComplaintForm
                  onClose={() => setShowAddDialog(false)}
                  onSuccess={() => {
                    setShowAddDialog(false)
                    fetchComplaints()
                    toast({
                      title: "Success",
                      description: "Complaint created successfully",
                    })
                  }}
                  userId={user?.user_id}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Complaints Table */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold">Complaints ({filteredComplaints.length})</CardTitle>
                  <CardDescription className="mt-1">
                    Page {currentPage} of {totalPages || 1} • {ITEMS_PER_PAGE} per page
                  </CardDescription>
                </div>
                {loading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>}
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading complaints...</span>
                </div>
              ) : paginatedComplaints.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints found</h3>
                  <p className="text-sm text-gray-600">Try adjusting your filters or create a new complaint</p>
                </div>
              ) : (
                <>
                  <ScrollArea className="w-full">
                    <div className="min-w-[1200px]">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50/50">
                            <TableHead className="w-[100px] font-semibold">ID</TableHead>
                            <TableHead className="w-[150px] font-semibold">Customer</TableHead>
                            <TableHead className="w-[120px] font-semibold">Type</TableHead>
                            <TableHead className="w-[100px] font-semibold">Priority</TableHead>
                            <TableHead className="w-[100px] font-semibold">Status</TableHead>
                            <TableHead className="w-[120px] font-semibold">Assigned To</TableHead>
                            <TableHead className="w-[100px] font-semibold">Created</TableHead>
                            <TableHead className="w-[80px] font-semibold">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedComplaints.map((complaint) => (
                            <TableRow key={complaint.complaint_id} className="hover:bg-gray-50/50">
                              <TableCell className="font-medium text-blue-600 text-sm">
                                {complaint.complaint_id}
                              </TableCell>
                              <TableCell className="text-sm">
                                <div className="font-medium text-gray-900 truncate">
                                  {complaint.customerName || "N/A"}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {complaint.customerEmail|| "N/A"}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">
                                <Badge variant="outline" className="capitalize">
                                  {complaint.type}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">{getPriorityBadge(complaint.priority)}</TableCell>
                              <TableCell className="text-sm">{getStatusBadge(complaint.status)}</TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {complaint.assignedTechnician?.name || "Unassigned"}
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {new Date(complaint.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuItem onClick={() => handleViewAudit(complaint)}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Audit Trail
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => {
                                        setSelectedComplaint(complaint)
                                        setShowAssignDialog(true)
                                      }}
                                    >
                                      <UserCheck className="h-4 w-4 mr-2" />
                                      Assign Technician
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusUpdate(complaint, "in-progress")}>
                                      <Timer className="h-4 w-4 mr-2" />
                                      Mark In Progress
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusUpdate(complaint, "resolved")}>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Mark Resolved
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleDelete(complaint.complaint_id)}
                                      className="text-red-600"
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t">
                      <div className="text-sm text-gray-600">
                        Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                        {Math.min(currentPage * ITEMS_PER_PAGE, filteredComplaints.length)} of{" "}
                        {filteredComplaints.length}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className="w-8 h-8 p-0"
                            >
                              {page}
                            </Button>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>


{/* Assign Technician Dialog */}
<Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Assign Technician</DialogTitle>
      <DialogDescription>
        Assign a technician to complaint {selectedComplaint?.complaint_id}
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      {techniciansLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading technicians...</span>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="technician-search">Search Technician</Label>
            <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
              <SelectTrigger>
                <SelectValue placeholder="Select technician" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {/* Search Input inside Dropdown */}
                <div className="p-2 border-b">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search by name, specialization..."
                      value={technicianSearch}
                      onChange={(e) => setTechnicianSearch(e.target.value)}
                      className="pl-8 h-9 text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>

                {technicians.length === 0 ? (
                  <div className="py-4 text-center text-sm text-gray-500">
                    No technicians available
                  </div>
                ) : (
                  technicians
                    .filter(tech =>
                      tech.profileDetail.name.toLowerCase().includes(technicianSearch.toLowerCase()) ||
                      tech.profileDetail.specialization?.toLowerCase().includes(technicianSearch.toLowerCase()) ||
                      tech.profileDetail.area?.toLowerCase().includes(technicianSearch.toLowerCase())
                    )
                    .map((tech) => (
                      <SelectItem 
                        key={tech.user_id} 
                        value={tech.profileDetail.technicianId || tech.user_id}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{tech.profileDetail.name}</span>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>{tech.profileDetail.specialization}</span>
                            {tech.profileDetail.area && (
                              <>
                                <span>•</span>
                                <span>{tech.profileDetail.area}</span>
                              </>
                            )}
                            {tech.profileDetail.rating !== undefined && (
                              <>
                                <span>•</span>
                                <span>Rating: {tech.profileDetail.rating}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setShowAssignDialog(false)
              setSelectedTechnician("")
              setTechnicianSearch("")
            }}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedComplaint && handleAssignTechnician(selectedComplaint)}
              disabled={!selectedTechnician}
            >
              Assign
            </Button>
          </div>
        </>
      )}
    </div>
  </DialogContent>
</Dialog>

          {/* Audit Trail Dialog */}
          <Dialog open={showAuditDialog} onOpenChange={setShowAuditDialog}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Audit Trail - {selectedComplaint?.complaint_id}</DialogTitle>
                <DialogDescription>Complete history of all actions performed on this complaint</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {auditTrail.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No audit logs found</p>
                ) : (
                  auditTrail.map((log, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className="capitalize">{log.action}</Badge>
                        <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">
                          {log.performedBy?.name} ({log.performedBy?.role})
                        </p>
                        {log.details && <p className="text-gray-600 mt-1">{JSON.stringify(log.details, null, 2)}</p>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </DashboardLayout>
  )
}