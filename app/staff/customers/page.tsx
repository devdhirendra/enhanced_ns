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
  Users,
  Phone,
  Mail,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Eye,
  Edit,
  Calendar,
  Star,
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function StaffCustomersPage() {
  const [satisfactionRange, setSatisfactionRange] = useState([1, 5])
  const [responseTimeRange, setResponseTimeRange] = useState([0, 24])
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const customers = [
    {
      id: "CUST001234",
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "+91 98765 43210",
      plan: "Premium Fiber 100 Mbps",
      status: "active",
      joinDate: "2023-06-15",
      lastContact: "2024-01-20",
      assignedAgent: "Sarah Johnson",
      satisfactionRating: 4.5,
      totalTickets: 3,
      openTickets: 1,
      avgResponseTime: 2.5,
      priority: "medium",
    },
    {
      id: "CUST001235",
      name: "Emily Davis",
      email: "emily.davis@email.com",
      phone: "+91 87654 32109",
      plan: "Basic Fiber 50 Mbps",
      status: "active",
      joinDate: "2023-08-20",
      lastContact: "2024-01-18",
      assignedAgent: "Mike Wilson",
      satisfactionRating: 5.0,
      totalTickets: 1,
      openTickets: 0,
      avgResponseTime: 1.2,
      priority: "low",
    },
    {
      id: "CUST001236",
      name: "Robert Johnson",
      email: "robert.johnson@email.com",
      phone: "+91 76543 21098",
      plan: "Enterprise 200 Mbps",
      status: "active",
      joinDate: "2023-04-10",
      lastContact: "2024-01-22",
      assignedAgent: "Lisa Chen",
      satisfactionRating: 3.8,
      totalTickets: 8,
      openTickets: 2,
      avgResponseTime: 4.1,
      priority: "high",
    },
  ]

  const supportTickets = [
    {
      id: "TKT-2024-001",
      customerId: "CUST001234",
      customerName: "John Smith",
      subject: "Internet connection issues",
      priority: "high",
      status: "in-progress",
      assignedTo: "Sarah Johnson",
      createdDate: "2024-01-20",
      lastUpdate: "2024-01-22",
      responseTime: 2.5,
      category: "Technical",
    },
    {
      id: "TKT-2024-002",
      customerId: "CUST001236",
      customerName: "Robert Johnson",
      subject: "Billing inquiry",
      priority: "medium",
      status: "pending",
      assignedTo: "Lisa Chen",
      createdDate: "2024-01-19",
      lastUpdate: "2024-01-19",
      responseTime: 0,
      category: "Billing",
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

  const getTicketStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "pending":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getTicketStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800"
      case "pending":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleContactCustomer = (customerId: string, method: string) => {
    toast({
      title: `Contacting Customer`,
      description: `Initiating ${method} contact with customer ${customerId}.`,
    })
  }

  const handleTicketAction = (ticketId: string, action: string) => {
    toast({
      title: `Ticket ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      description: `Ticket ${ticketId} has been ${action}.`,
    })
  }

  return (
    <DashboardLayout title="Customer Support" description="Manage customer relationships and support tickets">
      <div className="space-y-6">
        <Tabs defaultValue="customers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="customers">Customers ({customers.length})</TabsTrigger>
            <TabsTrigger value="tickets">Support Tickets ({supportTickets.length})</TabsTrigger>
            <TabsTrigger value="queue">Support Queue</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="customers" className="space-y-6">
            {/* Customer Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Customers</CardTitle>
                <CardDescription>Filter customers by satisfaction rating and response time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>
                      Satisfaction Range: {satisfactionRange[0]} - {satisfactionRange[1]} stars
                    </Label>
                    <Slider
                      value={satisfactionRange}
                      onValueChange={setSatisfactionRange}
                      max={5}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Response Time: {responseTimeRange[0]} - {responseTimeRange[1]} hours
                    </Label>
                    <Slider
                      value={responseTimeRange}
                      onValueChange={setResponseTimeRange}
                      max={24}
                      step={0.5}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search customers..."
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

            {/* Customer List */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Management</CardTitle>
                <CardDescription>Manage customer relationships and support interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Assigned Agent</TableHead>
                      <TableHead>Satisfaction</TableHead>
                      <TableHead>Tickets</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-500">{customer.email}</div>
                            <div className="text-xs text-gray-400">{customer.id}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <Badge variant="outline">{customer.plan}</Badge>
                            <div className="text-xs text-gray-500 mt-1">
                              <Badge className={getStatusColor(customer.status)}>{customer.status}</Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{customer.assignedAgent}</div>
                          <div className="text-xs text-gray-500">Last contact: {formatDate(customer.lastContact)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="font-medium">{customer.satisfactionRating}</span>
                          </div>
                          <div className="text-xs text-gray-500">Avg response: {customer.avgResponseTime}h</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="font-medium">{customer.totalTickets}</span> total
                          </div>
                          <div className="text-xs text-gray-500">
                            <span className="text-red-600">{customer.openTickets}</span> open
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(customer.priority)}>
                            {customer.priority.charAt(0).toUpperCase() + customer.priority.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleContactCustomer(customer.id, "phone")}
                            >
                              <Phone className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleContactCustomer(customer.id, "email")}
                            >
                              <Mail className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleContactCustomer(customer.id, "chat")}
                            >
                              <MessageSquare className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
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

          <TabsContent value="tickets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
                <CardDescription>Manage customer support tickets and resolutions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Response Time</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supportTickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{ticket.subject}</div>
                            <div className="text-sm text-gray-500">{ticket.id}</div>
                            <div className="text-xs text-gray-400">Created: {formatDate(ticket.createdDate)}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{ticket.customerName}</div>
                            <div className="text-sm text-gray-500">{ticket.customerId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{ticket.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getTicketStatusIcon(ticket.status)}
                            <Badge className={getTicketStatusColor(ticket.status)}>
                              {ticket.status.replace("-", " ").charAt(0).toUpperCase() +
                                ticket.status.replace("-", " ").slice(1)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{ticket.assignedTo}</div>
                          <div className="text-xs text-gray-500">Updated: {formatDate(ticket.lastUpdate)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {ticket.responseTime > 0 ? `${ticket.responseTime}h` : "Pending"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleTicketAction(ticket.id, "viewed")}>
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTicketAction(ticket.id, "assigned")}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" onClick={() => handleTicketAction(ticket.id, "resolved")}>
                              <CheckCircle className="h-3 w-3" />
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

          <TabsContent value="queue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Priority Queue</CardTitle>
                  <CardDescription>High priority customers requiring immediate attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {customers
                      .filter((c) => c.priority === "high" || c.openTickets > 0)
                      .map((customer) => (
                        <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-red-100 rounded-lg">
                              <AlertTriangle className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{customer.name}</h4>
                              <p className="text-sm text-gray-600">{customer.email}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className={getPriorityColor(customer.priority)}>
                                  {customer.priority.charAt(0).toUpperCase() + customer.priority.slice(1)}
                                </Badge>
                                <span className="text-xs text-gray-500">{customer.openTickets} open tickets</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button size="sm">
                              <Phone className="h-3 w-3 mr-1" />
                              Call
                            </Button>
                            <Button size="sm" variant="outline" className="bg-transparent">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Chat
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Follow-up Queue</CardTitle>
                  <CardDescription>Customers requiring follow-up contact</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {customers
                      .filter((c) => {
                        const lastContact = new Date(c.lastContact)
                        const daysSince = (Date.now() - lastContact.getTime()) / (1000 * 60 * 60 * 24)
                        return daysSince > 7
                      })
                      .map((customer) => (
                        <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Calendar className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{customer.name}</h4>
                              <p className="text-sm text-gray-600">{customer.email}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs text-gray-500">
                                  Last contact: {formatDate(customer.lastContact)}
                                </span>
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                  <span className="text-xs">{customer.satisfactionRating}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline" className="bg-transparent">
                              <Mail className="h-3 w-3 mr-1" />
                              Email
                            </Button>
                            <Button size="sm" variant="outline" className="bg-transparent">
                              <Calendar className="h-3 w-3 mr-1" />
                              Schedule
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-blue-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Total Customers</CardTitle>
                  <div className="p-2 bg-indigo-500 rounded-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{customers.length}</div>
                  <p className="text-xs text-gray-500 mt-1">Under management</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Avg Satisfaction</CardTitle>
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {(customers.reduce((sum, c) => sum + c.satisfactionRating, 0) / customers.length).toFixed(1)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Out of 5 stars</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Open Tickets</CardTitle>
                  <div className="p-2 bg-yellow-500 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {customers.reduce((sum, c) => sum + c.openTickets, 0)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Requiring attention</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Avg Response</CardTitle>
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {(customers.reduce((sum, c) => sum + c.avgResponseTime, 0) / customers.length).toFixed(1)}h
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Response time</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Customer Support Metrics</CardTitle>
                <CardDescription>Performance metrics and customer satisfaction trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Customer Priority Distribution</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">High Priority</span>
                        <span className="font-medium text-red-600">
                          {customers.filter((c) => c.priority === "high").length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Medium Priority</span>
                        <span className="font-medium text-yellow-600">
                          {customers.filter((c) => c.priority === "medium").length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Low Priority</span>
                        <span className="font-medium text-green-600">
                          {customers.filter((c) => c.priority === "low").length}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Support Performance</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Tickets</span>
                        <span className="font-medium">{customers.reduce((sum, c) => sum + c.totalTickets, 0)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Resolution Rate</span>
                        <span className="font-medium text-green-600">85%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">First Contact Resolution</span>
                        <span className="font-medium text-blue-600">72%</span>
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
