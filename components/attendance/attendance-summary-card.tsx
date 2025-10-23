"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { attendanceApi } from "@/lib/attendance-api"
import { Calendar, Clock, TrendingUp } from "lucide-react"

interface AttendanceSummary {
  totalDays: number
  presentDays: number
  absentDays: number
  leaveDays: number
  totalWorkMinutes: number
  totalWorkHours: number
  averageHoursPerDay: number
}

interface AttendanceSummaryCardProps {
  userId: string
  yearMonth: string
}

export function AttendanceSummaryCard({ userId, yearMonth }: AttendanceSummaryCardProps) {
  const { toast } = useToast()
  const [summary, setSummary] = useState<AttendanceSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSummary()
  }, [userId, yearMonth])

  const fetchSummary = async () => {
    try {
      setLoading(true)
      const response = await attendanceApi.getMonthSummary(userId, yearMonth)
      if (response.success) {
        setSummary(response.data?.summary || null)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load attendance summary",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!summary) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">No attendance data available</p>
        </CardContent>
      </Card>
    )
  }

  const attendancePercentage = Math.round((summary.presentDays / summary.totalDays) * 100)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Present Days
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.presentDays}</div>
          <p className="text-xs text-gray-600">out of {summary.totalDays} days</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Total Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalWorkHours}h</div>
          <p className="text-xs text-gray-600">{summary.averageHoursPerDay.toFixed(1)}h per day average</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Attendance Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{attendancePercentage}%</div>
          <p className="text-xs text-gray-600">
            {summary.absentDays} absent, {summary.leaveDays} leave
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge
            className={
              attendancePercentage >= 80
                ? "bg-green-100 text-green-800"
                : attendancePercentage >= 60
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
            }
          >
            {attendancePercentage >= 80 ? "Excellent" : attendancePercentage >= 60 ? "Good" : "Needs Improvement"}
          </Badge>
        </CardContent>
      </Card>
    </div>
  )
}
