// hooks/use-attendance.ts - FIXED fetchCurrentSession
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { attendanceApi } from "@/lib/attendance-api"
import { useToast } from "@/hooks/use-toast"

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

export function useAttendance() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
  const [currentSession, setCurrentSession] = useState<CurrentSession>({
    isCheckedIn: false,
    checkInTime: null,
    checkOutTime: null,
    sessionId: null,
    location: "Web App",
    workingHours: "0h 0m",
  })
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // DEBUG: Log state changes
  useEffect(() => {
    console.log("🔍 CURRENT SESSION STATE:", currentSession)
  }, [currentSession])

  // Fetch current session status - COMPLETELY REWRITTEN
  const fetchCurrentSession = async () => {
    if (!user?.user_id) return

    try {
      console.log("🔄 Fetching current session...")
      const today = new Date().toISOString().split("T")[0]
      const response = await attendanceApi.getDaySummary(user.user_id, today)

      console.log("📊 Current session API response:", response)

      if (response.success && response.data) {
        const sessions = response.data.sessions || []
        
        if (sessions.length > 0) {
          // FIXED: Find the ACTIVE session (checkIn exists but NO checkOut)
          const activeSession = sessions.find((session: any) => 
            session.checkIn && !session.checkOut
          )
          
          if (activeSession) {
            // FIXED: We have an active session (user is checked in)
            console.log("✅ ACTIVE session found:", activeSession)
            
            setCurrentSession({
              isCheckedIn: true,
              checkInTime: activeSession.checkIn,
              checkOutTime: null,
              sessionId: activeSession.sessionId,
              location: activeSession.location || "Web App",
              workingHours: activeSession.durationMinutes
                ? `${Math.floor(activeSession.durationMinutes / 60)}h ${activeSession.durationMinutes % 60}m`
                : "0h 0m",
            })
          } else {
            // FIXED: No active session, get the latest completed session for today
            const latestSession = sessions[sessions.length - 1]
            console.log("❌ No active session, latest completed:", latestSession)
            
            setCurrentSession({
              isCheckedIn: false,
              checkInTime: latestSession?.checkIn || null,
              checkOutTime: latestSession?.checkOut || null,
              sessionId: latestSession?.sessionId || null,
              location: latestSession?.location || "Web App",
              workingHours: latestSession?.durationMinutes
                ? `${Math.floor(latestSession.durationMinutes / 60)}h ${latestSession.durationMinutes % 60}m`
                : "0h 0m",
            })
          }
        } else {
          // No sessions today - user is not checked in
          console.log("❌ No sessions found for today")
          setCurrentSession({
            isCheckedIn: false,
            checkInTime: null,
            checkOutTime: null,
            sessionId: null,
            location: "Web App",
            workingHours: "0h 0m",
          })
        }
      } else {
        console.log("❌ API response not successful:", response)
        setCurrentSession({
          isCheckedIn: false,
          checkInTime: null,
          checkOutTime: null,
          sessionId: null,
          location: "Web App",
          workingHours: "0h 0m",
        })
      }
    } catch (error) {
      console.error("🚨 Error fetching current session:", error)
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

  // Fetch attendance history
  const fetchAttendanceData = async () => {
    if (!user?.user_id) return

    try {
      setLoading(true)
      console.log("🔄 Fetching attendance history...")
      const response = await attendanceApi.getAllAttendance(user.user_id, {
        limit: 100,
        page: 1,
      })

      console.log("📊 Attendance history response:", response)

      if (response.success && response.data) {
        let records: any[] = []
        
        if (Array.isArray(response.data)) {
          records = response.data
        } else if (Array.isArray(response.data.attendance)) {
          records = response.data.attendance
        } else if (response.data.days) {
          records = response.data.days.flatMap((day: any) => day.sessions || [])
        }

        const transformedData: AttendanceRecord[] = records.map((record: any) => ({
          sessionId: record.sessionId || `session_${user.user_id}_${record.date}`,
          date: record.date || new Date(record.checkIn).toISOString().split('T')[0],
          checkIn: record.checkIn,
          checkOut: record.checkOut || null,
          durationMinutes: record.durationMinutes || 0,
          location: record.location || "Web App",
        }))

        console.log("✅ Transformed attendance data:", transformedData)
        setAttendanceData(transformedData)
      } else {
        console.log("❌ Failed to fetch attendance data:", response.error)
        throw new Error(response.error || "Failed to fetch attendance data")
      }
    } catch (error) {
      console.error("🚨 Error fetching attendance:", error)
      toast({
        title: "Error",
        description: "Failed to load attendance data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Check in - IMPROVED
  const handleCheckIn = async (location: string = "Web App") => {
    if (!user?.user_id) {
      toast({
        title: "Error",
        description: "User not found",
        variant: "destructive",
      })
      return false
    }

    try {
      setActionLoading(true)
      console.log("🔄 Attempting check-in...")
      
      const response = await attendanceApi.checkIn(user.user_id, { location })
      console.log("📊 Check-in API response:", response)

      if (response.success) {
        console.log("✅ Check-in successful!")
        
        // FIXED: Update current session state IMMEDIATELY with the new session data
        const sessionData = response.data?.session || response.data
        console.log("🎯 Session data from check-in:", sessionData)
        
        // FIXED: Create the new session object
        const newSession = {
          isCheckedIn: true,
          checkInTime: sessionData?.checkIn || new Date().toISOString(),
          checkOutTime: null,
          sessionId: sessionData?.sessionId,
          location: sessionData?.location || location,
          workingHours: "0h 0m",
        }
        
        console.log("🔄 Setting new session:", newSession)
        setCurrentSession(newSession)

        toast({
          title: "Success",
          description: "Checked in successfully",
        })

        // FIXED: Only refresh attendance history, NOT current session (we already have the correct state)
        console.log("🔄 Refreshing attendance history only...")
        await fetchAttendanceData()
        
        return true
      } else {
        console.log("❌ Check-in failed:", response.error)
        throw new Error(response.error || "Failed to check in")
      }
    } catch (error) {
      console.error("🚨 Check-in error:", error)
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

  // Check out - IMPROVED
  const handleCheckOut = async (notes: string = "") => {
    if (!user?.user_id) {
      toast({
        title: "Error",
        description: "User not found",
        variant: "destructive",
      })
      return false
    }

    try {
      setActionLoading(true)
      console.log("🔄 Attempting check-out...")
      
      const response = await attendanceApi.checkOut(user.user_id)
      console.log("📊 Check-out API response:", response)

      if (response.success) {
        console.log("✅ Check-out successful!")
        
        // FIXED: Update current session state IMMEDIATELY
        const sessionData = response.data?.session || response.data
        console.log("🎯 Session data from check-out:", sessionData)
        
        setCurrentSession(prev => ({
          ...prev,
          isCheckedIn: false,
          checkOutTime: sessionData?.checkOut || new Date().toISOString(),
          workingHours: sessionData?.durationMinutes
            ? `${Math.floor(sessionData.durationMinutes / 60)}h ${sessionData.durationMinutes % 60}m`
            : "0h 0m",
        }))

        toast({
          title: "Success",
          description: "Checked out successfully",
        })

        // FIXED: Only refresh attendance history
        console.log("🔄 Refreshing attendance history only...")
        await fetchAttendanceData()
        
        return true
      } else {
        console.log("❌ Check-out failed:", response.error)
        throw new Error(response.error || "Failed to check out")
      }
    } catch (error) {
      console.error("🚨 Check-out error:", error)
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

  // Refresh all data
  const refreshData = async () => {
    console.log("🔄 Refreshing all data...")
    await Promise.all([fetchCurrentSession(), fetchAttendanceData()])
  }

  // Initialize data
  useEffect(() => {
    if (user?.user_id) {
      console.log("🚀 Initializing attendance data for user:", user.user_id)
      refreshData()
    }
  }, [user?.user_id])

  // Calculate stats
  const calculateStats = () => {
    const presentDays = attendanceData.filter((d) => d.checkIn && d.checkOut).length
    const totalDays = attendanceData.length
    const totalHours = Math.round(attendanceData.reduce((acc, d) => acc + (d.durationMinutes || 0), 0) / 60)
    
    const validRecords = attendanceData.filter(record => record.checkIn && record.checkOut)
    let averageCheckIn = "09:00"
    
    if (validRecords.length > 0) {
      const totalMinutes = validRecords.reduce((acc, record) => {
        const checkInTime = new Date(record.checkIn)
        return acc + (checkInTime.getHours() * 60 + checkInTime.getMinutes())
      }, 0)
      
      const averageMinutes = Math.round(totalMinutes / validRecords.length)
      const hours = Math.floor(averageMinutes / 60)
      const minutes = averageMinutes % 60
      averageCheckIn = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    }

    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0

    return {
      totalDays,
      presentDays,
      totalHours,
      averageCheckIn,
      attendancePercentage,
    }
  }

  const stats = calculateStats()

  return {
    // State
    attendanceData,
    currentSession,
    loading,
    actionLoading,
    
    // Actions
    handleCheckIn,
    handleCheckOut,
    refreshData,
    
    // Stats
    stats,
  }
}