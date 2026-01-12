"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  RefreshCw,
  TrendingUp,
  Users,
  DollarSign,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  UserCheck,
  Package,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from "lucide-react"
import { analyticsApi, type AdminMetrics, type AdminCharts } from "@/lib/analytics-api"
import { toast } from "sonner"

const CHART_COLORS = {
  primary: "#6366f1",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
}

const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-2 rounded shadow-lg border">
        <p className="text-xs font-medium mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-1 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

const StatCard = ({ title, value, change, trend, icon: Icon, color }: any) => (
  <Card className="border">
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 mb-1 truncate">{title}</p>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{value}</h3>
          {change && (
            <div className="flex items-center gap-1">
              {trend === "up" ? <ArrowUpRight className="w-3 h-3 text-green-600" /> : <ArrowDownRight className="w-3 h-3 text-red-600" />}
              <span className={`text-xs font-medium ${trend === "up" ? "text-green-600" : "text-red-600"}`}>{change}</span>
            </div>
          )}
        </div>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
)

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("30d")
  const [activeTab, setActiveTab] = useState("overview")
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [charts, setCharts] = useState<AdminCharts | null>(null)

  useEffect(() => {
    loadAnalytics()
  }, [period])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const response = await analyticsApi.getAdminAnalytics(period)
      if (response.success && response.data) {
        setMetrics(response.data.metrics)
        setCharts(response.data.charts)
      }
    } catch (error) {
      toast.error("Failed to load analytics")
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

  const safe = {
    system: {
      totalUsers: metrics?.system?.totalUsers ?? 0,
      userGrowth: metrics?.system?.userGrowth ?? 0,
      activeRoles: {
        operators: metrics?.system?.activeRoles?.operators ?? 0,
        technicians: metrics?.system?.activeRoles?.technicians ?? 0,
        staff: metrics?.system?.activeRoles?.staff ?? 0,
        vendors: metrics?.system?.activeRoles?.vendors ?? 0,
        customers: metrics?.system?.activeRoles?.customers ?? 0,
      }
    },
    revenue: {
      totalRevenue: metrics?.revenue?.totalRevenue ?? 0,
      revenueGrowth: metrics?.revenue?.revenueGrowth ?? 0,
      revenueByPlan: metrics?.revenue?.revenueByPlan ?? [],
      revenueByOperator: metrics?.revenue?.revenueByOperator ?? [],
    },
    customers: {
      activeCustomers: metrics?.customers?.activeCustomers ?? 0,
      churnRate: metrics?.customers?.churnRate ?? "0",
    },
    orders: {
      totalOrders: metrics?.orders?.totalOrders ?? 0,
      completedOrders: metrics?.orders?.completedOrders ?? 0,
      pendingOrders: metrics?.orders?.pendingOrders ?? 0,
      cancelledOrders: metrics?.orders?.cancelledOrders ?? 0,
      orderFulfillmentRate: metrics?.orders?.orderFulfillmentRate ?? "0",
    },
    complaints: {
      totalComplaints: metrics?.complaints?.totalComplaints ?? 0,
      resolvedComplaints: metrics?.complaints?.resolvedComplaints ?? 0,
      openComplaints: metrics?.complaints?.openComplaints ?? 0,
      resolutionRate: metrics?.complaints?.resolutionRate ?? "0",
    },
    operational: {
      equipmentHealth: {
        totalEquipment: metrics?.operational?.equipmentHealth?.totalEquipment ?? 0,
        activeEquipment: metrics?.operational?.equipmentHealth?.activeEquipment ?? 0,
        faultyEquipment: metrics?.operational?.equipmentHealth?.faultyEquipment ?? 0,
        equipmentUtilization: metrics?.operational?.equipmentHealth?.equipmentUtilization ?? "0",
      }
    }
  }

  return (
    <DashboardLayout title="Analytics" description="Business intelligence and performance metrics">
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadAnalytics} variant="outline" size="sm" className="h-8 text-xs">
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Users"
                value={safe.system.totalUsers.toLocaleString()}
                change={`${safe.system.userGrowth}%`}
                trend="up"
                icon={Users}
                color="bg-blue-500"
              />
              <StatCard
                title="Revenue"
                value={formatCurrency(safe.revenue.totalRevenue)}
                change={`${safe.revenue.revenueGrowth}%`}
                trend="up"
                icon={DollarSign}
                color="bg-green-500"
              />
              <StatCard
                title="Customers"
                value={safe.customers.activeCustomers.toLocaleString()}
                change={safe.customers.churnRate}
                trend="down"
                icon={UserCheck}
                color="bg-purple-500"
              />
              <StatCard
                title="Orders"
                value={safe.orders.totalOrders.toLocaleString()}
                change={safe.orders.orderFulfillmentRate}
                trend="up"
                icon={ShoppingCart}
                color="bg-orange-500"
              />
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="h-8">
                <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                <TabsTrigger value="revenue" className="text-xs">Revenue</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Revenue Chart */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        Revenue Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={charts?.revenueTimeline ?? []}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="date" style={{ fontSize: "10px" }} />
                          <YAxis style={{ fontSize: "10px" }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="value" stroke="#10b981" fill="url(#colorRevenue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Customer Chart */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        Customer Growth
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={charts?.customerGrowth ?? []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="date" style={{ fontSize: "10px" }} />
                          <YAxis style={{ fontSize: "10px" }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Pie Chart */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Activity className="w-4 h-4 text-purple-600" />
                        Employee Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Operators", value: safe.system.activeRoles.operators },
                              { name: "Technicians", value: safe.system.activeRoles.technicians },
                              { name: "Staff", value: safe.system.activeRoles.staff },
                              { name: "Vendors", value: safe.system.activeRoles.vendors },
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                            style={{ fontSize: "10px" }}
                          >
                            {PIE_COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Top Operators */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Top Operators</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2 space-y-2">
                      {safe.revenue.revenueByOperator.slice(0, 4).map((op, i) => (
                        <div key={i} className="flex justify-between items-center text-xs p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <span className="font-medium truncate">{op.operatorName}</span>
                          <span className="font-semibold ml-2">{formatCurrency(op.revenue)}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-medium flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Orders
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Completed</span>
                        <span className="font-semibold text-green-600">{safe.orders.completedOrders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pending</span>
                        <span className="font-semibold text-yellow-600">{safe.orders.pendingOrders}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-orange-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Complaints
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Resolved</span>
                        <span className="font-semibold text-green-600">{safe.complaints.resolvedComplaints}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Open</span>
                        <span className="font-semibold text-orange-600">{safe.complaints.openComplaints}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-medium flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        Equipment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active</span>
                        <span className="font-semibold text-green-600">{safe.operational.equipmentHealth.activeEquipment}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Faulty</span>
                        <span className="font-semibold text-red-600">{safe.operational.equipmentHealth.faultyEquipment}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="revenue" className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Revenue by Plan</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={safe.revenue.revenueByPlan}
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            dataKey="revenue"
                            label={(e: any) => `${e.planName}`}
                            style={{ fontSize: "10px" }}
                          >
                            {PIE_COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Operator Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={safe.revenue.revenueByOperator}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="operatorName" style={{ fontSize: "10px" }} />
                          <YAxis style={{ fontSize: "10px" }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}