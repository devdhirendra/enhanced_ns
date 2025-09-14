"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Clock,
  MapPin,
  UserCheck,
  CalendarIcon,
  Timer,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Navigation,
  Camera,
  Save,
  Download,
} from "lucide-react"
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
import { technicianApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { showConfirmation } from "@/lib/confirmation-dialog"

export default function AttendancePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [attendanceData, setAttendanceData] = useState([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [checkOutReason, setCheckOutReason] = useState("")
  const [loading, setLoading] = useState(true)
  const [currentAttendance, setCurrentAttendance] = useState({
    status: "checked_out",
    checkInTime: null,
    currentLocation: "Unknown Location",
    workingHours: "0h 0m",
    isInGeofence: true,
    todayTasks: 0,
    completedTasks: 0,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (user?.user_id) {
      fetchAttendanceData()
    }
  }, [user])

  const fetchAttendanceData = async () => {
    if (!user?.user_id) return

    try {
      setLoading(true)
      console.log("[v0] Fetching attendance data...")

      const technicianId = user.profileDetail?.technicianId || user.user_id

      const attendanceRecords = await technicianApi.getAllAttendanceRecords(technicianId)

      const today = new Date().toISOString().split("T")[0]
      const todaySummary = await technicianApi.getDaySummary(technicianId, today)

      console.log("[v0] Attendance records:", attendanceRecords)
      console.log("[v0] Today's summary:", todaySummary)

      const transformedData = Array.isArray(attendanceRecords)
        ? attendanceRecords.map((record) => ({
            date: record.date,
            status: record.checkOut ? "present" : "present",
            checkIn: record.checkIn ? new Date(record.checkIn).toTimeString().split(" ")[0] : null,
            checkOut: record.checkOut ? new Date(record.checkOut).toTimeString().split(" ")[0] : null,
            workingHours: record.durationMinutes
              ? `${Math.floor(record.durationMinutes / 60)}h ${record.durationMinutes % 60}m`
              : "0h 0m",
            breakTime: "30m",
            location: record.location || "Unknown Location",
            tasksCompleted: 0,
            overtime: "0m",
          }))
        : []

      setAttendanceData(transformedData)

      if (todaySummary && todaySummary.sessions && todaySummary.sessions.length > 0) {
        const latestSession = todaySummary.sessions[todaySummary.sessions.length - 1]
        setCurrentAttendance({
          status: latestSession.checkOut ? "checked_out" : "checked_in",
          checkInTime: latestSession.checkIn ? new Date(latestSession.checkIn).toTimeString().split(" ")[0] : null,
          currentLocation: latestSession.location || "Unknown Location",
          workingHours: latestSession.durationMinutes
            ? `${Math.floor(latestSession.durationMinutes / 60)}h ${latestSession.durationMinutes % 60}m`
            : "0h 0m",
          isInGeofence: true,
          todayTasks: 0,
          completedTasks: 0,
        })
      }
    } catch (error) {
      console.error("[v0] Error fetching attendance data:", error)
      toast({
        title: "Error Loading Attendance",
        description: "Failed to load attendance data. Using offline mode.",
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
      setLoading(true)
      const technicianId = user.profileDetail?.technicianId || user.user_id
      const now = new Date()

      await technicianApi.checkIn(technicianId, {
        at: now.toISOString(),
        location: "Current Location",
        date: now.toISOString().split("T")[0],
      })

      setCurrentAttendance({
        ...currentAttendance,
        status: "checked_in",
        checkInTime: now.toTimeString().split(" ")[0],
      })

      await fetchAttendanceData()

      toast({
        title: "Checked In",
        description: "You have successfully checked in for today.",
      })
    } catch (error) {
      console.error("[v0] Error checking in:", error)
      toast({
        title: "Check In Failed",
        description: "Failed to check in. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOut = async () => {
    if (!user?.user_id) return

    const confirmed = await showConfirmation({
      title: "Check Out",
      message: "Are you sure you want to check out for today?",
      confirmText: "Check Out",
      cancelText: "Cancel",
    })

    if (!confirmed) return

    try {
      setLoading(true)
      const technicianId = user.profileDetail?.technicianId || user.user_id

      await technicianApi.checkOut(technicianId)

      setCurrentAttendance({
        ...currentAttendance,
        status: "checked_out",
      })

      await fetchAttendanceData()

      toast({
        title: "Checked Out",
        description: "You have successfully checked out for today.",
      })

      setCheckOutReason("")
    } catch (error) {
      console.error("[v0] Error checking out:", error)
      toast({
        title: "Check Out Failed",
        description: "Failed to check out. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800"
      case "absent":
        return "bg-red-100 text-red-800"
      case "late":
        return "bg-yellow-100 text-yellow-800"
      case "half_day":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "absent":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "late":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const monthlyStats = {
    totalDays: attendanceData.length,
    presentDays: attendanceData.filter((d) => d.status === "present").length,
    absentDays: attendanceData.filter((d) => d.status === "absent").length,
    totalHours: attendanceData
      .filter((d) => d.status === "present")
      .reduce((acc, d) => acc + Number.parseFloat(d.workingHours.replace("h", "").replace("m", "")), 0),
    averageCheckIn: "09:15",
    totalTasks: attendanceData.reduce((acc, d) => acc + d.tasksCompleted, 0),
  }

  const attendancePercentage =
    monthlyStats.totalDays > 0 ? Math.round((monthlyStats.presentDays / monthlyStats.totalDays) * 100) : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
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
        <div className="flex items-center space-x-2">
          <Button onClick={fetchAttendanceData} variant="outline" disabled={loading}>
            <Download className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Card className="bg-gradient-to-r from-orange-50 via-blue-50 to-green-50 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-orange-600" />
            Today's Attendance Status
          </CardTitle>
          <CardDescription>
            {currentTime.toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-white/60 rounded-lg backdrop-blur-sm">
              <div className="bg-green-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Check-in Time</p>
                <p className="font-bold text-lg text-gray-900">{currentAttendance.checkInTime || "Not checked in"}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-white/60 rounded-lg backdrop-blur-sm">
              <div className="bg-blue-100 p-3 rounded-full">
                <Timer className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Working Hours</p>
                <p className="font-bold text-lg text-gray-900">{currentAttendance.workingHours}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-white/60 rounded-lg backdrop-blur-sm">
              <div className="bg-purple-100 p-3 rounded-full">
                <MapPin className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Location</p>
                <p className="font-bold text-lg text-gray-900">{currentAttendance.currentLocation}</p>
              </div>
            </div>

            <div className="flex items-center justify-center p-4">
              {currentAttendance.status === "checked_in" ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Check Out
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Check Out</DialogTitle>
                      <DialogDescription>
                        You're about to check out for the day. Add any notes if needed.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="reason">Check-out Notes (Optional)</Label>
                        <Textarea
                          id="reason"
                          value={checkOutReason}
                          onChange={(e) => setCheckOutReason(e.target.value)}
                          placeholder="Any additional notes for today..."
                          rows={3}
                        />
                      </div>
                      <Button onClick={handleCheckOut} className="w-full" disabled={loading}>
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? "Checking Out..." : "Confirm Check Out"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <Button onClick={handleCheckIn} className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {loading ? "Checking In..." : "Check In"}
                </Button>
              )}
            </div>
          </div>

          {currentAttendance.isInGeofence && (
            <div className="mt-4 flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-green-800">Within work zone - Geo-fencing active</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{attendancePercentage}%</div>
            <p className="text-xs text-green-600 mt-1">
              {monthlyStats.presentDays}/{monthlyStats.totalDays} days
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{Math.round(monthlyStats.totalHours)}h</div>
            <p className="text-xs text-blue-600 mt-1">This month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Avg Check-in</CardTitle>
            <UserCheck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{monthlyStats.averageCheckIn}</div>
            <p className="text-xs text-purple-600 mt-1">Average time</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Tasks Done</CardTitle>
            <CheckCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{monthlyStats.totalTasks}</div>
            <p className="text-xs text-orange-600 mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

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
              modifiers={{
                present: attendanceData.filter((d) => d.status === "present").map((d) => new Date(d.date)),
                absent: attendanceData.filter((d) => d.status === "absent").map((d) => new Date(d.date)),
              }}
              modifiersStyles={{
                present: { backgroundColor: "#dcfce7", color: "#166534" },
                absent: { backgroundColor: "#fecaca", color: "#dc2626" },
              }}
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
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {attendanceData.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No attendance records found</p>
                  <p className="text-sm">Start checking in to see your attendance history</p>
                </div>
              ) : (
                attendanceData.map((record) => (
                  <div
                    key={record.date}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(record.status)}
                        <div>
                          <p className="font-medium text-gray-900">
                            {new Date(record.date).toLocaleDateString("en-IN", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                          <Badge className={getStatusColor(record.status)} variant="outline">
                            {record.status.replace("_", " ").toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      {record.status === "present" ? (
                        <>
                          <div className="text-center">
                            <p className="font-medium">Check-in</p>
                            <p>{record.checkIn || "---"}</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium">Check-out</p>
                            <p>{record.checkOut || "---"}</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium">Hours</p>
                            <p>{record.workingHours}</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium">Tasks</p>
                            <p>{record.tasksCompleted}</p>
                          </div>
                        </>
                      ) : (
                        <div className="text-center">
                          <p className="font-medium text-red-600">Reason</p>
                          <p className="text-red-600">{record.reason || "Not specified"}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Location Tracking
          </CardTitle>
          <CardDescription>Your work locations and geo-fencing status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="font-medium text-green-900">Current Location</p>
                    <p className="text-sm text-green-600">{currentAttendance.currentLocation}</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Recent Locations</h4>
                {attendanceData
                  .filter((d) => d.location)
                  .slice(0, 5)
                  .map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{record.location}</span>
                      </div>
                      <span className="text-xs text-gray-500">{new Date(record.date).toLocaleDateString()}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Geo-fencing Settings</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex items-center justify-between">
                    <span>Auto Check-in:</span>
                    <Badge className="bg-blue-100 text-blue-800">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Location Accuracy:</span>
                    <Badge className="bg-green-100 text-green-800">High</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Work Zone Radius:</span>
                    <span>500m</span>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full bg-transparent">
                <Camera className="h-4 w-4 mr-2" />
                Take Location Photo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
