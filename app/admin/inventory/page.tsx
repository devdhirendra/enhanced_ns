"use client"
import { useState, useEffect } from "react"
import type React from "react"

import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Package,
  BarChart3,
  AlertTriangle,
  TrendingDown,
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  FileText,
  Calendar,
  Users,
  RefreshCw,
  Building2,
  MoreHorizontal,
} from "lucide-react"
import { formatCurrency, formatDate, getStatusColor, exportToCSV } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { inventoryApi, operatorApi } from "@/lib/api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface StockItem {
  id: string
  itemName: string
  quantity: number
  supplier: string
  unitPrice: number
  category: string
  brand: string
  status: string
  createdAt: string
  updatedAt: string
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
  unitType?: string
  sold?: number
}

interface Issuance {
  IssueID: string
  OperatorID: string
  OperatorName: string
  operatorName?: string
  operatorEmail?: string
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

interface StockMovement {
  id: string
  itemId: string
  type: string
  quantity: number
  actor: string
  action: string
  to?: string
  date: string
  createdAt: string
}

interface Operator {
  user_id: string
  profileDetail: {
    name: string
    companyName?: string
    operatorId?: string
  }
}

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showAddItemDialog, setShowAddItemDialog] = useState(false)
  const [showEditItemDialog, setShowEditItemDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<StockItem | null>(null)
  const [showIssueDialog, setShowIssueDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("stock")
  const [stockItems, setStockItems] = useState<StockItem[]>([])
  const [issuances, setIssuances] = useState<any[]>([])
  const [stockMovements, setStockMovements] = useState<any[]>([])
  const [operators, setOperators] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

// Replace the fetchInventoryData function with this updated version
  const fetchInventoryData = async () => {
    try {
      setLoading(true)
      console.log("[v0] Fetching inventory data from API...")

      // Use Promise.allSettled instead of Promise.all to handle individual failures
      const [stockResult, issuanceResult, movementResult, operatorResult] = await Promise.allSettled([
        inventoryApi.getAllStockProducts(),
        inventoryApi.getAllIssuancess(),
        inventoryApi.getStockMovements(),
        operatorApi.getAll(),
      ])

      // Handle each result individually
      setStockItems(stockResult.status === 'fulfilled' ? stockResult.value : [])
      
      // Fix for issuances - ensure it's always an array
      const issuancesData = issuanceResult.status === 'fulfilled' ? issuanceResult.value : []
      setIssuances(Array.isArray(issuancesData) ? issuancesData : [])
      
      setStockMovements(movementResult.status === 'fulfilled' ? movementResult.value : [])
      setOperators(operatorResult.status === 'fulfilled' ? operatorResult.value : [])

      console.log("[v0] Stock items fetched:", stockItems.length)
      console.log("[v0] Issuances fetched:", issuances.length)
      console.log("[v0] Stock movements fetched:", stockMovements.length)

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
      // Set empty arrays on error
      setStockItems([])
      setIssuances([])
      setStockMovements([])
      setOperators([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventoryData()
  }, [])

  const filteredItems = stockItems.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const totalInventoryValue = stockItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const lowStockItems = stockItems.filter((item) => item.quantity < 10).length
  const totalItems = stockItems.length
  const categories = [...new Set(stockItems.map((item) => item.category))].filter(Boolean)
  const statuses = [...new Set(stockItems.map((item) => item.status))].filter(Boolean)

  const handleExport = () => {
    const exportData = filteredItems.map((item) => ({
      "Item ID": item.id,
      "Item Name": item.itemName,
      Category: item.category,
      Brand: item.brand,
      Model: item.ModelNumber || "N/A",
      Quantity: item.quantity,
      Unit: item.unitType || "pcs",
      "Unit Price": item.unitPrice,
      "Cost Price": item.costPrice || item.unitPrice,
      "Selling Price": item.sellingPrice || item.unitPrice,
      Supplier: item.supplier,
      Status: item.status,
      "Total Value": item.unitPrice * item.quantity,
    }))
    exportToCSV(exportData, "inventory-items")
    toast({
      title: "Export Successful",
      description: "Inventory data exported successfully!",
    })
  }

  const handleImport = () => {
    toast({
      title: "Import Feature",
      description: "Import functionality - Please upload CSV file with inventory data",
    })
  }

  const handleDeleteItem = async (item: StockItem) => {
    try {
      console.log("[v0] Deleting stock item:", item.id)
      await inventoryApi.deleteProduct(item.id, "Admin")

      toast({
        title: "Item Deleted",
        description: `${item.itemName} has been deleted successfully.`,
      })

      // Refresh the data
      fetchInventoryData()
    } catch (error) {
      console.error("[v0] Error deleting item:", error)
      toast({
        title: "Delete Failed",
        description: "Failed to delete item. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleViewIssue = (issue: any) => {
    toast({
      title: "Issue Details",
      description: `Viewing details for issue ${issue.IssueID}`,
    })
  }

  const handleGenerateBill = (issue: any) => {
    toast({
      title: "Bill Generated",
      description: `Bill generated for issue ${issue.IssueID} - Amount: ${formatCurrency(issue.TotalAmount)}`,
    })
  }

  const handleAddItemSuccess = () => {
    setShowAddItemDialog(false)
    fetchInventoryData() // Refresh the data
    toast({
      title: "Item Added",
      description: "New inventory item has been added successfully!",
    })
  }

  const handleEditItemSuccess = () => {
    setShowEditItemDialog(false)
    setEditingItem(null)
    fetchInventoryData() // Refresh the data
    toast({
      title: "Item Updated",
      description: "Inventory item has been updated successfully!",
    })
  }

  const handleEditItem = (item: StockItem) => {
    setEditingItem(item)
    setShowEditItemDialog(true)
  }

   return (
    <DashboardLayout title="Inventory Management" description="Manage your network equipment and supplies">
      <div className="space-y-6">
        {/* Loading indicator */}
        {loading && (
          <div className="flex flex-col space-y-6">
            {/* Skeleton for overview cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-5 rounded-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-28 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Skeleton for tabs and controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Skeleton className="h-10 w-48" />
              <div className="flex items-center space-x-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-9 w-24" />
                ))}
              </div>
            </div>

            {/* Skeleton for table */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-60" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                  </div>
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!loading && (
          <>
            {/* Inventory Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700">Total Inventory Value</CardTitle>
                  <div className="p-2 rounded-full bg-blue-100">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-900">{formatCurrency(totalInventoryValue)}</div>
                  <p className="text-sm text-blue-600 mt-2">Across all categories</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-700">Total Items</CardTitle>
                  <div className="p-2 rounded-full bg-green-100">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-900">{totalItems}</div>
                  <p className="text-sm text-green-600 mt-2">In {categories.length} categories</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-red-700">Low Stock Alerts</CardTitle>
                  <div className="p-2 rounded-full bg-red-100">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-900">{lowStockItems}</div>
                  <p className="text-sm text-red-600 mt-2">Items need restocking</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-700">Recent Issues</CardTitle>
                  <div className="p-2 rounded-full bg-orange-100">
                    <TrendingDown className="h-5 w-5 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-900">{issuances.length}</div>
                  <p className="text-sm text-orange-600 mt-2">This month</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="stock" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <TabsList className="grid w-full max-w-md grid-cols-3 bg-muted p-1">
                  <TabsTrigger value="stock" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    Stock
                  </TabsTrigger>
                  <TabsTrigger value="issue" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    Issue
                  </TabsTrigger>
                  <TabsTrigger value="logs" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    Logs
                  </TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={fetchInventoryData} disabled={loading} className="gap-1">
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExport} className="gap-1">
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleImport} className="gap-1">
                    <Upload className="h-4 w-4" />
                    <span className="hidden sm:inline">Import</span>
                  </Button>
                </div>
              </div>

              {/* Stock Tab */}
              <TabsContent value="stock" className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full sm:w-80"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-full sm:w-48">
                          <Filter className="h-4 w-4 mr-2" />
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
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-48">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          {statuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
                    <DialogTrigger asChild>
                      <Button className="gap-1">
                        <Plus className="h-4 w-4" />
                        <span>Add Item</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add New Inventory Item</DialogTitle>
                        <DialogDescription>Add a new item to your inventory</DialogDescription>
                      </DialogHeader>
                      <AddItemForm onClose={() => setShowAddItemDialog(false)} onSuccess={handleAddItemSuccess} />
                    </DialogContent>
                  </Dialog>
                  <Dialog open={showEditItemDialog} onOpenChange={setShowEditItemDialog}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Inventory Item</DialogTitle>
                        <DialogDescription>Update inventory item details</DialogDescription>
                      </DialogHeader>
                      {editingItem && (
                        <EditItemForm
                          item={editingItem}
                          onClose={() => setShowEditItemDialog(false)}
                          onSuccess={handleEditItemSuccess}
                        />
                      )}
                    </DialogContent>
                  </Dialog>
                </div>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <CardTitle>Inventory Items ({filteredItems.length})</CardTitle>
                        <CardDescription>Complete list of all inventory items</CardDescription>
                      </div>
                      <Badge variant="outline" className="ml-auto sm:ml-0">
                        {filteredItems.length} items
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <div className="relative w-full overflow-auto">
                        <Table>
                          <TableHeader className="bg-muted/50">
                            <TableRow>
                              <TableHead>Item Details</TableHead>
                              <TableHead className="hidden sm:table-cell">Category</TableHead>
                              <TableHead>Stock</TableHead>
                              <TableHead className="hidden md:table-cell">Pricing</TableHead>
                              <TableHead className="hidden lg:table-cell">Supplier</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredItems.map((item) => (
                              <TableRow key={item.id} className="group">
                                <TableCell>
                                  <div>
                                    <div className="font-medium text-foreground">{item.itemName}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {item.brand} {item.ModelNumber && `- ${item.ModelNumber}`}
                                    </div>
                                    <div className="text-xs text-muted-foreground/70">ID: {item.id}</div>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">
                                  <Badge variant="outline" className="text-xs">
                                    {item.category}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <div className={`font-medium ${item.quantity < 10 ? "text-destructive" : "text-foreground"}`}>
                                      {item.quantity} {item.unitType || "pcs"}
                                    </div>
                                    {item.quantity < 10 && (
                                      <div className="text-xs text-destructive">Low Stock</div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  <div>
                                    <div className="font-medium">{formatCurrency(item.unitPrice)}</div>
                                    {item.sellingPrice && item.sellingPrice !== item.unitPrice && (
                                      <div className="text-sm text-muted-foreground">
                                        Sell: {formatCurrency(item.sellingPrice)}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">
                                  <div className="text-sm text-muted-foreground">{item.supplier}</div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={
                                      item.status === "Available"
                                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                                        : "bg-muted text-muted-foreground hover:bg-muted"
                                    }
                                  >
                                    {item.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleEditItem(item)}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleDeleteItem(item)}>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                            {filteredItems.length === 0 && !loading && (
                              <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                  No items found. {searchTerm && "Try adjusting your search terms."}
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Issue Inventory Tab */}
              <TabsContent value="issue" className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-medium">Issue Inventory to Operators</h3>
                    <p className="text-sm text-muted-foreground">Track inventory distribution</p>
                  </div>
                  <Dialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
                    <DialogTrigger asChild>
                      <Button className="gap-1">
                        <Plus className="h-4 w-4" />
                        Issue Items
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Issue Inventory</DialogTitle>
                        <DialogDescription>Issue items to operators</DialogDescription>
                      </DialogHeader>
                      <IssueInventoryForm
                        onClose={() => setShowIssueDialog(false)}
                        onSuccess={handleEditItemSuccess}
                        operators={operators}
                        stockItems={stockItems}
                      />
                    </DialogContent>
                  </Dialog>
                </div>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <CardTitle>Recent Issuances ({issuances.length})</CardTitle>
                        <CardDescription>Latest inventory distributions to operators</CardDescription>
                      </div>
                      <Badge variant="outline" className="ml-auto sm:ml-0">
                        {issuances.length} issuances
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <div className="relative w-full overflow-auto">
                        <Table>
                          <TableHeader className="bg-muted/50">
                            <TableRow>
                              <TableHead>Issue ID</TableHead>
                              <TableHead className="hidden md:table-cell">Operator</TableHead>
                              <TableHead>Items</TableHead>
                              <TableHead>Total Amount</TableHead>
                              <TableHead className="hidden lg:table-cell">Date</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Array.isArray(issuances) && issuances.length > 0 ? (
                              issuances.map((issue) => (
                                <TableRow key={issue.IssueID} className="group">
                                  <TableCell className="font-medium">{issue.IssueID}</TableCell>
                                  <TableCell className="hidden md:table-cell">
                                    <div>
                                      <div className="font-medium">{issue.OperatorName || issue.operatorName}</div>
                                      <div className="text-sm text-muted-foreground">{issue.OperatorID}</div>
                                      {issue.operatorEmail && (
                                        <div className="text-xs text-muted-foreground/70">{issue.operatorEmail}</div>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-1">
                                      {issue.Items && Array.isArray(issue.Items) && issue.Items.map((item: any, index: number) => (
                                        <div key={index} className="text-sm">
                                          {item.itemName} x{item.quantity}
                                        </div>
                                      ))}
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-medium">{formatCurrency(issue.TotalAmount)}</TableCell>
                                  <TableCell className="hidden lg:table-cell">{formatDate(issue.Date)}</TableCell>
                                  <TableCell>
                                    <Badge className={getStatusColor(issue.Status?.toLowerCase() || '')}>
                                      {issue.Status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                      <Button variant="ghost" size="icon" onClick={() => handleViewIssue(issue)}>
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="icon" onClick={() => handleGenerateBill(issue)}>
                                        <FileText className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                  {Array.isArray(issuances) && issuances.length === 0 
                                    ? "No issuances found." 
                                    : "Error loading issuances data."}
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Logs Tab */}
              <TabsContent value="logs" className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <CardTitle>Inventory Activity Log ({stockMovements.length})</CardTitle>
                        <CardDescription>Complete history of all inventory activities</CardDescription>
                      </div>
                      <Badge variant="outline" className="ml-auto sm:ml-0">
                        {stockMovements.length} activities
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <div className="relative w-full overflow-auto">
                        <Table>
                          <TableHeader className="bg-muted/50">
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead className="hidden sm:table-cell">Item</TableHead>
                              <TableHead>Action</TableHead>
                              <TableHead className="hidden md:table-cell">Quantity</TableHead>
                              <TableHead className="hidden lg:table-cell">Performed By</TableHead>
                              <TableHead className="hidden xl:table-cell">Details</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {stockMovements.map((log) => (
                              <TableRow key={log.id} className="group">
                                <TableCell>
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <span className="text-sm">{formatDate(log.date || log.createdAt)}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell font-medium">{log.itemId}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={
                                      log.action === "ISSUE"
                                        ? "border-red-200 text-red-800 bg-red-50"
                                        : log.action === "ASSIGN"
                                          ? "border-blue-200 text-blue-800 bg-blue-50"
                                          : "border-green-200 text-green-800 bg-green-50"
                                    }
                                  >
                                    {log.action}
                                  </Badge>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  <span className="text-muted-foreground">{log.quantity}</span>
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">
                                  <div className="flex items-center">
                                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <span className="text-sm">{log.actor}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                                  {log.to && `To: ${log.to}`}
                                </TableCell>
                              </TableRow>
                            ))}
                            {stockMovements.length === 0 && !loading && (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                  No activity logs found.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}


function AddItemForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
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
    unitType: "pcs",
    sold: 0,
    status: "Available",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      console.log("[v0] Adding new stock item:", formData.itemName)

      await inventoryApi.addProduct({
        ...formData,
        role: "Admin",
      })

      console.log("[v0] Stock item added successfully")
      onSuccess()
    } catch (error) {
      console.error("[v0] Error adding stock item:", error)
      toast({
        title: "Add Failed",
        description: "Failed to add inventory item. Please try again.",
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
          <Label htmlFor="itemName">Item Name *</Label>
          <Input
            id="itemName"
            value={formData.itemName}
            onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
            required
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="brand">Brand *</Label>
          <Input
            id="brand"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div>
          <Label htmlFor="ModelNumber">Model Number</Label>
          <Input
            id="ModelNumber"
            value={formData.ModelNumber}
            onChange={(e) => setFormData({ ...formData, ModelNumber: e.target.value })}
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: Number.parseInt(e.target.value) || 0 })}
            required
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="unitPrice">Unit Price *</Label>
          <Input
            id="unitPrice"
            type="number"
            step="0.01"
            value={formData.unitPrice}
            onChange={(e) => setFormData({ ...formData, unitPrice: Number.parseFloat(e.target.value) || 0 })}
            required
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="sellingPrice">Selling Price</Label>
          <Input
            id="sellingPrice"
            type="number"
            step="0.01"
            value={formData.sellingPrice}
            onChange={(e) => setFormData({ ...formData, sellingPrice: Number.parseFloat(e.target.value) || 0 })}
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="supplier">Supplier *</Label>
          <Input
            id="supplier"
            value={formData.supplier}
            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
            required
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="warantyInfo">Warranty Info</Label>
          <Input
            id="warantyInfo"
            value={formData.warantyInfo}
            onChange={(e) => setFormData({ ...formData, warantyInfo: e.target.value })}
            disabled={loading}
          />
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

      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Item"}
        </Button>
      </div>
    </form>
  )
}

function EditItemForm({ item, onClose, onSuccess }: { item: StockItem; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    itemName: item.itemName || "",
    quantity: item.quantity || 0,
    supplier: item.supplier || "",
    unitPrice: item.unitPrice || 0,
    category: item.category || "",
    brand: item.brand || "",
    phoneNumber: item.phoneNumber || "",
    description: item.description || "",
    specification: item.specification || "",
    ModelNumber: item.ModelNumber || "",
    costPrice: item.costPrice || 0,
    sellingPrice: item.sellingPrice || 0,
    ProductImage: item.ProductImage || "",
    warantyInfo: item.warantyInfo || "",
    discount: item.discount || "",
    rating: item.rating || 0,
    unitType: item.unitType || "pcs",
    sold: item.sold || 0,
    status: item.status || "Available",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      console.log("[v0] Updating stock item:", item.id)

      await inventoryApi.updateProduct(item.id, {
        quantity: formData.quantity,
        unitPrice: formData.unitPrice,
        status: formData.status,
        role: "Admin",
      })

      console.log("[v0] Stock item updated successfully")
      onSuccess()
    } catch (error) {
      console.error("[v0] Error updating stock item:", error)
      toast({
        title: "Update Failed",
        description: "Failed to update inventory item. Please try again.",
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
          <Label htmlFor="edit-itemName">Item Name</Label>
          <Input id="edit-itemName" value={formData.itemName} disabled className="bg-gray-50" />
        </div>
        <div>
          <Label htmlFor="edit-category">Category</Label>
          <Input id="edit-category" value={formData.category} disabled className="bg-gray-50" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-quantity">Quantity *</Label>
          <Input
            id="edit-quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: Number.parseInt(e.target.value) || 0 })}
            required
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="edit-unitPrice">Unit Price *</Label>
          <Input
            id="edit-unitPrice"
            type="number"
            step="0.01"
            value={formData.unitPrice}
            onChange={(e) => setFormData({ ...formData, unitPrice: Number.parseFloat(e.target.value) || 0 })}
            required
            disabled={loading}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-supplier">Supplier</Label>
          <Input id="edit-supplier" value={formData.supplier} disabled className="bg-gray-50" />
        </div>
        <div>
          <Label htmlFor="edit-brand">Brand</Label>
          <Input id="edit-brand" value={formData.brand} disabled className="bg-gray-50" />
        </div>
      </div>
      <div>
        <Label htmlFor="edit-status">Status *</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="Out of Stock">Out of Stock</SelectItem>
            <SelectItem value="Discontinued">Discontinued</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Item"}
        </Button>
      </div>
    </form>
  )
}

function IssueInventoryForm({
  onClose,
  onSuccess,
  operators,
  stockItems,
}: {
  onClose: () => void
  onSuccess: () => void
  operators: any[]
  stockItems: StockItem[]
}) {
  const [formData, setFormData] = useState({
    operatorId: "",
    items: [{ itemId: "", quantity: 0 }],
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.operatorId || formData.items.some((item) => !item.itemId || item.quantity <= 0)) {
      toast({
        title: "Invalid Data",
        description: "Please select operator and valid items with quantities.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      console.log("[v0] Issuing stock to operator:", formData.operatorId)

      await inventoryApi.issueToOperator({
        operatorId: formData.operatorId,
        items: formData.items,
      })

      console.log("[v0] Stock issued successfully")
      onSuccess()
    } catch (error) {
      console.error("[v0] Error issuing stock:", error)
      toast({
        title: "Issue Failed",
        description: "Failed to issue items. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { itemId: "", quantity: 0 }],
    })
  }

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="operator">Select Operator *</Label>
        <Select value={formData.operatorId} onValueChange={(value) => setFormData({ ...formData, operatorId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Choose operator" />
          </SelectTrigger>
          <SelectContent>
            {operators.map((operator) => (
              <SelectItem key={operator.profileDetail.operatorId } value={operator.profileDetail.operatorId}>
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
        <div className="flex items-center justify-between mb-2">
          <Label>Items to Issue</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem} disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
        <div className="space-y-3">
          {formData.items.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Select
                value={item.itemId}
                onValueChange={(value) => {
                  const newItems = [...formData.items]
                  newItems[index].itemId = value
                  setFormData({ ...formData, items: newItems })
                }}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {stockItems.map((stockItem) => (
                    <SelectItem key={stockItem.id} value={stockItem.id}>
                      {stockItem.itemName} (Stock: {stockItem.quantity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) => {
                  const newItems = [...formData.items]
                  newItems[index].quantity = Number.parseInt(e.target.value) || 0
                  setFormData({ ...formData, items: newItems })
                }}
                className="w-20"
                disabled={loading}
              />
              {formData.items.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeItem(index)}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Issuing..." : "Issue Items"}
        </Button>
      </div>
    </form>
  )
}
