"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { technicianApi } from "@/lib/api"
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
  Camera,
  FileText,
  Navigation,
  MoreVertical,
  Calendar,
  Wifi,
  WifiOff,
  Router,
  Save,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface technicaiancomplaint {
  id: string
  ticketNumber: string
  customer: {
    name: string
    phone: string
    address: string
    email: string
    customerId: string
  }
  issue: {
    type: string
    category: string
    description: string
    severity: string
    reportedTime: string
  }
  status: string
  priority: string
  assignedDate: string
  dueDate: string
  estimatedResolution: string
  location: { lat: number; lng: number }
  previousComplaints: number
  customerNotes: string
  technicianNotes: string
  resolution?: string
  startTime?: string
  resolvedTime?: string
}

export default function ComplaintsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [complaints, setComplaints] = useState<technicaiancomplaint[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [selectedComplaint, setSelectedComplaint] = useState("none")
  const [technicianNotes, setTechnicianNotes] = useState("")
  const [resolution, setResolution] = useState("")
  const [loading, setLoading] = useState(true)


 

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

      const technicianId = user.profileDetail?.technicianId || user.user_id
      const assignedComplaints = await technicianApi.getAssignedComplaints(technicianId)
      // const getallcomplaints = await technicianApi.getAllComplaints() 

      console.log("[v0] Fetched complaints:", assignedComplaints)

      // Transform API data to component format
      const transformedComplaints = Array.isArray(assignedComplaints)
        ? assignedComplaints.map((complaint) => ({
            id: complaint.complaint_id || complaint.id,
            ticketNumber: complaint.complaint_id || `TKT-${Date.now()}`,
            customer: {
              name: complaint.customerName || "Unknown Customer",
              phone: complaint.customerPhone || "N/A",
              address: complaint.Area || "Unknown Location",
              email: complaint.customerEmail || "N/A",
              customerId: complaint.customerId || "N/A",
            },
            issue: {
              type: complaint.type || "connectivity",
              category:
                complaint.type === "repair"
                  ? "Equipment Fault"
                  : complaint.type === "installation"
                    ? "New Installation"
                    : "Connectivity Issue",
              description: complaint.description || "No description provided",
              severity: complaint.priority || "medium",
              reportedTime: complaint.createdAt || new Date().toISOString(),
            },
            status: complaint.status || "assigned",
            priority: complaint.priority || "medium",
            assignedDate: complaint.createdAt || new Date().toISOString(),
            dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
            estimatedResolution: "2 hours",
            location: { lat: 30.7333, lng: 76.7794 },
            previousComplaints: 0,
            customerNotes: complaint.CustomerNotes || "",
            technicianNotes: complaint.technicianNotes || "",
          }))
        : []

      setComplaints(transformedComplaints)

      // setComplaints(transformedComplaints)
      console.log("[v0] Complaints loaded successfully")
    } catch (error) {
      console.error("[v0] Error fetching complaints:", error)
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

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.issue.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || complaint.status === statusFilter
    const matchesPriority = priorityFilter === "all" || complaint.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

      await technicianApi.updateComplaint(complaintId, {
        status: "in-progress",
        technicianNotes: "Work started by technician",
      })

      setComplaints(
        complaints.map((complaint) =>
          complaint.id === complaintId
            ? { ...complaint, status: "in_progress", startTime: new Date().toISOString() }
            : complaint,
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

      await technicianApi.updateComplaint(complaintId, {
        status: "resolved",
        technicianNotes: resolution || "Issue resolved successfully",
      })

      setComplaints(
        complaints.map((complaint) =>
          complaint.id === complaintId
            ? {
                ...complaint,
                status: "resolved",
                resolvedTime: new Date().toISOString(),
                resolution: resolution || "Issue resolved successfully",
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

  const handleUpdateNotes = async (complaintId: string, notes: string) => {
    try {
      console.log("[v0] Updating complaint notes:", complaintId)

      await technicianApi.updateComplaint(complaintId, {
        technicianNotes: notes,
      })

      setComplaints(
        complaints.map((complaint) =>
          complaint.id === complaintId ? { ...complaint, technicianNotes: notes } : complaint,
        ),
      )

      toast({
        title: "Notes Updated",
        description: "Technician notes have been saved.",
      })
    } catch (error) {
      console.error("[v0] Error updating notes:", error)
      toast({
        title: "Error",
        description: "Failed to update notes. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleViewOnMap = (location: any) => {
    const url = `https://www.google.com/maps?q=${location.lat},${location.lng}`
    window.open(url, "_blank")
  }

  const handleCallCustomer = (phone: string) => {
    window.open(`tel:${phone}`)
  }

  const complaintStats = {
    total: complaints.length,
    assigned: complaints.filter((c) => c.status === "assigned").length,
    inProgress: complaints.filter((c) => c.status === "in_progress").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Complaints</h1>
          <p className="text-gray-500">Manage and resolve customer issues efficiently</p>
        </div>
        <Button onClick={fetchComplaints} variant="outline">
          <AlertTriangle className="h-4 w-4 mr-2" />
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
                  <SelectItem value="in_progress">In Progress</SelectItem>
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
            filteredComplaints.map((complaint) => (
              <div
                key={complaint.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300 bg-gradient-to-r from-white to-gray-50"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-3 mb-3">
                      <div className="flex items-center space-x-2">
                        {getSeverityIcon(complaint.issue.type)}
                        <h3 className="font-medium text-gray-900">{complaint.issue.category}</h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(complaint.priority)}>{complaint.priority}</Badge>
                        <Badge variant="outline">{complaint.ticketNumber}</Badge>
                        {complaint.previousComplaints > 0 && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
                            Repeat Customer ({complaint.previousComplaints})
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-4">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>{complaint.customer.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{complaint.customer.phone}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>{complaint.customer.address}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>{complaint.issue.description}</span>
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Reported: {new Date(complaint.issue.reportedTime).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>Est. Resolution: {complaint.estimatedResolution}</span>
                        </div>
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
                          onClick={() => handleStartWork(complaint.id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Start Work
                        </Button>
                      )}

                      {complaint.status === "in_progress" && (
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
                                Provide resolution details for {complaint.ticketNumber}
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
                              <Button onClick={() => handleResolveComplaint(complaint.id)} className="w-full">
                                <Save className="h-4 w-4 mr-2" />
                                Mark as Resolved
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      <Button size="sm" variant="outline" onClick={() => handleViewOnMap(complaint.location)}>
                        <Navigation className="h-4 w-4 mr-1" />
                        Map
                      </Button>

                      <Button size="sm" variant="outline" onClick={() => handleCallCustomer(complaint.customer.phone)}>
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
                            <DialogTitle>{complaint.ticketNumber} - Details</DialogTitle>
                            <DialogDescription>Complete complaint information and history</DialogDescription>
                          </DialogHeader>
                          <ComplaintDetailsModal
                            complaint={complaint}
                            onUpdateNotes={(notes) => handleUpdateNotes(complaint.id, notes)}
                          />
                        </DialogContent>
                      </Dialog>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Camera className="mr-2 h-4 w-4" />
                            Upload Photo
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Escalate
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Add Notes
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ComplaintDetailsModal({
  complaint,
  onUpdateNotes,
}: { complaint: any; onUpdateNotes: (notes: string) => void }) {
  const [notes, setNotes] = useState(complaint.technicianNotes || "")
  const [hasChanges, setHasChanges] = useState(false)

  const handleSaveNotes = () => {
    onUpdateNotes(notes)
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
              <span>{complaint.customer.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{complaint.customer.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{complaint.customer.address}</span>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Complaint Information</Label>
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Priority:</span>
              <Badge className={getPriorityColor(complaint.priority)}>{complaint.priority}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Category:</span>
              <span>{complaint.issue.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Severity:</span>
              <span className="capitalize">{complaint.issue.severity}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium">Issue Description</Label>
        <p className="mt-2 text-sm text-gray-600">{complaint.issue.description}</p>
      </div>

      {complaint.customerNotes && (
        <div>
          <Label className="text-sm font-medium">Customer Notes</Label>
          <p className="mt-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">{complaint.customerNotes}</p>
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

      {complaint.resolution && (
        <div>
          <Label className="text-sm font-medium">Resolution</Label>
          <p className="mt-2 text-sm text-gray-600 bg-green-50 p-3 rounded-lg">{complaint.resolution}</p>
        </div>
      )}
    </div>
  )
}

function getPriorityColor(priority: string) {
  switch (priority) {
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
