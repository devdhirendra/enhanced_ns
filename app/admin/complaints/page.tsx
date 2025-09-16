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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Filter, MoreHorizontal, MessageSquare, Eye, UserCheck, Clock, AlertTriangle, CheckCircle, XCircle, Phone, Mail, Calendar, User, FileText, Download, RefreshCw, TrendingUp, Users, Timer, AlertCircle, } from 'lucide-react'
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
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuth() // Get user context

  // Fetch complaints from API
  const fetchComplaints = async () => {
  try {
    setLoading(true)
    const response = await complaintApi.getAll()
    
    // Map API response to match your Complaint interface
    const mappedComplaints = response.map((item: any) => ({
      id: item.id || item._id || '',
      title: item.title || '',
      description: item.description || '',
      category: item.category || '',
      priority: item.priority || 'medium',
      status: item.status || 'open',
      customerInfo: {
        name: item.customerInfo?.name || item.customerName || '',
        email: item.customerInfo?.email || item.customerEmail || '',
        phone: item.customerInfo?.phone || item.customerPhone || '',
        customerId: item.customerInfo?.customerId || item.customerId || ''
      },
      assignedTo: item.assignedTo || '',
      createdAt: item.createdAt || item.createdDate || '',
      updatedAt: item.updatedAt || item.updatedDate || '',
      source: item.source || 'web',
      expectedResolution: item.expectedResolution,
      replies: item.replies || item.messageCount || 0
    }))
    
    setComplaints(mappedComplaints)
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
    <div className="min-h-screen bg-gray-50 overflow">
      <div className="grid grid-cols-1">
        <main className="h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-4">
              {/* Error Alert */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                    <p className="text-red-800">{error}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={fetchComplaints}
                      className="ml-auto"
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 lg:px-6">
                    <CardTitle className="text-xs sm:text-sm font-medium text-gray-700 truncate">Total</CardTitle>
                    <div className="p-2 bg-blue-500 rounded-lg flex-shrink-0">
                      <FileText className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 lg:px-6">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">{stats.total}</div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">All complaints</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 lg:px-6">
                    <CardTitle className="text-xs sm:text-sm font-medium text-gray-700 truncate">Open</CardTitle>
                    <div className="p-2 bg-orange-500 rounded-lg flex-shrink-0">
                      <Clock className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 lg:px-6">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">{stats.open}</div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">Awaiting response</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 lg:px-6">
                    <CardTitle className="text-xs sm:text-sm font-medium text-gray-700 truncate">Progress</CardTitle>
                    <div className="p-2 bg-yellow-500 rounded-lg flex-shrink-0">
                      <Timer className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 lg:px-6">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">{stats.inProgress}</div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">Being worked on</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 lg:px-6">
                    <CardTitle className="text-xs sm:text-sm font-medium text-gray-700 truncate">Resolved</CardTitle>
                    <div className="p-2 bg-green-500 rounded-lg flex-shrink-0">
                      <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 lg:px-6">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">{stats.resolved}</div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">Successfully closed</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 col-span-2 sm:col-span-3 xl:col-span-1">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 lg:px-6">
                    <CardTitle className="text-xs sm:text-sm font-medium text-gray-700 truncate">Avg Response</CardTitle>
                    <div className="p-2 bg-purple-500 rounded-lg flex-shrink-0">
                      <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 lg:px-6">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">{stats.avgResponseTime}</div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">Response time</p>
                  </CardContent>
                </Card>
              </div>

              {/* Header Section */}
              <div className="flex flex-col space-y-4">
                {/* Search and Filter Section */}
                <Card className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search complaints by ID, title, or customer..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 h-10"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-full sm:w-48 h-10">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Filter by Status" />
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
                          <SelectTrigger className="w-full sm:w-48 h-10">
                            <SelectValue placeholder="Filter by Priority" />
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
                          <SelectTrigger className="w-full sm:w-48 h-10">
                            <SelectValue placeholder="Filter by Category" />
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
                  </CardContent>
                </Card>

                {/* Action Buttons Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchComplaints}
                      disabled={loading}
                      className="h-9"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                      Refresh ({filteredComplaints.length})
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleExport} 
                      className="h-9"
                      disabled={filteredComplaints.length === 0}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                  
                  <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                      <Button className="h-9">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Complaint
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Create New Complaint</DialogTitle>
                        <DialogDescription>
                          Register a new customer complaint with complete details
                        </DialogDescription>
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

              {/* Main Content Card */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-semibold text-gray-900">
                        All Complaints ({filteredComplaints.length})
                      </CardTitle>
                      <CardDescription className="text-gray-600 mt-1">
                        Complete list of customer complaints and their current status
                        {searchTerm && ` • Filtered by: "${searchTerm}"`}
                      </CardDescription>
                    </div>
                    {loading && (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading complaints...</span>
                    </div>
                  ) : (
                    <>
                      {/* Desktop/Tablet Table View with Horizontal Scroll */}
                      <div className="md:block overflow-y">
                        <ScrollArea className="w-full">
                          <div className="min-w-[1400px]">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-gray-50/50">
                                  <TableHead className="w-[100px] font-semibold">ID</TableHead>
                                  <TableHead className="w-[250px] font-semibold">Complaint</TableHead>
                                  <TableHead className="w-[180px] font-semibold">Customer</TableHead>
                                  <TableHead className="w-[100px] font-semibold">Category</TableHead>
                                  <TableHead className="w-[80px] font-semibold">Priority</TableHead>
                                  <TableHead className="w-[100px] font-semibold">Status</TableHead>
                                  <TableHead className="w-[120px] font-semibold">Assigned To</TableHead>
                                  <TableHead className="w-[100px] font-semibold">Created</TableHead>
                                  <TableHead className="w-[100px] font-semibold">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredComplaints.map((complaint, index) => {
  // Generate a unique key for each row
  const rowKey = complaint.id || `temp-${index}-${Date.now()}`;
  
  return (
    <TableRow 
      key={rowKey} 
      className="hover:bg-gray-50/50 transition-colors"
    >
                                    <TableCell className="py-4">
                                      <div className="font-medium text-blue-600 text-sm">{complaint.id}</div>
                                    </TableCell>
                                    
                                    <TableCell className="py-4">
                                      <div className="space-y-1">
                                        <div className="font-medium text-gray-900 text-sm truncate" title={complaint.title}>
                                          {complaint.title}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate" title={complaint.description}>
                                          {complaint.description}
                                        </div>
                                      </div>
                                    </TableCell>
                                    
                                    <TableCell className="py-4">
                                      <div className="space-y-1">
                                        <div className="font-medium text-gray-900 text-sm truncate">
                                          {complaint.customerInfo?.name || "N/A"}
                                        </div>
                                        <div className="text-xs text-gray-500 flex items-center">
                                          <User className="h-3 w-3 mr-1 flex-shrink-0" />
                                          <span className="truncate">
                                            {complaint.customerInfo?.customerId || "N/A"}
                                          </span>
                                        </div>
                                        <div className="text-xs text-gray-500 flex items-center">
                                          <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                                          <span className="truncate">
                                            {complaint.customerInfo?.phone || "N/A"}
                                          </span>
                                        </div>
                                      </div>
                                    </TableCell>
                                    
                                    <TableCell className="py-4">
                                      <Badge variant="outline" className="capitalize text-xs">
                                        {complaint.category}
                                      </Badge>
                                    </TableCell>
                                    
                                    <TableCell className="py-4">
                                      {getPriorityBadge(complaint.priority)}
                                    </TableCell>
                                    
                                    <TableCell className="py-4">
                                      {getStatusBadge(complaint.status)}
                                    </TableCell>
                                    
                                    <TableCell className="py-4">
                                      <div className="flex items-center text-sm text-gray-600">
                                        <Users className="h-3 w-3 mr-1 flex-shrink-0" />
                                        <span className="truncate" title={complaint.assignedTo || "Unassigned"}>
                                          {complaint.assignedTo || "Unassigned"}
                                        </span>
                                      </div>
                                    </TableCell>
                                    
                                    <TableCell className="py-4">
                                      <div className="text-sm text-gray-600 flex items-center">
                                        <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                                        {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : "N/A"}
                                      </div>
                                    </TableCell>
                                    
                                    <TableCell className="py-4">
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
  );
})}
                              </TableBody>
                            </Table>
                          </div>
                          <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                        
                        {/* Empty State for Desktop */}
                        {filteredComplaints.length === 0 && !loading && (
                          <div className="text-center text-gray-500 py-12">
                            <div className="flex flex-col items-center">
                              <FileText className="h-16 w-16 text-gray-300 mb-4" />
                              <h3 className="text-lg font-medium mb-2">No complaints found</h3>
                              {searchTerm ? (
                                <p className="text-sm">Try adjusting your search terms or filters.</p>
                              ) : (
                                <p className="text-sm">Get started by adding your first complaint.</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Mobile Card View with Vertical Scrolling */}
                      <div className="md:hidden">
                        <ScrollArea className="h-[600px] w-full">
                          <div className="space-y-3 p-4">
                            {filteredComplaints.map((complaint) => (
                              <Card key={complaint.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                  <div className="space-y-4">
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
                                      <div className="font-medium text-gray-900 mb-1 text-sm line-clamp-1">
                                        {complaint.title}
                                      </div>
                                      <div className="text-sm text-gray-500 line-clamp-2">{complaint.description}</div>
                                    </div>

                                    {/* Customer info */}
                                    <div className="space-y-1">
                                      <div className="font-medium text-gray-900 text-sm">{complaint.customerInfo?.name || "N/A"}</div>
                                      <div className="flex items-center text-sm text-gray-600">
                                        <User className="h-3 w-3 mr-2 text-blue-600 flex-shrink-0" />
                                        <span className="truncate">{complaint.customerInfo?.customerId || "N/A"}</span>
                                      </div>
                                      <div className="flex items-center text-sm text-gray-600">
                                        <Phone className="h-3 w-3 mr-2 text-green-600 flex-shrink-0" />
                                        <span className="truncate">{complaint.customerInfo?.phone || "N/A"}</span>
                                      </div>
                                    </div>

                                    {/* Footer with assignment and date */}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                      <div className="flex items-center text-xs text-gray-500 min-w-0 flex-1">
                                        <Users className="h-3 w-3 mr-1 flex-shrink-0" />
                                        <span className="truncate">{complaint.assignedTo || "Unassigned"}</span>
                                      </div>
                                      <div className="text-xs text-gray-500 flex items-center flex-shrink-0 ml-2">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : "N/A"}
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}

                            {/* Empty State for Mobile */}
                            {filteredComplaints.length === 0 && !loading && (
                              <div className="text-center text-gray-500 py-12">
                                <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium mb-2">No complaints found</h3>
                                {searchTerm ? (
                                  <p className="text-sm">Try adjusting your search terms or filters.</p>
                                ) : (
                                  <p className="text-sm">Get started by adding your first complaint.</p>
                                )}
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Reply Dialog */}
              <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
          </div>
        </main>
      </div>
    </div>
  </DashboardLayout>
)
}
