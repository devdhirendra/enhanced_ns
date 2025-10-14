"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import DashboardLayout from "@/components/layout/DashboardLayout"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  Download,
  FileText,
  TrendingUp,
  Users,
  DollarSign,
  CalendarIcon,
  Filter,
  Eye,
  Mail,
  Share2,
  BarChart3,
  Activity,
  Plus,
  Send,
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

// Sample data for reports
const revenueData = [
  { month: "Jan", revenue: 847500, target: 800000, customers: 1198 },
  { month: "Feb", revenue: 923400, target: 850000, customers: 1245 },
  { month: "Mar", revenue: 876200, target: 900000, customers: 1289 },
  { month: "Apr", revenue: 1045600, target: 950000, customers: 1334 },
  { month: "May", revenue: 1123800, target: 1000000, customers: 1378 },
  { month: "Jun", revenue: 1198500, target: 1100000, customers: 1425 },
]

const technicianPerformance = [
  { name: "Ravi Kumar", tasksCompleted: 45, tasksAssigned: 48, rating: 4.8, area: "Zone A" },
  { name: "Suresh Singh", tasksCompleted: 52, tasksAssigned: 55, rating: 4.6, area: "Zone B" },
  { name: "Vikash Kumar", tasksCompleted: 38, tasksAssigned: 42, rating: 4.4, area: "Zone C" },
  { name: "Rohit Kumar", tasksCompleted: 41, tasksAssigned: 44, rating: 4.7, area: "Zone D" },
  { name: "Amit Singh", tasksCompleted: 35, tasksAssigned: 40, rating: 4.3, area: "Zone A" },
]

const complaintAnalysis = [
  { type: "No Internet", count: 45, resolved: 38, avgTime: 4.2 },
  { type: "Slow Speed", count: 32, resolved: 29, avgTime: 3.8 },
  { type: "Billing Issue", count: 18, resolved: 17, avgTime: 2.1 },
  { type: "Hardware Issue", count: 25, resolved: 22, avgTime: 6.5 },
  { type: "Installation", count: 15, resolved: 14, avgTime: 8.2 },
]

const customerGrowth = [
  { month: "Jan", newCustomers: 23, churnCustomers: 8, netGrowth: 15 },
  { month: "Feb", newCustomers: 34, churnCustomers: 12, netGrowth: 22 },
  { month: "Mar", newCustomers: 28, churnCustomers: 6, netGrowth: 22 },
  { month: "Apr", newCustomers: 41, churnCustomers: 9, netGrowth: 32 },
  { month: "May", newCustomers: 38, churnCustomers: 7, netGrowth: 31 },
  { month: "Jun", newCustomers: 45, churnCustomers: 11, netGrowth: 34 },
]

const planDistribution = [
  { plan: "Basic 25 Mbps", customers: 234, revenue: 69720, color: "#3b82f6" },
  { plan: "Standard 50 Mbps", customers: 456, revenue: 227400, color: "#10b981" },
  { plan: "Premium 100 Mbps", customers: 389, revenue: 272230, color: "#f59e0b" },
  { plan: "Unlimited 75 Mbps", customers: 346, revenue: 207240, color: "#8b5cf6" },
]

const areaWiseRevenue = [
  { area: "Zone A", revenue: 245600, customers: 387, avgRevenue: 635 },
  { area: "Zone B", revenue: 298400, customers: 445, avgRevenue: 671 },
  { area: "Zone C", revenue: 187300, customers: 298, avgRevenue: 629 },
  { area: "Zone D", revenue: 267200, customers: 395, avgRevenue: 676 },
]

const reportTemplates = [
  {
    id: "monthly_revenue",
    name: "Monthly Revenue Report",
    description: "Comprehensive revenue analysis with trends and comparisons",
    category: "Financial",
    frequency: "Monthly",
    lastGenerated: "2024-01-15",
    isScheduled: true,
    nextRun: "2024-02-15",
  },
  {
    id: "technician_performance",
    name: "Technician Performance Report",
    description: "Individual and team performance metrics with ratings",
    category: "Operations",
    frequency: "Weekly",
    lastGenerated: "2024-01-14",
    isScheduled: false,
    nextRun: null,
  },
  {
    id: "customer_satisfaction",
    name: "Customer Satisfaction Report",
    description: "Complaint analysis and resolution metrics",
    category: "Customer Service",
    frequency: "Monthly",
    lastGenerated: "2024-01-10",
    isScheduled: true,
    nextRun: "2024-02-10",
  },
  {
    id: "inventory_usage",
    name: "Inventory Usage Report",
    description: "Stock consumption and procurement analysis",
    category: "Inventory",
    frequency: "Monthly",
    lastGenerated: "2024-01-12",
    isScheduled: false,
    nextRun: null,
  },
]

