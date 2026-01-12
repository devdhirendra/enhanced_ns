//customer/analytics/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw } from "lucide-react"
import { analyticsApi, type CustomerMetrics } from "@/lib/analytics-api"
import { toast } from "sonner"
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from "recharts"
import { Badge } from "@/components/ui/badge"

export default function CustomerAnalyticsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("30d")
  const [metrics, setMetrics] = useState<CustomerMetrics | null>(null)

  useEffect(() => {
    loadAnalytics()
  }, [period])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      if (!user?.user_id) return
      const response = await analyticsApi.getCustomerAnalytics(user.user_id, period)
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

  return (
    <DashboardLayout title="My Analytics" description="Your service usage and billing insights" loading={loading}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Service Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Your service usage and billing overview</p>
          </div>
          <div className="flex gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadAnalytics} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-gray-200 p-6 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
            ))}
          </div>
        ) : (
          metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Monthly Bill */}
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Monthly Bill</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-50">
                    ₹{metrics?.payments?.monthlyBillAmount || 0}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    Next: {metrics?.payments?.nextBillingDate || "N/A"}
                  </p>
                </CardContent>
              </Card>

              {/* Data Usage */}
              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Data Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-50">
                    {metrics?.usage?.usagePercentage || 0}%
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    {metrics?.usage?.totalDataUsed || 0}GB / {metrics?.usage?.dataLimit || 0}GB
                  </p>
                </CardContent>
              </Card>

              {/* Current Plan */}
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Current Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-50">
                    {metrics?.service?.currentPlan || "N/A"}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    Since {metrics?.service?.planSince || "N/A"}
                  </p>
                </CardContent>
              </Card>

              {/* Support Tickets */}
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
                    Support Tickets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-50">
                    {metrics?.support?.openTickets || 0}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    {metrics?.support?.totalTickets || 0} total tickets
                  </p>
                </CardContent>
              </Card>
            </div>
          )
        )}

        {/* Charts & Details */}
        {!loading && metrics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Data Usage Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Data Usage Trend</CardTitle>
                <CardDescription>4-week usage pattern</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metrics?.usage?.usageTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="used" stroke="#10b981" name="Data Used (GB)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Payment Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Payment History</CardTitle>
                <CardDescription>Recent transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(metrics?.payments?.paymentHistory || []).map((payment, index) => (
                    <div key={index} className="flex justify-between items-center pb-3 border-b last:border-b-0">
                      <div>
                        <p className="font-medium text-sm">{payment.date}</p>
                        <Badge variant={payment.status === "Paid" ? "default" : "secondary"} className="text-xs mt-1">
                          {payment.status}
                        </Badge>
                      </div>
                      <p className="font-bold text-green-600">₹{payment.amount}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Speed Test Results */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Speed Test Results</CardTitle>
                <CardDescription>Last speed test results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Download</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {metrics?.service?.speedTestResults?.download || 0}
                    </p>
                    <p className="text-xs text-gray-500">Mbps</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Upload</p>
                    <p className="text-2xl font-bold text-green-600">
                      {metrics?.service?.speedTestResults?.upload || 0}
                    </p>
                    <p className="text-xs text-gray-500">Mbps</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Ping</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {metrics?.service?.speedTestResults?.ping || 0}
                    </p>
                    <p className="text-xs text-gray-500">ms</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Tickets */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Support Summary</CardTitle>
                <CardDescription>Your support tickets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm text-gray-600">Total Tickets</span>
                  <span className="font-bold text-lg">{metrics?.support?.totalTickets || 0}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm text-gray-600">Open Tickets</span>
                  <span className="font-bold text-orange-600">{metrics?.support?.openTickets || 0}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm text-gray-600">Resolved</span>
                  <span className="font-bold text-green-600">{metrics?.support?.resolvedTickets || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Satisfaction</span>
                  <span className="font-bold text-yellow-600">{metrics?.support?.satisfactionRating || 0}/5.0</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
