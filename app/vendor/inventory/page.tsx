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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Package, Search, Edit, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { inventoryApi } from "@/lib/api"

interface InventoryItem {
  id: string
  productName: string
  sku: string
  category: string
  currentStock: number
  minStockLevel: number
  maxStockLevel: number
  unitPrice: number
  totalValue: number
  location: string
  supplier: string
  lastRestocked: string
  status: "in-stock" | "low-stock" | "out-of-stock" | "overstocked"
}


export default function VendorInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [adjustmentQuantity, setAdjustmentQuantity] = useState("")
  const [adjustmentType, setAdjustmentType] = useState<"add" | "remove">("add")
  const [adjustmentReason, setAdjustmentReason] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    inventoryApi
      .getAllProducts()
      .then((res) => {
        setInventory(res)
      })
      .catch((err) => {
        console.error("Error fetching inventory:", err)
        // Mock data for development
        setInventory([
          {
            id: "INV001",
            productName: "TP-Link AC1200 Router",
            sku: "TPL-AC1200",
            category: "Routers",
            currentStock: 45,
            minStockLevel: 10,
            maxStockLevel: 100,
            unitPrice: 3500,
            totalValue: 157500,
            location: "Warehouse A-1",
            supplier: "TP-Link India",
            lastRestocked: "2024-01-10T00:00:00Z",
            status: "in-stock",
          },
          {
            id: "INV002",
            productName: "Fiber Optic Cable 2km",
            sku: "FOC-2KM",
            category: "Cables",
            currentStock: 8,
            minStockLevel: 15,
            maxStockLevel: 50,
            unitPrice: 2800,
            totalValue: 22400,
            location: "Warehouse B-2",
            supplier: "Sterlite Tech",
            lastRestocked: "2024-01-05T00:00:00Z",
            status: "low-stock",
          },
          {
            id: "INV003",
            productName: "GPON ONU Device",
            sku: "GPON-ONU",
            category: "ONUs",
            currentStock: 0,
            minStockLevel: 5,
            maxStockLevel: 30,
            unitPrice: 4200,
            totalValue: 0,
            location: "Warehouse A-3",
            supplier: "Huawei",
            lastRestocked: "2023-12-20T00:00:00Z",
            status: "out-of-stock",
          },
        ])
      })
  }, [])

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    const matchesStatus = selectedStatus === "all" || item.status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-stock":
        return "bg-green-100 text-green-800"
      case "low-stock":
        return "bg-yellow-100 text-yellow-800"
      case "out-of-stock":
        return "bg-red-100 text-red-800"
      case "overstocked":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in-stock":
        return <Package className="h-4 w-4" />
      case "low-stock":
        return <TrendingDown className="h-4 w-4" />
      case "out-of-stock":
        return <AlertTriangle className="h-4 w-4" />
      case "overstocked":
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const handleStockAdjustment = (item: InventoryItem) => {
    setSelectedItem(item)
    setIsAdjustDialogOpen(true)
  }

  const processStockAdjustment = () => {
    if (!selectedItem || !adjustmentQuantity) return

    const quantity = Number.parseInt(adjustmentQuantity)
    const newStock =
      adjustmentType === "add" ? selectedItem.currentStock + quantity : selectedItem.currentStock - quantity

    // Determine new status based on stock levels
    let newStatus: InventoryItem["status"] = "in-stock"
    if (newStock === 0) newStatus = "out-of-stock"
    else if (newStock < selectedItem.minStockLevel) newStatus = "low-stock"
    else if (newStock > selectedItem.maxStockLevel) newStatus = "overstocked"

    const updatedInventory = inventory.map((item) =>
      item.id === selectedItem.id
        ? {
            ...item,
            currentStock: Math.max(0, newStock),
            totalValue: Math.max(0, newStock) * item.unitPrice,
            status: newStatus,
          }
        : item,
    )

    setInventory(updatedInventory)
    setIsAdjustDialogOpen(false)
    setAdjustmentQuantity("")
    setAdjustmentReason("")

    toast({
      title: "Stock Adjusted",
      description: `${selectedItem.productName} stock has been ${adjustmentType === "add" ? "increased" : "decreased"} by ${quantity} units.`,
    })
  }

  const getInventoryByStatus = (status: string) => {
    return inventory.filter((item) => item.status === status)
  }

  const getTotalInventoryValue = () => {
    return inventory.reduce((total, item) => total + item.totalValue, 0)
  }

  return (
        <DashboardLayout title="Vendor Dashboard" description="Overview of your network operations">
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Track and manage your product inventory</p>
        </div>
      </div>

      {/* Inventory Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getInventoryByStatus("low-stock").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getInventoryByStatus("out-of-stock").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overstocked</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getInventoryByStatus("overstocked").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(getTotalInventoryValue())}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>Manage your product inventory and stock levels</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All Items</TabsTrigger>
              <TabsTrigger value="in-stock">In Stock</TabsTrigger>
              <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
              <TabsTrigger value="out-of-stock">Out of Stock</TabsTrigger>
              <TabsTrigger value="overstocked">Overstocked</TabsTrigger>
            </TabsList>

            <div className="mt-4 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search inventory..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Routers">Routers</SelectItem>
                    <SelectItem value="Cables">Cables</SelectItem>
                    <SelectItem value="ONUs">ONUs</SelectItem>
                    <SelectItem value="Switches">Switches</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                    <SelectItem value="low-stock">Low Stock</SelectItem>
                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                    <SelectItem value="overstocked">Overstocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <TabsContent value="all">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Min/Max</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{item.productName}</div>
                            <div className="text-sm text-gray-500">Location: {item.location}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.category}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{item.currentStock}</TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {item.minStockLevel} / {item.maxStockLevel}
                        </TableCell>
                        <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(item.totalValue)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(item.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(item.status)}
                              <span>{item.status.replace("-", " ")}</span>
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleStockAdjustment(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              {["in-stock", "low-stock", "out-of-stock", "overstocked"].map((status) => (
                <TabsContent key={status} value={status}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Min/Max</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total Value</TableHead>
                        <TableHead>Last Restocked</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getInventoryByStatus(status).map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{item.productName}</div>
                              <div className="text-sm text-gray-500">Location: {item.location}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                          <TableCell className="font-medium">{item.currentStock}</TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {item.minStockLevel} / {item.maxStockLevel}
                          </TableCell>
                          <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell className="font-medium">{formatCurrency(item.totalValue)}</TableCell>
                          <TableCell>{formatDate(item.lastRestocked)}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={() => handleStockAdjustment(item)}>
                              <Edit className="h-4 w-4" />
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

      {/* Stock Adjustment Dialog */}
      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>Update inventory levels for {selectedItem?.productName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Stock: {selectedItem?.currentStock}</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="adjustmentType">Adjustment Type</Label>
              <Select value={adjustmentType} onValueChange={(value: "add" | "remove") => setAdjustmentType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add Stock</SelectItem>
                  <SelectItem value="remove">Remove Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={adjustmentQuantity}
                onChange={(e) => setAdjustmentQuantity(e.target.value)}
                placeholder="Enter quantity"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Select value={adjustmentReason} onValueChange={setAdjustmentReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restock">Restock</SelectItem>
                  <SelectItem value="sale">Sale</SelectItem>
                  <SelectItem value="damage">Damage</SelectItem>
                  <SelectItem value="return">Return</SelectItem>
                  <SelectItem value="correction">Stock Correction</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAdjustDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={processStockAdjustment} className="bg-blue-600 hover:bg-blue-700">
              Update Stock
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </DashboardLayout>
  )
}
