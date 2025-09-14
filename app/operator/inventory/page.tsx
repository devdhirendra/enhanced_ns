"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Plus,
  Search,
  Eye,
  Edit,
  Package,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Users,
  Calendar,
  Download,
  Boxes,
  Cable,
  Router,
  Wrench,
  RefreshCw,
} from "lucide-react"
import { apiClient, inventoryApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface InventoryItem {
  id: string
  itemName: string
  quantity: number
  supplier: string
  unitPrice: number
  category: string
  brand: string
  phoneNumber?: string
  description?: string
  specification?: string
  ModelNumber?: string
  costPrice?: number
  sellingPrice?: number
  ProductImage?: string
  warantyInfo?: string
  discount?: string
  rating?: number
  unitType: string
  sold?: number
  status: string
  createdAt: string
  updatedAt: string
}

interface Issuance {
  IssueID: string
  OperatorID: string
  OperatorName: string
  Items: Array<{
    itemId: string
    itemName: string
    quantity: number
    unitPrice: number
    amount: number
  }>
  TotalAmount: number
  Date: string
  Status: string
}

interface Technician {
  user_id: string
  email: string
  profileDetail: {
    name: string
    phone: string
    technicianId?: string
  }
  role: string
  createdAt: string
  updatedAt: string
}

interface NewItem {
  itemName: string
  quantity: number
  supplier: string
  unitPrice: number
  category: string
  brand: string
  phoneNumber: string
  description: string
  specification: string
  ModelNumber: string
  costPrice: number
  sellingPrice: number
  ProductImage: string
  warantyInfo: string
  discount: string
  rating: number
  unitType: string
  sold: number
  status: string
  role: string
}

interface NewIssuance {
  operatorId: string
  items: Array<{
    itemId: string
    quantity: number
  }>
}

const inventoryCategories = [
  { id: "CAT001", name: "OFC Cable", description: "Optical Fiber Cables", unit: "KM", icon: Cable },
  { id: "CAT002", name: "ONUs & Routers", description: "Customer Premise Equipment", unit: "Nos", icon: Router },
  { id: "CAT003", name: "Patch Cords", description: "Fiber Patch Cables", unit: "Nos", icon: Cable },
  { id: "CAT004", name: "Splicing Tools", description: "Installation Tools", unit: "Sets", icon: Wrench },
  { id: "CAT005", name: "T-Boxes & Couplers", description: "Junction Equipment", unit: "Nos", icon: Boxes },
]

export default function InventoryManagement() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [categories, setCategories] = useState(inventoryCategories)
  const [issuances, setIssuances] = useState<Issuance[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false)
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false)
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const [newItem, setNewItem] = useState<NewItem>({
    itemName: "",
    quantity: 0,
    supplier: "",
    unitPrice: 0,
    category: "",
    brand: "",
    phoneNumber: "",
    description: "",
    specification: "",
    ModelNumber: "",
    costPrice: 0,
    sellingPrice: 0,
    ProductImage: "",
    warantyInfo: "",
    discount: "",
    rating: 0,
    unitType: "Nos",
    sold: 0,
    status: "Available",
    role: "Operator",
  })

  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    unit: "Nos",
  })

  const [newIssuance, setNewIssuance] = useState<NewIssuance>({
    operatorId: "1000", // Default operator ID - should be dynamic in real app
    items: [],
  })

  const fetchInventoryData = async () => {
    try {
      setLoading(true)
      console.log("[v0] Fetching inventory data from API...")

      const [inventoryData, issuanceData, technicianData] = await Promise.all([
        inventoryApi.getAllProducts(),
        inventoryApi.getAllIssuances(),
        inventoryApi.getalltechnician(),
      ])

      console.log("[v0] Inventory items fetched:", inventoryData.length)
      console.log("[v0] Issuances fetched:", issuanceData.length)
      console.log("[v0] Technicians fetched:", technicianData.length)

      setInventory(Array.isArray(inventoryData) ? inventoryData : [])
      setIssuances(Array.isArray(issuanceData) ? issuanceData : [])
      setTechnicians(Array.isArray(technicianData) ? technicianData : [])

      toast({
        title: "Data Loaded",
        description: "Inventory data loaded successfully!",
      })
    } catch (error) {
      console.error("[v0] Error fetching inventory data:", error)
      toast({
        title: "Error Loading Data",
        description: "Failed to load inventory data. Please try again.",
        variant: "destructive",
      })
      // Keep empty arrays on error
      setInventory([])
      setIssuances([])
      setTechnicians([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventoryData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "bg-green-100 text-green-800"
      case "low_stock":
        return "bg-yellow-100 text-yellow-800"
      case "out_of_stock":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity === 0) return "out_of_stock"
    if (item.quantity <= 10) return "low_stock" // Using 10 as default threshold
    return "available"
  }

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
    const matchesStatus = statusFilter === "all" || getStockStatus(item) === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleAddItem = async () => {
    try {
      console.log("[v0] Adding new inventory item:", newItem)

      await apiClient.addStockItem(newItem)

      toast({
        title: "Item Added",
        description: "New inventory item has been added successfully!",
      })

      // Reset form and refresh data
      setNewItem({
        itemName: "",
        quantity: 0,
        supplier: "",
        unitPrice: 0,
        category: "",
        brand: "",
        phoneNumber: "",
        description: "",
        specification: "",
        ModelNumber: "",
        costPrice: 0,
        sellingPrice: 0,
        ProductImage: "",
        warantyInfo: "",
        discount: "",
        rating: 0,
        unitType: "Nos",
        sold: 0,
        status: "Available",
        role: "Operator",
      })
      setIsAddItemDialogOpen(false)
      fetchInventoryData()
    } catch (error) {
      console.error("[v0] Error adding inventory item:", error)
      toast({
        title: "Add Failed",
        description: "Failed to add inventory item. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddCategory = () => {
    const category = {
      id: `CAT${String(categories.length + 1).padStart(3, "0")}`,
      name: newCategory.name,
      description: newCategory.description,
      unit: newCategory.unit,
      icon: Package,
    }
    setCategories([...categories, category])
    setNewCategory({
      name: "",
      description: "",
      unit: "Nos",
    })
    setIsAddCategoryDialogOpen(false)
    toast({
      title: "Category Added",
      description: "New category has been added successfully!",
    })
  }

  const handleIssueItem = async () => {
    try {
      console.log("[v0] Issuing inventory items:", newIssuance)

      await apiClient.issueStockToOperator(newIssuance)

      toast({
        title: "Items Issued",
        description: "Items have been issued successfully!",
      })

      // Reset form and refresh data
      setNewIssuance({
        operatorId: "1000",
        items: [],
      })
      setIsIssueDialogOpen(false)
      fetchInventoryData()
    } catch (error) {
      console.error("[v0] Error issuing items:", error)
      toast({
        title: "Issue Failed",
        description: "Failed to issue items. Please try again.",
        variant: "destructive",
      })
    }
  }

  const lowStockItems = inventory.filter((item) => getStockStatus(item) === "low_stock")
  const outOfStockItems = inventory.filter((item) => getStockStatus(item) === "out_of_stock")

  const inventoryStats = {
    totalItems: inventory.length,
    totalValue: inventory.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    lowStockItems: lowStockItems.length,
    outOfStockItems: outOfStockItems.length,
    totalCategories: categories.length,
    monthlyConsumption: issuances.reduce((sum, issuance) => sum + issuance.TotalAmount, 0),
    pendingOrders: issuances.filter((issuance) => issuance.Status === "pending").length,
    lastRestockDate:
      inventory.length > 0
        ? new Date(Math.max(...inventory.map((item) => new Date(item.updatedAt).getTime()))).toISOString().split("T")[0]
        : "N/A",
  }

  return (
    <DashboardLayout title="Inventory Management" description="Track and manage network equipment and materials">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={fetchInventoryData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
          <div className="flex space-x-3">
            <Dialog open={isIssueDialogOpen} onOpenChange={setIsIssueDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Issue Items
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Issue Inventory Items</DialogTitle>
                  <DialogDescription>Issue items to technicians for field work</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Select Items to Issue</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {inventory
                        .filter((item) => item.quantity > 0)
                        .map((item) => (
                          <div key={item.id} className="flex items-center space-x-2 p-2 border rounded">
                            <input
                              type="checkbox"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewIssuance({
                                    ...newIssuance,
                                    items: [...newIssuance.items, { itemId: item.id, quantity: 1 }],
                                  })
                                } else {
                                  setNewIssuance({
                                    ...newIssuance,
                                    items: newIssuance.items.filter((i) => i.itemId !== item.id),
                                  })
                                }
                              }}
                            />
                            <div className="flex-1">
                              <div className="font-medium">{item.itemName}</div>
                              <div className="text-sm text-gray-500">
                                Available: {item.quantity} {item.unitType}
                              </div>
                            </div>
                            {newIssuance.items.find((i) => i.itemId === item.id) && (
                              <Input
                                type="number"
                                min="1"
                                max={item.quantity}
                                className="w-20"
                                value={newIssuance.items.find((i) => i.itemId === item.id)?.quantity || 1}
                                onChange={(e) => {
                                  const quantity = Number.parseInt(e.target.value) || 1
                                  setNewIssuance({
                                    ...newIssuance,
                                    items: newIssuance.items.map((i) =>
                                      i.itemId === item.id ? { ...i, quantity } : i,
                                    ),
                                  })
                                }}
                              />
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsIssueDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleIssueItem}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={newIssuance.items.length === 0}
                  >
                    Issue Items
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Inventory Item</DialogTitle>
                  <DialogDescription>Add a new item to your inventory</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="itemName">Item Name</Label>
                    <Input
                      id="itemName"
                      value={newItem.itemName}
                      onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
                      placeholder="Enter item name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newItem.category}
                      onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: Number.parseInt(e.target.value) || 0 })}
                      placeholder="Enter quantity"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitType">Unit Type</Label>
                    <Select
                      value={newItem.unitType}
                      onValueChange={(value) => setNewItem({ ...newItem, unitType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Nos">Nos</SelectItem>
                        <SelectItem value="KM">KM</SelectItem>
                        <SelectItem value="Rolls">Rolls</SelectItem>
                        <SelectItem value="Sets">Sets</SelectItem>
                        <SelectItem value="Meters">Meters</SelectItem>
                        <SelectItem value="pcs">Pieces</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitPrice">Unit Price (₹)</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      value={newItem.unitPrice}
                      onChange={(e) => setNewItem({ ...newItem, unitPrice: Number.parseFloat(e.target.value) || 0 })}
                      placeholder="Price per unit"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier</Label>
                    <Input
                      id="supplier"
                      value={newItem.supplier}
                      onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
                      placeholder="Supplier name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      value={newItem.brand}
                      onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })}
                      placeholder="Brand name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ModelNumber">Model Number</Label>
                    <Input
                      id="ModelNumber"
                      value={newItem.ModelNumber}
                      onChange={(e) => setNewItem({ ...newItem, ModelNumber: e.target.value })}
                      placeholder="Model number"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      placeholder="Item description"
                      rows={2}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddItemDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddItem} className="bg-blue-600 hover:bg-blue-700">
                    Add Item
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading inventory data...</span>
          </div>
        )}

        {/* Alerts for Low Stock */}
        {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
          <div className="space-y-3">
            {outOfStockItems.length > 0 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Out of Stock:</strong> {outOfStockItems.length} items are completely out of stock and need
                  immediate restocking.
                </AlertDescription>
              </Alert>
            )}
            {lowStockItems.length > 0 && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>Low Stock Warning:</strong> {lowStockItems.length} items are running low and should be
                  restocked soon.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Items</CardTitle>
              <Package className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{inventoryStats.totalItems}</div>
              <div className="flex items-center space-x-2 mt-2">
                <Badge className="bg-blue-100 text-blue-800 text-xs">{inventoryStats.totalCategories} categories</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                ₹{(inventoryStats.totalValue / 100000).toFixed(1)}L
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600 font-medium">+8.2%</span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Low Stock Items</CardTitle>
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{inventoryStats.lowStockItems}</div>
              <div className="flex items-center space-x-2 mt-2">
                <Badge className="bg-red-100 text-red-800 text-xs">{inventoryStats.outOfStockItems} out of stock</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Monthly Consumption</CardTitle>
              <TrendingDown className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                ₹{(inventoryStats.monthlyConsumption / 1000).toFixed(0)}K
              </div>
              <div className="flex items-center mt-2">
                <Calendar className="h-4 w-4 text-orange-600 mr-1" />
                <span className="text-sm text-orange-600 font-medium">This month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Management ({filteredInventory.length} items)</CardTitle>
            <CardDescription>Track stock levels, issue items, and manage categories</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="items" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="items">Items</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="issuance">Issuance History</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>

              <TabsContent value="items" className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search items by name, category, or supplier..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
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

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total Value</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInventory.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.itemName}</div>
                              <div className="text-sm text-gray-500">{item.brand}</div>
                            </div>
                          </TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {item.quantity} {item.unitType}
                              </div>
                              <div className="text-sm text-gray-500">Model: {item.ModelNumber || "N/A"}</div>
                            </div>
                          </TableCell>
                          <TableCell>₹{item.unitPrice.toLocaleString()}</TableCell>
                          <TableCell>₹{(item.unitPrice * item.quantity).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(getStockStatus(item))}>
                              {getStockStatus(item).replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm">{item.supplier}</div>
                              <div className="text-xs text-gray-500">
                                Updated: {new Date(item.updatedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedItem(item)
                                  setIsDetailsDialogOpen(true)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedItem(item)
                                  // TODO: Implement edit dialog
                                  toast({
                                    title: "Edit Feature",
                                    description: "Edit functionality will be implemented soon.",
                                  })
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredInventory.length === 0 && !loading && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                            No inventory items found. {searchTerm && "Try adjusting your search terms."}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="categories" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Inventory Categories</h3>
                  <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Category
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Category</DialogTitle>
                        <DialogDescription>Create a new inventory category</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="categoryName">Category Name</Label>
                          <Input
                            id="categoryName"
                            value={newCategory.name}
                            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                            placeholder="Enter category name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="categoryDescription">Description</Label>
                          <Textarea
                            id="categoryDescription"
                            value={newCategory.description}
                            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                            placeholder="Category description"
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="categoryUnit">Default Unit</Label>
                          <Select
                            value={newCategory.unit}
                            onValueChange={(value) => setNewCategory({ ...newCategory, unit: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Nos">Nos</SelectItem>
                              <SelectItem value="KM">KM</SelectItem>
                              <SelectItem value="Rolls">Rolls</SelectItem>
                              <SelectItem value="Sets">Sets</SelectItem>
                              <SelectItem value="Meters">Meters</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsAddCategoryDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddCategory}>Add Category</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => {
                    const categoryItems = inventory.filter((item) => item.category === category.name)
                    const categoryValue = categoryItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
                    const IconComponent = category.icon

                    return (
                      <Card key={category.id}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                <IconComponent className="h-6 w-6 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{category.name}</h3>
                                <p className="text-sm text-gray-500">{category.description}</p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Items:</span>
                              <span className="text-sm font-medium">{categoryItems.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Total Value:</span>
                              <span className="text-sm font-medium">₹{categoryValue.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Default Unit:</span>
                              <span className="text-sm font-medium">{category.unit}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>

              <TabsContent value="issuance" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Issuance History ({issuances.length})</h3>
                  <Button onClick={() => setIsIssueDialogOpen(true)}>
                    <Users className="h-4 w-4 mr-2" />
                    Issue Items
                  </Button>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Issue ID</TableHead>
                        <TableHead>Operator</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {issuances.map((issuance) => (
                        <TableRow key={issuance.IssueID}>
                          <TableCell className="font-medium">{issuance.IssueID}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{issuance.OperatorName}</div>
                              <div className="text-sm text-gray-500">ID: {issuance.OperatorID}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {issuance.Items.map((item, index) => (
                                <div key={index} className="text-sm">
                                  {item.itemName} ({item.quantity})
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>₹{issuance.TotalAmount.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="text-sm">{new Date(issuance.Date).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-500">{new Date(issuance.Date).toLocaleTimeString()}</div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                issuance.Status === "Issued"
                                  ? "bg-blue-100 text-blue-800"
                                  : issuance.Status === "Delivered"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                              }
                            >
                              {issuance.Status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {issuances.length === 0 && !loading && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                            No issuance history found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="reports" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Stock Summary</CardTitle>
                      <CardDescription>Current inventory status overview</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Total Items</span>
                          <span className="text-sm font-bold text-blue-600">{inventoryStats.totalItems}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Total Value</span>
                          <span className="text-sm font-bold text-green-600">
                            ₹{(inventoryStats.totalValue / 100000).toFixed(1)}L
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Low Stock Items</span>
                          <span className="text-sm font-bold text-yellow-600">{inventoryStats.lowStockItems}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Out of Stock</span>
                          <span className="text-sm font-bold text-red-600">{inventoryStats.outOfStockItems}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Top Categories by Value</CardTitle>
                      <CardDescription>Highest value inventory categories</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {categories
                          .map((category) => ({
                            ...category,
                            value: inventory
                              .filter((item) => item.category === category.name)
                              .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
                          }))
                          .sort((a, b) => b.value - a.value)
                          .slice(0, 5)
                          .map((category) => (
                            <div key={category.id} className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
                                <span className="text-sm">{category.name}</span>
                              </div>
                              <span className="text-sm font-medium">₹{(category.value / 1000).toFixed(0)}K</span>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
