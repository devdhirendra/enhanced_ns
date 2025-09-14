"use client"
import type React from "react"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Plus, Eye, Check, X, Clock, Users, UserCheck, UserX, Download, Loader2, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { leaveApi } from "@/lib/api"

interface LeaveRequest {
  id: string
  employeeId: string
  employeeName: string
  employeeRole: string
  operator: string
  leaveType: string
  startDate: string
  endDate: string
  days: number
  reason: string
  status: "pending" | "approved" | "rejected"
  appliedDate: string
  approvedBy: string | null
  approvedDate: string | null
  documents: string[]
}

interface LeavePolicy {
  id: string
  name: string
  type: string
  daysPerYear: number
  carryForward: boolean
  maxCarryForward: number
  applicableRoles: string[]
  description: string
}

interface EmployeeBalance {
  employeeId: string
  employeeName: string
  role: string
  operator: string
  annual: { total: number; used: number; remaining: number }
  sick: { total: number; used: number; remaining: number }
  emergency: { total: number; used: number; remaining: number }
}

// Skeleton Components
const StatsCardSkeleton = () => (
  <Card className="border-0 shadow-lg">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-5 w-5 rounded" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-12 mb-2" />
      <Skeleton className="h-3 w-16" />
    </CardContent>
  </Card>
)

const TableRowSkeleton = () => (
  <TableRow>
    <TableCell>
      <div className="space-y-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
    </TableCell>
    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
    <TableCell>
      <div className="space-y-1">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-3 w-20" />
      </div>
    </TableCell>
    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
    <TableCell>
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </TableCell>
  </TableRow>
)

const PolicyCardSkeleton = () => (
  <Card className="border-0 shadow-lg">
    <CardHeader>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
      <div className="flex space-x-2 pt-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
      </div>
    </CardContent>
  </Card>
)

