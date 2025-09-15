"use client"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Building2,
  Users,
  DollarSign,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  UserCheck,
  Zap,
  Star,
  Filter,
  Search,
  Plus,
  Edit,
  Ban,
  Check,
  X,
  RefreshCw,
} from "lucide-react"
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { VendorForm } from "@/components/vendor/VendorForm"

interface DashboardStats {
  totalOperators: number
  activeOperators: number
  totalRevenue: number
  monthlyGrowth: number
  totalCustomers: number
  customerGrowth: number
  totalTechnicians: number
  totalStaff: number
  totalVendors: number
  totalComplaints: number
  systemUptime: number
}

interface RecentOperator {
  name: string
  companyName: string
  phone: string
  address: {
    state: string
    district: string
    area: string
  }
  planAssigned: string
  revenue: number
  customerCount: number
}

// Skeleton Components
const MetricCardSkeleton = () => (
  <Card className="border-0 shadow-lg">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-10 rounded-lg" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-20 mb-2" />
      <div className="flex items-center">
        <Skeleton className="h-4 w-4 mr-1" />
        <Skeleton className="h-4 w-16" />
      </div>
    </CardContent>
  </Card>
)

const QuickActionSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <Skeleton key={i} className="h-20 w-full rounded-lg" />
    ))}
  </div>
)

const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <div className="space-y-4">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-10 w-24" />
    </div>
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: cols }).map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-4 w-20" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: cols }).map((_, j) => (
                <TableCell key={j}>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
)

const VendorFiltersSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-32 mb-2" />
      <Skeleton className="h-4 w-64" />
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-full" />
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-28" />
      </div>
    </CardContent>
  </Card>
)

