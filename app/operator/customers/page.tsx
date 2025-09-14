"use client"

import type React from "react"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Search,
  Users,
  UserPlus,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Wifi,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  RefreshCw,
} from "lucide-react"
import { formatDate, formatCurrency, getStatusColor, exportToCSV } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { operatorApi } from "@/lib/api"
import { showConfirmationDialog } from "@/lib/confirmation-dialog"

interface Customer {
  user_id: string
  email: string
  profileDetail: {
    name: string
    phone: string
    address: string
    planId: string
    monthlyRate: number
    connectionDate?: string
    installationType?: string
    technicianId?: string
    notes?: string
  }
  Permissions: {
    status: string
  }
  createdAt: string
  updatedAt: string
}

interface Plan {
  plan_id: string
  name: string
  speed: string
  price: number
  type: string
  description?: string
}

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [planFilter, setPlanFilter] = useState("all")
  const [showAddCustomerDialog, setShowAddCustomerDialog] = useState(false)
  const [showBulkUploadDialog, setShowBulkUploadDialog] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showCustomerDetailsDialog, setShowCustomerDetailsDialog] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("[v0] Fetching customers from API...")

      const [customersData] = await Promise.allSettled([
        operatorApi.getAlloperator(),
        // operatorApi.getAllPlans(),
      ])

      if (customersData.status === "fulfilled") {
        console.log("[v0] Customers fetched:", customersData.value.length)
        setCustomers(Array.isArray(customersData.value) ? customersData.value : [])
      } else {
        console.error("[v0] Error fetching customers:", customersData.reason)
        throw new Error("Failed to fetch customers")
      }

      // if (plansData.status === "fulfilled") {
      //   console.log("[v0] Plans fetched:", plansData.value.length)
      //   setPlans(Array.isArray(plansData.value) ? plansData.value : [])
      // } else {
      //   console.warn("[v0] Error fetching plans:", plansData.reason)
      //   // Set default plans if API fails
      //   setPlans([
      //     { plan_id: "PLAN001", name: "25 Mbps Basic", speed: "25 Mbps", price: 500, type: "residential" },
      //     { plan_id: "PLAN002", name: "50 Mbps Basic", speed: "50 Mbps", price: 800, type: "residential" },
      //     { plan_id: "PLAN003", name: "75 Mbps Standard", speed: "75 Mbps", price: 1000, type: "residential" },
      //     { plan_id: "PLAN004", name: "100 Mbps Premium", speed: "100 Mbps", price: 1200, type: "residential" },
      //     { plan_id: "PLAN005", name: "150 Mbps Premium", speed: "150 Mbps", price: 1800, type: "residential" },
      //     { plan_id: "PLAN006", name: "200 Mbps Business", speed: "200 Mbps", price: 2500, type: "business" },
      //   ])
      // }

      toast({
        title: "Data Loaded",
        description: "Customer data loaded successfully!",
      })
    } catch (err) {
      console.error("[v0] Error fetching customer data:", err)
      setError("Failed to load customer data. Please try again.")
      toast({
        title: "Error Loading Data",
        description: "Failed to load customer data. Please check your connection.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.profileDetail.name.toUpperCase().includes(searchTerm.toUpperCase()) ||
      customer.profileDetail.phone.includes(searchTerm) ||
      customer.email.toUpperCase().includes(searchTerm.toUpperCase()) ||
      customer.user_id.toUpperCase().includes(searchTerm.toUpperCase())
    const matchesStatus = statusFilter === "all" || customer.Permissions.status === statusFilter
    const matchesPlan = planFilter === "all" || customer.profileDetail.planId.includes(planFilter)
    return matchesSearch && matchesStatus && matchesPlan
  })

  const handleExport = () => {
    const exportData = customers.map((customer) => ({
      ID: customer.user_id,
      Name: customer.profileDetail.name,
      Phone: customer.profileDetail.phone,
      Email: customer.email,
      Address: customer.profileDetail.address,
      Plan: customer.profileDetail.planId,
      "Plan Price": customer.profileDetail.monthlyRate,
      Status: customer.Permissions.status,
      "Connection Date": customer.profileDetail.connectionDate || customer.createdAt,
      "Created At": customer.createdAt,
    }))
    exportToCSV(exportData, "customers")
    toast({
      title: "Export Successful",
      description: "Customer data has been exported to CSV file.",
    })
  }

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowCustomerDetailsDialog(true)
  }

  const handleEditCustomer = async (customerId: string) => {
    try {
      const customer = customers.find((c) => c.user_id === customerId)
      if (!customer) return

      // This would open an edit dialog in a real implementation
      toast({
        title: "Edit Customer",
        description: `Opening edit form for customer ${customer.profileDetail.name}`,
      })
    } catch (error) {
      console.error("[v0] Error editing customer:", error)
      toast({
        title: "Edit Failed",
        description: "Failed to edit customer. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      const customer = customers.find((c) => c.user_id === customerId)
      if (!customer) return

      const confirmed = await showConfirmationDialog({
        title: "Delete Customer",
        message: `Are you sure you want to delete customer "${customer.profileDetail.name}"? This action cannot be undone.`,
        confirmText: "Delete",
        cancelText: "Cancel",
        variant: "destructive",
      })

      if (confirmed) {
        console.log("[v0] Deleting customer:", customerId)
        await operatorApi.deleteCustomer(customerId)

        toast({
          title: "Customer Deleted",
          description: `Customer ${customer.profileDetail.name} has been deleted successfully.`,
        })

        // Refresh the customer list
        fetchCustomers()
      }
    } catch (error) {
      console.error("[v0] Error deleting customer:", error)
      toast({
        title: "Delete Failed",
        description: "Failed to delete customer. Please try again.",
        variant: "destructive",
      })
    }
  }

  const customerStats = {
    total: customers.length,
    active: customers.filter((c) => c.Permissions.status === "active").length,
    pending: customers.filter((c) => c.Permissions.status === "pending").length,
    suspended: customers.filter((c) => c.Permissions.status === "suspended").length,
    totalRevenue: customers.reduce((sum, c) => sum + (c.profileDetail.monthlyRate || 0), 0),
    outstandingAmount: customers.filter((c) => c.Permissions.status === "suspended").length * 1000, // Estimated
  }

  return (
    <DashboardLayout title="Customer Management" description="Manage your customers and their connections">
      <div className="space-y-6">
        {error && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <span className="text-yellow-800">{error}</span>
                </div>
                <Button variant="outline" size="sm" onClick={fetchCustomers} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Customers</CardTitle>
              <div className="p-2 bg-blue-500 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">
                {loading ? "..." : customerStats.total}
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600 font-medium">+12%</span>
                <span className="text-sm text-gray-500 ml-1">this month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Active</CardTitle>
              <div className="p-2 bg-green-500 rounded-lg">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">
                {loading ? "..." : customerStats.active}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {customerStats.total > 0 ? ((customerStats.active / customerStats.total) * 100).toFixed(1) : 0}% of
                total
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Pending</CardTitle>
              <div className="p-2 bg-yellow-500 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">
                {loading ? "..." : customerStats.pending}
              </div>
              <p className="text-sm text-gray-500 mt-2">Awaiting activation</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Outstanding</CardTitle>
              <div className="p-2 bg-red-500 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">
                {loading ? "..." : formatCurrency(customerStats.outstandingAmount)}
              </div>
              <p className="text-sm text-red-600 mt-2 font-medium">Needs collection</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="customers" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="customers" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                All Customers
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Analytics
              </TabsTrigger>
            </TabsList>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchCustomers} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Dialog open={showBulkUploadDialog} onOpenChange={setShowBulkUploadDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Bulk Upload
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Bulk Upload Customers</DialogTitle>
                    <DialogDescription>Upload a CSV file with customer data</DialogDescription>
                  </DialogHeader>
                  <BulkUploadForm onClose={() => setShowBulkUploadDialog(false)} />
                </DialogContent>
              </Dialog>
              <Dialog open={showAddCustomerDialog} onOpenChange={setShowAddCustomerDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Customer
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Customer</DialogTitle>
                    <DialogDescription>Create a new customer account</DialogDescription>
                  </DialogHeader>
                  <AddCustomerForm
                    plans={plans}
                    onClose={() => setShowAddCustomerDialog(false)}
                    onSuccess={fetchCustomers}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <TabsContent value="customers" className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="disconnected">Disconnected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="Basic">Basic Plans</SelectItem>
                  <SelectItem value="Standard">Standard Plans</SelectItem>
                  <SelectItem value="Premium">Premium Plans</SelectItem>
                  <SelectItem value="Business">Business Plans</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Customers Table */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Customers ({filteredCustomers.length})
                </CardTitle>
                <CardDescription>Manage your customer base and connections</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading customers...</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[200px]">Customer Details</TableHead>
                          <TableHead className="min-w-[150px]">Contact</TableHead>
                          <TableHead className="min-w-[120px]">Plan & Pricing</TableHead>
                          <TableHead className="min-w-[100px]">Status</TableHead>
                          <TableHead className="min-w-[120px]">Connection Info</TableHead>
                          <TableHead className="min-w-[120px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCustomers.map((customer) => (
                          <TableRow key={customer.user_id}>
                            <TableCell>
                              <div>
                                <div className="font-medium text-gray-900">{customer.profileDetail.name}</div>
                                <div className="text-sm text-gray-500">{customer.user_id}</div>
                                <div className="flex items-center text-xs text-gray-400 mt-1">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  <span className="truncate max-w-[180px]">{customer.profileDetail.address}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center text-sm">
                                  <Phone className="h-3 w-3 mr-1 text-gray-400" />
                                  {customer.profileDetail.phone}
                                </div>
                                <div className="flex items-center text-sm">
                                  <Mail className="h-3 w-3 mr-1 text-gray-400" />
                                  <span className="truncate max-w-[120px]">{customer.email}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <Badge variant="outline" className="mb-1">
                                  {customer.profileDetail.planId}
                                </Badge>
                                <div className="flex items-center text-sm font-medium">
                                  <DollarSign className="h-3 w-3 mr-1 text-gray-400" />
                                  {formatCurrency(customer.profileDetail.monthlyRate || 0)}/mo
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(customer.Permissions.status)}>
                                {customer.Permissions.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                                  {formatDate(customer.profileDetail.connectionDate || customer.createdAt)}
                                </div>
                                <div className="flex items-center">
                                  <Wifi className="h-3 w-3 mr-1 text-gray-400" />
                                  Connected
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="icon" onClick={() => handleViewCustomer(customer)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditCustomer(customer.user_id)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteCustomer(customer.user_id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredCustomers.length === 0 && !loading && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                              No customers found. {searchTerm && "Try adjusting your search terms."}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Customer Distribution by Plan</CardTitle>
                  <CardDescription>Breakdown of customers by service plans</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {plans.map((plan) => {
                      const count = customers.filter((c) =>
                        c.profileDetail.planId.includes(plan.name.split(" ")[1]),
                      ).length
                      const percentage = customerStats.total > 0 ? (count / customerStats.total) * 100 : 0
                      return (
                        <div key={plan.plan_id} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{plan.name}</span>
                            <span>
                              {count} ({percentage.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Revenue Analytics</CardTitle>
                  <CardDescription>Monthly revenue and outstanding amounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {formatCurrency(customerStats.totalRevenue)}
                      </div>
                      <p className="text-sm text-gray-500">Monthly Recurring Revenue</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-900">{customerStats.active}</div>
                        <p className="text-sm text-gray-500">Paying Customers</p>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-red-600">
                          {formatCurrency(customerStats.outstandingAmount)}
                        </div>
                        <p className="text-sm text-gray-500">Outstanding</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {formatCurrency(customerStats.totalRevenue / customerStats.total)}
                      </div>
                      <p className="text-sm text-gray-500">Average Revenue Per User</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Customer Details Dialog */}
        <Dialog open={showCustomerDetailsDialog} onOpenChange={setShowCustomerDetailsDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
              <DialogDescription>Complete information about the customer</DialogDescription>
            </DialogHeader>
            {selectedCustomer && <CustomerDetailsView customer={selectedCustomer} />}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

function AddCustomerForm({
  plans,
  onClose,
  onSuccess,
}: {
  plans: Plan[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    planId: "",
    monthlyRate: 0,
    installationType: "fiber",
    technicianId: "",
    connectionDate: "",
    notes: "",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      console.log("[v0] Creating customer:", formData)

      const customerData = {
        email: formData.email,
        profileDetail: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          planId: formData.planId,
          monthlyRate: formData.monthlyRate,
          connectionDate: formData.connectionDate || new Date().toISOString(),
          installationType: formData.installationType,
          technicianId: formData.technicianId,
          notes: formData.notes,
        },
      }

      await operatorApi.createCustomer(customerData)

      toast({
        title: "Customer Added",
        description: `${formData.name} has been added successfully.`,
      })

      onSuccess()
      onClose()
    } catch (error) {
      console.error("[v0] Error creating customer:", error)
      toast({
        title: "Creation Failed",
        description: "Failed to create customer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePlanChange = (planId: string) => {
    const selectedPlan = plans.find((p) => p.plan_id === planId)
    setFormData({
      ...formData,
      planId,
      monthlyRate: selectedPlan?.price || 0,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
            disabled={loading}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          disabled={loading}
        />
      </div>
      <div>
        <Label htmlFor="address">Full Address *</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          rows={3}
          required
          disabled={loading}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="plan">Service Plan *</Label>
          <Select value={formData.planId} onValueChange={handlePlanChange} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Select plan" />
            </SelectTrigger>
            <SelectContent>
              {plans.map((plan) => (
                <SelectItem key={plan.plan_id} value={plan.plan_id}>
                  {plan.name} - {formatCurrency(plan.price)}/mo
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="installationType">Installation Type</Label>
          <Select
            value={formData.installationType}
            onValueChange={(value) => setFormData({ ...formData, installationType: value })}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fiber">Fiber</SelectItem>
              <SelectItem value="cable">Cable</SelectItem>
              <SelectItem value="wireless">Wireless</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="connectionDate">Connection Date</Label>
          <Input
            id="connectionDate"
            type="date"
            value={formData.connectionDate}
            onChange={(e) => setFormData({ ...formData, connectionDate: e.target.value })}
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="monthlyRate">Monthly Rate</Label>
          <Input
            id="monthlyRate"
            type="number"
            value={formData.monthlyRate}
            onChange={(e) => setFormData({ ...formData, monthlyRate: Number(e.target.value) })}
            disabled={loading}
            readOnly
          />
        </div>
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          placeholder="Any additional notes or special instructions..."
          disabled={loading}
        />
      </div>
      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            "Add Customer"
          )}
        </Button>
      </div>
    </form>
  )
}

// Bulk Upload Form Component
function BulkUploadForm({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to upload.",
        variant: "destructive",
      })
      return
    }
    console.log("Bulk upload file:", file)
    toast({
      title: "Upload Started",
      description: "Processing your CSV file. You'll be notified when complete.",
    })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="file">CSV File *</Label>
        <Input id="file" type="file" accept=".csv" onChange={handleFileChange} required />
        <p className="text-sm text-gray-500 mt-1">Upload a CSV file with customer data. Maximum file size: 10MB</p>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">CSV Format Requirements:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Name, Phone, Email, Address, Plan (required columns)</li>
          <li>• Use comma-separated values</li>
          <li>• Include header row</li>
          <li>• Maximum 1000 records per file</li>
        </ul>
      </div>
      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Upload Customers</Button>
      </div>
    </form>
  )
}

function CustomerDetailsView({ customer }: { customer: Customer }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Personal Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Name:</span>
                <span className="font-medium">{customer.profileDetail.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Customer ID:</span>
                <span className="font-medium">{customer.user_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phone:</span>
                <span className="font-medium">{customer.profileDetail.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email:</span>
                <span className="font-medium">{customer.email}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Address</h3>
            <p className="text-sm text-gray-600">{customer.profileDetail.address}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Service Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Plan:</span>
                <span className="font-medium">{customer.profileDetail.planId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Monthly Fee:</span>
                <span className="font-medium">{formatCurrency(customer.profileDetail.monthlyRate || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <Badge className={getStatusColor(customer.Permissions.status)}>{customer.Permissions.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Connection Date:</span>
                <span className="font-medium">
                  {formatDate(customer.profileDetail.connectionDate || customer.createdAt)}
                </span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Technical Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Installation Type:</span>
                <span className="font-medium capitalize">{customer.profileDetail.installationType || "fiber"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Technician ID:</span>
                <span className="font-medium">{customer.profileDetail.technicianId || "Not assigned"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created:</span>
                <span className="font-medium">{formatDate(customer.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Updated:</span>
                <span className="font-medium">{formatDate(customer.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {customer.profileDetail.notes && (
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{customer.profileDetail.notes}</p>
        </div>
      )}
    </div>
  )
}
