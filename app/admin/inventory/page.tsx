"use client"
import { useState, useEffect, useMemo } from "react"
import type React from "react"
import { useAuth } from "@/contexts/AuthContext"

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
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
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

type SortField = 'itemName' | 'quantity' | 'unitPrice' | 'category' | 'status' | 'supplier' | 'brand';
type SortOrder = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  order: SortOrder;
}

type LogsSortField = 'date' | 'itemId' | 'action' | 'quantity' | 'actor';
interface LogsSortConfig {
  field: LogsSortField;
  order: SortOrder;
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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  // Logs pagination states
  const [logsCurrentPage, setLogsCurrentPage] = useState(1)
  const [logsItemsPerPage, setLogsItemsPerPage] = useState(10)

  // Sorting states
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'itemName', order: 'asc' })
  const [logsSortConfig, setLogsSortConfig] = useState<LogsSortConfig>({ field: 'date', order: 'desc' })

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

  // Handle card clicks with table actions
const handleCardClick = (cardType: string) => {
  switch(cardType) {
    case 'totalValue':
      // Show all items sorted by value (unitPrice * quantity)
      setActiveTab('stock')
      setSearchTerm('')
      setCategoryFilter('all')
      setStatusFilter('all')
      setSortConfig({ field: 'unitPrice', order: 'desc' })
      toast({
        title: "Sorted by Value",
        description: "Items sorted by highest value first",
      })
      break
    case 'totalItems':
      // Show all items
      setActiveTab('stock')
      setSearchTerm('')
      setCategoryFilter('all')
      setStatusFilter('all')
      setSortConfig({ field: 'itemName', order: 'asc' })
      toast({
        title: "All Items View",
        description: `Showing all ${totalItems} items`,
      })
      break
    case 'lowStock':
      // Filter to show only low stock and out of stock items
      setActiveTab('stock')
      setSearchTerm('')
      setCategoryFilter('all')
      setStatusFilter('out_of_stock') // Filter by out_of_stock status
      setSortConfig({ field: 'quantity', order: 'asc' })
      toast({
        title: "Low Stock & Out of Stock Items",
        description: `Showing items that need restocking`,
      })
      break
    case 'recentIssues':
      // Navigate to issues tab
      setActiveTab('issue')
      toast({
        title: "Recent Issues",
        description: `Viewing ${issuances.length} recent inventory issuances`,
      })
      break
  }
}

  // Sorting function for stock items
  const handleSort = (field: SortField) => {
    setSortConfig(current => ({
      field,
      order: current.field === field && current.order === 'asc' ? 'desc' : 'asc'
    }))
  }

  // Sorting function for logs
  const handleLogsSort = (field: LogsSortField) => {
    setLogsSortConfig(current => ({
      field,
      order: current.field === field && current.order === 'asc' ? 'desc' : 'asc'
    }))
  }

  // Get sort icon for stock items
  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return sortConfig.order === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />
  }

  // Get sort icon for logs
  const getLogsSortIcon = (field: LogsSortField) => {
    if (logsSortConfig.field !== field) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return logsSortConfig.order === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />
  }

  // Apply sorting and filtering for stock items
