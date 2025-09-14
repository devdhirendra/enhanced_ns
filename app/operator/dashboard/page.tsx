"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Wifi,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ActivityIcon,
  Router,
  Signal,
  UserPlus,
  Bell,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Eye,
  Edit,
  RefreshCw,
  ShoppingCart,
  Package,
  Star,
} from "lucide-react"
import { formatDate, formatCurrency, getStatusColor } from "@/lib/utils"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface DashboardStats {
  totalCustomers: number
  activeConnections: number
  monthlyRevenue: number
  networkUptime: number
  newCustomersThisMonth: number
  pendingInstallations: number
  supportTickets: number
  averageSpeed: number
}

interface Customer {
  customer_id: string
  name: string
  phone: string
  email: string
  plan: string
  status: string
  created_at: string
  address: string
  monthly_bill: number
}

interface NetworkEquipment {
  id: string
  name: string
  type: string
  status: string
  location: string
  connectedUsers: number
  capacity: number
  uptime: number
  lastUpdate: string
}

interface RecentActivity {
  id: number
  type: string
  description: string
  timestamp: string
  user: string
}

interface MarketplaceFilters {
  budgetRange: number[]
  urgencyLevel: number[]
  vendorRating: number[]
}

interface QuickMarketplaceItem {
  id: string
  name: string
  price: number
  vendor: string
  rating: number
  inStock: boolean
  urgency: "high" | "medium" | "low"
  category: string
}

// Demo data fallback
const demoDashboardStats: DashboardStats = {
  totalCustomers: 1247,
  activeConnections: 1198,
  monthlyRevenue: 2456780,
  networkUptime: 99.8,
  newCustomersThisMonth: 45,
  pendingInstallations: 12,
  supportTickets: 8,
  averageSpeed: 85.6,
}

