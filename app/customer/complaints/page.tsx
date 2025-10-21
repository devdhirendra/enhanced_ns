"use client"
import { useAuth } from "@/contexts/AuthContext"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { complaintApi } from "@/lib/complaint-api"
import {
  Headphones,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  Phone,
  Mail,
  Search,
  Eye,
  X,
  Calendar,
  MoreVertical,
  XCircle,
  Loader2,
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface CustomerComplaint {
  complaint_id: string
  description: string
  type: string
  priority: string
  status: string
  createdAt: string
  updatedAt: string
  customerName?: string
  customerPhone?: string
  Area?: string
  technicianNotes?: string
  CustomerNotes?: string
}

export default function CustomerComplaintsPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [priorityRange, setPriorityRange] = useState([1, 5])
  const [searchTerm, setSearchTerm] = useState("")
  const [newComplaint, setNewComplaint] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    category: "General",
  })
  const [complaints, setComplaints] = useState<CustomerComplaint[]>([])
  const [filteredComplaints, setFilteredComplaints] = useState<CustomerComplaint[]>([])
  const [selectedComplaint, setSelectedComplaint] = useState<CustomerComplaint | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTableLoading, setIsTableLoading] = useState(true)
  const [changingStatusId, setChangingStatusId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState("created")
  const [statusFilter, setStatusFilter] = useState("all")
  const itemsPerPage = 5

  // Helper function to map priority to numbers
  const getPriorityNumber = (priority: string): number => {
    switch (priority?.toLowerCase()) {
      case "low":
        return 1
      case "medium":
        return 3
      case "high":
        return 5
      default:
        return 0
    }
  }

  // Filter complaints function
  const filterComplaints = (complaints: CustomerComplaint[], searchTerm: string, priorityRange: number[], statusFilter: string) => {
    return complaints
      .filter((complaint) => {
        const priorityNum = getPriorityNumber(complaint.priority)
        const isPriorityInRange = priorityNum >= priorityRange[0] && priorityNum <= priorityRange[1]

        const searchLower = searchTerm.toLowerCase().trim()
        const matchesSearch =
          !searchLower ||
          complaint.description?.toLowerCase().includes(searchLower) ||
          complaint.type?.toLowerCase().includes(searchLower) ||
          complaint.complaint_id?.toLowerCase().includes(searchLower)

        const matchesStatus = statusFilter === "all" || complaint.status === statusFilter

        return isPriorityInRange && matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "created":
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          case "updated":
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          case "priority":
            return getPriorityNumber(b.priority) - getPriorityNumber(a.priority)
          default:
            return 0
        }
      })
  }

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsTableLoading(true)
      try {
        if (user?.user_id) {
          console.log("[v0] Fetching complaints for user:", user.user_id)

          const complaintsRes = await complaintApi.getUserComplaints(user.user_id)
          console.log("[v0] Complaints fetched:", complaintsRes)

          const complaintsArray = Array.isArray(complaintsRes?.data)
            ? complaintsRes.data
            : Array.isArray(complaintsRes)
              ? complaintsRes
              : []
          
          // Cast to CustomerComplaint array to fix TypeScript errors
          setComplaints(complaintsArray as CustomerComplaint[])
          setFilteredComplaints(complaintsArray as CustomerComplaint[])
        }
      } catch (err) {
        console.error("[v0] Error fetching data:", err)
        toast({
          title: "Error",
          description: "Failed to load complaints data",
          variant: "destructive",
        })
        setComplaints([])
        setFilteredComplaints([])
      } finally {
        setIsTableLoading(false)
      }
    }

    fetchData()
  }, [user])

  // Update filtered complaints when filters change
  useEffect(() => {
    const filtered = filterComplaints(complaints, searchTerm, priorityRange, statusFilter)
    setFilteredComplaints(filtered)
    setCurrentPage(1)
  }, [complaints, searchTerm, priorityRange, statusFilter, sortBy])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
      case "closed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "open":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
      case "closed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800"
      case "open":
        return "bg-red-100 text-red-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

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

  const handleSubmitComplaint = async () => {
    if (!newComplaint.category || !newComplaint.title || !newComplaint.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const complaintData = {
        type: newComplaint.title,
        description: newComplaint.description,
        priority: newComplaint.priority,
        category: newComplaint.category,
      }

      const response = await complaintApi.createComplaint(user?.user_id || "", complaintData)

      if (response.success || response.message?.toLowerCase().includes("success")) {
        toast({
          title: "Complaint Submitted",
          description: response.message || "Your complaint has been submitted successfully.",
        })

        // Refresh complaints list
        const complaintsRes = await complaintApi.getUserComplaints(user?.user_id || "")
        const complaintsArray = Array.isArray(complaintsRes?.data)
          ? complaintsRes.data
          : Array.isArray(complaintsRes)
            ? complaintsRes
            : []
        setComplaints(complaintsArray as CustomerComplaint[])
        setFilteredComplaints(complaintsArray as CustomerComplaint[])

        setNewComplaint({
          title: "",
          priority: "medium",
          description: "",
          category: "",
        })
      } else {
        throw new Error(response.message || "Failed to submit complaint")
      }
    } catch (error: any) {
      console.error("[v0] Error submitting complaint:", error)
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error submitting your complaint. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (complaintId: string, newStatus: string) => {
    setChangingStatusId(complaintId)

    try {
      const response = await complaintApi.updateStatus(complaintId, { status: newStatus })

      if (response.success || response.message?.toLowerCase().includes("success")) {
        toast({
          title: "Status Updated",
          description: `Complaint has been marked as ${newStatus}.`,
        })

        const updatedComplaints = complaints.map((complaint) =>
          complaint.complaint_id === complaintId ? { ...complaint, status: newStatus } : complaint,
        )
        setComplaints(updatedComplaints)
        setFilteredComplaints(filterComplaints(updatedComplaints, searchTerm, priorityRange, statusFilter))
      } else {
        throw new Error(response.message || "Failed to update status")
      }
    } catch (error: any) {
      console.error("[v0] Error changing status:", error)
      toast({
        title: "Status Change Failed",
        description: error.message || "There was an error updating the complaint status.",
        variant: "destructive",
      })
    } finally {
      setChangingStatusId(null)
    }
  }

  const handleViewComplaint = (complaint: CustomerComplaint) => {
    setSelectedComplaint(complaint)
    setIsDialogOpen(true)
  }

  const handleSearch = () => {
    toast({
      title: "Search Applied",
      description: `Found ${filteredComplaints.length} complaint${filteredComplaints.length === 1 ? "" : "s"} matching your criteria.`,
    })
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setPriorityRange([1, 5])
    setStatusFilter("all")
    setSortBy("created")
    setFilteredComplaints(complaints)

    toast({
      title: "Filters Cleared",
      description: "All filters have been reset.",
    })
  }

  const paginatedComplaints = filteredComplaints.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage)

  const StatusActionButton = ({ complaint }: { complaint: CustomerComplaint }) => {
    const isChanging = changingStatusId === complaint.complaint_id

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" disabled={isChanging}>
            {isChanging ? <Loader2 className="h-3 w-3 animate-spin" /> : <MoreVertical className="h-3 w-3" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => handleStatusChange(complaint.complaint_id, "cancelled")}
            className="flex items-center"
          >
            <XCircle className="h-4 w-4 mr-2 text-red-500" />
            Cancel Ticket
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Fix for the analytics section - properly type the count
  const categoryCounts = complaints.reduce((acc, complaint) => {
    const type = complaint.type || "Other"
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <DashboardLayout title="My Complaints" description="Submit and track your service complaints">
      <div className="space-y-6">
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="active">Active Complaints</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="new">Submit New</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Complaints</CardTitle>
                <CardDescription>Filter your complaints by priority, status, and search terms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>
                      Priority Range: {priorityRange[0]} - {priorityRange[1]}
                    </Label>
                    <Slider
                      value={priorityRange}
                      onValueChange={setPriorityRange}
                      max={5}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Low (1)</span>
                      <span>Medium (3)</span>
                      <span>High (5)</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Sort By</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="created">Created Date</SelectItem>
                        <SelectItem value="updated">Updated Date</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search complaints..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Button variant="outline" onClick={handleSearch}>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Button variant="outline" onClick={handleClearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm text-gray-600">
                    Showing {paginatedComplaints.length} of {filteredComplaints.length} complaints
                  </span>
                  {(searchTerm || priorityRange[0] !== 1 || priorityRange[1] !== 5 || statusFilter !== "all") && (
                    <Badge variant="secondary">Filters Applied</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Active Complaints */}
            <Card>
              <CardHeader>
                <CardTitle>Active Complaints</CardTitle>
                <CardDescription>Your ongoing complaints and their current status</CardDescription>
              </CardHeader>
              <CardContent>
                {isTableLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mr-2" />
                    <span className="text-sm text-gray-500">Loading complaints...</span>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Complaint</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Update</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedComplaints
                          .filter((c) => c.status === "in-progress" || c.status === "open")
                          .map((complaint) => (
                            <TableRow key={complaint.complaint_id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium text-gray-900">{complaint.description}</div>
                                  <div className="text-sm text-gray-500">{complaint.complaint_id}</div>
                                  <div className="text-xs text-gray-400">
                                    Created: {formatDate(complaint.createdAt)}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{complaint.type}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={getPriorityColor(complaint.priority)}>
                                  {complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(complaint.status)}
                                  <Badge className={getStatusColor(complaint.status)}>
                                    {complaint.status.replace("-", " ").charAt(0).toUpperCase() +
                                      complaint.status.replace("-", " ").slice(1)}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="text-sm">{formatDate(complaint.updatedAt)}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Button size="sm" variant="outline" onClick={() => handleViewComplaint(complaint)}>
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  <StatusActionButton complaint={complaint} />
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        {paginatedComplaints.filter((c) => c.status === "in-progress" || c.status === "open").length ===
                          0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                              No active complaints found matching your criteria
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>

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
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resolved" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resolved Complaints</CardTitle>
                <CardDescription>Your completed complaints and resolutions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Showing {filteredComplaints.filter((c) => c.status === "resolved" || c.status === "closed").length}{" "}
                    resolved complaints
                  </span>
                </div>
                {isTableLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mr-2" />
                    <span className="text-sm text-gray-500">Loading complaints...</span>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Complaint</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Resolved Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredComplaints
                        .filter((c) => c.status === "resolved" || c.status === "closed" || c.status === "cancelled")
                        .map((complaint) => (
                          <TableRow key={complaint.complaint_id}>
                            <TableCell>
                              <div>
                                <div className="font-medium text-gray-900">{complaint.description}</div>
                                <div className="text-sm text-gray-500">{complaint.complaint_id}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{complaint.type}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(complaint.status)}>
                                {complaint.status.replace("-", " ").charAt(0).toUpperCase() +
                                  complaint.status.replace("-", " ").slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(complaint.updatedAt)}</TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline" onClick={() => handleViewComplaint(complaint)}>
                                <Eye className="h-3 w-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      {filteredComplaints.filter((c) => c.status === "resolved" || c.status === "closed").length ===
                        0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            No resolved complaints found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="new" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Submit New Complaint</CardTitle>
                <CardDescription>Report an issue or concern with your service</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={newComplaint.category}
                      onValueChange={(value) => setNewComplaint((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technical Issue">Technical Issue</SelectItem>
                        <SelectItem value="Billing Issue">Billing Issue</SelectItem>
                        <SelectItem value="Service Quality">Service Quality</SelectItem>
                        <SelectItem value="Installation">Installation</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newComplaint.priority}
                      onValueChange={(value: "low" | "medium" | "high") =>
                        setNewComplaint((prev) => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Subject *</Label>
                  <Input
                    id="title"
                    placeholder="Brief description of the issue"
                    value={newComplaint.title}
                    onChange={(e) => setNewComplaint((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed information about the issue..."
                    rows={6}
                    value={newComplaint.description}
                    onChange={(e) => setNewComplaint((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="flex space-x-4">
                  <Button onClick={handleSubmitComplaint} className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Submit Complaint
                      </>
                    )}
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Support
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Need Immediate Help?</CardTitle>
                <CardDescription>Contact our support team directly</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="p-3 bg-pink-100 rounded-lg">
                      <Phone className="h-6 w-6 text-pink-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Phone Support</h4>
                      <p className="text-sm text-gray-600">1800-123-4567</p>
                      <p className="text-xs text-gray-500">24/7 Available</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="p-3 bg-pink-100 rounded-lg">
                      <Mail className="h-6 w-6 text-pink-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Email Support</h4>
                      <p className="text-sm text-gray-600">support@network.com</p>
                      <p className="text-xs text-gray-500">Response within 2 hours</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-pink-50 to-rose-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Total Complaints</CardTitle>
                  <div className="p-2 bg-pink-500 rounded-lg">
                    <Headphones className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{complaints.length}</div>
                  <p className="text-xs text-gray-500 mt-1">All time</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Resolved</CardTitle>
                  <div className="p-2 bg-green-500 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {complaints.filter((c) => c.status === "resolved" || c.status === "closed").length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Successfully resolved</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">In Progress</CardTitle>
                  <div className="p-2 bg-yellow-500 rounded-lg">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {complaints.filter((c) => c.status === "in-progress").length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Being worked on</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Open</CardTitle>
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {complaints.filter((c) => c.status === "open").length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Awaiting assignment</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Complaint Categories</CardTitle>
                <CardDescription>Breakdown of your complaints by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(categoryCounts).length > 0 ? (
                    Object.entries(categoryCounts).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{type}</span>
                        <span className="font-medium">
                          {count} {count === 1 ? "complaint" : "complaints"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No complaints found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Complaint Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Complaint Details</span>
              <Button variant="ghost" size="icon" onClick={() => setIsDialogOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>Detailed information about your complaint</DialogDescription>
          </DialogHeader>

          {selectedComplaint && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Complaint ID</span>
                      <span className="text-sm">{selectedComplaint.complaint_id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status</span>
                      <Badge className={getStatusColor(selectedComplaint.status)}>
                        {selectedComplaint.status.replace("-", " ").charAt(0).toUpperCase() +
                          selectedComplaint.status.replace("-", " ").slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Priority</span>
                      <Badge className={getPriorityColor(selectedComplaint.priority)}>
                        {selectedComplaint.priority.charAt(0).toUpperCase() + selectedComplaint.priority.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Category</span>
                      <span className="text-sm">{selectedComplaint.type}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Created
                      </span>
                      <span className="text-sm">{formatDate(selectedComplaint.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Last Updated
                      </span>
                      <span className="text-sm">{formatDate(selectedComplaint.updatedAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Complaint Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Description</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{selectedComplaint.description}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
