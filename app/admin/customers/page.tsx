"use client"

import { useState, useEffect, useMemo } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  User,
  Phone,
  Mail,
  MapPin,
  Download,
  RefreshCw,
  Users,
  UserCheck,
  UserX,
  AlertTriangle,
  CreditCard,
  Wifi,
  AlertCircle,
  Upload,
  DollarSign,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { exportToCSV } from "@/lib/utils"
import AddCustomerForm from "@/components/AddCustomerForm"
import EditCustomerForm from "@/components/EditCustomerForm"
import ViewCustomerDialog from "@/components/ViewCustomerDialog"
import { customerApi } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  customerId: string
  plan: string
  connectionStatus: string
  monthlyCharges: number
  address: string
  joinDate: string
  lastPayment: string
  outstandingAmount: number
  connectionType: string
  planId?: string
}

interface SortConfig {
  key: keyof Customer | null
  direction: 'asc' | 'desc'
}

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [planFilter, setPlanFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' })
  const { toast } = useToast()
  const { user } = useAuth()

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await customerApi.getAll()
      
      const transformedCustomers = response.map((apiUser: any) => ({
        id: apiUser.id || apiUser.user_id || `temp-${Date.now()}-${Math.random()}`,
        name: apiUser.profileDetail?.name || apiUser.email || "Unknown",
        email: apiUser.email || "",
        phone: apiUser.profileDetail?.phone || "",
        customerId: apiUser.profileDetail?.customerId || `CUST${apiUser.id || apiUser.user_id}`,
        plan: apiUser.profileDetail?.planId || "basic",
        connectionStatus: apiUser.status || "pending",
        monthlyCharges: Number(apiUser.profileDetail?.monthlyRate) || 0,
        address: apiUser.profileDetail?.address || "",
        joinDate: apiUser.createdAt ? new Date(apiUser.createdAt).toISOString().split('T')[0] : "",
        lastPayment: apiUser.profileDetail?.lastPayment || "",
        outstandingAmount: Number(apiUser.profileDetail?.outstandingAmount) || 0,
        connectionType: apiUser.profileDetail?.connectionType || "fiber",
        planId: apiUser.profileDetail?.planId
      }))
      
      setCustomers(transformedCustomers)
    } catch (error) {
      console.error("Error fetching customers:", error)
      setError("Failed to load customers. Please try again.")
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const handleSort = (key: keyof Customer) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedCustomers = useMemo(() => {
    if (!sortConfig.key) return customers
    
    return [...customers].sort((a, b) => {
      const aValue = a[sortConfig.key!]
      const bValue = b[sortConfig.key!]
      
      if (aValue == null && bValue == null) return 0
      if (aValue == null) return sortConfig.direction === 'asc' ? 1 : -1
      if (bValue == null) return sortConfig.direction === 'asc' ? -1 : 1
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
      }
      
      const aString = String(aValue).toLowerCase()
      const bString = String(bValue).toLowerCase()
      
      if (aString < bString) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aString > bString) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [customers, sortConfig])

  const filteredCustomers = sortedCustomers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)

    const matchesPlan = planFilter === "all" || customer.plan === planFilter
    const matchesStatus = statusFilter === "all" || customer.connectionStatus === statusFilter

    return matchesSearch && matchesPlan && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactive</Badge>
      case "suspended":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Suspended</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Unknown</Badge>
    }
  }

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case "basic":
        return "Basic (50 Mbps)"
      case "standard":
        return "Standard (100 Mbps)"
      case "premium":
        return "Premium (200 Mbps)"
      case "enterprise":
        return "Enterprise (500 Mbps)"
      default:
        return plan
    }
  }

  const getConnectionTypeIcon = (type: string) => {
    switch (type) {
      case "fiber":
        return <Wifi className="h-4 w-4 text-blue-600" />
      case "broadband":
        return <Wifi className="h-4 w-4 text-green-600" />
      case "wireless":
        return <Wifi className="h-4 w-4 text-purple-600" />
      default:
        return <Wifi className="h-4 w-4 text-gray-600" />
    }
  }

  const handleExport = () => {
    const exportData = filteredCustomers.map((customer) => ({
      "Customer ID": customer.customerId,
      Name: customer.name,
      Email: customer.email,
      Phone: customer.phone,
      Plan: getPlanLabel(customer.plan),
      "Connection Status": customer.connectionStatus,
      "Connection Type": customer.connectionType,
      "Monthly Charges": `₹${customer.monthlyCharges}`,
      "Outstanding Amount": `₹${customer.outstandingAmount}`,
      Address: customer.address,
      "Join Date": customer.joinDate,
      "Last Payment": customer.lastPayment || "N/A",
    }))
    exportToCSV(exportData, "customers-list")
    toast({
      title: "Export Successful",
      description: "Customers data exported successfully!",
    })
  }

  const handleImport = () => {
    // Import functionality placeholder
    toast({
      title: "Import Feature",
      description: "Import functionality will be implemented soon.",
    })
  }

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowViewDialog(true)
  }

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowEditDialog(true)
  }

  const handleDelete = async (customer: Customer) => {
    if (!customer.id) {
      toast({
        title: "Error",
        description: "Customer ID is missing. Cannot delete customer.",
        variant: "destructive",
      })
      return
    }

    if (!confirm(`Are you sure you want to delete ${customer.name}? This action cannot be undone.`)) {
      return
    }

    try {
      await customerApi.delete(customer.id)
      toast({
        title: "Customer Deleted",
        description: `${customer.name} has been removed from the system.`,
      })
      fetchCustomers()
    } catch (error) {
      console.error("Delete error:", error)
      toast({
        title: "Error",
        description: "Failed to delete customer. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSuspend = async (customer: Customer) => {
    if (!customer.id) {
      toast({
        title: "Error",
        description: "Customer ID is missing. Cannot suspend customer.",
        variant: "destructive",
      })
      return
    }

    try {
      await customerApi.update(customer.id, { 
        status: "suspended"
      })
      toast({
        title: "Customer Suspended",
        description: `${customer.name}'s connection has been suspended.`,
        variant: "destructive",
      })
      fetchCustomers()
    } catch (error) {
      console.error("Suspend error:", error)
      toast({
        title: "Error",
        description: "Failed to suspend customer. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleActivate = async (customer: Customer) => {
    if (!customer.id) {
      toast({
        title: "Error",
        description: "Customer ID is missing. Cannot activate customer.",
        variant: "destructive",
      })
      return
    }

    try {
      await customerApi.update(customer.id, { 
        status: "active"
      })
      toast({
        title: "Customer Activated",
        description: `${customer.name}'s connection has been activated.`,
      })
      fetchCustomers()
    } catch (error) {
      console.error("Activate error:", error)
      toast({
        title: "Error",
        description: "Failed to activate customer. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddSuccess = () => {
    setShowAddDialog(false)
    fetchCustomers()
    toast({
      title: "Customer Added",
      description: "New customer has been added successfully!",
    })
  }

  const handleEditSuccess = () => {
    setShowEditDialog(false)
    fetchCustomers()
    toast({
      title: "Customer Updated",
      description: "Customer information has been updated successfully!",
    })
  }

  const totalCustomers = customers.length
  const activeCustomers = customers.filter((c) => c.connectionStatus === "active").length
  const suspendedCustomers = customers.filter((c) => c.connectionStatus === "suspended").length
  const pendingCustomers = customers.filter((c) => c.connectionStatus === "pending").length
  const totalRevenue = customers.reduce((sum, c) => sum + c.monthlyCharges, 0)
  const outstandingAmount = customers.reduce((sum, c) => sum + c.outstandingAmount, 0)

  return (
    <DashboardLayout title="Customer Management" description="Manage customer accounts and service connections">
      <div className="min-h-screen bg-gray-50 overflow-hidden">
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
                        onClick={fetchCustomers}
                        className="ml-auto"
                      >
                        Retry
                      </Button>
                    </div>
                  </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  {[
                    {
                      title: "Total Customers",
                      value: totalCustomers,
                      description: "Registered customers",
                      icon: Users,
                      gradient: "from-blue-50 to-blue-100",
                      iconBg: "bg-blue-500"
                    },
                    {
                      title: "Active",
                      value: activeCustomers,
                      description: "Active connections",
                      icon: UserCheck,
                      gradient: "from-green-50 to-green-100",
                      iconBg: "bg-green-500"
                    },
                    {
                      title: "Monthly Revenue",
                      value: `₹${totalRevenue.toLocaleString()}`,
                      description: "Total monthly billing",
                      icon: CreditCard,
                      gradient: "from-purple-50 to-purple-100",
                      iconBg: "bg-purple-500"
                    },
                    {
                      title: "Outstanding",
                      value: `₹${outstandingAmount.toLocaleString()}`,
                      description: "Pending payments",
                      icon: AlertTriangle,
                      gradient: "from-red-50 to-red-100",
                      iconBg: "bg-red-500"
                    }
                  ].map((stat, index) => (
                    <Card key={`stat-${index}`} className={`border-0 shadow-lg bg-gradient-to-br ${stat.gradient}`}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 lg:px-6">
                        <CardTitle className="text-xs sm:text-sm font-medium text-gray-700 truncate">{stat.title}</CardTitle>
                        <div className={`p-2 ${stat.iconBg} rounded-lg flex-shrink-0`}>
                          <stat.icon className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                        </div>
                      </CardHeader>
                      <CardContent className="px-4 lg:px-6">
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">{stat.value}</div>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">{stat.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Header Section */}
                <div className="flex flex-col space-y-4">
                  {/* Search and Filter Section */}
                  <Card className="shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            placeholder="Search by name, email, phone, or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-10"
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Select value={planFilter} onValueChange={setPlanFilter}>
                            <SelectTrigger className="w-full sm:w-48 h-10">
                              <Filter className="h-4 w-4 mr-2" />
                              <SelectValue placeholder="Filter by Plan" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Plans</SelectItem>
                              <SelectItem value="basic">Basic</SelectItem>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="premium">Premium</SelectItem>
                              <SelectItem value="enterprise">Enterprise</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-48 h-10">
                              <Filter className="h-4 w-4 mr-2" />
                              <SelectValue placeholder="Filter by Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="suspended">Suspended</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
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
                        onClick={fetchCustomers}
                        disabled={loading}
                        className="h-9"
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                        Refresh ({filteredCustomers.length})
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleExport} 
                        className="h-9"
                        disabled={filteredCustomers.length === 0}
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
                          Add New Customer
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Add New Customer</DialogTitle>
                          <DialogDescription>
                            Create a new customer account with service details
                          </DialogDescription>
                        </DialogHeader>
                        <AddCustomerForm 
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
                          All Customers ({filteredCustomers.length})
                        </CardTitle>
                        <CardDescription className="text-gray-600 mt-1">
                          Complete list of customers and their service status
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
                                <TableHead className="w-[220px] font-semibold">Customer</TableHead>
                                <TableHead className="w-[200px] font-semibold">Contact</TableHead>
                                <TableHead className="w-[180px] font-semibold">Service Plan</TableHead>
                                <TableHead className="w-[140px] font-semibold">Billing</TableHead>
                                <TableHead className="w-[180px] font-semibold">Address</TableHead>
                                <TableHead className="w-[100px] font-semibold">Status</TableHead>
                                <TableHead className="w-[100px] font-semibold">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredCustomers.map((customer) => (
                                <TableRow 
                                  key={customer.id} 
                                  className="hover:bg-gray-50/50 transition-colors"
                                >
                                  <TableCell className="py-4">
                                    <div className="flex items-center space-x-3">
                                      <div className="bg-blue-100 p-2.5 rounded-lg flex-shrink-0">
                                        <User className="h-4 w-4 text-blue-600" />
                                      </div>
                                      <div className="min-w-0">
                                        <div className="font-medium text-gray-900 truncate">
                                          {customer.name}
                                        </div>
                                        <div className="text-sm text-gray-500 truncate">
                                          ID: {customer.customerId}
                                        </div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  
                                  <TableCell className="py-4">
                                    <div className="space-y-1">
                                      <div className="flex items-center text-sm text-gray-600">
                                        <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                                        <span className="truncate">{customer.phone || "N/A"}</span>
                                      </div>
                                      <div className="flex items-center text-sm text-gray-600">
                                        <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                                        <span className="truncate">{customer.email}</span>
                                      </div>
                                    </div>
                                  </TableCell>
                                  
                                  <TableCell className="py-4">
                                    <div className="flex items-center space-x-2">
                                      {getConnectionTypeIcon(customer.connectionType)}
                                      <div className="min-w-0 flex-1">
                                        <div className="font-medium text-gray-900 text-sm truncate">
                                          {getPlanLabel(customer.plan)}
                                        </div>
                                        <div className="text-sm text-gray-500 capitalize">
                                          {customer.connectionType}
                                        </div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  
                                  <TableCell className="py-4">
                                    <div>
                                      <div className="font-medium text-gray-900 flex items-center">
                                        <DollarSign className="h-3 w-3 mr-1 text-green-600" />
                                        ₹{customer.monthlyCharges.toLocaleString()}
                                      </div>
                                      {customer.outstandingAmount > 0 && (
                                        <div className="text-sm text-red-600">
                                          Due: ₹{customer.outstandingAmount.toLocaleString()}
                                        </div>
                                      )}
                                    </div>
                                  </TableCell>
                                  
                                  <TableCell className="py-4">
                                    <div className="flex items-center text-sm text-gray-600">
                                      <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                      <span className="truncate">{customer.address || "N/A"}</span>
                                    </div>
                                  </TableCell>
                                  
                                  <TableCell className="py-4">
                                    {getStatusBadge(customer.connectionStatus)}
                                  </TableCell>
                                  
                                  <TableCell className="py-4">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent className="w-64" align="end">
                                        <DropdownMenuItem onClick={() => handleViewDetails(customer)}>
                                          <Eye className="h-4 w-4 mr-2" />
                                          View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleEdit(customer)}>
                                          <Edit className="h-4 w-4 mr-2" />
                                          Edit Customer
                                        </DropdownMenuItem>
                                        {customer.connectionStatus === "active" ? (
                                          <DropdownMenuItem onClick={() => handleSuspend(customer)}>
                                            <UserX className="h-4 w-4 mr-2" />
                                            Suspend Service
                                          </DropdownMenuItem>
                                        ) : (
                                          <DropdownMenuItem onClick={() => handleActivate(customer)}>
                                            <UserCheck className="h-4 w-4 mr-2" />
                                            Activate Service
                                          </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem 
                                          className="text-red-600" 
                                          onClick={() => handleDelete(customer)}
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete Customer
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
                      {filteredCustomers.length === 0 && !loading && (
                        <div className="text-center text-gray-500 py-12">
                          <div className="flex flex-col items-center">
                            <User className="h-16 w-16 text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium mb-2">No customers found</h3>
                            {searchTerm ? (
                              <p className="text-sm">Try adjusting your search terms or filters.</p>
                            ) : (
                              <p className="text-sm">Get started by adding your first customer.</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Mobile Card View with Vertical Scrolling */}
                    <div className="md:hidden">
                      <ScrollArea className="h-[600px] w-full">
                        <div className="space-y-3 p-4">
                          {filteredCustomers.map((customer) => (
                            <Card key={customer.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="space-y-4">
                                  {/* Header */}
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                                      <div className="bg-blue-100 p-2.5 rounded-lg flex-shrink-0">
                                        <User className="h-5 w-5 text-blue-600" />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-gray-900 truncate text-sm">
                                          {customer.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 truncate">
                                          ID: {customer.customerId}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2 flex-shrink-0">
                                      {getStatusBadge(customer.connectionStatus)}
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-48" align="end">
                                          <DropdownMenuItem onClick={() => handleViewDetails(customer)}>
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Details
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => handleEdit(customer)}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                          </DropdownMenuItem>
                                          {customer.connectionStatus === "active" ? (
                                            <DropdownMenuItem onClick={() => handleSuspend(customer)}>
                                              <UserX className="h-4 w-4 mr-2" />
                                              Suspend
                                            </DropdownMenuItem>
                                          ) : (
                                            <DropdownMenuItem onClick={() => handleActivate(customer)}>
                                              <UserCheck className="h-4 w-4 mr-2" />
                                              Activate
                                            </DropdownMenuItem>
                                          )}
                                          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(customer)}>
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </div>

                                  {/* Plan and Billing */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                                      {getConnectionTypeIcon(customer.connectionType)}
                                      <div className="min-w-0 flex-1">
                                        <div className="font-medium text-gray-900 text-sm truncate">
                                          {getPlanLabel(customer.plan)}
                                        </div>
                                        <div className="text-xs text-gray-500 capitalize">
                                          {customer.connectionType}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                      <div className="font-semibold text-sm text-gray-900">
                                        ₹{customer.monthlyCharges.toLocaleString()}/mo
                                      </div>
                                      {customer.outstandingAmount > 0 && (
                                        <div className="text-xs text-red-600">
                                          Due: ₹{customer.outstandingAmount.toLocaleString()}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Contact Grid */}
                                  <div className="grid grid-cols-1 gap-2">
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Phone className="h-3 w-3 mr-2 text-green-600 flex-shrink-0" />
                                      <span className="truncate">{customer.phone || "N/A"}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Mail className="h-3 w-3 mr-2 text-blue-600 flex-shrink-0" />
                                      <span className="truncate">{customer.email}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                      <MapPin className="h-3 w-3 mr-2 text-red-600 flex-shrink-0" />
                                      <span className="truncate">{customer.address || "N/A"}</span>
                                    </div>
                                  </div>

                                  {/* Join Date */}
                                  <div className="pt-2 border-t border-gray-100">
                                    <div className="text-xs text-gray-500">
                                      Joined: {customer.joinDate ? new Date(customer.joinDate).toLocaleDateString() : 'N/A'}
                                      {customer.lastPayment && (
                                        <span className="ml-4">
                                          Last Payment: {new Date(customer.lastPayment).toLocaleDateString()}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}

                          {/* Empty State for Mobile */}
                          {filteredCustomers.length === 0 && !loading && (
                            <div className="text-center text-gray-500 py-12">
                              <User className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                              <h3 className="text-lg font-medium mb-2">No customers found</h3>
                              {searchTerm ? (
                                <p className="text-sm">Try adjusting your search terms or filters.</p>
                              ) : (
                                <p className="text-sm">Get started by adding your first customer.</p>
                              )}
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </CardContent>
                </Card>

                {/* View Customer Dialog */}
                <ViewCustomerDialog 
                  customer={selectedCustomer}
                  open={showViewDialog}
                  onClose={() => setShowViewDialog(false)}
                />

                {/* Edit Customer Dialog */}
                <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Customer</DialogTitle>
                      <DialogDescription>
                        Update customer information for {selectedCustomer?.name}
                      </DialogDescription>
                    </DialogHeader>
                    {selectedCustomer && (
                      <EditCustomerForm
                        customer={selectedCustomer}
                        onClose={() => {
                          setShowEditDialog(false)
                          setSelectedCustomer(null)
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