export default function LeaveManagementPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showPolicyDialog, setShowPolicyDialog] = useState(false)
  const [leaveRequestsData, setLeaveRequestsData] = useState<LeaveRequest[]>([])
  const [leavePolicies, setLeavePolicies] = useState<LeavePolicy[]>([])
  const [employeeBalances, setEmployeeBalances] = useState<EmployeeBalance[]>([])
  
  // Loading states
  const [loading, setLoading] = useState(true)
  const [requestsLoading, setRequestsLoading] = useState(true)
  const [policiesLoading, setPoliciesLoading] = useState(true)
  const [balancesLoading, setBalancesLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  // Error states
  const [error, setError] = useState<string | null>(null)

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      setError(null)
      await Promise.all([
        fetchLeaveRequests(),
        fetchLeavePolicies(),
        fetchEmployeeBalances()
      ])
    } catch (err) {
      setError('Failed to load data. Please refresh the page.')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchLeaveRequests = async () => {
    try {
      setRequestsLoading(true)
      const requests = await leaveApi.getAll()
      setLeaveRequestsData(requests)
    } catch (err) {
      console.error('Error fetching leave requests:', err)
      toast.error('Failed to load leave requests')
    } finally {
      setRequestsLoading(false)
    }
  }

  const fetchLeavePolicies = async () => {
    try {
      setPoliciesLoading(true)
      // Add API call when available
      // const policies = await leaveApi.getPolicies()
      // setLeavePolicies(policies)
      
      // Demo data for now
      setLeavePolicies([
        {
          id: "LP001",
          name: "Annual Leave",
          type: "annual",
          daysPerYear: 21,
          carryForward: true,
          maxCarryForward: 5,
          applicableRoles: ["Technician", "Staff", "Operator"],
          description: "Paid annual leave for all employees",
        },
        {
          id: "LP002",
          name: "Sick Leave",
          type: "sick",
          daysPerYear: 12,
          carryForward: false,
          maxCarryForward: 0,
          applicableRoles: ["Technician", "Staff", "Operator"],
          description: "Medical leave with doctor's certificate required for more than 2 days",
        },
        {
          id: "LP003",
          name: "Emergency Leave",
          type: "emergency",
          daysPerYear: 5,
          carryForward: false,
          maxCarryForward: 0,
          applicableRoles: ["Technician", "Staff"],
          description: "Unpaid emergency leave for urgent personal matters",
        },
      ])
    } catch (err) {
      console.error('Error fetching leave policies:', err)
      toast.error('Failed to load leave policies')
    } finally {
      setPoliciesLoading(false)
    }
  }

  const fetchEmployeeBalances = async () => {
    try {
      setBalancesLoading(true)
      // Add API call when available
      // const balances = await leaveApi.getBalances()
      // setEmployeeBalances(balances)
      
      // Demo data for now
      setEmployeeBalances([
        {
          employeeId: "TECH001",
          employeeName: "Ravi Kumar",
          role: "Technician",
          operator: "City Networks",
          annual: { total: 21, used: 5, remaining: 16 },
          sick: { total: 12, used: 2, remaining: 10 },
          emergency: { total: 5, used: 0, remaining: 5 },
        },
        {
          employeeId: "STAFF001",
          employeeName: "Priya Singh",
          role: "Staff",
          operator: "Metro Fiber",
          annual: { total: 21, used: 8, remaining: 13 },
          sick: { total: 12, used: 1, remaining: 11 },
          emergency: { total: 5, used: 1, remaining: 4 },
        },
      ])
    } catch (err) {
      console.error('Error fetching employee balances:', err)
      toast.error('Failed to load employee balances')
    } finally {
      setBalancesLoading(false)
    }
  }

  const filteredRequests = leaveRequestsData.filter((request) => {
    const matchesSearch =
      request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    const matchesRole = roleFilter === "all" || request.employeeRole === roleFilter
    return matchesSearch && matchesStatus && matchesRole
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case "annual":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "sick":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "emergency":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleApproveRequest = async (requestId: string) => {
    try {
      setActionLoading(requestId)
      await leaveApi.approve(requestId)
      
      // Update local state immediately for better UX
      setLeaveRequestsData((prevRequests) =>
        prevRequests.map((request) =>
          request.id === requestId
            ? {
                ...request,
                status: "approved" as const,
                approvedBy: user?.profileDetail.user_id || "Admin",
                approvedDate: new Date().toISOString(),
              }
            : request,
        ),
      )
      
      toast.success("Leave request approved successfully!")
    } catch (error) {
      console.error("Error approving leave request:", error)
      toast.error("Failed to approve leave request. Please try again.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    try {
      setActionLoading(requestId)
      await leaveApi.reject(requestId)
      
      // Update local state immediately for better UX
      setLeaveRequestsData((prevRequests) =>
        prevRequests.map((request) =>
          request.id === requestId
            ? {
                ...request,
                status: "rejected" as const,
                approvedBy: user?.user_id || "Admin",
                approvedDate: new Date().toISOString(),
              }
            : request,
        ),
      )
      
      toast.success("Leave request rejected!")
    } catch (error) {
      console.error("Error rejecting leave request:", error)
      toast.error("Failed to reject leave request. Please try again.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteRequest = async (requestId: string) => {
    try {
      setActionLoading(requestId)
      await leaveApi.delete(requestId)
      
      setLeaveRequestsData((prevRequests) =>
        prevRequests.filter((request) => request.id !== requestId)
      )
      
      toast.success("Leave request deleted successfully!")
    } catch (error) {
      console.error("Error deleting leave request:", error)
      toast.error("Failed to delete leave request. Please try again.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleExport = () => {
    try {
      const csvContent = [
        ['Employee Name', 'Role', 'Operator', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Reason', 'Status', 'Applied Date'],
        ...filteredRequests.map(request => [
          request.employeeName,
          request.employeeRole,
          request.operator,
          request.leaveType,
          request.startDate,
          request.endDate,
          request.days.toString(),
          request.reason,
          request.status,
          request.appliedDate
        ])
      ].map(row => row.join(',')).join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `leave_requests_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast.success("Leave data exported successfully!")
    } catch (error) {
      console.error("Error exporting data:", error)
      toast.error("Failed to export data. Please try again.")
    }
  }

  const handleViewDetails = (request: LeaveRequest) => {
    setSelectedRequest(request)
    setShowDetailsDialog(true)
  }

  // Calculate stats
  const pendingRequests = leaveRequestsData.filter((r) => r.status === "pending").length
  const approvedRequests = leaveRequestsData.filter((r) => r.status === "approved").length
  const rejectedRequests = leaveRequestsData.filter((r) => r.status === "rejected").length
  const totalRequests = leaveRequestsData.length

  if (error) {
    return (
      <DashboardLayout title="Leave Management" description="Manage employee leave requests and policies">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={fetchAllData} variant="outline">
            <Loader2 className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Leave Management" description="Manage employee leave requests and policies">
      <div className="space-y-4 md:space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)
          ) : (
            <>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Total Requests</CardTitle>
                  <Users className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">{totalRequests}</div>
                  <p className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2">This month</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100 hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Pending</CardTitle>
                  <Clock className="h-4 w-4 md:h-5 md:w-5 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">{pendingRequests}</div>
                  <p className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2">Awaiting approval</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100 hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Approved</CardTitle>
                  <UserCheck className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">{approvedRequests}</div>
                  <p className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2">This month</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-rose-100 hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Rejected</CardTitle>
                  <UserX className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">{rejectedRequests}</div>
                  <p className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2">This month</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="requests" className="space-y-4 md:space-y-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <TabsList className="grid w-full max-w-lg grid-cols-3 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger 
                value="requests" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs md:text-sm"
              >
                Leave Requests
              </TabsTrigger>
              <TabsTrigger 
                value="balances" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs md:text-sm"
              >
                Leave Balances
              </TabsTrigger>
              <TabsTrigger 
                value="policies" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs md:text-sm"
              >
                Leave Policies
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center space-x-2 w-full lg:w-auto">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExport}
                className="flex-1 lg:flex-initial bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Dialog open={showPolicyDialog} onOpenChange={setShowPolicyDialog}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex-1 lg:flex-initial"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Add Policy</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl mx-4">
                  <DialogHeader>
                    <DialogTitle>Create Leave Policy</DialogTitle>
                    <DialogDescription>Define a new leave policy for employees</DialogDescription>
                  </DialogHeader>
                  <LeavePolicyForm onClose={() => setShowPolicyDialog(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <TabsContent value="requests" className="space-y-4 md:space-y-6">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by employee name or request ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40 lg:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-40 lg:w-48">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="Technician">Technician</SelectItem>
                  <SelectItem value="Staff">Staff</SelectItem>
                  <SelectItem value="Operator">Operator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Leave Requests Table */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl font-bold text-gray-900">
                  Leave Requests ({filteredRequests.length})
                </CardTitle>
                <CardDescription>Manage employee leave requests and approvals</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px]">Employee</TableHead>
                        <TableHead className="min-w-[100px]">Leave Type</TableHead>
                        <TableHead className="min-w-[120px]">Duration</TableHead>
                        <TableHead className="min-w-[200px]">Reason</TableHead>
                        <TableHead className="min-w-[100px]">Applied Date</TableHead>
                        <TableHead className="min-w-[80px]">Status</TableHead>
                        <TableHead className="min-w-[150px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requestsLoading ? (
                        Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
                      ) : filteredRequests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            No leave requests found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRequests.map((request) => (
                          <TableRow key={request.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div>
                                <div className="font-medium text-gray-900 text-sm md:text-base">
                                  {request.employeeName}
                                </div>
                                <div className="text-xs md:text-sm text-gray-500">{request.employeeRole}</div>
                                <div className="text-xs md:text-sm text-gray-500">{request.operator}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                className={`${getLeaveTypeColor(request.leaveType)} text-xs md:text-sm border`}
                              >
                                {request.leaveType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium text-sm md:text-base">{request.days} days</div>
                                <div className="text-xs md:text-sm text-gray-500">
                                  {format(new Date(request.startDate), "MMM dd")} -{" "}
                                  {format(new Date(request.endDate), "MMM dd")}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs truncate text-xs md:text-sm" title={request.reason}>
                                {request.reason}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs md:text-sm">
                              {format(new Date(request.appliedDate), "MMM dd, yyyy")}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                className={`${getStatusColor(request.status)} text-xs md:text-sm border`}
                              >
                                {request.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1 md:space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 hover:bg-blue-50" 
                                  onClick={() => handleViewDetails(request)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {request.status === "pending" && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                      onClick={() => handleApproveRequest(request.id)}
                                      disabled={actionLoading === request.id}
                                    >
                                      {actionLoading === request.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Check className="h-4 w-4" />
                                      )}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => handleRejectRequest(request.id)}
                                      disabled={actionLoading === request.id}
                                    >
                                      {actionLoading === request.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <X className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="balances" className="space-y-4 md:space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl font-bold text-gray-900">Employee Leave Balances</CardTitle>
                <CardDescription>Current leave balance for all employees</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px]">Employee</TableHead>
                        <TableHead className="min-w-[140px]">Annual Leave</TableHead>
                        <TableHead className="min-w-[140px]">Sick Leave</TableHead>
                        <TableHead className="min-w-[140px]">Emergency Leave</TableHead>
                        <TableHead className="min-w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {balancesLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <div className="space-y-1">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-3 w-20" />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-2 w-full" />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-2 w-full" />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-2 w-full" />
                              </div>
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-8 w-24" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        employeeBalances.map((employee) => (
                          <TableRow key={employee.employeeId} className="hover:bg-gray-50">
                            <TableCell>
                              <div>
                                <div className="font-medium text-gray-900 text-sm md:text-base">
                                  {employee.employeeName}
                                </div>
                                <div className="text-xs md:text-sm text-gray-500">{employee.role}</div>
                                <div className="text-xs md:text-sm text-gray-500">{employee.operator}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-xs md:text-sm">
                                  <span className="font-medium">{employee.annual.remaining}</span> /{" "}
                                  {employee.annual.total} days
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                    style={{ width: `${(employee.annual.remaining / employee.annual.total) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-xs md:text-sm">
                                  <span className="font-medium">{employee.sick.remaining}</span> / {employee.sick.total}{" "}
                                  days
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-orange-600 h-2 rounded-full transition-all"
                                    style={{ width: `${(employee.sick.remaining / employee.sick.total) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-xs md:text-sm">
                                  <span className="font-medium">{employee.emergency.remaining}</span> /{" "}
                                  {employee.emergency.total} days
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-red-600 h-2 rounded-full transition-all"
                                    style={{
                                      width: `${(employee.emergency.remaining / employee.emergency.total) * 100}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50">
                                <Eye className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">View Details</span>
                                <span className="sm:hidden">View</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies" className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {policiesLoading ? (
                Array.from({ length: 3 }).map((_, i) => <PolicyCardSkeleton key={i} />)
              ) : (
                leavePolicies.map((policy) => (
                  <Card 
                    key={policy.id} 
                    className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base md:text-lg font-bold text-gray-900">
                          {policy.name}
                        </CardTitle>
                        <Badge className={`${getLeaveTypeColor(policy.type)} border text-xs md:text-sm`}>
                          {policy.type}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs md:text-sm">{policy.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 md:space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs md:text-sm">
                          <span className="text-gray-600">Days per year:</span>
                          <span className="font-medium">{policy.daysPerYear}</span>
                        </div>
                        <div className="flex justify-between text-xs md:text-sm">
                          <span className="text-gray-600">Carry forward:</span>
                          <span className="font-medium">{policy.carryForward ? "Yes" : "No"}</span>
                        </div>
                        {policy.carryForward && (
                          <div className="flex justify-between text-xs md:text-sm">
                            <span className="text-gray-600">Max carry forward:</span>
                            <span className="font-medium">{policy.maxCarryForward} days</span>
                          </div>
                        )}
                        <div className="text-xs md:text-sm">
                          <span className="text-gray-600">Applicable roles:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {policy.applicableRoles.map((role, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1 bg-white hover:bg-gray-50">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 bg-white hover:bg-gray-50">
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Leave Request Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Leave Request Details</DialogTitle>
              <DialogDescription>Complete information about the leave request</DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Employee Information</h4>
                    <div className="space-y-2 text-xs md:text-sm">
                      <div>
                        <span className="font-medium">Name:</span> {selectedRequest.employeeName}
                      </div>
                      <div>
                        <span className="font-medium">Role:</span> {selectedRequest.employeeRole}
                      </div>
                      <div>
                        <span className="font-medium">Operator:</span> {selectedRequest.operator}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Leave Details</h4>
                    <div className="space-y-2 text-xs md:text-sm">
                      <div>
                        <span className="font-medium">Type:</span>{" "}
                        <Badge className={`${getLeaveTypeColor(selectedRequest.leaveType)} border ml-1`}>
                          {selectedRequest.leaveType}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span> {selectedRequest.days} days
                      </div>
                      <div>
                        <span className="font-medium">Dates:</span>{" "}
                        {format(new Date(selectedRequest.startDate), "MMM dd, yyyy")} -{" "}
                        {format(new Date(selectedRequest.endDate), "MMM dd, yyyy")}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Reason</h4>
                  <p className="text-xs md:text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedRequest.reason}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Application Details</h4>
                    <div className="space-y-2 text-xs md:text-sm">
                      <div>
                        <span className="font-medium">Applied Date:</span>{" "}
                        {format(new Date(selectedRequest.appliedDate), "MMM dd, yyyy")}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>{" "}
                        <Badge className={`${getStatusColor(selectedRequest.status)} border ml-1`}>
                          {selectedRequest.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Approval Details</h4>
                    <div className="space-y-2 text-xs md:text-sm">
                      <div>
                        <span className="font-medium">Approved By:</span> {selectedRequest.approvedBy || "N/A"}
                      </div>
                      <div>
                        <span className="font-medium">Approved Date:</span>{" "}
                        {selectedRequest.approvedDate
                          ? format(new Date(selectedRequest.approvedDate), "MMM dd, yyyy")
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
                {selectedRequest.documents && selectedRequest.documents.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Documents</h4>
                    <div className="space-y-2">
                      {selectedRequest.documents.map((doc, index) => (
                        <div key={index} className="flex items-center space-x-2 text-xs md:text-sm">
                          <span className="text-blue-600 underline cursor-pointer hover:text-blue-800">
                            {doc}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedRequest.status === "pending" && (
                  <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50 bg-white order-2 sm:order-1"
                      onClick={() => {
                        handleRejectRequest(selectedRequest.id)
                        setShowDetailsDialog(false)
                      }}
                      disabled={actionLoading === selectedRequest.id}
                    >
                      {actionLoading === selectedRequest.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <X className="h-4 w-4 mr-2" />
                      )}
                      Reject
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700 order-1 sm:order-2"
                      onClick={() => {
                        handleApproveRequest(selectedRequest.id)
                        setShowDetailsDialog(false)
                      }}
                      disabled={actionLoading === selectedRequest.id}
                    >
                      {actionLoading === selectedRequest.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

interface LeavePolicyFormData {
  name: string
  type: string
  daysPerYear: string
  carryForward: boolean
  maxCarryForward: string
  description: string
  applicableRoles: string[]
}

// Enhanced Leave Policy Form Component
function LeavePolicyForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState<LeavePolicyFormData>({
    name: "",
    type: "annual",
    daysPerYear: "",
    carryForward: false,
    maxCarryForward: "",
    description: "",
    applicableRoles: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSubmitting(true)
      
      // TODO: Add API call when backend is ready
      // await leaveApi.createPolicy(formData)
      
      toast.success("Leave policy created successfully!")
      console.log("Policy form submitted:", formData)
      onClose()
    } catch (error) {
      console.error("Error creating policy:", error)
      toast.error("Failed to create leave policy. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRoleToggle = (role: string) => {
    setFormData(prev => ({
      ...prev,
      applicableRoles: prev.applicableRoles.includes(role)
        ? prev.applicableRoles.filter(r => r !== role)
        : [...prev.applicableRoles, role]
    }))
  }

  const roles = ["Technician", "Staff", "Operator", "Manager"]

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="text-sm font-medium">Policy Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Annual Leave Policy"
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="type" className="text-sm font-medium">Leave Type *</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="annual">Annual Leave</SelectItem>
              <SelectItem value="sick">Sick Leave</SelectItem>
              <SelectItem value="emergency">Emergency Leave</SelectItem>
              <SelectItem value="maternity">Maternity Leave</SelectItem>
              <SelectItem value="paternity">Paternity Leave</SelectItem>
              <SelectItem value="bereavement">Bereavement Leave</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="daysPerYear" className="text-sm font-medium">Days Per Year *</Label>
          <Input
            id="daysPerYear"
            type="number"
            min="1"
            max="365"
            value={formData.daysPerYear}
            onChange={(e) => setFormData({ ...formData, daysPerYear: e.target.value })}
            placeholder="e.g., 21"
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="maxCarryForward" className="text-sm font-medium">Max Carry Forward Days</Label>
          <Input
            id="maxCarryForward"
            type="number"
            min="0"
            value={formData.maxCarryForward}
            onChange={(e) => setFormData({ ...formData, maxCarryForward: e.target.value })}
            placeholder="e.g., 5"
            disabled={!formData.carryForward}
            className="mt-1"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2 py-2">
        <input
          type="checkbox"
          id="carryForward"
          checked={formData.carryForward}
          onChange={(e) => setFormData({ ...formData, carryForward: e.target.checked })}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <Label htmlFor="carryForward" className="text-sm font-medium cursor-pointer">
          Allow carry forward to next year
        </Label>
      </div>
      
      <div>
        <Label className="text-sm font-medium">Applicable Roles *</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {roles.map((role) => (
            <div key={role} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={role}
                checked={formData.applicableRoles.includes(role)}
                onChange={() => handleRoleToggle(role)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor={role} className="text-sm cursor-pointer">
                {role}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <Label htmlFor="description" className="text-sm font-medium">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the policy details and conditions..."
          rows={3}
          className="mt-1 resize-none"
        />
      </div>
      
      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          disabled={isSubmitting}
          className="order-2 sm:order-1 bg-white hover:bg-gray-50"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || !formData.name || !formData.daysPerYear || formData.applicableRoles.length === 0}
          className="order-1 sm:order-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Policy'
          )}
        </Button>
      </div>
    </form>
  )
}
