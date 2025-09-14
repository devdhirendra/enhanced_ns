"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Plus,
  Search,
  Eye,
  Clock,
  AlertTriangle,
  CheckCircle,
  Headphones,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from "lucide-react"
import { apiClient, operatorApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface Complaint {
  complaint_id: string
  customerId: string
  CustomerNotes: string
  technicianNotes: string
  technicianId: string
  status: string
  priority: string
  customerUserId: string
  description: string
  type: string
  createdAt: string
  updatedAt: string
}

interface Technician {
  user_id: string
  email: string
  profileDetail: {
    name: string
    phone: string
    technicianId?: string
  }
  role: string
  createdAt: string
  updatedAt: string
}

interface NewComplaint {
  customerUserId: string
  customerId: string
  description: string
  type: string
  priority: "high" | "medium" | "low"
  technicianId: string
}

interface ComplaintStats {
  total: number
  open: number
  inProgress: number
  resolved: number
  escalated: number
  avgResolutionTime: string
  todayResolved: number
  todayRaised: number
}

const complaintTypes = [
  "no_internet",
  "slow_speed",
  "intermittent_connection",
  "fiber_cut",
  "hardware_issue",
  "billing_issue",
  "installation_request",
  "other",
]

export default function ComplaintsManagement() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const [newComplaint, setNewComplaint] = useState<NewComplaint>({
    customerUserId: "",
    customerId: "",
    description: "",
    type: "",
    priority: "medium",
    technicianId: "",
  })

  const fetchComplaintsData = async () => {
    try {
      setLoading(true)
      console.log("[v0] Fetching complaints and technicians from API...")

      const [complaintsData, techniciansData] = await Promise.all([
        apiClient.getAllComplaints(),
        apiClient.getAllTechnicians(),
      ])

      console.log("[v0] Complaints fetched:", complaintsData.length)
      console.log("[v0] Technicians fetched:", techniciansData.length)

      setComplaints(Array.isArray(complaintsData) ? complaintsData : [])
      setTechnicians(Array.isArray(techniciansData) ? techniciansData : [])

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
      // Keep empty arrays on error
      setComplaints([])
      setTechnicians([])
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
        return "bg-orange-100 text-orange-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "escalated":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.complaint_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || complaint.status === statusFilter
    const matchesPriority = priorityFilter === "all" || complaint.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const complaintStats: ComplaintStats = {
    total: complaints.length,
    open: complaints.filter((c) => c.status === "open").length,
    inProgress: complaints.filter((c) => c.status === "in_progress").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
    escalated: complaints.filter((c) => c.status === "escalated").length,
    avgResolutionTime: "4.2 hours", // This would need historical data to calculate
    todayResolved: complaints.filter((c) => {
      const today = new Date().toDateString()
      return c.status === "resolved" && new Date(c.updatedAt).toDateString() === today
    }).length,
    todayRaised: complaints.filter((c) => {
      const today = new Date().toDateString()
      return new Date(c.createdAt).toDateString() === today
    }).length,
  }

  const handleAddComplaint = async () => {
    try {
      console.log("[v0] Creating new complaint:", newComplaint)

      const complaintData = {
        customerUserId: newComplaint.customerUserId,
        customerId: newComplaint.customerId,
        description: newComplaint.description,
        type: newComplaint.type,
        priority: newComplaint.priority,
        technicianId: newComplaint.technicianId,
      }

      await operatorApi.createComplaint(complaintData.customerUserId, complaintData)

      toast({
        title: "Complaint Created",
        description: "New complaint has been created successfully!",
      })

      // Reset form and refresh data
      setNewComplaint({
        customerUserId: "",
        customerId: "",
        description: "",
        type: "",
        priority: "medium",
        technicianId: "",
      })
      setIsAddDialogOpen(false)
      fetchComplaintsData()
    } catch (error) {
      console.error("[v0] Error creating complaint:", error)
      toast({
        title: "Creation Failed",
        description: "Failed to create complaint. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleStatusUpdate = async (complaintId: string, newStatus: string) => {
    try {
      console.log("[v0] Updating complaint status:", complaintId, newStatus)

      await apiClient.updateComplaint(complaintId, { status: newStatus })

      toast({
        title: "Status Updated",
        description: `Complaint ${complaintId} status updated to ${newStatus.replace("_", " ")}`,
      })

      // Refresh the data
      fetchComplaintsData()
    } catch (error) {
      console.error("[v0] Error updating complaint status:", error)
      toast({
        title: "Update Failed",
        description: "Failed to update complaint status. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <DashboardLayout title="Complaints Management" description="Track and resolve customer complaints efficiently">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={fetchComplaintsData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Complaint
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Complaint</DialogTitle>
                <DialogDescription>Add a new customer complaint to the system</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="customerUserId">Customer User ID</Label>
                  <Input
                    id="customerUserId"
                    value={newComplaint.customerUserId}
                    onChange={(e) => setNewComplaint({ ...newComplaint, customerUserId: e.target.value })}
                    placeholder="Enter customer user ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerId">Customer ID</Label>
                  <Input
                    id="customerId"
                    value={newComplaint.customerId}
                    onChange={(e) => setNewComplaint({ ...newComplaint, customerId: e.target.value })}
                    placeholder="Enter customer ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Complaint Type</Label>
                  <Select
                    value={newComplaint.type}
                    onValueChange={(value) => setNewComplaint({ ...newComplaint, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select complaint type" />
                    </SelectTrigger>
                    <SelectContent>
                      {complaintTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newComplaint.priority}
                    onValueChange={(value) =>
                      setNewComplaint({ ...newComplaint, priority: value as NewComplaint["priority"] })
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
                <div className="space-y-2">
                  <Label htmlFor="technician">Assign Technician</Label>
                  <Select
                    value={newComplaint.technicianId}
                    onValueChange={(value) => setNewComplaint({ ...newComplaint, technicianId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select technician" />
                    </SelectTrigger>
                    <SelectContent>
                      {technicians.map((tech) => (
                        <SelectItem key={tech.user_id} value={tech.user_id}>
                          {tech.profileDetail.name} - {tech.profileDetail.technicianId || tech.user_id.slice(0, 8)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newComplaint.description}
                    onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                    placeholder="Describe the complaint in detail..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddComplaint} className="bg-blue-600 hover:bg-blue-700">
                  Create Complaint
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading complaints data...</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Complaints</CardTitle>
              <Headphones className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{complaintStats.total}</div>
              <div className="flex items-center space-x-2 mt-2">
                <Badge className="bg-blue-100 text-blue-800 text-xs">{complaintStats.open} open</Badge>
                <Badge className="bg-orange-100 text-orange-800 text-xs">{complaintStats.inProgress} in progress</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Resolved Today</CardTitle>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{complaintStats.todayResolved}</div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600 font-medium">+25%</span>
                <span className="text-sm text-gray-500 ml-1">vs yesterday</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Resolution Time</CardTitle>
              <Clock className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{complaintStats.avgResolutionTime}</div>
              <div className="flex items-center mt-2">
                <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600 font-medium">-15%</span>
                <span className="text-sm text-gray-500 ml-1">improvement</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Escalated</CardTitle>
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{complaintStats.escalated}</div>
              <div className="flex items-center mt-2">
                <Badge className="bg-red-100 text-red-800 text-xs">Needs attention</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Complaints List ({filteredComplaints.length})</CardTitle>
            <CardDescription>Manage and track all customer complaints</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search complaints by ID, description, or type..."
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
                  <SelectItem value="escalated">Escalated</SelectItem>
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
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Complaint ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Technician</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComplaints.map((complaint) => (
                    <TableRow key={complaint.complaint_id}>
                      <TableCell className="font-medium">{complaint.complaint_id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">Customer: {complaint.customerId}</div>
                          <div className="text-sm text-gray-500">User: {complaint.customerUserId}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {complaint.type.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(complaint.priority)}>{complaint.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={complaint.status}
                          onValueChange={(value) => handleStatusUpdate(complaint.complaint_id, value)}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="escalated">Escalated</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {technicians.find((t) => t.user_id === complaint.technicianId)?.profileDetail.name ||
                            "Unassigned"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{new Date(complaint.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(complaint.createdAt).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
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
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredComplaints.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                        No complaints found. {searchTerm && "Try adjusting your search terms."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Complaint Details Dialog */}
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
                    <h4 className="font-semibold text-gray-900 mb-2">Customer Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Customer ID:</span> {selectedComplaint.customerId}
                      </div>
                      <div>
                        <span className="font-medium">User ID:</span> {selectedComplaint.customerUserId}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Complaint Details</h4>
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
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedComplaint.description}</p>
                </div>
                {selectedComplaint.CustomerNotes && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Customer Notes</h4>
                    <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">{selectedComplaint.CustomerNotes}</p>
                  </div>
                )}
                {selectedComplaint.technicianNotes && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Technician Notes</h4>
                    <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg">
                      {selectedComplaint.technicianNotes}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
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
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Assignment</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Technician:</span>{" "}
                        {technicians.find((t) => t.user_id === selectedComplaint.technicianId)?.profileDetail.name ||
                          "Unassigned"}
                      </div>
                      <div>
                        <span className="font-medium">Technician ID:</span> {selectedComplaint.technicianId || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
