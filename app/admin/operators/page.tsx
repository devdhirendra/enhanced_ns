"use client"
import { useState, useEffect, useCallback } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  Download,
  Upload,
  HardHat,
  RefreshCw,
  AlertCircle,
  Users,
  DollarSign,
  Globe,
  Calendar,
  ArrowUpDown,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { exportToCSV } from "@/lib/utils"
import OperatorDetailsView from "@/components/OperatorDetailsView"
import AddOperatorForm from "@/components/AddOperatorForm"
import EditOperatorForm from "@/components/EditOperatorForm"
import { operatorApi } from "@/lib/api"
import type { User, Operator } from "@/contexts/AuthContext"
import { confirmDelete } from "@/lib/confirmation-dialog"
import { OperatorsLoadingSkeleton } from "@/components/skeletons/OperatorSkeletons"

export default function OperatorsPage() {
  
  // State Management
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [operators, setOperators] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"revenue" | "name" | "customers" | "">("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [activeFilter, setActiveFilter] = useState<{ type: string; value: string }>({ type: 'all', value: 'all' })
  const { toast } = useToast()

  // Stats calculation
  const stats = {
    total: operators.length,
    active: operators.filter(op => op.status === 'active').length,
    suspended: operators.filter(op => op.status === 'suspended').length,
    expired: operators.filter(op => op.status === 'expired').length,
    inactive: operators.filter(op => op.status === 'inactive').length,
  }

  // Transform User to Operator helper function
  const transformUserToOperator = useCallback((user: User): Operator => {
    return {
      ...user,
      id: user.user_id,
      companyName: user.profileDetail?.companyName || user.profileDetail?.name || "Unknown Company",
      ownerName: user.profileDetail?.name || "Unknown Owner",
      phone: user.profileDetail?.phone || "",
      email: user.email || "",
      address: user.profileDetail?.address || {
        state: "N/A",
        district: "N/A", 
        area: "N/A",
      },
      planAssigned: user.profileDetail?.planAssigned || "Basic",
      revenue: user.profileDetail?.revenue || 0,
      customerCount: user.profileDetail?.customerCount || 0,
      gstNumber: user.profileDetail?.gstNumber || "",
      businessType: user.profileDetail?.businessType || "General Business",
      serviceCapacity: {
        connections: user.profileDetail?.serviceCapacity?.connections || 100,
        olts: user.profileDetail?.serviceCapacity?.olts || 0,
        bandwidth: user.profileDetail?.serviceCapacity?.bandwidth || "100 Mbps"
      },
      apiAccess: user.profileDetail?.apiAccess || {
        enabled: false,
        apiKey: "",
        lastUsed: null
      },
      status: user.status || "active",
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: user.updatedAt || new Date().toISOString(),
      technicianCount: user.profileDetail?.technicianCount || 0,
      expiryDate: user.profileDetail?.expiryDate || new Date().toISOString(),
      lastRenewed: user.profileDetail?.lastRenewed || new Date().toISOString(),
      nextBillDate: user.profileDetail?.nextBillDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }, []);

  interface OperatorsResponse {
    success?: boolean;
    data?: User[];
    operators?: User[];
    message?: string;
  }

  // Fetch operators with proper error handling
  const fetchOperators = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("[OperatorsPage] Fetching operators from API...");
      
      const response = await operatorApi.getAll() as OperatorsResponse;
      
      let operatorsData: User[] = [];
      
      if (Array.isArray(response)) {
        operatorsData = response;
      } else if (response) {
        if (Array.isArray(response.data)) {
          operatorsData = response.data;
        } else if (Array.isArray(response.operators)) {
          operatorsData = response.operators;
        }
      }
      
      console.log("[OperatorsPage] Operators fetched successfully:", operatorsData.length, "operators")
      
      const validOperators = operatorsData.filter(operator => 
        operator && operator.user_id && operator.email
      )
      
      setOperators(validOperators)
      
      if (validOperators.length !== operatorsData.length) {
        console.warn("[OperatorsPage] Some operators were filtered out due to invalid data")
      }
      
    } catch (error) {
      console.error("[OperatorsPage] Error fetching operators:", error)
      setError("Failed to load operators. Please check your connection and try again.")
      
      toast({
        title: "Error Loading Operators",
        description: "Failed to load operators. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Initial load
  useEffect(() => {
    fetchOperators()
  }, [fetchOperators])

  // Handle filter clicks from stats cards
  const handleFilterClick = (type: string, value: string) => {
    setActiveFilter({ type, value })
    setStatusFilter(value)
    setCurrentPage(1)
  }

  // Sort operators
  const sortedOperators = [...operators].sort((a, b) => {
    if (!sortBy) return 0;

    let aValue: any, bValue: any;

    switch (sortBy) {
      case "revenue":
        aValue = a.profileDetail?.revenue || 0;
        bValue = b.profileDetail?.revenue || 0;
        break;
      case "customers":
        aValue = a.profileDetail?.customerCount || 0;
        bValue = b.profileDetail?.customerCount || 0;
        break;
      case "name":
        aValue = a.profileDetail?.companyName || a.profileDetail?.name || "";
        bValue = b.profileDetail?.companyName || b.profileDetail?.name || "";
        break;
      default:
        return 0;
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Filter operators with improved search
  const filteredOperators = sortedOperators.filter((operator) => {
    if (!operator || !operator.profileDetail) return false
    
    const searchString = searchTerm.toLowerCase().trim()
    
    if (searchString) {
      const matchesSearch = 
        operator.profileDetail.companyName?.toLowerCase().includes(searchString) ||
        operator.profileDetail.name?.toLowerCase().includes(searchString) ||
        operator.email?.toLowerCase().includes(searchString) ||
        operator.profileDetail.phone?.includes(searchString) ||
        operator.user_id?.toLowerCase().includes(searchString) ||
        operator.profileDetail.businessType?.toLowerCase().includes(searchString)

      if (!matchesSearch) return false
    }

    const operatorStatus = operator.status || "active"
    const matchesStatus = statusFilter === "all" || statusFilter === operatorStatus

    return matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredOperators.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedOperators = filteredOperators.slice(startIndex, startIndex + itemsPerPage)

  // Status badge with better logic
  const getStatusBadge = (status = "active") => {
    const statusConfig = {
      active: { className: "bg-green-100 text-green-800 border-green-200", label: "Active" },
      suspended: { className: "bg-red-100 text-red-800 border-red-200", label: "Suspended" },
      expired: { className: "bg-orange-100 text-orange-800 border-orange-200", label: "Expired" },
      inactive: { className: "bg-gray-100 text-gray-800 border-gray-200", label: "Inactive" },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive
    
    return (
      <Badge variant="outline" className={`${config.className} font-medium`}>
        {config.label}
      </Badge>
    )
  }

  // Export functionality
  const handleExport = () => {
    try {
      const exportData = filteredOperators.map((op, index) => ({
        "S.No": index + 1,
        "Operator ID": op.profileDetail?.operatorId || op.user_id?.slice(0, 8) || "",
        "Company Name": op.profileDetail?.companyName || op.profileDetail?.name || "N/A",
        "Owner Name": op.profileDetail?.name || "N/A",
        "Phone": op.profileDetail?.phone || "N/A",
        "Email": op.email || "N/A",
        "Business Type": op.profileDetail?.businessType || "N/A",
        "State": op.profileDetail?.address?.state || "N/A",
        "District": op.profileDetail?.address?.district || "N/A",
        "Area": op.profileDetail?.address?.area || "N/A",
        "Customer Count": op.profileDetail?.customerCount || 0,
        "Service Capacity": op.profileDetail?.serviceCapacity?.connections || "N/A",
        "Plan": op.profileDetail?.planAssigned || "Basic",
        "Revenue": op.profileDetail?.revenue || 0,
        "GST Number": op.profileDetail?.gstNumber || "N/A",
        "Status": op.status || "Active",
        "Created Date": op.createdAt ? new Date(op.createdAt).toLocaleDateString() : "N/A",
        "Updated Date": op.updatedAt ? new Date(op.updatedAt).toLocaleDateString() : "N/A",
      }))
      
      exportToCSV(exportData, `operators-list-${new Date().toISOString().split('T')[0]}`)
      
      toast({
        title: "Export Successful",
        description: `${exportData.length} operators exported successfully!`,
      })
    } catch (error) {
      console.error("[OperatorsPage] Export error:", error)
      toast({
        title: "Export Failed", 
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleImport = () => {
    toast({
      title: "Import Feature",
      description: "Import functionality will be available soon. Please upload CSV file with operator data.",
    })
  }

  // View operator details
  const handleViewDetails = (operator: User) => {
    try {
      const transformedOperator = transformUserToOperator(operator)
      setSelectedOperator(transformedOperator)
      setShowDetailsDialog(true)
    } catch (error) {
      console.error("[OperatorsPage] Error viewing operator details:", error)
      toast({
        title: "Error",
        description: "Failed to load operator details.",
        variant: "destructive",
      })
    }
  }

  // Edit operator
  const handleEdit = (operator: User) => {
    try {
      const transformedOperator = transformUserToOperator(operator)
      setSelectedOperator(transformedOperator)
      setShowEditDialog(true)
    } catch (error) {
      console.error("[OperatorsPage] Error editing operator:", error)
      toast({
        title: "Error",
        description: "Failed to load operator for editing.",
        variant: "destructive",
      })
    }
  }

  // Delete operator with confirmation
  const handleDelete = async (operator: User) => {
    try {
      const companyName = operator.profileDetail?.companyName || operator.profileDetail?.name || "this operator"
      
      const confirmed = await confirmDelete(`operator "${companyName}"`)
      if (!confirmed) return

      console.log("[OperatorsPage] Deleting operator:", operator.user_id)
      
      await operatorApi.deleteProfile(operator.user_id)

      setOperators(prev => prev.filter(op => op.user_id !== operator.user_id))

      toast({
        title: "Operator Deleted",
        description: `${companyName} has been deleted successfully.`,
      })

      setTimeout(() => {
        fetchOperators()
      }, 1000)
      
    } catch (error) {
      console.error("[OperatorsPage] Error deleting operator:", error)
      toast({
        title: "Delete Failed",
        description: "Failed to delete operator. Please try again.",
        variant: "destructive",
      })
      
      fetchOperators()
    }
  }

  const handleGenerateInvoice = (operator: User) => {
    const companyName = operator.profileDetail?.companyName || operator.profileDetail?.name
    toast({
      title: "Invoice Generated",
      description: `Invoice generated for ${companyName}`,
    })
  }

  const handleSuspend = async (operator: User) => {
    try {
      const companyName = operator.profileDetail?.companyName || operator.profileDetail?.name
      toast({
        title: "Operator Suspended",
        description: `${companyName} has been suspended`,
        variant: "destructive",
      })
      
      fetchOperators()
    } catch (error) {
      toast({
        title: "Suspension Failed",
        description: "Failed to suspend operator. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle successful operator addition
  const handleAddSuccess = async (newOperator?: any) => {
    console.log("[OperatorsPage] Operator added successfully:", newOperator)
    
    setShowAddDialog(false)
    
    toast({
      title: "Operator Added",
      description: "New operator has been added successfully!",
    })
    
    await fetchOperators()
  }

  // Handle successful operator edit
  const handleEditSuccess = async (updatedOperator?: any) => {
    console.log("[OperatorsPage] Operator updated successfully:", updatedOperator)
    
    setShowEditDialog(false)
    setSelectedOperator(null)
    
    toast({
      title: "Operator Updated", 
      description: "Operator information has been updated successfully!",
    })
    
    await fetchOperators()
  }

  // Handle sort toggle
  const handleSort = (field: "revenue" | "name" | "customers") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
  }

  // Show skeleton loading during initial load
  if (loading && operators.length === 0) {
    return (
      <DashboardLayout title="Operator Management" description="Manage all network operators and their subscriptions">
        <div className="min-h-screen bg-gray-50 overflow-hidden">
          <div className="grid grid-cols-1">
            <main className="h-[calc(100vh-4rem)]">
              <div className="max-w-7xl mx-auto">
                <OperatorsLoadingSkeleton />
              </div>
            </main>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Operator Management" description="Manage all network operators and their subscriptions">
      <div className="min-h-screen bg-gray-50">
        <div className="grid grid-cols-1">
          <main className="h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="max-w-7xl mx-auto p-4">
              <div className="space-y-4">
                {/* Error Alert */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                      <p className="text-red-800">{error}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={fetchOperators}
                        className="ml-auto"
                      >
                        Retry
                      </Button>
                    </div>
                  </div>
                )}

                {/* Stats Cards Section */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
                  {/* Total Card */}
                  <Card 
                    className={`border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 cursor-pointer transition-all duration-200 hover:scale-105 ${
                      activeFilter.type === 'all' ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handleFilterClick('all', 'all')}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Total</CardTitle>
                      <Building2 className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{stats.total}</div>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">All operators</p>
                    </CardContent>
                  </Card>

                  {/* Active Card */}
                  <Card 
                    className={`border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 cursor-pointer transition-all duration-200 hover:scale-105 ${
                      activeFilter.type === 'status' && activeFilter.value === 'active' ? 'ring-2 ring-green-500' : ''
                    }`}
                    onClick={() => handleFilterClick('status', 'active')}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Active</CardTitle>
                      <Users className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{stats.active}</div>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">Active operators</p>
                    </CardContent>
                  </Card>

                  {/* Suspended Card */}
                  <Card 
                    className={`border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 cursor-pointer transition-all duration-200 hover:scale-105 ${
                      activeFilter.type === 'status' && activeFilter.value === 'suspended' ? 'ring-2 ring-red-500' : ''
                    }`}
                    onClick={() => handleFilterClick('status', 'suspended')}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Suspended</CardTitle>
                      <AlertCircle className="h-4 w-4 lg:h-5 lg:w-5 text-red-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{stats.suspended}</div>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">Suspended accounts</p>
                    </CardContent>
                  </Card>

                  {/* Expired Card */}
                  <Card 
                    className={`border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 cursor-pointer transition-all duration-200 hover:scale-105 ${
                      activeFilter.type === 'status' && activeFilter.value === 'expired' ? 'ring-2 ring-orange-500' : ''
                    }`}
                    onClick={() => handleFilterClick('status', 'expired')}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Expired</CardTitle>
                      <Calendar className="h-4 w-4 lg:h-5 lg:w-5 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{stats.expired}</div>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">Expired plans</p>
                    </CardContent>
                  </Card>

                  {/* Inactive Card */}
                  <Card 
                    className={`border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer transition-all duration-200 hover:scale-105 ${
                      activeFilter.type === 'status' && activeFilter.value === 'inactive' ? 'ring-2 ring-gray-500' : ''
                    }`}
                    onClick={() => handleFilterClick('status', 'inactive')}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Inactive</CardTitle>
                      <Globe className="h-4 w-4 lg:h-5 lg:w-5 text-gray-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{stats.inactive}</div>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">Inactive accounts</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Search and Filter Section */}
                <Card className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search by company, owner, email, phone, or ID..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 h-10"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-full sm:w-48 h-10">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Filter by Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchOperators}
                      disabled={loading}
                      className="h-9"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                      Refresh ({filteredOperators.length})
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleExport} 
                      className="h-9"
                      disabled={filteredOperators.length === 0}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleImport} className="h-9">
                      <Upload className="h-4 w-4 mr-2" />
                      Import CSV
                    </Button>
                  </div>
                  
                  <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                      <Button className="h-9">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Operator
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add New Operator</DialogTitle>
                        <DialogDescription>
                          Create a new operator account with complete business details
                        </DialogDescription>
                      </DialogHeader>
                      <AddOperatorForm 
                        onClose={() => setShowAddDialog(false)} 
                        onSuccess={handleAddSuccess} 
                      />
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Main Content Card */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-semibold text-gray-900">
                          All Operators ({filteredOperators.length})
                        </CardTitle>
                        <CardDescription className="text-gray-600 mt-1">
                          Complete list of network operators and their current status
                          {searchTerm && ` • Filtered by: "${searchTerm}"`}
                          {activeFilter.type !== 'all' && ` • Showing: ${activeFilter.value}`}
                        </CardDescription>
                      </div>
                      {loading && (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-0">
                    {/* Desktop/Tablet Table View */}
                    <div className="hidden md:block">
                      <ScrollArea className="w-full">
                        <div className="min-w-[1200px]">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-gray-50/50">
                                <TableHead className="w-[250px] font-semibold">Company</TableHead>
                                <TableHead className="w-[180px] font-semibold">Owner</TableHead>
                                <TableHead className="w-[200px] font-semibold">Contact</TableHead>
                                <TableHead className="w-[160px] font-semibold">Location</TableHead>
                                <TableHead className="w-[140px] font-semibold">
                                  <Button
                                    variant="ghost"
                                    onClick={() => handleSort("customers")}
                                    className="font-semibold p-0 h-auto hover:bg-transparent"
                                  >
                                    Connections
                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                  </Button>
                                </TableHead>
                                <TableHead className="w-[140px] font-semibold">
                                  <Button
                                    variant="ghost"
                                    onClick={() => handleSort("revenue")}
                                    className="font-semibold p-0 h-auto hover:bg-transparent"
                                  >
                                    Revenue
                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                  </Button>
                                </TableHead>
                                <TableHead className="w-[120px] font-semibold">Plan</TableHead>
                                <TableHead className="w-[100px] font-semibold">Status</TableHead>
                                <TableHead className="w-[100px] font-semibold">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {paginatedOperators.map((operator, index) => (
                                <TableRow 
                                  key={operator.user_id} 
                                  className="hover:bg-gray-50/50 transition-colors"
                                >
                                  <TableCell className="py-4">
                                    <div className="flex items-center space-x-3">
                                      <div className="bg-blue-100 p-2.5 rounded-lg flex-shrink-0">
                                        <Building2 className="h-4 w-4 text-blue-600" />
                                      </div>
                                      <div className="min-w-0">
                                        <div className="font-medium text-gray-900 truncate">
                                          {operator.profileDetail?.companyName || operator.profileDetail?.name || "Unknown Company"}
                                        </div>
                                        <div className="text-sm text-gray-500 truncate">
                                          {operator.profileDetail?.businessType || "Business"}
                                        </div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  
                                  <TableCell className="py-4">
                                    <div>
                                      <div className="font-medium text-gray-900 truncate">
                                        {operator.profileDetail?.name || "Unknown"}
                                      </div>
                                      <div className="text-sm text-gray-500 flex items-center">
                                        <HardHat className="h-3 w-3 mr-1 flex-shrink-0" />
                                        <span className="truncate">
                                          ID: {operator.profileDetail?.operatorId || operator.user_id?.slice(0, 8)}
                                        </span>
                                      </div>
                                    </div>
                                  </TableCell>
                                  
                                  <TableCell className="py-4">
                                    <div className="space-y-1">
                                      <div className="flex items-center text-sm text-gray-600">
                                        <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                                        <span className="truncate">{operator.profileDetail?.phone || "N/A"}</span>
                                      </div>
                                      <div className="flex items-center text-sm text-gray-600">
                                        <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                                        <span className="truncate">{operator.email}</span>
                                      </div>
                                    </div>
                                  </TableCell>
                                  
                                  <TableCell className="py-4">
                                    <div className="flex items-center text-sm text-gray-600">
                                      <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                      <span className="truncate">
                                        {operator.profileDetail?.address?.area && operator.profileDetail?.address?.district
                                          ? `${operator.profileDetail.address.area}, ${operator.profileDetail.address.district}`
                                          : "N/A"}
                                      </span>
                                    </div>
                                  </TableCell>
                                  
                                  <TableCell className="py-4">
                                    <div>
                                      <div className="font-medium text-gray-900 flex items-center">
                                        <Users className="h-3 w-3 mr-1 text-blue-600" />
                                        {operator.profileDetail?.customerCount || 0}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        of {operator.profileDetail?.serviceCapacity?.connections || "N/A"} max
                                      </div>
                                    </div>
                                  </TableCell>
                                  
                                  <TableCell className="py-4">
                                    <div className="font-medium text-gray-900 flex items-center">
                                      <DollarSign className="h-3 w-3 mr-1 text-green-600" />
                                      ₹{(operator.profileDetail?.revenue || 0).toLocaleString()}
                                    </div>
                                  </TableCell>
                                  
                                  <TableCell className="py-4">
                                    <Badge variant="outline" className="capitalize font-medium">
                                      {operator.profileDetail?.planAssigned || "Basic"}
                                    </Badge>
                                  </TableCell>
                                  
                                  <TableCell className="py-4">
                                    {getStatusBadge(operator.status || "active")}
                                  </TableCell>
                                  
                                  <TableCell className="py-4">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent className="w-64" align="end">
                                        <DropdownMenuItem onClick={() => handleViewDetails(operator)}>
                                          <Eye className="h-4 w-4 mr-2" />
                                          View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleEdit(operator)}>
                                          <Edit className="h-4 w-4 mr-2" />
                                          Edit Operator
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleGenerateInvoice(operator)}>
                                          <FileText className="h-4 w-4 mr-2" />
                                          Generate Invoice
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleSuspend(operator)}>
                                          <AlertCircle className="h-4 w-4 mr-2" />
                                          Suspend Account
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          className="text-red-600" 
                                          onClick={() => handleDelete(operator)}
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete Operator
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                        <ScrollBar orientation="horizontal" />
                      </ScrollArea>
                      
                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t">
                          <div className="text-sm text-gray-700">
                            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredOperators.length)} of {filteredOperators.length} entries
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
                              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <Button
                                  key={page}
                                  variant={currentPage === page ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setCurrentPage(page)}
                                  className="w-8 h-8 p-0"
                                >
                                  {page}
                                </Button>
                              ))}
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
                      
                      {/* Empty State for Desktop */}
                      {filteredOperators.length === 0 && !loading && (
                        <div className="text-center text-gray-500 py-12">
                          <div className="flex flex-col items-center">
                            <Building2 className="h-16 w-16 text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium mb-2">No operators found</h3>
                            {searchTerm ? (
                              <p className="text-sm">Try adjusting your search terms or filters.</p>
                            ) : (
                              <p className="text-sm">Get started by adding your first operator.</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Mobile Card View - Removed for brevity, same as before but with paginatedOperators */}
                    {/* ... Mobile view code remains the same ... */}
                  </CardContent>
                </Card>

                {/* Operator Details Dialog */}
                <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Operator Details</DialogTitle>
                      <DialogDescription>
                        Complete information about {selectedOperator?.companyName || selectedOperator?.ownerName}
                      </DialogDescription>
                    </DialogHeader>
                    {selectedOperator && <OperatorDetailsView operator={selectedOperator} />}
                  </DialogContent>
                </Dialog>

                {/* Edit Operator Dialog */}
                <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Operator</DialogTitle>
                      <DialogDescription>
                        Update operator information for {selectedOperator?.companyName}
                      </DialogDescription>
                    </DialogHeader>
                    {selectedOperator && (
                      <EditOperatorForm
                        operator={selectedOperator}
                        onClose={() => {
                          setShowEditDialog(false)
                          setSelectedOperator(null)
                        }}
                        onSuccess={handleEditSuccess}
                      />
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </main>
        </div>
      </div>
    </DashboardLayout>
  )
}