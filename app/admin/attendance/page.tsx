"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search, RefreshCw, Download, AlertCircle, Users, UserCheck, Clock, UserX, BarChart3, FileText } from "lucide-react"
import { attendanceApi } from "@/lib/attendance-api"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { useToast } from "@/hooks/use-toast"
import { AttendancePagination } from "@/components/attendance/attendance-pagination"
import { useRouter } from "next/navigation"

interface AttendanceRecord {
  sessionId: string
  user_id: string
  name: string
  role: string
  checkIn: string
  checkOut: string | null
  durationMinutes: number
  location: string
  needsRegularization: boolean
  date: string
}

interface RegularizationRequest {
  requestId: string
  userId: string
  userName: string
  date: string
  type: string
  status: "pending" | "approved" | "rejected"
  reason: string
  createdAt: string
}

interface RoleStats {
  technician: {
    total: number
    present: number
    checkedIn: number
    absent: number
  }
  staff: {
    total: number
    present: number
    checkedIn: number
    absent: number
  }
}

export default function AdminAttendancePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
  const [filteredData, setFilteredData] = useState<AttendanceRecord[]>([])
  const [regularizationRequests, setRegularizationRequests] = useState<RegularizationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [sortBy, setSortBy] = useState("checkIn")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [activeTab, setActiveTab] = useState("overview")
  const [dateFilter, setDateFilter] = useState<string>(new Date().toISOString().split("T")[0])
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [roleStats, setRoleStats] = useState<RoleStats>({
    technician: { total: 0, present: 0, checkedIn: 0, absent: 0 },
    staff: { total: 0, present: 0, checkedIn: 0, absent: 0 },
  })

  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => {
    if (activeTab === "overview") {
      fetchAttendanceData()
    } else if (activeTab === "regularization") {
      fetchRegularizationRequests()
    }
  }, [dateFilter, activeTab])

  useEffect(() => {
    applyFilters()
    calculateRoleStats()
  }, [attendanceData, searchTerm, selectedRole, selectedStatus, sortBy, sortOrder])

  const fetchAttendanceData = async () => {
    try {
      setLoading(true)
      const response = await attendanceApi.getDailyReport({ date: dateFilter })

      if (response.success && response.data) {
        const reportData = response.data.report || response.data
        const records = Array.isArray(reportData) ? reportData : []
        
        console.log("📊 Raw attendance data:", records)
        
        // Filter only technicians and staff and transform data
        const transformedRecords: AttendanceRecord[] = records
          .filter((record: any) => record.role === 'technician' || record.role === 'staff')
          .map((record: any) => ({
            sessionId: record.sessionId || `session_${record.user_id}_${dateFilter}`,
            user_id: record.userId || record.user_id || "unknown",
            name: record.name || record.userName || "Unknown Employee",
            role: record.role || "employee",
            checkIn: record.checkIn || null,
            checkOut: record.checkOut || null,
            durationMinutes: record.durationMinutes || record.totalMinutes || 0,
            location: record.location || "Not specified",
            needsRegularization: record.needsRegularization || false,
            date: record.date || dateFilter,
          }))
        
        console.log("✅ Transformed records:", transformedRecords)
        setAttendanceData(transformedRecords)
      } else {
        throw new Error(response.error || "Failed to fetch attendance data")
      }
    } catch (error) {
      console.error("[Admin] Error fetching attendance:", error)
      toast({
        title: "Error",
        description: "Failed to load attendance data",
        variant: "destructive",
      })
      setAttendanceData([])
    } finally {
      setLoading(false)
    }
  }

  const calculateRoleStats = () => {
    const stats: RoleStats = {
      technician: { total: 0, present: 0, checkedIn: 0, absent: 0 },
      staff: { total: 0, present: 0, checkedIn: 0, absent: 0 },
    }

    attendanceData.forEach(record => {
      if (record.role === 'technician' || record.role === 'staff') {
        stats[record.role as keyof RoleStats].total++
        
        if (record.checkIn && record.checkOut) {
          stats[record.role as keyof RoleStats].present++
        } else if (record.checkIn && !record.checkOut) {
          stats[record.role as keyof RoleStats].checkedIn++
        } else {
          stats[record.role as keyof RoleStats].absent++
        }
      }
    })

    setRoleStats(stats)
  }

  const fetchRegularizationRequests = async () => {
    try {
      setLoading(true)
      const response = await attendanceApi.getRegularizationRequests({
        status: "pending",
        limit: 50,
      })

      if (response.success && response.data) {
        const requestsData = response.data.requests || response.data
        const requests = Array.isArray(requestsData) ? requestsData : []
        
        const transformedRequests: RegularizationRequest[] = requests.map((request: any) => ({
          requestId: request.requestId,
          userId: request.userId,
          userName: request.userName || "Unknown User",
          date: request.date,
          type: request.type,
          status: request.status,
          reason: request.reason,
          createdAt: request.createdAt,
        }))
        
        setRegularizationRequests(transformedRequests)
      } else {
        throw new Error(response.error || "Failed to fetch regularization requests")
      }
    } catch (error) {
      console.error("[Admin] Error fetching regularization:", error)
      toast({
        title: "Error",
        description: "Failed to load regularization requests",
        variant: "destructive",
      })
      setRegularizationRequests([])
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...attendanceData]

    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.user_id?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedRole !== "all") {
      filtered = filtered.filter((record) => record.role === selectedRole)
    }

    if (selectedStatus !== "all") {
      if (selectedStatus === "present") {
        filtered = filtered.filter((record) => record.checkIn && record.checkOut)
      } else if (selectedStatus === "checked_in") {
        filtered = filtered.filter((record) => record.checkIn && !record.checkOut)
      } else if (selectedStatus === "absent") {
        filtered = filtered.filter((record) => !record.checkIn)
      }
    }

    // FIXED: Proper sorting with type safety
    filtered.sort((a, b) => {
      let aVal: string | number | Date = ""
      let bVal: string | number | Date = ""

      if (sortBy === "checkIn" || sortBy === "checkOut") {
        aVal = new Date(a[sortBy as keyof AttendanceRecord] || 0)
        bVal = new Date(b[sortBy as keyof AttendanceRecord] || 0)
      } else if (sortBy === "durationMinutes") {
        aVal = a.durationMinutes || 0
        bVal = b.durationMinutes || 0
      } else if (sortBy === "name") {
        aVal = a.name?.toLowerCase() || ""
        bVal = b.name?.toLowerCase() || ""
      } else if (sortBy === "role") {
        aVal = a.role?.toLowerCase() || ""
        bVal = b.role?.toLowerCase() || ""
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    setFilteredData(filtered)
    setCurrentPage(1)
  }

  const handleCardClick = (role: string, status?: string) => {
    setSelectedRole(role)
    if (status) {
      setSelectedStatus(status)
    }
  }

  const getStatusBadge = (record: AttendanceRecord) => {
    if (!record.checkIn) {
      return <Badge className="bg-red-100 text-red-800">Absent</Badge>
    }
    if (!record.checkOut) {
      return <Badge className="bg-yellow-100 text-yellow-800">Checked In</Badge>
    }
    return <Badge className="bg-green-100 text-green-800">Present</Badge>
  }

  // FIXED: Proper time formatting function
  const formatTime = (timeString: string | null) => {
    if (!timeString) return "---"
    try {
      return new Date(timeString).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    } catch (error) {
      console.error("Error formatting time:", timeString, error)
      return "---"
    }
  }

  const handleApproveRegularization = async (requestId: string, decision: "approve" | "reject") => {
    try {
      setApprovingId(requestId)
      const response = await attendanceApi.approveRegularization(requestId, {
        action: decision,
        approvedBy: user?.user_id || "admin",
        comments: `${decision === "approve" ? "Approved" : "Rejected"} by admin`,
      })

      if (response.success) {
        toast({
          title: "Success",
          description: `Regularization request ${decision}ed`,
        })
        fetchRegularizationRequests()
      } else {
        throw new Error(response.error)
      }
    } catch (error) {
      console.error("[Admin] Error approving regularization:", error)
      toast({
        title: "Error",
        description: "Failed to process regularization request",
        variant: "destructive",
      })
    } finally {
      setApprovingId(null)
    }
  }

  const exportToCSV = () => {
    const headers = ["Name", "Role", "Date", "Check-in", "Check-out", "Duration", "Location", "Status"]
    const rows = filteredData.map((record) => [
      record.name || "N/A",
      record.role,
      new Date(record.date).toLocaleDateString(),
      record.checkIn ? formatTime(record.checkIn) : "---",
      record.checkOut ? formatTime(record.checkOut) : "---",
      record.durationMinutes ? `${Math.floor(record.durationMinutes / 60)}h ${record.durationMinutes % 60}m` : "---",
      record.location || "---",
      !record.checkIn ? "Absent" : !record.checkOut ? "Checked In" : "Present",
    ])

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `attendance-${dateFilter}.csv`
    a.click()
  }

  const totalStats = {
    presentCount: attendanceData.filter((r) => r.checkIn && r.checkOut).length,
    absentCount: attendanceData.filter((r) => !r.checkIn).length,
    checkedInCount: attendanceData.filter((r) => r.checkIn && !r.checkOut).length,
    totalEmployees: attendanceData.length,
    totalHours: Math.round(attendanceData.reduce((acc, r) => acc + (r.durationMinutes || 0), 0) / 60),
    averageHours: attendanceData.length > 0 ? 
      Math.round(attendanceData.reduce((acc, r) => acc + (r.durationMinutes || 0), 0) / attendanceData.length / 60) : 0,
    regularizationPending: regularizationRequests.filter((r) => r.status === "pending").length,
  }

  const navigateToAnalytics = () => {
    router.push("/admin/attendance/analytics")
  }

  const navigateToReports = () => {
    router.push("/admin/attendance/reports")
  }

  if (loading && activeTab === "overview") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
        <DashboardLayout title="Attendance Management" description="Monitor and manage employee attendance records">
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div className="flex gap-2">
          <Button
            onClick={() => (activeTab === "overview" ? fetchAttendanceData() : fetchRegularizationRequests())}
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={navigateToAnalytics} variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button onClick={navigateToReports} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Reports
          </Button>
          {activeTab === "overview" && (
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="regularization">
            Regularization
            {totalStats.regularizationPending > 0 && (
              <Badge className="ml-2 bg-red-500 text-white">{totalStats.regularizationPending}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overall Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="text-center">
                  <UserCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">Present</p>
                  <p className="text-3xl font-bold text-green-600">{totalStats.presentCount}</p>
                  <p className="text-xs text-green-600 mt-1">Checked in & out</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="text-center">
                  <UserX className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">Absent</p>
                  <p className="text-3xl font-bold text-red-600">{totalStats.absentCount}</p>
                  <p className="text-xs text-red-600 mt-1">Not checked in</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">Checked In</p>
                  <p className="text-3xl font-bold text-yellow-600">{totalStats.checkedInCount}</p>
                  <p className="text-xs text-yellow-600 mt-1">Active sessions</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">Total Employees</p>
                  <p className="text-3xl font-bold text-purple-600">{totalStats.totalEmployees}</p>
                  <p className="text-xs text-purple-600 mt-1">Technicians & Staff</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Role-wise Statistics - Only Technicians and Staff */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Technicians Card */}
            <Card 
              className="bg-gradient-to-br from-blue-50 to-blue-100 cursor-pointer hover:shadow-lg transition-shadow border-2 border-blue-200"
              onClick={() => handleCardClick("technician")}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-blue-800">Technicians</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total</span>
                    <Badge variant="outline">{roleStats.technician.total}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-600">Present</span>
                    <Badge className="bg-green-100 text-green-800 cursor-pointer hover:bg-green-200"
                      onClick={(e) => { e.stopPropagation(); handleCardClick("technician", "present"); }}>
                      {roleStats.technician.present}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-yellow-600">Checked In</span>
                    <Badge className="bg-yellow-100 text-yellow-800 cursor-pointer hover:bg-yellow-200"
                      onClick={(e) => { e.stopPropagation(); handleCardClick("technician", "checked_in"); }}>
                      {roleStats.technician.checkedIn}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-red-600">Absent</span>
                    <Badge className="bg-red-100 text-red-800 cursor-pointer hover:bg-red-200"
                      onClick={(e) => { e.stopPropagation(); handleCardClick("technician", "absent"); }}>
                      {roleStats.technician.absent}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Staff Card */}
            <Card 
              className="bg-gradient-to-br from-green-50 to-green-100 cursor-pointer hover:shadow-lg transition-shadow border-2 border-green-200"
              onClick={() => handleCardClick("staff")}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-800">Staff</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total</span>
                    <Badge variant="outline">{roleStats.staff.total}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-600">Present</span>
                    <Badge className="bg-green-100 text-green-800 cursor-pointer hover:bg-green-200"
                      onClick={(e) => { e.stopPropagation(); handleCardClick("staff", "present"); }}>
                      {roleStats.staff.present}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-yellow-600">Checked In</span>
                    <Badge className="bg-yellow-100 text-yellow-800 cursor-pointer hover:bg-yellow-200"
                      onClick={(e) => { e.stopPropagation(); handleCardClick("staff", "checked_in"); }}>
                      {roleStats.staff.checkedIn}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-red-600">Absent</span>
                    <Badge className="bg-red-100 text-red-800 cursor-pointer hover:bg-red-200"
                      onClick={(e) => { e.stopPropagation(); handleCardClick("staff", "absent"); }}>
                      {roleStats.staff.absent}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>
                View and manage all employee attendance. 
                {selectedRole !== "all" && ` Filtered by: ${selectedRole}`}
                {selectedStatus !== "all" && `, Status: ${selectedStatus}`}
                {selectedRole !== "all" || selectedStatus !== "all" ? (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-2"
                    onClick={() => { setSelectedRole("all"); setSelectedStatus("all"); }}
                  >
                    Clear Filters
                  </Button>
                ) : null}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full md:w-40"
                />

                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="technician">Technician</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="checked_in">Checked In</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checkIn">Check-in Time</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="durationMinutes">Duration</SelectItem>
                    <SelectItem value="role">Role</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="w-full md:w-auto"
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </Button>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No attendance records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedData.map((record) => (
                        <TableRow key={record.sessionId}>
                          <TableCell className="font-medium">{record.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{record.role}</Badge>
                          </TableCell>
                          <TableCell>
                            {formatTime(record.checkIn)}
                          </TableCell>
                          <TableCell>
                            {formatTime(record.checkOut)}
                          </TableCell>
                          <TableCell>
                            {record.durationMinutes
                              ? `${Math.floor(record.durationMinutes / 60)}h ${record.durationMinutes % 60}m`
                              : "---"}
                          </TableCell>
                          <TableCell className="text-sm">{record.location}</TableCell>
                          <TableCell>{getStatusBadge(record)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <AttendancePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredData.length}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regularization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Regularization Requests</CardTitle>
              <CardDescription>Approve or reject attendance regularization requests</CardDescription>
            </CardHeader>
            <CardContent>
              {regularizationRequests.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No regularization requests</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {regularizationRequests.map((request) => (
                        <TableRow key={request.requestId}>
                          <TableCell className="font-medium">{request.userName}</TableCell>
                          <TableCell>{new Date(request.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{request.type}</Badge>
                          </TableCell>
                          <TableCell className="text-sm max-w-xs truncate">{request.reason}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                request.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : request.status === "approved"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                              }
                            >
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {request.status === "pending" && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApproveRegularization(request.requestId, "approve")}
                                  disabled={approvingId === request.requestId}
                                >
                                  {approvingId === request.requestId ? "Processing..." : "Approve"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApproveRegularization(request.requestId, "reject")}
                                  disabled={approvingId === request.requestId}
                                >
                                  {approvingId === request.requestId ? "Processing..." : "Reject"}
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </DashboardLayout>
  )
}