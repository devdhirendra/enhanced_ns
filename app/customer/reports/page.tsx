"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { FileText, Download, TrendingUp, Activity, Wifi, Clock, AlertCircle, CheckCircle } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"

export default function CustomerReportsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [dateRange, setDateRange] = useState("30")
  const [reportType, setReportType] = useState("usage")
  const [loading, setLoading] = useState(true)
  const [usageData, setUsageData] = useState([])
  const [billingData, setBillingData] = useState([])
  const [recentReports, setRecentReports] = useState([])

  useEffect(() => {
    if (user?.user_id) {
      fetchCustomerReports()
    }
  }, [user])

  const fetchCustomerReports = async () => {
    try {
      setLoading(true)

      // Fetch customer profile and usage data
      const customerData = await apiClient.getCustomerProfile(user.user_id)

      // Mock data with API integration structure - replace with actual API calls when available
      const mockUsageData = [
        { month: "Jan", download: 45, upload: 12 },
        { month: "Feb", download: 52, upload: 15 },
        { month: "Mar", download: 48, upload: 13 },
        { month: "Apr", download: 61, upload: 18 },
        { month: "May", download: 55, upload: 16 },
        { month: "Jun", download: 67, upload: 20 },
      ]

      const mockBillingData = [
        { month: "Jan", amount: 1999, status: "paid" },
        { month: "Feb", amount: 1999, status: "paid" },
        { month: "Mar", amount: 1999, status: "paid" },
        { month: "Apr", amount: 1999, status: "overdue" },
        { month: "May", amount: 1999, status: "pending" },
        { month: "Jun", amount: 1999, status: "pending" },
      ]

      const mockRecentReports = [
        {
          id: "RPT-001",
          type: "Usage Report",
          period: "May 2024",
          generatedAt: "2024-06-01T10:00:00Z",
          status: "completed",
        },
        {
          id: "RPT-002",
          type: "Billing Report",
          period: "Q1 2024",
          generatedAt: "2024-04-01T10:00:00Z",
          status: "completed",
        },
        {
          id: "RPT-003",
          type: "Service Report",
          period: "April 2024",
          generatedAt: "2024-05-01T10:00:00Z",
          status: "completed",
        },
      ]

      setUsageData(mockUsageData)
      setBillingData(mockBillingData)
      setRecentReports(mockRecentReports)
    } catch (error) {
      console.error("Error fetching customer reports:", error)
      toast({
        title: "Error",
        description: "Failed to load reports data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const serviceData = [
    { name: "Uptime", value: 99.2, color: "#10b981" },
    { name: "Downtime", value: 0.8, color: "#ef4444" },
  ]

  const generateReport = async () => {
    try {
      console.log(`Generating ${reportType} report for ${dateRange} days`)

      toast({
        title: "Report Generation Started",
        description: `Your ${reportType} report is being generated. You'll be notified when it's ready.`,
      })
    } catch (error) {
      console.error("Error generating report:", error)
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Reports & Analytics" description="Loading reports data...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Reports & Analytics" description="View detailed reports and analytics">
      <div className="space-y-6">
        {/* Report Generation */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Generate New Report
            </CardTitle>
            <CardDescription>Create custom reports for your account activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="report-type">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usage">Usage Report</SelectItem>
                    <SelectItem value="billing">Billing Report</SelectItem>
                    <SelectItem value="service">Service Report</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-range">Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 3 months</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={generateReport} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="usage" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
            <TabsTrigger value="billing">Billing Reports</TabsTrigger>
            <TabsTrigger value="service">Service Reports</TabsTrigger>
            <TabsTrigger value="history">Report History</TabsTrigger>
          </TabsList>

          <TabsContent value="usage" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Total Download</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">328 GB</div>
                  <p className="text-xs text-gray-500 mt-1">This month</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Total Upload</CardTitle>
                  <Activity className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">94 GB</div>
                  <p className="text-xs text-gray-500 mt-1">This month</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Avg Speed</CardTitle>
                  <Wifi className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">87 Mbps</div>
                  <p className="text-xs text-gray-500 mt-1">Download speed</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Peak Usage</CardTitle>
                  <Clock className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">8-10 PM</div>
                  <p className="text-xs text-gray-500 mt-1">Daily peak hours</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Usage Trend</CardTitle>
                <CardDescription>Your data usage over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="download" fill="#3b82f6" name="Download (GB)" />
                    <Bar dataKey="upload" fill="#10b981" name="Upload (GB)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>Your payment history and billing trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={billingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(value as number), "Amount"]} />
                    <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Status Summary</CardTitle>
                <CardDescription>Overview of your payment history</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billingData.map((bill, index) => (
                      <TableRow key={index}>
                        <TableCell>{bill.month} 2024</TableCell>
                        <TableCell>{formatCurrency(bill.amount)}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              bill.status === "paid"
                                ? "bg-green-100 text-green-800"
                                : bill.status === "overdue"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{bill.month} 28, 2024</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="service" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Service Uptime</CardTitle>
                  <CardDescription>Your connection reliability this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={serviceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {serviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="text-center mt-4">
                    <div className="text-2xl font-bold text-green-600">99.2%</div>
                    <p className="text-sm text-gray-500">Uptime this month</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service Incidents</CardTitle>
                  <CardDescription>Recent service issues and resolutions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Service Restored</p>
                        <p className="text-xs text-gray-500">June 15, 2024 - 2 hours downtime</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Scheduled Maintenance</p>
                        <p className="text-xs text-gray-500">June 20, 2024 - 2:00 AM to 4:00 AM</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generated Reports</CardTitle>
                <CardDescription>Your previously generated reports</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Generated</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.id}</TableCell>
                        <TableCell>{report.type}</TableCell>
                        <TableCell>{report.period}</TableCell>
                        <TableCell>{formatDate(report.generatedAt)}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
