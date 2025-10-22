"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DashboardLayout from "@/components/layout/DashboardLayout"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { complaintApi } from "@/lib/complaint-api"
import {
  Search,
  AlertTriangle,
  Clock,
  MapPin,
  User,
  Phone,
  CheckCircle,
  Play,
  MessageSquare,
  FileText,
  Navigation,
  Calendar,
  Wifi,
  WifiOff,
  Router,
  Save,
  RefreshCw,
} from "lucide-react"

interface TechnicianComplaint {
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

export default function TechnicianComplaintsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [complaints, setComplaints] = useState<TechnicianComplaint[]>([])
  const [filteredComplaints, setFilteredComplaints] = useState<TechnicianComplaint[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [sortBy, setSortBy] = useState("created")
  const [selectedComplaint, setSelectedComplaint] = useState<TechnicianComplaint | null>(null)
  const [technicianNotes, setTechnicianNotes] = useState("")
  const [resolution, setResolution] = useState("")
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    if (user?.user_id) {
      fetchComplaints()
    }
  }, [user])

  const fetchComplaints = async () => {
    if (!user?.user_id) return

    try {
      setLoading(true)
      console.log("[v0] Fetching technician complaints...")

      const assignedComplaints = await complaintApi.getTechnicianComplaints(user.user_id)
      console.log("[v0] Fetched complaints:", assignedComplaints)

      const complaintsArray = Array.isArray(assignedComplaints?.data)
        ? assignedComplaints.data
        : Array.isArray(assignedComplaints)
          ? assignedComplaints
          : []

      setComplaints(complaintsArray)
      setFilteredComplaints(complaintsArray)
      console.log("[v0] Complaints loaded successfully")
    } catch (error) {
      console.error("[v0] Error fetching complaints:", error)
      toast({
        title: "Error Loading Complaints",
        description: "Failed to load complaints. Please try again.",
        variant: "destructive",
      })
      setComplaints([])
      setFilteredComplaints([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const filtered = complaints.filter((complaint: TechnicianComplaint) => {
      const matchesSearch =
        complaint.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.complaint_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || complaint.status === statusFilter
      const matchesPriority =
        priorityFilter === "all" || complaint.priority.toLowerCase() === priorityFilter.toLowerCase()

      return matchesSearch && matchesStatus && matchesPriority
    })

    filtered.sort((a: TechnicianComplaint, b: TechnicianComplaint) => {
      switch (sortBy) {
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "updated":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case "priority":
          const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 }
          return (priorityOrder[b.priority.toLowerCase()] || 0) - (priorityOrder[a.priority.toLowerCase()] || 0)
        default:
          return 0
      }
    })

    setFilteredComplaints(filtered)
    setCurrentPage(1)
  }, [complaints, searchTerm, statusFilter, priorityFilter, sortBy])

  const getPriorityColor = (priority: string) => {
    const normalizedPriority = priority.toLowerCase()
    switch (normalizedPriority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800"
      case "in_progress":
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "assigned":
        return "bg-orange-100 text-orange-800"
      case "escalated":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSeverityIcon = (type: string) => {
    switch (type) {
      case "connectivity":
        return <WifiOff className="h-4 w-4" />
      case "speed":
        return <Wifi className="h-4 w-4" />
      case "hardware":
        return <Router className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const handleStartWork = async (complaintId: string) => {
    try {
      console.log("[v0] Starting work on complaint:", complaintId)

      await complaintApi.updateStatus(complaintId, { status: "in-progress" })

      setComplaints(
        complaints.map((complaint: TechnicianComplaint) =>
          complaint.complaint_id === complaintId ? { ...complaint, status: "in-progress" } : complaint,
        ),
      )

      toast({
        title: "Work Started",
        description: "Complaint status updated to in progress.",
      })
    } catch (error) {
      console.error("[v0] Error starting work:", error)
      toast({
        title: "Error",
        description: "Failed to update complaint status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleResolveComplaint = async (complaintId: string) => {
    try {
      console.log("[v0] Resolving complaint:", complaintId)

      await complaintApi.updateStatus(complaintId, { status: "resolved" })

      setComplaints(
        complaints.map((complaint: TechnicianComplaint) =>
          complaint.complaint_id === complaintId
            ? {
                ...complaint,
                status: "resolved",
                technicianNotes: resolution || complaint.technicianNotes,
              }
            : complaint,
        ),
      )

      toast({
        title: "Complaint Resolved",
        description: "Complaint has been marked as resolved.",
      })

      setResolution("")
    } catch (error) {
      console.error("[v0] Error resolving complaint:", error)
      toast({
        title: "Error",
        description: "Failed to resolve complaint. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleViewOnMap = (location: string) => {
    if (location) {
      const url = `https://www.google.com/maps?q=${encodeURIComponent(location)}`
      window.open(url, "_blank")
    }
  }

  const handleCallCustomer = (phone: string) => {
    if (phone) {
      window.open(`tel:${phone}`)
    }
  }

  const complaintStats = {
    total: complaints.length,
    assigned: complaints.filter((c: TechnicianComplaint) => c.status === "assigned").length,
    inProgress: complaints.filter((c: TechnicianComplaint) => c.status === "in_progress" || c.status === "in-progress")
      .length,
    resolved: complaints.filter((c: TechnicianComplaint) => c.status === "resolved").length,
  }

  const paginatedComplaints = filteredComplaints.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <DashboardLayout title="My Complatints" description="View and manage your complaints">
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Complaints</h1>
          <p className="text-gray-500">Manage and resolve customer issues efficiently</p>
        </div>
        <Button onClick={fetchComplaints} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Total Complaints</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{complaintStats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Assigned</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{complaintStats.assigned}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">In Progress</CardTitle>
            <Play className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{complaintStats.inProgress}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{complaintStats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Complaints List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <CardTitle>Complaint Management</CardTitle>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full md:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created">Created Date</SelectItem>
                  <SelectItem value="updated">Updated Date</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredComplaints.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No complaints found</p>
              <p className="text-sm">
                {complaints.length === 0 ? "No complaints assigned to you" : "Try adjusting your search filters"}
              </p>
            </div>
          ) : (
            <>
              {paginatedComplaints.map((complaint: TechnicianComplaint) => (
                <div
                  key={complaint.complaint_id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300 bg-gradient-to-r from-white to-gray-50"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-3 mb-3">
                        <div className="flex items-center space-x-2">
                          {getSeverityIcon(complaint.type)}
                          <h3 className="font-medium text-gray-900">{complaint.type}</h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(complaint.priority)}>
                            {complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)}
                          </Badge>
                          <Badge variant="outline">{complaint.complaint_id}</Badge>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-4">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span>{complaint.customerName || "Unknown"}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4" />
                            <span>{complaint.customerPhone || "N/A"}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{complaint.Area || "Unknown Location"}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="h-4 w-4" />
                          <span>{complaint.description}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Reported: {new Date(complaint.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 lg:ml-4">
                      <Badge className={getStatusColor(complaint.status)}>
                        {complaint.status.replace("_", " ").toUpperCase()}
                      </Badge>

                      <div className="flex flex-wrap gap-2">
                        {complaint.status === "assigned" && (
                          <Button
                            size="sm"
                            onClick={() => handleStartWork(complaint.complaint_id)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Start Work
                          </Button>
                        )}

                        {(complaint.status === "in_progress" || complaint.status === "in-progress") && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Resolve
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Resolve Complaint</DialogTitle>
                                <DialogDescription>
                                  Provide resolution details for {complaint.complaint_id}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="resolution">Resolution Details</Label>
                                  <Textarea
                                    id="resolution"
                                    value={resolution}
                                    onChange={(e) => setResolution(e.target.value)}
                                    placeholder="Describe how the issue was resolved..."
                                    rows={4}
                                  />
                                </div>
                                <Button
                                  onClick={() => handleResolveComplaint(complaint.complaint_id)}
                                  className="w-full"
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  Mark as Resolved
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}

                        <Button size="sm" variant="outline" onClick={() => handleViewOnMap(complaint.Area || "")}>
                          <Navigation className="h-4 w-4 mr-1" />
                          Map
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCallCustomer(complaint.customerPhone || "")}
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </Button>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <FileText className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{complaint.complaint_id} - Details</DialogTitle>
                              <DialogDescription>Complete complaint information</DialogDescription>
                            </DialogHeader>
                            <ComplaintDetailsModal complaint={complaint} />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

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
    </div>
    </DashboardLayout>
  )
}

function ComplaintDetailsModal({ complaint }: { complaint: TechnicianComplaint }) {
  const [notes, setNotes] = useState(complaint.technicianNotes || "")
  const [hasChanges, setHasChanges] = useState(false)

  const handleSaveNotes = () => {
    setHasChanges(false)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Customer Information</Label>
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span>{complaint.customerName || "Unknown"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{complaint.customerPhone || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{complaint.Area || "Unknown Location"}</span>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Complaint Information</Label>
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span>{complaint.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Priority:</span>
              <span className="capitalize">{complaint.priority}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="capitalize">{complaint.status}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium">Issue Description</Label>
        <p className="mt-2 text-sm text-gray-600">{complaint.description}</p>
      </div>

      {complaint.CustomerNotes && (
        <div>
          <Label className="text-sm font-medium">Customer Notes</Label>
          <p className="mt-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">{complaint.CustomerNotes}</p>
        </div>
      )}

      <div>
        <Label htmlFor="techNotes" className="text-sm font-medium">
          Technician Notes
        </Label>
        <Textarea
          id="techNotes"
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value)
            setHasChanges(true)
          }}
          placeholder="Add your technical notes here..."
          className="mt-2"
          rows={4}
        />
        {hasChanges && (
          <Button onClick={handleSaveNotes} className="mt-2" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Notes
          </Button>
        )}
      </div>
    </div>
  )
}
