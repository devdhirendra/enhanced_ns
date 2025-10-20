"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Save,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RefreshCw,
  Users,
  UserCheck,
  UserX,
} from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { leaveRequestApi, leaveBalanceApi } from "@/lib/leave-api"
import { toast } from "sonner"

interface LeaveRequest {
  leaveId: string
  userId: string
  userName: string
  userRole: string
  leaveType: string
  policyId: string
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  status: "pending" | "approved" | "rejected"
  approvedBy?: string
  rejectionReason?: string
  documents?: string[]
  createdAt: string
}

interface UserPolicy {
  policyId: string
  policyName: string
  leaveType: string
  daysPerYear: number
  maxCarryForwardDays: number
  allowCarryForward: boolean
  applicableRoles: string[]
  description: string
  balance: {
    totalDays: number
    usedDays: number
    remainingDays: number
  }
}

export default function LeavePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("requests")
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [userPolicies, setUserPolicies] = useState<UserPolicy[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [showNewLeaveDialog, setShowNewLeaveDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const itemsPerPage = 5

  const [newLeave, setNewLeave] = useState({
    leaveType: "",
    policyId: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    reason: "",
    documents: [] as string[],
  })

  useEffect(() => {
    if (user?.user_id) {
      fetchAllData()
    }
  }, [user])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      await Promise.all([fetchLeaveRequests(), fetchUserPolicies()])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load leave data")
    } finally {
      setLoading(false)
    }
  }

  const fetchLeaveRequests = async () => {
    if (!user?.user_id) return

    try {
      const response = await leaveRequestApi.getMyRequests(user.user_id)
      
      let requestsData = []
      
      if (response.success) {
        if (Array.isArray(response.data)) {
          requestsData = response.data
        } else if (response.data && Array.isArray(response.data.requests)) {
          requestsData = response.data.requests
        } else if (response.data && Array.isArray(response.data.data)) {
          requestsData = response.data.data
        }
      }

      const requests = requestsData.map((item: any) => ({
        leaveId: item.leaveId || item.id || `REQ${Date.now()}`,
        userId: item.userId || user.user_id,
        userName: item.userName || user.profileDetail?.name || "Unknown",
        userRole: item.userRole || user.role || "Technician",
        leaveType: item.leaveType || "Annual Leave",
        policyId: item.policyId || "",
        startDate: item.startDate || item.start_date || new Date().toISOString(),
        endDate: item.endDate || item.end_date || new Date().toISOString(),
        totalDays: item.totalDays || item.days || 0,
        reason: item.reason || "No reason provided",
        status: (item.status || "pending") as "pending" | "approved" | "rejected",
        approvedBy: item.approvedBy,
        rejectionReason: item.rejectionReason,
        documents: item.documents || [],
        createdAt: item.createdAt || item.created_at || new Date().toISOString(),
      }))

      setLeaveRequests(requests)
    } catch (error) {
      console.error("Error fetching leave requests:", error)
      toast.error("Failed to load leave requests")
      setLeaveRequests([])
    }
  }

  const fetchUserPolicies = async () => {
    if (!user?.user_id) return

    try {
      const response = await leaveBalanceApi.getMyPolicies(user.user_id)
      
      let policiesData = []
      
      if (response.success) {
        if (Array.isArray(response.data)) {
          policiesData = response.data
        } else if (response.data && Array.isArray(response.data.policies)) {
          policiesData = response.data.policies
        } else if (response.data && Array.isArray(response.data.data)) {
          policiesData = response.data.data
        } else if (response.data && response.data.userId) {
          // Handle the case where policies are nested in user object
          policiesData = response.data.policies || []
        }
      }

      const policies = policiesData.map((policy: any) => ({
        policyId: policy.policyId || policy.id || "",
        policyName: policy.policyName || policy.name || "",
        leaveType: policy.leaveType || policy.type || "",
        daysPerYear: policy.daysPerYear || policy.days_per_year || 0,
        maxCarryForwardDays: policy.maxCarryForwardDays || policy.max_carry_forward || 0,
        allowCarryForward: policy.allowCarryForward || policy.allow_carry_forward || false,
        applicableRoles: policy.applicableRoles || policy.applicable_roles || [],
        description: policy.description || "No description available",
        balance: {
          totalDays: policy.totalDays || policy.total_days || 0,
          usedDays: policy.usedDays || policy.used_days || 0,
          remainingDays: policy.remainingDays || policy.remaining_days || 0,
        }
      }))

      setUserPolicies(policies)
    } catch (error) {
      console.error("Error fetching user policies:", error)
      toast.error("Failed to load leave policies")
      setUserPolicies([])
    }
  }

  const filteredAndSortedRequests = leaveRequests
    .filter((request) => {
      const matchesSearch =
        request.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.leaveId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.leaveType.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || request.status === statusFilter

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof LeaveRequest]
      let bValue: any = b[sortBy as keyof LeaveRequest]

      if (sortBy === "createdAt" || sortBy === "startDate" || sortBy === "endDate") {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      } else if (sortBy === "totalDays") {
        aValue = Number(aValue)
        bValue = Number(bValue)
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const totalPages = Math.ceil(filteredAndSortedRequests.length / itemsPerPage)
  const paginatedRequests = filteredAndSortedRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
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

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case "Annual Leave":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Sick Leave":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Emergency Leave":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const calculateDays = () => {
    if (newLeave.startDate && newLeave.endDate) {
      const diffDays = differenceInDays(newLeave.endDate, newLeave.startDate) + 1
      return diffDays > 0 ? diffDays : 0
    }
    return 0
  }

  const handleSubmitLeave = async () => {
    if (!newLeave.leaveType || !newLeave.policyId || !newLeave.startDate || !newLeave.endDate || !newLeave.reason) {
      toast.error("Please fill all required fields")
      return
    }

    if (!user?.user_id) {
      toast.error("User not found")
      return
    }

    const totalDays = calculateDays()
    if (totalDays <= 0) {
      toast.error("End date must be after start date")
      return
    }

    // Check if selected policy has sufficient balance
    const selectedPolicy = userPolicies.find(p => p.policyId === newLeave.policyId)
    if (selectedPolicy && totalDays > selectedPolicy.balance.remainingDays) {
      toast.error(`Insufficient leave balance. Available: ${selectedPolicy.balance.remainingDays} days`)
      return
    }

    try {
      setSubmitting(true)

      const leaveData = {
        leaveType: newLeave.leaveType,
        policyId: newLeave.policyId,
        startDate: format(newLeave.startDate, "yyyy-MM-dd"),
        endDate: format(newLeave.endDate, "yyyy-MM-dd"),
        reason: newLeave.reason,
        documents: newLeave.documents,
      }

      const response = await leaveRequestApi.create(user.user_id, leaveData)

      if (response.success) {
        toast.success("Leave request submitted successfully!")
        await fetchAllData()
        setShowNewLeaveDialog(false)
        setCurrentPage(1)
        
        // Reset form
        setNewLeave({
          leaveType: "",
          policyId: "",
          startDate: undefined,
          endDate: undefined,
          reason: "",
          documents: [],
        })
      } else {
        toast.error(response.error || "Failed to submit leave request")
      }
    } catch (error) {
      console.error("Error submitting leave request:", error)
      toast.error("Failed to submit leave request. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const leaveStats = {
    total: leaveRequests.length,
    pending: leaveRequests.filter((r) => r.status === "pending").length,
    approved: leaveRequests.filter((r) => r.status === "approved").length,
    rejected: leaveRequests.filter((r) => r.status === "rejected").length,
  }

  if (loading && leaveRequests.length === 0 && userPolicies.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-500">Apply for leave and track your requests</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchAllData}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={showNewLeaveDialog} onOpenChange={setShowNewLeaveDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" disabled={submitting}>
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
                loading={submitting}
                userPolicies={userPolicies}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Requests</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{leaveStats.total}</div>
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

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger
            value="requests"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            My Requests
          </TabsTrigger>
          <TabsTrigger
            value="policies"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Leave Policies
          </TabsTrigger>
        </TabsList>

        {/* Leave Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          {/* Leave Balance Cards */}
          {/* {userPolicies.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {userPolicies.map((policy) => (
                <Card key={policy.policyId} className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-800">{policy.policyName}</CardTitle>
                    <CalendarIcon className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-900">{policy.balance.remainingDays}</div>
                    <p className="text-xs text-blue-600 mt-1">
                      {policy.balance.usedDays} used / {policy.balance.totalDays} total
                    </p>
                    <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min(100, (policy.balance.usedDays / policy.balance.totalDays) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )} */}

          {/* Leave Requests Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <CardTitle>Leave Requests ({filteredAndSortedRequests.length})</CardTitle>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search requests..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="pl-10 w-full md:w-64"
                    />
                  </div>
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => {
                      setStatusFilter(value)
                      setCurrentPage(1)
                    }}
                  >
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
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4 pb-4 border-b">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Applied Date</SelectItem>
                      <SelectItem value="startDate">Start Date</SelectItem>
                      <SelectItem value="totalDays">Duration</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  Showing {paginatedRequests.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredAndSortedRequests.length)} of{" "}
                  {filteredAndSortedRequests.length} requests
                </div>
              </div>

              {filteredAndSortedRequests.length === 0 ? (
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
                <>
                  <div className="space-y-4">
                    {paginatedRequests.map((request) => (
                      <div
                        key={request.leaveId}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300 bg-gradient-to-r from-white to-gray-50"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                          <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-3 mb-3">
                              <h3 className="font-medium text-gray-900">{request.leaveType}</h3>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">{request.leaveId}</Badge>
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                  {request.totalDays} day{request.totalDays > 1 ? "s" : ""}
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
                                  <span>Applied: {format(new Date(request.createdAt), "MMM dd, yyyy")}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4" />
                                <span className="line-clamp-1">{request.reason}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col space-y-2 lg:ml-4">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(request.status)}
                              <Badge className={getStatusColor(request.status)}>
                                {request.status.toUpperCase()}
                              </Badge>
                            </div>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <FileText className="h-4 w-4 mr-1" />
                                  Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Leave Request Details - {request.leaveId}</DialogTitle>
                                </DialogHeader>
                                <LeaveDetailsModal request={request} />
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
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
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leave Policies Tab */}
        <TabsContent value="policies" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {userPolicies.length === 0 ? (
              <Card className="col-span-full border-0 shadow-lg">
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">No leave policies available for your role.</p>
                </CardContent>
              </Card>
            ) : (
              userPolicies.map((policy) => (
                <Card
                  key={policy.policyId}
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-gray-900">
                        {policy.policyName}
                      </CardTitle>
                      <Badge className={`${getLeaveTypeColor(policy.leaveType)} border`}>
                        {policy.leaveType}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{policy.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Days per year:</span>
                        <span className="font-medium">{policy.daysPerYear}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Carry forward:</span>
                        <span className="font-medium">{policy.allowCarryForward ? "Yes" : "No"}</span>
                      </div>
                      {policy.allowCarryForward && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Max carry forward:</span>
                          <span className="font-medium">{policy.maxCarryForwardDays} days</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Available balance:</span>
                        <span className="font-medium text-green-600">{policy.balance.remainingDays} days</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Used days:</span>
                        <span className="font-medium text-orange-600">{policy.balance.usedDays}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Applicable to:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {policy.applicableRoles.map((role, index) => (
                            <Badge key={index} variant="secondary" className="text-xs capitalize">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Usage</span>
                        <span>{Math.round((policy.balance.usedDays / policy.balance.totalDays) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.min(100, (policy.balance.usedDays / policy.balance.totalDays) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// NewLeaveForm and LeaveDetailsModal components remain the same as previous version
// ... (include the NewLeaveForm and LeaveDetailsModal components from the previous code)

function NewLeaveForm({
  newLeave,
  setNewLeave,
  onSubmit,
  calculateDays,
  loading,
  userPolicies,
}: {
  newLeave: {
    leaveType: string
    policyId: string
    startDate: Date | undefined
    endDate: Date | undefined
    reason: string
    documents: string[]
  }
  setNewLeave: (value: any) => void
  onSubmit: () => void
  calculateDays: () => number
  loading: boolean
  userPolicies: UserPolicy[]
}) {
  const selectedPolicy = userPolicies.find(p => p.policyId === newLeave.policyId)
  const totalDays = calculateDays()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="policy">Leave Policy *</Label>
          <Select
            value={newLeave.policyId}
            onValueChange={(value: string) => {
              const policy = userPolicies.find((p: UserPolicy) => p.policyId === value)
              setNewLeave({
                ...newLeave,
                policyId: value,
                leaveType: policy?.policyName || "",
              })
            }}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select leave policy" />
            </SelectTrigger>
            <SelectContent>
              {userPolicies && userPolicies.length > 0 ? (
                userPolicies.map((policy: UserPolicy) => (
                  <SelectItem key={policy.policyId} value={policy.policyId}>
                    {policy.policyName} ({policy.balance.remainingDays} days available)
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-policies" disabled>
                  No leave policies available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Available Days</Label>
          <div className="p-2 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm font-medium text-blue-900">
              {selectedPolicy ? `${selectedPolicy.balance.remainingDays} days` : "Select a policy"}
            </p>
          </div>
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
                onSelect={(date: Date | undefined) => setNewLeave({ ...newLeave, startDate: date })}
                initialFocus
                disabled={(date) => date < new Date()}
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
                onSelect={(date: Date | undefined) => setNewLeave({ ...newLeave, endDate: date })}
                initialFocus
                disabled={(date) => date < new Date(newLeave.startDate || new Date())}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {newLeave.startDate && newLeave.endDate && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            Total Days: <span className="font-bold">{totalDays}</span>
            {selectedPolicy && totalDays > selectedPolicy.balance.remainingDays && (
              <span className="text-red-600 ml-2">
                (Exceeds available balance by {totalDays - selectedPolicy.balance.remainingDays} days)
              </span>
            )}
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

      <Button 
        onClick={onSubmit} 
        className="w-full" 
        disabled={loading || !newLeave.policyId || !newLeave.startDate || !newLeave.endDate || !newLeave.reason || totalDays <= 0}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Submit Leave Request
          </>
        )}
      </Button>
    </div>
  )
}

function LeaveDetailsModal({ request }: { request: LeaveRequest }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <Label className="font-medium">Leave Type</Label>
          <p className="text-gray-600">{request.leaveType}</p>
        </div>
        <div>
          <Label className="font-medium">Duration</Label>
          <p className="text-gray-600">
            {request.totalDays} day{request.totalDays > 1 ? "s" : ""}
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
          <p className="text-gray-600">{format(new Date(request.createdAt), "PPP")}</p>
        </div>
        <div>
          <Label className="font-medium">Status</Label>
          <Badge
            className={
              request.status === "approved"
                ? "bg-green-100 text-green-800 border-green-200"
                : request.status === "rejected"
                  ? "bg-red-100 text-red-800 border-red-200"
                  : "bg-yellow-100 text-yellow-800 border-yellow-200"
            }
          >
            {request.status.toUpperCase()}
          </Badge>
        </div>
      </div>

      <div>
        <Label className="font-medium">Reason</Label>
        <p className="text-gray-600 mt-1 bg-gray-50 p-3 rounded-md">{request.reason}</p>
      </div>

      {request.approvedBy && (
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="font-medium">Approved By</Label>
              <p className="text-gray-600">{request.approvedBy}</p>
            </div>
          </div>
        </div>
      )}

      {request.rejectionReason && (
        <div className="pt-4 border-t">
          <div>
            <Label className="font-medium">Rejection Reason</Label>
            <p className="text-gray-600 mt-1 bg-gray-50 p-3 rounded-md">{request.rejectionReason}</p>
          </div>
        </div>
      )}
    </div>
  )
}