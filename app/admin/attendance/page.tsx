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
import { Search, RefreshCw, Download, AlertCircle, Users, UserCheck, Clock, UserX } from "lucide-react"
import { attendanceApi } from "@/lib/attendance-api"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { useToast } from "@/hooks/use-toast"
import { AttendancePagination } from "@/components/attendance/attendance-pagination"

interface AttendanceRecord {
  attendance_id: string
  user_id: string
  name: string
  role: string
  checkIn: string
  checkOut: string | null
  duration: string
  location: string
  status: string
  email: string
}

interface RegularizationRequest {
  regularization_id: string
  attendance_id: string
  user_id: string
  name: string
  email: string
  role: string
  duration: string
  validReason: string
  file: string
  status: "Pending" | "Approved" | "Rejected"
  createdAt: string
}

interface RoleStats {
  technician: { total: number; present: number; checkedIn: number; absent: number }
  staff: { total: number; present: number; checkedIn: number; absent: number }
}

export default function AdminAttendancePage() {
  const { user } = useAuth()
  const { toast } = useToast()
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

  const fetchAttendanceData = async () => {
    try {
      setLoading(true)
      const response = await attendanceApi.getAllAttendance({ limit: 1000, page: 1 })

      if (response.success && response.data) {
        const records = attendanceApi.parseAttendanceResponse(response)

        const filteredRecords = records
          .filter((record: any) => {
            const checkInDate = record.checkIn ? new Date(record.checkIn).toISOString().split("T")[0] : null
            return checkInDate === dateFilter && (record.role === "technician" || record.role === "staff")
          })
          .map((record: any) => ({
            attendance_id: record.attendance_id,
            user_id: record.user_id,
            name: record.name,
            role: record.role,
            checkIn: record.checkIn,
            checkOut: record.checkOut,
            duration: record.duration,
            location: record.location,
            status: !record.checkIn ? "Absent" : !record.checkOut ? "Checked-In" : "Checked-Out",
            email: record.email,
          }))

        setAttendanceData(filteredRecords)
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

    attendanceData.forEach((record) => {
      if (record.role === "technician" || record.role === "staff") {
        stats[record.role as keyof RoleStats].total++

        if (!record.checkIn) {
          stats[record.role as keyof RoleStats].absent++
        } else if (!record.checkOut) {
          stats[record.role as keyof RoleStats].checkedIn++
        } else {
          stats[record.role as keyof RoleStats].present++
        }
      }
    })

    setRoleStats(stats)
  }

  const fetchRegularizationRequests = async () => {
    try {
      setLoading(true)
      const response = await attendanceApi.getAllRegularizations({ limit: 1000, page: 1 })

      if (response.success && response.data) {
        const requests = response.data.regularizations || []
        setRegularizationRequests(requests)
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
          record.email?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedRole !== "all") {
      filtered = filtered.filter((record) => record.role === selectedRole)
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((record) => record.status === selectedStatus)
    }

    filtered.sort((a, b) => {
      let aVal: string | number | Date = ""
      let bVal: string | number | Date = ""

      if (sortBy === "checkIn") {
        aVal = new Date(a.checkIn || 0)
        bVal = new Date(b.checkIn || 0)
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

  const handleDeleteAttendance = async (attendanceId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this attendance record?")
    if (!confirmed) return

    try {
      const response = await attendanceApi.deleteAttendance(attendanceId)

      if (response.success) {
        toast({
          title: "Success",
          description: "Attendance record deleted successfully",
        })
        fetchAttendanceData()
      } else {
        throw new Error(response.error)
      }
    } catch (error) {
      console.error("[Admin] Error deleting attendance:", error)
      toast({
        title: "Error",
        description: "Failed to delete attendance record",
        variant: "destructive",
      })
    }
  }

  const handleViewAuditLogs = async () => {
    try {
      const response = await attendanceApi.getAuditLogs({ limit: 100, page: 1 })

      if (response.success && response.data?.logs) {
        const logs = response.data.logs
        const csvContent = [
          ["Log ID", "Attendance ID", "Action", "Performed By", "Timestamp", "Details"].join(","),
          ...logs.map((log: any) =>
            [
              log.log_id,
              log.attendance_id,
              log.action,
              log.performedBy,
              new Date(log.timestamp).toLocaleString("en-IN"),
              JSON.stringify(log.details || {}),
            ]
              .map((cell) => `"${cell}"`)
              .join(","),
          ),
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`
        a.click()

        toast({
          title: "Success",
          description: "Audit logs exported successfully",
        })
      } else {
        throw new Error(response.error || "Failed to fetch audit logs")
      }
    } catch (error) {
      console.error("[Admin] Error fetching audit logs:", error)
      toast({
        title: "Error",
        description: "Failed to export audit logs",
        variant: "destructive",
      })
    }
  }

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

  const handleCardClick = (role: string, status?: string) => {
    setSelectedRole(role)
    if (status) {
      setSelectedStatus(status)
    }
  }

  const formatTime = (timeString: string | null) => {
    if (!timeString) return "---"
    try {
      return new Date(timeString).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    } catch (error) {
      return "---"
    }
  }

  const handleApproveRegularization = async (regularizationId: string, status: "Approved" | "Rejected") => {
    try {
      setApprovingId(regularizationId)
      const response = await attendanceApi.updateRegularizationStatus(regularizationId, {
        status,
        reviewedBy: user?.user_id || "admin",
        reviewerNote: `${status} by admin`,
      })

      if (response.success) {
        toast({
          title: "Success",
          description: `Regularization request ${status}`,
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
    const headers = ["Name", "Role", "Email", "Check-in", "Check-out", "Duration", "Location", "Status"]
    const rows = filteredData.map((record) => [
      record.name,
      record.role,
      record.email,
      formatTime(record.checkIn),
      formatTime(record.checkOut),
      record.duration || "---",
      record.location,
      record.status,
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
    presentCount: attendanceData.filter((r) => r.checkOut).length,
    absentCount: attendanceData.filter((r) => !r.checkIn).length,
    checkedInCount: attendanceData.filter((r) => r.checkIn && !r.checkOut).length,
    totalEmployees: attendanceData.length,
    regularizationPending: regularizationRequests.filter((r) => r.status === "Pending").length,
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 gap-2">
          <div className="flex gap-2">
            <Button
              onClick={() => (activeTab === "overview" ? fetchAttendanceData() : fetchRegularizationRequests())}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            {activeTab === "overview" && (
              <>
                <Button onClick={exportToCSV} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button onClick={handleViewAuditLogs} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Audit Logs
                </Button>
              </>
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
            {/* Overall Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card
                className="bg-gradient-to-br from-green-50 to-green-100 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleCardClick("all", "Checked-Out")}
              >
                <CardContent className="pt-6">
                  <div className="text-center">
                    <UserCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">Present</p>
                    <p className="text-3xl font-bold text-green-600">{totalStats.presentCount}</p>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="bg-gradient-to-br from-red-50 to-red-100 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleCardClick("all", "Absent")}
              >
                <CardContent className="pt-6">
                  <div className="text-center">
                    <UserX className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">Absent</p>
                    <p className="text-3xl font-bold text-red-600">{totalStats.absentCount}</p>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="bg-gradient-to-br from-yellow-50 to-yellow-100 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleCardClick("all", "Checked-In")}
              >
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">Checked In</p>
                    <p className="text-3xl font-bold text-yellow-600">{totalStats.checkedInCount}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">Total Employees</p>
                    <p className="text-3xl font-bold text-purple-600">{totalStats.totalEmployees}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Role Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <Badge className="bg-green-100 text-green-800">{roleStats.technician.present}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-yellow-600">Checked In</span>
                      <Badge className="bg-yellow-100 text-yellow-800">{roleStats.technician.checkedIn}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-red-600">Absent</span>
                      <Badge className="bg-red-100 text-red-800">{roleStats.technician.absent}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

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
                      <Badge className="bg-green-100 text-green-800">{roleStats.staff.present}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-yellow-600">Checked In</span>
                      <Badge className="bg-yellow-100 text-yellow-800">{roleStats.staff.checkedIn}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-red-600">Absent</span>
                      <Badge className="bg-red-100 text-red-800">{roleStats.staff.absent}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Attendance Records Table */}
            <Card>
              <CardHeader>
                <CardTitle>Attendance Records</CardTitle>
                <CardDescription>
                  View and manage all employee attendance.
                  {(selectedRole !== "all" || selectedStatus !== "all") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2"
                      onClick={() => {
                        setSelectedRole("all")
                        setSelectedStatus("all")
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name or email..."
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
                      <SelectItem value="Checked-Out">Present</SelectItem>
                      <SelectItem value="Checked-In">Checked In</SelectItem>
                      <SelectItem value="Absent">Absent</SelectItem>
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
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                            No attendance records found
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedData.map((record) => (
                          <TableRow key={record.attendance_id}>
                            <TableCell className="font-medium">{record.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{record.role}</Badge>
                            </TableCell>
                            <TableCell>{formatTime(record.checkIn)}</TableCell>
                            <TableCell>{formatTime(record.checkOut)}</TableCell>
                            <TableCell>{record.duration || "---"}</TableCell>
                            <TableCell className="text-sm">{record.location}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  record.status === "Checked-Out"
                                    ? "bg-green-100 text-green-800"
                                    : record.status === "Checked-In"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }
                              >
                                {record.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteAttendance(record.attendance_id)}
                              >
                                Delete
                              </Button>
                            </TableCell>
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
                <CardDescription>Verify and approve attendance regularization requests</CardDescription>
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
                          <TableHead>Employee</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Document</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {regularizationRequests.map((request) => (
                          <TableRow key={request.regularization_id}>
                            <TableCell className="font-medium">
                              <div>{request.name}</div>
                              <div className="text-xs text-gray-500">{request.email}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{request.role}</Badge>
                            </TableCell>
                            <TableCell className="font-semibold">{request.duration}</TableCell>
                            <TableCell className="text-sm max-w-xs truncate">{request.validReason}</TableCell>
                            <TableCell>
                              {request.file && (
                                <a
                                  href={request.file}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline text-sm"
                                >
                                  View Document
                                </a>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  request.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : request.status === "Approved"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                }
                              >
                                {request.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {request.status === "Pending" && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-green-50 hover:bg-green-100"
                                    onClick={() => handleApproveRegularization(request.regularization_id, "Approved")}
                                    disabled={approvingId === request.regularization_id}
                                  >
                                    {approvingId === request.regularization_id ? "..." : "Approve"}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-red-50 hover:bg-red-100"
                                    onClick={() => handleApproveRegularization(request.regularization_id, "Rejected")}
                                    disabled={approvingId === request.regularization_id}
                                  >
                                    {approvingId === request.regularization_id ? "..." : "Reject"}
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

            <Card>
              <CardHeader>
                <CardTitle>Download Reports by Date</CardTitle>
                <CardDescription>Generate and download attendance reports for a specific date range</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <Input type="date" className="flex-1" id="reportStartDate" placeholder="Start Date" />
                  <Input type="date" className="flex-1" id="reportEndDate" placeholder="End Date" />
                  <Button variant="outline" className="md:w-auto bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
