"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  TrendingUp,
  Users,
  Wifi,
  Zap,
  RefreshCw,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  AlertCircle,
  CheckCircle,
  DollarSign,
} from "lucide-react"
import { analyticsApi, type OperatorMetrics } from "@/lib/analytics-api"
import { toast } from "sonner"

const CHART_COLORS = {
  primary: "#6366f1",
  secondary: "#8b5cf6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
}

const StatCard = ({ title, value, change, trend, icon: Icon, color, subtitle }: any) => {
  return (
    <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{value}</h3>
            {change && (
              <div className="flex items-center gap-1">
                {trend === "up" ? (
                  <div className="flex items-center text-green-600">
                    <ArrowUpRight className="w-4 h-4" />
                    <span className="text-sm font-semibold">{change}</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <ArrowDownRight className="w-4 h-4" />
                    <span className="text-sm font-semibold">{change}</span>
                  </div>
                )}
                {subtitle && <span className="text-xs text-gray-500 ml-1">{subtitle}</span>}
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function OperatorAnalyticsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("30d")
  const [metrics, setMetrics] = useState<OperatorMetrics | null>(null)
  const [charts, setCharts] = useState<any>(null)

  useEffect(() => {
    loadAnalytics()
  }, [period])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      if (!user?.user_id) return
      const response = await analyticsApi.getOperatorAnalytics(user.user_id, period)
      if (response.success && response.data) {
        setMetrics(response.data.metrics)
        setCharts(response.data.charts)
      }
    } catch (error) {
      console.error("Failed to load analytics:", error)
      toast.error("Failed to load analytics data")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`
    return `₹${value}`
  }

  if (loading) {
    return (
      <DashboardLayout title="Analytics" description="Your business performance metrics" loading={true}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Analytics" description="Your business performance and network metrics" loading={false}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-600 to-cyan-600 p-6 rounded-2xl text-white shadow-lg">
          <div>
            <h1 className="text-3xl font-bold mb-1">Operator Dashboard</h1>
            <p className="text-blue-100">Monitor your network and business performance</p>
          </div>
          <div className="flex gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white backdrop-blur-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={loadAnalytics}
              className="bg-white/10 border-white/20 text-white backdrop-blur-sm hover:bg-white/20"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {metrics && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Monthly Revenue"
                value={formatCurrency(metrics.revenue.monthlyRevenue)}
                change={`${metrics.revenue.revenueGrowth}%`}
                trend="up"
                subtitle="Growth"
                icon={DollarSign}
                color="bg-gradient-to-br from-green-500 to-emerald-600"
              />
              <StatCard
                title="Active Customers"
                value={metrics.customers.activeCustomers.toLocaleString()}
                change={metrics.customers.churnRate}
                trend="down"
                subtitle="Churn rate"
                icon={Users}
                color="bg-gradient-to-br from-blue-500 to-blue-600"
              />
              <StatCard
                title="Service Quality"
                value={`${metrics.customers.customerSatisfactionScore}/5.0`}
                change="Excellent"
                trend="up"
                icon={CheckCircle}
                color="bg-gradient-to-br from-purple-500 to-purple-600"
              />
              <StatCard
                title="Equipment Health"
                value={metrics.equipment.failureRate}
                change="Failure Rate"
                trend="down"
                icon={Zap}
                color="bg-gradient-to-br from-orange-500 to-orange-600"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Growth */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Revenue Trend
                  </CardTitle>
                  <CardDescription>Monthly revenue performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={charts?.revenueGrowth || []}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Customer Trend */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Customer Growth
                  </CardTitle>
                  <CardDescription>Active customer trend</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={charts?.customerTrend || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Task Progress */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-600" />
                    Task Performance
                  </CardTitle>
                  <CardDescription>Task completion status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { name: "Installation", value: metrics.tasks.tasksByType.installation },
                      { name: "Maintenance", value: metrics.tasks.tasksByType.maintenance },
                      { name: "Support", value: metrics.tasks.tasksByType.support },
                      { name: "Complaint", value: metrics.tasks.tasksByType.complaint },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Complaints */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    Support Tickets
                  </CardTitle>
                  <CardDescription>Complaint resolution metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm font-medium">Total Complaints</span>
                      <span className="text-2xl font-bold">{metrics.complaints.totalComplaints}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">Resolved</span>
                      <span className="text-2xl font-bold text-green-700 dark:text-green-400">
                        {metrics.complaints.resolvedComplaints}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <span className="text-sm font-medium text-orange-700 dark:text-orange-400">Open</span>
                      <span className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                        {metrics.complaints.openComplaints}
                      </span>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Resolution Rate</span>
                        <span className="text-sm font-bold text-green-600">{metrics.complaints.resolutionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${metrics.complaints.resolutionRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-lg border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="text-base">Customer Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Customers</span>
                    <span className="font-bold">{metrics.customers.totalCustomers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">New This Month</span>
                    <span className="font-bold text-green-600">{metrics.customers.newCustomersThisMonth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">At Risk</span>
                    <span className="font-bold text-orange-600">{metrics.customers.customersAtRisk}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Satisfaction</span>
                    <span className="font-bold text-blue-600">{metrics.customers.customerSatisfactionScore}/5.0</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="text-base">Service Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Installations</span>
                    <span className="font-bold">{metrics.service.completedInstallations}/{metrics.service.totalInstallations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Success Rate</span>
                    <span className="font-bold text-green-600">{metrics.service.installationSuccessRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Time</span>
                    <span className="font-bold">{metrics.service.averageInstallationTime}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Upgrades</span>
                    <span className="font-bold text-blue-600">{metrics.service.totalUpgrades}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-l-4 border-l-purple-500">
                <CardHeader>
                  <CardTitle className="text-base">Equipment Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Equipment</span>
                    <span className="font-bold">{metrics.equipment.totalEquipment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Active</span>
                    <span className="font-bold text-green-600">{metrics.equipment.activeEquipment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Faulty</span>
                    <span className="font-bold text-red-600">{metrics.equipment.faultyEquipment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Maintenance Due</span>
                    <span className="font-bold text-yellow-600">{metrics.equipment.maintenanceRequired}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}