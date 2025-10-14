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
import { Slider } from "@/components/ui/slider"
import {
  Building2,
  Phone,
  Mail,
  DollarSign,
  Users,
  TrendingUp,
  Search,
  Eye,
  Edit,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Calendar,
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function StaffOperatorsPage() {
  const [revenueRange, setRevenueRange] = useState([0, 1000000])
  const [customerRange, setCustomerRange] = useState([0, 1000])
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const operators = [
    {
      id: "OP001",
      name: "City Networks",
      contactPerson: "Rajesh Kumar",
      email: "rajesh@citynetworks.com",
      phone: "+91 98765 43210",
      address: {
        area: "Sector 15",
        district: "Gurgaon",
        state: "Haryana",
        pincode: "122001",
      },
      plan: "Premium Plan",
      status: "active",
      joinDate: "2023-06-15",
      lastActivity: "2024-01-22",
      assignedStaff: "Sarah Johnson",
      revenue: 450000,
      customerCount: 1250,
      growthRate: 15.2,
      satisfactionRating: 4.5,
      documentsStatus: "verified",
      billingStatus: "current",
      priority: "high",
    },
    {
      id: "OP002",
      name: "Metro Fiber",
      contactPerson: "Priya Sharma",
      email: "priya@metrofiber.com",
      phone: "+91 87654 32109",
      address: {
        area: "Koramangala",
        district: "Bangalore",
        state: "Karnataka",
        pincode: "560034",
      },
      plan: "Standard Plan",
      status: "active",
      joinDate: "2023-08-20",
      lastActivity: "2024-01-20",
      assignedStaff: "Mike Wilson",
      revenue: 320000,
      customerCount: 890,
      growthRate: 8.7,
      satisfactionRating: 4.2,
      documentsStatus: "pending",
      billingStatus: "overdue",
      priority: "medium",
    },
    {
      id: "OP003",
      name: "Speed Net Solutions",
      contactPerson: "Amit Patel",
      email: "amit@speednet.com",
      phone: "+91 76543 21098",
      address: {
        area: "Satellite",
        district: "Ahmedabad",
        state: "Gujarat",
        pincode: "380015",
      },
      plan: "Enterprise Plan",
      status: "active",
      joinDate: "2023-04-10",
      lastActivity: "2024-01-18",
      assignedStaff: "Lisa Chen",
      revenue: 680000,
      customerCount: 1850,
      growthRate: 22.1,
      satisfactionRating: 4.8,
      documentsStatus: "verified",
      billingStatus: "current",
      priority: "high",
    },
  ]

  const onboardingQueue = [
    {
      id: "ONB001",
      operatorName: "Digital Connect",
      contactPerson: "Suresh Reddy",
      email: "suresh@digitalconnect.com",
      phone: "+91 98765 12345",
      applicationDate: "2024-01-20",
      status: "document-review",
      assignedTo: "Sarah Johnson",
      completionPercentage: 60,
      nextStep: "KYC Verification",
      priority: "high",
    },
    {
      id: "ONB002",
      operatorName: "Fiber Link Pro",
      contactPerson: "Neha Gupta",
      email: "neha@fiberlinkpro.com",
      phone: "+91 87654 98765",
      applicationDate: "2024-01-18",
      status: "plan-selection",
      assignedTo: "Mike Wilson",
      completionPercentage: 30,
      nextStep: "Plan Configuration",
      priority: "medium",
    },
  ]

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getBillingStatusColor = (status: string) => {
    switch (status) {
      case "current":
        return "bg-green-100 text-green-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getOnboardingStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "document-review":
        return <FileText className="h-4 w-4 text-yellow-600" />
      case "plan-selection":
        return <Clock className="h-4 w-4 text-blue-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const handleOperatorAction = (operatorId: string, action: string) => {
    toast({
      title: `Operator ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      description: `Action ${action} performed on operator ${operatorId}.`,
    })
  }

  const handleOnboardingAction = (onboardingId: string, action: string) => {
    toast({
      title: `Onboarding ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      description: `Onboarding ${onboardingId} has been ${action}.`,
    })
  }

  return (
    <DashboardLayout title="Operator Management" description="Manage operator relationships and onboarding">
      <div className="space-y-6">
        <Tabs defaultValue="operators" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="operators">Operators ({operators.length})</TabsTrigger>
            <TabsTrigger value="onboarding">Onboarding ({onboardingQueue.length})</TabsTrigger>
            <TabsTrigger value="relations">Relations</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="operators" className="space-y-6">
            {/* Operator Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Operators</CardTitle>
                <CardDescription>Filter operators by revenue, customer count, and search terms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>
                      Revenue Range: {formatCurrency(revenueRange[0])} - {formatCurrency(revenueRange[1])}
                    </Label>
                    <Slider
                      value={revenueRange}
                      onValueChange={setRevenueRange}
                      max={1000000}
                      step={10000}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Customer Range: {customerRange[0]} - {customerRange[1]}
                    </Label>
                    <Slider
                      value={customerRange}
                      onValueChange={setCustomerRange}
                      max={2000}
                      step={50}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search operators..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <Button variant="outline">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Operators Table */}
            <Card>
              <CardHeader>
                <CardTitle>Operator Management</CardTitle>
                <CardDescription>Manage operator relationships and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Operator</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned Staff</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {operators.map((operator) => (
                      <TableRow key={operator.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{operator.name}</div>
                            <div className="text-sm text-gray-500">{operator.contactPerson}</div>
                            <div className="text-xs text-gray-400">{operator.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>
                              {operator.address.area}, {operator.address.district}
                            </div>
                            <div className="text-gray-500">{operator.address.state}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{formatCurrency(operator.revenue)}</div>
                            <div className="text-xs text-gray-500">{operator.customerCount} customers</div>
                            <div className="flex items-center space-x-1">
                              <TrendingUp className="h-3 w-3 text-green-600" />
                              <span className="text-xs text-green-600">+{operator.growthRate}%</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge className={getStatusColor(operator.status)}>{operator.status}</Badge>
                            <div className="text-xs">
                              <Badge variant="outline" className={getDocumentStatusColor(operator.documentsStatus)}>
                                {operator.documentsStatus}
                              </Badge>
                            </div>
                            <div className="text-xs">
                              <Badge variant="outline" className={getBillingStatusColor(operator.billingStatus)}>
                                {operator.billingStatus}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{operator.assignedStaff}</div>
                          <div className="text-xs text-gray-500">
                            Last activity: {formatDate(operator.lastActivity)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(operator.priority)}>
                            {operator.priority.charAt(0).toUpperCase() + operator.priority.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOperatorAction(operator.id, "contacted")}
                            >
                              <Phone className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOperatorAction(operator.id, "emailed")}
                            >
                              <Mail className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOperatorAction(operator.id, "viewed")}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOperatorAction(operator.id, "edited")}
                            >
                              <Edit className="h-3 w-3" />
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

          <TabsContent value="onboarding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Onboarding Queue</CardTitle>
                <CardDescription>Manage new operator onboarding process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {onboardingQueue.map((item) => (
                    <Card key={item.id} className="border-0 shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="flex-shrink-0 mt-1">{getOnboardingStatusIcon(item.status)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-semibold text-gray-900">{item.operatorName}</h3>
                                <Badge className={getPriorityColor(item.priority)}>
                                  {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500">Contact Person:</span>
                                  <span className="ml-2 font-medium">{item.contactPerson}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Email:</span>
                                  <span className="ml-2">{item.email}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Applied:</span>
                                  <span className="ml-2">{formatDate(item.applicationDate)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Assigned To:</span>
                                  <span className="ml-2">{item.assignedTo}</span>
                                </div>
                              </div>
                              <div className="mt-4">
                                <div className="flex items-center justify-between text-sm mb-2">
                                  <span className="text-gray-500">Progress</span>
                                  <span className="font-medium">{item.completionPercentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${item.completionPercentage}%` }}
                                  />
                                </div>
                                <p className="text-sm text-gray-600 mt-2">Next Step: {item.nextStep}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <Button size="sm" onClick={() => handleOnboardingAction(item.id, "approved")}>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOnboardingAction(item.id, "contacted")}
                              className="bg-transparent"
                            >
                              <Phone className="h-3 w-3 mr-1" />
                              Contact
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOnboardingAction(item.id, "viewed")}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="relations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Relationship Management</CardTitle>
                  <CardDescription>Manage operator relationships and communications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {operators.slice(0, 3).map((operator) => (
                      <div key={operator.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-indigo-100 rounded-lg">
                            <Building2 className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{operator.name}</h4>
                            <p className="text-sm text-gray-600">{operator.contactPerson}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={getStatusColor(operator.status)}>{operator.status}</Badge>
                              <span className="text-xs text-gray-500">
                                Last contact: {formatDate(operator.lastActivity)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" className="bg-transparent">
                            <Phone className="h-3 w-3 mr-1" />
                            Call
                          </Button>
                          <Button size="sm" variant="outline" className="bg-transparent">
                            <Mail className="h-3 w-3 mr-1" />
                            Email
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Follow-up Schedule</CardTitle>
                  <CardDescription>Scheduled follow-ups and meetings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Quarterly Review - City Networks</h4>
                          <p className="text-sm text-gray-600">Performance review meeting</p>
                          <p className="text-xs text-gray-500">Tomorrow, 2:00 PM</p>
                        </div>
                      </div>
                      <Button size="sm">Join</Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Phone className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Follow-up Call - Metro Fiber</h4>
                          <p className="text-sm text-gray-600">Billing issue resolution</p>
                          <p className="text-xs text-gray-500">Jan 25, 10:00 AM</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="bg-transparent">
                        Schedule
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <FileText className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Document Review - Speed Net</h4>
                          <p className="text-sm text-gray-600">Contract renewal documents</p>
                          <p className="text-xs text-gray-500">Jan 28, 3:00 PM</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="bg-transparent">
                        Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-blue-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Total Operators</CardTitle>
                  <div className="p-2 bg-indigo-500 rounded-lg">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{operators.length}</div>
                  <p className="text-xs text-gray-500 mt-1">Active operators</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Total Revenue</CardTitle>
                  <div className="p-2 bg-green-500 rounded-lg">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {formatCurrency(operators.reduce((sum, op) => sum + op.revenue, 0))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Combined revenue</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Total Customers</CardTitle>
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {operators.reduce((sum, op) => sum + op.customerCount, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Served customers</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Avg Growth</CardTitle>
                  <div className="p-2 bg-yellow-500 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {(operators.reduce((sum, op) => sum + op.growthRate, 0) / operators.length).toFixed(1)}%
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Monthly growth</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Operator Performance Metrics</CardTitle>
                <CardDescription>Performance analysis and relationship management insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Operator Status Distribution</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Active Operators</span>
                        <span className="font-medium text-green-600">
                          {operators.filter((op) => op.status === "active").length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Pending Onboarding</span>
                        <span className="font-medium text-yellow-600">{onboardingQueue.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">High Priority</span>
                        <span className="font-medium text-red-600">
                          {operators.filter((op) => op.priority === "high").length}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Relationship Health</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Avg Satisfaction</span>
                        <span className="font-medium">
                          {(operators.reduce((sum, op) => sum + op.satisfactionRating, 0) / operators.length).toFixed(
                            1,
                          )}
                          /5
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Document Compliance</span>
                        <span className="font-medium text-green-600">
                          {Math.round(
                            (operators.filter((op) => op.documentsStatus === "verified").length / operators.length) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Billing Current</span>
                        <span className="font-medium text-green-600">
                          {Math.round(
                            (operators.filter((op) => op.billingStatus === "current").length / operators.length) * 100,
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
