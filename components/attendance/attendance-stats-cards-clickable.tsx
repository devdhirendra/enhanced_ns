"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react"

interface AttendanceStatsCardsClickableProps {
  presentCount: number
  absentCount: number
  totalHours: number
  averageCheckIn: string
  onCardClick?: (filter: "present" | "absent" | "hours" | "average") => void
}

export function AttendanceStatsCardsClickable({
  presentCount,
  absentCount,
  totalHours,
  averageCheckIn,
  onCardClick,
}: AttendanceStatsCardsClickableProps) {
  const totalEmployees = presentCount + absentCount
  const attendanceRate = totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
        onClick={() => onCardClick?.("present")}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-800">Present Today</CardTitle>
          <CheckCircle className="h-5 w-5 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-900">{presentCount}</div>
          <p className="text-xs text-green-600 mt-1">Click to filter</p>
        </CardContent>
      </Card>

      <Card
        className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
        onClick={() => onCardClick?.("absent")}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-800">Absent Today</CardTitle>
          <AlertCircle className="h-5 w-5 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-900">{absentCount}</div>
          <p className="text-xs text-red-600 mt-1">Click to filter</p>
        </CardContent>
      </Card>

      <Card
        className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
        onClick={() => onCardClick?.("hours")}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-800">Total Hours</CardTitle>
          <Clock className="h-5 w-5 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-900">{Math.round(totalHours)}h</div>
          <p className="text-xs text-blue-600 mt-1">This month</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-800">Attendance Rate</CardTitle>
          <TrendingUp className="h-5 w-5 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-900">{attendanceRate}%</div>
          <p className="text-xs text-purple-600 mt-1">{totalEmployees} employees</p>
        </CardContent>
      </Card>
    </div>
  )
}