const filteredAndSortedItems = useMemo(() => {
  let filtered = stockItems.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Apply sorting
  filtered.sort((a, b) => {
    let aValue: any = a[sortConfig.field]
    let bValue: any = b[sortConfig.field]

    // Special handling for quantity sorting - prioritize low stock items
    if (sortConfig.field === 'quantity') {
      const aIsLowStock = a.quantity < 10 || a.status === 'out_of_stock'
      const bIsLowStock = b.quantity < 10 || b.status === 'out_of_stock'
      
      if (aIsLowStock && !bIsLowStock) return -1
      if (!aIsLowStock && bIsLowStock) return 1
    }

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (aValue < bValue) {
      return sortConfig.order === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortConfig.order === 'asc' ? 1 : -1
    }
    return 0
  })

  return filtered
}, [stockItems, searchTerm, categoryFilter, statusFilter, sortConfig])

  // Apply sorting and filtering for logs
  const sortedLogs = useMemo(() => {
    const logs = [...stockMovements]

    logs.sort((a, b) => {
      let aValue: any = a[logsSortConfig.field]
      let bValue: any = b[logsSortConfig.field]

      // Handle date sorting
      if (logsSortConfig.field === 'date') {
        aValue = a.date || a.createdAt
        bValue = b.date || b.createdAt
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) {
        return logsSortConfig.order === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return logsSortConfig.order === 'asc' ? 1 : -1
      }
      return 0
    })

    return logs
  }, [stockMovements, logsSortConfig])

  // Pagination for stock items
  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage)
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAndSortedItems.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAndSortedItems, currentPage, itemsPerPage])

  // Pagination for logs
  const logsTotalPages = Math.ceil(sortedLogs.length / logsItemsPerPage)
  const paginatedLogs = useMemo(() => {
    const startIndex = (logsCurrentPage - 1) * logsItemsPerPage
    return sortedLogs.slice(startIndex, startIndex + logsItemsPerPage)
  }, [sortedLogs, logsCurrentPage, logsItemsPerPage])

