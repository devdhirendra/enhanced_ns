"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { attendanceApi } from "@/lib/attendance-api"
import { useToast } from "@/hooks/use-toast"
import { Download, RefreshCw, FileText, Calendar, Users, Clock } from "lucide-react"

interface ReportData {
  type: string
  generatedAt: string
  period: {
    from: string
    to: string
  }
  summary: {
    totalRecords: number
    totalEmployees: number
    overallAttendance: number
  }
  data: any[]
}

export default function AttendanceReportsPage() {
  const { toast } = useToast()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    type: "attendance",
    from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
    role: "all"
  })

  const reportTypes = [
    { value: "attendance", label: "Attendance Summary" },
    { value: "overtime", label: "Overtime Report" },
    { value: "regularization", label: "Regularization Report" },
  ]

  const generateReport = async () => {
    try {
      setLoading(true)
      const response = await attendanceApi.getReportsData({
        type: filters.type,
        from: filters.from,
        to: filters.to,
        role: filters.role === "all" ? undefined : filters.role
      })

      if (response.success && response.data) {
        setReportData(response.data)
        toast({
          title: "Success",
          description: "Report generated successfully",
        })
      } else {
        throw new Error(response.error || "Failed to generate report")
      }
    } catch (error) {
      console.error("Error generating report:", error)
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const exportReport = (format: string) => {
    toast({
      title: "Export Started",
      description: `${format.toUpperCase()} report will be downloaded shortly`,
    })
    // In real implementation, generate and download the report
  }

  const getReportColumns = () => {
    switch (filters.type) {
      case "attendance":
        return ["Date", "Present", "Absent", "Checked In", "Total Employees"]
      case "overtime":
        return ["Date", "Regular Hours", "Overtime Hours", "Total Hours"]
      case "regularization":
        return ["Employee", "Date", "Type", "Status", "Reason"]
      default:
        return []
    }
  }

  const renderReportData = () => {
    if (!reportData?.data) return null

    switch (filters.type) {
      case "attendance":
        return reportData.data.map((item: any, index: number) => (
          <TableRow key={index}>
            <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
            <TableCell>
              <Badge className="bg-green-100 text-green-800">{item.present || 0}</Badge>
            </TableCell>
            <TableCell>
              <Badge className="bg-red-100 text-red-800">{item.absent || 0}</Badge>
            </TableCell>
            <TableCell>
              <Badge className="bg-yellow-100 text-yellow-800">{item.checkedIn || 0}</Badge>
            </TableCell>
            <TableCell>{item.total || 0}</TableCell>
          </TableRow>
        ))
      
      case "overtime":
        return reportData.data.map((item: any, index: number) => (
          <TableRow key={index}>
            <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
            <TableCell>{item.regularHours?.toFixed(1) || 0}h</TableCell>
            <TableCell>
              <Badge className="bg-orange-100 text-orange-800">
                {item.overtimeHours?.toFixed(1) || 0}h
              </Badge>
            </TableCell>
            <TableCell>{((item.regularHours || 0) + (item.overtimeHours || 0)).toFixed(1)}h</TableCell>
          </TableRow>
        ))
      
      case "regularization":
        return reportData.data.map((item: any, index: number) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{item.employeeName}</TableCell>
            <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
            <TableCell>
              <Badge variant="outline">{item.type}</Badge>
            </TableCell>
            <TableCell>
              <Badge className={
                item.status === "approved" ? "bg-green-100 text-green-800" :
                item.status === "rejected" ? "bg-red-100 text-red-800" :
                "bg-yellow-100 text-yellow-800"
              }>
                {item.status}
              </Badge>
            </TableCell>
            <TableCell className="max-w-xs truncate">{item.reason}</TableCell>
          </TableRow>
        ))
      
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Reports</h1>
          <p className="text-gray-500">Generate and export detailed attendance reports</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={generateReport} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {loading ? "Generating..." : "Generate Report"}
          </Button>
        </div>
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
          <CardDescription>Configure your report parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fromDate">From Date</Label>
              <Input
                id="fromDate"
                type="date"
                value={filters.from}
                onChange={(e) => setFilters({ ...filters, from: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="toDate">To Date</Label>
              <Input
                id="toDate"
                type="date"
                value={filters.to}
                onChange={(e) => setFilters({ ...filters, to: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="roleFilter">Filter by Role</Label>
              <Select value={filters.role} onValueChange={(value) => setFilters({...filters, role: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="technician">Technician</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Summary */}
      {reportData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">Report Type</p>
                <p className="text-lg font-bold text-blue-600">{reportData.type}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">Period</p>
                <p className="text-lg font-bold text-green-600">
                  {new Date(reportData.period.from).toLocaleDateString()} - {new Date(reportData.period.to).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">Total Records</p>
                <p className="text-lg font-bold text-purple-600">{reportData.summary.totalRecords}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Data */}
      {reportData && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <CardTitle>Report Data</CardTitle>
                <CardDescription>
                  Generated on {new Date(reportData.generatedAt).toLocaleString()}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportReport("pdf")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportReport("excel")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {getReportColumns().map((column) => (
                      <TableHead key={column}>{column}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {renderReportData()}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!reportData && !loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Report Generated</h3>
              <p className="text-gray-500 mb-6">
                Configure your report parameters and click "Generate Report" to create a new report.
              </p>
              <Button onClick={generateReport}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate Your First Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}