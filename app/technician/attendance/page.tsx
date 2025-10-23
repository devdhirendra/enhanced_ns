"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, RefreshCw } from "lucide-react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { CheckInOutCard } from "@/components/attendance/check-in-out-card"
import { AttendanceStatsCards } from "@/components/attendance/attendance-stats-cards"
import { AttendancePagination } from "@/components/attendance/attendance-pagination"
import { useAttendance } from "@/hooks/use-attendance"

export default function TechnicianAttendancePage() {
  const {
    attendanceData,
    currentSession,
    loading,
    actionLoading,
    handleCheckIn,
    handleCheckOut,
    refreshData,
    stats,
  } = useAttendance()

  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [currentPage, setCurrentPage] = useState(1)

  const itemsPerPage = 10
  const totalPages = Math.ceil(attendanceData.length / itemsPerPage)
  const paginatedData = attendanceData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

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

  const handleRefresh = async () => {
    await refreshData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <DashboardLayout title="My Attendance" description="View and manage Attendance">
      <div className="space-y-6">

        <CheckInOutCard
          isCheckedIn={currentSession.isCheckedIn}
          checkInTime={currentSession.checkInTime}
          checkOutTime={currentSession.checkOutTime}
          workingHours={currentSession.workingHours}
          location={currentSession.location}
          sessionId={currentSession.sessionId || undefined}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          loading={actionLoading}
        />

        <AttendanceStatsCards
          attendanceRate={stats.attendancePercentage}
          totalHours={stats.totalHours}
          averageCheckIn={stats.averageCheckIn}
          totalTasks={stats.presentDays}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Attendance Calendar
              </CardTitle>
              <CardDescription>Click on a date to view details</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <CardTitle>Attendance Records</CardTitle>
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
                      <SelectItem value="2023">2023</SelectItem>
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
                      paginatedData.map((record) => (
                        <TableRow key={record.sessionId}>
                          <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                          <TableCell>{formatTime(record.checkIn)}</TableCell>
                          <TableCell>{formatTime(record.checkOut)}</TableCell>
                          <TableCell>
                            {record.durationMinutes
                              ? `${Math.floor(record.durationMinutes / 60)}h ${record.durationMinutes % 60}m`
                              : "---"}
                          </TableCell>
                          <TableCell>{record.location}</TableCell>
                          <TableCell>
                            {record.checkOut ? (
                              <Badge className="bg-green-100 text-green-800">Present</Badge>
                            ) : record.checkIn ? (
                              <Badge className="bg-yellow-100 text-yellow-800">Checked In</Badge>
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
      </div>
    </DashboardLayout>
  )
}