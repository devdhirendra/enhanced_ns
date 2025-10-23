"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download } from "lucide-react"
import { attendanceApi } from "@/lib/attendance-api"
import { useToast } from "@/hooks/use-toast"
import { AttendanceStatsCards } from "@/components/attendance/attendance-stats-cards"
import { AttendancePagination } from "@/components/attendance/attendance-pagination"

interface AttendanceRecord {
  date: string
  checkIn: string
  checkOut: string | null
  durationMinutes: number
  location: string
}

export default function VendorAttendancePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  const itemsPerPage = 10
  const totalPages = Math.ceil(attendanceData.length / itemsPerPage)
  const paginatedData = attendanceData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => {
    if (user?.user_id) {
      fetchAttendanceData()
    }
  }, [user])

  const fetchAttendanceData = async () => {
    if (!user?.user_id) return

    try {
      setLoading(true)
      const response = await attendanceApi.getAllAttendance(user.user_id)

      const records = Array.isArray(response) ? response : response.data || []
      const transformedData = Array.isArray(records)
        ? records.map((record: any) => ({
            date: record.date,
            checkIn: record.checkIn,
            checkOut: record.checkOut,
            durationMinutes: record.durationMinutes || 0,
            location: record.location || "Unknown Location",
          }))
        : []

      setAttendanceData(transformedData)
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

  const monthlyStats = {
    totalDays: attendanceData.length,
    presentDays: attendanceData.filter((d) => d.checkIn).length,
    totalHours: Math.round(attendanceData.reduce((acc, d) => acc + (d.durationMinutes || 0), 0) / 60),
    averageCheckIn: "09:15",
  }

  const attendancePercentage =
    monthlyStats.totalDays > 0 ? Math.round((monthlyStats.presentDays / monthlyStats.totalDays) * 100) : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Records</h1>
          <p className="text-gray-500">View your attendance history</p>
        </div>
        <Button onClick={fetchAttendanceData} variant="outline" disabled={loading}>
          <Download className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <AttendanceStatsCards
        attendanceRate={attendancePercentage}
        totalHours={monthlyStats.totalHours}
        averageCheckIn={monthlyStats.averageCheckIn}
        totalTasks={monthlyStats.presentDays}
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>Your complete attendance history</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select
                value={selectedMonth.toString()}
                onValueChange={(value) => setSelectedMonth(Number.parseInt(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {new Date(0, i).toLocaleString("default", { month: "long" })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
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
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell>{record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : "---"}</TableCell>
                      <TableCell>{record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : "---"}</TableCell>
                      <TableCell>
                        {record.durationMinutes
                          ? `${Math.floor(record.durationMinutes / 60)}h ${record.durationMinutes % 60}m`
                          : "---"}
                      </TableCell>
                      <TableCell>{record.location}</TableCell>
                      <TableCell>
                        {record.checkIn ? (
                          <Badge className="bg-green-100 text-green-800">Present</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">Absent</Badge>
                        )}
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
            totalItems={attendanceData.length}
          />
        </CardContent>
      </Card>
    </div>
  )
}
