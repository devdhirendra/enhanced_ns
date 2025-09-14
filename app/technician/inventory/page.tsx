"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  Package,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle,
  Truck,
  Wrench,
  Router,
  Cable,
  Save,
  Download,
  QrCode,
  FileText,
} from "lucide-react"

// Mock inventory data
const mockInventory = [
  {
    id: "INV-001",
    name: "Fiber Optic Cable",
    category: "cables",
    sku: "FOC-SM-100M",
    currentStock: 15,
    minStock: 10,
    maxStock: 50,
    unit: "meters",
    location: "Van Storage A1",
    lastUpdated: "2024-01-20",
    status: "available",
    cost: 25.5,
    supplier: "FiberTech Solutions",
    description: "Single-mode fiber optic cable for long-distance connections",
  },
  {
    id: "INV-002",
    name: "ONT Device",
    category: "equipment",
    sku: "ONT-GE-001",
    currentStock: 8,
    minStock: 5,
    maxStock: 20,
    unit: "pieces",
    location: "Van Storage B2",
    lastUpdated: "2024-01-19",
    status: "available",
    cost: 85.0,
    supplier: "NetworkPro Ltd",
    description: "Gigabit Ethernet ONT for fiber connections",
  },
  {
    id: "INV-003",
    name: "Router - Dual Band",
    category: "equipment",
    sku: "RTR-DB-AC1200",
    currentStock: 3,
    minStock: 5,
    maxStock: 15,
    unit: "pieces",
    location: "Van Storage C1",
    lastUpdated: "2024-01-18",
    status: "low_stock",
    cost: 65.0,
    supplier: "TechGear Inc",
    description: "AC1200 dual-band wireless router",
  },
  {
    id: "INV-004",
    name: "Ethernet Cable Cat6",
    category: "cables",
    sku: "ETH-CAT6-50M",
    currentStock: 25,
    minStock: 20,
    maxStock: 100,
    unit: "meters",
    location: "Van Storage A2",
    lastUpdated: "2024-01-20",
    status: "available",
    cost: 1.5,
    supplier: "CablePro Solutions",
    description: "Category 6 Ethernet cable for high-speed connections",
  },
  {
    id: "INV-005",
    name: "Splitter 1x8",
    category: "tools",
    sku: "SPL-1X8-SC",
    currentStock: 0,
    minStock: 3,
    maxStock: 10,
    unit: "pieces",
    location: "Van Storage D1",
    lastUpdated: "2024-01-17",
    status: "out_of_stock",
    cost: 15.0,
    supplier: "OpticalParts Co",
    description: "1x8 fiber optic splitter with SC connectors",
  },
]

const inventoryRequests = [
  {
    id: "REQ-001",
    items: [
      { name: "Router - Dual Band", quantity: 5, status: "pending" },
      { name: "Splitter 1x8", quantity: 10, status: "pending" },
    ],
    requestDate: "2024-01-20",
    expectedDate: "2024-01-22",
    status: "pending",
    priority: "high",
  },
  {
    id: "REQ-002",
    items: [{ name: "Fiber Optic Cable", quantity: 100, status: "approved" }],
    requestDate: "2024-01-18",
    expectedDate: "2024-01-21",
    status: "approved",
    priority: "medium",
  },
]