export default function OperatorDashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("today")
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(demoDashboardStats)
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([])
  const [networkStatus, setNetworkStatus] = useState<NetworkEquipment[]>([])
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [marketplaceFilters, setMarketplaceFilters] = useState<MarketplaceFilters>({
    budgetRange: [0, 50000],
    urgencyLevel: [1, 5],
    vendorRating: [3, 5],
  })
  const { toast } = useToast()

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [customersResponse, complaintsResponse, inventoryResponse] = await Promise.allSettled([
        apiClient.getAllCustomers(),
        apiClient.getAllComplaints(),
        apiClient.getAllStockProducts(),
      ])

      if (customersResponse.status === "fulfilled") {
        const customers = customersResponse.value.slice(0, 4) // Get recent 4 customers
setRecentCustomers(
  customers.map((customer: any) => {
    // Handle address which might be an object
    let addressText = "N/A";
    const address = customer.profileDetail?.address || customer.address;
    
    if (typeof address === 'string') {
      addressText = address;
    } else if (address && typeof address === 'object') {
      // Convert address object to string
      addressText = `${address.area || ''}, ${address.district || ''}, ${address.state || ''}`.trim();
      if (addressText.endsWith(',')) {
        addressText = addressText.slice(0, -1);
      }
    }

    return {
      customer_id: customer.user_id || customer.customer_id,
      name: customer.profileDetail?.name || customer.name || "Unknown Customer",
      phone: customer.profileDetail?.phone || customer.phone || "N/A",
      email: customer.email || "N/A",
      plan: customer.profileDetail?.planId || customer.plan || "Basic Plan",
      status: customer.Permissions?.status || customer.status || "active",
      created_at: customer.createdAt || customer.created_at || new Date().toISOString(),
      address: addressText, // Use the processed address
      monthly_bill: customer.profileDetail?.monthlyRate || customer.monthly_bill || 1000,
    };
  }),
)

        const activeCustomers = customers.filter(
          (customer: any) => (customer.Permissions?.status || customer.status) === "active",
        ).length
        const totalRevenue = customers.reduce(
          (sum: number, customer: any) => sum + (customer.profileDetail?.monthlyRate || customer.monthly_bill || 1000),
          0,
        )

        setDashboardStats({
          totalCustomers: customers.length,
          activeConnections: activeCustomers,
          monthlyRevenue: totalRevenue,
          networkUptime: 99.8,
          newCustomersThisMonth: customers.filter((customer: any) => {
            const createdDate = new Date(customer.createdAt || customer.created_at)
            const now = new Date()
            return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear()
          }).length,
          pendingInstallations: customers.filter(
            (customer: any) => (customer.Permissions?.status || customer.status) === "pending",
          ).length,
          supportTickets: complaintsResponse.status === "fulfilled" ? complaintsResponse.value.length : 8,
          averageSpeed: 85.6,
        })
      }

      // Set demo network status and activities (these would come from real APIs in production)
      setNetworkStatus([
        {
          id: "OLT001",
          name: "OLT Sector 15",
          type: "OLT",
          status: "online",
          location: "Sector 15",
          connectedUsers: 156,
          capacity: 200,
          uptime: 99.9,
          lastUpdate: new Date().toISOString(),
        },
        {
          id: "OLT002",
          name: "OLT Sector 22",
          type: "OLT",
          status: "online",
          location: "Sector 22",
          connectedUsers: 89,
          capacity: 150,
          uptime: 98.5,
          lastUpdate: new Date().toISOString(),
        },
        {
          id: "SW001",
          name: "Core Switch",
          type: "Switch",
          status: "warning",
          location: "Data Center",
          connectedUsers: 0,
          capacity: 0,
          uptime: 95.2,
          lastUpdate: new Date().toISOString(),
        },
        {
          id: "RT001",
          name: "Main Router",
          type: "Router",
          status: "online",
          location: "Data Center",
          connectedUsers: 0,
          capacity: 0,
          uptime: 99.8,
          lastUpdate: new Date().toISOString(),
        },
      ])

      setRecentActivities([
        {
          id: 1,
          type: "customer_added",
          description: `New customer ${recentCustomers[0]?.name || "Customer"} added`,
          timestamp: new Date().toISOString(),
          user: "Operator",
        },
        {
          id: 2,
          type: "payment_received",
          description: `Payment received from ${recentCustomers[1]?.name || "Customer"} - ₹${recentCustomers[1]?.monthly_bill || 800}`,
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          user: "System",
        },
        {
          id: 3,
          type: "support_ticket",
          description: "Support ticket created for network issue",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          user: "Customer",
        },
        {
          id: 4,
          type: "installation_completed",
          description: `Installation completed for ${recentCustomers[2]?.name || "Customer"}`,
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          user: "Technician",
        },
      ])
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
      setError("Failed to load dashboard data. Using demo data.")
      toast({
        title: "Error Loading Dashboard",
        description: "Failed to load some data. Please check your connection.",
        variant: "destructive",
      })
      // Keep demo data as fallback
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const quickMarketplaceItems: QuickMarketplaceItem[] = [
    {
      id: "QUICK001",
      name: "Fiber Cable - 1KM",
      price: 1200,
      vendor: "Fiber Tech",
      rating: 4.8,
      inStock: true,
      urgency: "high",
      category: "OFC Cable",
    },
    {
      id: "QUICK002",
      name: "GPON ONU Device",
      price: 2800,
      vendor: "Network Pro",
      rating: 4.6,
      inStock: true,
      urgency: "medium",
      category: "ONUs",
    },
    {
      id: "QUICK003",
      name: "Patch Cord Bundle",
      price: 750,
      vendor: "Cable Connect",
      rating: 4.7,
      inStock: false,
      urgency: "low",
      category: "Patch Cords",
    },
  ]

  return (
    <DashboardLayout title="Operator Dashboard" description="Overview of your network operations">
      <div className="space-y-6">
        {error && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <span className="text-yellow-800">{error}</span>
                </div>
                <Button variant="outline" size="sm" onClick={fetchDashboardData} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Customers</CardTitle>
              <div className="p-2 bg-blue-500 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">
                {loading ? "..." : dashboardStats.totalCustomers.toLocaleString()}
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600 font-medium">+{dashboardStats.newCustomersThisMonth}</span>
                <span className="text-sm text-gray-500 ml-1">this month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Active Connections</CardTitle>
              <div className="p-2 bg-green-500 rounded-lg">
                <Wifi className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">
                {loading ? "..." : dashboardStats.activeConnections.toLocaleString()}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {dashboardStats.totalCustomers > 0
                  ? ((dashboardStats.activeConnections / dashboardStats.totalCustomers) * 100).toFixed(1)
                  : 0}
                % online
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Monthly Revenue</CardTitle>
              <div className="p-2 bg-purple-500 rounded-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">
                {loading ? "..." : formatCurrency(dashboardStats.monthlyRevenue)}
              </div>
              <p className="text-sm text-gray-500 mt-2">Current month</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Network Uptime</CardTitle>
              <div className="p-2 bg-orange-500 rounded-lg">
                <ActivityIcon className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{dashboardStats.networkUptime}%</div>
              <p className="text-sm text-gray-500 mt-2">Last 30 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <Button
                className="h-20 flex-col space-y-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                onClick={() => (window.location.href = "/operator/customers")}
              >
                <UserPlus className="h-6 w-6" />
                <span className="text-xs">Add Customer</span>
              </Button>
              <Button
                className="h-20 flex-col space-y-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                onClick={() => (window.location.href = "/operator/network")}
              >
                <Router className="h-6 w-6" />
                <span className="text-xs">Network Map</span>
              </Button>
              <Button
                className="h-20 flex-col space-y-2 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                onClick={() => (window.location.href = "/operator/billing")}
              >
                <DollarSign className="h-6 w-6" />
                <span className="text-xs">Generate Bills</span>
              </Button>
              <Button
                className="h-20 flex-col space-y-2 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                onClick={() => (window.location.href = "/operator/notifications")}
              >
                <Bell className="h-6 w-6" />
                <span className="text-xs">Send Notice</span>
              </Button>
              <Button
                className="h-20 flex-col space-y-2 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                onClick={() => (window.location.href = "/operator/complaints")}
              >
                <AlertTriangle className="h-6 w-6" />
                <span className="text-xs">View Complaints</span>
              </Button>
              <Button
                className="h-20 flex-col space-y-2 bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700"
                onClick={() => (window.location.href = "/operator/reports")}
              >
                <ActivityIcon className="h-6 w-6" />
                <span className="text-xs">Reports</span>
              </Button>
              <Button
                className="h-20 flex-col space-y-2 bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
                onClick={() => (window.location.href = "/operator/marketplace")}
              >
                <ShoppingCart className="h-6 w-6" />
                <span className="text-xs">Marketplace</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="customers" className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-4 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger value="customers" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Recent Customers
            </TabsTrigger>
            <TabsTrigger value="network" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Network Status
            </TabsTrigger>
            <TabsTrigger value="activities" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Activities
            </TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Inventory
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customers" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Recent Customers</CardTitle>
                <CardDescription>Latest customer additions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading customers...</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[200px]">Customer Details</TableHead>
                          <TableHead className="min-w-[150px]">Contact</TableHead>
                          <TableHead className="min-w-[120px]">Plan</TableHead>
                          <TableHead className="min-w-[100px]">Status</TableHead>
                          <TableHead className="min-w-[120px]">Monthly Bill</TableHead>
                          <TableHead className="min-w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentCustomers.map((customer) => (
                          <TableRow key={customer.customer_id}>
                            <TableCell>
                              <div>
                                <div className="font-medium text-gray-900">{customer.name}</div>
                                <div className="text-sm text-gray-500">{customer.customer_id}</div>
                                <div className="flex items-center text-xs text-gray-400 mt-1">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {customer.address}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center text-sm">
                                  <Phone className="h-3 w-3 mr-1 text-gray-400" />
                                  {customer.phone}
                                </div>
                                <div className="flex items-center text-sm">
                                  <Mail className="h-3 w-3 mr-1 text-gray-400" />
                                  {customer.email}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{customer.plan}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(customer.status)}>{customer.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{formatCurrency(customer.monthly_bill)}</div>
                              <div className="text-xs text-gray-500">per month</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => console.log("View customer", customer.customer_id)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => console.log("Edit customer", customer.customer_id)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="network" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Network Equipment Status</CardTitle>
                <CardDescription>Real-time status of network infrastructure</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {networkStatus.map((equipment) => (
                    <Card key={equipment.id} className="border border-gray-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`p-2 rounded-lg ${
                                equipment.status === "online"
                                  ? "bg-green-100"
                                  : equipment.status === "warning"
                                    ? "bg-yellow-100"
                                    : "bg-red-100"
                              }`}
                            >
                              {equipment.type === "OLT" && (
                                <Signal
                                  className={`h-5 w-5 ${
                                    equipment.status === "online"
                                      ? "text-green-600"
                                      : equipment.status === "warning"
                                        ? "text-yellow-600"
                                        : "text-red-600"
                                  }`}
                                />
                              )}
                              {equipment.type === "Switch" && (
                                <ActivityIcon
                                  className={`h-5 w-5 ${
                                    equipment.status === "online"
                                      ? "text-green-600"
                                      : equipment.status === "warning"
                                        ? "text-yellow-600"
                                        : "text-red-600"
                                  }`}
                                />
                              )}
                              {equipment.type === "Router" && (
                                <Router
                                  className={`h-5 w-5 ${
                                    equipment.status === "online"
                                      ? "text-green-600"
                                      : equipment.status === "warning"
                                        ? "text-yellow-600"
                                        : "text-red-600"
                                  }`}
                                />
                              )}
                            </div>
                            <div>
                              <CardTitle className="text-base">{equipment.name}</CardTitle>
                              <CardDescription className="text-sm">{equipment.location}</CardDescription>
                            </div>
                          </div>
                          <Badge className={getStatusColor(equipment.status)}>{equipment.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {equipment.type === "OLT" && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Connected Users:</span>
                              <span className="font-medium">
                                {equipment.connectedUsers}/{equipment.capacity}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${(equipment.connectedUsers / equipment.capacity) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span>Uptime:</span>
                          <span className="font-medium">{equipment.uptime}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Last Update:</span>
                          <span className="text-gray-500">{formatDate(equipment.lastUpdate)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Recent Activities</CardTitle>
                <CardDescription>Latest system activities and events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div
                        className={`p-2 rounded-full ${
                          activity.type === "customer_added"
                            ? "bg-blue-100"
                            : activity.type === "payment_received"
                              ? "bg-green-100"
                              : activity.type === "support_ticket"
                                ? "bg-red-100"
                                : "bg-purple-100"
                        }`}
                      >
                        {activity.type === "customer_added" && <UserPlus className="h-4 w-4 text-blue-600" />}
                        {activity.type === "payment_received" && <DollarSign className="h-4 w-4 text-green-600" />}
                        {activity.type === "support_ticket" && <AlertTriangle className="h-4 w-4 text-red-600" />}
                        {activity.type === "installation_completed" && (
                          <CheckCircle className="h-4 w-4 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(activity.timestamp)} • {activity.user}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Inventory Management</CardTitle>
                <CardDescription>Manage your stock and equipment inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quickMarketplaceItems.map((item) => (
                    <Card key={item.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-sm">{item.name}</h3>
                              <p className="text-xs text-gray-500">{item.category}</p>
                            </div>
                            <Badge
                              className={
                                item.urgency === "high"
                                  ? "bg-red-100 text-red-800"
                                  : item.urgency === "medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                              }
                            >
                              {item.urgency}
                            </Badge>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-lg">₹{item.price.toLocaleString()}</span>
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-500 ml-1">{item.rating}</span>
                            </div>
                          </div>

                          <div className="text-xs text-gray-500">
                            <div className="flex items-center justify-between">
                              <span>Vendor: {item.vendor}</span>
                              <span className={item.inStock ? "text-green-600" : "text-red-600"}>
                                {item.inStock ? "In Stock" : "Out of Stock"}
                              </span>
                            </div>
                          </div>

                          <div className="flex space-x-2 pt-2">
                            <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button size="sm" className="flex-1" disabled={!item.inStock}>
                              <Package className="h-3 w-3 mr-1" />
                              Request Stock
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-800">Stock Request Available</h4>
                      <p className="text-sm text-blue-600">Request inventory items from admin for your operations</p>
                    </div>
                    <Button
                      variant="outline"
                      className="bg-white"
                      onClick={() => (window.location.href = "/operator/inventory")}
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Manage Inventory
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
