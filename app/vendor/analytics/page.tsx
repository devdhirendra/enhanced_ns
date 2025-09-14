"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface AnalyticsData {
  totalRevenue: number
  monthlyRevenue: number
  revenueGrowth: number
  totalOrders: number
  orderGrowth: number
  averageOrderValue: number
  topProducts: Array<{
    name: string
    category: string
    revenue: number
    orders: number
    growth: number
  }>
  salesByCategory: Array<{
    category: string
    revenue: number
    percentage: number
  }>
  monthlyTrends: Array<{
    month: string
    revenue: number
    orders: number
  }>
}

const analyticsData: AnalyticsData = {
  totalRevenue: 2450000,
  monthlyRevenue: 185000,
  revenueGrowth: 15.3,
  totalOrders: 89,
  orderGrowth: 12.5,
  averageOrderValue: 27528,
  topProducts: [
    { name: "TP-Link AC1200 Router", category: "Routers", revenue: 135000, orders: 45, growth: 18.2 },
    { name: "Fiber Optic Cable 2km", category: "Cables", revenue: 96000, orders: 32, growth: 12.8 },
    { name: "GPON ONU Device", category: "ONUs", revenue: 84000, orders: 28, growth: 25.4 },
    { name: "24-Port POE Switch", category: "Switches", revenue: 108000, orders: 18, growth: -5.2 },
    { name: "Fiber Splicing Kit", category: "Tools", revenue: 75000, orders: 15, growth: 8.9 },
  ],
  salesByCategory: [
    { category: "Routers", revenue: 450000, percentage: 35 },
    { category: "Cables", revenue: 380000, percentage: 28 },
    { category: "ONUs", revenue: 320000, percentage: 22 },
    { category: "Switches", revenue: 200000, percentage: 10 },
    { category: "Tools", revenue: 100000, percentage: 5 },
  ],
  monthlyTrends: [
    { month: "Jan", revenue: 165000, orders: 68 },
    { month: "Feb", revenue: 178000, orders: 72 },
    { month: "Mar", revenue: 185000, orders: 89 },
    { month: "Apr", revenue: 192000, orders: 95 },
    { month: "May", revenue: 205000, orders: 102 },
    { month: "Jun", revenue: 218000, orders: 108 },
  ],
}

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [selectedMetric, setSelectedMetric] = useState("revenue")

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? "text-green-600" : "text-red-600"
  }

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />
  }

  return (
        <DashboardLayout title="Vendor Dashboard" description="Overview of your network operations">

    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Analytics</h1>
          <p className="text-gray-600">Track your business performance and insights</p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Revenue</CardTitle>
            <div className="p-2 bg-blue-500 rounded-lg">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{formatCurrency(analyticsData.totalRevenue)}</div>
            <div className="flex items-center mt-2">
              <div className={`flex items-center ${getGrowthColor(analyticsData.revenueGrowth)}`}>
                {getGrowthIcon(analyticsData.revenueGrowth)}
                <span className="text-sm font-medium ml-1">+{analyticsData.revenueGrowth}%</span>
              </div>
              <span className="text-sm text-gray-500 ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Orders</CardTitle>
            <div className="p-2 bg-green-500 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{analyticsData.totalOrders}</div>
            <div className="flex items-center mt-2">
              <div className={`flex items-center ${getGrowthColor(analyticsData.orderGrowth)}`}>
                {getGrowthIcon(analyticsData.orderGrowth)}
                <span className="text-sm font-medium ml-1">+{analyticsData.orderGrowth}%</span>
              </div>
              <span className="text-sm text-gray-500 ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Avg Order Value</CardTitle>
            <div className="p-2 bg-purple-500 rounded-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{formatCurrency(analyticsData.averageOrderValue)}</div>
            <div className="flex items-center mt-2">
              <div className="flex items-center text-green-600">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-sm font-medium ml-1">+8.2%</span>
              </div>
              <span className="text-sm text-gray-500 ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Monthly Revenue</CardTitle>
            <div className="p-2 bg-orange-500 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{formatCurrency(analyticsData.monthlyRevenue)}</div>
            <div className="flex items-center mt-2">
              <div className="flex items-center text-green-600">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-sm font-medium ml-1">+15.3%</span>
              </div>
              <span className="text-sm text-gray-500 ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
            Monthly Trends
          </CardTitle>
          <CardDescription>Revenue and order trends over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="revenue" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="revenue">Revenue Trend</TabsTrigger>
              <TabsTrigger value="orders">Order Trend</TabsTrigger>
            </TabsList>
            <TabsContent value="revenue" className="space-y-4">
              <div className="grid grid-cols-6 gap-4">
                {analyticsData.monthlyTrends.map((trend) => (
                  <div key={trend.month} className="text-center">
                    <div className="bg-blue-100 rounded-lg p-4 mb-2">
                      <div className="text-lg font-bold text-blue-600">{formatCurrency(trend.revenue / 1000)}K</div>
                    </div>
                    <div className="text-sm text-gray-600">{trend.month}</div>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="orders" className="space-y-4">
              <div className="grid grid-cols-6 gap-4">
                {analyticsData.monthlyTrends.map((trend) => (
                  <div key={trend.month} className="text-center">
                    <div className="bg-green-100 rounded-lg p-4 mb-2">
                      <div className="text-lg font-bold text-green-600">{trend.orders}</div>
                    </div>
                    <div className="text-sm text-gray-600">{trend.month}</div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Key performance indicators for your business</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Order Fulfillment Rate</span>
                  <span className="text-sm text-gray-600">94%</span>
                </div>
                <Progress value={94} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Customer Satisfaction</span>
                  <span className="text-sm text-gray-600">96%</span>
                </div>
                <Progress value={96} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">On-time Delivery</span>
                  <span className="text-sm text-gray-600">89%</span>
                </div>
                <Progress value={89} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Return Rate</span>
                  <span className="text-sm text-gray-600">3%</span>
                </div>
                <Progress value={3} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Insights</CardTitle>
            <CardDescription>Detailed revenue analysis and projections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Projected Monthly Revenue</p>
                    <p className="text-2xl font-bold text-blue-700">{formatCurrency(210000)}</p>
                  </div>
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Best Performing Category</p>
                    <p className="text-lg font-bold text-green-700">Routers</p>
                    <p className="text-sm text-green-600">{formatCurrency(450000)} revenue</p>
                  </div>
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Growth Opportunity</p>
                    <p className="text-lg font-bold text-purple-700">ONUs Category</p>
                    <p className="text-sm text-purple-600">+25.4% growth potential</p>
                  </div>
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </DashboardLayout>
  )
}
