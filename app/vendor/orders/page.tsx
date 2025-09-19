"use client"

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { ShoppingCart, Search, Eye, Truck, Package, CheckCircle, Clock, AlertTriangle, RefreshCw } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { orderApi } from "@/lib/api"

interface Order {
  orderId: string
  operatorId: string
  operatorName: string
  productName: string
  quantity: number
  amount: number
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  createdAt: string
  updatedAt?: string
  deliveryDate?: string
  trackingId?: string
  shippingAddress?: string
  paymentMethod?: string
  notes?: string
}

interface OrderStats {
  total: number
  pending: number
  confirmed: number
  shipped: number
  delivered: number
  cancelled: number
}

export default function OrdersPage() {
  const [orderList, setOrderList] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  })
  const { toast } = useToast()

  // Calculate order statistics
  const calculateStats = (orders: Order[]): OrderStats => {
    return {
      total: orders.length,
      pending: orders.filter(order => order.status === "pending").length,
      confirmed: orders.filter(order => order.status === "confirmed").length,
      shipped: orders.filter(order => order.status === "shipped").length,
      delivered: orders.filter(order => order.status === "delivered").length,
      cancelled: orders.filter(order => order.status === "cancelled").length,
    }
  }

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await orderApi.getAll()
      
      // Transform API response to match Order interface
      const transformedOrders: Order[] = response.map((order: any) => ({
        orderId: order.orderId || order.id,
        operatorId: order.operatorId,
        operatorName: order.operatorName,
        productName: order.productName,
        quantity: order.quantity,
        amount: order.amount || order.quantity * 500, // Default calculation if amount not provided
        status: order.status || "pending",
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        deliveryDate: order.deliveryDate,
        trackingId: order.trackingId,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod || "Cash on Delivery",
        notes: order.notes
      }))

      setOrderList(transformedOrders)
      setStats(calculateStats(transformedOrders))
      
      console.log("Orders fetched successfully:", transformedOrders)
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  // Filter orders based on search and status
  const filteredOrders = orderList.filter((order) => {
    const matchesSearch =
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.operatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "delivered":
        return <Package className="h-4 w-4" />
      case "cancelled":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  // Handle order status updates
  const handleOrderAction = async (orderId: string, action: string) => {
    try {
      setActionLoading(orderId)
      
      // Determine new status based on action
      let newStatus: Order['status'] = "pending"
      let updates: Partial<Order> = {}

      switch (action) {
        case "accept":
          newStatus = "confirmed"
          break
        case "ship":
          newStatus = "shipped"
          updates.trackingId = `TRK${Date.now()}`
          break
        case "deliver":
          newStatus = "delivered"
          updates.deliveryDate = new Date().toISOString()
          break
        case "cancel":
          newStatus = "cancelled"
          break
        default:
          throw new Error("Invalid action")
      }

      // Update order in API (if API supports it)
      try {
        await orderApi.update(orderId, { status: newStatus, ...updates })
      } catch (apiError) {
        console.warn("API update failed, updating locally:", apiError)
      }

      // Update local state
      const updatedOrders = orderList.map((order) => {
        if (order.orderId === orderId) {
          return {
            ...order,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            ...updates
          }
        }
        return order
      })

      setOrderList(updatedOrders)
      setStats(calculateStats(updatedOrders))

      // Update selected order if it's currently being viewed
      if (selectedOrder && selectedOrder.orderId === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          ...updates
        })
      }

      toast({
        title: "Order Updated",
        description: `Order ${orderId} has been ${action}ed successfully.`,
      })

    } catch (error) {
      console.error("Error updating order:", error)
      toast({
        title: "Error",
        description: `Failed to ${action} order. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailsDialogOpen(true)
  }

  const getOrdersByStatus = (status: string) => {
    return orderList.filter((order) => order.status === status)
  }

  // Render action buttons based on order status
  const renderActionButtons = (order: Order) => {
    const isLoading = actionLoading === order.orderId

    return (
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => viewOrderDetails(order)}
          disabled={isLoading}
        >
          <Eye className="h-4 w-4" />
        </Button>
        
        {order.status === "pending" && (
          <>
            <Button
              size="sm"
              onClick={() => handleOrderAction(order.orderId, "accept")}
              className="bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Accept"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOrderAction(order.orderId, "cancel")}
              className="text-red-600 hover:text-red-700 border-red-200"
              disabled={isLoading}
            >
              Reject
            </Button>
          </>
        )}
        
        {order.status === "confirmed" && (
          <Button
            size="sm"
            onClick={() => handleOrderAction(order.orderId, "ship")}
            className="bg-purple-600 hover:bg-purple-700"
            disabled={isLoading}
          >
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Ship"}
          </Button>
        )}
        
        {order.status === "shipped" && (
          <Button
            size="sm"
            onClick={() => handleOrderAction(order.orderId, "deliver")}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Mark Delivered"}
          </Button>
        )}
      </div>
    )
  }

  // Loading skeleton component
  const OrderTableSkeleton = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex space-x-4 items-center">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
      ))}
    </div>
  )

  return (
    <DashboardLayout title="Vendor Dashboard" description="Overview of your network operations">
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-600">Track and manage all your orders</p>
          </div>
          <Button onClick={fetchOrders} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Order Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.confirmed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shipped</CardTitle>
              <Truck className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.shipped}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <Package className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.delivered}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.cancelled}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
            <CardDescription>View and manage all your orders</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                <TabsTrigger value="confirmed">Confirmed ({stats.confirmed})</TabsTrigger>
                <TabsTrigger value="shipped">Shipped ({stats.shipped})</TabsTrigger>
                <TabsTrigger value="delivered">Delivered ({stats.delivered})</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled ({stats.cancelled})</TabsTrigger>
              </TabsList>

              <div className="mt-4 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search by order ID, operator, or product..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <TabsContent value="all">
                  {loading ? (
                    <OrderTableSkeleton />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Operator</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                              No orders found matching your criteria
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredOrders.map((order) => (
                            <TableRow key={order.orderId}>
                              <TableCell className="font-medium">{order.orderId}</TableCell>
                              <TableCell>{order.operatorName}</TableCell>
                              <TableCell>{order.productName}</TableCell>
                              <TableCell>{order.quantity}</TableCell>
                              <TableCell className="font-medium">{formatCurrency(order.amount)}</TableCell>
                              <TableCell>
                                <Badge className={getOrderStatusColor(order.status)}>
                                  <div className="flex items-center space-x-1">
                                    {getStatusIcon(order.status)}
                                    <span className="capitalize">{order.status}</span>
                                  </div>
                                </Badge>
                              </TableCell>
                              <TableCell>{formatDate(order.createdAt)}</TableCell>
                              <TableCell>
                                {renderActionButtons(order)}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>

                {["pending", "confirmed", "shipped", "delivered", "cancelled"].map((status) => (
                  <TabsContent key={status} value={status}>
                    {loading ? (
                      <OrderTableSkeleton />
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Operator</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getOrdersByStatus(status).length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                                No {status} orders found
                              </TableCell>
                            </TableRow>
                          ) : (
                            getOrdersByStatus(status).map((order) => (
                              <TableRow key={order.orderId}>
                                <TableCell className="font-medium">{order.orderId}</TableCell>
                                <TableCell>{order.operatorName}</TableCell>
                                <TableCell>{order.productName}</TableCell>
                                <TableCell>{order.quantity}</TableCell>
                                <TableCell className="font-medium">{formatCurrency(order.amount)}</TableCell>
                                <TableCell>{formatDate(order.createdAt)}</TableCell>
                                <TableCell>
                                  {renderActionButtons(order)}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Order Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>Complete information about the order</DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Order Information</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Order ID:</span>
                        <span>{selectedOrder.orderId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Operator:</span>
                        <span>{selectedOrder.operatorName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Order Date:</span>
                        <span>{formatDate(selectedOrder.createdAt)}</span>
                      </div>
                      {selectedOrder.updatedAt && (
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Last Updated:</span>
                          <span>{formatDate(selectedOrder.updatedAt)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-600">Status:</span>
                        <Badge className={getOrderStatusColor(selectedOrder.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(selectedOrder.status)}
                            <span className="capitalize">{selectedOrder.status}</span>
                          </div>
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Product:</span>
                        <span>{selectedOrder.productName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Quantity:</span>
                        <span>{selectedOrder.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Amount:</span>
                        <span className="font-semibold">{formatCurrency(selectedOrder.amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Payment:</span>
                        <span>{selectedOrder.paymentMethod}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {(selectedOrder.shippingAddress || selectedOrder.trackingId || selectedOrder.deliveryDate) && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Shipping Information</h4>
                    <div className="space-y-3 text-sm">
                      {selectedOrder.shippingAddress && (
                        <div>
                          <span className="font-medium text-gray-600">Address:</span>
                          <p className="mt-1 text-gray-900">{selectedOrder.shippingAddress}</p>
                        </div>
                      )}
                      {selectedOrder.trackingId && (
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Tracking ID:</span>
                          <span className="font-mono">{selectedOrder.trackingId}</span>
                        </div>
                      )}
                      {selectedOrder.deliveryDate && (
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Delivery Date:</span>
                          <span>{formatDate(selectedOrder.deliveryDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedOrder.notes && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Notes</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                      {selectedOrder.notes}
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  {renderActionButtons(selectedOrder)}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}