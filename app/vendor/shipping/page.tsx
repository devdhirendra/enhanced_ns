"use client"

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Truck, Package, MapPin, Clock, CheckCircle, AlertTriangle, Plus, Search, Eye } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { shippingApi } from "@/lib/api"

interface Shipment {
  id: string
  orderId: string
  customerName: string
  customerAddress: string
  items: string
  quantity: number
  weight: number
  dimensions: string
  shippingMethod: string
  carrier: string
  trackingNumber: string
  status: "pending" | "picked-up" | "in-transit" | "out-for-delivery" | "delivered" | "exception"
  estimatedDelivery: string
  actualDelivery?: string
  shippingCost: number
  createdAt: string
  notes?: string
}

export default function VendorShippingPage() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedCarrier, setSelectedCarrier] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { toast } = useToast()

  const [newShipment, setNewShipment] = useState({
    orderId: "",
    customerName: "",
    customerAddress: "",
    items: "",
    quantity: "",
    weight: "",
    dimensions: "",
    shippingMethod: "standard",
    carrier: "bluedart",
    notes: "",
  })

  useEffect(() => {
    shippingApi
      .getAll()
      .then((res) => {
        setShipments(res)
      })
      .catch((err) => {
        console.error("Error fetching shipments:", err)
        // Mock data for development
        setShipments([
          {
            id: "SHP001",
            orderId: "ORD001",
            customerName: "Rajesh Kumar",
            customerAddress: "123 MG Road, Bangalore, Karnataka 560001",
            items: "TP-Link AC1200 Router",
            quantity: 2,
            weight: 1.5,
            dimensions: "30x20x10 cm",
            shippingMethod: "express",
            carrier: "bluedart",
            trackingNumber: "BD123456789",
            status: "in-transit",
            estimatedDelivery: "2024-01-16T00:00:00Z",
            shippingCost: 150,
            createdAt: "2024-01-14T10:00:00Z",
            notes: "Fragile items - handle with care",
          },
          {
            id: "SHP002",
            orderId: "ORD002",
            customerName: "Priya Sharma",
            customerAddress: "456 Park Street, Mumbai, Maharashtra 400001",
            items: "Fiber Optic Cable 2km",
            quantity: 1,
            weight: 5.0,
            dimensions: "100x15x15 cm",
            shippingMethod: "standard",
            carrier: "delhivery",
            trackingNumber: "DL987654321",
            status: "delivered",
            estimatedDelivery: "2024-01-15T00:00:00Z",
            actualDelivery: "2024-01-15T14:30:00Z",
            shippingCost: 200,
            createdAt: "2024-01-12T09:00:00Z",
          },
        ])
      })
  }, [])

  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch =
      shipment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || shipment.status === selectedStatus
    const matchesCarrier = selectedCarrier === "all" || shipment.carrier === selectedCarrier
    return matchesSearch && matchesStatus && matchesCarrier
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "picked-up":
        return "bg-blue-100 text-blue-800"
      case "in-transit":
        return "bg-purple-100 text-purple-800"
      case "out-for-delivery":
        return "bg-orange-100 text-orange-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "exception":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "picked-up":
        return <Package className="h-4 w-4" />
      case "in-transit":
        return <Truck className="h-4 w-4" />
      case "out-for-delivery":
        return <MapPin className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      case "exception":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const handleCreateShipment = () => {
    const shipment: Shipment = {
      id: `SHP${String(shipments.length + 1).padStart(3, "0")}`,
      orderId: newShipment.orderId,
      customerName: newShipment.customerName,
      customerAddress: newShipment.customerAddress,
      items: newShipment.items,
      quantity: Number.parseInt(newShipment.quantity),
      weight: Number.parseFloat(newShipment.weight),
      dimensions: newShipment.dimensions,
      shippingMethod: newShipment.shippingMethod,
      carrier: newShipment.carrier,
      trackingNumber: `${newShipment.carrier.toUpperCase()}${Date.now()}`,
      status: "pending",
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      shippingCost: newShipment.shippingMethod === "express" ? 200 : 100,
      createdAt: new Date().toISOString(),
      notes: newShipment.notes,
    }

    setShipments([...shipments, shipment])
    setNewShipment({
      orderId: "",
      customerName: "",
      customerAddress: "",
      items: "",
      quantity: "",
      weight: "",
      dimensions: "",
      shippingMethod: "standard",
      carrier: "bluedart",
      notes: "",
    })
    setIsCreateDialogOpen(false)

    toast({
      title: "Shipment Created",
      description: `Shipment ${shipment.id} has been created with tracking number ${shipment.trackingNumber}.`,
    })
  }

  const updateShipmentStatus = (shipmentId: string, newStatus: Shipment["status"]) => {
    const updatedShipments = shipments.map((shipment) =>
      shipment.id === shipmentId
        ? {
            ...shipment,
            status: newStatus,
            actualDelivery: newStatus === "delivered" ? new Date().toISOString() : shipment.actualDelivery,
          }
        : shipment,
    )
    setShipments(updatedShipments)

    toast({
      title: "Status Updated",
      description: `Shipment ${shipmentId} status updated to ${newStatus.replace("-", " ")}.`,
    })
  }

  const getShipmentsByStatus = (status: string) => {
    return shipments.filter((shipment) => shipment.status === status)
  }

  const getTotalShippingCost = () => {
    return shipments.reduce((total, shipment) => total + shipment.shippingCost, 0)
  }

  return (
        <DashboardLayout title="Vendor Dashboard" description="Overview of your network operations">

    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shipping Management</h1>
          <p className="text-gray-600">Track and manage your shipments</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Shipment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Shipment</DialogTitle>
              <DialogDescription>Create a new shipment for order fulfillment</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orderId">Order ID</Label>
                  <Input
                    id="orderId"
                    value={newShipment.orderId}
                    onChange={(e) => setNewShipment({ ...newShipment, orderId: e.target.value })}
                    placeholder="ORD001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={newShipment.customerName}
                    onChange={(e) => setNewShipment({ ...newShipment, customerName: e.target.value })}
                    placeholder="Customer name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerAddress">Customer Address</Label>
                <Input
                  id="customerAddress"
                  value={newShipment.customerAddress}
                  onChange={(e) => setNewShipment({ ...newShipment, customerAddress: e.target.value })}
                  placeholder="Complete shipping address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="items">Items</Label>
                  <Input
                    id="items"
                    value={newShipment.items}
                    onChange={(e) => setNewShipment({ ...newShipment, items: e.target.value })}
                    placeholder="Product description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newShipment.quantity}
                    onChange={(e) => setNewShipment({ ...newShipment, quantity: e.target.value })}
                    placeholder="1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={newShipment.weight}
                    onChange={(e) => setNewShipment({ ...newShipment, weight: e.target.value })}
                    placeholder="1.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dimensions">Dimensions (LxWxH cm)</Label>
                  <Input
                    id="dimensions"
                    value={newShipment.dimensions}
                    onChange={(e) => setNewShipment({ ...newShipment, dimensions: e.target.value })}
                    placeholder="30x20x10"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shippingMethod">Shipping Method</Label>
                  <Select
                    value={newShipment.shippingMethod}
                    onValueChange={(value) => setNewShipment({ ...newShipment, shippingMethod: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard (3-5 days)</SelectItem>
                      <SelectItem value="express">Express (1-2 days)</SelectItem>
                      <SelectItem value="overnight">Overnight</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carrier">Carrier</Label>
                  <Select
                    value={newShipment.carrier}
                    onValueChange={(value) => setNewShipment({ ...newShipment, carrier: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bluedart">Blue Dart</SelectItem>
                      <SelectItem value="delhivery">Delhivery</SelectItem>
                      <SelectItem value="fedex">FedEx</SelectItem>
                      <SelectItem value="dtdc">DTDC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={newShipment.notes}
                  onChange={(e) => setNewShipment({ ...newShipment, notes: e.target.value })}
                  placeholder="Special handling instructions"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateShipment} className="bg-blue-600 hover:bg-blue-700">
                Create Shipment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Shipping Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shipments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getShipmentsByStatus("pending").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getShipmentsByStatus("in-transit").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out for Delivery</CardTitle>
            <MapPin className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getShipmentsByStatus("out-for-delivery").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getShipmentsByStatus("delivered").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <Truck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(getTotalShippingCost())}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shipment Tracking</CardTitle>
          <CardDescription>Monitor all your shipments and their delivery status</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="picked-up">Picked Up</TabsTrigger>
              <TabsTrigger value="in-transit">In Transit</TabsTrigger>
              <TabsTrigger value="out-for-delivery">Out for Delivery</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
              <TabsTrigger value="exception">Exception</TabsTrigger>
            </TabsList>

            <div className="mt-4 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search shipments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCarrier} onValueChange={setSelectedCarrier}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by carrier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Carriers</SelectItem>
                    <SelectItem value="bluedart">Blue Dart</SelectItem>
                    <SelectItem value="delhivery">Delhivery</SelectItem>
                    <SelectItem value="fedex">FedEx</SelectItem>
                    <SelectItem value="dtdc">DTDC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <TabsContent value="all">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shipment ID</TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Carrier</TableHead>
                      <TableHead>Tracking</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Est. Delivery</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredShipments.map((shipment) => (
                      <TableRow key={shipment.id}>
                        <TableCell className="font-medium">{shipment.id}</TableCell>
                        <TableCell>{shipment.orderId}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{shipment.customerName}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{shipment.customerAddress}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{shipment.items}</div>
                            <div className="text-sm text-gray-500">Qty: {shipment.quantity}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{shipment.carrier.toUpperCase()}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{shipment.trackingNumber}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(shipment.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(shipment.status)}
                              <span>{shipment.status.replace("-", " ")}</span>
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(shipment.estimatedDelivery)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {shipment.status !== "delivered" && (
                              <Select
                                value={shipment.status}
                                onValueChange={(value: Shipment["status"]) => updateShipmentStatus(shipment.id, value)}
                              >
                                <SelectTrigger className="w-[120px] h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="picked-up">Picked Up</SelectItem>
                                  <SelectItem value="in-transit">In Transit</SelectItem>
                                  <SelectItem value="out-for-delivery">Out for Delivery</SelectItem>
                                  <SelectItem value="delivered">Delivered</SelectItem>
                                  <SelectItem value="exception">Exception</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              {["pending", "picked-up", "in-transit", "out-for-delivery", "delivered", "exception"].map((status) => (
                <TabsContent key={status} value={status}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Shipment ID</TableHead>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Carrier</TableHead>
                        <TableHead>Tracking</TableHead>
                        <TableHead>Est. Delivery</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getShipmentsByStatus(status).map((shipment) => (
                        <TableRow key={shipment.id}>
                          <TableCell className="font-medium">{shipment.id}</TableCell>
                          <TableCell>{shipment.orderId}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{shipment.customerName}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{shipment.customerAddress}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{shipment.items}</div>
                              <div className="text-sm text-gray-500">Qty: {shipment.quantity}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{shipment.carrier.toUpperCase()}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{shipment.trackingNumber}</TableCell>
                          <TableCell>{formatDate(shipment.estimatedDelivery)}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  )
}
