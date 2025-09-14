"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Plus,
  Search,
  Eye,
  Phone,
  Mail,
  CalendarIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  MessageSquare,
  Bell,
  Target,
} from "lucide-react"
import { formatDate, cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

export default function StaffFollowupsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [followups, setFollowups] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [selectedFollowup, setSelectedFollowup] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)

  // Mock data - replace with actual API calls
  const followupData = [
    {
      id: "FUP-001",
      customerId: "CUST-001",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      customerPhone: "+91 9876543210",
      type: "payment_reminder",
      title: "Payment Overdue Follow-up",
      description: "Customer has overdue payment of ₹1,999 for January 2024. Need to follow up for payment.",
      priority: "high",
      status: "pending",
      scheduledDate: "2024-01-25T10:00:00Z",
      dueDate: "2024-01-25T18:00:00Z",
      assignedTo: user?.user_id,
      assignedStaff: user?.profileDetail?.name || "Current User",
      createdAt: "2024-01-20T10:30:00Z",
      updatedAt: "2024-01-21T14:15:00Z",
      lastContact: "2024-01-20T15:30:00Z",
      contactMethod: "phone",
      notes: [
        {
          id: "NOTE-001",
          author: "Staff Member",
          message: "Called customer, no response. Will try again tomorrow.",
          timestamp: "2024-01-20T15:30:00Z",
        },
      ],
    },
    {
      id: "FUP-002",
      customerId: "CUST-002",
      customerName: "Jane Smith",
      customerEmail: "jane@example.com",
      customerPhone: "+91 9876543211",
      type: "service_check",
      title: "Service Quality Check",
      description: "Follow up on recent service installation to ensure customer satisfaction.",
      priority: "medium",
      status: "in-progress",
      scheduledDate: "2024-01-24T14:00:00Z",
      dueDate: "2024-01-26T18:00:00Z",
      assignedTo: user?.user_id,
      assignedStaff: user?.profileDetail?.name || "Current User",
      createdAt: "2024-01-18T09:00:00Z",
      updatedAt: "2024-01-22T16:30:00Z",
      lastContact: "2024-01-22T16:30:00Z",
      contactMethod: "email",
      notes: [],
    },
    {
      id: "FUP-003",
      customerId: "CUST-003",
      customerName: "Mike Johnson",
      customerEmail: "mike@example.com",
      customerPhone: "+91 9876543212",
      type: "complaint_resolution",
      title: "Complaint Resolution Follow-up",
      description: "Follow up on resolved internet speed complaint to ensure issue is fully resolved.",
      priority: "low",
      status: "completed",
      scheduledDate: "2024-01-22T11:00:00Z",
      dueDate: "2024-01-24T18:00:00Z",
      assignedTo: "STAFF-002",
      assignedStaff: "Support Team",
      createdAt: "2024-01-15T11:45:00Z",
      updatedAt: "2024-01-22T12:30:00Z",
      lastContact: "2024-01-22T12:30:00Z",
      contactMethod: "phone",
      notes: [],
    },
  ]

  const [newFollowup, setNewFollowup] = useState({
    customerId: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    type: "",
    title: "",
    description: "",
    priority: "medium",
    scheduledDate: null,
    dueDate: null,
  })

  const followupTypes = [
    { value: "payment_reminder", label: "Payment Reminder", icon: Target },
    { value: "service_check", label: "Service Check", icon: CheckCircle },
    { value: "complaint_resolution", label: "Complaint Resolution", icon: MessageSquare },
    { value: "renewal_reminder", label: "Renewal Reminder", icon: Bell },
    { value: "feedback_collection", label: "Feedback Collection", icon: User },
    { value: "general", label: "General Follow-up", icon: Phone },
  ]

  useEffect(() => {
    // Simulate loading followups
    setTimeout(() => {
      setFollowups(followupData)
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "in-progress":
        return <AlertCircle className="h-4 w-4 text-blue-600" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-600" />
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
      case "completed":
        return "bg-green-100 text-green-800"
      case "overdue":
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

  const getTypeIcon = (type: string) => {
    const typeConfig = followupTypes.find((t) => t.value === type)
    if (typeConfig) {
      const Icon = typeConfig.icon
      return <Icon className="h-4 w-4" />
    }
    return <Phone className="h-4 w-4" />
  }

  const handleStatusChange = async (followupId: string, newStatus: string) => {
    try {
      // Update local state
      setFollowups((prev) =>
        prev.map((followup) =>
          followup.id === followupId
            ? { ...followup, status: newStatus, updatedAt: new Date().toISOString() }
            : followup,
        ),
      )

      toast({
        title: "Status Updated",
        description: `Follow-up status has been updated to ${newStatus}.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update follow-up status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCreateFollowup = async () => {
    if (!newFollowup.customerName || !newFollowup.title || !newFollowup.type) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      const followup = {
        id: `FUP-${Date.now()}`,
        ...newFollowup,
        status: "pending",
        assignedTo: user?.user_id,
        assignedStaff: user?.profileDetail?.name || "Current User",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: [],
      }

      setFollowups((prev) => [followup, ...prev])
      setIsCreateDialogOpen(false)
      setNewFollowup({
        customerId: "",
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        type: "",
        title: "",
        description: "",
        priority: "medium",
        scheduledDate: null,
        dueDate: null,
      })

      toast({
        title: "Follow-up Created",
        description: "New follow-up has been created successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create follow-up. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredFollowups = followupData.filter((followup) => {
    const matchesSearch =
      followup.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      followup.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      followup.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || followup.status === filterStatus
    const matchesType = filterType === "all" || followup.type === filterType
    return matchesSearch && matchesStatus && matchesType
  })

  const followupStats = {
    total: followupData.length,
    pending: followupData.filter((f) => f.status === "pending").length,
    inProgress: followupData.filter((f) => f.status === "in-progress").length,
    completed: followupData.filter((f) => f.status === "completed").length,
    overdue: followupData.filter((f) => new Date(f.dueDate) < new Date() && f.status !== "completed").length,
    myFollowups: followupData.filter((f) => f.assignedTo === user?.user_id).length,
  }

  return (
    <DashboardLayout title="Follow-ups Management" description="Manage customer follow-ups and reminders">
      <div className="space-y-6">
        {/* Follow-up Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{followupStats.total}</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{followupStats.pending}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{followupStats.inProgress}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{followupStats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-gray-900">{followupStats.overdue}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">My Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{followupStats.myFollowups}</p>
                </div>
                <User className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Follow-ups</h2>
            <p className="text-gray-600">Manage customer follow-ups and reminders</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Follow-up
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Follow-up</DialogTitle>
                <DialogDescription>Schedule a new customer follow-up task</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer-name">Customer Name *</Label>
                    <Input
                      id="customer-name"
                      value={newFollowup.customerName}
                      onChange={(e) => setNewFollowup({ ...newFollowup, customerName: e.target.value })}
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer-email">Customer Email</Label>
                    <Input
                      id="customer-email"
                      type="email"
                      value={newFollowup.customerEmail}
                      onChange={(e) => setNewFollowup({ ...newFollowup, customerEmail: e.target.value })}
                      placeholder="Enter customer email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer-phone">Customer Phone</Label>
                    <Input
                      id="customer-phone"
                      value={newFollowup.customerPhone}
                      onChange={(e) => setNewFollowup({ ...newFollowup, customerPhone: e.target.value })}
                      placeholder="Enter customer phone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="followup-type">Follow-up Type *</Label>
                    <Select
                      value={newFollowup.type}
                      onValueChange={(value) => setNewFollowup({ ...newFollowup, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select follow-up type" />
                      </SelectTrigger>
                      <SelectContent>
                        {followupTypes.map((type) => (
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={newFollowup.title}
                    onChange={(e) => setNewFollowup({ ...newFollowup, title: e.target.value })}
                    placeholder="Brief description of the follow-up"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newFollowup.description}
                    onChange={(e) => setNewFollowup({ ...newFollowup, description: e.target.value })}
                    placeholder="Detailed information about the follow-up"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newFollowup.priority}
                      onValueChange={(value) => setNewFollowup({ ...newFollowup, priority: value })}
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
                  <div className="space-y-2">
                    <Label>Scheduled Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !newFollowup.scheduledDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newFollowup.scheduledDate
                            ? format(new Date(newFollowup.scheduledDate), "PPP")
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newFollowup.scheduledDate ? new Date(newFollowup.scheduledDate) : undefined}
                          onSelect={(date) =>
                            setNewFollowup({ ...newFollowup, scheduledDate: date?.toISOString() || null })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !newFollowup.dueDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newFollowup.dueDate ? format(new Date(newFollowup.dueDate), "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newFollowup.dueDate ? new Date(newFollowup.dueDate) : undefined}
                          onSelect={(date) => setNewFollowup({ ...newFollowup, dueDate: date?.toISOString() || null })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateFollowup}>Create Follow-up</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search follow-ups..."
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
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {followupTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Follow-ups List */}
            <div className="space-y-4">
              {filteredFollowups.map((followup) => (
                <Card key={followup.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getTypeIcon(followup.type)}
                          <h3 className="text-lg font-semibold text-gray-900">{followup.title}</h3>
                          <Badge className={getPriorityColor(followup.priority)}>
                            {followup.priority.charAt(0).toUpperCase() + followup.priority.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{followup.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <User className="h-3 w-3" />
                              <span>{followup.customerName}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Mail className="h-3 w-3" />
                              <span>{followup.customerEmail}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-3 w-3" />
                              <span>{followup.customerPhone}</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <CalendarIcon className="h-3 w-3" />
                              <span>Scheduled: {formatDate(followup.scheduledDate)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-3 w-3" />
                              <span>Due: {formatDate(followup.dueDate)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <User className="h-3 w-3" />
                              <span>Assigned: {followup.assignedStaff}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(followup.status)}
                          <Badge className={getStatusColor(followup.status)}>
                            {followup.status.charAt(0).toUpperCase() + followup.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedFollowup(followup)
                              setIsViewDialogOpen(true)
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Select onValueChange={(value) => handleStatusChange(followup.id, value)}>
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue placeholder="Update" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredFollowups.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No follow-ups found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || filterStatus !== "all" || filterType !== "all"
                      ? "No follow-ups match your current filters."
                      : "You haven't created any follow-ups yet."}
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Follow-up
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Other tab contents would filter by status */}
          <TabsContent value="pending">
            <div className="space-y-4">
              {followupData
                .filter((f) => f.status === "pending")
                .map((followup) => (
                  <Card key={followup.id} className="border-l-4 border-l-yellow-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getTypeIcon(followup.type)}
                            <h3 className="font-semibold text-gray-900">{followup.title}</h3>
                            <Badge className={getPriorityColor(followup.priority)}>
                              {followup.priority.charAt(0).toUpperCase() + followup.priority.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-2">{followup.customerName}</p>
                          <p className="text-sm text-gray-500">Due: {formatDate(followup.dueDate)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" onClick={() => handleStatusChange(followup.id, "in-progress")}>
                            Start
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedFollowup(followup)
                              setIsViewDialogOpen(true)
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="overdue">
            <div className="space-y-4">
              {followupData
                .filter((f) => new Date(f.dueDate) < new Date() && f.status !== "completed")
                .map((followup) => (
                  <Card key={followup.id} className="border-l-4 border-l-red-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getTypeIcon(followup.type)}
                            <h3 className="font-semibold text-gray-900">{followup.title}</h3>
                            <Badge className="bg-red-100 text-red-800">Overdue</Badge>
                          </div>
                          <p className="text-gray-600 mb-2">{followup.customerName}</p>
                          <p className="text-sm text-red-600">Due: {formatDate(followup.dueDate)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="destructive">
                            Urgent
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedFollowup(followup)
                              setIsViewDialogOpen(true)
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="my-tasks">
            <div className="space-y-4">
              {followupData
                .filter((f) => f.assignedTo === user?.user_id)
                .map((followup) => (
                  <Card key={followup.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getTypeIcon(followup.type)}
                            <h3 className="font-semibold text-gray-900">{followup.title}</h3>
                            <Badge className={getStatusColor(followup.status)}>
                              {followup.status.charAt(0).toUpperCase() + followup.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-2">{followup.customerName}</p>
                          <p className="text-sm text-gray-500">Due: {formatDate(followup.dueDate)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedFollowup(followup)
                              setIsViewDialogOpen(true)
                            }}
                          >
                            Work On It
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Follow-up Detail Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Follow-up Details - {selectedFollowup?.id}</DialogTitle>
              <DialogDescription>View and manage customer follow-up task</DialogDescription>
            </DialogHeader>
            {selectedFollowup && (
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
                        <span className="font-medium">{selectedFollowup.customerName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{selectedFollowup.customerEmail}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{selectedFollowup.customerPhone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-4 w-4 text-gray-500" />
                        <span>
                          Last Contact:{" "}
                          {selectedFollowup.lastContact ? formatDate(selectedFollowup.lastContact) : "Never"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Follow-up Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Follow-up Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Title</Label>
                      <p className="text-gray-900">{selectedFollowup.title}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-gray-700">{selectedFollowup.description}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Type</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          {getTypeIcon(selectedFollowup.type)}
                          <span className="capitalize">{selectedFollowup.type.replace("_", " ")}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Priority</Label>
                        <Badge className={`${getPriorityColor(selectedFollowup.priority)} mt-1`}>
                          {selectedFollowup.priority.charAt(0).toUpperCase() + selectedFollowup.priority.slice(1)}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <Badge className={`${getStatusColor(selectedFollowup.status)} mt-1`}>
                          {selectedFollowup.status.charAt(0).toUpperCase() + selectedFollowup.status.slice(1)}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Due Date</Label>
                        <p className="text-gray-900 mt-1">{formatDate(selectedFollowup.dueDate)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notes & Updates</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedFollowup.notes && selectedFollowup.notes.length > 0 ? (
                      selectedFollowup.notes.map((note) => (
                        <div key={note.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{note.author}</span>
                            <span className="text-sm text-gray-500">{formatDate(note.timestamp)}</span>
                          </div>
                          <p className="text-gray-700">{note.message}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No notes yet</p>
                    )}
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                    Close
                  </Button>
                  <Button variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Customer
                  </Button>
                  <Button variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                  <Button onClick={() => handleStatusChange(selectedFollowup.id, "completed")}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Complete
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
