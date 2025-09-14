"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Textarea } from "@/components/ui/textarea"
import { Plus, Shield, Users, Edit, Trash2, Eye, Search, UserCheck, Settings } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"

export default function StaffRolesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [roles, setRoles] = useState([])
  const [staffMembers, setStaffMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)

  // Staff roles with detailed permissions
  const staffRoles = [
    {
      id: "ROLE-001",
      name: "Support Agent",
      description: "Handle customer support tickets and inquiries",
      permissions: ["tickets", "chat", "ivr_logs", "customer_view"],
      userCount: 8,
      status: "active",
      createdAt: "2023-06-15T09:00:00Z",
      updatedAt: "2024-01-15T10:30:00Z",
      createdBy: "Admin",
      color: "blue",
    },
    {
      id: "ROLE-002",
      name: "Onboarding Manager",
      description: "Manage customer onboarding and documentation",
      permissions: ["onboarding", "documents", "billing_plans", "customer_create", "customer_edit"],
      userCount: 3,
      status: "active",
      createdAt: "2023-07-20T11:15:00Z",
      updatedAt: "2024-01-10T14:20:00Z",
      createdBy: "Admin",
      color: "green",
    },
    {
      id: "ROLE-003",
      name: "Technical Lead",
      description: "Oversee technical operations and system management",
      permissions: ["network", "api", "diagnostics", "backend", "system_settings", "reports"],
      userCount: 2,
      status: "active",
      createdAt: "2023-08-10T08:45:00Z",
      updatedAt: "2024-01-12T16:10:00Z",
      createdBy: "Admin",
      color: "purple",
    },
    {
      id: "ROLE-004",
      name: "Sales Manager",
      description: "Manage sales operations and customer relationships",
      permissions: ["sales", "leads", "customer_view", "reports", "billing_view"],
      userCount: 4,
      status: "active",
      createdAt: "2023-09-05T12:30:00Z",
      updatedAt: "2024-01-08T09:45:00Z",
      createdBy: "Admin",
      color: "orange",
    },
    {
      id: "ROLE-005",
      name: "Marketplace Admin",
      description: "Manage marketplace vendors and products",
      permissions: ["marketplace", "vendors", "products", "inventory_view", "reports"],
      userCount: 2,
      status: "active",
      createdAt: "2023-10-12T15:20:00Z",
      updatedAt: "2024-01-05T11:30:00Z",
      createdBy: "Admin",
      color: "teal",
    },
    {
      id: "ROLE-006",
      name: "Trainee",
      description: "Limited access for new staff members",
      permissions: ["tickets_view", "customer_view"],
      userCount: 5,
      status: "active",
      createdAt: "2023-11-01T10:00:00Z",
      updatedAt: "2024-01-01T08:15:00Z",
      createdBy: "Admin",
      color: "gray",
    },
  ]

  // Staff members with role assignments
  const staffData = [
    {
      id: "STF-001",
      name: "Priya Sharma",
      email: "priya@mynetwork.com",
      phone: "+91 9876543210",
      roleId: "ROLE-001",
      roleName: "Support Agent",
      department: "Customer Support",
      status: "active",
      joinedDate: "2023-08-15T09:00:00Z",
      lastLogin: "2024-01-20T14:30:00Z",
    },
    {
      id: "STF-002",
      name: "Rahul Kumar",
      email: "rahul@mynetwork.com",
      phone: "+91 9876543211",
      roleId: "ROLE-002",
      roleName: "Onboarding Manager",
      department: "Operations",
      status: "active",
      joinedDate: "2023-09-10T10:30:00Z",
      lastLogin: "2024-01-20T13:45:00Z",
    },
    {
      id: "STF-003",
      name: "Anjali Patel",
      email: "anjali@mynetwork.com",
      phone: "+91 9876543212",
      roleId: "ROLE-003",
      roleName: "Technical Lead",
      department: "Technical",
      status: "active",
      joinedDate: "2023-07-05T11:15:00Z",
      lastLogin: "2024-01-20T15:20:00Z",
    },
    {
      id: "STF-004",
      name: "Vikash Singh",
      email: "vikash@mynetwork.com",
      phone: "+91 9876543213",
      roleId: "ROLE-004",
      roleName: "Sales Manager",
      department: "Sales",
      status: "active",
      joinedDate: "2023-10-20T08:45:00Z",
      lastLogin: "2024-01-19T16:10:00Z",
    },
    {
      id: "STF-005",
      name: "Neha Gupta",
      email: "neha@mynetwork.com",
      phone: "+91 9876543214",
      roleId: "ROLE-006",
      roleName: "Trainee",
      department: "Customer Support",
      status: "inactive",
      joinedDate: "2023-12-01T12:00:00Z",
      lastLogin: "2024-01-18T10:30:00Z",
    },
  ]

  // Available permissions
  const availablePermissions = [
    { id: "tickets", name: "Support Tickets", category: "Support" },
    { id: "chat", name: "Live Chat", category: "Support" },
    { id: "ivr_logs", name: "IVR Logs", category: "Support" },
    { id: "onboarding", name: "Customer Onboarding", category: "Operations" },
    { id: "documents", name: "Document Management", category: "Operations" },
    { id: "billing_plans", name: "Billing Plans", category: "Billing" },
    { id: "network", name: "Network Management", category: "Technical" },
    { id: "api", name: "API Access", category: "Technical" },
    { id: "diagnostics", name: "System Diagnostics", category: "Technical" },
    { id: "backend", name: "Backend Access", category: "Technical" },
    { id: "sales", name: "Sales Management", category: "Sales" },
    { id: "leads", name: "Lead Management", category: "Sales" },
    { id: "marketplace", name: "Marketplace Management", category: "Marketplace" },
    { id: "vendors", name: "Vendor Management", category: "Marketplace" },
    { id: "products", name: "Product Management", category: "Marketplace" },
    { id: "customer_view", name: "View Customers", category: "General" },
    { id: "customer_create", name: "Create Customers", category: "General" },
    { id: "customer_edit", name: "Edit Customers", category: "General" },
    { id: "inventory_view", name: "View Inventory", category: "General" },
    { id: "billing_view", name: "View Billing", category: "General" },
    { id: "reports", name: "Generate Reports", category: "General" },
    { id: "system_settings", name: "System Settings", category: "Admin" },
  ]

  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    permissions: [],
    color: "blue",
  })

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setRoles(staffRoles)
      setStaffMembers(staffData)
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleColor = (color: string) => {
    const colors = {
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      green: "bg-green-100 text-green-800 border-green-200",
      purple: "bg-purple-100 text-purple-800 border-purple-200",
      orange: "bg-orange-100 text-orange-800 border-orange-200",
      teal: "bg-teal-100 text-teal-800 border-teal-200",
      gray: "bg-gray-100 text-gray-800 border-gray-200",
    }
    return colors[color] || colors.blue
  }

  const handleCreateRole = async () => {
    if (!newRole.name || !newRole.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      const role = {
        id: `ROLE-${Date.now()}`,
        ...newRole,
        userCount: 0,
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user?.profileDetail?.name || "Admin",
      }

      setRoles((prev) => [role, ...prev])
      setIsCreateDialogOpen(false)
      setNewRole({
        name: "",
        description: "",
        permissions: [],
        color: "blue",
      })

      toast({
        title: "Role Created",
        description: "New staff role has been created successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create role. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    try {
      setRoles((prev) => prev.filter((role) => role.id !== roleId))
      toast({
        title: "Role Deleted",
        description: "Role has been deleted successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete role. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredRoles = staffRoles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredStaff = staffData.filter(
    (staff) =>
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.roleName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const roleStats = {
    totalRoles: staffRoles.length,
    activeRoles: staffRoles.filter((r) => r.status === "active").length,
    totalStaff: staffData.length,
    activeStaff: staffData.filter((s) => s.status === "active").length,
  }

  return (
    <DashboardLayout title="Staff Role Management" description="Manage staff roles and permissions">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Roles</p>
                  <p className="text-2xl font-bold text-gray-900">{roleStats.totalRoles}</p>
                </div>
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Roles</p>
                  <p className="text-2xl font-bold text-gray-900">{roleStats.activeRoles}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Staff</p>
                  <p className="text-2xl font-bold text-gray-900">{roleStats.totalStaff}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Staff</p>
                  <p className="text-2xl font-bold text-gray-900">{roleStats.activeStaff}</p>
                </div>
                <Settings className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header with Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Role Management</h2>
            <p className="text-gray-600">Define and manage staff roles and permissions</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
                <DialogDescription>Define a new staff role with specific permissions</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role-name">Role Name *</Label>
                    <Input
                      id="role-name"
                      value={newRole.name}
                      onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                      placeholder="Enter role name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role-color">Role Color</Label>
                    <Select value={newRole.color} onValueChange={(value) => setNewRole({ ...newRole, color: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blue">Blue</SelectItem>
                        <SelectItem value="green">Green</SelectItem>
                        <SelectItem value="purple">Purple</SelectItem>
                        <SelectItem value="orange">Orange</SelectItem>
                        <SelectItem value="teal">Teal</SelectItem>
                        <SelectItem value="gray">Gray</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role-description">Description *</Label>
                  <Textarea
                    id="role-description"
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                    placeholder="Describe the role responsibilities"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Permissions</Label>
                  <div className="max-h-64 overflow-y-auto border rounded-lg p-4">
                    {Object.entries(
                      availablePermissions.reduce((acc, perm) => {
                        if (!acc[perm.category]) acc[perm.category] = []
                        acc[perm.category].push(perm)
                        return acc
                      }, {}),
                    ).map(([category, perms]) => (
                      <div key={category} className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">{category}</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {perms.map((permission) => (
                            <div key={permission.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={permission.id}
                                checked={newRole.permissions.includes(permission.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewRole({
                                      ...newRole,
                                      permissions: [...newRole.permissions, permission.id],
                                    })
                                  } else {
                                    setNewRole({
                                      ...newRole,
                                      permissions: newRole.permissions.filter((p) => p !== permission.id),
                                    })
                                  }
                                }}
                                className="rounded"
                              />
                              <Label htmlFor={permission.id} className="text-sm">
                                {permission.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateRole}>Create Role</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search roles or staff members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Roles Grid */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Roles ({filteredRoles.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoles.map((role) => (
              <Card key={role.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${getRoleColor(role.color)}`}
                      >
                        <Shield className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{role.name}</h3>
                        <p className="text-sm text-gray-600">{role.userCount} users</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(role.status)}>{role.status}</Badge>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{role.description}</p>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">PERMISSIONS ({role.permissions.length})</p>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 3).map((permission) => (
                          <Badge key={permission} variant="secondary" className="text-xs">
                            {availablePermissions.find((p) => p.id === permission)?.name || permission}
                          </Badge>
                        ))}
                        {role.permissions.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{role.permissions.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Created: {formatDate(role.createdAt)}</span>
                      <span>By: {role.createdBy}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRole(role)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => console.log("Edit role", role.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRole(role.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Staff Members Table */}
        <Card>
          <CardHeader>
            <CardTitle>Staff Members ({filteredStaff.length})</CardTitle>
            <CardDescription>View and manage staff role assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{staff.name}</div>
                        <div className="text-sm text-gray-500">ID: {staff.id}</div>
                        <div className="text-xs text-gray-400">Joined: {formatDate(staff.joinedDate)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">{staff.email}</div>
                        <div className="text-sm text-gray-500">{staff.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(staffRoles.find((r) => r.id === staff.roleId)?.color || "blue")}>
                        {staff.roleName}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{staff.department}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(staff.status)}>{staff.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">{formatDate(staff.lastLogin)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => console.log("View staff", staff.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => console.log("Edit staff", staff.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Role Details Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Role Details</DialogTitle>
              <DialogDescription>Complete information about {selectedRole?.name}</DialogDescription>
            </DialogHeader>
            {selectedRole && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Role Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">{selectedRole.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <Badge className={getStatusColor(selectedRole.status)}>{selectedRole.status}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Users:</span>
                          <span className="font-medium">{selectedRole.userCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Created:</span>
                          <span className="font-medium">{formatDate(selectedRole.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Created By:</span>
                          <span className="font-medium">{selectedRole.createdBy}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                      <p className="text-sm text-gray-600">{selectedRole.description}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Permissions ({selectedRole.permissions.length})
                      </h4>
                      <div className="max-h-64 overflow-y-auto">
                        <div className="grid grid-cols-1 gap-2">
                          {selectedRole.permissions.map((permission) => {
                            const permDetail = availablePermissions.find((p) => p.id === permission)
                            return (
                              <div
                                key={permission}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded"
                              >
                                <span className="text-sm font-medium">{permDetail?.name || permission}</span>
                                <Badge variant="outline" className="text-xs">
                                  {permDetail?.category || "General"}
                                </Badge>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
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
