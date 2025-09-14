"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bell,
  Search,
  Calendar,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  Info,
  MessageSquare,
  Settings,
  Archive,
  Trash2,
  BookMarkedIcon as MarkAsUnread,
  Filter,
} from "lucide-react"

// Mock notifications data
const mockNotifications = [
  {
    id: "NOTIF-001",
    type: "task_assigned",
    title: "New Task Assigned",
    message: "You have been assigned a new fiber installation task at House 123, Sector 15",
    priority: "high",
    status: "unread",
    timestamp: "2024-01-20T09:00:00Z",
    sender: "Task Management System",
    actionRequired: true,
    relatedId: "TASK-001",
  },
  {
    id: "NOTIF-002",
    type: "schedule_reminder",
    title: "Task Reminder",
    message: "Reminder: Router replacement scheduled for 2:00 PM today at Flat 45, Sector 22",
    priority: "medium",
    status: "unread",
    timestamp: "2024-01-20T13:30:00Z",
    sender: "Schedule Manager",
    actionRequired: false,
    relatedId: "TASK-002",
  },
  {
    id: "NOTIF-003",
    type: "inventory_alert",
    title: "Low Inventory Alert",
    message: "ONT Devices are running low in your inventory (3 remaining, minimum 5 required)",
    priority: "medium",
    status: "read",
    timestamp: "2024-01-20T08:15:00Z",
    sender: "Inventory System",
    actionRequired: true,
    relatedId: "INV-002",
  },
  {
    id: "NOTIF-004",
    type: "customer_message",
    title: "Customer Message",
    message: "Rajesh Kumar sent a message: 'When will the technician arrive for installation?'",
    priority: "high",
    status: "unread",
    timestamp: "2024-01-20T10:45:00Z",
    sender: "Customer Portal",
    actionRequired: true,
    relatedId: "CUST-001",
  },
  {
    id: "NOTIF-005",
    type: "system_update",
    title: "System Maintenance",
    message: "Scheduled system maintenance will occur tonight from 11 PM to 2 AM",
    priority: "low",
    status: "read",
    timestamp: "2024-01-19T16:00:00Z",
    sender: "System Administrator",
    actionRequired: false,
    relatedId: null,
  },
  {
    id: "NOTIF-006",
    type: "task_completed",
    title: "Task Completion Confirmed",
    message: "Your fiber installation at Tech Solutions Pvt Ltd has been marked as completed",
    priority: "low",
    status: "read",
    timestamp: "2024-01-19T14:30:00Z",
    sender: "Task Management System",
    actionRequired: false,
    relatedId: "TASK-004",
  },
  {
    id: "NOTIF-007",
    type: "emergency_alert",
    title: "Emergency Service Request",
    message: "Urgent: Complete network outage reported in Sector 35. Immediate attention required.",
    priority: "critical",
    status: "unread",
    timestamp: "2024-01-20T11:15:00Z",
    sender: "Emergency Response",
    actionRequired: true,
    relatedId: "EMRG-001",
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.sender.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === "all" || notification.type === typeFilter
    const matchesPriority = priorityFilter === "all" || notification.priority === priorityFilter
    const matchesStatus = statusFilter === "all" || notification.status === statusFilter

    return matchesSearch && matchesType && matchesPriority && matchesStatus
  })

  const getNotificationsByStatus = (status: string) => {
    return filteredNotifications.filter((notification) => notification.status === status)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "task_assigned":
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      case "schedule_reminder":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "inventory_alert":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case "customer_message":
        return <MessageSquare className="h-4 w-4 text-green-600" />
      case "system_update":
        return <Settings className="h-4 w-4 text-gray-600" />
      case "emergency_alert":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "task_assigned":
        return "Task Assigned"
      case "schedule_reminder":
        return "Schedule Reminder"
      case "inventory_alert":
        return "Inventory Alert"
      case "customer_message":
        return "Customer Message"
      case "system_update":
        return "System Update"
      case "task_completed":
        return "Task Completed"
      case "emergency_alert":
        return "Emergency Alert"
      default:
        return type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
    }
  }

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === notificationId ? { ...notification, status: "read" } : notification,
      ),
    )
  }

  const handleMarkAsUnread = (notificationId: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === notificationId ? { ...notification, status: "unread" } : notification,
      ),
    )
  }

  const handleArchive = (notificationId: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === notificationId ? { ...notification, status: "archived" } : notification,
      ),
    )
  }

  const handleDelete = (notificationId: string) => {
    setNotifications(notifications.filter((notification) => notification.id !== notificationId))
  }

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, status: "read" })))
  }

  const notificationStats = {
    total: notifications.length,
    unread: notifications.filter((n) => n.status === "unread").length,
    read: notifications.filter((n) => n.status === "read").length,
    archived: notifications.filter((n) => n.status === "archived").length,
    actionRequired: notifications.filter((n) => n.actionRequired && n.status === "unread").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500">Stay updated with your work notifications and alerts</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleMarkAllAsRead} variant="outline">
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Total</CardTitle>
            <Bell className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{notificationStats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Unread</CardTitle>
            <MarkAsUnread className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{notificationStats.unread}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Read</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{notificationStats.read}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Archived</CardTitle>
            <Archive className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{notificationStats.archived}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Action Required</CardTitle>
            <AlertTriangle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{notificationStats.actionRequired}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Notification Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="task_assigned">Task Assigned</SelectItem>
                <SelectItem value="schedule_reminder">Schedule Reminder</SelectItem>
                <SelectItem value="inventory_alert">Inventory Alert</SelectItem>
                <SelectItem value="customer_message">Customer Message</SelectItem>
                <SelectItem value="system_update">System Update</SelectItem>
                <SelectItem value="emergency_alert">Emergency Alert</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Tabs */}
      <Tabs defaultValue="unread" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="unread">Unread ({notificationStats.unread})</TabsTrigger>
          <TabsTrigger value="read">Read ({notificationStats.read})</TabsTrigger>
          <TabsTrigger value="archived">Archived ({notificationStats.archived})</TabsTrigger>
          <TabsTrigger value="all">All ({notificationStats.total})</TabsTrigger>
        </TabsList>

        <TabsContent value="unread" className="space-y-4">
          <NotificationList
            notifications={getNotificationsByStatus("unread")}
            onMarkAsRead={handleMarkAsRead}
            onMarkAsUnread={handleMarkAsUnread}
            onArchive={handleArchive}
            onDelete={handleDelete}
            getPriorityColor={getPriorityColor}
            getTypeIcon={getTypeIcon}
            getTypeLabel={getTypeLabel}
          />
        </TabsContent>

        <TabsContent value="read" className="space-y-4">
          <NotificationList
            notifications={getNotificationsByStatus("read")}
            onMarkAsRead={handleMarkAsRead}
            onMarkAsUnread={handleMarkAsUnread}
            onArchive={handleArchive}
            onDelete={handleDelete}
            getPriorityColor={getPriorityColor}
            getTypeIcon={getTypeIcon}
            getTypeLabel={getTypeLabel}
          />
        </TabsContent>

        <TabsContent value="archived" className="space-y-4">
          <NotificationList
            notifications={getNotificationsByStatus("archived")}
            onMarkAsRead={handleMarkAsRead}
            onMarkAsUnread={handleMarkAsUnread}
            onArchive={handleArchive}
            onDelete={handleDelete}
            getPriorityColor={getPriorityColor}
            getTypeIcon={getTypeIcon}
            getTypeLabel={getTypeLabel}
          />
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <NotificationList
            notifications={filteredNotifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAsUnread={handleMarkAsUnread}
            onArchive={handleArchive}
            onDelete={handleDelete}
            getPriorityColor={getPriorityColor}
            getTypeIcon={getTypeIcon}
            getTypeLabel={getTypeLabel}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Notification List Component
function NotificationList({
  notifications,
  onMarkAsRead,
  onMarkAsUnread,
  onArchive,
  onDelete,
  getPriorityColor,
  getTypeIcon,
  getTypeLabel,
}: any) {
  return (
    <div className="space-y-4">
      {notifications.map((notification: any) => (
        <Card
          key={notification.id}
          className={`hover:shadow-md transition-all duration-300 ${
            notification.status === "unread" ? "border-l-4 border-l-orange-500 bg-orange-50/30" : ""
          }`}
        >
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">{getTypeIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3
                        className={`font-medium ${notification.status === "unread" ? "text-gray-900" : "text-gray-700"}`}
                      >
                        {notification.title}
                      </h3>
                      <Badge className={getPriorityColor(notification.priority)}>{notification.priority}</Badge>
                      <Badge variant="outline" className="text-xs">
                        {getTypeLabel(notification.type)}
                      </Badge>
                      {notification.actionRequired && (
                        <Badge className="bg-red-100 text-red-800 text-xs">Action Required</Badge>
                      )}
                    </div>
                    <p
                      className={`text-sm mb-3 ${notification.status === "unread" ? "text-gray-900" : "text-gray-600"}`}
                    >
                      {notification.message}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{notification.sender}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(notification.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-2 lg:ml-4">
                <div className="flex flex-wrap gap-2">
                  {notification.status === "unread" ? (
                    <Button size="sm" variant="outline" onClick={() => onMarkAsRead(notification.id)}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark Read
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => onMarkAsUnread(notification.id)}>
                      <MarkAsUnread className="h-4 w-4 mr-1" />
                      Mark Unread
                    </Button>
                  )}

                  {notification.status !== "archived" && (
                    <Button size="sm" variant="outline" onClick={() => onArchive(notification.id)}>
                      <Archive className="h-4 w-4 mr-1" />
                      Archive
                    </Button>
                  )}

                  <Button size="sm" variant="outline" onClick={() => onDelete(notification.id)}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {notifications.length === 0 && (
        <div className="text-center text-gray-500 py-8">No notifications found matching the current filters.</div>
      )}
    </div>
  )
}