const totalInventoryValue = useMemo(() => 
  stockItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0), 
  [stockItems]
)
const lowStockItems = useMemo(() => 
  stockItems.filter((item) => item.quantity < 10 || item.status === 'out_of_stock').length, 
  [stockItems]
)
const totalItems = useMemo(() => stockItems.length, [stockItems])
const categories = useMemo(() => 
  [...new Set(stockItems.map((item) => item.category))].filter(Boolean), 
  [stockItems]
)
const statuses = useMemo(() => 
  [...new Set(stockItems.map((item) => item.status))].filter(Boolean), 
  [stockItems]
)
  const handleExport = () => {
    const exportData = filteredAndSortedItems.map((item) => ({
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

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, categoryFilter, statusFilter, activeTab])

  // Reset logs page when tab changes
  useEffect(() => {
    setLogsCurrentPage(1)
  }, [activeTab])

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
            {/* Inventory Overview Cards - Now Clickable with Table Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card 
                className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-blue-300 hover:scale-105"
                onClick={() => handleCardClick('totalValue')}
              >
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

              <Card 
                className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-green-300 hover:scale-105"
                onClick={() => handleCardClick('totalItems')}
              >
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

              <Card 
                className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-red-300 hover:scale-105"
                onClick={() => handleCardClick('lowStock')}
              >
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

              <Card 
                className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-orange-300 hover:scale-105"
                onClick={() => handleCardClick('recentIssues')}
              >
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
                        <CardTitle>Inventory Items ({filteredAndSortedItems.length})</CardTitle>
                        <CardDescription>Complete list of all inventory items</CardDescription>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="ml-auto sm:ml-0">
                          {filteredAndSortedItems.length} items
                        </Badge>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="itemsPerPage" className="text-sm whitespace-nowrap">Items per page:</Label>
                          <Select
                            value={itemsPerPage.toString()}
                            onValueChange={(value) => {
                              setItemsPerPage(Number.parseInt(value))
                              setCurrentPage(1)
                            }}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5</SelectItem>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="25">25</SelectItem>
                              <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <div className="relative w-full overflow-auto">
                        <Table>
                          <TableHeader className="bg-muted/50">
                            <TableRow>
                              <TableHead 
                                className="cursor-pointer hover:bg-muted/70 transition-colors"
                                onClick={() => handleSort('itemName')}
                              >
                                <div className="flex items-center space-x-1">
                                  <span>Item Details</span>
                                  {getSortIcon('itemName')}
                                </div>
                              </TableHead>
                              <TableHead 
                                className="hidden sm:table-cell cursor-pointer hover:bg-muted/70 transition-colors"
                                onClick={() => handleSort('category')}
                              >
                                <div className="flex items-center space-x-1">
                                  <span>Category</span>
                                  {getSortIcon('category')}
                                </div>
                              </TableHead>
                              <TableHead 
                                className="cursor-pointer hover:bg-muted/70 transition-colors"
                                onClick={() => handleSort('quantity')}
                              >
                                <div className="flex items-center space-x-1">
                                  <span>Stock</span>
                                  {getSortIcon('quantity')}
                                </div>
                              </TableHead>
                              <TableHead 
                                className="hidden md:table-cell cursor-pointer hover:bg-muted/70 transition-colors"
                                onClick={() => handleSort('unitPrice')}
                              >
                                <div className="flex items-center space-x-1">
                                  <span>Pricing</span>
                                  {getSortIcon('unitPrice')}
                                </div>
                              </TableHead>
                              <TableHead className="hidden lg:table-cell">Supplier</TableHead>
                              <TableHead 
                                className="cursor-pointer hover:bg-muted/70 transition-colors"
                                onClick={() => handleSort('status')}
                              >
                                <div className="flex items-center space-x-1">
                                  <span>Status</span>
                                  {getSortIcon('status')}
                                </div>
                              </TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedItems.map((item) => (
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
                            {filteredAndSortedItems.length === 0 && !loading && (
                              <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                  No items found. {searchTerm && "Try adjusting your search terms."}
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-4 border-t">
                          <div className="text-sm text-muted-foreground">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedItems.length)} of {filteredAndSortedItems.length} items
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={currentPage === 1}
                            >
                              Previous
                            </Button>
                            <div className="flex items-center space-x-1">
                              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum
                                if (totalPages <= 5) {
                                  pageNum = i + 1
                                } else if (currentPage <= 3) {
                                  pageNum = i + 1
                                } else if (currentPage >= totalPages - 2) {
                                  pageNum = totalPages - 4 + i
                                } else {
                                  pageNum = currentPage - 2 + i
                                }

                                return (
                                  <Button
                                    key={pageNum}
                                    variant={currentPage === pageNum ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setCurrentPage(pageNum)}
                                    className="w-8 h-8 p-0"
                                  >
                                    {pageNum}
                                  </Button>
                                )
                              })}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                              disabled={currentPage === totalPages}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
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
                        <CardTitle>Inventory Activity Log ({sortedLogs.length})</CardTitle>
                        <CardDescription>Complete history of all inventory activities</CardDescription>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="ml-auto sm:ml-0">
                          {sortedLogs.length} activities
                        </Badge>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="logsItemsPerPage" className="text-sm whitespace-nowrap">Items per page:</Label>
                          <Select
                            value={logsItemsPerPage.toString()}
                            onValueChange={(value) => {
                              setLogsItemsPerPage(Number.parseInt(value))
                              setLogsCurrentPage(1)
                            }}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5</SelectItem>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="25">25</SelectItem>
                              <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <div className="relative w-full overflow-auto">
                        <Table>
                          <TableHeader className="bg-muted/50">
                            <TableRow>
                              <TableHead 
                                className="cursor-pointer hover:bg-muted/70 transition-colors"
                                onClick={() => handleLogsSort('date')}
                              >
                                <div className="flex items-center space-x-1">
                                  <span>Date</span>
                                  {getLogsSortIcon('date')}
                                </div>
                              </TableHead>
                              <TableHead 
                                className="hidden sm:table-cell cursor-pointer hover:bg-muted/70 transition-colors"
                                onClick={() => handleLogsSort('itemId')}
                              >
                                <div className="flex items-center space-x-1">
                                  <span>Item</span>
                                  {getLogsSortIcon('itemId')}
                                </div>
                              </TableHead>
                              <TableHead 
                                className="cursor-pointer hover:bg-muted/70 transition-colors"
                                onClick={() => handleLogsSort('action')}
                              >
                                <div className="flex items-center space-x-1">
                                  <span>Action</span>
                                  {getLogsSortIcon('action')}
                                </div>
                              </TableHead>
                              <TableHead 
                                className="hidden md:table-cell cursor-pointer hover:bg-muted/70 transition-colors"
                                onClick={() => handleLogsSort('quantity')}
                              >
                                <div className="flex items-center space-x-1">
                                  <span>Quantity</span>
                                  {getLogsSortIcon('quantity')}
                                </div>
                              </TableHead>
                              <TableHead 
                                className="hidden lg:table-cell cursor-pointer hover:bg-muted/70 transition-colors"
                                onClick={() => handleLogsSort('actor')}
                              >
                                <div className="flex items-center space-x-1">
                                  <span>Performed By</span>
                                  {getLogsSortIcon('actor')}
                                </div>
                              </TableHead>
                              <TableHead className="hidden xl:table-cell">Details</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedLogs.map((log) => (
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
                            {sortedLogs.length === 0 && !loading && (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                  No activity logs found.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Pagination Controls for Logs */}
                      {logsTotalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-4 border-t">
                          <div className="text-sm text-muted-foreground">
                            Showing {((logsCurrentPage - 1) * logsItemsPerPage) + 1} to {Math.min(logsCurrentPage * logsItemsPerPage, sortedLogs.length)} of {sortedLogs.length} activities
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setLogsCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={logsCurrentPage === 1}
                            >
                              Previous
                            </Button>
                            <div className="flex items-center space-x-1">
                              {Array.from({ length: Math.min(5, logsTotalPages) }, (_, i) => {
                                let pageNum
                                if (logsTotalPages <= 5) {
                                  pageNum = i + 1
                                } else if (logsCurrentPage <= 3) {
                                  pageNum = i + 1
                                } else if (logsCurrentPage >= logsTotalPages - 2) {
                                  pageNum = logsTotalPages - 4 + i
                                } else {
                                  pageNum = logsCurrentPage - 2 + i
                                }

                                return (
                                  <Button
                                    key={pageNum}
                                    variant={logsCurrentPage === pageNum ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setLogsCurrentPage(pageNum)}
                                    className="w-8 h-8 p-0"
                                  >
                                    {pageNum}
                                  </Button>
                                )
                              })}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setLogsCurrentPage(prev => Math.min(prev + 1, logsTotalPages))}
                              disabled={logsCurrentPage === logsTotalPages}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
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
  const { user } = useAuth() // Get the authenticated user
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
    status: "inactive",
    // createID will be dynamically set from user.id
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.itemName || !formData.supplier || !formData.category || !formData.brand) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    // Check if user is authenticated
    if (!user?.user_id) {
      toast({
        title: "Authentication Error",
        description: "Please log in to add inventory items.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      console.log("[v0] Adding new stock item:", formData)
      console.log("[v0] User ID:", user.user_id)

      // Prepare the data with the actual user ID
      const apiData = {
        itemName: formData.itemName,
        quantity: formData.quantity,
        supplier: formData.supplier,
        unitPrice: formData.unitPrice,
        unitType: formData.unitType,
        category: formData.category,
        brand: formData.brand,
        phoneNumber: formData.phoneNumber,
        status: formData.status,
        description: formData.description,
        specification: formData.specification,
        ModelNumber: formData.ModelNumber,
        costPrice: formData.costPrice,
        sellingPrice: formData.sellingPrice,
        ProductImage: formData.ProductImage,
        warantyInfo: formData.warantyInfo,
        discount: formData.discount,
        rating: formData.rating,
        sold: formData.sold,
        createID: user.user_id, // Use the actual authenticated user ID
      }

      console.log("[v0] Sending data to API:", apiData)
      
      const response = await inventoryApi.addProduct(apiData)
      console.log("[v0] API Response:", response)

      console.log("[v0] Stock item added successfully")
      toast({
        title: "Success",
        description: "Inventory item has been added successfully!",
      })
      onSuccess()
    } catch (error: any) {
      console.error("[v0] Error adding stock item:", error)
      
      // More detailed error message
      let errorMessage = "Failed to add inventory item. Please try again."
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast({
        title: "Add Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* User Info Display */}
      {user && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex items-center space-x-2 text-sm text-blue-800">
            <Users className="h-4 w-4" />
            <span>
              Adding item as: <strong>{user.name || user.email}</strong> (ID: {user.user_id})
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="itemName">Item Name *</Label>
          <Input
            id="itemName"
            value={formData.itemName}
            onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
            required
            disabled={loading}
            placeholder="e.g., FTTH ONU Device"
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
            placeholder="e.g., Huawei"
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
            placeholder="e.g., Networking"
          />
        </div>
        <div>
          <Label htmlFor="ModelNumber">Model Number</Label>
          <Input
            id="ModelNumber"
            value={formData.ModelNumber}
            onChange={(e) => setFormData({ ...formData, ModelNumber: e.target.value })}
            disabled={loading}
            placeholder="e.g., HG8245Q2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            min="0"
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
            min="0"
            value={formData.unitPrice}
            onChange={(e) => setFormData({ ...formData, unitPrice: Number.parseFloat(e.target.value) || 0 })}
            required
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="costPrice">Cost Price</Label>
          <Input
            id="costPrice"
            type="number"
            step="0.01"
            min="0"
            value={formData.costPrice}
            onChange={(e) => setFormData({ ...formData, costPrice: Number.parseFloat(e.target.value) || 0 })}
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="sellingPrice">Selling Price</Label>
          <Input
            id="sellingPrice"
            type="number"
            step="0.01"
            min="0"
            value={formData.sellingPrice}
            onChange={(e) => setFormData({ ...formData, sellingPrice: Number.parseFloat(e.target.value) || 0 })}
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="unitType">Unit Type</Label>
          <Select 
            value={formData.unitType} 
            onValueChange={(value) => setFormData({ ...formData, unitType: value })}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select unit type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pcs">Pieces</SelectItem>
              <SelectItem value="box">Box</SelectItem>
              <SelectItem value="pack">Pack</SelectItem>
              <SelectItem value="set">Set</SelectItem>
              <SelectItem value="unit">Unit</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="rating">Rating</Label>
          <Input
            id="rating"
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: Number.parseFloat(e.target.value) || 0 })}
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
            placeholder="e.g., Broadband Systems Ltd"
          />
        </div>
        <div>
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            disabled={loading}
            placeholder="e.g., 9876543210"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="warantyInfo">Warranty Info</Label>
          <Input
            id="warantyInfo"
            value={formData.warantyInfo}
            onChange={(e) => setFormData({ ...formData, warantyInfo: e.target.value })}
            disabled={loading}
            placeholder="e.g., 2 Years Standard Warranty"
          />
        </div>
        <div>
          <Label htmlFor="discount">Discount</Label>
          <Input
            id="discount"
            value={formData.discount}
            onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
            disabled={loading}
            placeholder="e.g., 8%"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="ProductImage">Product Image URL</Label>
        <Input
          id="ProductImage"
          type="url"
          value={formData.ProductImage}
          onChange={(e) => setFormData({ ...formData, ProductImage: e.target.value })}
          disabled={loading}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          disabled={loading}
          placeholder="Product description..."
        />
      </div>

      <div>
        <Label htmlFor="specification">Specification</Label>
        <Textarea
          id="specification"
          value={formData.specification}
          onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
          rows={2}
          disabled={loading}
          placeholder="Product specifications..."
        />
      </div>

      <div>
        <Label htmlFor="status">Status *</Label>
        <Select 
          value={formData.status} 
          onValueChange={(value) => setFormData({ ...formData, status: value })}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !user?.user_id}>
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
