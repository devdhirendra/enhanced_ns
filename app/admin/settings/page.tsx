"use client"

import type React from "react"

import { useState } from "react"
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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  Settings,
  Users,
  Shield,
  Activity,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  UserPlus,
  Lock,
  Database,
  Bell,
  Mail,
  Smartphone,
  Globe,
} from "lucide-react"
import { formatDate, getStatusColor, exportToCSV } from "@/lib/utils"

// Demo data for admin staff
const adminStaff = [
  {
    id: "ADM001",
    name: "Rajesh Kumar",
    email: "rajesh@mynetwork.com",
    phone: "+91 9876543210",
    role: "Super Admin",
    permissions: ["all"],
    status: "active",
    lastLogin: "2024-01-20 14:30",
    joinDate: "2023-01-15",
    department: "Administration",
  },
  {
    id: "ADM002",
    name: "Priya Singh",
    email: "priya@mynetwork.com",
    phone: "+91 9876543211",
    role: "Admin",
    permissions: ["operators", "billing", "support"],
    status: "active",
    lastLogin: "2024-01-20 13:45",
    joinDate: "2023-03-20",
    department: "Operations",
  },
  {
    id: "ADM003",
    name: "Amit Sharma",
    email: "amit@mynetwork.com",
    phone: "+91 9876543212",
    role: "Manager",
    permissions: ["inventory", "marketplace", "reports"],
    status: "active",
    lastLogin: "2024-01-19 16:20",
    joinDate: "2023-06-10",
    department: "Inventory",
  },
  {
    id: "ADM004",
    name: "Neha Gupta",
    email: "neha@mynetwork.com",
    phone: "+91 9876543213",
    role: "Support Manager",
    permissions: ["support", "notifications"],
    status: "inactive",
    lastLogin: "2024-01-18 11:30",
    joinDate: "2023-08-05",
    department: "Support",
  },
]

// Demo data for system logs
const systemLogs = [
  {
    id: "LOG001",
    timestamp: "2024-01-20 14:30:25",
    user: "Rajesh Kumar",
    action: "User Login",
    resource: "Admin Dashboard",
    ipAddress: "192.168.1.100",
    status: "success",
    details: "Successful login from Chrome browser",
  },
  {
    id: "LOG002",
    timestamp: "2024-01-20 14:25:10",
    user: "Priya Singh",
    action: "Operator Created",
    resource: "City Networks",
    ipAddress: "192.168.1.101",
    status: "success",
    details: "New operator account created",
  },
  {
    id: "LOG003",
    timestamp: "2024-01-20 14:20:45",
    user: "System",
    action: "Backup Created",
    resource: "Database",
    ipAddress: "127.0.0.1",
    status: "success",
    details: "Automated daily backup completed",
  },
  {
    id: "LOG004",
    timestamp: "2024-01-20 14:15:30",
    user: "Amit Sharma",
    action: "Inventory Update",
    resource: "ONU Stock",
    ipAddress: "192.168.1.102",
    status: "success",
    details: "Stock quantity updated for ONU devices",
  },
  {
    id: "LOG005",
    timestamp: "2024-01-20 14:10:15",
    user: "Unknown",
    action: "Failed Login",
    resource: "Admin Panel",
    ipAddress: "203.0.113.1",
    status: "failed",
    details: "Multiple failed login attempts detected",
  },
]

// Demo data for roles and permissions
const roles = [
  {
    id: "ROLE001",
    name: "Super Admin",
    description: "Full system access with all permissions",
    permissions: ["all"],
    userCount: 1,
    status: "active",
  },
  {
    id: "ROLE002",
    name: "Admin",
    description: "Administrative access to core modules",
    permissions: ["operators", "billing", "support", "notifications"],
    userCount: 3,
    status: "active",
  },
  {
    id: "ROLE003",
    name: "Manager",
    description: "Departmental management access",
    permissions: ["inventory", "marketplace", "reports"],
    userCount: 2,
    status: "active",
  },
  {
    id: "ROLE004",
    name: "Support Manager",
    description: "Customer support and ticket management",
    permissions: ["support", "notifications"],
    userCount: 1,
    status: "active",
  },
]

