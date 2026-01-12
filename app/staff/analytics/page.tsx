//staff/analytics/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Phone, Target, CheckCircle, RefreshCw } from "lucide-react"
import { analyticsApi, type StaffMetrics } from "@/lib/analytics-api"
import { toast } from "sonner"

export default function StaffAnalyticsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("30d")
  const [metrics, setMetrics] = useState<StaffMetrics | null>(null)

  useEffect(() => {
    loadAnalytics()
  }, [period])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      if (!user?.user_id) return
      const response = await analyticsApi.getStaffAnalytics(user.user_id, period)
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
    <DashboardLayout title="Staff Analytics" description="Your performance metrics and targets" loading={loading}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Performance Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Your sales and performance metrics</p>
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
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Conversion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-50">{metrics.leads.conversionRate}%</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    {metrics.leads.convertedLeads} of {metrics.leads.totalLeads} leads
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                    Performance Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-50">
                    {metrics.performance.performanceScore}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    Target: {metrics.performance.targetAchievement}%
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Incentives Earned
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-50">
                    ₹{(metrics.performance.incentivesEarned / 1000).toFixed(1)}K
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    {metrics.performance.bonusEligible ? "Bonus eligible" : "Not eligible"}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-50">
                    {metrics.attendance.attendanceRate}%
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    {metrics.attendance.presentDays} days present
                  </p>
                </CardContent>
              </Card>
            </div>
          )
        )}

        {/* Activity Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Lead Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Leads</span>
                  <span className="font-semibold">{metrics.leads.totalLeads}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">This Month</span>
                  <span className="font-semibold">{metrics.leads.leadsThisMonth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Converted</span>
                  <span className="font-semibold text-green-600">{metrics.leads.convertedLeads}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Avg Lead Value</span>
                  <span className="font-semibold">₹{metrics.leads.avgLeadValue}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Call Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Calls</span>
                  <span className="font-semibold">{metrics.calls.totalCalls}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Incoming</span>
                  <span className="font-semibold">{metrics.calls.incomingCalls}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Outgoing</span>
                  <span className="font-semibold">{metrics.calls.outgoingCalls}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Answer Rate</span>
                  <span className="font-semibold text-green-600">{metrics.calls.callAnswerRate}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Ticket Resolution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Tickets</span>
                  <span className="font-semibold">{metrics.tickets.totalTickets}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Resolved</span>
                  <span className="font-semibold text-green-600">{metrics.tickets.resolvedTickets}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Resolution Rate</span>
                  <span className="font-semibold">{metrics.tickets.ticketResolutionRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Avg Resolution Time</span>
                  <span className="font-semibold">{metrics.tickets.averageResolutionTime}h</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Onboarding and Follow-ups */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Onboarding Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Onboardings</p>
                  <p className="text-2xl font-bold">{metrics.onboarding.totalOnboardings}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
                  <p className="text-2xl font-bold text-green-600">{metrics.onboarding.onboardingSuccessRate}%</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Customer Satisfaction</p>
                  <p className="text-2xl font-bold">{metrics.onboarding.customerSatisfactionScore}/5</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Follow-Up Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Follow-Ups</p>
                  <p className="text-2xl font-bold">{metrics.follow_up.totalFollowUps}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completed Follow-Ups</p>
                  <p className="text-2xl font-bold text-green-600">{metrics.follow_up.completedFollowUps}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
                  <p className="text-2xl font-bold">{metrics.follow_up.followUpCompletionRate}%</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
