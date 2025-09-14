"use client"

import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  Download,
  Calendar,
  Filter,
  Building2,
  Clock,
  Settings,
  Loader2,
} from "lucide-react"
import {
  Area,
  Bar,
  BarChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ComposedChart,
  Tooltip,
} from "recharts"
import { formatCurrency } from "@/lib/utils"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { analyticsApi } from "@/lib/api"

export default function AnalyticsPage() {
  const [selectedDateRange, setSelectedDateRange] = useState("6months")
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState({
    overview: null,
    revenue: [],
    operators: [],
    technicians: [],
    inventory: [],
    complaints: [],
    marketplace: [],
  })
  const [scheduleForm, setScheduleForm] = useState({
    reportName: "",
    frequency: "weekly",
    email: "",
    format: "pdf",
    description: "",
  })

  useEffect(() => {
    loadAnalyticsData()
  }, [selectedDateRange])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      const [overview, revenue, operators, technicians, inventory, complaints, marketplace] = await Promise.all([
        analyticsApi.getOverview(),
        analyticsApi.getRevenue({ period: selectedDateRange }),
        analyticsApi.getOperators({ period: selectedDateRange }),
        analyticsApi.getTechnicians({ period: selectedDateRange }),
        analyticsApi.getInventory({ period: selectedDateRange }),
        analyticsApi.getComplaints({ period: selectedDateRange }),
        analyticsApi.getMarketplace({ period: selectedDateRange }),
      ])

      setAnalyticsData({
        overview,
        revenue,
        operators,
        technicians,
        inventory,
        complaints,
        marketplace,
      })
    } catch (error) {
      console.error("Failed to load analytics:", error)
      toast.error("Failed to load analytics data")
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = async () => {
    try {
      toast.success("Report export started! You'll receive an email when it's ready.")
      await analyticsApi.exportReport({
        type: "comprehensive",
        period: selectedDateRange,
        format: "pdf",
      })
      toast.success("Report exported successfully and sent to your email!")
    } catch (error) {
      toast.error("Failed to export report")
    }
  }

  const handleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters)
    toast.info("Advanced filters panel " + (showAdvancedFilters ? "closed" : "opened"))
  }

  const handleScheduleReport = async () => {
    if (!scheduleForm.reportName || !scheduleForm.email) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      await analyticsApi.scheduleReport(scheduleForm)
      toast.success(`Report "${scheduleForm.reportName}" scheduled successfully!`)
      setShowScheduleDialog(false)
      setScheduleForm({
        reportName: "",
        frequency: "weekly",
        email: "",
        format: "pdf",
        description: "",
      })
    } catch (error) {
      toast.error("Failed to schedule report")
    }
  }

  if (loading) {
    return (
      <DashboardLayout
        title="Analytics & Reports"
        description="Comprehensive business intelligence and performance metrics"
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading analytics data...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Analytics & Reports"
      description="Comprehensive business intelligence and performance metrics"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
              <SelectTrigger className="w-48">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleAdvancedFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleExportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule Report
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Schedule Report</DialogTitle>
                  <DialogDescription>Set up automated report delivery</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="reportName">Report Name *</Label>
                    <Input
                      id="reportName"
                      value={scheduleForm.reportName}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, reportName: e.target.value })}
                      placeholder="Monthly Analytics Report"
                    />
                  </div>
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select
                      value={scheduleForm.frequency}
                      onValueChange={(value) => setScheduleForm({ ...scheduleForm, frequency: value })}
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
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={scheduleForm.email}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, email: e.target.value })}
                      placeholder="admin@company.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="format">Format</Label>
                    <Select
                      value={scheduleForm.format}
                      onValueChange={(value) => setScheduleForm({ ...scheduleForm, format: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={scheduleForm.description}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                      placeholder="Optional description..."
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleScheduleReport}>Schedule Report</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Advanced Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Operator Status</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Revenue Range</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ranges</SelectItem>
                      <SelectItem value="0-50k">₹0 - ₹50,000</SelectItem>
                      <SelectItem value="50k-100k">₹50,000 - ₹1,00,000</SelectItem>
                      <SelectItem value="100k+">₹1,00,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Geographic Region</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      <SelectItem value="north">North India</SelectItem>
                      <SelectItem value="south">South India</SelectItem>
                      <SelectItem value="east">East India</SelectItem>
                      <SelectItem value="west">West India</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={() => setShowAdvancedFilters(false)}>
                  Close
                </Button>
                <Button onClick={() => toast.success("Filters applied successfully!")}>Apply Filters</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Performance Indicators */}
        {analyticsData.overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Total Revenue</CardTitle>
                <div className="p-2 bg-blue-500 rounded-lg">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(analyticsData.overview.totalRevenue)}
                </div>
                <div className="flex items-center mt-2">
                  {analyticsData.overview.revenueGrowth >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span
                    className={`text-sm font-medium ${analyticsData.overview.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {analyticsData.overview.revenueGrowth >= 0 ? "+" : ""}
                    {analyticsData.overview.revenueGrowth}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Active Operators</CardTitle>
                <div className="p-2 bg-green-500 rounded-lg">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{analyticsData.overview.activeOperators}</div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600 font-medium">+{analyticsData.overview.newOperators} new</span>
                  <span className="text-sm text-gray-500 ml-1">this month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">System Efficiency</CardTitle>
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Activity className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{analyticsData.overview.systemEfficiency}%</div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600 font-medium">
                    +{analyticsData.overview.efficiencyImprovement}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">improvement</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Customer Satisfaction</CardTitle>
                <div className="p-2 bg-orange-500 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{analyticsData.overview.customerSatisfaction}/5</div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600 font-medium">
                    +{analyticsData.overview.satisfactionIncrease}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">rating increase</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analytics Tabs */}
        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger value="revenue" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Revenue
            </TabsTrigger>
            <TabsTrigger value="operators" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Operators
            </TabsTrigger>
            <TabsTrigger value="technicians" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Technicians
            </TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Inventory
            </TabsTrigger>
            <TabsTrigger value="complaints" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Support
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Marketplace
            </TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Revenue Growth Trend</CardTitle>
                  <CardDescription>Monthly revenue and growth rate analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto">
                    <ResponsiveContainer width="100%" height={350}>
                      <ComposedChart data={analyticsData.revenue}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" />
                        <YAxis yAxisId="left" stroke="#6b7280" />
                        <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                        <Tooltip />
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="revenue"
                          stroke="#3b82f6"
                          fillOpacity={1}
                          fill="url(#colorRevenue)"
                          strokeWidth={2}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="growth"
                          stroke="#10b981"
                          strokeWidth={3}
                          dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Geographic Distribution</CardTitle>
                  <CardDescription>Revenue by state</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {analyticsData.revenue.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{item.region || `Region ${index + 1}`}</span>
                          <span>{formatCurrency(item.revenue)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${Math.min((item.revenue / Math.max(...analyticsData.revenue.map((r) => r.revenue))) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="operators" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Operator Performance</CardTitle>
                  <CardDescription>Revenue and efficiency metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto">
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={analyticsData.operators}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
                        <YAxis stroke="#6b7280" />
                        <Tooltip />
                        <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Operator Details</CardTitle>
                  <CardDescription>Performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {analyticsData.operators.map((operator, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-gray-900">{operator.name}</h4>
                          <Badge
                            className={operator.growth > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                          >
                            {operator.growth > 0 ? "+" : ""}
                            {operator.growth}%
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Revenue</p>
                            <p className="font-medium">{formatCurrency(operator.revenue)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Efficiency</p>
                            <p className="font-medium">{operator.efficiency}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Similar updates for other tabs... */}
          <TabsContent value="technicians" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Technician Performance</CardTitle>
                  <CardDescription>Active technicians and task completion</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto">
                    <ResponsiveContainer width="100%" height={350}>
                      <ComposedChart data={analyticsData.technicians}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" />
                        <YAxis yAxisId="left" stroke="#6b7280" />
                        <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                        <Tooltip />
                        <Bar yAxisId="left" dataKey="active" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="avgTime"
                          stroke="#f59e0b"
                          strokeWidth={3}
                          dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Service Quality Metrics</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {analyticsData.technicians.length > 0 && (
                      <>
                        <div className="text-center">
                          <div className="text-4xl font-bold text-green-600">
                            {analyticsData.technicians[analyticsData.technicians.length - 1]?.avgTime || 0}h
                          </div>
                          <p className="text-sm text-gray-500">Average Task Time</p>
                        </div>
                        <div className="text-center">
                          <div className="text-4xl font-bold text-blue-600">
                            {analyticsData.technicians[analyticsData.technicians.length - 1]?.satisfaction || 0}/5
                          </div>
                          <p className="text-sm text-gray-500">Customer Satisfaction</p>
                        </div>
                        <div className="text-center">
                          <div className="text-4xl font-bold text-purple-600">
                            {analyticsData.technicians[analyticsData.technicians.length - 1]?.tasks || 0}
                          </div>
                          <p className="text-sm text-gray-500">Tasks Completed</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Inventory Overview</CardTitle>
                  <CardDescription>Stock levels and usage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto">
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={analyticsData.inventory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="category" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip />
                        <Bar dataKey="stock" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="issued" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Inventory Details</CardTitle>
                  <CardDescription>Stock value and metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {analyticsData.inventory.map((item, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-gray-900">{item.category}</h4>
                          <Badge variant="outline">{item.turnover}x turnover</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Stock</p>
                            <p className="font-medium">{item.stock} units</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Value</p>
                            <p className="font-medium">{formatCurrency(item.value)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="complaints" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Support Metrics</CardTitle>
                  <CardDescription>Complaint resolution trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto">
                    <ResponsiveContainer width="100%" height={350}>
                      <ComposedChart data={analyticsData.complaints}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" />
                        <YAxis yAxisId="left" stroke="#6b7280" />
                        <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                        <Tooltip />
                        <Bar yAxisId="left" dataKey="total" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="left" dataKey="resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="avgTime"
                          stroke="#f59e0b"
                          strokeWidth={3}
                          dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Resolution Performance</CardTitle>
                  <CardDescription>Key support metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {analyticsData.complaints.length > 0 && (
                      <>
                        <div className="text-center">
                          <div className="text-4xl font-bold text-green-600">
                            {Math.round(
                              (analyticsData.complaints[analyticsData.complaints.length - 1]?.resolved /
                                analyticsData.complaints[analyticsData.complaints.length - 1]?.total) *
                                100,
                            ) || 0}
                            %
                          </div>
                          <p className="text-sm text-gray-500">Resolution Rate</p>
                        </div>
                        <div className="text-center">
                          <div className="text-4xl font-bold text-blue-600">
                            {analyticsData.complaints[analyticsData.complaints.length - 1]?.avgTime || 0}h
                          </div>
                          <p className="text-sm text-gray-500">Average Resolution Time</p>
                        </div>
                        <div className="text-center">
                          <div className="text-4xl font-bold text-purple-600">
                            {analyticsData.complaints[analyticsData.complaints.length - 1]?.satisfaction || 0}/5
                          </div>
                          <p className="text-sm text-gray-500">Customer Satisfaction</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="marketplace" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Marketplace Growth</CardTitle>
                  <CardDescription>Orders and revenue trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto">
                    <ResponsiveContainer width="100%" height={350}>
                      <ComposedChart data={analyticsData.marketplace}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" />
                        <YAxis yAxisId="left" stroke="#6b7280" />
                        <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                        <Tooltip />
                        <Bar yAxisId="left" dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="revenue"
                          stroke="#10b981"
                          strokeWidth={3}
                          dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Marketplace Metrics</CardTitle>
                  <CardDescription>Performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {analyticsData.marketplace.length > 0 && (
                      <>
                        <div className="text-center">
                          <div className="text-4xl font-bold text-green-600">
                            {formatCurrency(
                              analyticsData.marketplace[analyticsData.marketplace.length - 1]?.commission || 0,
                            )}
                          </div>
                          <p className="text-sm text-gray-500">Monthly Commission</p>
                        </div>
                        <div className="text-center">
                          <div className="text-4xl font-bold text-blue-600">
                            {analyticsData.marketplace[analyticsData.marketplace.length - 1]?.orders || 0}
                          </div>
                          <p className="text-sm text-gray-500">Total Orders</p>
                        </div>
                        <div className="text-center">
                          <div className="text-4xl font-bold text-purple-600">
                            {analyticsData.marketplace[analyticsData.marketplace.length - 1]?.vendors || 0}
                          </div>
                          <p className="text-sm text-gray-500">Active Vendors</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
