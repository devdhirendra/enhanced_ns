"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { attendanceApi } from "@/lib/attendance-api"
import { TrendingUp } from "lucide-react"

interface OvertimeDay {
  date: string
  regularMinutes: number
  overtimeMinutes: number
  totalMinutes: number
}

interface OvertimeSummaryProps {
  userId: string
  from: string
  to: string
}

export function OvertimeSummary({ userId, from, to }: OvertimeSummaryProps) {
  const { toast } = useToast()
  const [summary, setSummary] = useState<{
    totalOvertimeMinutes: number
    totalOvertimeHours: number
    overtimeDays: number
    breakdown: OvertimeDay[]
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOvertimeSummary()
  }, [userId, from, to])

  const fetchOvertimeSummary = async () => {
    try {
      setLoading(true)
      const response = await attendanceApi.getOvertimeSummary(userId, from, to)
      if (response.success) {
        setSummary(response.data?.summary || null)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load overtime summary",
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
          <p className="text-center text-gray-500">No overtime data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Overtime Summary
        </CardTitle>
        <CardDescription>Track your overtime hours</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm">Total Overtime</p>
                <p className="text-3xl font-bold text-blue-600">{summary.totalOvertimeHours}h</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm">Overtime Days</p>
                <p className="text-3xl font-bold text-purple-600">{summary.overtimeDays}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm">Avg Overtime/Day</p>
                <p className="text-3xl font-bold text-orange-600">
                  {summary.overtimeDays > 0 ? (summary.totalOvertimeMinutes / summary.overtimeDays / 60).toFixed(1) : 0}
                  h
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Regular Hours</TableHead>
                <TableHead>Overtime Hours</TableHead>
                <TableHead>Total Hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.breakdown.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    No overtime recorded
                  </TableCell>
                </TableRow>
              ) : (
                summary.breakdown.map((day, index) => (
                  <TableRow key={index}>
                    <TableCell>{new Date(day.date).toLocaleDateString()}</TableCell>
                    <TableCell>{(day.regularMinutes / 60).toFixed(1)}h</TableCell>
                    <TableCell>
                      {day.overtimeMinutes > 0 ? (
                        <Badge className="bg-orange-100 text-orange-800">
                          {(day.overtimeMinutes / 60).toFixed(1)}h
                        </Badge>
                      ) : (
                        "---"
                      )}
                    </TableCell>
                    <TableCell>{(day.totalMinutes / 60).toFixed(1)}h</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
