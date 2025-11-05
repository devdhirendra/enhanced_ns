"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, RefreshCw, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { attendanceApi } from "@/lib/attendance-api"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { useToast } from "@/hooks/use-toast"
import { CheckInOutCard } from "@/components/attendance/check-in-out-card"
import { AttendanceStatsCards } from "@/components/attendance/attendance-stats-cards"
import { AttendancePagination } from "@/components/attendance/attendance-pagination"
import { RegularizationRequestForm } from "@/components/attendance/regularization-request-form"
import { RegularizationApprovalTable } from "@/components/attendance/regularization-approval-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AttendanceRecord {
  attendance_id: string
  date: string
  checkIn: string | null
  checkOut: string | null
  duration: string
  location: string
  status: string
}

interface CurrentSession {
  isCheckedIn: boolean
  checkInTime: string | null
  checkOutTime: string | null
  attendanceId: string | null
  location: string
  workingHours: string
}

export default function StaffAttendancePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredData, setFilteredData] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [currentSession, setCurrentSession] = useState<CurrentSession>({
    isCheckedIn: false,
    checkInTime: null,
    checkOutTime: null,
    attendanceId: null,
    location: "Web App",
    workingHours: "0h 0m",
  })

  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => {
    if (user?.user_id) {
      fetchAttendanceData()
    }
  }, [user])

  useEffect(() => {
    if (user?.user_id) {
      fetchCurrentSession()
    }
  }, [user])

  const fetchCurrentSession = async () => {
    if (!user?.user_id) return

    try {
      const today = new Date().toISOString().split("T")[0]
      const response = await attendanceApi.getUserAttendance(user.user_id, { limit: 100, page: 1 })

      if (response.success && response.data) {
        const records = attendanceApi.parseAttendanceResponse(response)

        const todaySession = records.find((r: any) => {
          const recordDate = r.date || (r.checkIn ? new Date(r.checkIn).toISOString().split("T")[0] : null)
          return recordDate === today
        })

        if (todaySession) {
          const isCheckedIn = !!todaySession.checkIn && !todaySession.checkOut
          setCurrentSession({
            isCheckedIn,
            checkInTime: todaySession.checkIn,
            checkOutTime: todaySession.checkOut || null,
            attendanceId: todaySession.attendance_id,
            location: todaySession.location || "Web App",
            workingHours: todaySession.duration || "0h 0m",
          })
        } else {
          setCurrentSession({
            isCheckedIn: false,
            checkInTime: null,
            checkOutTime: null,
            attendanceId: null,
            location: "Web App",
            workingHours: "0h 0m",
          })
        }
      }
    } catch (error) {
      console.error("[Staff] Error fetching current session:", error)
    }
  }

  const fetchAttendanceData = async () => {
    if (!user?.user_id) return

    try {
      setLoading(true)
      const response = await attendanceApi.getUserAttendance(user.user_id, { limit: 1000, page: 1 })

      if (response.success && response.data) {
        const records = attendanceApi.parseAttendanceResponse(response)

        const transformedData: AttendanceRecord[] = records.map((record: any) => ({
          attendance_id: record.attendance_id,
          date: record.date || (record.checkIn ? new Date(record.checkIn).toISOString().split("T")[0] : ""),
          checkIn: record.checkIn,
          checkOut: record.checkOut,
          duration: record.duration || "---",
          location: record.location || "Web App",
          status: !record.checkIn ? "Absent" : !record.checkOut ? "Checked-In" : "Checked-Out",
        }))

        setAttendanceData(transformedData)
        applySearch(transformedData)
      } else {
        throw new Error(response.error || "Failed to fetch attendance data")
      }
    } catch (error) {
      console.error("[Staff] Error fetching attendance:", error)
      toast({
        title: "Error",
        description: "Failed to load attendance data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const applySearch = (data: AttendanceRecord[]) => {
    let filtered = [...data]

    if (searchTerm) {
      filtered = filtered.filter((record) => record.location?.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    setFilteredData(filtered)
    setCurrentPage(1)
  }

  useEffect(() => {
    applySearch(attendanceData)
  }, [searchTerm, attendanceData])

  const handleCheckIn = async (): Promise<boolean> => {
    if (!user?.user_id) return false

    try {
      setActionLoading(true)
      const response = await attendanceApi.checkIn(user.user_id, { location: "Web App" })

      if (response.success) {
        const sessionData = response.data?.session || response.data?.attendance || response.data

        setCurrentSession({
          isCheckedIn: true,
          checkInTime: sessionData?.checkIn || new Date().toISOString(),
          checkOutTime: null,
          attendanceId: sessionData?.sessionId || sessionData?.attendance_id,
          location: sessionData?.location || "Web App",
          workingHours: "0h 0m",
        })

        toast({ title: "Success", description: "Checked in successfully" })
        await fetchAttendanceData()
        return true
      } else {
        throw new Error(response.error || "Failed to check in")
      }
    } catch (error) {
      console.error("[Staff] Check-in error:", error)
      toast({
        title: "Check In Failed",
        description: error instanceof Error ? error.message : "Failed to check in. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setActionLoading(false)
    }
  }

  const handleCheckOut = async (notes: string): Promise<boolean> => {
    if (!currentSession.attendanceId) {
      toast({ title: "Error", description: "No active session found", variant: "destructive" })
      return false
    }

    try {
      setActionLoading(true)
      const response = await attendanceApi.checkOut(currentSession.attendanceId, {
        checkOutBy: user?.user_id || "staff",
      })

      if (response.success) {
        const sessionData = response.data?.session || response.data?.attendance || response.data

        setCurrentSession((prev) => ({
          ...prev,
          isCheckedIn: false,
          checkOutTime: sessionData?.checkOut || new Date().toISOString(),
          workingHours:
            sessionData?.duration || sessionData?.durationMinutes
              ? sessionData.durationMinutes
                ? `${Math.floor(sessionData.durationMinutes / 60)}h ${sessionData.durationMinutes % 60}m`
                : sessionData.duration
              : "0h 0m",
        }))

        toast({ title: "Success", description: "Checked out successfully" })
        await fetchAttendanceData()
        return true
      } else {
        throw new Error(response.error || "Failed to check out")
      }
    } catch (error) {
      console.error("[Staff] Check-out error:", error)
      toast({
        title: "Check Out Failed",
        description: error instanceof Error ? error.message : "Failed to check out. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setActionLoading(false)
    }
  }

  const handleRefresh = async () => {
    await Promise.all([fetchCurrentSession(), fetchAttendanceData()])
    toast({ title: "Refreshed", description: "Attendance data updated" })
  }

  const monthlyStats = {
    totalDays: attendanceData.length,
    presentDays: attendanceData.filter((d) => d.checkOut).length,
    totalHours:
      attendanceData.reduce((sum, d) => {
        if (!d.duration || d.duration === "---") return sum
        const parts = d.duration.split("h")
        const hours = Number.parseInt(parts[0]) || 0
        const minutes = Number.parseInt(parts[1]) || 0
        return sum + (hours * 60 + minutes)
      }, 0) / 60,
    averageCheckIn: "09:00",
  }

  const attendancePercentage =
    monthlyStats.totalDays > 0 ? Math.round((monthlyStats.presentDays / monthlyStats.totalDays) * 100) : 0

  const formatTime = (timeString: string | null) => {
    if (!timeString) return "---"
    try {
      return new Date(timeString).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    } catch {
      return "---"
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="My Attendance" description="Monitor your daily attendance and working hours">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-10 w-24 bg-gray-200 rounded-md animate-pulse" />
            <div className="h-10 w-48 bg-gray-200 rounded-md animate-pulse" />
          </div>

          <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-lg p-6 space-y-4">
            <div className="h-6 w-48 bg-gray-200 rounded-md animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
            <div className="lg:col-span-2 h-96 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="My Attendance" description="Monitor your daily attendance and working hours">
      <div className="space-y-6">
        <Tabs defaultValue="attendance" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="grid w-auto grid-cols-2 gap-2">
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="regularization">Regularization</TabsTrigger>
            </TabsList>

            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <TabsContent value="attendance" className="space-y-6 mt-0">
            <CheckInOutCard
              isCheckedIn={currentSession.isCheckedIn}
              checkInTime={currentSession.checkInTime}
              checkOutTime={currentSession.checkOutTime}
              workingHours={currentSession.workingHours}
              location={currentSession.location}
              sessionId={currentSession.attendanceId || undefined}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
              loading={actionLoading}
            />

            <AttendanceStatsCards
              attendanceRate={attendancePercentage}
              totalHours={Math.round(monthlyStats.totalHours)}
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
                  <CardTitle>Daily Attendance History</CardTitle>
                  <CardDescription>Your complete attendance records with pagination</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

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
                            <TableRow key={record.attendance_id}>
                              <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                              <TableCell>{formatTime(record.checkIn)}</TableCell>
                              <TableCell>{formatTime(record.checkOut)}</TableCell>
                              <TableCell className="font-medium">{record.duration}</TableCell>
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
          </TabsContent>

          <TabsContent value="regularization" className="space-y-6 mt-0">
            <RegularizationRequestForm userId={user?.user_id || ""} onSuccess={handleRefresh} />
            <RegularizationApprovalTable userId={user?.user_id || ""} onRefresh={handleRefresh} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
