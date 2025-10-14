"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Search,
  Download,
  Filter,
  Clock,
  User,
  Server,
  Database,
  Shield,
  Activity,
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function StaffLogsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [logLevel, setLogLevel] = useState("all")
  const [module, setModule] = useState("all")
  const [dateRange, setDateRange] = useState("today")
  const { toast } = useToast()

  const logs = [
    {
      id: "LOG-2024-001",
      timestamp: "2024-01-22T14:30:25Z",
      level: "error",
      module: "Authentication",
      message: "Failed login attempt for user john.smith@email.com",
      details: "Invalid password provided. IP: 192.168.1.100",
      userId: "USR-001234",
      sessionId: "SES-789012",
      source: "auth-service",
    },
    {
      id: "LOG-2024-002",
      timestamp: "2024-01-22T14:28:15Z",
      level: "info",
      module: "Customer Management",
      message: "New customer registration completed",
      details: "Customer CUST001235 successfully registered with Premium Fiber plan",
      userId: "USR-001235",
      sessionId: "SES-789013",
      source: "customer-service",
    },
    {
      id: "LOG-2024-003",
      timestamp: "2024-01-22T14:25:10Z",
      level: "warning",
      module: "Billing",
      message: "Payment processing delayed",
      details: "Payment gateway timeout for invoice INV-2024-001. Retrying in 5 minutes",
      userId: "USR-001236",
      sessionId: "SES-789014",
      source: "billing-service",
    },
    {
      id: "LOG-2024-004",
      timestamp: "2024-01-22T14:20:05Z",
      level: "info",
      module: "Operator Management",
      message: "Operator status updated",
      details: "Metro Fiber operator status changed from pending to active",
      userId: "USR-001237",
      sessionId: "SES-789015",
      source: "operator-service",
    },
    {
      id: "LOG-2024-005",
      timestamp: "2024-01-22T14:15:30Z",
      level: "error",
      module: "Database",
      message: "Database connection timeout",
      details: "Connection to customer database timed out after 30 seconds",
      userId: null,
      sessionId: null,
      source: "db-service",
    },
    {
      id: "LOG-2024-006",
      timestamp: "2024-01-22T14:10:20Z",
      level: "success",
      module: "Support",
      message: "Ticket resolved successfully",
      details: "Support ticket TKT-2024-001 marked as resolved by agent Sarah Johnson",
      userId: "USR-001238",
      sessionId: "SES-789016",
      source: "support-service",
    },
  ]

  const systemLogs = [
    {
      id: "SYS-2024-001",
      timestamp: "2024-01-22T14:35:00Z",
      level: "info",
      service: "API Gateway",
      message: "Service health check passed",
      details: "All endpoints responding normally. Response time: 120ms",
      uptime: "99.9%",
    },
    {
      id: "SYS-2024-002",
      timestamp: "2024-01-22T14:30:00Z",
      level: "warning",
      service: "Database",
      message: "High connection count detected",
      details: "Current connections: 85/100. Consider scaling database pool",
      uptime: "99.8%",
    },
    {
      id: "SYS-2024-003",
      timestamp: "2024-01-22T14:25:00Z",
      level: "error",
      service: "Email Service",
      message: "SMTP server connection failed",
      details: "Unable to connect to mail.company.com:587. Retrying...",
      uptime: "98.5%",
    },
  ]

  const auditLogs = [
    {
      id: "AUD-2024-001",
      timestamp: "2024-01-22T14:40:00Z",
      action: "User Role Updated",
      user: "admin@company.com",
      target: "john.smith@email.com",
      details: "Role changed from 'staff' to 'senior_staff'",
      ipAddress: "192.168.1.50",
    },
    {
      id: "AUD-2024-002",
      timestamp: "2024-01-22T14:35:00Z",
      action: "Customer Data Accessed",
      user: "sarah.johnson@company.com",
      target: "CUST001234",
      details: "Viewed customer profile and billing information",
      ipAddress: "192.168.1.75",
    },
    {
      id: "AUD-2024-003",
      timestamp: "2024-01-22T14:30:00Z",
      action: "System Configuration Changed",
      user: "admin@company.com",
      target: "billing-config",
      details: "Updated payment gateway timeout from 30s to 60s",
      ipAddress: "192.168.1.50",
    },
  ]

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "info":
        return <Info className="h-4 w-4 text-blue-600" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return <Info className="h-4 w-4 text-gray-600" />
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "bg-red-100 text-red-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "info":
        return "bg-blue-100 text-blue-800"
      case "success":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getModuleIcon = (module: string) => {
    switch (module) {
      case "Authentication":
        return <Shield className="h-4 w-4 text-indigo-600" />
      case "Database":
        return <Database className="h-4 w-4 text-purple-600" />
      case "API Gateway":
        return <Server className="h-4 w-4 text-blue-600" />
      case "Customer Management":
        return <User className="h-4 w-4 text-green-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const handleExportLogs = (type: string) => {
    toast({
      title: "Exporting Logs",
      description: `${type} logs are being exported to CSV format.`,
    })
  }

  const handleLogAction = (logId: string, action: string) => {
    toast({
      title: `Log ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      description: `Log ${logId} has been ${action}.`,
    })
  }

  return (
    <DashboardLayout title="System Logs" description="Monitor system activities, errors, and audit trails">
      <div className="space-y-6">
        <Tabs defaultValue="application" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="application">Application Logs ({logs.length})</TabsTrigger>
            <TabsTrigger value="system">System Logs ({systemLogs.length})</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs ({auditLogs.length})</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="application" className="space-y-6">
            {/* Log Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Application Logs</CardTitle>
                <CardDescription>Filter logs by level, module, date range, and search terms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label>Log Level</Label>
                    <Select value={logLevel} onValueChange={setLogLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Module</Label>
                    <Select value={module} onValueChange={setModule}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Modules</SelectItem>
                        <SelectItem value="Authentication">Authentication</SelectItem>
                        <SelectItem value="Customer Management">Customer Management</SelectItem>
                        <SelectItem value="Billing">Billing</SelectItem>
                        <SelectItem value="Operator Management">Operator Management</SelectItem>
                        <SelectItem value="Database">Database</SelectItem>
                        <SelectItem value="Support">Support</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date Range</Label>
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="yesterday">Yesterday</SelectItem>
                        <SelectItem value="week">Last 7 Days</SelectItem>
                        <SelectItem value="month">Last 30 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex-1">
                      <Input
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <Button variant="outline">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button variant="outline" onClick={() => handleExportLogs("Application")}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Logs
                  </Button>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Advanced Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Application Logs Table */}
            <Card>
              <CardHeader>
                <CardTitle>Application Logs</CardTitle>
                <CardDescription>Real-time application events and error tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Module</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>User/Session</TableHead>
                      <TableHead>Source</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="text-sm font-medium">{formatDate(log.timestamp)}</div>
                              <div className="text-xs text-gray-500">{log.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getLevelIcon(log.level)}
                            <Badge className={getLevelColor(log.level)}>
                              {log.level.charAt(0).toUpperCase() + log.level.slice(1)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getModuleIcon(log.module)}
                            <span className="text-sm">{log.module}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{log.message}</div>
                            <div className="text-sm text-gray-500 mt-1">{log.details}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {log.userId && (
                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3 text-gray-400" />
                                <span>{log.userId}</span>
                              </div>
                            )}
                            {log.sessionId && <div className="text-xs text-gray-500 mt-1">{log.sessionId}</div>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.source}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Logs</CardTitle>
                <CardDescription>Infrastructure and service monitoring logs</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Uptime</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {systemLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="text-sm font-medium">{formatDate(log.timestamp)}</div>
                              <div className="text-xs text-gray-500">{log.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getLevelIcon(log.level)}
                            <Badge className={getLevelColor(log.level)}>
                              {log.level.charAt(0).toUpperCase() + log.level.slice(1)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Server className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">{log.service}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{log.message}</div>
                            <div className="text-sm text-gray-500 mt-1">{log.details}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {log.uptime}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Audit Logs</CardTitle>
                <CardDescription>Security and compliance audit trail</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="text-sm font-medium">{formatDate(log.timestamp)}</div>
                              <div className="text-xs text-gray-500">{log.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Shield className="h-4 w-4 text-indigo-600" />
                            <Badge variant="outline" className="bg-indigo-50 text-indigo-700">
                              {log.action}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium">{log.user}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.target}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">{log.details}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-mono text-gray-500">{log.ipAddress}</div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-pink-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Error Logs</CardTitle>
                  <div className="p-2 bg-red-500 rounded-lg">
                    <XCircle className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {logs.filter((l) => l.level === "error").length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Warnings</CardTitle>
                  <div className="p-2 bg-yellow-500 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {logs.filter((l) => l.level === "warning").length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Requiring attention</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Info Logs</CardTitle>
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Info className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {logs.filter((l) => l.level === "info").length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Informational</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Success Logs</CardTitle>
                  <div className="p-2 bg-green-500 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {logs.filter((l) => l.level === "success").length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Successful operations</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Log Distribution by Module</CardTitle>
                  <CardDescription>Breakdown of logs by application module</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      "Authentication",
                      "Customer Management",
                      "Billing",
                      "Operator Management",
                      "Database",
                      "Support",
                    ].map((mod) => (
                      <div key={mod} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getModuleIcon(mod)}
                          <span className="text-sm text-gray-600">{mod}</span>
                        </div>
                        <span className="font-medium">{logs.filter((l) => l.module === mod).length}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest system events and activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {logs.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">{getLevelIcon(log.level)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{log.message}</p>
                          <p className="text-xs text-gray-500">
                            {log.module} • {formatDate(log.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
