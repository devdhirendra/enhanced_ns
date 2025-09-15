"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Filter, MoreHorizontal, MessageSquare, Eye, UserCheck, Clock, AlertTriangle, CheckCircle, XCircle, Phone, Mail, Calendar, User, FileText, Download, RefreshCw, TrendingUp, Users, Timer } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { exportToCSV } from "@/lib/utils"
import { complaintApi } from "@/lib/api" // Import the complaint API
import AddComplaintForm from "@/components/AddComplaintForm"
import ComplaintReplyForm from "@/components/ComplaintReplyForm"

interface Complaint {
  id: string
  title: string
  description: string
  category: string
  priority: "low" | "medium" | "high" | "critical"
  status: "open" | "in-progress" | "resolved" | "closed" | "escalated"
  customerInfo: {
    name: string
    email: string
    phone: string
    customerId: string
  }
  assignedTo: string
  createdAt: string
  updatedAt: string
  source: string
  expectedResolution?: string
  replies: number
}

export default function ComplaintsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showReplyDialog, setShowReplyDialog] = useState(false)
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth() // Get user context

  // Fetch complaints from API
  const fetchComplaints = async () => {
    try {
      setLoading(true)
      const response = await complaintApi.getAll()
      setComplaints(response || [])
    } catch (error) {
      console.error("Error fetching complaints:", error)
      toast({
        title: "Error Loading Complaints",
        description: "Failed to load complaints. Please try again.",
        variant: "destructive",
      })
      setComplaints([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComplaints()
  }, [])

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch = 
      complaint.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.customerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.id?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || complaint.status === statusFilter
    const matchesPriority = priorityFilter === "all" || complaint.priority === priorityFilter
    const matchesCategory = categoryFilter === "all" || complaint.category === categoryFilter

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-blue-100 text-blue-800 text-xs"><Clock className="h-3 w-3 mr-1" />Open</Badge>
      case "in-progress":
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs"><Timer className="h-3 w-3 mr-1" />In Progress</Badge>
      case "resolved":
        return <Badge className="bg-green-100 text-green-800 text-xs"><CheckCircle className="h-3 w-3 mr-1" />Resolved</Badge>
      case "closed":
        return <Badge className="bg-gray-100 text-gray-800 text-xs"><XCircle className="h-3 w-3 mr-1" />Closed</Badge>
      case "escalated":
        return <Badge className="bg-red-100 text-red-800 text-xs"><AlertTriangle className="h-3 w-3 mr-1" />Escalated</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 text-xs">Unknown</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return <Badge variant="outline" className="text-green-600 border-green-600 text-xs">Low</Badge>
      case "medium":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600 text-xs">Medium</Badge>
      case "high":
        return <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs">High</Badge>
      case "critical":
        return <Badge variant="outline" className="text-red-600 border-red-600 text-xs">Critical</Badge>
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>
    }
  }

  const handleExport = () => {
    const exportData = filteredComplaints.map((complaint) => ({
      "Complaint ID": complaint.id,
      "Title": complaint.title,
      "Customer Name": complaint.customerInfo?.name || "N/A",
      "Customer ID": complaint.customerInfo?.customerId || "N/A",
      "Phone": complaint.customerInfo?.phone || "N/A",
      "Email": complaint.customerInfo?.email || "N/A",
      "Category": complaint.category,
      "Priority": complaint.priority,
      "Status": complaint.status,
      "Assigned To": complaint.assignedTo || "Unassigned",
      "Source": complaint.source || "N/A",
      "Created Date": complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : "N/A",
      "Expected Resolution": complaint.expectedResolution || "N/A",
      "Replies": complaint.replies || 0,
    }))
    exportToCSV(exportData, "complaints-list")
    toast({
      title: "Export Successful",
      description: "Complaints data exported successfully!",
    })
  }

  const handleAssign = async (complaint: Complaint, assignee: string) => {
    try {
      await complaintApi.update(complaint.id, { assignedTo: assignee })
      toast({
        title: "Complaint Assigned",
        description: `Complaint ${complaint.id} assigned to ${assignee}`,
      })
      fetchComplaints() // Refresh the data
    } catch (error) {
      toast({
        title: "Assignment Failed",
        description: "Failed to assign complaint. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleStatusUpdate = async (complaint: Complaint, newStatus: string) => {
    try {
      await complaintApi.changestatus(complaint.id, { status: newStatus })
      toast({
        title: "Status Updated",
        description: `Complaint ${complaint.id} status updated to ${newStatus}`,
      })
      fetchComplaints() // Refresh the data
    } catch (error) {
      toast({
        title: "Status Update Failed",
        description: "Failed to update complaint status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleReply = (complaint: Complaint) => {
    setSelectedComplaint(complaint)
    setShowReplyDialog(true)
  }

  const handleAddSuccess = () => {
    setShowAddDialog(false)
    fetchComplaints()
    toast({
      title: "Complaint Created",
      description: "New complaint has been created successfully!",
    })
  }

  const handleReplySuccess = () => {
    setShowReplyDialog(false)
    fetchComplaints()
    toast({
      title: "Reply Sent",
      description: "Your reply has been sent successfully!",
    })
  }

  const handleDelete = async (complaintId: string) => {
    try {
      await complaintApi.delete(complaintId)
      toast({
        title: "Complaint Deleted",
        description: "Complaint has been deleted successfully.",
      })
      fetchComplaints()
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete complaint. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Calculate stats
  const stats = {
    total: complaints.length,
    open: complaints.filter(c => c.status === "open").length,
    inProgress: complaints.filter(c => c.status === "in-progress").length,
    resolved: complaints.filter(c => c.status === "resolved").length,
    avgResponseTime: "2.5 hours", // This should be calculated from API data
  }

  return (
    <DashboardLayout title="Complaint Management" description="Manage customer complaints and support tickets">
      <div className="space-y-4 md:space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6 md:h-8 md:w-8 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-lg md:text-2xl font-bold text-gray-900 truncate">{stats.total}</p>
                  <p className="text-xs md:text-sm text-gray-600">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-6 w-6 md:h-8 md:w-8 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-lg md:text-2xl font-bold text-gray-900 truncate">{stats.open}</p>
                  <p className="text-xs md:text-sm text-gray-600">Open</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center space-x-2">
                <Timer className="h-6 w-6 md:h-8 md:w-8 text-yellow-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-lg md:text-2xl font-bold text-gray-900 truncate">{stats.inProgress}</p>
                  <p className="text-xs md:text-sm text-gray-600">Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-green-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-lg md:text-2xl font-bold text-gray-900 truncate">{stats.resolved}</p>
                  <p className="text-xs md:text-sm text-gray-600">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg col-span-2 md:col-span-1">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-purple-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-lg md:text-2xl font-bold text-gray-900 truncate">{stats.avgResponseTime}</p>
                  <p className="text-xs md:text-sm text-gray-600">Avg Response</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          {/* Search and Filter Row */}
          <div className="flex flex-col lg:flex-row gap-2 lg:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid grid-cols-3 lg:flex lg:space-x-2 gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="min-w-0 lg:w-36">
                  <Filter className="h-4 w-4 mr-1 lg:mr-2 flex-shrink-0" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="min-w-0 lg:w-36">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="min-w-0 lg:w-36">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="installation">Installation</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchComplaints}
              disabled={loading}
              className="w-full sm:w-auto bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} className="w-full sm:w-auto bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Complaint
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Complaint</DialogTitle>
                  <DialogDescription>Register a new customer complaint with complete details</DialogDescription>
                </DialogHeader>
                <AddComplaintForm 
                  onClose={() => setShowAddDialog(false)} 
                  onSuccess={handleAddSuccess}
                  userId={user?.user_id} 
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg md:text-xl">All Complaints ({filteredComplaints.length})</CardTitle>
            <CardDescription>Complete list of customer complaints and their current status</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading complaints...</span>
              </div>
            ) : (
              <>
                {/* Enhanced Mobile/Tablet Card View */}
                <div className="xl:hidden space-y-3 p-3 md:p-4">
                  {filteredComplaints.map((complaint) => (
                    <Card key={complaint.id} className="border border-gray-200 shadow-sm">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Header with ID, status and actions */}
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col space-y-2 flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <div className="font-medium text-blue-600 text-sm truncate">{complaint.id}</div>
                                {getPriorityBadge(complaint.priority)}
                              </div>
                              <div className="flex items-center space-x-2">
                                {getStatusBadge(complaint.status)}
                                <Badge variant="outline" className="capitalize text-xs">
                                  {complaint.category}
                                </Badge>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="w-48" align="end">
                                <DropdownMenuItem onClick={() => handleReply(complaint)}>
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Reply ({complaint.replies || 0})
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAssign(complaint, "Technical Team")}>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Assign Technical
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAssign(complaint, "Billing Team")}>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Assign Billing
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusUpdate(complaint, "resolved")}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark Resolved
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusUpdate(complaint, "escalated")}>
                                  <AlertTriangle className="h-4 w-4 mr-2" />
                                  Escalate
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Title and description */}
                          <div>
                            <div className="font-medium text-gray-900 mb-1 text-sm md:text-base line-clamp-1">
                              {complaint.title}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-2">{complaint.description}</div>
                          </div>

                          {/* Customer info */}
                          <div className="space-y-1 text-sm">
                            <div className="font-medium text-gray-900">{complaint.customerInfo?.name || "N/A"}</div>
                            <div className="flex items-center text-gray-600">
                              <User className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{complaint.customerInfo?.customerId || "N/A"}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{complaint.customerInfo?.phone || "N/A"}</span>
                            </div>
                          </div>

                          {/* Footer with assignment and date */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                            <div className="flex items-center text-gray-500 min-w-0 flex-1">
                              <Users className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{complaint.assignedTo || "Unassigned"}</span>
                            </div>
                            <div className="text-gray-500 flex items-center flex-shrink-0 ml-2">
                              <Calendar className="h-3 w-3 mr-1" />
                              {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : "N/A"}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredComplaints.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <p>No complaints found.</p>
                      {searchTerm && <p className="text-sm">Try adjusting your search terms.</p>}
                    </div>
                  )}
                </div>

                {/* Desktop Table View - Enhanced Responsiveness */}
                <div className="hidden xl:block">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[100px] w-[100px]">ID</TableHead>
                          <TableHead className="min-w-[250px] w-[250px]">Complaint</TableHead>
                          <TableHead className="min-w-[180px] w-[180px]">Customer</TableHead>
                          <TableHead className="min-w-[100px] w-[100px]">Category</TableHead>
                          <TableHead className="min-w-[80px] w-[80px]">Priority</TableHead>
                          <TableHead className="min-w-[100px] w-[100px]">Status</TableHead>
                          <TableHead className="min-w-[120px] w-[120px]">Assigned To</TableHead>
                          <TableHead className="min-w-[100px] w-[100px]">Created</TableHead>
                          <TableHead className="min-w-[80px] w-[80px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredComplaints.map((complaint) => (
                          <TableRow key={complaint.id}>
                            <TableCell>
                              <div className="font-medium text-blue-600 text-sm">{complaint.id}</div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium text-gray-900 text-sm truncate max-w-[220px]" title={complaint.title}>
                                  {complaint.title}
                                </div>
                                <div className="text-xs text-gray-500 truncate max-w-[220px]" title={complaint.description}>
                                  {complaint.description}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium text-gray-900 text-sm truncate max-w-[160px]">
                                  {complaint.customerInfo?.name || "N/A"}
                                </div>
                                <div className="text-xs text-gray-500 flex items-center">
                                  <User className="h-3 w-3 mr-1 flex-shrink-0" />
                                  <span className="truncate max-w-[120px]">
                                    {complaint.customerInfo?.customerId || "N/A"}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500 flex items-center">
                                  <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                                  <span className="truncate max-w-[120px]">
                                    {complaint.customerInfo?.phone || "N/A"}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize text-xs">
                                {complaint.category}
                              </Badge>
                            </TableCell>
                            <TableCell>{getPriorityBadge(complaint.priority)}</TableCell>
                            <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                            <TableCell>
                              <div className="flex items-center text-sm text-gray-600">
                                <Users className="h-3 w-3 mr-1 flex-shrink-0" />
                                <span className="truncate max-w-[100px]" title={complaint.assignedTo || "Unassigned"}>
                                  {complaint.assignedTo || "Unassigned"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-600">
                                {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : "N/A"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-64" align="end">
                                  <DropdownMenuItem onClick={() => handleReply(complaint)}>
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Reply ({complaint.replies || 0})
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleAssign(complaint, "Technical Team")}>
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Assign to Technical
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleAssign(complaint, "Billing Team")}>
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Assign to Billing
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusUpdate(complaint, "resolved")}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Mark Resolved
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusUpdate(complaint, "escalated")}>
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    Escalate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDelete(complaint.id)} className="text-red-600">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredComplaints.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                              No complaints found. {searchTerm && "Try adjusting your search terms."}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Reply Dialog */}
        <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Reply to Complaint</DialogTitle>
              <DialogDescription>
                Send a response to complaint {selectedComplaint?.id} from {selectedComplaint?.customerInfo?.name}
              </DialogDescription>
            </DialogHeader>
            {selectedComplaint && (
              <ComplaintReplyForm
                complaintId={selectedComplaint.id}
                onClose={() => setShowReplyDialog(false)}
                onSuccess={handleReplySuccess}
                userId={user?.user_id}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
