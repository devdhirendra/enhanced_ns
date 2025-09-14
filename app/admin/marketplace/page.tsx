"use client"
import { useState, useEffect } from "react"
import type React from "react"

import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  Star,
  Heart,
  Share2,
  TrendingUp,
  Truck,
  RefreshCw,
  Building2,
  Calendar,
} from "lucide-react"
import { formatCurrency, formatDate, exportToCSV } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
// Add this import at the top with your other API imports
import { orderApi, productApi, vendorApi, operatorApi, marketplaceApi } from "@/lib/api"

interface Order {
  orderId: string
  productId?: string
  operatorId: string
  vendorId: string
  quantity: number
  status: string
  trackingNumber?: string
  estimatedDelivery?: string
  createdAt: string
  updatedAt: string
  productName?: string
  operatorName?: string
  vendorName?: string
  totalAmount?: number
}

interface Product {
  productId: string
  vendorId: string
  name: string
  category: string
  price: number
  description: string
  specifications?: any
  images?: string[]
  createdAt: string
  updatedAt: string
  stock?: number
  rating?: number
  reviews?: number
  vendor?: string
}

interface Vendor {
  user_id: string
  email: string
  profileDetail: {
    name: string
    phone: string
    companyName: string
    address: {
      state: string
      district: string
      area: string
    }
  }
  createdAt: string
  updatedAt: string
}

interface Operator {
  user_id: string
  profileDetail: {
    name: string
    companyName?: string
    operatorId?: string
  }
}

// Skeleton Components
const StatsCardSkeleton = () => (
  <Card className="border-0 shadow-lg bg-gray-100 animate-pulse">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="h-4 bg-gray-300 rounded w-24"></div>
      <div className="p-2 bg-gray-300 rounded-lg">
        <div className="h-5 w-5 bg-gray-400 rounded"></div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="h-8 bg-gray-300 rounded w-16 mb-2"></div>
      <div className="h-3 bg-gray-300 rounded w-32"></div>
    </CardContent>
  </Card>
)

const ProductCardSkeleton = () => (
  <Card className="border-0 shadow-lg">
    <div className="relative h-48 bg-gray-200 rounded-t-lg animate-pulse"></div>
    <CardContent className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-20"></div>
      <div className="h-5 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-6 bg-gray-200 rounded w-16"></div>
      <div className="flex justify-between">
        <div className="h-3 bg-gray-200 rounded w-16"></div>
        <div className="h-3 bg-gray-200 rounded w-20"></div>
      </div>
    </CardContent>
    <div className="p-4 pt-0 flex gap-2">
      <div className="h-9 bg-gray-200 rounded flex-1"></div>
      <div className="h-9 bg-gray-200 rounded w-9"></div>
      <div className="h-9 bg-gray-200 rounded w-9"></div>
    </div>
  </Card>
)

const TableRowSkeleton = () => (
  <TableRow>
    <TableCell><div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div></TableCell>
    <TableCell><div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div></TableCell>
    <TableCell><div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></TableCell>
    <TableCell><div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div></TableCell>
    <TableCell><div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div></TableCell>
    <TableCell><div className="h-9 bg-gray-200 rounded w-32 animate-pulse"></div></TableCell>
    <TableCell><div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></TableCell>
    <TableCell>
      <div className="flex space-x-2">
        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </TableCell>
  </TableRow>
)