// System settings
const systemSettings = {
  general: {
    companyName: "MY NETWORK SOLUTIONS",
    companyEmail: "admin@mynetwork.com",
    companyPhone: "+91 9876543210",
    companyAddress: "123 Tech Park, Chandigarh, India",
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    currency: "INR",
  },
  security: {
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      expiryDays: 90,
    },
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    twoFactorAuth: false,
    ipWhitelist: ["192.168.1.0/24"],
  },
  notifications: {
    emailEnabled: true,
    smsEnabled: true,
    pushEnabled: true,
    whatsappEnabled: false,
  },
  backup: {
    autoBackup: true,
    backupFrequency: "daily",
    backupTime: "02:00",
    retentionDays: 30,
    cloudBackup: true,
  },
}

export default function SettingsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [showAddStaffDialog, setShowAddStaffDialog] = useState(false)
  const [showAddRoleDialog, setShowAddRoleDialog] = useState(false)

  const filteredStaff = adminStaff.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || staff.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleExport = () => {
    const exportData = adminStaff.map((staff) => ({
      Name: staff.name,
      Email: staff.email,
      Role: staff.role,
      Department: staff.department,
      Status: staff.status,
      "Last Login": staff.lastLogin,
      "Join Date": staff.joinDate,
    }))
    exportToCSV(exportData, "admin-staff")
  }

  const totalStaff = adminStaff.length
  const activeStaff = adminStaff.filter((s) => s.status === "active").length
  const totalRoles = roles.length

  return (
    <DashboardLayout title="Admin Settings" description="System configuration and user management">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Staff</CardTitle>
              <div className="p-2 bg-blue-500 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalStaff}</div>
              <p className="text-sm text-gray-500 mt-2">{activeStaff} active users</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Active Roles</CardTitle>
              <div className="p-2 bg-green-500 rounded-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalRoles}</div>
              <p className="text-sm text-gray-500 mt-2">Permission groups</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">System Health</CardTitle>
              <div className="p-2 bg-purple-500 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">99.8%</div>
              <p className="text-sm text-gray-500 mt-2">Uptime</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Security Score</CardTitle>
              <div className="p-2 bg-orange-500 rounded-lg">
                <Lock className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">95/100</div>
              <p className="text-sm text-gray-500 mt-2">Excellent</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="staff" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="staff" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Admin Staff
              </TabsTrigger>
              <TabsTrigger value="roles" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Roles & Permissions
              </TabsTrigger>
              <TabsTrigger value="system" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                System Settings
              </TabsTrigger>
              <TabsTrigger value="logs" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                System Logs
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <TabsContent value="staff" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search staff..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="Super Admin">Super Admin</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Support Manager">Support Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={showAddStaffDialog} onOpenChange={setShowAddStaffDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Staff
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Admin Staff</DialogTitle>
                    <DialogDescription>Create a new admin user account</DialogDescription>
                  </DialogHeader>
                  <AddStaffForm onClose={() => setShowAddStaffDialog(false)} />
                </DialogContent>
              </Dialog>
            </div>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Admin Staff ({filteredStaff.length})</CardTitle>
                <CardDescription>Manage administrative users and their access</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Details</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Role & Department</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Activity</TableHead>
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
                            <div className="text-xs text-gray-400">Joined: {formatDate(staff.joinDate)}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Mail className="h-3 w-3 mr-1 text-gray-400" />
                              {staff.email}
                            </div>
                            <div className="flex items-center text-sm">
                              <Smartphone className="h-3 w-3 mr-1 text-gray-400" />
                              {staff.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <Badge variant="outline" className="mb-1">
                              {staff.role}
                            </Badge>
                            <div className="text-sm text-gray-500">{staff.department}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {staff.permissions.slice(0, 2).map((permission, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {permission}
                              </Badge>
                            ))}
                            {staff.permissions.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{staff.permissions.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(staff.status)}>{staff.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">{staff.lastLogin}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => console.log("View staff", staff.id)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => console.log("Edit staff", staff.id)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => console.log("Delete staff", staff.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Roles & Permissions</h3>
                <p className="text-sm text-gray-500">Manage user roles and access permissions</p>
              </div>
              <Dialog open={showAddRoleDialog} onOpenChange={setShowAddRoleDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Role
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Role</DialogTitle>
                    <DialogDescription>Define a new role with specific permissions</DialogDescription>
                  </DialogHeader>
                  <CreateRoleForm onClose={() => setShowAddRoleDialog(false)} />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles.map((role) => (
                <Card key={role.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-bold text-gray-900">{role.name}</CardTitle>
                        <CardDescription>{role.description}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(role.status)}>{role.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Users:</span>
                      <span className="font-medium">{role.userCount}</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Permissions:</p>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.map((permission, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() => console.log("Edit role", role.id)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => console.log("View users", role.id)}>
                        <Users className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* General Settings */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Settings className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>General Settings</CardTitle>
                      <CardDescription>Basic system configuration</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input value={systemSettings.general.companyName} />
                  </div>
                  <div className="space-y-2">
                    <Label>Company Email</Label>
                    <Input value={systemSettings.general.companyEmail} />
                  </div>
                  <div className="space-y-2">
                    <Label>Company Phone</Label>
                    <Input value={systemSettings.general.companyPhone} />
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select value={systemSettings.general.timezone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">America/New_York</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full">Save General Settings</Button>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-500 rounded-lg">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>Security Settings</CardTitle>
                      <CardDescription>Password and access policies</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Minimum Password Length</Label>
                    <Input type="number" value={systemSettings.security.passwordPolicy.minLength} />
                  </div>
                  <div className="space-y-2">
                    <Label>Session Timeout (minutes)</Label>
                    <Input type="number" value={systemSettings.security.sessionTimeout} />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Login Attempts</Label>
                    <Input type="number" value={systemSettings.security.maxLoginAttempts} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Two-Factor Authentication</Label>
                    <Switch checked={systemSettings.security.twoFactorAuth} />
                  </div>
                  <Button className="w-full">Save Security Settings</Button>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <Bell className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>Notification Settings</CardTitle>
                      <CardDescription>Configure notification channels</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <Label>Email Notifications</Label>
                    </div>
                    <Switch checked={systemSettings.notifications.emailEnabled} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4 text-gray-500" />
                      <Label>SMS Notifications</Label>
                    </div>
                    <Switch checked={systemSettings.notifications.smsEnabled} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4 text-gray-500" />
                      <Label>Push Notifications</Label>
                    </div>
                    <Switch checked={systemSettings.notifications.pushEnabled} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <Label>WhatsApp Notifications</Label>
                    </div>
                    <Switch checked={systemSettings.notifications.whatsappEnabled} />
                  </div>
                  <Button className="w-full">Save Notification Settings</Button>
                </CardContent>
              </Card>

              {/* Backup Settings */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Database className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>Backup Settings</CardTitle>
                      <CardDescription>Data backup configuration</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Auto Backup</Label>
                    <Switch checked={systemSettings.backup.autoBackup} />
                  </div>
                  <div className="space-y-2">
                    <Label>Backup Frequency</Label>
                    <Select value={systemSettings.backup.backupFrequency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Backup Time</Label>
                    <Input type="time" value={systemSettings.backup.backupTime} />
                  </div>
                  <div className="space-y-2">
                    <Label>Retention Days</Label>
                    <Input type="number" value={systemSettings.backup.retentionDays} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Cloud Backup</Label>
                    <Switch checked={systemSettings.backup.cloudBackup} />
                  </div>
                  <Button className="w-full">Save Backup Settings</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">System Activity Logs</CardTitle>
                <CardDescription>Recent system activities and security events</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {systemLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                        <TableCell>{log.user}</TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>{log.resource}</TableCell>
                        <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(log.status)}>{log.status}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{log.details}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

// Add Staff Form Component
function AddStaffForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    permissions: [] as string[],
    password: "",
    confirmPassword: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Staff form submitted:", formData)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="department">Department</Label>
          <Select
            value={formData.department}
            onValueChange={(value) => setFormData({ ...formData, department: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Administration">Administration</SelectItem>
              <SelectItem value="Operations">Operations</SelectItem>
              <SelectItem value="Support">Support</SelectItem>
              <SelectItem value="Inventory">Inventory</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="role">Role *</Label>
        <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Manager">Manager</SelectItem>
            <SelectItem value="Support Manager">Support Manager</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm Password *</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Add Staff Member</Button>
      </div>
    </form>
  )
}

// Create Role Form Component
function CreateRoleForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  })

  const availablePermissions = [
    "operators",
    "billing",
    "support",
    "inventory",
    "marketplace",
    "notifications",
    "reports",
    "analytics",
    "settings",
    "users",
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Role form submitted:", formData)
    onClose()
  }

  const togglePermission = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Role Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>
      <div>
        <Label>Permissions</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {availablePermissions.map((permission) => (
            <div key={permission} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={permission}
                checked={formData.permissions.includes(permission)}
                onChange={() => togglePermission(permission)}
                className="rounded"
              />
              <Label htmlFor={permission} className="capitalize">
                {permission}
              </Label>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Create Role</Button>
      </div>
    </form>
  )
}
