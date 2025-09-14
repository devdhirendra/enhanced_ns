"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Package,
  ShoppingCart,
  DollarSign,
  ArrowUpRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  Truck,
  Star,
  BarChart3,
  Plus,
  Settings,
  Download,
  Loader2,
  Warehouse,
  TrendingUp,
  CreditCard,
  User,
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { orderApi, productApi, vendorProductApi, vendorOrderApi } from "@/lib/api"

// ✅ Define VendorStats interface
interface VendorStats {
  totalProducts: number
  activeProducts: number
  totalOrders: number
  pendingOrders: number
  deliveredOrders: number
  totalRevenue: number
  monthlyRevenue: number
  revenueGrowth: number
  averageRating: number
  totalReviews: number
  lowStockItems: number
  paymentDue: number
}

// ✅ Define QuickAction interface
interface QuickAction {
  id: string
  title: string
  description: string
  icon: any
  route: string
  color: string
}

// ✅ Define quickActions array
const quickActions: QuickAction[] = [
  {
    id: "add-product",
    title: "Add Product",
    description: "Add new products to your catalog",
    icon: Plus,
    route: "/vendor/products",
    color: "text-green-600"
  },
  {
    id: "view-orders",
    title: "View Orders",
    description: "Manage incoming orders",
    icon: ShoppingCart,
    route: "/vendor/orders",
    color: "text-blue-600"
  },
  {
    id: "manage-inventory",
    title: "Manage Inventory",
    description: "Track and update stock levels",
    icon: Warehouse,
    route: "/vendor/inventory",
    color: "text-purple-600"
  },
  {
    id: "shipping",
    title: "Shipping & Delivery",
    description: "Handle shipping and logistics",
    icon: Truck,
    route: "/vendor/shipping",
    color: "text-orange-600"
  },
  {
    id: "payments",
    title: "Payment Reports",
    description: "View earnings and settlements",
    icon: CreditCard,
    route: "/vendor/payments",
    color: "text-indigo-600"
  },
  {
    id: "analytics",
    title: "Sales Analytics",
    description: "Analyze performance metrics",
    icon: TrendingUp,
    route: "/vendor/analytics",
    color: "text-pink-600"
  }
]