export default function InventoryPage() {
  const [inventory, setInventory] = useState(mockInventory)
  const [requests, setRequests] = useState(inventoryRequests)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [showUsageDialog, setShowUsageDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [usageQuantity, setUsageQuantity] = useState("")
  const [usageReason, setUsageReason] = useState("")
  const [hasChanges, setHasChanges] = useState(false)

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
    const matchesStatus = statusFilter === "all" || item.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800"
      case "low_stock":
        return "bg-yellow-100 text-yellow-800"
      case "out_of_stock":
        return "bg-red-100 text-red-800"
      case "reserved":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "low_stock":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "out_of_stock":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Package className="h-4 w-4 text-gray-600" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "cables":
        return <Cable className="h-4 w-4" />
      case "equipment":
        return <Router className="h-4 w-4" />
      case "tools":
        return <Wrench className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const handleUseItem = () => {
    if (!selectedItem || !usageQuantity || !usageReason) {
      alert("Please fill all required fields")
      return
    }

    const quantity = Number.parseInt(usageQuantity)
    if (quantity > selectedItem.currentStock) {
      alert("Not enough stock available")
      return
    }

    setInventory(
      inventory.map((item) =>
        item.id === selectedItem.id
          ? {
              ...item,
              currentStock: item.currentStock - quantity,
              status:
                item.currentStock - quantity === 0
                  ? "out_of_stock"
                  : item.currentStock - quantity <= item.minStock
                    ? "low_stock"
                    : "available",
            }
          : item,
      ),
    )

    setHasChanges(true)
    setShowUsageDialog(false)
    setUsageQuantity("")
    setUsageReason("")
    setSelectedItem(null)
  }

  const handleRequestStock = (itemId: string, quantity: number) => {
    // Add to requests logic here
    console.log("Requesting stock for item:", itemId, "quantity:", quantity)
    setHasChanges(true)
  }

  const handleApplyChanges = () => {
    console.log("Applying inventory changes:", inventory)
    setHasChanges(false)
  }

  const inventoryStats = {
    totalItems: inventory.length,
    available: inventory.filter((i) => i.status === "available").length,
    lowStock: inventory.filter((i) => i.status === "low_stock").length,
    outOfStock: inventory.filter((i) => i.status === "out_of_stock").length,
    totalValue: inventory.reduce((acc, item) => acc + item.currentStock * item.cost, 0),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Inventory</h1>
          <p className="text-gray-500">Manage your field inventory and stock levels</p>
        </div>
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <Button onClick={handleApplyChanges} className="bg-orange-600 hover:bg-orange-700">
              <Save className="h-4 w-4 mr-2" />
              Apply Changes
            </Button>
          )}
          <Button variant="outline">
            <QrCode className="h-4 w-4 mr-2" />
            Scan QR
          </Button>
          <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Truck className="h-4 w-4 mr-2" />
                Request Stock
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Stock</DialogTitle>
                <DialogDescription>Request additional inventory items</DialogDescription>
              </DialogHeader>
              <StockRequestForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Total Items</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{inventoryStats.totalItems}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Available</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{inventoryStats.available}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{inventoryStats.lowStock}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{inventoryStats.outOfStock}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Value</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">₹{inventoryStats.totalValue.toFixed(0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Inventory List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <CardTitle>Inventory Items</CardTitle>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full md:w-64"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="cables">Cables</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="tools">Tools</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredInventory.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300 bg-gradient-to-r from-white to-gray-50"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-3 mb-3">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(item.category)}
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="capitalize">
                        {item.category}
                      </Badge>
                      <Badge className="bg-gray-100 text-gray-800">{item.sku}</Badge>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <p>{item.description}</p>
                    <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-4">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4" />
                        <span>
                          Stock: {item.currentStock} {item.unit}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>Min: {item.minStock}</span>
                        <span>Max: {item.maxStock}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>Location: {item.location}</span>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-4">
                      <div className="flex items-center space-x-2">
                        <span>Cost: ₹{item.cost}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>Supplier: {item.supplier}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>Updated: {item.lastUpdated}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 lg:ml-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(item.status)}
                    <Badge className={getStatusColor(item.status)}>{item.status.replace("_", " ").toUpperCase()}</Badge>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {item.currentStock > 0 && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedItem(item)
                          setShowUsageDialog(true)
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Minus className="h-4 w-4 mr-1" />
                        Use
                      </Button>
                    )}

                    {(item.status === "low_stock" || item.status === "out_of_stock") && (
                      <Button size="sm" onClick={() => handleRequestStock(item.id, item.minStock)} variant="outline">
                        <Plus className="h-4 w-4 mr-1" />
                        Request
                      </Button>
                    )}

                    <Button size="sm" variant="outline">
                      <QrCode className="h-4 w-4 mr-1" />
                      QR
                    </Button>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{item.name} - Details</DialogTitle>
                          <DialogDescription>Complete item information and history</DialogDescription>
                        </DialogHeader>
                        <ItemDetailsModal item={item} />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Stock Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Stock Requests</CardTitle>
          <CardDescription>Track your inventory requests and deliveries</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-white to-gray-50"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="font-medium text-gray-900">Request {request.id}</h3>
                    <Badge
                      className={
                        request.status === "approved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {request.status.toUpperCase()}
                    </Badge>
                    <Badge
                      className={request.priority === "high" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}
                    >
                      {request.priority.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {request.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>{item.name}</span>
                        <div className="flex items-center space-x-2">
                          <span>Qty: {item.quantity}</span>
                          <Badge
                            variant="outline"
                            className={item.status === "approved" ? "text-green-600" : "text-yellow-600"}
                          >
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-gray-500 mt-3">
                    <span>Requested: {request.requestDate}</span>
                    <span>Expected: {request.expectedDate}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Usage Dialog */}
      <Dialog open={showUsageDialog} onOpenChange={setShowUsageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Use Inventory Item</DialogTitle>
            <DialogDescription>Record usage of {selectedItem?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="quantity">Quantity to Use *</Label>
              <Input
                id="quantity"
                type="number"
                value={usageQuantity}
                onChange={(e) => setUsageQuantity(e.target.value)}
                placeholder="Enter quantity"
                max={selectedItem?.currentStock}
              />
              <p className="text-xs text-gray-500 mt-1">
                Available: {selectedItem?.currentStock} {selectedItem?.unit}
              </p>
            </div>
            <div>
              <Label htmlFor="reason">Usage Reason *</Label>
              <Textarea
                id="reason"
                value={usageReason}
                onChange={(e) => setUsageReason(e.target.value)}
                placeholder="Describe why this item is being used..."
                rows={3}
              />
            </div>
            <Button onClick={handleUseItem} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Record Usage
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Stock Request Form Component
function StockRequestForm() {
  const [requestItems, setRequestItems] = useState([{ name: "", quantity: "", priority: "medium" }])
  const [hasChanges, setHasChanges] = useState(false)

  const addItem = () => {
    setRequestItems([...requestItems, { name: "", quantity: "", priority: "medium" }])
    setHasChanges(true)
  }

  const removeItem = (index: number) => {
    setRequestItems(requestItems.filter((_, i) => i !== index))
    setHasChanges(true)
  }

  const updateItem = (index: number, field: string, value: string) => {
    const updated = requestItems.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    setRequestItems(updated)
    setHasChanges(true)
  }

  const handleSubmit = () => {
    console.log("Submitting stock request:", requestItems)
    setHasChanges(false)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {requestItems.map((item, index) => (
          <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Input
                placeholder="Item name"
                value={item.name}
                onChange={(e) => updateItem(index, "name", e.target.value)}
              />
            </div>
            <div className="w-24">
              <Input
                type="number"
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) => updateItem(index, "quantity", e.target.value)}
              />
            </div>
            <div className="w-32">
              <Select value={item.priority} onValueChange={(value) => updateItem(index, "priority", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" variant="outline" onClick={() => removeItem(index)} disabled={requestItems.length === 1}>
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={addItem}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
        {hasChanges && (
          <Button onClick={handleSubmit}>
            <Save className="h-4 w-4 mr-2" />
            Submit Request
          </Button>
        )}
      </div>
    </div>
  )
}

// Item Details Modal Component
function ItemDetailsModal({ item }: { item: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <Label className="font-medium">SKU</Label>
          <p className="text-gray-600">{item.sku}</p>
        </div>
        <div>
          <Label className="font-medium">Category</Label>
          <p className="text-gray-600 capitalize">{item.category}</p>
        </div>
        <div>
          <Label className="font-medium">Current Stock</Label>
          <p className="text-gray-600">
            {item.currentStock} {item.unit}
          </p>
        </div>
        <div>
          <Label className="font-medium">Unit Cost</Label>
          <p className="text-gray-600">₹{item.cost}</p>
        </div>
        <div>
          <Label className="font-medium">Min Stock</Label>
          <p className="text-gray-600">
            {item.minStock} {item.unit}
          </p>
        </div>
        <div>
          <Label className="font-medium">Max Stock</Label>
          <p className="text-gray-600">
            {item.maxStock} {item.unit}
          </p>
        </div>
        <div>
          <Label className="font-medium">Location</Label>
          <p className="text-gray-600">{item.location}</p>
        </div>
        <div>
          <Label className="font-medium">Supplier</Label>
          <p className="text-gray-600">{item.supplier}</p>
        </div>
      </div>

      <div>
        <Label className="font-medium">Description</Label>
        <p className="text-gray-600 mt-1">{item.description}</p>
      </div>

      <div>
        <Label className="font-medium">Last Updated</Label>
        <p className="text-gray-600">{item.lastUpdated}</p>
      </div>

      <div className="pt-4 border-t">
        <Label className="font-medium">Total Value</Label>
        <p className="text-lg font-bold text-green-600">₹{(item.currentStock * item.cost).toFixed(2)}</p>
      </div>
    </div>
  )
}
