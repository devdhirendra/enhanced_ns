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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Bell,
  MessageSquare,
  Mail,
  Smartphone,
  Send,
  Eye,
  Edit,
  Trash2,
  Download,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Search,
} from "lucide-react"
import { formatDate, getStatusColor, exportToCSV } from "@/lib/utils"

// Demo data for notifications
const notifications = [
  {
    id: "NOT001",
    title: "Payment Reminder",
    message:
      "Your monthly subscription payment is due in 3 days. Please make the payment to avoid service interruption.",
    type: "payment",
    channel: "sms",
    recipients: ["City Networks", "Metro Fiber"],
    status: "sent",
    sentDate: "2024-01-20",
    deliveryRate: 95,
    openRate: 78,
    clickRate: 12,
  },
  {
    id: "NOT002",
    title: "System Maintenance",
    message:
      "Scheduled maintenance will be performed on January 25th from 2:00 AM to 4:00 AM. Services may be temporarily unavailable.",
    type: "system",
    channel: "email",
    recipients: ["All Operators"],
    status: "scheduled",
    sentDate: "2024-01-22",
    deliveryRate: 0,
    openRate: 0,
    clickRate: 0,
  },
]

interface NotificationService {
  enabled: boolean
  provider: string
  apiKey: string
  dailyLimit: number
  usedToday: number
}

interface NotificationSettings {
  sms: NotificationService & {
    senderId: string
  }
  email: NotificationService & {
    fromEmail: string
    fromName: string
  }
  whatsapp: NotificationService & {
    phoneNumber: string
  }
  push: NotificationService & {
    serverKey: string
  }
}

const initialNotificationSettings: NotificationSettings = {
  sms: {
    enabled: true,
    provider: "Twilio",
    apiKey: "sk_test_***************",
    senderId: "MYNETWORK",
    dailyLimit: 1000,
    usedToday: 245,
  },
  email: {
    enabled: true,
    provider: "SendGrid",
    apiKey: "SG.***************",
    fromEmail: "noreply@mynetwork.com",
    fromName: "MY NETWORK SOLUTIONS",
    dailyLimit: 5000,
    usedToday: 1234,
  },
  whatsapp: {
    enabled: false,
    provider: "WhatsApp Business API",
    apiKey: "",
    phoneNumber: "",
    dailyLimit: 500,
    usedToday: 0,
  },
  push: {
    enabled: true,
    provider: "Firebase",
    apiKey: "AAAA***************", // Changed serverKey to apiKey for consistency
    serverKey: "AAAA***************",
    dailyLimit: 10000,
    usedToday: 567,
  },
}

