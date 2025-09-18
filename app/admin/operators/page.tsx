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
  const [loading, setLoading] = useState(true) // Changed to true initially
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Transform User to Operator helper function
 // In your OperatorsPage, update the transform function:
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
      olts: user.profileDetail?.serviceCapacity?.olts || 0, // Add this
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
    // Add the missing properties:
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

  // Filter operators with improved search
  const filteredOperators = operators.filter((operator) => {
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
      <div className="min-h-screen bg-gray-50 overflow-y">
        <div className="grid grid-cols-1">
          <main className="h-[calc(100vh-4rem)]">
            <div className="max-w-7xl mx-auto">
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

                {/* Header Section */}
                <div className="flex flex-col space-y-4">
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
                        </CardDescription>
                      </div>
                      {loading && (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-0">
                    {/* Desktop/Tablet Table View with Horizontal Scroll */}
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
                                <TableHead className="w-[140px] font-semibold">Connections</TableHead>
                                <TableHead className="w-[120px] font-semibold">Revenue</TableHead>
                                <TableHead className="w-[100px] font-semibold">Plan</TableHead>
                                <TableHead className="w-[100px] font-semibold">Status</TableHead>
                                <TableHead className="w-[100px] font-semibold">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredOperators.map((operator, index) => (
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

                    {/* Mobile Card View with Vertical Scrolling */}
                    <div className="md:hidden">
                      <ScrollArea className="h-[600px] w-full">
                        <div className="space-y-3 p-4">
                          {filteredOperators.map((operator) => (
                            <Card key={operator.user_id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="space-y-4">
                                  {/* Header */}
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                                      <div className="bg-blue-100 p-2.5 rounded-lg flex-shrink-0">
                                        <Building2 className="h-5 w-5 text-blue-600" />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-gray-900 truncate text-sm">
                                          {operator.profileDetail?.companyName || operator.profileDetail?.name || "Unknown Company"}
                                        </h3>
                                        <p className="text-xs text-gray-500 truncate">
                                          {operator.profileDetail?.businessType || "Business"}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2 flex-shrink-0">
                                      {getStatusBadge(operator.status || "active")}
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-48" align="end">
                                          <DropdownMenuItem onClick={() => handleViewDetails(operator)}>
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Details
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => handleEdit(operator)}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => handleGenerateInvoice(operator)}>
                                            <FileText className="h-4 w-4 mr-2" />
                                            Invoice
                                          </DropdownMenuItem>
                                          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(operator)}>
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </div>

                                  {/* Owner and Plan */}
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-medium text-gray-900 text-sm flex items-center">
                                        <HardHat className="h-3 w-3 mr-1 text-gray-400" />
                                        {operator.profileDetail?.name || "Unknown"}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        ID: {operator.profileDetail?.operatorId || operator.user_id?.slice(0, 8)}
                                      </div>
                                    </div>
                                    <Badge variant="outline" className="text-xs font-medium">
                                      {operator.profileDetail?.planAssigned || "Basic"}
                                    </Badge>
                                  </div>

                                  {/* Contact Grid */}
                                  <div className="grid grid-cols-1 gap-2">
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Phone className="h-3 w-3 mr-2 text-green-600 flex-shrink-0" />
                                      <span className="truncate">{operator.profileDetail?.phone || "N/A"}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Mail className="h-3 w-3 mr-2 text-blue-600 flex-shrink-0" />
                                      <span className="truncate">{operator.email}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                      <MapPin className="h-3 w-3 mr-2 text-red-600 flex-shrink-0" />
                                      <span className="truncate">
                                        {operator.profileDetail?.address?.area && operator.profileDetail?.address?.district
                                          ? `${operator.profileDetail.address.area}, ${operator.profileDetail.address.district}`
                                          : "N/A"}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Stats */}
                                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                                    <div>
                                      <div className="flex items-center text-xs text-gray-500 mb-1">
                                        <Users className="h-3 w-3 mr-1" />
                                        Connections
                                      </div>
                                      <div className="font-semibold text-sm text-gray-900">
                                        {operator.profileDetail?.customerCount || 0}
                                        <span className="text-xs text-gray-500 ml-1 font-normal">
                                          / {operator.profileDetail?.serviceCapacity?.connections || "N/A"}
                                        </span>
                                      </div>
                                    </div>
                                    <div>
                                      <div className="flex items-center text-xs text-gray-500 mb-1">
                                        <DollarSign className="h-3 w-3 mr-1" />
                                        Revenue
                                      </div>
                                      <div className="font-semibold text-sm text-gray-900">
                                        ₹{(operator.profileDetail?.revenue || 0).toLocaleString()}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}

                          {/* Empty State for Mobile */}
                          {filteredOperators.length === 0 && !loading && (
                            <div className="text-center text-gray-500 py-12">
                              <Building2 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                              <h3 className="text-lg font-medium mb-2">No operators found</h3>
                              {searchTerm ? (
                                <p className="text-sm">Try adjusting your search terms or filters.</p>
                              ) : (
                                <p className="text-sm">Get started by adding your first operator.</p>
                              )}
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
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