// Demo data fallback
const fallbackStats: DashboardStats = {
  totalOperators: 156,
  activeOperators: 142,
  totalRevenue: 2450000,
  monthlyGrowth: 12.5,
  totalCustomers: 45678,
  customerGrowth: 8.3,
  totalTechnicians: 89,
  totalStaff: 45,
  totalVendors: 23,
  totalComplaints: 12,
  systemUptime: 99.8,
}

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState("30d")
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(fallbackStats)
  const [recentOperators, setRecentOperators] = useState<RecentOperator[]>([])
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [vendors, setVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [vendorsLoading, setVendorsLoading] = useState(true)
  const [vendorFilters, setVendorFilters] = useState({
  status: "",
  sortBy: "newest",
})
  
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedVendors, setSelectedVendors] = useState<string[]>([])
  const [vendorFormOpen, setVendorFormOpen] = useState(false)
  const [editingVendor, setEditingVendor] = useState<any>(null)
  const { toast } = useToast()  

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      console.log("Fetching dashboard data from API...")

      const [operators, technicians, staff, vendors, customers, complaints] = await Promise.allSettled([
        apiClient.getAllOperators(),
        apiClient.getAllTechnicians(),
        apiClient.getAllStaff(),
        apiClient.getAllVendors(),
        apiClient.getAllCustomers(),
        apiClient.getAllComplaints(),
      ])

      console.log("API data fetched successfully")

      const operatorsData = operators.status === "fulfilled" ? operators.value : []
      const techniciansData = technicians.status === "fulfilled" ? technicians.value : []
      const staffData = staff.status === "fulfilled" ? staff.value : []
      const vendorsData = vendors.status === "fulfilled" ? vendors.value : []
      const customersData = customers.status === "fulfilled" ? customers.value : []
      const complaintsData = complaints.status === "fulfilled" ? complaints.value : []

      // Calculate statistics from real data
      const totalOperators = operatorsData.length
      const activeOperators = operatorsData.filter(
        (op) => op.Permissions?.status === "active" || op.role === "operator",
      ).length
      const totalRevenue = operatorsData.reduce((sum, op) => sum + (op.profileDetail?.revenue || 0), 0)
      const totalCustomers = customersData.length
      const totalTechnicians = techniciansData.length
      const totalStaff = staffData.length
      const totalVendors = vendorsData.length
      const totalComplaints = complaintsData.length

      const stats: DashboardStats = {
        totalOperators,
        activeOperators,
        totalRevenue,
        monthlyGrowth: 12.5,
        totalCustomers,
        customerGrowth: 8.3,
        totalTechnicians,
        totalStaff,
        totalVendors,
        totalComplaints,
        systemUptime: 99.8,
      }

      setDashboardStats(stats)

      const sortedOperators = operatorsData
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(
          (op): RecentOperator => ({
            name: op.profileDetail?.name || "Unknown",
            companyName: op.profileDetail?.companyName || op.profileDetail?.name || "Unknown Company",
            phone: op.profileDetail?.phone || "N/A",
            address: op.profileDetail?.address || {
              state: "N/A",
              district: "N/A",
              area: "N/A",
            },
            planAssigned: op.profileDetail?.planAssigned || "Basic",
            revenue: op.profileDetail?.revenue || 0,
            customerCount: op.profileDetail?.customerCount || 0,
          }),
        )

      setRecentOperators(sortedOperators)

      setVendors(
        vendorsData.map((vendor) => ({
          id: vendor.user_id,
          name: vendor.profileDetail?.companyName || vendor.profileDetail?.name || "Unknown Vendor",
          email: vendor.email,
          phone: vendor.profileDetail?.phone || "N/A",
          category: vendor.profileDetail?.category || "General",
          revenue: vendor.profileDetail?.revenue || 0,
          rating: vendor.profileDetail?.rating || 4.0,
          commission: vendor.profileDetail?.commission || 15,
          status: vendor.Permissions?.status || "active",
          joinDate: vendor.createdAt,
          products: vendor.profileDetail?.products || 0,
          orders: vendor.profileDetail?.orders || 0,
        })),
      )

      setRecentOrders([
        {
          id: `ORD${Math.random().toString(36).substr(2, 9)}`,
          operator: "Demo Operator",
          items: "Various networking items",
          amount: 15000,
          status: "pending",
          date: new Date().toISOString(),
        },
      ])

      console.log("Dashboard data updated with real API data")
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast({
        title: "Error Loading Dashboard",
        description: "Using demo data. Please check your connection.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setVendorsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

 const handleVendorApproval = async (vendorId: string, approved: boolean) => {
    try {
      await apiClient.updateVendor(vendorId, {
        Permissions: { status: approved ? "active" : "rejected" },
      })

      toast({
        title: approved ? "Vendor Approved" : "Vendor Rejected",
        description: `Vendor has been ${approved ? "approved" : "rejected"} successfully.`,
      })

      fetchDashboardData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update vendor status.",
        variant: "destructive",
      })
    }
  }
  // Add this filtering logic before rendering the vendors table
