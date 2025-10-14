"use client"

import type React from "react"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  Users,
  Phone,
  Eye,
  Edit,
  MoreHorizontal,
  Trash2,
  Download,
  UserPlus,
  Shield,
  Mail,
  Plus,
  AlertCircle,
  Filter,
  RefreshCw,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatDate, exportToCSV } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { staffApi } from "@/lib/api"
import type { User } from "@/lib/api"
import { confirmDelete } from "@/lib/confirmation-dialog"

type Staff = User

// Skeleton Loading Components
function StatsCardSkeleton() {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-4 w-20" />
      </CardContent>
    </Card>
  )
}

function TableRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-36" />
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-14 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-3 w-24" />
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </TableCell>
    </TableRow>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Search and Filter Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full sm:w-48" />
      </div>
      
      {/* Table Skeleton */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Staff Details</TableHead>
                  <TableHead className="min-w-[150px]">Contact</TableHead>
                  <TableHead className="min-w-[150px]">Role & Assignment</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[150px]">Created Date</TableHead>
                  <TableHead className="min-w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableRowSkeleton key={index} />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function StaffPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [showAddStaffDialog, setShowAddStaffDialog] = useState(false)
  const [showEditStaffDialog, setShowEditStaffDialog] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [activeTab, setActiveTab] = useState("staff")
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // NEW STATE VARIABLES FOR VIEW DIALOG
  const [showViewStaffDialog, setShowViewStaffDialog] = useState(false)
  const [viewingStaff, setViewingStaff] = useState<Staff | null>(null)
  
  const { toast } = useToast()

  const fetchStaffData = async () => {
    try {
      setLoading(true)
      console.log("[v0] Fetching staff data from API...")

      const staffData = await staffApi.getAll()
      console.log("[v0] Staff data fetched:", staffData.length)

      setStaff(staffData)
    } catch (error) {
      console.error("[v0] Error fetching staff data:", error)
      toast({
        title: "Error Loading Data",
        description: "Failed to load staff data. Please try again.",
        variant: "destructive",
      })
      setStaff([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStaffData()
  }, [])

  const filteredStaff = staff.filter((staffMember) => {
    const matchesSearch =
      staffMember.profileDetail.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staffMember.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || staffMember.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleExport = () => {
    const exportData = filteredStaff.map((staffMember) => ({
      Name: staffMember.profileDetail.name,
      Email: staffMember.email,
      Role: staffMember.role,
      Phone: staffMember.profileDetail.phone,
      "Assigned To": staffMember.profileDetail.assignedTo || "N/A",
      "Created Date": formatDate(staffMember.createdAt),
      "Updated Date": formatDate(staffMember.updatedAt),
    }))
    exportToCSV(exportData, "admin-staff")
    toast({
      title: "Export Successful",
      description: "Admin staff data exported successfully!",
    })
  }

  // UPDATED VIEW STAFF FUNCTION
  const handleViewStaff = (staffId: string) => {
    const staffMember = staff.find((s) => s.user_id === staffId)
    if (staffMember) {
      setViewingStaff(staffMember)
      setShowViewStaffDialog(true)
    }
  }

  const handleEditStaff = (staffId: string) => {
    const staffMember = staff.find((s) => s.user_id === staffId)
    if (staffMember) {
      setEditingStaff(staffMember)
      setShowEditStaffDialog(true)
    }
  }

  const handleDeleteStaff = async (staffMember: Staff) => {
    try {
      const confirmed = await confirmDelete(`staff member "${staffMember.profileDetail.name}"`)

      if (!confirmed) {
        return
      }

      console.log("[v0] Deleting staff member:", staffMember.user_id)
      await staffApi.delete(staffMember.user_id)

      toast({
        title: "Staff Deleted",
        description: `${staffMember.profileDetail.name} has been deleted successfully.`,
      })

      fetchStaffData()
    } catch (error) {
      console.error("[v0] Error deleting staff:", error)
      toast({
        title: "Delete Failed",
        description: "Failed to delete staff member. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddStaffSuccess = () => {
    setShowAddStaffDialog(false)
    fetchStaffData()
    toast({
      title: "Staff Added",
      description: "New staff member has been added successfully!",
    })
  }

  const totalStaff = staff.length
  const activeStaff = staff.length

return (
  <DashboardLayout title="Admin Settings" description="System configuration and user management">
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
                      onClick={fetchStaffData}
                      className="ml-auto"
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {loading ? (
                  <>
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                  </>
                ) : (
                  <>
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 lg:px-6">
                        <CardTitle className="text-xs sm:text-sm font-medium text-gray-700 truncate">Total Staff</CardTitle>
                        <div className="p-2 bg-blue-500 rounded-lg flex-shrink-0">
                          <Users className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                        </div>
                      </CardHeader>
                      <CardContent className="px-4 lg:px-6">
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">{totalStaff}</div>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">{activeStaff} active users</p>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 lg:px-6">
                        <CardTitle className="text-xs sm:text-sm font-medium text-gray-700 truncate">Active Staff</CardTitle>
                        <div className="p-2 bg-green-500 rounded-lg flex-shrink-0">
                          <Users className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                        </div>
                      </CardHeader>
                      <CardContent className="px-4 lg:px-6">
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">{activeStaff}</div>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">Currently online</p>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 lg:px-6">
                        <CardTitle className="text-xs sm:text-sm font-medium text-gray-700 truncate">Admin Users</CardTitle>
                        <div className="p-2 bg-purple-500 rounded-lg flex-shrink-0">
                          <Shield className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                        </div>
                      </CardHeader>
                      <CardContent className="px-4 lg:px-6">
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                          {staff.filter(s => s.role === 'admin').length}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">With admin access</p>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 lg:px-6">
                        <CardTitle className="text-xs sm:text-sm font-medium text-gray-700 truncate">Regular Staff</CardTitle>
                        <div className="p-2 bg-orange-500 rounded-lg flex-shrink-0">
                          <Users className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                        </div>
                      </CardHeader>
                      <CardContent className="px-4 lg:px-6">
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                          {staff.filter(s => s.role === 'staff').length}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">Standard access</p>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>

              {/* Main Content */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                {/* Header Section */}
                <div className="flex flex-col space-y-4">
                  {/* Tabs and Actions Row */}
                  <Card className="shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                          <TabsList className="grid w-full max-w-md grid-cols-2 h-10">
                            <TabsTrigger value="staff" className="text-sm">Admin Staff</TabsTrigger>
                            <TabsTrigger value="roles" className="text-sm">Roles & Permissions</TabsTrigger>
                          </TabsList>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={fetchStaffData} 
                            disabled={loading}
                            className="h-10"
                          >
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                            Refresh ({filteredStaff.length})
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleExport} 
                            className="h-10"
                            disabled={filteredStaff.length === 0}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                          </Button>
                        </div>
                      
                   

                  {/* Action Buttons Section */}
                  <div className=" sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-wrap gap-2">
                      {activeTab === "staff" ? (
                        <Dialog open={showAddStaffDialog} onOpenChange={setShowAddStaffDialog}>
                          <DialogTrigger asChild>
                            <Button className="h-9">
                              <UserPlus className="h-4 w-4 mr-2" />
                              Add Staff
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Add New Admin Staff</DialogTitle>
                              <DialogDescription>Create a new admin user account</DialogDescription>
                            </DialogHeader>
                            <AddStaffForm onClose={() => setShowAddStaffDialog(false)} onSuccess={handleAddStaffSuccess} />
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <Button variant="outline" className="h-9" disabled>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Role (Coming Soon)
                        </Button>
                      )}
                    </div>
                  </div>
                  </div>
                   </CardContent>
                  </Card>
                </div>

                {/* Staff Tab */}
                <TabsContent value="staff" className="space-y-4">
                  {loading ? (
                    <TableSkeleton />
                  ) : (
                    <>
                      {/* Search and Filter Section */}
                      <Card className="shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex flex-col lg:flex-row gap-4">
                            <div className="relative flex-1">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input
                                placeholder="Search by name, email, or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-10"
                              />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                              <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-full sm:w-48 h-10">
                                  <Filter className="h-4 w-4 mr-2" />
                                  <SelectValue placeholder="Filter by Role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All Roles</SelectItem>
                                  <SelectItem value="staff">Staff</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Main Content Card */}
                      <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-xl font-semibold text-gray-900">
                                Admin Staff ({filteredStaff.length})
                              </CardTitle>
                              <CardDescription className="text-gray-600 mt-1">
                                Manage administrative users and their access
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
                                      <TableHead className="w-[200px] font-semibold">Staff Details</TableHead>
                                      <TableHead className="w-[180px] font-semibold">Contact</TableHead>
                                      <TableHead className="w-[160px] font-semibold">Role & Assignment</TableHead>
                                      <TableHead className="w-[100px] font-semibold">Status</TableHead>
                                      <TableHead className="w-[120px] font-semibold">Created Date</TableHead>
                                      <TableHead className="w-[120px] font-semibold">Actions</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {filteredStaff.map((staffMember) => (
                                      <TableRow 
                                        key={staffMember.user_id} 
                                        className="hover:bg-gray-50/50 transition-colors"
                                      >
                                        <TableCell className="py-4">
                                          <div className="flex items-center space-x-3">
                                            <div className="bg-blue-100 p-2.5 rounded-lg flex-shrink-0">
                                              <Users className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div className="min-w-0">
                                              <div className="font-medium text-gray-900 truncate">
                                                {staffMember.profileDetail.name}
                                              </div>
                                              <div className="text-sm text-gray-500 truncate">
                                                ID: {staffMember.user_id.slice(0, 8)}
                                              </div>
                                            </div>
                                          </div>
                                        </TableCell>
                                        
                                        <TableCell className="py-4">
                                          <div className="space-y-1">
                                            <div className="flex items-center text-sm text-gray-600">
                                              <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                                              <span className="truncate">{staffMember.profileDetail.phone || "N/A"}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                              <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                                              <span className="truncate">{staffMember.email}</span>
                                            </div>
                                          </div>
                                        </TableCell>
                                        
                                        <TableCell className="py-4">
                                          <div>
                                            <Badge variant="outline" className="capitalize mb-1">
                                              {staffMember.role}
                                            </Badge>
                                            <div className="text-sm text-gray-500 truncate">
                                              {staffMember.profileDetail.assignedTo || "Unassigned"}
                                            </div>
                                          </div>
                                        </TableCell>
                                        
                                        <TableCell className="py-4">
                                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                                        </TableCell>
                                        
                                        <TableCell className="py-4">
                                          <div className="text-sm text-gray-600">
                                            {formatDate(staffMember.createdAt)}
                                          </div>
                                        </TableCell>
                                        
                                        <TableCell className="py-4">
                                          <div className="flex items-center space-x-1">
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={() => handleViewStaff(staffMember.user_id)}
                                              className="h-8 w-8"
                                            >
                                              <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={() => handleEditStaff(staffMember.user_id)}
                                              className="h-8 w-8"
                                            >
                                              <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                              variant="ghost" 
                                              size="icon" 
                                              onClick={() => handleDeleteStaff(staffMember)}
                                              className="h-8 w-8 text-red-600 hover:text-red-700"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                              <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                            
                            {/* Empty State for Desktop */}
                            {filteredStaff.length === 0 && !loading && (
                              <div className="text-center text-gray-500 py-12">
                                <div className="flex flex-col items-center">
                                  <Users className="h-16 w-16 text-gray-300 mb-4" />
                                  <h3 className="text-lg font-medium mb-2">No staff members found</h3>
                                  {searchTerm ? (
                                    <p className="text-sm">Try adjusting your search terms or filters.</p>
                                  ) : (
                                    <p className="text-sm">Get started by adding your first staff member.</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Mobile Card View with Vertical Scrolling */}
                          <div className="md:hidden">
                            <ScrollArea className="h-[600px] w-full">
                              <div className="space-y-3 p-4">
                                {filteredStaff.map((staffMember) => (
                                  <Card key={staffMember.user_id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                      <div className="space-y-4">
                                        {/* Header */}
                                        <div className="flex items-start justify-between">
                                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                                            <div className="bg-blue-100 p-2.5 rounded-lg flex-shrink-0">
                                              <Users className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                              <h3 className="font-semibold text-gray-900 truncate text-sm">
                                                {staffMember.profileDetail.name}
                                              </h3>
                                              <p className="text-xs text-gray-500 truncate">
                                                ID: {staffMember.user_id.slice(0, 8)}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="flex items-center space-x-2 flex-shrink-0">
                                            <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                  <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent className="w-48" align="end">
                                                <DropdownMenuItem onClick={() => handleViewStaff(staffMember.user_id)}>
                                                  <Eye className="h-4 w-4 mr-2" />
                                                  View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleEditStaff(staffMember.user_id)}>
                                                  <Edit className="h-4 w-4 mr-2" />
                                                  Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                  className="text-red-600" 
                                                  onClick={() => handleDeleteStaff(staffMember)}
                                                >
                                                  <Trash2 className="h-4 w-4 mr-2" />
                                                  Delete
                                                </DropdownMenuItem>
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          </div>
                                        </div>

                                        {/* Role and Assignment */}
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <Badge variant="outline" className="capitalize text-xs">
                                              {staffMember.role}
                                            </Badge>
                                            <div className="text-xs text-gray-500 mt-1">
                                              {staffMember.profileDetail.assignedTo || "Unassigned"}
                                            </div>
                                          </div>
                                          <div className="text-right flex-shrink-0">
                                            <div className="text-xs text-gray-500">
                                              Created: {formatDate(staffMember.createdAt)}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Contact Grid */}
                                        <div className="grid grid-cols-1 gap-2">
                                          <div className="flex items-center text-sm text-gray-600">
                                            <Phone className="h-3 w-3 mr-2 text-green-600 flex-shrink-0" />
                                            <span className="truncate">{staffMember.profileDetail.phone || "N/A"}</span>
                                          </div>
                                          <div className="flex items-center text-sm text-gray-600">
                                            <Mail className="h-3 w-3 mr-2 text-blue-600 flex-shrink-0" />
                                            <span className="truncate">{staffMember.email}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}

                                {/* Empty State for Mobile */}
                                {filteredStaff.length === 0 && !loading && (
                                  <div className="text-center text-gray-500 py-12">
                                    <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No staff members found</h3>
                                    {searchTerm ? (
                                      <p className="text-sm">Try adjusting your search terms or filters.</p>
                                    ) : (
                                      <p className="text-sm">Get started by adding your first staff member.</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </ScrollArea>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </TabsContent>

                {/* Roles Tab */}
                <TabsContent value="roles" className="space-y-6">
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-8">
                      <div className="text-center py-8 sm:py-12">
                        <Shield className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-base sm:text-lg font-medium text-gray-900">Roles & Permissions</h3>
                        <p className="text-gray-500 mt-2 text-sm sm:text-base">This feature is coming soon.</p>
                        <p className="text-xs sm:text-sm text-gray-400 mt-1">Role management will be available in the next update.</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Dialogs */}
                <Dialog open={showEditStaffDialog} onOpenChange={setShowEditStaffDialog}>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Staff Member</DialogTitle>
                      <DialogDescription>Update staff member information</DialogDescription>
                    </DialogHeader>
                    {editingStaff && (
                      <EditStaffForm
                        staff={editingStaff}
                        onClose={() => setShowEditStaffDialog(false)}
                        onSuccess={() => {
                          setShowEditStaffDialog(false)
                          fetchStaffData()
                          toast({
                            title: "Staff Updated",
                            description: "Staff member has been updated successfully!",
                          })
                        }}
                      />
                    )}
                  </DialogContent>
                </Dialog>

                <Dialog open={showViewStaffDialog} onOpenChange={setShowViewStaffDialog}>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        <Users className="h-5 w-5" />
                        <span>Staff Details</span>
                      </DialogTitle>
                      <DialogDescription>
                        View detailed information for {viewingStaff?.profileDetail.name}
                      </DialogDescription>
                    </DialogHeader>
                    {viewingStaff && (
                      <ViewStaffDialog
                        staff={viewingStaff}
                        onClose={() => setShowViewStaffDialog(false)}
                      />
                    )}
                  </DialogContent>
                </Dialog>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  </DashboardLayout>
)
}

function AddStaffForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    assignedTo: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      console.log("[v0] Adding new staff member:", formData.name)

      await staffApi.add({
        email: formData.email,
        password: formData.password,
        profileDetail: {
          name: formData.name,
          phone: formData.phone,
          assignedTo: formData.assignedTo,
        },
      })

      console.log("[v0] Staff member added successfully")
      onSuccess()
    } catch (error) {
      console.error("[v0] Error adding staff member:", error)
      toast({
        title: "Add Failed",
        description: "Failed to add staff member. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <Label htmlFor="name" className="text-sm">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={loading}
            className="mt-1 h-9 sm:h-10"
          />
        </div>
        <div>
          <Label htmlFor="email" className="text-sm">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={loading}
            className="mt-1 h-9 sm:h-10"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <Label htmlFor="phone" className="text-sm">Phone Number</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            disabled={loading}
            className="mt-1 h-9 sm:h-10"
          />
        </div>
        <div>
          <Label htmlFor="assignedTo" className="text-sm">Assigned To</Label>
          <Input
            id="assignedTo"
            value={formData.assignedTo}
            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            placeholder="Operator ID or assignment"
            disabled={loading}
            className="mt-1 h-9 sm:h-10"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <Label htmlFor="password" className="text-sm">Password *</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            disabled={loading}
            className="mt-1 h-9 sm:h-10"
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword" className="text-sm">Confirm Password *</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
            disabled={loading}
            className="mt-1 h-9 sm:h-10"
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose} 
          disabled={loading}
          className="h-9 sm:h-10"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
          className="h-9 sm:h-10"
        >
          {loading ? "Adding..." : "Add Staff Member"}
        </Button>
      </div>
    </form>
  )
}

function EditStaffForm({ staff, onClose, onSuccess }: { staff: Staff; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: staff.profileDetail.name || "",
    email: staff.email || "",
    phone: staff.profileDetail.phone || "",
    assignedTo: staff.profileDetail.assignedTo || "",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      console.log("[v0] Updating staff member:", staff.user_id)

      const updateData = {
        email: formData.email,
        profileDetail: {
          name: formData.name,
          phone: formData.phone,
          assignedTo: formData.assignedTo,
        },
      }

      await staffApi.update(staff.user_id, updateData)

      console.log("[v0] Staff member updated successfully")
      onSuccess()
    } catch (error) {
      console.error("[v0] Error updating staff member:", error)
      toast({
        title: "Update Failed",
        description: "Failed to update staff member. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <Label htmlFor="edit-name" className="text-sm">Full Name *</Label>
          <Input
            id="edit-name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={loading}
            className="mt-1 h-9 sm:h-10"
          />
        </div>
        <div>
          <Label htmlFor="edit-email" className="text-sm">Email *</Label>
          <Input
            id="edit-email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={loading}
            className="mt-1 h-9 sm:h-10"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <Label htmlFor="edit-phone" className="text-sm">Phone Number</Label>
          <Input
            id="edit-phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            disabled={loading}
            className="mt-1 h-9 sm:h-10"
          />
        </div>
        <div>
          <Label htmlFor="edit-assignedTo" className="text-sm">Assigned To</Label>
          <Input
            id="edit-assignedTo"
            value={formData.assignedTo}
            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            placeholder="Operator ID or assignment"
            disabled={loading}
            className="mt-1 h-9 sm:h-10"
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose} 
          disabled={loading}
          className="h-9 sm:h-10"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
          className="h-9 sm:h-10"
        >
          {loading ? "Updating..." : "Update Staff Member"}
        </Button>
      </div>
    </form>
  )
}

// NEW VIEW STAFF DIALOG COMPONENT
function ViewStaffDialog({ staff, onClose }: { staff: Staff; onClose: () => void }) {
  const [showEditStaffDialog, setShowEditStaffDialog] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Full Name</Label>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-sm text-gray-900">{staff.profileDetail.name || "N/A"}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">User ID</Label>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-sm text-gray-900 font-mono">{staff.user_id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Email Address</Label>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <p className="text-sm text-gray-900">{staff.email}</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <p className="text-sm text-gray-900">{staff.profileDetail.phone || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role & Assignment Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Role & Assignment</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Role</Label>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-gray-500" />
                <Badge variant="outline" className="capitalize">
                  {staff.role}
                </Badge>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Assigned To</Label>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-500" />
                <p className="text-sm text-gray-900">{staff.profileDetail.assignedTo || "Unassigned"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Created Date</Label>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-sm text-gray-900">{formatDate(staff.createdAt)}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Last Updated</Label>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-sm text-gray-900">{formatDate(staff.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Status</h3>
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <Badge className="bg-green-100 text-green-800">Active</Badge>
            <span className="text-sm text-green-700">Staff member is currently active</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-6 border-t">
        <Button variant="outline" onClick={onClose} className="h-10">
          Close
        </Button>
        <Button 
          onClick={() => {
            onClose()
            setEditingStaff(staff)
            setShowEditStaffDialog(true)
          }}
          className="h-10"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Staff
        </Button>
      </div>
    </div>
  )
}
