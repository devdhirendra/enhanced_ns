"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, RefreshCw } from "lucide-react"
import { attendanceApi } from "@/lib/attendance-api"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { useToast } from "@/hooks/use-toast"
import { CheckInOutCard } from "@/components/attendance/check-in-out-card"
import { AttendanceStatsCards } from "@/components/attendance/attendance-stats-cards"
import { AttendancePagination } from "@/components/attendance/attendance-pagination"

interface AttendanceRecord {
  sessionId: string
  date: string
  checkIn: string
  checkOut: string | null
  durationMinutes: number
  location: string
}

interface CurrentSession {
  isCheckedIn: boolean
  checkInTime: string | null
  checkOutTime: string | null
  sessionId: string | null
  location: string
  workingHours: string
}

export default function StaffAttendancePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [currentSession, setCurrentSession] = useState<CurrentSession>({
    isCheckedIn: false,
    checkInTime: null,
    checkOutTime: null,
    sessionId: null,
    location: "Web App",
    workingHours: "0h 0m",
  })

  const itemsPerPage = 10
  const totalPages = Math.ceil(attendanceData.length / itemsPerPage)
  const paginatedData = attendanceData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => {
    if (user?.user_id) {
      fetchAttendanceData()
    }
  }, [user])

  // FIXED: Separate effect to fetch current session status
  useEffect(() => {
    if (user?.user_id) {
      fetchCurrentSession()
    }
  }, [user])

  const fetchCurrentSession = async () => {
    if (!user?.user_id) return

    try {
      const today = new Date().toISOString().split("T")[0]
      const todayResponse = await attendanceApi.getDaySummary(user.user_id, today)

      if (todayResponse.success && todayResponse.data) {
        const sessions = todayResponse.data.sessions || []
        if (sessions.length > 0) {
          const latestSession = sessions[sessions.length - 1]
          const isCheckedIn = !!latestSession.checkIn && !latestSession.checkOut

          setCurrentSession({
            isCheckedIn,
            checkInTime: latestSession.checkIn,
            checkOutTime: latestSession.checkOut || null,
            sessionId: latestSession.sessionId,
            location: latestSession.location || "Web App",
            workingHours: latestSession.durationMinutes
              ? `${Math.floor(latestSession.durationMinutes / 60)}h ${latestSession.durationMinutes % 60}m`
              : "0h 0m",
          })
        } else {
          // No session for today - reset to default
          setCurrentSession({
            isCheckedIn: false,
            checkInTime: null,
            checkOutTime: null,
            sessionId: null,
            location: "Web App",
            workingHours: "0h 0m",
          })
        }
      }
    } catch (error) {
      console.error("[v0] Error fetching current session:", error)
    }
  }

  const fetchAttendanceData = async () => {
    if (!user?.user_id) return

    try {
      setLoading(true)
      const response = await attendanceApi.getAllAttendance(user.user_id, {
        limit: 100,
        page: 1,
      })

      if (response.success && response.data) {
        const attendanceData = response.data.attendance || response.data
        const records = Array.isArray(attendanceData) ? attendanceData : []
        
        const transformedData: AttendanceRecord[] = records.map((record: any) => ({
          sessionId: record.sessionId || `session_${user.user_id}_${record.date}`,
          date: record.date,
          checkIn: record.checkIn,
          checkOut: record.checkOut,
          durationMinutes: record.durationMinutes || 0,
          location: record.location || "Web App",
        }))
        setAttendanceData(transformedData)
      } else {
        throw new Error(response.error || "Failed to fetch attendance data")
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

    try {
      setActionLoading(true)
      const response = await attendanceApi.checkIn(user.user_id, {
        location: "Web App",
      })

      if (response.success) {
        const session = response.data?.session || response.data
        
        // FIXED: Immediately update current session state
        setCurrentSession({
          isCheckedIn: true,
          checkInTime: session?.checkIn || new Date().toISOString(),
          checkOutTime: null,
          sessionId: session?.sessionId,
          location: session?.location || "Web App",
          workingHours: "0h 0m",
        })
        
        toast({
          title: "Success",
          description: "Checked in successfully",
        })
        
        // Refresh both current session and attendance data
        await Promise.all([
          fetchCurrentSession(),
          fetchAttendanceData()
        ])
      } else {
        throw new Error(response.error || "Failed to check in")
      }
    } catch (error) {
      console.error("[v0] Check-in error:", error)
      toast({
        title: "Check In Failed",
        description: error instanceof Error ? error.message : "Failed to check in. Please try again.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleCheckOut = async (notes: string) => {
    if (!user?.user_id) return

    try {
      setActionLoading(true)
      const response = await attendanceApi.checkOut(user.user_id)

      if (response.success) {
        const session = response.data?.session || response.data
        
        // FIXED: Immediately update current session state
        setCurrentSession(prev => ({
          ...prev,
          isCheckedIn: false,
          checkOutTime: session?.checkOut || new Date().toISOString(),
          workingHours: session?.durationMinutes
            ? `${Math.floor(session.durationMinutes / 60)}h ${session.durationMinutes % 60}m`
            : "0h 0m",
        }))
        
        toast({
          title: "Success",
          description: "Checked out successfully",
        })
        
        // Refresh both current session and attendance data
        await Promise.all([
          fetchCurrentSession(),
          fetchAttendanceData()
        ])
      } else {
        throw new Error(response.error || "Failed to check out")
      }
    } catch (error) {
      console.error("[v0] Check-out error:", error)
      toast({
        title: "Check Out Failed",
        description: error instanceof Error ? error.message : "Failed to check out. Please try again.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const calculateAverageCheckIn = (records: AttendanceRecord[]) => {
    const validRecords = records.filter(record => record.checkIn && record.checkOut)
    if (validRecords.length === 0) return "09:00"
    
    const totalMinutes = validRecords.reduce((acc, record) => {
      const checkInTime = new Date(record.checkIn)
      return acc + (checkInTime.getHours() * 60 + checkInTime.getMinutes())
    }, 0)
    
    const averageMinutes = Math.round(totalMinutes / validRecords.length)
    const hours = Math.floor(averageMinutes / 60)
    const minutes = averageMinutes % 60
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  const monthlyStats = {
    totalDays: attendanceData.length,
    presentDays: attendanceData.filter((d) => d.checkIn && d.checkOut).length,
    totalHours: Math.round(attendanceData.reduce((acc, d) => acc + (d.durationMinutes || 0), 0) / 60),
    averageCheckIn: calculateAverageCheckIn(attendanceData),
  }

  const attendancePercentage =
    monthlyStats.totalDays > 0 ? Math.round((monthlyStats.presentDays / monthlyStats.totalDays) * 100) : 0

  const handleRefresh = async () => {
    await Promise.all([
      fetchCurrentSession(),
      fetchAttendanceData()
    ])
    toast({
      title: "Refreshed",
      description: "Attendance data updated",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
        <DashboardLayout title="My Attendance" description="Monitor your daily attendance and working hours">
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
                        <TableCell>
                          {record.checkIn
                            ? new Date(record.checkIn).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })
                            : "---"}
                        </TableCell>
                        <TableCell>
                          {record.checkOut
                            ? new Date(record.checkOut).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })
                            : "---"}
                        </TableCell>
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