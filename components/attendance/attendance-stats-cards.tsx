"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Clock, UserCheck, CheckCircle } from "lucide-react"

interface AttendanceStatsCardsProps {
  attendanceRate: number
  totalHours: number
  averageCheckIn: string
  totalTasks: number
  onCardClick?: (filter: string) => void
}

export function AttendanceStatsCards({
  attendanceRate,
  totalHours,
  averageCheckIn,
  totalTasks,
  onCardClick,
}: AttendanceStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => onCardClick?.("present")}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-800">Attendance Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">{attendanceRate}%</div>
          <p className="text-xs text-green-600 mt-1">Click to filter</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-800">Total Hours</CardTitle>
          <Clock className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">{Math.round(totalHours)}h</div>
          <p className="text-xs text-blue-600 mt-1">This month</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-800">Avg Check-in</CardTitle>
          <UserCheck className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900">{averageCheckIn}</div>
          <p className="text-xs text-purple-600 mt-1">Average time</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-800">Tasks Done</CardTitle>
          <CheckCircle className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-900">{totalTasks}</div>
          <p className="text-xs text-orange-600 mt-1">This month</p>
        </CardContent>
      </Card>
    </div>
  )
}
