"use client"

import { useState, useEffect } from "react"
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
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  HardHat,
  Phone,
  Mail,
  MapPin,
  Download,
  RefreshCw,
  Users,
  UserCheck,
  Clock,
  AlertTriangle,
  X,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { exportToCSV } from "@/lib/utils"
import AddTechnicianForm from "@/components/AddTechnicianForm"
import EditTechnicianForm from "@/components/EditTechnicianForm"
import { admintechnicianApi } from "@/lib/api" // Import your API
import { useAuth } from "@/contexts/AuthContext" // Import auth context

interface Technician {
  id: string
  name: string
  email: string
  phone: string
  employeeId: string
  department: string
  position: string
  assignedArea: string
  workShift: string
  experience: number
  salary: number
  status: string
  skills: string[]
  joinDate: string
  lastActive: string
  specialization?: string
  assignedOperatorId?: string
}

// Update the User interface to match your API response
interface ApiUser {
  userId?: string
  _id?: string
  id?: string
  user_id?: string
  email: string
  profileDetail?: {
    name?: string
    phone?: string
    area?: string
    specialization?: string
    salary?: string
    assignedOperatorId?: string
  }
  createdAt?: string
  updatedAt?: string
  status?: string
}

export default function TechniciansPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const { toast } = useToast()

  // Get current user from auth context
  const { user: currentUser } = useAuth()
  const currentUserId = currentUser?.user_id

  // Convert API User object to Technician object with safe property access
  const mapUserToTechnician = (user: ApiUser, index: number): Technician => {
    // Get user ID from various possible fields
    const userId = user.id || user._id || user.userId || user.user_id || `user_${index}`
    
    // Safe property access with fallbacks
    const profile = user.profileDetail || {}
    const name = profile.name || 'Unknown'
    const phone = profile.phone || 'N/A'
    const area = profile.area || 'Unassigned'
    const specialization = profile.specialization || 'General'
    const salary = profile.salary || '0'
    const assignedOperatorId = profile.assignedOperatorId || ''

    return {
      id: userId,
      name: name,
      email: user.email || 'N/A',
      phone: phone,
      employeeId: `EMP${userId.toString().slice(-4).toUpperCase()}`,
      department: getDepartmentFromSpecialization(specialization),
      position: getPositionFromSpecialization(specialization),
      assignedArea: area,
      workShift: 'day', // Default value
      experience: getRandomExperience(),
      salary: parseInt(salary) || 0,
      status: user.status || 'active',
      skills: getSkillsFromSpecialization(specialization),
      joinDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      lastActive: user.updatedAt || new Date().toISOString(),
      specialization: specialization,
      assignedOperatorId: assignedOperatorId
    }
  }

  // Helper functions to map specialization to department/position
  const getDepartmentFromSpecialization = (specialization: string): string => {
    if (!specialization) return 'field_operations'
    const spec = specialization.toLowerCase()
    if (spec.includes('fiber') || spec.includes('installation')) return 'installation'
    if (spec.includes('maintenance') || spec.includes('repair')) return 'network_maintenance'
    if (spec.includes('support') || spec.includes('customer')) return 'customer_support'
    return 'field_operations'
  }

  const getPositionFromSpecialization = (specialization: string): string => {
    if (!specialization) return 'technician'
    const spec = specialization.toLowerCase()
    if (spec.includes('senior') || spec.includes('lead')) return 'senior_technician'
    if (spec.includes('supervisor') || spec.includes('manager')) return 'supervisor'
    if (spec.includes('team lead')) return 'team_lead'
    return 'technician'
  }

  const getSkillsFromSpecialization = (specialization: string): string[] => {
    if (!specialization) return ['General Technical Support']
    const spec = specialization.toLowerCase()
    const skills = []
    if (spec.includes('fiber')) skills.push('Fiber Installation')
    if (spec.includes('network')) skills.push('Network Troubleshooting')
    if (spec.includes('maintenance')) skills.push('Cable Maintenance')
    if (spec.includes('support')) skills.push('Customer Support')
    if (spec.includes('installation')) skills.push('Installation Planning')
    if (skills.length === 0) skills.push('General Technical Support')
    return skills
  }

  const getRandomExperience = (): number => {
    return Math.floor(Math.random() * 8) + 1 // 1-8 years
  }

  const fetchTechnicians = async () => {
    try {
      setLoading(true)
      console.log('Fetching technicians for user:', currentUserId)
      const response = await admintechnicianApi.getAll()
      console.log('API Response:', response)
      
      // Handle different response formats
      let userData: ApiUser[] = []
      if (Array.isArray(response)) {
        userData = response
      } else if (response && Array.isArray(response.data)) {
        userData = response.data
      } else if (response && response.users && Array.isArray(response.users)) {
        userData = response.users
      } else {
        console.warn('Unexpected API response format:', response)
        userData = []
      }
      
      const mappedTechnicians = userData.map((user, index) => mapUserToTechnician(user, index))
      console.log('Mapped technicians:', mappedTechnicians)
      setTechnicians(mappedTechnicians)
    } catch (error) {
      console.error("Error fetching technicians:", error)
      toast({
        title: "Error Loading Technicians",
        description: "Failed to load technicians. Please try again.",
        variant: "destructive",
      })
      setTechnicians([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Only fetch if we have current user data
    if (currentUserId) {
      fetchTechnicians()
    }
  }, [currentUserId])

  const filteredTechnicians = technicians.filter((technician) => {
    const matchesSearch =
      technician.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      technician.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      technician.employeeId.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDepartment = departmentFilter === "all" || technician.department === departmentFilter
    const matchesStatus = statusFilter === "all" || technician.status === statusFilter

    return matchesSearch && matchesDepartment && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactive</Badge>
      case "on_leave":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">On Leave</Badge>
      case "suspended":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Suspended</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Unknown</Badge>
    }
  }

  const getDepartmentLabel = (department: string) => {
    switch (department) {
      case "field_operations":
        return "Field Operations"
      case "network_maintenance":
        return "Network Maintenance"
      case "customer_support":
        return "Customer Support"
      case "installation":
        return "Installation"
      default:
        return department
    }
  }

  const getPositionLabel = (position: string) => {
    switch (position) {
      case "technician":
        return "Technician"
      case "senior_technician":
        return "Senior Technician"
      case "team_lead":
        return "Team Lead"
      case "supervisor":
        return "Supervisor"
      default:
        return position
    }
  }

  const handleExport = () => {
    const exportData = filteredTechnicians.map((tech) => ({
      "Employee ID": tech.employeeId,
      Name: tech.name,
      Email: tech.email,
      Phone: tech.phone,
      Department: getDepartmentLabel(tech.department),
      Position: getPositionLabel(tech.position),
      "Assigned Area": tech.assignedArea,
      "Work Shift": tech.workShift,
      Experience: `${tech.experience} years`,
      Salary: `₹${tech.salary.toLocaleString()}`,
      Status: tech.status,
      Skills: tech.skills.join(", "),
      "Join Date": tech.joinDate,
      Specialization: tech.specialization || 'N/A'
    }))
    exportToCSV(exportData, "technicians-list")
    toast({
      title: "Export Successful",
      description: "Technicians data exported successfully!",
    })
  }

  const handleViewDetails = async (technician: Technician) => {
    try {
      // Try to fetch detailed profile information, fallback to current data
      let detailedTechnician = technician
      try {
        const detailedProfile = await admintechnicianApi.getProfile(technician.id)
        detailedTechnician = mapUserToTechnician(detailedProfile, 0)
      } catch (profileError) {
        console.warn('Could not fetch detailed profile, using current data:', profileError)
      }
      
      setSelectedTechnician(detailedTechnician)
      setShowViewDialog(true)
    } catch (error) {
      console.error("Error fetching technician details:", error)
      toast({
        title: "Error",
        description: "Failed to load technician details.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = async (technician: Technician) => {
    try {
      // Try to fetch latest data before editing, fallback to current data
      let updatedTechnician = technician
      try {
        const latestData = await admintechnicianApi.get(technician.id)
        updatedTechnician = mapUserToTechnician(latestData, 0)
      } catch (fetchError) {
        console.warn('Could not fetch latest data, using current data:', fetchError)
      }
      
      setSelectedTechnician(updatedTechnician)
      setShowEditDialog(true)
    } catch (error) {
      console.error("Error preparing technician for edit:", error)
      toast({
        title: "Error",
        description: "Failed to prepare technician data for editing.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (technician: Technician) => {
    if (!window.confirm(`Are you sure you want to delete ${technician.name}?`)) {
      return
    }

    try {
      setDeleting(technician.id)
      await admintechnicianApi.delete(technician.id)
      
      // Remove from local state
      setTechnicians((prev) => prev.filter((t) => t.id !== technician.id))
      
      toast({
        title: "Technician Deleted",
        description: `${technician.name} has been removed from the system.`,
      })
    } catch (error) {
      console.error("Error deleting technician:", error)
      toast({
        title: "Delete Failed",
        description: "Failed to delete technician. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleting(null)
    }
  }

  const handleAddSuccess = () => {
    setShowAddDialog(false)
    fetchTechnicians()
    toast({
      title: "Technician Added",
      description: "New technician has been added successfully!",
    })
  }

  const handleEditSuccess = () => {
    setShowEditDialog(false)
    fetchTechnicians()
    toast({
      title: "Technician Updated",
      description: "Technician information has been updated successfully!",
    })
  }

  // Show loading or no access message if user is not authenticated
  if (!currentUser || !currentUserId) {
    return (
      <DashboardLayout title="Technician Management" description="Manage field technicians and their assignments">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <span className="text-gray-600">Loading user authentication...</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const totalTechnicians = technicians.length
  const activeTechnicians = technicians.filter((t) => t.status === "active").length
  const onLeaveTechnicians = technicians.filter((t) => t.status === "on_leave").length
  const inactiveTechnicians = technicians.filter((t) => t.status === "inactive" || t.status === "suspended").length

  return (
    <DashboardLayout title="Technician Management" description="Manage field technicians and their assignments">
      <div className="space-y-4 md:space-y-6">
        {/* Current User Info - Optional Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
            <strong>Debug Info:</strong> Current User ID: {currentUserId}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Technicians</CardTitle>
              <div className="p-2 bg-blue-500 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{totalTechnicians}</div>
              <p className="text-sm text-gray-500 mt-2">Registered technicians</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Active</CardTitle>
              <div className="p-2 bg-green-500 rounded-lg">
                <UserCheck className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{activeTechnicians}</div>
              <p className="text-sm text-gray-500 mt-2">Currently working</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">On Leave</CardTitle>
              <div className="p-2 bg-yellow-500 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{onLeaveTechnicians}</div>
              <p className="text-sm text-gray-500 mt-2">Temporarily unavailable</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Inactive</CardTitle>
              <div className="p-2 bg-red-500 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{inactiveTechnicians}</div>
              <p className="text-sm text-gray-500 mt-2">Suspended or inactive</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          {/* Search and Filter Row */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search technicians..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="field_operations">Field Operations</SelectItem>
                <SelectItem value="network_maintenance">Network Maintenance</SelectItem>
                <SelectItem value="customer_support">Customer Support</SelectItem>
                <SelectItem value="installation">Installation</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTechnicians}
              disabled={loading}
              className="w-full sm:w-auto bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} className="w-full sm:w-auto bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Technician
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Technician</DialogTitle>
                  <DialogDescription>Create a new technician profile with complete details</DialogDescription>
                </DialogHeader>
                <AddTechnicianForm onClose={() => setShowAddDialog(false)} onSuccess={handleAddSuccess} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">All Technicians ({filteredTechnicians.length})</CardTitle>
            <CardDescription>Complete list of field technicians and their current status</CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading technicians...</span>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">Technician</TableHead>
                        <TableHead className="min-w-[150px]">Contact</TableHead>
                        <TableHead className="min-w-[150px]">Department</TableHead>
                        <TableHead className="min-w-[150px]">Assignment</TableHead>
                        <TableHead className="min-w-[120px]">Experience</TableHead>
                        <TableHead className="min-w-[100px]">Salary</TableHead>
                        <TableHead className="min-w-[80px]">Status</TableHead>
                        <TableHead className="min-w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTechnicians.map((technician) => (
                        <TableRow key={technician.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="bg-blue-100 p-2 rounded-lg">
                                <HardHat className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{technician.name}</div>
                                <div className="text-sm text-gray-500">ID: {technician.employeeId}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="h-3 w-3 mr-1" />
                                {technician.phone}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Mail className="h-3 w-3 mr-1" />
                                <span className="truncate max-w-[150px]">{technician.email}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">
                                {getDepartmentLabel(technician.department)}
                              </div>
                              <div className="text-sm text-gray-500">{getPositionLabel(technician.position)}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span className="truncate max-w-[120px]">{technician.assignedArea}</span>
                            </div>
                            <div className="text-sm text-gray-500 capitalize">{technician.workShift} shift</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-gray-900">{technician.experience} years</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-gray-900">₹{technician.salary.toLocaleString()}</div>
                          </TableCell>
                          <TableCell>{getStatusBadge(technician.status)}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" disabled={deleting === technician.id}>
                                  {deleting === technician.id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                                  ) : (
                                    <MoreHorizontal className="h-4 w-4" />
                                  )}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="w-64" align="end">
                                <DropdownMenuItem onClick={() => handleViewDetails(technician)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(technician)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-600" 
                                  onClick={() => handleDelete(technician)}
                                  disabled={deleting === technician.id}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredTechnicians.length === 0 && !loading && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                            No technicians found. {searchTerm && "Try adjusting your search terms."}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View - Keep the same as before */}
                <div className="lg:hidden space-y-4 p-4">
                  {filteredTechnicians.map((technician) => (
                    <Card key={technician.id} className="border border-gray-200 shadow-sm">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Header with name and status */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                                <HardHat className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-gray-900 truncate">{technician.name}</div>
                                <div className="text-sm text-gray-500 truncate">ID: {technician.employeeId}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              {getStatusBadge(technician.status)}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled={deleting === technician.id}>
                                    {deleting === technician.id ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                                    ) : (
                                      <MoreHorizontal className="h-4 w-4" />
                                    )}
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-48" align="end">
                                  <DropdownMenuItem onClick={() => handleViewDetails(technician)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEdit(technician)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-600" 
                                    onClick={() => handleDelete(technician)}
                                    disabled={deleting === technician.id}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          {/* Department and Position */}
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900 text-sm">
                                {getDepartmentLabel(technician.department)}
                              </div>
                              <div className="text-xs text-gray-500">{getPositionLabel(technician.position)}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-sm">₹{technician.salary.toLocaleString()}</div>
                              <div className="text-xs text-gray-500">{technician.experience} years exp.</div>
                            </div>
                          </div>

                          {/* Contact Information */}
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-3 w-3 mr-2 flex-shrink-0" />
                              <span className="truncate">{technician.phone}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="h-3 w-3 mr-2 flex-shrink-0" />
                              <span className="truncate">{technician.email}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="h-3 w-3 mr-2 flex-shrink-0" />
                              <span className="truncate">{technician.assignedArea}</span>
                            </div>
                          </div>

                          {/* Skills */}
                          <div className="pt-2 border-t border-gray-100">
                            <div className="text-xs text-gray-500 mb-1">Skills:</div>
                            <div className="flex flex-wrap gap-1">
                              {technician.skills.slice(0, 3).map((skill) => (
                                <span key={skill} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                  {skill}
                                </span>
                              ))}
                              {technician.skills.length > 3 && (
                                <span className="text-xs text-gray-500">+{technician.skills.length - 3} more</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredTechnicians.length === 0 && !loading && (
                    <div className="text-center text-gray-500 py-8">
                      <HardHat className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <p>No technicians found.</p>
                      {searchTerm && <p className="text-sm">Try adjusting your search terms.</p>}
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* View Details Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Technician Details</DialogTitle>
              <DialogDescription>Complete information about the technician</DialogDescription>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4"
                onClick={() => setShowViewDialog(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>
            {selectedTechnician && (
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <p className="text-gray-900 font-medium">{selectedTechnician.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Employee ID</label>
                      <p className="text-gray-900 font-medium">{selectedTechnician.employeeId}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{selectedTechnician.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-gray-900">{selectedTechnician.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Work Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Work Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Department</label>
                      <p className="text-gray-900">{getDepartmentLabel(selectedTechnician.department)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Position</label>
                      <p className="text-gray-900">{getPositionLabel(selectedTechnician.position)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Assigned Area</label>
                      <p className="text-gray-900">{selectedTechnician.assignedArea}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Work Shift</label>
                      <p className="text-gray-900 capitalize">{selectedTechnician.workShift}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Experience</label>
                      <p className="text-gray-900">{selectedTechnician.experience} years</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Salary</label>
                      <p className="text-gray-900 font-medium">₹{selectedTechnician.salary.toLocaleString()}</p>
                    </div>
                    {selectedTechnician.specialization && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-500">Specialization</label>
                        <p className="text-gray-900">{selectedTechnician.specialization}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Skills & Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTechnician.skills.map((skill) => (
                      <span
                        key={skill}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Status and Dates */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Status & Timeline</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Current Status</label>
                      <div className="mt-1">{getStatusBadge(selectedTechnician.status)}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Join Date</label>
                      <p className="text-gray-900">{new Date(selectedTechnician.joinDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Active</label>
                      <p className="text-gray-900">
                        {new Date(selectedTechnician.lastActive).toLocaleDateString()}{' '}
                        {new Date(selectedTechnician.lastActive).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Technician Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Technician</DialogTitle>
              <DialogDescription>Update technician information</DialogDescription>
            </DialogHeader>
            {selectedTechnician && (
              <EditTechnicianForm
                technician={selectedTechnician}
                onClose={() => setShowEditDialog(false)}
                onSuccess={handleEditSuccess}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
