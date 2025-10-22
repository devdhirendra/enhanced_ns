"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Download, Search } from "lucide-react"
import { attendanceApi } from "@/lib/attendance-api"
import { useToast } from "@/hooks/use-toast"
import { AttendancePagination } from "@/components/attendance/attendance-pagination"
import { AttendanceStatsCards } from "@/components/attendance/attendance-stats-cards"

interface AttendanceRecord {
  user_id: string
  name: string
  role: string
  date: string
  checkIn: string
  checkOut: string | null
  durationMinutes: number
  location: string
}

export default function AdminAttendancePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
  const [filteredData, setFilteredData] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => {
    fetchAttendanceData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [attendanceData, searchTerm, selectedRole, selectedStatus, sortBy, sortOrder])

// In admin-attendance-page.tsx - update fetchAttendanceData:

const fetchAttendanceData = async () => {
  try {
    setLoading(true)
    const response = await attendanceApi.getAllAttendanceRecords()
    
    if (response.success) {
      console.log("[v0] Attendance data:", response.data)
      setAttendanceData(Array.isArray(response.data) ? response.data : response.data?.users || [])
    } else {
      throw new Error(response.error)
    }
  } catch (error) {
    console.error("[v0] Error fetching attendance:", error)
    toast({
      title: "Error",
      description: "Failed to load attendance data",
      variant: "destructive",
    })
  } finally {
    setLoading(false)
  }
}

  const applyFilters = () => {
    let filtered = [...attendanceData]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.user_id?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Role filter
    if (selectedRole !== "all") {
      filtered = filtered.filter((record) => record.role === selectedRole)
    }

    // Status filter
    if (selectedStatus !== "all") {
      if (selectedStatus === "present") {
        filtered = filtered.filter((record) => record.checkIn)
      } else if (selectedStatus === "absent") {
        filtered = filtered.filter((record) => !record.checkIn)
      }
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal: any = a[sortBy as keyof AttendanceRecord]
      let bVal: any = b[sortBy as keyof AttendanceRecord]

      if (sortBy === "date") {
        aVal = new Date(a.date).getTime()
        bVal = new Date(b.date).getTime()
      } else if (sortBy === "durationMinutes") {
        aVal = a.durationMinutes || 0
        bVal = b.durationMinutes || 0
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

  const stats = {
    totalUsers: new Set(attendanceData.map((r) => r.user_id)).size,
    presentToday: attendanceData.filter(
      (r) => r.checkIn && new Date(r.date).toDateString() === new Date().toDateString(),
    ).length,
    averageHours: Math.round(
      attendanceData.reduce((acc, r) => acc + (r.durationMinutes || 0), 0) / Math.max(attendanceData.length, 1) / 60,
    ),
    totalHours: Math.round(attendanceData.reduce((acc, r) => acc + (r.durationMinutes || 0), 0) / 60),
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-500">Monitor and manage employee attendance</p>
        </div>
        <Button onClick={fetchAttendanceData} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <AttendanceStatsCards
        attendanceRate={stats.presentToday}
        totalHours={stats.totalHours}
        averageCheckIn="09:15"
        totalTasks={stats.totalUsers}
      />

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>View and manage all employee attendance</CardDescription>
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

            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="technician">Technician</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="operator">Operator</SelectItem>
                <SelectItem value="vendor">Vendor</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="durationMinutes">Duration</SelectItem>
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
                  <TableHead>Date</TableHead>
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
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{record.name || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.role}</Badge>
                      </TableCell>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell>{record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : "---"}</TableCell>
                      <TableCell>{record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : "---"}</TableCell>
                      <TableCell>
                        {record.durationMinutes
                          ? `${Math.floor(record.durationMinutes / 60)}h ${record.durationMinutes % 60}m`
                          : "---"}
                      </TableCell>
                      <TableCell className="text-sm">{record.location || "---"}</TableCell>
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
    </div>
  )
}
