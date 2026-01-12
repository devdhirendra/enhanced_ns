// vendor/analytics/page.tsx

"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, Package, ShoppingCart, Star, RefreshCw } from "lucide-react"
import { analyticsApi, type VendorMetrics } from "@/lib/analytics-api"
import { toast } from "sonner"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("30d")
  const [metrics, setMetrics] = useState<VendorMetrics | null>(null)

  useEffect(() => {
    loadAnalytics()
  }, [period])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      if (!user?.user_id) return
      const response = await analyticsApi.getVendorAnalytics(user.user_id, period)
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

  const formatCurrency = (value: number) => {
    return `₹${(value / 100000).toFixed(1)}L`
  }

  const mockOrderTimeline = [
    { date: "2026-01-05", orders: 5, revenue: 15000 },
    { date: "2026-01-06", orders: 7, revenue: 21000 },
    { date: "2026-01-07", orders: 4, revenue: 12000 },
    { date: "2026-01-08", orders: 6, revenue: 18000 },
    { date: "2026-01-09", orders: 8, revenue: 24000 },
    { date: "2026-01-10", orders: 9, revenue: 27000 },
  ]

  const mockProductPerformance = [
    { name: "Product 1", sold: 100, rating: 4.8 },
    { name: "Product 2", sold: 95, rating: 4.6 },
    { name: "Product 3", sold: 88, rating: 4.5 },
  ]

  return (
    <DashboardLayout title="Vendor Analytics" description="Your sales performance and metrics" loading={loading}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sales Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track your business performance and insights</p>
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
                  <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-50">
                    {formatCurrency(metrics.revenue.totalRevenue)}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-xs text-green-600 font-medium">{metrics.revenue.revenueGrowth}% growth</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Total Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-50">{metrics.orders.totalOrders}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    {metrics.orders.completedOrders} completed
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Avg Order Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-50">
                    {formatCurrency(metrics.orders.averageOrderValue)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Per transaction</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
                    Vendor Rating
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-50">
                    {metrics.ratings.vendorRating}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    {metrics.ratings.totalReviews} reviews
                  </p>
                </CardContent>
              </Card>
            </div>
          )
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Order Timeline Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
              <CardDescription>Daily orders and revenue over time</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockOrderTimeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} name="Orders" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Revenue by Product */}
          <Card>
            <CardHeader>
              <CardTitle>Top Products by Revenue</CardTitle>
              <CardDescription>Best performing products</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockProductPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sold" fill="#10b981" name="Units Sold" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Business Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Order Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Fulfillment Rate</span>
                  <span className="font-semibold">{metrics.orders.orderFulfillmentRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Pending Orders</span>
                  <span className="font-semibold text-yellow-600">{metrics.orders.pendingOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Cancelled Orders</span>
                  <span className="font-semibold text-red-600">{metrics.orders.cancelledOrders}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Inventory Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Products</span>
                  <span className="font-semibold">{metrics.inventory.totalProducts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Out of Stock</span>
                  <span className="font-semibold text-red-600">{metrics.inventory.outOfStockProducts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Low Stock</span>
                  <span className="font-semibold text-yellow-600">{metrics.inventory.lowStockProducts}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Shipping Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">On-Time Delivery</span>
                  <span className="font-semibold text-green-600">{metrics.shipping.onTimeDeliveryRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Avg Delivery Time</span>
                  <span className="font-semibold">{metrics.shipping.averageDeliveryTime} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Return Rate</span>
                  <span className="font-semibold text-orange-600">{metrics.shipping.returnRate}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Financial Summary */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Gross Profit</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(metrics.revenue.grossProfit)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Net Profit</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(metrics.revenue.netProfit)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Profit Margin</p>
                  <p className="text-2xl font-bold">{metrics.revenue.profitMargin}%</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Repeat Customers</p>
                  <p className="text-2xl font-bold">{metrics.customers.repeatCustomers}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Repeat Purchase Rate</p>
                  <p className="text-2xl font-bold text-blue-600">{metrics.customers.repeatPurchaseRate}%</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Retention Rate</p>
                  <p className="text-2xl font-bold text-green-600">{metrics.customers.customerRetentionRate}%</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
