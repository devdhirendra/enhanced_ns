"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { Briefcase, Star, DollarSign, RefreshCw, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { analyticsApi, type TechnicianMetrics } from "@/lib/analytics-api"
import { toast } from "sonner"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

const StatCard = ({ title, value, change, trend, icon: Icon, color }: any) => (
  <Card className="relative overflow-hidden hover:shadow-lg transition-all">
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

export default function TechnicianAnalyticsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("30d")
  const [metrics, setMetrics] = useState<TechnicianMetrics | null>(null)

  useEffect(() => {
    loadAnalytics()
  }, [period])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      if (!user?.user_id) return
      const response = await analyticsApi.getTechnicianAnalytics(user.user_id, period)
      if (response.success && response.data) {
        setMetrics(response.data.metrics)
      }
    } catch (error) {
      console.error("Failed to load analytics:", error)
      toast.error("Failed to load analytics data")
    } finally {
      setLoading(false)
    }
  }

  if (loading || !metrics) {
    return (
      <DashboardLayout title="Analytics" description="Your performance metrics" loading={true}>
        <div />
      </DashboardLayout>
    )
  }

  const jobTypeData = [
    { name: "Installation", value: metrics.jobs.jobsByType.installation },
    { name: "Maintenance", value: metrics.jobs.jobsByType.maintenance },
    { name: "Troubleshooting", value: metrics.jobs.jobsByType.troubleshooting },
    { name: "Support", value: metrics.jobs.jobsByType.support },
  ]

  const ratingData = [
    { name: "5 Star", value: metrics.performance.ratingDistribution.five_star || 0 },
    { name: "4 Star", value: metrics.performance.ratingDistribution.four_star || 0 },
    { name: "3 Star", value: metrics.performance.ratingDistribution.three_star || 0 },
    { name: "2 Star", value: metrics.performance.ratingDistribution.two_star || 0 },
    { name: "1 Star", value: metrics.performance.ratingDistribution.one_star || 0 },
  ]

  return (
    <DashboardLayout title="Analytics" description="Your performance and job metrics" loading={false}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-2xl text-white shadow-lg">
          <div>
            <h1 className="text-3xl font-bold mb-1">Technician Dashboard</h1>
            <p className="text-purple-100">Track your performance and earnings</p>
          </div>
          <div className="flex gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadAnalytics} className="bg-white/10 hover:bg-white/20">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Completed Jobs"
            value={metrics.jobs.completedJobs}
            change={metrics.jobs.jobCompletionRate}
            trend="up"
            icon={Briefcase}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatCard
            title="Performance Score"
            value={metrics.performance.performanceScore}
            change="Excellent"
            trend="up"
            icon={Star}
            color="bg-gradient-to-br from-green-500 to-emerald-600"
          />
          <StatCard
            title="Collections"
            value={`₹${(metrics.collections.totalCollected / 1000).toFixed(1)}K`}
            change={metrics.collections.collectionRate}
            trend="up"
            icon={DollarSign}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          <StatCard
            title="Attendance"
            value={metrics.attendance.attendanceRate}
            change={`${metrics.attendance.presentDays} days`}
            trend="up"
            icon={TrendingUp}
            color="bg-gradient-to-br from-orange-500 to-orange-600"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Jobs by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={jobTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Rating Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ratingData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {ratingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-lg border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="text-base">Job Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Jobs</span>
                <span className="font-bold">{metrics.jobs.totalJobs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="font-bold text-yellow-600">{metrics.jobs.pendingJobs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Time</span>
                <span className="font-bold">{metrics.jobs.averageJobTime}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Rating</span>
                <span className="font-bold text-yellow-600">{metrics.jobs.averageJobRating}/5</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="text-base">Collections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Collected</span>
                <span className="font-bold">₹{metrics.collections.totalCollected.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg/Job</span>
                <span className="font-bold">₹{metrics.collections.averageCollectionPerJob}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="font-bold text-green-600">{metrics.collections.collectionRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Failed</span>
                <span className="font-bold text-red-600">{metrics.collections.failedCollections}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle className="text-base">Attendance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Working Days</span>
                <span className="font-bold">{metrics.attendance.totalWorkingDays}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Present</span>
                <span className="font-bold text-green-600">{metrics.attendance.presentDays}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Absent</span>
                <span className="font-bold text-red-600">{metrics.attendance.absentDays}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Hours</span>
                <span className="font-bold">{metrics.attendance.averageWorkingHours}h</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}