"use client"

import { useState, useEffect, use } from "react"
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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Search,
  Plus,
  CalendarIcon,
  Clock,
  User,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Save,
  Download,
} from "lucide-react"
import { format } from "date-fns"
import { technicianApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { showConfirmation, confirmDelete } from "@/lib/confirmation-dialog"

const leaveBalance = {
  annual: { total: 21, used: 5, remaining: 16 },
  sick: { total: 12, used: 2, remaining: 10 },
  casual: { total: 12, used: 3, remaining: 9 },
  emergency: { total: 5, used: 0, remaining: 5 },
}

interface LeaveRequest {
  id: string
  type: string
  startDate: string
  endDate: string
  days: number
  reason: string
  status: string
  appliedDate: string
  approvedBy: string | null
  approvedDate: string | null
  comments: string
  emergencyContact: string
}

export default function LeavePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showNewLeaveDialog, setShowNewLeaveDialog] = useState(false)
  const [loading, setLoading] = useState(true)

  // New leave request form state
  const [newLeave, setNewLeave] = useState({
    type: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    reason: "",
    comments: "",
    emergencyContact: "",
  })

  useEffect(() => {
    if (user?.user_id) {
      fetchLeaveRequests()
    }
  }, [user])

  const fetchLeaveRequests = async () => {
    if (!user?.user_id) return

    try {
      setLoading(true)
      console.log("[v0] Fetching leave requests...")

      const technicianId = user.profileDetail?.technicianId || user.user_id
      const requests = await technicianApi.getOwnLeaveRequests(technicianId)

      console.log("[v0] Leave requests:", requests)

      // Transform API data
      const transformedRequests = Array.isArray(requests)
        ? requests.map((request) => ({
            id: request.leaveId || request.id,
            type: request.leaveType || "sick_leave",
            startDate: request.startDate,
            endDate: request.endDate,
            days: calculateDaysBetween(request.startDate, request.endDate),
            reason: request.reason || "",
            status: request.status || "pending",
            appliedDate: request.createdAt || new Date().toISOString().split("T")[0],
            approvedBy: null,
            approvedDate: null,
            comments: request.reason || "",
            emergencyContact: "+91 9876543210",
          }))
        : []

      setLeaveRequests(transformedRequests)
    } catch (error) {
      console.error("[v0] Error fetching leave requests:", error)
      toast({
        title: "Error Loading Leave Requests",
        description: "Failed to load leave requests. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateDaysBetween = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  const filteredRequests = leaveRequests.filter((request) => {
    const matchesSearch =
      request.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || request.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const getLeaveTypeLabel = (type: string) => {
    switch (type) {
      case "sick":
      case "sick_leave":
        return "Sick Leave"
      case "casual":
      case "casual_leave":
        return "Casual Leave"
      case "annual":
      case "annual_leave":
        return "Annual Leave"
      case "emergency":
      case "emergency_leave":
        return "Emergency Leave"
      default:
        return type
    }
  }

  const calculateDays = () => {
    if (newLeave.startDate && newLeave.endDate) {
      const diffTime = Math.abs(newLeave.endDate.getTime() - newLeave.startDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      return diffDays
    }
    return 0
  }

  const handleSubmitLeave = async () => {
    if (!newLeave.type || !newLeave.startDate || !newLeave.endDate || !newLeave.reason) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive",
      })
      return
    }

    if (!user?.user_id) return

    const confirmed = await showConfirmation({
      title: "Submit Leave Request",
      message: `Are you sure you want to submit this ${getLeaveTypeLabel(newLeave.type)} request for ${calculateDays()} days?`,
      confirmText: "Submit",
      cancelText: "Cancel",
    })

    if (!confirmed) return

    try {
      setLoading(true)
      const technicianId = user.profileDetail?.technicianId || user.user_id

      await technicianApi.createLeaveRequest(technicianId, {
        leaveType: newLeave.type,
        startDate: format(newLeave.startDate, "yyyy-MM-dd"),
        endDate: format(newLeave.endDate, "yyyy-MM-dd"),
        reason: newLeave.reason,
        documents: newLeave.comments ? [newLeave.comments] : [],
      })

      toast({
        title: "Leave Request Submitted",
        description: "Your leave request has been submitted successfully.",
      })

      // Refresh leave requests
      await fetchLeaveRequests()

      setShowNewLeaveDialog(false)

      // Reset form
      setNewLeave({
        type: "",
        startDate: undefined,
        endDate: undefined,
        reason: "",
        comments: "",
        emergencyContact: "",
      })
    } catch (error) {
      console.error("[v0] Error submitting leave request:", error)
      toast({
        title: "Submission Failed",
        description: "Failed to submit leave request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelLeave = async (leaveId: string) => {
    const confirmed = await confirmDelete("leave request")
    if (!confirmed) return

    try {
      setLoading(true)
      await technicianApi.deleteLeaveRequest(leaveId)

      toast({
        title: "Leave Request Cancelled",
        description: "Your leave request has been cancelled.",
      })

      // Refresh leave requests
      await fetchLeaveRequests()
    } catch (error) {
      console.error("[v0] Error cancelling leave request:", error)
      toast({
        title: "Cancellation Failed",
        description: "Failed to cancel leave request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const leaveStats = {
    total: leaveRequests.length,
    pending: leaveRequests.filter((r) => r.status === "pending").length,
    approved: leaveRequests.filter((r) => r.status === "approved").length,
    rejected: leaveRequests.filter((r) => r.status === "rejected").length,
  }

  if (loading && leaveRequests.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-500">Apply for leave and track your requests</p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={showNewLeaveDialog} onOpenChange={setShowNewLeaveDialog}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700" disabled={loading}>
                <Plus className="h-4 w-4 mr-2" />
                Apply Leave
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Apply for Leave</DialogTitle>
                <DialogDescription>Submit a new leave request</DialogDescription>
              </DialogHeader>
              <NewLeaveForm
                newLeave={newLeave}
                setNewLeave={setNewLeave}
                onSubmit={handleSubmitLeave}
                calculateDays={calculateDays}
                loading={loading}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(leaveBalance).map(([type, balance]) => (
          <Card key={type} className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800 capitalize">
                {type.replace("_", " ")} Leave
              </CardTitle>
              <CalendarIcon className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{balance.remaining}</div>
              <p className="text-xs text-blue-600 mt-1">
                {balance.used} used / {balance.total} total
              </p>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(balance.used / balance.total) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Total Requests</CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{leaveStats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{leaveStats.pending}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{leaveStats.approved}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{leaveStats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Leave Requests */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <CardTitle>Leave Requests</CardTitle>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search requests..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={fetchLeaveRequests} disabled={loading}>
                <Download className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No leave requests found</p>
              <p className="text-sm">
                {leaveRequests.length === 0
                  ? "Apply for your first leave request"
                  : "Try adjusting your search filters"}
              </p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div
                key={request.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300 bg-gradient-to-r from-white to-gray-50"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-3 mb-3">
                      <h3 className="font-medium text-gray-900">{getLeaveTypeLabel(request.type)}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{request.id}</Badge>
                        <Badge className="bg-blue-100 text-blue-800">
                          {request.days} day{request.days > 1 ? "s" : ""}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-4">
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="h-4 w-4" />
                          <span>
                            {format(new Date(request.startDate), "MMM dd, yyyy")} -{" "}
                            {format(new Date(request.endDate), "MMM dd, yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>Applied: {format(new Date(request.appliedDate), "MMM dd, yyyy")}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>{request.reason}</span>
                      </div>
                      {request.comments && (
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span className="italic">{request.comments}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 lg:ml-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(request.status)}
                      <Badge className={getStatusColor(request.status)}>{request.status.toUpperCase()}</Badge>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {request.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelLeave(request.id)}
                            disabled={loading}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </>
                      )}

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <FileText className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Leave Request Details - {request.id}</DialogTitle>
                          </DialogHeader>
                          <LeaveDetailsModal request={request} />
                        </DialogContent>
                      </Dialog>
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

// New Leave Form Component
function NewLeaveForm({ newLeave, setNewLeave, onSubmit, calculateDays, loading }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="leaveType">Leave Type *</Label>
          <Select
            value={newLeave.type}
            onValueChange={(value) => setNewLeave({ ...newLeave, type: value })}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select leave type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sick">Sick Leave</SelectItem>
              <SelectItem value="casual">Casual Leave</SelectItem>
              <SelectItem value="annual">Annual Leave</SelectItem>
              <SelectItem value="emergency">Emergency Leave</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Emergency Contact</Label>
          <Input
            value={newLeave.emergencyContact}
            onChange={(e) => setNewLeave({ ...newLeave, emergencyContact: e.target.value })}
            placeholder="+91 9876543210"
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal bg-transparent"
                disabled={loading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {newLeave.startDate ? format(newLeave.startDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={newLeave.startDate}
                onSelect={(date) => setNewLeave({ ...newLeave, startDate: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>End Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal bg-transparent"
                disabled={loading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {newLeave.endDate ? format(newLeave.endDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={newLeave.endDate}
                onSelect={(date) => setNewLeave({ ...newLeave, endDate: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {newLeave.startDate && newLeave.endDate && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            Total Days: <span className="font-bold">{calculateDays()}</span>
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="reason">Reason *</Label>
        <Textarea
          id="reason"
          value={newLeave.reason}
          onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
          placeholder="Please provide reason for leave..."
          rows={3}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="comments">Additional Comments</Label>
        <Textarea
          id="comments"
          value={newLeave.comments}
          onChange={(e) => setNewLeave({ ...newLeave, comments: e.target.value })}
          placeholder="Any additional information..."
          rows={2}
          disabled={loading}
        />
      </div>

      <Button onClick={onSubmit} className="w-full" disabled={loading}>
        <Save className="h-4 w-4 mr-2" />
        {loading ? "Submitting..." : "Submit Leave Request"}
      </Button>
    </div>
  )
}

// Leave Details Modal Component
function LeaveDetailsModal({ request }: { request: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <Label className="font-medium">Leave Type</Label>
          <p className="text-gray-600">{getLeaveTypeLabel(request.type)}</p>
        </div>
        <div>
          <Label className="font-medium">Duration</Label>
          <p className="text-gray-600">
            {request.days} day{request.days > 1 ? "s" : ""}
          </p>
        </div>
        <div>
          <Label className="font-medium">Start Date</Label>
          <p className="text-gray-600">{format(new Date(request.startDate), "PPP")}</p>
        </div>
        <div>
          <Label className="font-medium">End Date</Label>
          <p className="text-gray-600">{format(new Date(request.endDate), "PPP")}</p>
        </div>
        <div>
          <Label className="font-medium">Applied Date</Label>
          <p className="text-gray-600">{format(new Date(request.appliedDate), "PPP")}</p>
        </div>
        <div>
          <Label className="font-medium">Status</Label>
          <Badge className={getStatusColor(request.status)}>{request.status.toUpperCase()}</Badge>
        </div>
      </div>

      <div>
        <Label className="font-medium">Reason</Label>
        <p className="text-gray-600 mt-1">{request.reason}</p>
      </div>

      {request.comments && (
        <div>
          <Label className="font-medium">Comments</Label>
          <p className="text-gray-600 mt-1">{request.comments}</p>
        </div>
      )}

      {request.approvedBy && (
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="font-medium">Approved/Rejected By</Label>
              <p className="text-gray-600">{request.approvedBy}</p>
            </div>
            <div>
              <Label className="font-medium">Decision Date</Label>
              <p className="text-gray-600">{format(new Date(request.approvedDate), "PPP")}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function getLeaveTypeLabel(type: string) {
  switch (type) {
    case "sick":
    case "sick_leave":
      return "Sick Leave"
    case "casual":
    case "casual_leave":
      return "Casual Leave"
    case "annual":
    case "annual_leave":
      return "Annual Leave"
    case "emergency":
    case "emergency_leave":
      return "Emergency Leave"
    default:
      return type
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800"
    case "rejected":
      return "bg-red-100 text-red-800"
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    case "cancelled":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}
