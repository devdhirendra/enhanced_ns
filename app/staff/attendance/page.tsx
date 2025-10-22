"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarIcon, Download } from "lucide-react"
import { attendanceApi } from "@/lib/attendance-api"
import { useToast } from "@/hooks/use-toast"
import { showConfirmation } from "@/lib/confirmation-dialog"
import { CheckInOutCard } from "@/components/attendance/check-in-out-card"
import { AttendanceStatsCards } from "@/components/attendance/attendance-stats-cards"
import { AttendancePagination } from "@/components/attendance/attendance-pagination"

interface AttendanceRecord {
  date: string
  checkIn: string
  checkOut: string | null
  durationMinutes: number
  location: string
}

export default function StaffAttendancePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)
  const [checkInLoading, setCheckInLoading] = useState(false)
  const [checkOutLoading, setCheckOutLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [currentAttendance, setCurrentAttendance] = useState({
    status: "checked_out" as "checked_in" | "checked_out",
    checkInTime: null as string | null,
    currentLocation: "Unknown Location",
    workingHours: "0h 0m",
    isInGeofence: true,
  })

  const itemsPerPage = 10
  const totalPages = Math.ceil(attendanceData.length / itemsPerPage)
  const paginatedData = attendanceData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => {
    const timer = setInterval(() => {
      if (currentAttendance.status === "checked_in" && currentAttendance.checkInTime) {
        updateWorkingHours()
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [currentAttendance.checkInTime, currentAttendance.status])

  useEffect(() => {
    if (user?.user_id) {
      fetchAttendanceData()
    }
  }, [user])

  const updateWorkingHours = () => {
    if (currentAttendance.checkInTime && currentAttendance.status === "checked_in") {
      const checkInDate = new Date()
      const [hours, minutes, seconds] = currentAttendance.checkInTime.split(":")
      checkInDate.setHours(Number.parseInt(hours), Number.parseInt(minutes), Number.parseInt(seconds || "0"))

      const now = new Date()
      const diffMs = now.getTime() - checkInDate.getTime()
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      const workingHours = `${Math.floor(diffMinutes / 60)}h ${diffMinutes % 60}m`

      setCurrentAttendance((prev) => ({
        ...prev,
        workingHours,
      }))
    }
  }

  const fetchAttendanceData = async () => {
    if (!user?.user_id) return

    try {
      setLoading(true)
      const records = await attendanceApi.getAllAttendance(user.user_id)
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

      const today = new Date().toISOString().split("T")[0]
      const todaySummary = await attendanceApi.getDaySummary(user.user_id, today)

      if (todaySummary?.sessions && todaySummary.sessions.length > 0) {
        const latestSession = todaySummary.sessions[todaySummary.sessions.length - 1]
        setCurrentAttendance({
          status: latestSession.checkOut ? "checked_out" : "checked_in",
          checkInTime: latestSession.checkIn ? new Date(latestSession.checkIn).toTimeString().split(" ")[0] : null,
          currentLocation: latestSession.location || "Unknown Location",
          workingHours: latestSession.durationMinutes
            ? `${Math.floor(latestSession.durationMinutes / 60)}h ${latestSession.durationMinutes % 60}m`
            : "0h 0m",
          isInGeofence: true,
        })
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

  const handleCheckIn = async () => {
    if (!user?.user_id) return

    const confirmed = await showConfirmation({
      title: "Check In",
      message: "Are you sure you want to check in for today?",
      confirmText: "Check In",
      cancelText: "Cancel",
    })

    if (!confirmed) return

    try {
      setCheckInLoading(true)
      const now = new Date()
      const checkInTime = now.toTimeString().split(" ")[0]

      await attendanceApi.checkIn(user.user_id, {
        at: now.toISOString(),
        location: "Current Location",
        date: now.toISOString().split("T")[0],
      })

      setCurrentAttendance((prev) => ({
        ...prev,
        status: "checked_in",
        checkInTime: checkInTime,
      }))

      toast({
        title: "Checked In",
        description: "You have successfully checked in for today.",
      })
    } catch (error) {
      console.error("[v0] Check-in error:", error)
      toast({
        title: "Check In Failed",
        description: "Failed to check in. Please try again.",
        variant: "destructive",
      })
    } finally {
      setCheckInLoading(false)
    }
  }

  const handleCheckOut = async (notes: string) => {
    if (!user?.user_id) return

    try {
      setCheckOutLoading(true)
      await attendanceApi.checkOut(user.user_id)

      setCurrentAttendance((prev) => ({
        ...prev,
        status: "checked_out",
      }))

      toast({
        title: "Checked Out",
        description: "You have successfully checked out for today.",
      })

      fetchAttendanceData()
    } catch (error) {
      console.error("[v0] Check-out error:", error)
      toast({
        title: "Check Out Failed",
        description: "Failed to check out. Please try again.",
        variant: "destructive",
      })
    } finally {
      setCheckOutLoading(false)
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Tracking</h1>
          <p className="text-gray-500">Monitor your daily attendance and working hours</p>
        </div>
        <Button onClick={fetchAttendanceData} variant="outline" disabled={loading}>
          <Download className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <CheckInOutCard
        status={currentAttendance.status}
        checkInTime={currentAttendance.checkInTime}
        workingHours={currentAttendance.workingHours}
        location={currentAttendance.currentLocation}
        onCheckIn={handleCheckIn}
        onCheckOut={handleCheckOut}
        loading={checkInLoading || checkOutLoading}
      />

      <AttendanceStatsCards
        attendanceRate={attendancePercentage}
        totalHours={monthlyStats.totalHours}
        averageCheckIn={monthlyStats.averageCheckIn}
        totalTasks={monthlyStats.presentDays}
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No attendance records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((record, index) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                        <TableCell>{record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : "---"}</TableCell>
                        <TableCell>
                          {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : "---"}
                        </TableCell>
                        <TableCell>
                          {record.durationMinutes
                            ? `${Math.floor(record.durationMinutes / 60)}h ${record.durationMinutes % 60}m`
                            : "---"}
                        </TableCell>
                        <TableCell>{record.location}</TableCell>
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
  )
}