export default function VendorDashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  
  // ✅ Fixed authentication check - check if user exists and has userid
  const vendorId = user?.user_id || ""
  const tempverdorId = user?.profileDetail?.vendorId || "" // Fallback for testing
  const isAuthenticated = !!user && !!vendorId
  
  // State management
  const [vendorStats, setVendorStats] = useState<VendorStats | null>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Create personalized title and description for DashboardLayout
  const dashboardTitle = isAuthenticated ? 
    `Welcome back, ${user.profileDetail?.name || user.profileDetail.name || user.email}` : 
    "Vendor Dashboard"
    
  const dashboardDescription = isAuthenticated ? 
    `Monitor your business performance and manage operations - ${user.profileDetail?.name || user.profileDetail.name || 'Vendor'}` : 
    "Overview of your network operations"

  // ✅ Fetch dashboard data when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, vendorId])

  // ✅ fetchDashboardData function
  const fetchDashboardData = async () => {
    if (!vendorId) {
      toast({
        title: "Authentication Error",
        description: "Please log in to access vendor dashboard",
        variant: "destructive"
      })
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      console.log("Fetching data for vendor:", vendorId)
      
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        fetchVendorStats(vendorId),
        vendorOrderApi.getAll(vendorId).catch((err) => {
          console.error("Orders fetch error:", err)
          return []
        }),
        vendorProductApi.getAll(vendorId).catch((err) => {
          console.error("Products fetch error:", err)
          return []
        })
      ])

      setVendorStats(statsRes)
      setOrders(ordersRes || [])
      setProducts(productsRes || [])
      
      console.log("Dashboard data loaded successfully")
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // ✅ fetchVendorStats function
  const fetchVendorStats = async (vendorId: string): Promise<VendorStats> => {
    try {
      // Call your actual vendor stats API here
      // const response = await vendorApi.getStats(vendorId)
      // return response.data
      
      // For now, using simulated data
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            totalProducts: 156,
            activeProducts: 142,
            totalOrders: 89,
            pendingOrders: 12,
            deliveredOrders: 67,
            totalRevenue: 2450000,
            monthlyRevenue: 185000,
            revenueGrowth: 15.3,
            averageRating: 4.6,
            totalReviews: 234,
            lowStockItems: 8,
            paymentDue: 125000,
          })
        }, 1000)
      })
    } catch (error) {
      console.error("Error fetching vendor stats:", error)
      throw error
    }
  }

  // ✅ handleQuickAction function
  const handleQuickAction = async (action: QuickAction) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access vendor features",
        variant: "destructive"
      })
      return
    }

    setActionLoading(action.id)
    
    // Simulate loading for better UX
    await new Promise(resolve => setTimeout(resolve, 500))
    
    try {
      router.push(action.route)
      toast({
        title: "Navigating",
        description: `Opening ${action.title}...`,
      })
    } catch (error) {
      console.error("Navigation error:", error)
      toast({
        title: "Navigation Error",
        description: "Failed to navigate to the requested page",
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  // ✅ refreshData function
  const refreshData = async () => {
    if (!isAuthenticated) return
    
    await fetchDashboardData()
    toast({
      title: "Data Refreshed",
      description: "Dashboard data has been updated successfully.",
    })
  }

  // Show loading while checking authentication
  if (loading) {
    return (
      <DashboardLayout 
        title="Loading Dashboard" 
        description="Please wait while we load your dashboard..."
      >
        <div className="space-y-6 p-4 md:p-6">
          <DashboardSkeleton />
        </div>
      </DashboardLayout>
    )
  }

  // ✅ Fixed authentication check
  if (!isAuthenticated) {
    return (
      <DashboardLayout 
        title="Authentication Required" 
        description="Please log in to access your vendor dashboard"
      >
        <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-semibold">Authentication Required</h2>
          <p className="text-gray-600 text-center">
            Please log in with a valid vendor account to access the dashboard.
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>Debug info:</p>
            <p>User exists: {user ? 'Yes' : 'No'}</p>
            <p>User ID: {user?.user_id || user?.id || 'None'}</p>
            <p>Email: {user?.email || 'None'}</p>
          </div>
          <Button onClick={() => router.push('/login')}>
            Go to Login
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout 
      title={dashboardTitle} 
      description={dashboardDescription}
    >
      <div className="space-y-6">

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Products"
            value={vendorStats?.totalProducts || 0}
            subtitle={`${vendorStats?.activeProducts || 0} active`}
            icon={Package}
            color="from-green-50 to-emerald-100"
            iconBg="bg-green-500"
            subtitleIcon={CheckCircle}
            subtitleColor="text-green-600"
          />
          
          <MetricCard
            title="Total Orders"
            value={vendorStats?.totalOrders || 0}
            subtitle={`${vendorStats?.pendingOrders || 0} pending`}
            icon={ShoppingCart}
            color="from-blue-50 to-blue-100"
            iconBg="bg-blue-500"
            subtitleIcon={Clock}
            subtitleColor="text-yellow-600"
          />
          
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(vendorStats?.totalRevenue || 0)}
            subtitle={`+${vendorStats?.revenueGrowth || 0}%`}
            icon={DollarSign}
            color="from-purple-50 to-violet-100"
            iconBg="bg-purple-500"
            subtitleIcon={ArrowUpRight}
            subtitleColor="text-green-600"
          />
          
          <MetricCard
            title="Customer Rating"
            value={`${vendorStats?.averageRating || 0}/5.0`}
            subtitle={`${vendorStats?.totalReviews || 0} reviews`}
            icon={Star}
            color="from-orange-50 to-orange-100"
            iconBg="bg-orange-500"
            subtitleIcon={Star}
            subtitleColor="text-gray-600"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SecondaryMetricCard
            title="Monthly Revenue"
            value={formatCurrency(vendorStats?.monthlyRevenue || 0)}
            subtitle="This month"
            icon={BarChart3}
            iconColor="text-green-600"
          />
          
          <SecondaryMetricCard
            title="Delivered Orders"
            value={vendorStats?.deliveredOrders || 0}
            subtitle="Successfully delivered"
            icon={Truck}
            iconColor="text-blue-600"
          />
          
          <SecondaryMetricCard
            title="Low Stock Items"
            value={vendorStats?.lowStockItems || 0}
            subtitle="Requires restocking"
            icon={AlertTriangle}
            iconColor="text-red-600"
          />
          
          <SecondaryMetricCard
            title="Payment Due"
            value={formatCurrency(vendorStats?.paymentDue || 0)}
            subtitle="Pending settlement"
            icon={DollarSign}
            iconColor="text-purple-600"
          />
        </div>

        {/* Quick Actions */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>
              Access frequently used vendor tools and manage your business operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action) => {
                const IconComponent = action.icon
                const isLoading = actionLoading === action.id
                
                return (
                  <Button
                    key={action.id}
                    variant="outline"
                    className="h-24 flex-col space-y-2 bg-gradient-to-br from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 border-2 hover:border-gray-300 transition-all duration-200"
                    onClick={() => handleQuickAction(action)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        <span className="text-sm text-gray-500">Loading...</span>
                      </>
                    ) : (
                      <>
                        <IconComponent className={`h-6 w-6 ${action.color}`} />
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-900">{action.title}</div>
                          <div className="text-xs text-gray-500 mt-1">{action.description}</div>
                        </div>
                      </>
                    )}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentOrdersCard orders={orders.slice(0, 5)} />
          <TopProductsCard products={products.slice(0, 5)} />
        </div>

        {/* User Profile Summary Card */}
        <Card className="shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Vendor Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Vendor Name</p>
                <p className="font-semibold text-gray-900">
                  {user.profileDetail?.name || user.name || 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Vendor ID</p>
                <p className="font-semibold text-gray-900">{tempverdorId}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

// ✅ Component helpers
interface MetricCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: any
  color: string
  iconBg: string
  subtitleIcon: any
  subtitleColor: string
}

const MetricCard: React.FC<MetricCardProps> = ({
  title, value, subtitle, icon: Icon, color, iconBg, subtitleIcon: SubtitleIcon, subtitleColor
}) => (
  <Card className={`border-0 shadow-lg bg-gradient-to-br ${color}`}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-700">{title}</CardTitle>
      <div className={`p-2 ${iconBg} rounded-lg`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      <div className="flex items-center mt-2">
        <SubtitleIcon className={`h-4 w-4 ${subtitleColor} mr-1`} />
        <span className={`text-sm ${subtitleColor} font-medium`}>{subtitle}</span>
      </div>
    </CardContent>
  </Card>
)

interface SecondaryMetricCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: any
  iconColor: string
}

const SecondaryMetricCard: React.FC<SecondaryMetricCardProps> = ({
  title, value, subtitle, icon: Icon, iconColor
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      <Icon className={`h-4 w-4 ${iconColor}`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
    </CardContent>
  </Card>
)

const RecentOrdersCard: React.FC<{ orders: any[] }> = ({ orders }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <ShoppingCart className="h-5 w-5" />
        <span>Recent Orders</span>
      </CardTitle>
      <CardDescription>Latest order activity</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {orders.length > 0 ? orders.map((order) => (
          <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium">{order.operator || order.customerId}</div>
              <div className="text-sm text-gray-500">{order.items || order.products}</div>
            </div>
            <div className="text-right">
              <div className="font-medium">{formatCurrency(order.amount || order.totalAmount)}</div>
              <Badge variant="outline" className="text-xs">
                {order.status}
              </Badge>
            </div>
          </div>
        )) : (
          <div className="text-center py-4 text-gray-500">No recent orders</div>
        )}
      </div>
    </CardContent>
  </Card>
)

const TopProductsCard: React.FC<{ products: any[] }> = ({ products }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Package className="h-5 w-5" />
        <span>Top Products</span>
      </CardTitle>
      <CardDescription>Best performing products</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {products.length > 0 ? products.map((product) => (
          <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium">{product.itemName || product.name}</div>
              <div className="text-sm text-gray-500">{product.category}</div>
            </div>
            <div className="text-right">
              <div className="font-medium">{formatCurrency(product.unitPrice || product.price)}</div>
              <div className="text-sm text-gray-500">Stock: {product.quantity || product.stock}</div>
            </div>
          </div>
        )) : (
          <div className="text-center py-4 text-gray-500">No products available</div>
        )}
      </div>
    </CardContent>
  </Card>
)

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array(4).fill(0).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
            <Skeleton className="h-8 w-16 mt-4" />
            <Skeleton className="h-4 w-24 mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
    
    <Card>
      <CardContent className="p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
)