const VendorCardSkeleton = () => (
  <Card className="border hover:shadow-lg transition-shadow">
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gray-300 p-2 rounded-lg animate-pulse">
            <div className="h-5 w-5 bg-gray-400 rounded"></div>
          </div>
          <div>
            <div className="h-5 bg-gray-300 rounded w-32 mb-1 animate-pulse"></div>
            <div className="h-3 bg-gray-300 rounded w-24 animate-pulse"></div>
          </div>
        </div>
        <div className="h-6 bg-gray-300 rounded w-16 animate-pulse"></div>
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="space-y-2">
        <div className="h-3 bg-gray-300 rounded w-16 animate-pulse"></div>
        <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
        <div className="h-4 bg-gray-300 rounded w-40 animate-pulse"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-300 rounded w-20 animate-pulse"></div>
        <div className="h-4 bg-gray-300 rounded w-48 animate-pulse"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-300 rounded w-16 animate-pulse"></div>
        <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
      </div>
      <div className="flex space-x-2 pt-2">
        <div className="h-9 bg-gray-300 rounded flex-1 animate-pulse"></div>
        <div className="h-9 bg-gray-300 rounded w-9 animate-pulse"></div>
      </div>
    </CardContent>
  </Card>
)

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("popular")
  const [showAddProductDialog, setShowAddProductDialog] = useState(false)
  const [showEditProductDialog, setShowEditProductDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showCreateOrderDialog, setShowCreateOrderDialog] = useState(false)
  const [loading, setLoading] = useState(true)

  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [operators, setOperators] = useState<Operator[]>([])

  const { toast } = useToast()

  // Replace the fetchMarketplaceData function
  const fetchMarketplaceData = async () => {
    try {
      setLoading(true);
      console.log("Fetching marketplace data from API...");

      const [orderData, productData, vendorData, operatorData] = await Promise.all([
        marketplaceApi.getOrders(),
        marketplaceApi.getProducts(),
        vendorApi.getAll(),
        operatorApi.getAll(),
      ]);

      console.log("Orders fetched:", orderData.length);
      console.log("Products fetched:", productData.length);

      // Transform product data to match your interface
      const transformedProducts = productData.map((product: any) => ({
        productId: product.id,
        vendorId: product.supplier, // Using supplier as vendorId for now
        name: product.itemName,
        category: product.category,
        price: product.sellingPrice || product.unitPrice,
        description: product.description,
        specifications: product.specification,
        images: product.ProductImage ? [product.ProductImage] : [],
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        stock: product.quantity,
        rating: product.rating,
        vendor: product.brand, // Using brand as vendor name for now
      }));

      // Transform order data
      const transformedOrders = orderData.map((order: any) => ({
        orderId: order.orderId,
        productName: order.productName,
        quantity: order.quantity,
        operatorId: order.operatorId,
        vendorId: order.vendorId,
        status: order.status,
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        totalAmount: (order.quantity || 0) * 100, // You'll need to calculate this properly
      }));

      setOrders(Array.isArray(transformedOrders) ? transformedOrders : []);
      setProducts(Array.isArray(transformedProducts) ? transformedProducts : []);
      setVendors(vendorData);
      setOperators(operatorData);

      toast({
        title: "Data Loaded",
        description: "Marketplace data loaded successfully!",
      });
    } catch (error) {
      console.error("Error fetching marketplace data:", error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load marketplace data. Please try again.",
        variant: "destructive",
      });
      setOrders([]);
      setProducts([]);
      setVendors([]);
      setOperators([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketplaceData()
  }, [])

  const filteredProducts = products.filter((product) => {
    const productName = product.name || "";
    const productCategory = product.category || "";
    const productVendor = product.vendor || "";
    
    const matchesSearch =
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productVendor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      default:
        return 0
    }
  })

  const handleExport = () => {
    const exportData = products.map((product) => ({
      Name: product.name,
      Category: product.category,
      Price: product.price,
      Vendor: product.vendor || "N/A",
      "Created Date": formatDate(product.createdAt),
    }))
    exportToCSV(exportData, "marketplace-products")
    toast({
      title: "Export Successful",
      description: "Marketplace data exported successfully!",
    })
  }

  const handleViewProduct = (product: Product) => {
    toast({
      title: "Product Details",
      description: `Viewing details for ${product.name}`,
    })
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setShowEditProductDialog(true)
  }

  const handleDeleteProduct = async (product: Product) => {
    try {
      console.log("[v0] Deleting product:", product.productId)

      // Note: This would need to be implemented in the API
      // await productApi.delete(product.productId)

      toast({
        title: "Product Deleted",
        description: `${product.name} has been deleted successfully.`,
      })

      // Refresh the data
      fetchMarketplaceData()
    } catch (error) {
      console.error("[v0] Error deleting product:", error)
      toast({
        title: "Delete Failed",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Update handleUpdateOrderStatus
  const handleUpdateOrderStatus = async (order: Order, newStatus: string) => {
    try {
      await marketplaceApi.updateOrder(order.orderId, {
        status: newStatus,
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery,
      });

      toast({
        title: "Order Updated",
        description: `Order ${order.orderId} status updated to ${newStatus}`,
      });

      fetchMarketplaceData();
    } catch (error) {
      console.error("Error updating order:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    }
  }

  const handleViewOrder = (order: Order) => {
    toast({
      title: "Order Details",
      description: `Viewing details for order ${order.orderId}`,
    })
  }

  const handleTrackOrder = (order: Order) => {
    toast({
      title: "Track Order",
      description: `Tracking order ${order.orderId} - ${order.trackingNumber || "No tracking number"}`,
    })
  }

  const handleCreateOrderSuccess = () => {
    setShowCreateOrderDialog(false)
    fetchMarketplaceData() // Refresh the data
    toast({
      title: "Order Created",
      description: "New order has been created successfully!",
    })
  }

  const handleAddProductSuccess = () => {
    setShowAddProductDialog(false)
    fetchMarketplaceData() // Refresh the data
    toast({
      title: "Product Added",
      description: "New product has been added successfully!",
    })
  }

  const handleEditProductSuccess = () => {
    setShowEditProductDialog(false)
    setEditingProduct(null)
    fetchMarketplaceData() // Refresh the data
    toast({
      title: "Product Updated",
      description: "Product has been updated successfully!",
    })
  }

  const totalProducts = products.length
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
  const activeVendors = vendors.filter((v) => v.profileDetail).length

  const categories = [...new Set(products.map((p) => p.category))].filter(Boolean)

  return (
    <DashboardLayout title="Marketplace Management" description="Manage B2B marketplace for network equipment">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {loading ? (
            <>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : (
            <>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Total Products</CardTitle>
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900">{totalProducts}</div>
                  <p className="text-xs md:text-sm text-gray-500 mt-2">Across all categories</p>
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
                  <div className="text-2xl md:text-3xl font-bold text-gray-900">{totalOrders}</div>
                  <p className="text-xs md:text-sm text-gray-500 mt-2">All time orders</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Total Revenue</CardTitle>
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</div>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-xs md:text-sm text-green-600 font-medium">+15.2%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Active Vendors</CardTitle>
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900">{activeVendors}</div>
                  <p className="text-xs md:text-sm text-gray-500 mt-2">Verified suppliers</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="grid w-full max-w-lg grid-cols-3 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="products" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm">
                Products
              </TabsTrigger>
              <TabsTrigger value="orders" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm">
                Orders
              </TabsTrigger>
              <TabsTrigger value="vendors" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm">
                Vendors
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={fetchMarketplaceData} disabled={loading} className="text-xs sm:text-sm">
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport} className="text-xs sm:text-sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Dialog open={showAddProductDialog} onOpenChange={setShowAddProductDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>Add a new product to the marketplace</DialogDescription>
                  </DialogHeader>
                  <AddProductForm
                    onClose={() => setShowAddProductDialog(false)}
                    onSuccess={handleAddProductSuccess}
                    vendors={vendors}
                  />
                </DialogContent>
              </Dialog>
              <Dialog open={showCreateOrderDialog} onOpenChange={setShowCreateOrderDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-xs sm:text-sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Create Order
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Order</DialogTitle>
                    <DialogDescription>Create a new marketplace order</DialogDescription>
                  </DialogHeader>
                  <CreateOrderForm
                    onClose={() => setShowCreateOrderDialog(false)}
                    onSuccess={handleCreateOrderSuccess}
                    products={products}
                    operators={operators}
                    vendors={vendors}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <TabsContent value="products" className="space-y-6">
            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
              ) : (
                sortedProducts.map((product) => (
                  <Card
                    key={product.productId}
                    className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="relative">
                      <img
                        src={product.images?.[0] || "/placeholder.svg?height=200&width=200&text=Product"}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        <Badge className="bg-blue-500 text-white text-xs">{product.category}</Badge>
                      </div>
                      <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="secondary" className="h-8 w-8">
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="secondary" className="h-8 w-8">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {product.category}
                          </Badge>
                          {product.rating && (
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-500 mr-1" />
                              <span className="text-xs text-gray-600">
                                {product.rating} ({product.reviews || 0})
                              </span>
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors text-sm md:text-base">
                          {product.name}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-600 line-clamp-2">{product.description}</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-gray-900">{formatCurrency(product.price)}</span>
                        </div>
                        {product.stock && (
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Stock: {product.stock}</span>
                          </div>
                        )}
                        <div className="text-xs text-gray-500">by {product.vendor || "Unknown Vendor"}</div>
                      </div>
                    </CardContent>
                    <div className="p-4 pt-0 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent text-xs"
                        onClick={() => handleViewProduct(product)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)} className="text-xs">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteProduct(product)} className="text-xs">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
              {!loading && sortedProducts.length === 0 && (
                <div className="col-span-full text-center text-gray-500 py-8">
                  No products found. {searchTerm && "Try adjusting your search terms."}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Marketplace Orders ({orders.length})</CardTitle>
                <CardDescription>All orders placed by operators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-[600px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">Order ID</TableHead>
                        <TableHead className="text-xs sm:text-sm">Operator</TableHead>
                        <TableHead className="text-xs sm:text-sm">Product</TableHead>
                        <TableHead className="text-xs sm:text-sm">Quantity</TableHead>
                        <TableHead className="text-xs sm:text-sm">Amount</TableHead>
                        <TableHead className="text-xs sm:text-sm">Status</TableHead>
                        <TableHead className="text-xs sm:text-sm">Date</TableHead>
                        <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
                      ) : (
                        orders.map((order) => (
                          <TableRow key={order.orderId}>
                            <TableCell className="font-medium text-xs sm:text-sm">{order.orderId}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium text-xs sm:text-sm">{order.operatorName || order.operatorId}</div>
                                <div className="text-xs text-gray-500">{order.operatorId}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-xs sm:text-sm">{order.productName || order.productId}</div>
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">{order.quantity}</TableCell>
                            <TableCell className="font-medium text-xs sm:text-sm">
                              {order.totalAmount ? formatCurrency(order.totalAmount) : "N/A"}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={order.status}
                                onValueChange={(value) => handleUpdateOrderStatus(order, value)}
                              >
                                <SelectTrigger className="w-28 sm:w-32 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="shipped">Shipped</SelectItem>
                                  <SelectItem value="delivered">Delivered</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center text-xs sm:text-sm">
                                <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                {formatDate(order.createdAt)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Button variant="ghost" size="icon" onClick={() => handleViewOrder(order)} className="h-8 w-8">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleTrackOrder(order)} className="h-8 w-8">
                                  <Truck className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                      {!loading && orders.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                            No orders found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vendors" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Marketplace Vendors ({vendors.length})
                </CardTitle>
                <CardDescription>Manage approved vendors and suppliers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-[600px] overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {loading ? (
                      Array.from({ length: 6 }).map((_, i) => <VendorCardSkeleton key={i} />)
                    ) : (
                      vendors.map((vendor) => (
                        <Card key={vendor.user_id} className="border hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                                  <Users className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900 text-sm md:text-base">
                                    {vendor.profileDetail.companyName || vendor.profileDetail.name}
                                  </h4>
                                  <p className="text-xs md:text-sm text-gray-600">{vendor.profileDetail.name}</p>
                                </div>
                              </div>
                              <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="text-xs md:text-sm">
                              <p className="text-gray-600">Contact:</p>
                              <p className="text-gray-900">{vendor.profileDetail.phone}</p>
                              <p className="text-gray-900">{vendor.email}</p>
                            </div>
                            <div className="text-xs md:text-sm">
                              <p className="text-gray-600">Location:</p>
                              <p className="text-gray-900">
                                {vendor.profileDetail.address
                                  ? `${vendor.profileDetail.address.area}, ${vendor.profileDetail.address.district}, ${vendor.profileDetail.address.state}`
                                  : "N/A"}
                              </p>
                            </div>
                            <div className="text-xs md:text-sm">
                              <p className="text-gray-600">Joined:</p>
                              <p className="text-gray-900">{formatDate(vendor.createdAt)}</p>
                            </div>
                            <div className="flex space-x-2 pt-2">
                              <Button variant="outline" size="sm" className="flex-1 bg-transparent text-xs">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button variant="outline" size="sm" className="text-xs">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                    {!loading && vendors.length === 0 && (
                      <div className="col-span-full text-center text-gray-500 py-8">No vendors found.</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={showEditProductDialog} onOpenChange={setShowEditProductDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>Update product information</DialogDescription>
            </DialogHeader>
            {editingProduct && (
              <EditProductForm
                product={editingProduct}
                onClose={() => setShowEditProductDialog(false)}
                onSuccess={handleEditProductSuccess}
                vendors={vendors}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

function CreateOrderForm({
  onClose,
  onSuccess,
  products,
  operators,
  vendors,
}: {
  onClose: () => void
  onSuccess: () => void
  products: Product[]
  operators: Operator[]
  vendors: Vendor[]
}) {
  const [formData, setFormData] = useState({
    productId: "",
    quantity: 1,
    vendorId: "",
    operatorId: "",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const selectedProduct = products.find((p) => p.productId === formData.productId)

// Update the handleSubmit in CreateOrderForm
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formData.productId || !formData.vendorId || !formData.operatorId || formData.quantity <= 0) {
    toast({
      title: "Invalid Data",
      description: "Please fill in all required fields with valid data.",
      variant: "destructive",
    });
    return;
  }

  try {
    setLoading(true);
    
    const selectedProduct = products.find((p) => p.productId === formData.productId);
    
    await marketplaceApi.createOrder({
      productName: selectedProduct?.name || "Unknown Product",
      quantity: formData.quantity,
      operatorId: formData.operatorId,
      vendorId: formData.vendorId,
      status: "pending",
    });

    onSuccess();
  } catch (error) {
    console.error("Error creating order:", error);
    toast({
      title: "Create Failed",
      description: "Failed to create order. Please try again.",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
}

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="operatorId">Select Operator *</Label>
        <Select value={formData.operatorId} onValueChange={(value) => setFormData({ ...formData, operatorId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Choose operator" />
          </SelectTrigger>
          <SelectContent>
            {operators.map((operator) => (
              <SelectItem key={operator.user_id} value={operator.user_id}>
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <span>{operator.profileDetail.companyName || operator.profileDetail.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="vendorId">Select Vendor *</Label>
        <Select value={formData.vendorId} onValueChange={(value) => setFormData({ ...formData, vendorId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Choose vendor" />
          </SelectTrigger>
          <SelectContent>
            {vendors.map((vendor) => (
              <SelectItem key={vendor.user_id} value={vendor.user_id}>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>{vendor.profileDetail.companyName || vendor.profileDetail.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="productId">Select Product *</Label>
        <Select value={formData.productId} onValueChange={(value) => setFormData({ ...formData, productId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Choose product" />
          </SelectTrigger>
          <SelectContent>
            {products.map((product) => (
              <SelectItem key={product.productId} value={product.productId}>
                <div className="flex items-center justify-between w-full">
                  <span>{product.name}</span>
                  <span className="text-sm text-gray-500">{formatCurrency(product.price)}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="quantity">Quantity *</Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: Number.parseInt(e.target.value) || 1 })}
          required
          disabled={loading}
        />
      </div>

      {selectedProduct && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Order Summary</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Product:</span>
              <span>{selectedProduct.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Unit Price:</span>
              <span>{formatCurrency(selectedProduct.price)}</span>
            </div>
            <div className="flex justify-between">
              <span>Quantity:</span>
              <span>{formData.quantity}</span>
            </div>
            <div className="flex justify-between font-medium border-t pt-1">
              <span>Total:</span>
              <span>{formatCurrency(selectedProduct.price * formData.quantity)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Order"}
        </Button>
      </div>
    </form>
  )
}

function AddProductForm({
  onClose,
  onSuccess,
  vendors,
}: {
  onClose: () => void
  onSuccess: () => void
  vendors: Vendor[]
}) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: 0,
    description: "",
    specifications: "",
    vendorId: "",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

// Update the handleSubmit in AddProductForm
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formData.name || !formData.category || formData.price <= 0 || !formData.vendorId) {
    toast({
      title: "Invalid Data",
      description: "Please fill in all required fields with valid data.",
      variant: "destructive",
    });
    return;
  }

  try {
    setLoading(true);
    
    // Find the selected vendor to get company name
    const selectedVendor = vendors.find(v => v.user_id === formData.vendorId);
    
    await productApi.add({
      itemName: formData.name,
      quantity: 100, // Default stock quantity
      supplier: selectedVendor?.profileDetail.companyName || selectedVendor?.profileDetail.name || "Unknown",
      unitPrice: formData.price,
      category: formData.category,
      brand: selectedVendor?.profileDetail.companyName || selectedVendor?.profileDetail.name || "Unknown",
      description: formData.description,
      specification: formData.specifications,
      ModelNumber: "N/A",
      costPrice: formData.price * 0.8, // 20% margin
      sellingPrice: formData.price,
      role: "admin", // or get from user context
    });

    onSuccess();
  } catch (error) {
    console.error("Error adding product:", error);
    toast({
      title: "Add Failed",
      description: "Failed to add product. Please try again.",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="category">Category *</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) || 0 })}
            required
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="vendorId">Vendor *</Label>
          <Select value={formData.vendorId} onValueChange={(value) => setFormData({ ...formData, vendorId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select vendor" />
            </SelectTrigger>
            <SelectContent>
              {vendors.map((vendor) => (
                <SelectItem key={vendor.user_id} value={vendor.user_id}>
                  {vendor.profileDetail.companyName || vendor.profileDetail.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          disabled={loading}
        />
      </div>

      <div>
        <Label htmlFor="specifications">Specifications (JSON format)</Label>
        <Textarea
          id="specifications"
          value={formData.specifications}
          onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
          placeholder='{"weight": "2kg", "dimensions": "30x20x10cm"}'
          rows={3}
          disabled={loading}
        />
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Product"}
        </Button>
      </div>
    </form>
  )
}

function EditProductForm({
  product,
  onClose,
  onSuccess,
  vendors,
}: {
  product: Product
  onClose: () => void
  onSuccess: () => void
  vendors: Vendor[]
}) {
  const [formData, setFormData] = useState({
    name: product.name || "",
    category: product.category || "",
    price: product.price || 0,
    description: product.description || "",
    specifications: product.specifications ? JSON.stringify(product.specifications, null, 2) : "",
    vendorId: product.vendorId || "",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.category || formData.price <= 0) {
      toast({
        title: "Invalid Data",
        description: "Please fill in all required fields with valid data.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      console.log("[v0] Updating product:", product.productId)

      // Note: This would need to be implemented in the API
      // await productApi.update(product.productId, {
      //   name: formData.name,
      //   category: formData.category,
      //   price: formData.price,
      //   description: formData.description,
      //   specifications: formData.specifications ? JSON.parse(formData.specifications) : {},
      // })

      console.log("[v0] Product updated successfully")
      onSuccess()
    } catch (error) {
      console.error("[v0] Error updating product:", error)
      toast({
        title: "Update Failed",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-name">Product Name *</Label>
          <Input
            id="edit-name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="edit-category">Category *</Label>
          <Input
            id="edit-category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-price">Price *</Label>
          <Input
            id="edit-price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) || 0 })}
            required
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="edit-vendorId">Vendor</Label>
          <Select value={formData.vendorId} onValueChange={(value) => setFormData({ ...formData, vendorId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select vendor" />
            </SelectTrigger>
            <SelectContent>
              {vendors.map((vendor) => (
                <SelectItem key={vendor.user_id} value={vendor.user_id}>
                  {vendor.profileDetail.companyName || vendor.profileDetail.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="edit-description">Description</Label>
        <Textarea
          id="edit-description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          disabled={loading}
        />
      </div>

      <div>
        <Label htmlFor="edit-specifications">Specifications (JSON format)</Label>
        <Textarea
          id="edit-specifications"
          value={formData.specifications}
          onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
          rows={3}
          disabled={loading}
        />
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Product"}
        </Button>
      </div>
    </form>
  )
}
