"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Plus,
  Search,
  Filter,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Wrench,
  CreditCard,
  Settings,
  FileText,
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { complaintApi } from "@/lib/api"

export default function CustomerRequestsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  // Mock data - replace with actual API calls
  const serviceRequests = [
    {
      id: "REQ-001",
      type: "technical",
      title: "Internet Speed Issue",
      description: "Internet speed is slower than expected. Getting only 50 Mbps instead of 100 Mbps.",
      priority: "high",
      status: "in-progress",
      createdAt: "2024-01-20T10:30:00Z",
      updatedAt: "2024-01-21T14:15:00Z",
      assignedTo: "Tech Team",
      category: "Network Issue",
    },
    {
      id: "REQ-002",
      type: "billing",
      title: "Billing Inquiry",
      description: "Need clarification on additional charges in last month's bill.",
      priority: "medium",
      status: "resolved",
      createdAt: "2024-01-18T09:00:00Z",
      updatedAt: "2024-01-19T16:30:00Z",
      assignedTo: "Billing Team",
      category: "Billing",
    },
    {
      id: "REQ-003",
      type: "service",
      title: "Plan Upgrade Request",
      description: "Want to upgrade from 100 Mbps to 200 Mbps plan.",
      priority: "low",
      status: "pending",
      createdAt: "2024-01-15T11:45:00Z",
      updatedAt: "2024-01-15T11:45:00Z",
      assignedTo: "Sales Team",
      category: "Plan Change",
    },
  ]

  const [newRequest, setNewRequest] = useState({
    type: "",
    title: "",
    description: "",
    priority: "medium",
    category: "",
  })

  const requestTypes = [
    { value: "technical", label: "Technical Support", icon: Wrench },
    { value: "billing", label: "Billing Inquiry", icon: CreditCard },
    { value: "service", label: "Service Request", icon: Settings },
    { value: "general", label: "General Inquiry", icon: MessageSquare },
  ]

  const categories = {
    technical: ["Network Issue", "Equipment Problem", "Speed Issue", "Connection Problem"],
    billing: ["Billing", "Payment Issue", "Refund Request", "Plan Inquiry"],
    service: ["Plan Change", "New Connection", "Disconnection", "Relocation"],
    general: ["Feedback", "Complaint", "Information", "Other"],
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
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
      case "pending":
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

  const getTypeIcon = (type: string) => {
    const typeConfig = requestTypes.find((t) => t.value === type)
    if (typeConfig) {
      const Icon = typeConfig.icon
      return <Icon className="h-4 w-4" />
    }
    return <FileText className="h-4 w-4" />
  }

  const handleCreateRequest = async () => {
    if (!newRequest.type || !newRequest.title || !newRequest.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      // Use the complaint API to create a new request
      await complaintApi.rise(user?.user_id || "", {
        title: newRequest.title,
        description: newRequest.description,
        priority: newRequest.priority,
        category: newRequest.category,
        type: newRequest.type,
      })

      toast({
        title: "Request Created",
        description: "Your service request has been submitted successfully.",
      })

      setIsCreateDialogOpen(false)
      setNewRequest({
        type: "",
        title: "",
        description: "",
        priority: "medium",
        category: "",
      })

      // Refresh requests list
      // fetchRequests()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create request. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredRequests = serviceRequests.filter((request) => {
    const matchesSearch =
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || request.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <DashboardLayout title="Service Requests" description="Manage your service requests and support tickets">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Service Requests</h2>
            <p className="text-gray-600">Submit and track your service requests</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Service Request</DialogTitle>
                <DialogDescription>Fill out the form below to submit a new service request</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="request-type">Request Type *</Label>
                    <Select
                      value={newRequest.type}
                      onValueChange={(value) => setNewRequest({ ...newRequest, type: value, category: "" })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select request type" />
                      </SelectTrigger>
                      <SelectContent>
                        {requestTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center space-x-2">
                              <type.icon className="h-4 w-4" />
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={newRequest.category}
                      onValueChange={(value) => setNewRequest({ ...newRequest, category: value })}
                      disabled={!newRequest.type}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {newRequest.type &&
                          categories[newRequest.type as keyof typeof categories]?.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={newRequest.title}
                    onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                    placeholder="Brief description of your request"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={newRequest.description}
                    onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                    placeholder="Provide detailed information about your request"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newRequest.priority}
                    onValueChange={(value) => setNewRequest({ ...newRequest, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateRequest}>Create Request</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All Requests</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search requests..."
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
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Requests List */}
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <Card key={request.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getTypeIcon(request.type)}
                          <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                          <Badge className={getPriorityColor(request.priority)}>
                            {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{request.description}</p>
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <span>ID: {request.id}</span>
                          <span>Category: {request.category}</span>
                          <span>Assigned to: {request.assignedTo}</span>
                          <span>Created: {formatDate(request.createdAt)}</span>
                          <span>Updated: {formatDate(request.updatedAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(request.status)}
                          <Badge className={getStatusColor(request.status)}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </Badge>
                        </div>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Chat
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredRequests.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || filterStatus !== "all"
                      ? "No requests match your current filters."
                      : "You haven't submitted any service requests yet."}
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Request
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Other tab contents would filter by status */}
          <TabsContent value="pending">
            <div className="space-y-4">
              {serviceRequests
                .filter((r) => r.status === "pending")
                .map((request) => (
                  <Card key={request.id} className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      {/* Same content structure as above */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getTypeIcon(request.type)}
                            <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                            <Badge className={getPriorityColor(request.priority)}>
                              {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{request.description}</p>
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <span>ID: {request.id}</span>
                            <span>Category: {request.category}</span>
                            <span>Created: {formatDate(request.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge className={getStatusColor(request.status)}>Pending</Badge>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          {/* Similar structure for other status tabs */}
          <TabsContent value="in-progress">
            <div className="space-y-4">
              {serviceRequests
                .filter((r) => r.status === "in-progress")
                .map((request) => (
                  <Card key={request.id} className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getTypeIcon(request.type)}
                            <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                            <Badge className={getPriorityColor(request.priority)}>
                              {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{request.description}</p>
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <span>ID: {request.id}</span>
                            <span>Assigned to: {request.assignedTo}</span>
                            <span>Updated: {formatDate(request.updatedAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge className={getStatusColor(request.status)}>In Progress</Badge>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Chat
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="resolved">
            <div className="space-y-4">
              {serviceRequests
                .filter((r) => r.status === "resolved")
                .map((request) => (
                  <Card key={request.id} className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getTypeIcon(request.type)}
                            <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                            <Badge className="bg-green-100 text-green-800">Resolved</Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{request.description}</p>
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <span>ID: {request.id}</span>
                            <span>Resolved: {formatDate(request.updatedAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="closed">
            <div className="space-y-4">
              {serviceRequests
                .filter((r) => r.status === "closed")
                .map((request) => (
                  <Card key={request.id} className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getTypeIcon(request.type)}
                            <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                            <Badge className="bg-gray-100 text-gray-800">Closed</Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{request.description}</p>
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <span>ID: {request.id}</span>
                            <span>Closed: {formatDate(request.updatedAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