const filteredVendors = vendors
  .filter(vendor => {
    // Status filter
    if (vendorFilters.status && vendor.status !== vendorFilters.status) {
      return false
    }
    
    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        vendor.name.toLowerCase().includes(searchLower) ||
        vendor.email.toLowerCase().includes(searchLower) ||
        vendor.phone.toLowerCase().includes(searchLower)
      )
    }
    
    return true
  })
  .sort((a, b) => {
    // Sort logic
    if (vendorFilters.sortBy === "newest") {
      return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()
    } else if (vendorFilters.sortBy === "revenue") {
      return b.revenue - a.revenue
    } else if (vendorFilters.sortBy === "rating") {
      return b.rating - a.rating
    }
    return 0
  })

  const handleVendorSuspension = async (vendorId: string) => {
    try {
      await apiClient.updateVendor(vendorId, {
        Permissions: { status: "suspended" },
      })

      toast({
        title: "Vendor Suspended",
        description: "Vendor account has been suspended.",
      })

      fetchDashboardData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to suspend vendor.",
        variant: "destructive",
      })
    }
  }
  const handleEditVendor = (vendor: any) => {
    setEditingVendor(vendor)
    setVendorFormOpen(true)
  }

  

  const handleVendorFormSuccess = () => {
    fetchDashboardData()
  }
  const handleAddOperator = () => {
    window.location.href = "/admin/operators"
  }

  const handleAddVendor = () => {
    setEditingVendor(null)
    setVendorFormOpen(true)
  }

  return (
    <DashboardLayout title="Admin Dashboard" description="Overview of your network solutions platform">
      <div className="space-y-1 sm:space-y-1 sm:p-1">
        {/* Loading Indicator */}
        {/* {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading dashboard data...</span>
          </div>
        )} */}

        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="overview" className="text-sm sm:text-base">Overview</TabsTrigger>
            <TabsTrigger value="vendors" className="text-sm sm:text-base">Vendor Management</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            {/* Key Metrics */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <MetricCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-700">Total Operators</CardTitle>
                    <div className="p-2 bg-blue-500 rounded-lg shadow-lg">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">{dashboardStats.totalOperators}</div>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600 font-medium">{dashboardStats.activeOperators} active</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100 hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-700">Total Revenue</CardTitle>
                    <div className="p-2 bg-green-500 rounded-lg shadow-lg">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">{formatCurrency(dashboardStats.totalRevenue)}</div>
                    <div className="flex items-center mt-2">
                      <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600 font-medium">+{dashboardStats.monthlyGrowth}%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-100 hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-700">Total Customers</CardTitle>
                    <div className="p-2 bg-purple-500 rounded-lg shadow-lg">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {dashboardStats.totalCustomers.toLocaleString()}
                    </div>
                    <div className="flex items-center mt-2">
                      <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600 font-medium">+{dashboardStats.customerGrowth}%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-700">Total Staff</CardTitle>
                    <div className="p-2 bg-orange-500 rounded-lg shadow-lg">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {dashboardStats.totalTechnicians + dashboardStats.totalStaff}
                    </div>
                    <div className="flex items-center mt-2">
                      <UserCheck className="h-4 w-4 text-blue-600 mr-1" />
                      <span className="text-sm text-blue-600 font-medium">
                        {dashboardStats.totalTechnicians} technicians
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Secondary Metrics */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <MetricCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Vendors</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">{dashboardStats.totalVendors}</div>
                    <p className="text-xs text-gray-500 mt-1">Active vendors</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Staff Members</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">{dashboardStats.totalStaff}</div>
                    <p className="text-xs text-gray-500 mt-1">Active staff</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Open Complaints</CardTitle>
                    <UserCheck className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">{dashboardStats.totalComplaints}</div>
                    <p className="text-xs text-gray-500 mt-1">Pending resolution</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">System Uptime</CardTitle>
                    <Zap className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">{dashboardStats.systemUptime}%</div>
                    <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <QuickActionSkeleton />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                    <Button
                      className="h-20 flex-col space-y-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      onClick={handleAddOperator}
                    >
                      <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
                      <span className="text-xs font-medium">Add Operator</span>
                    </Button>
                    <Button
                      className="h-20 flex-col space-y-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      onClick={handleAddVendor}
                    >
                      <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                      <span className="text-xs font-medium">Add Vendor</span>
                    </Button>
                    <Button
                      className="h-20 flex-col space-y-2 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      onClick={() => (window.location.href = "/admin/inventory")}
                    >
                      <Package className="h-5 w-5 sm:h-6 sm:w-6" />
                      <span className="text-xs font-medium">Manage Inventory</span>
                    </Button>
                    <Button
                      className="h-20 flex-col space-y-2 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      onClick={() => (window.location.href = "/admin/complaints")}
                    >
                      <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />
                      <span className="text-xs font-medium">View Complaints</span>
                    </Button>
                    <Button
                      className="h-20 flex-col space-y-2 bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      onClick={() => (window.location.href = "/admin/technicians")}
                    >
                      <UserCheck className="h-5 w-5 sm:h-6 sm:w-6" />
                      <span className="text-xs font-medium">Manage Staff</span>
                    </Button>
                    <Button
                      className="h-20 flex-col space-y-2 bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      onClick={fetchDashboardData}
                      disabled={loading}
                    >
                      <RefreshCw className={`h-5 w-5 sm:h-6 sm:w-6 ${loading ? "animate-spin" : ""}`} />
                      <span className="text-xs font-medium">Refresh Data</span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Operators Table */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              {loading ? (
                <TableSkeleton rows={5} cols={5} />
              ) : (
                <>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg sm:text-xl">Recent Operators</CardTitle>
                        <CardDescription>Latest operator registrations</CardDescription>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => (window.location.href = "/admin/operators")}
                        className="hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[200px]">Operator</TableHead>
                            <TableHead className="min-w-[150px]">Location</TableHead>
                            <TableHead className="min-w-[100px]">Plan</TableHead>
                            <TableHead className="min-w-[120px]">Revenue</TableHead>
                            <TableHead className="min-w-[100px]">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentOperators.map((operator, index) => (
                            <TableRow key={index} className="hover:bg-gray-50 transition-colors duration-200">
                              <TableCell>
                                <div>
                                  <div className="font-medium text-gray-900">{operator.companyName || operator.name}</div>
                                  <div className="text-sm text-gray-500">{operator.phone}</div>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {operator.address ? `${operator.address.area}, ${operator.address.district}` : "N/A"}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  {operator.planAssigned || "Basic"}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">{formatCurrency(operator.revenue || 0)}</TableCell>
                              <TableCell>
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors duration-200">
                                  Active
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                          {recentOperators.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                                <div className="flex flex-col items-center">
                                  <Building2 className="h-12 w-12 text-gray-300 mb-2" />
                                  <span>No operators found</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="vendors" className="space-y-4 sm:space-y-6">
            {/* Vendor Filters */}
            {vendorsLoading ? (
              <VendorFiltersSkeleton />
            ) : (
              // Replace the Vendor Filters section with this code
<Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
  <CardHeader>
    <CardTitle className="text-lg sm:text-xl">Vendor Filters</CardTitle>
    <CardDescription>Filter vendors by status or search by name/email</CardDescription>
  </CardHeader>
  <CardContent className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Filter by Status</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!vendorFilters.status ? "default" : "outline"}
            size="sm"
            onClick={() => setVendorFilters({ ...vendorFilters, status: "" })}
            className="h-8 text-xs"
          >
            All Vendors
          </Button>
          <Button
            variant={vendorFilters.status === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setVendorFilters({ ...vendorFilters, status: "active" })}
            className="h-8 text-xs bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900 data-[state=active]:bg-green-500 data-[state=active]:text-white"
          >
            Active
          </Button>
          <Button
            variant={vendorFilters.status === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setVendorFilters({ ...vendorFilters, status: "pending" })}
            className="h-8 text-xs bg-yellow-100 text-yellow-800 hover:bg-yellow-200 hover:text-yellow-900 data-[state=active]:bg-yellow-500 data-[state=active]:text-white"
          >
            Pending
          </Button>
          <Button
            variant={vendorFilters.status === "suspended" ? "default" : "outline"}
            size="sm"
            onClick={() => setVendorFilters({ ...vendorFilters, status: "suspended" })}
            className="h-8 text-xs bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-900 data-[state=active]:bg-red-500 data-[state=active]:text-white"
          >
            Suspended
          </Button>
          <Button
            variant={vendorFilters.status === "rejected" ? "default" : "outline"}
            size="sm"
            onClick={() => setVendorFilters({ ...vendorFilters, status: "rejected" })}
            className="h-8 text-xs bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-gray-900 data-[state=active]:bg-gray-500 data-[state=active]:text-white"
          >
            Rejected
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label className="text-sm font-medium">Sort By</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={vendorFilters.sortBy === "newest" ? "default" : "outline"}
            size="sm"
            onClick={() => setVendorFilters({ ...vendorFilters, sortBy: "newest" })}
            className="h-8 text-xs"
          >
            Newest
          </Button>
          <Button
            variant={vendorFilters.sortBy === "revenue" ? "default" : "outline"}
            size="sm"
            onClick={() => setVendorFilters({ ...vendorFilters, sortBy: "revenue" })}
            className="h-8 text-xs"
          >
            Highest Revenue
          </Button>
          <Button
            variant={vendorFilters.sortBy === "rating" ? "default" : "outline"}
            size="sm"
            onClick={() => setVendorFilters({ ...vendorFilters, sortBy: "rating" })}
            className="h-8 text-xs"
          >
            Highest Rating
          </Button>
        </div>
      </div>
    </div>
    
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search vendors by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-10 pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <Button 
        variant="outline" 
        className="h-10 hover:bg-gray-50 transition-colors duration-200"
        onClick={() => {
          setVendorFilters({
            status: "",
            sortBy: "newest",
          })
          setSearchTerm("")
        }}
      >
        <Filter className="h-4 w-4 mr-2" />
        Reset Filters
      </Button>
    </div>
  </CardContent>
</Card>            )}

            {/* Vendor Management Table */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              {vendorsLoading ? (
                <TableSkeleton rows={5} cols={7} />
              ) : (
                <>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg sm:text-xl">Vendor Management</CardTitle>
                        <CardDescription>Manage vendor approvals, commissions, and performance</CardDescription>
                      </div>
                      <Button 
                        onClick={handleAddVendor}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Vendor
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[200px]">Vendor</TableHead>
                            <TableHead className="min-w-[120px]">Category</TableHead>
                            <TableHead className="min-w-[120px]">Revenue</TableHead>
                            <TableHead className="min-w-[100px]">Rating</TableHead>
                            <TableHead className="min-w-[100px]">Commission</TableHead>
                            <TableHead className="min-w-[100px]">Status</TableHead>
                            <TableHead className="min-w-[150px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredVendors.map((vendor) => (
                            <TableRow key={vendor.id} className="hover:bg-gray-50 transition-colors duration-200">
                              <TableCell>
                                <div>
                                  <div className="font-medium text-gray-900">{vendor.name}</div>
                                  <div className="text-sm text-gray-500">{vendor.email}</div>
                                  <div className="text-xs text-gray-400">
                                    {vendor.products} products • {vendor.orders} orders
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                  {vendor.category}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">{formatCurrency(vendor.revenue)}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                  <span>{vendor.rating}</span>
                                </div>
                              </TableCell>
                              <TableCell>{vendor.commission}%</TableCell>
                              <TableCell>
                                <Badge
                                  className={
                                    vendor.status === "active"
                                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                                      : vendor.status === "pending"
                                        ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                        : "bg-red-100 text-red-800 hover:bg-red-200"
                                  }
                                >
                                  {vendor.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  {vendor.status === "pending" && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors duration-200"
                                        onClick={() => handleVendorApproval(vendor.id, true)}
                                      >
                                        <Check className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors duration-200"
                                        onClick={() => handleVendorApproval(vendor.id, false)}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors duration-200"
                                    onClick={() => handleEditVendor(vendor)}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  {vendor.status !== "suspended" && (
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors duration-200"
                                      onClick={() => handleVendorSuspension(vendor.id)}
                                    >
                                      <Ban className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {vendors.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                                <div className="flex flex-col items-center">
                                  <ShoppingCart className="h-12 w-12 text-gray-300 mb-2" />
                                  <span>No vendors found</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          </TabsContent>
        </Tabs>
        <VendorForm
          open={vendorFormOpen}
          onOpenChange={setVendorFormOpen}
          onSuccess={handleVendorFormSuccess}
          editData={editingVendor}
        />
      </div>
    </DashboardLayout>
  )
}
