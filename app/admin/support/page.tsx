"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Search,
  Filter,
  LifeBuoy,
  AlertTriangle,
  Clock,
  CheckCircle,
  Eye,
  MessageSquare,
  User,
  Calendar,
  TrendingUp,
  RefreshCw,
  UserPlus,
  Save,
} from "lucide-react"
import { formatDate, formatDateTime, getStatusColor, getPriorityColor } from "@/lib/utils"
import { complaintApi, staffApi } from "@/lib/api"
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

interface Staff {
  user_id: string
  email: string
  profileDetail: {
    name: string
    phone: string
    assignedTo?: string
  }
  role: string
  createdAt: string
  updatedAt: string
}

export default function SupportPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [selectedTicket, setSelectedTicket] = useState<Complaint | null>(null)
  const [showChatDialog, setShowChatDialog] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [staffMembers, setStaffMembers] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchComplaintsData = async () => {
    try {
      setLoading(true)
      console.log("[v0] Fetching complaints and staff data from API...")

      const [complaintsData, staffData] = await Promise.all([complaintApi.getAll(), staffApi.getAll()])

      console.log("[v0] Complaints data fetched:", complaintsData.length)
      console.log("[v0] Staff data fetched:", staffData.length)

      setComplaints(Array.isArray(complaintsData) ? complaintsData : [])
      setStaffMembers(Array.isArray(staffData) ? staffData : [])

      toast({
        title: "Data Loaded",
        description: "Support data loaded successfully!",
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
      setStaffMembers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComplaintsData()
  }, [])

  const handleUpdateComplaintStatus = async (complaintId: string, newStatus: string) => {
    try {
      console.log("[v0] Updating complaint status:", complaintId, newStatus)

      await complaintApi.update(complaintId, { status: newStatus })

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

  const handleAssignStaff = async (complaintId: string, staffId: string) => {
    try {
      console.log("[v0] Assigning staff to complaint:", complaintId, staffId)

      await complaintApi.update(complaintId, { technicianId: staffId })

      const staffMember = staffMembers.find((s) => s.user_id === staffId)
      toast({
        title: "Staff Assigned",
        description: `${staffMember?.profileDetail.name || "Staff member"} assigned to complaint ${complaintId}`,
      })

      // Refresh the data
      fetchComplaintsData()
      setShowAssignDialog(false)
    } catch (error) {
      console.error("[v0] Error assigning staff:", error)
      toast({
        title: "Assignment Failed",
        description: "Failed to assign staff. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddNote = async (complaintId: string, note: string, isCustomerNote = false) => {
    try {
      console.log("[v0] Adding note to complaint:", complaintId)

      const updateData = isCustomerNote ? { CustomerNotes: note } : { technicianNotes: note }
      await complaintApi.update(complaintId, updateData)

      toast({
        title: "Note Added",
        description: "Note has been added to the complaint successfully.",
      })

      // Refresh the data
      fetchComplaintsData()
    } catch (error) {
      console.error("[v0] Error adding note:", error)
      toast({
        title: "Note Failed",
        description: "Failed to add note. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredTickets = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.complaint_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || complaint.status === statusFilter
    const matchesPriority = priorityFilter === "all" || complaint.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const ticketStats = {
    total: complaints.length,
    open: complaints.filter((c) => c.status === "open").length,
    inProgress: complaints.filter((c) => c.status === "in_progress").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
    highPriority: complaints.filter((c) => c.priority === "high").length,
    avgResolutionTime: 4.2, // This would need historical data to calculate
  }

  return (
    <DashboardLayout title="Support & Tickets" description="Manage operator support requests and tickets">
      <div className="space-y-6">
        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading support data...</span>
          </div>
        )}

        {/* Support Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Complaints</CardTitle>
              <LifeBuoy className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{ticketStats.total}</div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600 font-medium">+12%</span>
                <span className="text-sm text-gray-500 ml-1">this month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Open Complaints</CardTitle>
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{ticketStats.open}</div>
              <p className="text-sm text-gray-500 mt-2">Need attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
              <Clock className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{ticketStats.inProgress}</div>
              <p className="text-sm text-gray-500 mt-2">Being worked on</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Resolution</CardTitle>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{ticketStats.avgResolutionTime}h</div>
              <p className="text-sm text-gray-500 mt-2">Average time</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="tickets" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="tickets">All Complaints</TabsTrigger>
              <TabsTrigger value="staff">Assign Staff</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm" onClick={fetchComplaintsData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* All Complaints Tab */}
          <TabsContent value="tickets" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search complaints..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-40">
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

            <Card>
              <CardHeader>
                <CardTitle>Support Complaints ({filteredTickets.length})</CardTitle>
                <CardDescription>All customer complaints and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-[600px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Complaint Details</TableHead>
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
                      {filteredTickets.map((complaint) => (
                        <TableRow key={complaint.complaint_id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{complaint.description}</div>
                              <div className="text-sm text-gray-500">#{complaint.complaint_id}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">Customer ID: {complaint.customerId}</div>
                              <div className="text-sm text-gray-500">User ID: {complaint.customerUserId}</div>
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
                              onValueChange={(value) => handleUpdateComplaintStatus(complaint.complaint_id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-gray-400" />
                              <span className="text-sm">
                                {staffMembers.find((s) => s.user_id === complaint.technicianId)?.profileDetail.name ||
                                  "Unassigned"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                              <span className="text-sm">{formatDate(complaint.createdAt)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedTicket(complaint)
                                  setShowChatDialog(true)
                                }}
                              >
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedTicket(complaint)
                                  setShowAssignDialog(true)
                                }}
                              >
                                <UserPlus className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredTickets.length === 0 && !loading && (
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
          </TabsContent>

          {/* Staff Assignment Tab */}
          <TabsContent value="staff" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Support Staff ({staffMembers.length})</CardTitle>
                <CardDescription>Manage staff assignments and workload</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-[600px] overflow-y-auto">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {staffMembers.map((staff) => {
                      const activeComplaints = complaints.filter(
                        (c) => c.technicianId === staff.user_id && c.status !== "resolved",
                      ).length
                      return (
                        <Card key={staff.user_id}>
                          <CardHeader>
                            <div className="flex items-center space-x-3">
                              <div className="bg-blue-100 p-2 rounded-full">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{staff.profileDetail.name}</CardTitle>
                                <CardDescription className="capitalize">{staff.role}</CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Email:</span>
                                <span className="font-medium truncate max-w-[120px]">{staff.email}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Phone:</span>
                                <span className="font-medium">{staff.profileDetail.phone}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Assigned To:</span>
                                <span className="font-medium">{staff.profileDetail.assignedTo || "N/A"}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Active Complaints:</span>
                                <span
                                  className={`font-medium ${
                                    activeComplaints > 5
                                      ? "text-red-600"
                                      : activeComplaints > 2
                                        ? "text-yellow-600"
                                        : "text-green-600"
                                  }`}
                                >
                                  {activeComplaints}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Workload:</span>
                                <span className="font-medium">
                                  {activeComplaints === 0
                                    ? "Light"
                                    : activeComplaints <= 2
                                      ? "Normal"
                                      : activeComplaints <= 5
                                        ? "Heavy"
                                        : "Overloaded"}
                                </span>
                              </div>
                            </div>
                            <Button
                              className="w-full mt-4 bg-transparent"
                              variant="outline"
                              onClick={() => {
                                // Find an unassigned complaint to assign
                                const unassignedComplaint = complaints.find(
                                  (c) => !c.technicianId && c.status !== "resolved",
                                )
                                if (unassignedComplaint) {
                                  handleAssignStaff(unassignedComplaint.complaint_id, staff.user_id)
                                } else {
                                  toast({
                                    title: "No Unassigned Complaints",
                                    description: "All complaints are already assigned or resolved.",
                                  })
                                }
                              }}
                            >
                              Auto Assign
                            </Button>
                          </CardContent>
                        </Card>
                      )
                    })}
                    {staffMembers.length === 0 && !loading && (
                      <div className="col-span-full text-center text-gray-500 py-8">No staff members found.</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Complaint Types</CardTitle>
                  <CardDescription>Distribution of complaint types</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {["no_internet", "slow_speed", "fiber_cut", "billing_issue", "hardware_issue"].map((type) => {
                      const count = complaints.filter((c) => c.type === type).length
                      const percentage = complaints.length > 0 ? (count / complaints.length) * 100 : 0
                      return (
                        <div key={type} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium capitalize">{type.replace("_", " ")}</span>
                            <span>
                              {count} ({percentage.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resolution Metrics</CardTitle>
                  <CardDescription>Support team performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600">{ticketStats.avgResolutionTime}h</div>
                      <p className="text-sm text-gray-500">Average Resolution Time</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{ticketStats.resolved}</div>
                        <p className="text-sm text-gray-500">Resolved</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{ticketStats.highPriority}</div>
                        <p className="text-sm text-gray-500">High Priority</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {complaints.length > 0 ? Math.round((ticketStats.resolved / complaints.length) * 100) : 0}%
                      </div>
                      <p className="text-sm text-gray-500">Resolution Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Chat Dialog */}
        <Dialog open={showChatDialog} onOpenChange={setShowChatDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Complaint Details - {selectedTicket?.complaint_id}</DialogTitle>
              <DialogDescription>{selectedTicket?.description}</DialogDescription>
            </DialogHeader>
            {selectedTicket && (
              <ComplaintDetailsView
                complaint={selectedTicket}
                onAddNote={handleAddNote}
                onClose={() => setShowChatDialog(false)}
              />
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Staff</DialogTitle>
              <DialogDescription>Assign a staff member to complaint {selectedTicket?.complaint_id}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Select Staff Member</Label>
                <Select
                  onValueChange={(value) => {
                    if (selectedTicket) {
                      handleAssignStaff(selectedTicket.complaint_id, value)
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffMembers.map((staff) => {
                      const activeComplaints = complaints.filter(
                        (c) => c.technicianId === staff.user_id && c.status !== "resolved",
                      ).length
                      return (
                        <SelectItem key={staff.user_id} value={staff.user_id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{staff.profileDetail.name}</span>
                            <span className="text-sm text-gray-500 ml-2">({activeComplaints} active)</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

function ComplaintDetailsView({
  complaint,
  onAddNote,
  onClose,
}: {
  complaint: Complaint
  onAddNote: (complaintId: string, note: string, isCustomerNote?: boolean) => void
  onClose: () => void
}) {
  const [newMessage, setNewMessage] = useState("")
  const [isCustomerNote, setIsCustomerNote] = useState(false)

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onAddNote(complaint.complaint_id, newMessage, isCustomerNote)
      setNewMessage("")
    }
  }

  return (
    <div className="space-y-4">
      {/* Complaint Info */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Customer ID:</span> {complaint.customerId}
          </div>
          <div>
            <span className="font-medium">Priority:</span>
            <Badge className={`ml-2 ${getPriorityColor(complaint.priority)}`}>{complaint.priority}</Badge>
          </div>
          <div>
            <span className="font-medium">Status:</span>
            <Badge className={`ml-2 ${getStatusColor(complaint.status)}`}>{complaint.status.replace("_", " ")}</Badge>
          </div>
          <div>
            <span className="font-medium">Technician:</span> {complaint.technicianId || "Unassigned"}
          </div>
        </div>
        <div className="mt-2">
          <span className="font-medium">Description:</span>
          <p className="text-gray-600 mt-1">{complaint.description}</p>
        </div>
        <div className="mt-2">
          <span className="font-medium">Type:</span>
          <span className="ml-2 capitalize">{complaint.type.replace("_", " ")}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
          <div>
            <span className="font-medium">Created:</span>
            <p className="text-gray-600">{formatDateTime(complaint.createdAt)}</p>
          </div>
          <div>
            <span className="font-medium">Last Updated:</span>
            <p className="text-gray-600">{formatDateTime(complaint.updatedAt)}</p>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="space-y-4">
        {complaint.CustomerNotes && (
          <div>
            <span className="font-medium text-sm">Customer Notes:</span>
            <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg mt-1">{complaint.CustomerNotes}</p>
          </div>
        )}

        {complaint.technicianNotes && (
          <div>
            <span className="font-medium text-sm">Technician Notes:</span>
            <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg mt-1">{complaint.technicianNotes}</p>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="customerNote"
            checked={isCustomerNote}
            onChange={(e) => setIsCustomerNote(e.target.checked)}
            className="rounded"
          />
          <Label htmlFor="customerNote" className="text-sm">
            Add as customer note
          </Label>
        </div>
        <div className="flex space-x-2">
          <Textarea
            placeholder="Add a note or message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
            rows={2}
          />
          <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}
