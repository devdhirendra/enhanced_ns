"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Search,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  Phone,
  Mail,
  Calendar,
  Tag,
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { complaintApi } from "@/lib/api"

export default function StaffTicketsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // Mock data - replace with actual API calls
  const ticketData = [
    {
      id: "TKT-001",
      customerId: "CUST-001",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      customerPhone: "+91 9876543210",
      title: "Internet Speed Issue",
      description: "Internet speed is slower than expected. Getting only 50 Mbps instead of 100 Mbps.",
      category: "Technical",
      priority: "high",
      status: "open",
      assignedTo: user?.user_id,
      assignedStaff: user?.profileDetail?.name || "Current User",
      createdAt: "2024-01-20T10:30:00Z",
      updatedAt: "2024-01-21T14:15:00Z",
      responses: [
        {
          id: "RESP-001",
          author: "Staff Member",
          message: "We've received your complaint and are investigating the issue.",
          timestamp: "2024-01-20T11:00:00Z",
          type: "staff",
        },
      ],
    },
    {
      id: "TKT-002",
      customerId: "CUST-002",
      customerName: "Jane Smith",
      customerEmail: "jane@example.com",
      customerPhone: "+91 9876543211",
      title: "Billing Inquiry",
      description: "Need clarification on additional charges in last month's bill.",
      category: "Billing",
      priority: "medium",
      status: "in-progress",
      assignedTo: user?.user_id,
      assignedStaff: user?.profileDetail?.name || "Current User",
      createdAt: "2024-01-18T09:00:00Z",
      updatedAt: "2024-01-19T16:30:00Z",
      responses: [],
    },
    {
      id: "TKT-003",
      customerId: "CUST-003",
      customerName: "Mike Johnson",
      customerEmail: "mike@example.com",
      customerPhone: "+91 9876543212",
      title: "Connection Problem",
      description: "No internet connection since yesterday evening.",
      category: "Technical",
      priority: "high",
      status: "resolved",
      assignedTo: "STAFF-002",
      assignedStaff: "Tech Support Team",
      createdAt: "2024-01-15T11:45:00Z",
      updatedAt: "2024-01-16T10:30:00Z",
      responses: [],
    },
  ]

  const [newResponse, setNewResponse] = useState("")

  useEffect(() => {
    // Simulate loading tickets
    setTimeout(() => {
      setTickets(ticketData)
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "in-progress":
        return <AlertCircle className="h-4 w-4 text-blue-600" />
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "closed":
        return <XCircle className="h-4 w-4 text-gray-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-yellow-100 text-yellow-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
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

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      // Use complaint API to update status
      await complaintApi.changestatus(ticketId, { status: newStatus })

      // Update local state
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, status: newStatus, updatedAt: new Date().toISOString() } : ticket,
        ),
      )

      toast({
        title: "Status Updated",
        description: `Ticket status has been updated to ${newStatus}.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update ticket status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddResponse = async (ticketId: string) => {
    if (!newResponse.trim()) {
      toast({
        title: "Response Required",
        description: "Please enter a response message.",
        variant: "destructive",
      })
      return
    }

    try {
      // Add response to ticket
      const response = {
        id: `RESP-${Date.now()}`,
        author: user?.profileDetail?.name || "Staff Member",
        message: newResponse,
        timestamp: new Date().toISOString(),
        type: "staff",
      }

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId
            ? { ...ticket, responses: [...ticket.responses, response], updatedAt: new Date().toISOString() }
            : ticket,
        ),
      )

      setNewResponse("")
      toast({
        title: "Response Added",
        description: "Your response has been added to the ticket.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add response. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredTickets = ticketData.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || ticket.status === filterStatus
    const matchesPriority = filterPriority === "all" || ticket.priority === filterPriority
    return matchesSearch && matchesStatus && matchesPriority
  })

  const ticketStats = {
    total: ticketData.length,
    open: ticketData.filter((t) => t.status === "open").length,
    inProgress: ticketData.filter((t) => t.status === "in-progress").length,
    resolved: ticketData.filter((t) => t.status === "resolved").length,
    myTickets: ticketData.filter((t) => t.assignedTo === user?.user_id).length,
  }

  return (
    <DashboardLayout title="Support Tickets" description="Manage customer support tickets and complaints">
      <div className="space-y-6">
        {/* Ticket Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                  <p className="text-2xl font-bold text-gray-900">{ticketStats.total}</p>
                </div>
                <Tag className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Open</p>
                  <p className="text-2xl font-bold text-gray-900">{ticketStats.open}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{ticketStats.inProgress}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-gray-900">{ticketStats.resolved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">My Tickets</p>
                  <p className="text-2xl font-bold text-gray-900">{ticketStats.myTickets}</p>
                </div>
                <User className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All Tickets</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="my-tickets">My Tickets</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search tickets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tickets Table */}
            <Card>
              <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
                <CardDescription>Manage and respond to customer support requests</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">{ticket.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{ticket.customerName}</div>
                            <div className="text-sm text-gray-500">{ticket.customerEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-medium text-gray-900 truncate">{ticket.title}</div>
                            <div className="text-sm text-gray-500 truncate">{ticket.description}</div>
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
                            {getStatusIcon(ticket.status)}
                            <Badge className={getStatusColor(ticket.status)}>
                              {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{ticket.assignedStaff}</TableCell>
                        <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedTicket(ticket)
                                setIsViewDialogOpen(true)
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Select onValueChange={(value) => handleStatusChange(ticket.id, value)}>
                              <SelectTrigger className="w-32 h-8">
                                <SelectValue placeholder="Update" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tab contents would filter by status */}
          <TabsContent value="open">
            <Card>
              <CardHeader>
                <CardTitle>Open Tickets</CardTitle>
                <CardDescription>Tickets that need immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ticketData
                      .filter((t) => t.status === "open")
                      .map((ticket) => (
                        <TableRow key={ticket.id}>
                          <TableCell className="font-medium">{ticket.id}</TableCell>
                          <TableCell>{ticket.customerName}</TableCell>
                          <TableCell>{ticket.title}</TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(ticket.priority)}>
                              {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                          <TableCell>
                            <Button size="sm" onClick={() => handleStatusChange(ticket.id, "in-progress")}>
                              Take Ticket
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-tickets">
            <Card>
              <CardHeader>
                <CardTitle>My Assigned Tickets</CardTitle>
                <CardDescription>Tickets assigned to you</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ticketData
                      .filter((t) => t.assignedTo === user?.user_id)
                      .map((ticket) => (
                        <TableRow key={ticket.id}>
                          <TableCell className="font-medium">{ticket.id}</TableCell>
                          <TableCell>{ticket.customerName}</TableCell>
                          <TableCell>{ticket.title}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(ticket.status)}>
                              {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(ticket.priority)}>
                              {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(ticket.updatedAt)}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedTicket(ticket)
                                setIsViewDialogOpen(true)
                              }}
                            >
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Respond
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Ticket Detail Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ticket Details - {selectedTicket?.id}</DialogTitle>
              <DialogDescription>View and respond to customer support ticket</DialogDescription>
            </DialogHeader>
            {selectedTicket && (
              <div className="space-y-6">
                {/* Customer Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{selectedTicket.customerName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{selectedTicket.customerEmail}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{selectedTicket.customerPhone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>Created: {formatDate(selectedTicket.createdAt)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Ticket Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ticket Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Title</Label>
                      <p className="text-gray-900">{selectedTicket.title}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-gray-700">{selectedTicket.description}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Category</Label>
                        <Badge variant="outline" className="mt-1">
                          {selectedTicket.category}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Priority</Label>
                        <Badge className={`${getPriorityColor(selectedTicket.priority)} mt-1`}>
                          {selectedTicket.priority.charAt(0).toUpperCase() + selectedTicket.priority.slice(1)}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <Badge className={`${getStatusColor(selectedTicket.status)} mt-1`}>
                          {selectedTicket.status.charAt(0).toUpperCase() + selectedTicket.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Responses */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Responses</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedTicket.responses && selectedTicket.responses.length > 0 ? (
                      selectedTicket.responses.map((response) => (
                        <div key={response.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{response.author}</span>
                            <span className="text-sm text-gray-500">{formatDate(response.timestamp)}</span>
                          </div>
                          <p className="text-gray-700">{response.message}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No responses yet</p>
                    )}
                  </CardContent>
                </Card>

                {/* Add Response */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Add Response</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Type your response here..."
                      value={newResponse}
                      onChange={(e) => setNewResponse(e.target.value)}
                      rows={4}
                    />
                    <div className="flex justify-end space-x-4">
                      <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                        Close
                      </Button>
                      <Button onClick={() => handleAddResponse(selectedTicket.id)}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send Response
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