export default function NotificationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [channelFilter, setChannelFilter] = useState("all")
  const [showSendNotificationDialog, setShowSendNotificationDialog] = useState(false)
  const [showCreateTemplateDialog, setShowCreateTemplateDialog] = useState(false)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(initialNotificationSettings)

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || notification.type === typeFilter
    const matchesChannel = channelFilter === "all" || notification.channel === channelFilter
    return matchesSearch && matchesType && matchesChannel
  })

  const handleExport = () => {
    const exportData = notifications.map((notification) => ({
      ID: notification.id,
      Title: notification.title,
      Type: notification.type,
      Channel: notification.channel,
      Recipients: notification.recipients.join(", "),
      Status: notification.status,
      "Sent Date": notification.sentDate,
      "Delivery Rate": notification.deliveryRate + "%",
      "Open Rate": notification.openRate + "%",
    }))
    exportToCSV(exportData, "notifications")
  }

  const updateNotificationSetting = (service: keyof NotificationSettings, field: string, value: any) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [service]: {
        ...prev[service],
        [field]: value,
      },
    }))
  }

  const totalNotifications = notifications.length
  const sentNotifications = notifications.filter((n) => n.status === "sent").length
  const scheduledNotifications = notifications.filter((n) => n.status === "scheduled").length
  const failedNotifications = notifications.filter((n) => n.status === "failed").length
  const avgDeliveryRate = notifications.reduce((sum, n) => sum + n.deliveryRate, 0) / notifications.length

  return (
    <DashboardLayout title="Notifications & Announcements" description="Manage operator communications and alerts">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Sent</CardTitle>
              <div className="p-2 bg-blue-500 rounded-lg">
                <Send className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{sentNotifications}</div>
              <p className="text-sm text-gray-500 mt-2">This month</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Scheduled</CardTitle>
              <div className="p-2 bg-yellow-500 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{scheduledNotifications}</div>
              <p className="text-sm text-gray-500 mt-2">Pending delivery</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Failed</CardTitle>
              <div className="p-2 bg-red-500 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{failedNotifications}</div>
              <p className="text-sm text-red-600 mt-2 font-medium">Needs attention</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Delivery Rate</CardTitle>
              <div className="p-2 bg-green-500 rounded-lg">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{avgDeliveryRate.toFixed(1)}%</div>
              <p className="text-sm text-gray-500 mt-2">Average success rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="notifications" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="grid w-full max-w-lg grid-cols-2 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="notifications" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Notifications
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Settings
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Dialog open={showSendNotificationDialog} onOpenChange={setShowSendNotificationDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Send className="h-4 w-4 mr-2" />
                    Send Notification
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Send New Notification</DialogTitle>
                    <DialogDescription>Send a notification to operators</DialogDescription>
                  </DialogHeader>
                  <SendNotificationForm onClose={() => setShowSendNotificationDialog(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <TabsContent value="notifications" className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                </SelectContent>
              </Select>
              <Select value={channelFilter} onValueChange={setChannelFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="push">Push Notification</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notifications Table */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Notification History ({filteredNotifications.length})
                </CardTitle>
                <CardDescription>All sent and scheduled notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Notification Details</TableHead>
                        <TableHead>Type & Channel</TableHead>
                        <TableHead>Recipients</TableHead>
                        <TableHead>Performance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredNotifications.map((notification) => (
                        <TableRow key={notification.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{notification.title}</div>
                              <div className="text-sm text-gray-500 line-clamp-2">{notification.message}</div>
                              <div className="text-xs text-gray-400 mt-1">ID: {notification.id}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <Badge variant="outline" className="capitalize">
                                {notification.type}
                              </Badge>
                              <div className="flex items-center text-sm text-gray-600">
                                {notification.channel === "sms" && <Smartphone className="h-3 w-3 mr-1" />}
                                {notification.channel === "email" && <Mail className="h-3 w-3 mr-1" />}
                                {notification.channel === "whatsapp" && <MessageSquare className="h-3 w-3 mr-1" />}
                                {notification.channel === "push" && <Bell className="h-3 w-3 mr-1" />}
                                {notification.channel}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {notification.recipients.map((recipient, index) => (
                                <div key={index} className="flex items-center text-sm">
                                  <Building2 className="h-3 w-3 mr-1 text-gray-400" />
                                  {recipient}
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 text-sm">
                              <div>Delivery: {notification.deliveryRate}%</div>
                              <div>Open: {notification.openRate}%</div>
                              <div>Click: {notification.clickRate}%</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <Badge className={getStatusColor(notification.status)}>{notification.status}</Badge>
                              <div className="flex items-center text-xs text-gray-500">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatDate(notification.sentDate)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => console.log("View notification", notification.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => console.log("Edit notification", notification.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => console.log("Delete notification", notification.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SMS Settings */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <Smartphone className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle>SMS Settings</CardTitle>
                        <CardDescription>Configure SMS notifications</CardDescription>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.sms.enabled}
                      onCheckedChange={(checked) => updateNotificationSetting("sms", "enabled", checked)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <Input
                      defaultValue={notificationSettings.sms.provider}
                      onChange={(e) => updateNotificationSetting("sms", "provider", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sender ID</Label>
                    <Input
                      defaultValue={notificationSettings.sms.senderId}
                      onChange={(e) => updateNotificationSetting("sms", "senderId", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <Input
                      type="password"
                      defaultValue={notificationSettings.sms.apiKey}
                      onChange={(e) => updateNotificationSetting("sms", "apiKey", e.target.value)}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Daily Usage:</span>
                    <span>
                      {notificationSettings.sms.usedToday} / {notificationSettings.sms.dailyLimit}
                    </span>
                  </div>
                  <Button size="sm" className="w-full">
                    Update Settings
                  </Button>
                </CardContent>
              </Card>

              {/* Email Settings */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <Mail className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle>Email Settings</CardTitle>
                        <CardDescription>Configure email notifications</CardDescription>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.email.enabled}
                      onCheckedChange={(checked) => updateNotificationSetting("email", "enabled", checked)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <Input
                      defaultValue={notificationSettings.email.provider}
                      onChange={(e) => updateNotificationSetting("email", "provider", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>From Email</Label>
                    <Input
                      defaultValue={notificationSettings.email.fromEmail}
                      onChange={(e) => updateNotificationSetting("email", "fromEmail", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>From Name</Label>
                    <Input
                      defaultValue={notificationSettings.email.fromName}
                      onChange={(e) => updateNotificationSetting("email", "fromName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <Input
                      type="password"
                      defaultValue={notificationSettings.email.apiKey}
                      onChange={(e) => updateNotificationSetting("email", "apiKey", e.target.value)}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Daily Usage:</span>
                    <span>
                      {notificationSettings.email.usedToday} / {notificationSettings.email.dailyLimit}
                    </span>
                  </div>
                  <Button size="sm" className="w-full">
                    Update Settings
                  </Button>
                </CardContent>
              </Card>

              {/* WhatsApp Settings */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-600 rounded-lg">
                        <MessageSquare className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle>WhatsApp Settings</CardTitle>
                        <CardDescription>Configure WhatsApp notifications</CardDescription>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.whatsapp.enabled}
                      onCheckedChange={(checked) => updateNotificationSetting("whatsapp", "enabled", checked)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <Input
                      defaultValue={notificationSettings.whatsapp.provider}
                      onChange={(e) => updateNotificationSetting("whatsapp", "provider", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      defaultValue={notificationSettings.whatsapp.phoneNumber}
                      placeholder="+91 9876543210"
                      onChange={(e) => updateNotificationSetting("whatsapp", "phoneNumber", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <Input
                      type="password"
                      defaultValue={notificationSettings.whatsapp.apiKey}
                      placeholder="Enter API key"
                      onChange={(e) => updateNotificationSetting("whatsapp", "apiKey", e.target.value)}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Daily Usage:</span>
                    <span>
                      {notificationSettings.whatsapp.usedToday} / {notificationSettings.whatsapp.dailyLimit}
                    </span>
                  </div>
                  <Button size="sm" className="w-full">
                    Update Settings
                  </Button>
                </CardContent>
              </Card>

              {/* Push Notification Settings */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <Bell className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle>Push Notifications</CardTitle>
                        <CardDescription>Configure push notifications</CardDescription>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.push.enabled}
                      onCheckedChange={(checked) => updateNotificationSetting("push", "enabled", checked)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <Input
                      defaultValue={notificationSettings.push.provider}
                      onChange={(e) => updateNotificationSetting("push", "provider", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Server Key</Label>
                    <Input
                      type="password"
                      defaultValue={notificationSettings.push.serverKey}
                      onChange={(e) => updateNotificationSetting("push", "serverKey", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <Input
                      type="password"
                      defaultValue={notificationSettings.push.apiKey}
                      onChange={(e) => updateNotificationSetting("push", "apiKey", e.target.value)}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Daily Usage:</span>
                    <span>
                      {notificationSettings.push.usedToday} / {notificationSettings.push.dailyLimit}
                    </span>
                  </div>
                  <Button size="sm" className="w-full">
                    Update Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

interface SendNotificationFormData {
  title: string
  message: string
  type: string
  channel: string
  recipients: string
  scheduleDate: string
  scheduleTime: string
}

// Send Notification Form Component
function SendNotificationForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState<SendNotificationFormData>({
    title: "",
    message: "",
    type: "general",
    channel: "sms",
    recipients: "all",
    scheduleDate: "",
    scheduleTime: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Notification form submitted:", formData)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="type">Type *</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="payment">Payment</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="billing">Billing</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="message">Message *</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          rows={4}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="channel">Channel *</Label>
          <Select value={formData.channel} onValueChange={(value) => setFormData({ ...formData, channel: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="push">Push Notification</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="recipients">Recipients *</Label>
          <Select
            value={formData.recipients}
            onValueChange={(value) => setFormData({ ...formData, recipients: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Operators</SelectItem>
              <SelectItem value="active">Active Operators</SelectItem>
              <SelectItem value="suspended">Suspended Operators</SelectItem>
              <SelectItem value="custom">Custom Selection</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="scheduleDate">Schedule Date (Optional)</Label>
          <Input
            id="scheduleDate"
            type="date"
            value={formData.scheduleDate}
            onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="scheduleTime">Schedule Time (Optional)</Label>
          <Input
            id="scheduleTime"
            type="time"
            value={formData.scheduleTime}
            onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
          />
        </div>
      </div>
      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">{formData.scheduleDate ? "Schedule" : "Send Now"}</Button>
      </div>
    </form>
  )
}