export default function ReportsAnalytics() {
  const [selectedDateRange, setSelectedDateRange] = useState({
    from: new Date(2024, 0, 1),
    to: new Date(),
  })
  const [selectedAreas, setSelectedAreas] = useState(["Zone A", "Zone B", "Zone C", "Zone D"])
  const [selectedMetrics, setSelectedMetrics] = useState(["revenue", "customers", "complaints"])
  const [reportFormat, setReportFormat] = useState("pdf")
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [isCustomReportDialogOpen, setIsCustomReportDialogOpen] = useState(false)
  const [scheduleSettings, setScheduleSettings] = useState({
    reportId: "",
    frequency: "monthly",
    recipients: "",
    time: "09:00",
  })
  const [customReport, setCustomReport] = useState({
    name: "",
    type: "financial",
    schedule: "monthly",
    metrics: [],
    areas: [],
    description: "",
  })

  const areas = ["Zone A", "Zone B", "Zone C", "Zone D"]
  const metrics = [
    { id: "revenue", label: "Revenue" },
    { id: "customers", label: "Customers" },
    { id: "complaints", label: "Complaints" },
    { id: "technicians", label: "Technician Performance" },
    { id: "inventory", label: "Inventory Usage" },
  ]

  const handleAreaToggle = (area: string) => {
    setSelectedAreas((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]))
  }

  const handleMetricToggle = (metric: string) => {
    setSelectedMetrics((prev) => (prev.includes(metric) ? prev.filter((m) => m !== metric) : [...prev, metric]))
  }

  const handleScheduleReports = () => {
    setIsScheduleDialogOpen(true)
  }

  const handleExportDashboard = () => {
    const dashboardData = {
      revenue: revenueData,
      technicians: technicianPerformance,
      complaints: complaintAnalysis,
      customers: customerGrowth,
      plans: planDistribution,
      areas: areaWiseRevenue,
      exportDate: new Date().toISOString(),
      dateRange: selectedDateRange,
      selectedAreas,
      selectedMetrics,
    }

    const dataStr = JSON.stringify(dashboardData, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = `dashboard-export-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()

    toast.success("Dashboard exported successfully!")
  }

  const generateReport = (templateId: string) => {
    const template = reportTemplates.find((t) => t.id === templateId)
    if (!template) return

    // Simulate report generation
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(`${template.name} generated successfully!`)
        }, 2000)
      }),
      {
        loading: `Generating ${template.name}...`,
        success: (data) => {
          // Simulate download
          const blob = new Blob(
            [
              `Report: ${template.name}
Generated: ${new Date().toISOString()}`,
            ],
            {
              type: "text/plain",
            },
          )
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `${template.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.txt`
          a.click()
          window.URL.revokeObjectURL(url)
          return data as string
        },
        error: "Failed to generate report",
      },
    )
  }

  const previewReport = (templateId: string) => {
    const template = reportTemplates.find((t) => t.id === templateId)
    toast.info(`Preview for ${template?.name}`, {
      description: "Opening report preview in new window...",
    })
  }

  const shareReport = (templateId: string) => {
    const template = reportTemplates.find((t) => t.id === templateId)
    navigator.clipboard.writeText(`Report: ${template?.name} - Generated on ${new Date().toLocaleDateString()}`)
    toast.success("Report link copied to clipboard!")
  }

  const exportChart = (chartName: string) => {
    toast.success(`${chartName} chart exported successfully!`)
  }

  const handleCreateCustomReport = () => {
    if (!customReport.name || !customReport.type) {
      toast.error("Please fill in all required fields")
      return
    }

    toast.success(`Custom report "${customReport.name}" created successfully!`)
    setCustomReport({
      name: "",
      type: "financial",
      schedule: "monthly",
      metrics: [],
      areas: [],
      description: "",
    })
    setIsCustomReportDialogOpen(false)
  }

  const handleSaveSchedule = () => {
    if (!scheduleSettings.reportId || !scheduleSettings.recipients) {
      toast.error("Please fill in all required fields")
      return
    }

    toast.success("Report schedule saved successfully!")
    setIsScheduleDialogOpen(false)
  }

  return (
        <DashboardLayout title="Report Dashboard" description="Overview of your network operations">
    
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-4 sm:p-6 space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-1">Generate comprehensive reports and analyze business metrics</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <Button variant="outline" onClick={handleScheduleReports} className="bg-white/80 backdrop-blur-sm">
              <Mail className="h-4 w-4 mr-2" />
              Schedule Reports
            </Button>
            <Button
              onClick={handleExportDashboard}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Dashboard
            </Button>
          </div>
        </div>

        {/* Report Filters */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Report Filters
            </CardTitle>
            <CardDescription>Configure date range, areas, and metrics for your reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Range */}
              <div className="space-y-2">
                <Label>Date Range</Label>
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-white/80 backdrop-blur-sm"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDateRange.from ? (
                        selectedDateRange.to ? (
                          <>
                            {format(selectedDateRange.from, "LLL dd, y")} - {format(selectedDateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(selectedDateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={selectedDateRange.from}
                      selected={selectedDateRange}
                      onSelect={setSelectedDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Areas */}
              <div className="space-y-2">
                <Label>Areas</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {areas.map((area) => (
                    <div key={area} className="flex items-center space-x-2">
                      <Checkbox
                        id={area}
                        checked={selectedAreas.includes(area)}
                        onCheckedChange={() => handleAreaToggle(area)}
                      />
                      <Label htmlFor={area} className="text-sm">
                        {area}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metrics */}
              <div className="space-y-2">
                <Label>Metrics</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {metrics.map((metric) => (
                    <div key={metric.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={metric.id}
                        checked={selectedMetrics.includes(metric.id)}
                        onCheckedChange={() => handleMetricToggle(metric.id)}
                      />
                      <Label htmlFor={metric.id} className="text-sm">
                        {metric.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Export Format */}
              <div className="space-y-2">
                <Label>Export Format</Label>
                <Select value={reportFormat} onValueChange={setReportFormat}>
                  <SelectTrigger className="bg-white/80 backdrop-blur-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Report</SelectItem>
                    <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                    <SelectItem value="csv">CSV Data</SelectItem>
                    <SelectItem value="powerpoint">PowerPoint</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                onClick={() => exportChart("Filtered Report")}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Filtered Data
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedAreas(areas)
                  setSelectedMetrics(metrics.map((m) => m.id))
                  toast.success("All filters selected")
                }}
                className="bg-white/80 backdrop-blur-sm"
              >
                Select All
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedAreas([])
                  setSelectedMetrics([])
                  toast.success("All filters cleared")
                }}
                className="bg-white/80 backdrop-blur-sm"
              >
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Analytics Dashboard */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-green-600">₹12.4L</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600 font-medium">+15.2%</span>
                    <span className="text-sm text-gray-500 ml-1">vs last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Customers</p>
                      <p className="text-2xl font-bold text-blue-600">1,425</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600 font-medium">+34</span>
                    <span className="text-sm text-gray-500 ml-1">new this month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avg Resolution Time</p>
                      <p className="text-2xl font-bold text-orange-600">4.2h</p>
                    </div>
                    <Activity className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600 font-medium">-15%</span>
                    <span className="text-sm text-gray-500 ml-1">improvement</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Customer Satisfaction</p>
                      <p className="text-2xl font-bold text-purple-600">4.6/5</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600 font-medium">+0.3</span>
                    <span className="text-sm text-gray-500 ml-1">vs last month</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Trend */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Monthly revenue vs targets</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportChart("Revenue Trend")}
                  className="bg-white/80 backdrop-blur-sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      fill="url(#colorRevenue)"
                      strokeWidth={2}
                      name="Revenue"
                    />
                    <Line type="monotone" dataKey="target" stroke="#f59e0b" strokeWidth={2} name="Target" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Plan Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Plan Distribution</CardTitle>
                    <CardDescription>Customer distribution by plans</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportChart("Plan Distribution")}
                    className="bg-white/80 backdrop-blur-sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={planDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="customers"
                        label={({ plan, customers }) => `${plan}: ${customers}`}
                      >
                        {planDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Area-wise Performance</CardTitle>
                    <CardDescription>Revenue and customers by area</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportChart("Area Performance")}
                    className="bg-white/80 backdrop-blur-sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={areaWiseRevenue}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="area" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="revenue" fill="#3b82f6" name="Revenue (₹)" />
                      <Bar dataKey="customers" fill="#10b981" name="Customers" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            {/* Revenue Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Monthly Revenue Growth</CardTitle>
                    <CardDescription>Revenue trend over the last 6 months</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportChart("Revenue Growth")}
                    className="bg-white/80 backdrop-blur-sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} name="Actual Revenue" />
                      <Line
                        type="monotone"
                        dataKey="target"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Target"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                  <CardDescription>Current month revenue analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {planDistribution.map((plan) => (
                      <div key={plan.plan} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: plan.color }} />
                          <div>
                            <p className="font-medium">{plan.plan}</p>
                            <p className="text-sm text-gray-500">{plan.customers} customers</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹{plan.revenue.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">₹{Math.round(plan.revenue / plan.customers)}/customer</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Area-wise Revenue Details */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Area-wise Revenue Analysis</CardTitle>
                <CardDescription>Detailed revenue breakdown by operational areas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Area</th>
                        <th className="text-right p-3">Revenue</th>
                        <th className="text-right p-3">Customers</th>
                        <th className="text-right p-3">Avg Revenue/Customer</th>
                        <th className="text-right p-3">Growth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {areaWiseRevenue.map((area, index) => (
                        <tr key={area.area} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{area.area}</td>
                          <td className="p-3 text-right">₹{area.revenue.toLocaleString()}</td>
                          <td className="p-3 text-right">{area.customers}</td>
                          <td className="p-3 text-right">₹{area.avgRevenue}</td>
                          <td className="p-3 text-right">
                            <Badge className="bg-green-100 text-green-800">
                              +{(Math.random() * 20 + 5).toFixed(1)}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="operations" className="space-y-6">
            {/* Technician Performance */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Technician Performance</CardTitle>
                  <CardDescription>Individual performance metrics and ratings</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportChart("Technician Performance")}
                  className="bg-white/80 backdrop-blur-sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {technicianPerformance.map((tech) => (
                    <div key={tech.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{tech.name}</h3>
                          <p className="text-sm text-gray-500">{tech.area}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Tasks</p>
                          <p className="font-semibold">
                            {tech.tasksCompleted}/{tech.tasksAssigned}
                          </p>
                          <p className="text-xs text-gray-400">
                            {Math.round((tech.tasksCompleted / tech.tasksAssigned) * 100)}%
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Rating</p>
                          <p className="font-semibold">{tech.rating}/5.0</p>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full mr-1 ${
                                  i < Math.floor(tech.rating) ? "bg-yellow-400" : "bg-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Complaint Analysis */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Complaint Analysis</CardTitle>
                  <CardDescription>Breakdown of complaints by type and resolution metrics</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportChart("Complaint Analysis")}
                  className="bg-white/80 backdrop-blur-sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={complaintAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="type" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#ef4444" name="Total Complaints" />
                    <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            {/* Customer Growth */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Customer Growth Analysis</CardTitle>
                  <CardDescription>New customers vs churn over time</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportChart("Customer Growth")}
                  className="bg-white/80 backdrop-blur-sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={customerGrowth}>
                    <defs>
                      <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorChurn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="newCustomers"
                      stackId="1"
                      stroke="#10b981"
                      fill="url(#colorNew)"
                      name="New Customers"
                    />
                    <Area
                      type="monotone"
                      dataKey="churnCustomers"
                      stackId="2"
                      stroke="#ef4444"
                      fill="url(#colorChurn)"
                      name="Churned Customers"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Customer Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100">
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Customer Acquisition Cost</p>
                    <p className="text-3xl font-bold text-blue-600">₹1,245</p>
                    <p className="text-sm text-gray-500 mt-1">Average per customer</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100">
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Customer Lifetime Value</p>
                    <p className="text-3xl font-bold text-green-600">₹18,500</p>
                    <p className="text-sm text-gray-500 mt-1">Estimated value</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-100">
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Churn Rate</p>
                    <p className="text-3xl font-bold text-orange-600">2.3%</p>
                    <p className="text-sm text-gray-500 mt-1">Monthly average</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            {/* Report Templates */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Report Templates</CardTitle>
                <CardDescription>Pre-configured reports for regular business analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reportTemplates.map((template) => (
                    <Card key={template.id} className="border-2 hover:border-blue-200 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{template.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                          </div>
                          <Badge variant="outline">{template.category}</Badge>
                        </div>
                        <div className="space-y-2 text-sm text-gray-500">
                          <div className="flex justify-between">
                            <span>Frequency:</span>
                            <span>{template.frequency}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Last Generated:</span>
                            <span>{template.lastGenerated}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Scheduled:</span>
                            <span className={template.isScheduled ? "text-green-600" : "text-gray-400"}>
                              {template.isScheduled ? "Yes" : "No"}
                            </span>
                          </div>
                          {template.nextRun && (
                            <div className="flex justify-between">
                              <span>Next Run:</span>
                              <span>{template.nextRun}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <Button size="sm" onClick={() => generateReport(template.id)}>
                            <FileText className="h-4 w-4 mr-2" />
                            Generate
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => previewReport(template.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => shareReport(template.id)}>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Custom Report Builder */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Custom Report Builder</CardTitle>
                <CardDescription>Create custom reports with specific metrics and filters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Report Name</Label>
                      <Input
                        placeholder="Enter report name"
                        value={customReport.name}
                        onChange={(e) => setCustomReport({ ...customReport, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Report Type</Label>
                      <Select
                        value={customReport.type}
                        onValueChange={(value) => setCustomReport({ ...customReport, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="financial">Financial</SelectItem>
                          <SelectItem value="operational">Operational</SelectItem>
                          <SelectItem value="customer">Customer</SelectItem>
                          <SelectItem value="technical">Technical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Schedule</Label>
                      <Select
                        value={customReport.schedule}
                        onValueChange={(value) => setCustomReport({ ...customReport, schedule: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe what this report should include..."
                      value={customReport.description}
                      onChange={(e) => setCustomReport({ ...customReport, description: e.target.value })}
                    />
                  </div>
                  <div className="flex space-x-3">
                    <Dialog open={isCustomReportDialogOpen} onOpenChange={setIsCustomReportDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Report
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create Custom Report</DialogTitle>
                          <DialogDescription>Configure your custom report settings</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Select Metrics</Label>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              {metrics.map((metric) => (
                                <div key={metric.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`custom-${metric.id}`}
                                    checked={customReport.metrics.includes(metric.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setCustomReport({
                                          ...customReport,
                                          metrics: [...customReport.metrics, metric.id],
                                        })
                                      } else {
                                        setCustomReport({
                                          ...customReport,
                                          metrics: customReport.metrics.filter((m) => m !== metric.id),
                                        })
                                      }
                                    }}
                                  />
                                  <Label htmlFor={`custom-${metric.id}`} className="text-sm">
                                    {metric.label}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <Label>Select Areas</Label>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              {areas.map((area) => (
                                <div key={area} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`custom-${area}`}
                                    checked={customReport.areas.includes(area)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setCustomReport({ ...customReport, areas: [...customReport.areas, area] })
                                      } else {
                                        setCustomReport({
                                          ...customReport,
                                          areas: customReport.areas.filter((a) => a !== area),
                                        })
                                      }
                                    }}
                                  />
                                  <Label htmlFor={`custom-${area}`} className="text-sm">
                                    {area}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setIsCustomReportDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreateCustomReport}>Create Report</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" onClick={() => previewReport("custom")}>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Schedule Reports Dialog */}
        <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Reports</DialogTitle>
              <DialogDescription>Set up automatic report generation and delivery</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Select Report</Label>
                <Select
                  value={scheduleSettings.reportId}
                  onValueChange={(value) => setScheduleSettings({ ...scheduleSettings, reportId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose report to schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Frequency</Label>
                <Select
                  value={scheduleSettings.frequency}
                  onValueChange={(value) => setScheduleSettings({ ...scheduleSettings, frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Email Recipients</Label>
                <Input
                  placeholder="Enter email addresses separated by commas"
                  value={scheduleSettings.recipients}
                  onChange={(e) => setScheduleSettings({ ...scheduleSettings, recipients: e.target.value })}
                />
              </div>
              <div>
                <Label>Delivery Time</Label>
                <Input
                  type="time"
                  value={scheduleSettings.time}
                  onChange={(e) => setScheduleSettings({ ...scheduleSettings, time: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSchedule}>
                <Send className="h-4 w-4 mr-2" />
                Save Schedule
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  </DashboardLayout>
  )
}
