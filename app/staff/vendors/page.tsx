"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Building, Star, TrendingUp, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"

export default function StaffVendorsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  useEffect(() => {
    fetchVendors()
  }, [])

  const fetchVendors = async () => {
    try {
      setLoading(true)

      // Fetch vendors from API
      const vendorsData = await apiClient.getAllVendors()

      // Mock data structure - replace with actual API response mapping
      const mockVendorData = [
        {
          id: "VEN-001",
          companyName: "TechSupply Solutions",
          contactPerson: "Rajesh Kumar",
          email: "rajesh@techsupply.com",
          phone: "+91 9876543210",
          address: {
            state: "Maharashtra",
            district: "Mumbai",
            area: "Andheri West",
            fullAddress: "123 Tech Park, Andheri West, Mumbai, Maharashtra 400058",
          },
          category: "Hardware",
          status: "active",
          rating: 4.5,
          totalOrders: 45,
          totalValue: 125000,
          lastOrderDate: "2024-01-20T10:30:00Z",
          joinedDate: "2023-06-15T09:00:00Z",
          products: [
            { name: "Fiber Optic Cables", category: "Networking", price: 2500 },
            { name: "Network Switches", category: "Hardware", price: 15000 },
            { name: "Routers", category: "Hardware", price: 8500 },
          ],
          performance: {
            onTimeDelivery: 92,
            qualityRating: 4.3,
            responseTime: "2 hours",
          },
        },
        {
          id: "VEN-002",
          companyName: "NetworkPro Equipment",
          contactPerson: "Priya Sharma",
          email: "priya@networkpro.com",
          phone: "+91 9876543211",
          address: {
            state: "Karnataka",
            district: "Bangalore",
            area: "Koramangala",
            fullAddress: "456 Business Center, Koramangala, Bangalore, Karnataka 560034",
          },
          category: "Software",
          status: "active",
          rating: 4.8,
          totalOrders: 32,
          totalValue: 89000,
          lastOrderDate: "2024-01-18T14:15:00Z",
          joinedDate: "2023-08-20T11:30:00Z",
          products: [
            { name: "Network Management Software", category: "Software", price: 25000 },
            { name: "Monitoring Tools", category: "Software", price: 18000 },
          ],
          performance: {
            onTimeDelivery: 96,
            qualityRating: 4.7,
            responseTime: "1 hour",
          },
        },
        {
          id: "VEN-003",
          companyName: "InstallTech Services",
          contactPerson: "Amit Patel",
          email: "amit@installtech.com",
          phone: "+91 9876543212",
          address: {
            state: "Gujarat",
            district: "Ahmedabad",
            area: "Satellite",
            fullAddress: "789 Service Hub, Satellite, Ahmedabad, Gujarat 380015",
          },
          category: "Services",
          status: "pending",
          rating: 4.2,
          totalOrders: 18,
          totalValue: 45000,
          lastOrderDate: "2024-01-15T16:45:00Z",
          joinedDate: "2023-11-10T10:15:00Z",
          products: [
            { name: "Installation Services", category: "Services", price: 5000 },
            { name: "Maintenance Services", category: "Services", price: 3000 },
          ],
          performance: {
            onTimeDelivery: 88,
            qualityRating: 4.1,
            responseTime: "4 hours",
          },
        },
      ]

      setVendors(mockVendorData)
    } catch (error) {
      console.error("Error fetching vendors:", error)
      toast({
        title: "Error",
        description: "Failed to load vendors data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const [newVendor, setNewVendor] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: {
      state: "",
      district: "",
      area: "",
      fullAddress: "",
    },
    category: "",
  })

  const vendorCategories = [
    "Hardware",
    "Software",
    "Services",
    "Networking",
    "Installation",
    "Maintenance",
    "Consulting",
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "suspended":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleStatusChange = async (vendorId: string, newStatus: string) => {
    try {
      // Update local state
      setVendors((prev) => prev.map((vendor) => (vendor.id === vendorId ? { ...vendor, status: newStatus } : vendor)))

      toast({
        title: "Status Updated",
        description: `Vendor status has been updated to ${newStatus}.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update vendor status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCreateVendor = async () => {
    if (!newVendor.companyName || !newVendor.contactPerson || !newVendor.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      await apiClient.addVendor({
        email: newVendor.email,
        password: "defaultPassword123", // Should be generated or sent via email
        profileDetail: {
          name: newVendor.contactPerson,
          phone: newVendor.phone,
          companyName: newVendor.companyName,
          address: newVendor.address,
        },
      })

      // Refresh vendors list
      await fetchVendors()

      setIsCreateDialogOpen(false)
      setNewVendor({
        companyName: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: {
          state: "",
          district: "",
          area: "",
          fullAddress: "",
        },
        category: "",
      })

      toast({
        title: "Vendor Created",
        description: "New vendor has been created successfully.",
      })
    } catch (error) {
      console.error("Error creating vendor:", error)
      toast({
        title: "Error",
        description: "Failed to create vendor. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || vendor.status === filterStatus
    const matchesCategory = filterCategory === "all" || vendor.category === filterCategory
    return matchesSearch && matchesStatus && matchesCategory
  })

  const vendorStats = {
    total: vendors.length,
    active: vendors.filter((v) => v.status === "active").length,
    pending: vendors.filter((v) => v.status === "pending").length,
    suspended: vendors.filter((v) => v.status === "suspended").length,
    totalValue: vendors.reduce((sum, v) => sum + v.totalValue, 0),
    avgRating: vendors.reduce((sum, v) => sum + v.rating, 0) / vendors.length,
  }

  return (
    <DashboardLayout title="Vendor Management" description="Manage vendors and supplier relationships">
      <div className="space-y-6">
        {/* Vendor Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                  <p className="text-2xl font-bold text-gray-900">{vendorStats.total}</p>
                </div>
                <Building className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{vendorStats.active}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{vendorStats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Suspended</p>
                  <p className="text-2xl font-bold text-gray-900">{vendorStats.suspended}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(vendorStats.totalValue)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{vendorStats.avgRating.toFixed(1)}</p>
                </div>
                <Star className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Vendors</h2>
            <p className="text-gray-600">Manage your vendor and supplier relationships</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Vendor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Vendor</DialogTitle>
                <DialogDescription>Register a new vendor in the system</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name *</Label>
                    <Input
                      id="company-name"
                      value={newVendor.companyName}
                      onChange={(e) => setNewVendor({ ...newVendor, companyName: e.target.value })}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-person">Contact Person *</Label>
                    <Input
                      id="contact-person"
                      value={newVendor.contactPerson}
                      onChange={(e) => setNewVendor({ ...newVendor, contactPerson: e.target.value })}
                      placeholder="Enter contact person name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newVendor.email}
                      onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={newVendor.phone}
                      onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      value={newVendor.category}
                      onChange={(e) => setNewVendor({ ...newVendor, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select category</option>
                      {vendorCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={newVendor.address.state}
                      onChange={(e) =>
                        setNewVendor({
                          ...newVendor,
                          address: { ...newVendor.address, state: e.target.value },
                        })
                      }
                      placeholder="Enter state"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                    <Input
                      id="district"
                      value={newVendor.address.district}
                      onChange={(e) =>
                        setNewVendor({
                          ...newVendor,
                          address: { ...newVendor.address, district: e.target.value },
                        })
                      }
                      placeholder="Enter district"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">Area</Label>
                    <Input
                      id="area"
                      value={newVendor.address.area}
                      onChange={(e) =>
                        setNewVendor({
                          ...newVendor,
                          address: { ...newVendor.address, area: e.target.value },
                        })
                      }
                      placeholder="Enter area"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full-address">Full Address</Label>
                  <Input
                    id="full-address"
                    value={newVendor.address.fullAddress}
                    onChange={(e) =>
                      setNewVendor({
                        ...newVendor,
                        address: { ...newVendor.address, fullAddress: e.target.value },
                      })
                    }
                    placeholder="Enter complete address"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateVendor}>Create Vendor</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Vendors</Label>
                <Input
                  id="search"
                  placeholder="Search by name, company, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-filter">Status</Label>
                <select
                  id="status-filter"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-filter">Category</Label>
                <select
                  id="category-filter"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {vendorCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setFilterStatus("all")
                    setFilterCategory("all")
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vendors List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <Card key={vendor.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{vendor.companyName}</h3>
                      <p className="text-sm text-gray-600">{vendor.contactPerson}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(vendor.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vendor.status)}`}>
                      {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{vendor.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Rating:</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{vendor.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Orders:</span>
                    <span className="font-medium">{vendor.totalOrders}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Value:</span>
                    <span className="font-medium">{formatCurrency(vendor.totalValue)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium text-right">
                      {vendor.address.area}, {vendor.address.district}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedVendor(vendor)
                        setIsViewDialogOpen(true)
                      }}
                    >
                      View Details
                    </Button>
                    <div className="flex items-center space-x-2">
                      {vendor.status === "pending" && (
                        <Button size="sm" onClick={() => handleStatusChange(vendor.id, "active")}>
                          Approve
                        </Button>
                      )}
                      {vendor.status === "active" && (
                        <Button variant="outline" size="sm" onClick={() => handleStatusChange(vendor.id, "suspended")}>
                          Suspend
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredVendors.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus !== "all" || filterCategory !== "all"
                  ? "Try adjusting your search criteria or filters."
                  : "Get started by adding your first vendor."}
              </p>
              {!searchTerm && filterStatus === "all" && filterCategory === "all" && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Vendor
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Vendor Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Vendor Details</DialogTitle>
              <DialogDescription>Complete information about {selectedVendor?.companyName}</DialogDescription>
            </DialogHeader>
            {selectedVendor && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Company Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Company Name:</span>
                          <span className="font-medium">{selectedVendor.companyName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Contact Person:</span>
                          <span className="font-medium">{selectedVendor.contactPerson}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium">{selectedVendor.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium">{selectedVendor.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-medium">{selectedVendor.category}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Address</h4>
                      <p className="text-sm text-gray-600">{selectedVendor.address.fullAddress}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Performance Metrics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">On-time Delivery:</span>
                          <span className="font-medium">{selectedVendor.performance.onTimeDelivery}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Quality Rating:</span>
                          <span className="font-medium">{selectedVendor.performance.qualityRating}/5</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Response Time:</span>
                          <span className="font-medium">{selectedVendor.performance.responseTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Orders:</span>
                          <span className="font-medium">{selectedVendor.totalOrders}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Value:</span>
                          <span className="font-medium">{formatCurrency(selectedVendor.totalValue)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Products & Services</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedVendor.products.map((product, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <h5 className="font-medium text-sm">{product.name}</h5>
                        <p className="text-xs text-gray-600">{product.category}</p>
                        <p className="text-sm font-semibold text-blue-600">{formatCurrency(product.price)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
