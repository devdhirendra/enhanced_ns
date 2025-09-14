"use client"
import { useState } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Bell,
  Plus,
  Send,
  MessageSquare,
  Mail,
  Smartphone,
  Settings,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Filter,
  Download,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Sample notification templates
const notificationTemplates = [
  {
    id: "TEMP001",
    name: "Bill Reminder",
    type: "billing",
    channels: ["sms", "whatsapp"],
    subject: "Your internet bill is due",
    content:
      "Dear {customer_name}, your internet bill of ₹{amount} is due on {due_date}. Please pay to avoid service interruption.",
    variables: ["customer_name", "amount", "due_date"],
    status: "active",
    lastUsed: "2024-01-15",
    sentCount: 1245,
  },
  {
    id: "TEMP002",
    name: "Welcome Message",
    type: "onboarding",
    channels: ["sms", "email"],
    subject: "Welcome to our network!",
    content:
      "Welcome {customer_name}! Your connection ID is {connection_id}. Your plan: {plan_name}. For support, call {support_number}.",
    variables: ["customer_name", "connection_id", "plan_name", "support_number"],
    status: "active",
    lastUsed: "2024-01-14",
    sentCount: 89,
  },
  {
    id: "TEMP003",
    name: "Complaint Update",
    type: "support",
    channels: ["sms", "whatsapp", "email"],
    subject: "Complaint Status Update",
    content:
      "Dear {customer_name}, your complaint {complaint_id} has been {status}. Technician: {technician_name}. ETA: {eta}.",
    variables: ["customer_name", "complaint_id", "status", "technician_name", "eta"],
    status: "active",
    lastUsed: "2024-01-15",
    sentCount: 234,
  },
  {
    id: "TEMP004",
    name: "Plan Expiry Alert",
    type: "billing",
    channels: ["sms", "whatsapp"],
    subject: "Plan expiring soon",
    content:
      "Hi {customer_name}, your {plan_name} expires on {expiry_date}. Renew now to continue enjoying uninterrupted service.",
    variables: ["customer_name", "plan_name", "expiry_date"],
    status: "active",
    lastUsed: "2024-01-13",
    sentCount: 567,
  },
]

// Sample notification history
const notificationHistory = [
  {
    id: "NOT001",
    templateId: "TEMP001",
    templateName: "Bill Reminder",
    recipient: "Rajesh Kumar",
    recipientPhone: "+91 9876543210",
    channel: "whatsapp",
    status: "delivered",
    sentAt: "2024-01-15T10:30:00Z",
    deliveredAt: "2024-01-15T10:31:00Z",
    readAt: "2024-01-15T11:15:00Z",
    content: "Dear Rajesh Kumar, your internet bill of ₹699 is due on 31-Jan-2024...",
  },
  {
    id: "NOT002",
    templateId: "TEMP003",
    templateName: "Complaint Update",
    recipient: "Priya Singh",
    recipientPhone: "+91 9876543211",
    channel: "sms",
    status: "delivered",
    sentAt: "2024-01-15T09:45:00Z",
    deliveredAt: "2024-01-15T09:46:00Z",
    readAt: null,
    content: "Dear Priya Singh, your complaint CMP002 has been resolved...",
  },
  {
    id: "NOT003",
    templateId: "TEMP002",
    templateName: "Welcome Message",
    recipient: "Amit Sharma",
    recipientPhone: "+91 9876543212",
    channel: "email",
    status: "failed",
    sentAt: "2024-01-14T16:20:00Z",
    deliveredAt: null,
    readAt: null,
    content: "Welcome Amit Sharma! Your connection ID is CONN1247...",
    error: "Invalid email address",
  },
]

// Notification settings
const notificationSettings = {
  sms: {
    enabled: true,
    provider: "TextLocal",
    apiKey: "TL_****_****",
    senderId: "NETWORK",
    dailyLimit: 1000,
    usedToday: 245,
  },
  whatsapp: {
    enabled: true,
    provider: "WhatsApp Business API",
    phoneNumber: "+91 9876543200",
    dailyLimit: 500,
    usedToday: 89,
  },
  email: {
    enabled: true,
    provider: "SendGrid",
    fromEmail: "noreply@network.com",
    fromName: "Network Solutions",
    dailyLimit: 2000,
    usedToday: 156,
  },
  push: {
    enabled: false,
    provider: "Firebase",
    dailyLimit: 5000,
    usedToday: 0,
  },
}

export default function NotificationsAlerts() {
  const [templates, setTemplates] = useState(notificationTemplates)
  const [history, setHistory] = useState(notificationHistory)
  const [settings, setSettings] = useState(notificationSettings)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false)
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [channelFilter, setChannelFilter] = useState("all")
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    type: "billing",
    channels: [],
    subject: "",
    content: "",
    variables: [],
  })
  const [bulkSend, setBulkSend] = useState({
    templateId: "",
    recipients: "all_customers",
    customRecipients: "",
    scheduleTime: "",
  })
  const { toast } = useToast()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800"
      case "sent":
        return "bg-blue-100 text-blue-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "sms":
        return <Smartphone className="h-4 w-4" />
      case "whatsapp":
        return <MessageSquare className="h-4 w-4 text-green-600" />
      case "email":
        return <Mail className="h-4 w-4" />
      case "push":
        return <Bell className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const handleCreateTemplate = () => {
    const template = {
      id: `TEMP${String(templates.length + 1).padStart(3, "0")}`,
      ...newTemplate,
      status: "active",
      lastUsed: null,
      sentCount: 0,
    }
    setTemplates([...templates, template])
    setNewTemplate({
      name: "",
      type: "billing",
      channels: [],
      subject: "",
      content: "",
      variables: [],
    })
    setIsTemplateDialogOpen(false)
    toast({
      title: "Template Created",
      description: `Template ${template.name} created successfully.`,
    })
  }

  const handleSendBulkNotification = () => {
    toast({
      title: "Bulk Notification Sent",
      description: `Sending bulk notification using template ${bulkSend.templateId}`,
    })
    setIsSendDialogOpen(false)
  }

  const handleChannelToggle = (channel: string) => {
    setNewTemplate((prev) => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel],
    }))
  }

  const extractVariables = (content: string) => {
    const matches = content.match(/\{([^}]+)\}/g)
    return matches ? matches.map((match) => match.slice(1, -1)) : []
  }

  const handleContentChange = (content: string) => {
    const variables = extractVariables(content)
    setNewTemplate((prev) => ({
      ...prev,
      content,
      variables,
    }))
  }

  const filteredHistory = history.filter((notification) => {
    const matchesSearch =
      notification.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.recipientPhone.includes(searchTerm)
    const matchesStatus = statusFilter === "all" || notification.status === statusFilter
    const matchesChannel = channelFilter === "all" || notification.channel === channelFilter
    return matchesSearch && matchesStatus && matchesChannel
  })

  return (
    <DashboardLayout title="Notifications & Alerts" description="Manage customer communications and automated alerts">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications & Alerts</h1>
            <p className="text-gray-600 mt-1">Manage customer communications and automated alerts</p>
          </div>
          <div className="flex space-x-3">
            <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Notification Settings</DialogTitle>
                  <DialogDescription>Configure notification channels and providers</DialogDescription>
                </DialogHeader>
                <NotificationSettingsForm
                  settings={settings}
                  setSettings={setSettings}
                  getChannelIcon={getChannelIcon}
                />
              </DialogContent>
            </Dialog>
            <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Send className="h-4 w-4 mr-2" />
                  Send Bulk
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Bulk Notification</DialogTitle>
                  <DialogDescription>Send notifications to multiple customers at once</DialogDescription>
                </DialogHeader>
                <BulkNotificationForm
                  templates={templates}
                  bulkSend={bulkSend}
                  setBulkSend={setBulkSend}
                  handleSendBulkNotification={handleSendBulkNotification}
                  setIsSendDialogOpen={setIsSendDialogOpen}
                />
              </DialogContent>
            </Dialog>
            <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Notification Template</DialogTitle>
                  <DialogDescription>Create a reusable template for customer notifications</DialogDescription>
                </DialogHeader>
                <TemplateForm
                  newTemplate={newTemplate}
                  setNewTemplate={setNewTemplate}
                  handleCreateTemplate={handleCreateTemplate}
                  handleChannelToggle={handleChannelToggle}
                  handleContentChange={handleContentChange}
                  setIsTemplateDialogOpen={setIsTemplateDialogOpen}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Usage Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Object.entries(settings).map(([channel, config]) => (
            <Card key={channel}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 capitalize">{channel}</p>
                    <p className="text-2xl font-bold">
                      {config.usedToday}/{config.dailyLimit}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {getChannelIcon(channel)}
                    {config.enabled ? (
                      <CheckCircle className="h-4 w-4 text-green-600 ml-2" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 ml-2" />
                    )}
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(config.usedToday / config.dailyLimit) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round((config.usedToday / config.dailyLimit) * 100)}% used today
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="templates" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Templates</CardTitle>
                <CardDescription>Manage reusable templates for different types of notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map((template) => (
                    <Card key={template.id} className="border-2 hover:border-blue-200 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{template.name}</h3>
                            <Badge variant="outline" className="mt-1">
                              {template.type}
                            </Badge>
                          </div>
                          <Badge
                            className={
                              template.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }
                          >
                            {template.status}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Channels:</span>
                            <div className="flex space-x-1 mt-1">
                              {template.channels.map((channel) => (
                                <div key={channel} className="flex items-center space-x-1">
                                  {getChannelIcon(channel)}
                                  <span className="capitalize">{channel}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">Subject:</span>
                            <p className="text-gray-600 mt-1">{template.subject}</p>
                          </div>
                          <div>
                            <span className="font-medium">Content Preview:</span>
                            <p className="text-gray-600 mt-1 line-clamp-2">{template.content}</p>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Sent: {template.sentCount}</span>
                            <span>Last used: {template.lastUsed || "Never"}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedTemplate(template)
                              setIsSendDialogOpen(true)
                              setBulkSend({ ...bulkSend, templateId: template.id })
                            }}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Send
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification History</CardTitle>
                <CardDescription>Track all sent notifications and their delivery status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search by recipient, template, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={channelFilter} onValueChange={setChannelFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by channel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Channels</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="push">Push</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Template</TableHead>
                        <TableHead>Channel</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Sent At</TableHead>
                        <TableHead>Delivered At</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHistory.map((notification) => (
                        <TableRow key={notification.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{notification.recipient}</div>
                              <div className="text-sm text-gray-500">{notification.recipientPhone}</div>
                            </div>
                          </TableCell>
                          <TableCell>{notification.templateName}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getChannelIcon(notification.channel)}
                              <span className="capitalize">{notification.channel}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(notification.status)}>{notification.status}</Badge>
                            {notification.error && <p className="text-xs text-red-600 mt-1">{notification.error}</p>}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{new Date(notification.sentAt).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(notification.sentAt).toLocaleTimeString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            {notification.deliveredAt ? (
                              <div className="text-sm">
                                {new Date(notification.deliveredAt).toLocaleDateString()}
                                <div className="text-xs text-gray-500">
                                  {new Date(notification.deliveredAt).toLocaleTimeString()}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {notification.status === "failed" && (
                                <Button variant="outline" size="sm">
                                  <Send className="h-4 w-4" />
                                </Button>
                              )}
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

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Sent</p>
                      <p className="text-2xl font-bold text-blue-600">2,135</p>
                    </div>
                    <Send className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">This month</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Delivery Rate</p>
                      <p className="text-2xl font-bold text-green-600">96.8%</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Average this month</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Read Rate</p>
                      <p className="text-2xl font-bold text-purple-600">78.4%</p>
                    </div>
                    <Eye className="h-8 w-8 text-purple-600" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">For WhatsApp & Email</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Failed</p>
                      <p className="text-2xl font-bold text-red-600">68</p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">3.2% failure rate</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

function NotificationSettingsForm({ settings, setSettings, getChannelIcon }: any) {
  const handleSettingsChange = (channel: string, key: string, value: any) => {
    setSettings((prevSettings: any) => ({
      ...prevSettings,
      [channel]: {
        ...prevSettings[channel],
        [key]: value,
      },
    }))
  }

  return (
    <div className="space-y-6">
      {Object.entries(settings).map(([channel, config]) => (
        <div key={channel} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {getChannelIcon(channel)}
              <div>
                <h3 className="font-semibold capitalize">{channel}</h3>
                <p className="text-sm text-gray-500">
                  {config.provider} • {config.usedToday}/{config.dailyLimit} used today
                </p>
              </div>
            </div>
            <Switch
              checked={config.enabled}
              onCheckedChange={(enabled) => handleSettingsChange(channel, "enabled", enabled)}
            />
          </div>
          {config.enabled && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label>Provider</Label>
                <p className="font-medium">{config.provider}</p>
              </div>
              <div>
                <Label>Daily Limit</Label>
                <p className="font-medium">{config.dailyLimit}</p>
              </div>
              {config.apiKey && (
                <div>
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    value={config.apiKey}
                    onChange={(e) => handleSettingsChange(channel, "apiKey", e.target.value)}
                  />
                </div>
              )}
              {config.senderId && (
                <div>
                  <Label>Sender ID</Label>
                  <Input
                    value={config.senderId}
                    onChange={(e) => handleSettingsChange(channel, "senderId", e.target.value)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function BulkNotificationForm({
  templates,
  bulkSend,
  setBulkSend,
  handleSendBulkNotification,
  setIsSendDialogOpen,
}: any) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Select Template</Label>
        <Select value={bulkSend.templateId} onValueChange={(value) => setBulkSend({ ...bulkSend, templateId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Choose template" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Recipients</Label>
        <Select value={bulkSend.recipients} onValueChange={(value) => setBulkSend({ ...bulkSend, recipients: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_customers">All Customers</SelectItem>
            <SelectItem value="active_customers">Active Customers Only</SelectItem>
            <SelectItem value="unpaid_customers">Unpaid Customers</SelectItem>
            <SelectItem value="custom">Custom List</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {bulkSend.recipients === "custom" && (
        <div>
          <Label>Phone Numbers (comma separated)</Label>
          <Textarea
            value={bulkSend.customRecipients}
            onChange={(e) => setBulkSend({ ...bulkSend, customRecipients: e.target.value })}
            placeholder="+91 9876543210, +91 9876543211, ..."
            rows={3}
          />
        </div>
      )}
      <div>
        <Label>Schedule Time (optional)</Label>
        <Input
          type="datetime-local"
          value={bulkSend.scheduleTime}
          onChange={(e) => setBulkSend({ ...bulkSend, scheduleTime: e.target.value })}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => setIsSendDialogOpen(false)}>
          Cancel
        </Button>
        <Button onClick={handleSendBulkNotification}>
          <Send className="h-4 w-4 mr-2" />
          Send Now
        </Button>
      </div>
    </div>
  )
}

function TemplateForm({
  newTemplate,
  setNewTemplate,
  handleCreateTemplate,
  handleChannelToggle,
  handleContentChange,
  setIsTemplateDialogOpen,
}: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Template Name</Label>
          <Input
            value={newTemplate.name}
            onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
            placeholder="Enter template name"
          />
        </div>
        <div>
          <Label>Type</Label>
          <Select value={newTemplate.type} onValueChange={(value) => setNewTemplate({ ...newTemplate, type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="billing">Billing</SelectItem>
              <SelectItem value="support">Support</SelectItem>
              <SelectItem value="onboarding">Onboarding</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Channels</Label>
        <div className="flex space-x-4 mt-2">
          {["sms", "whatsapp", "email", "push"].map((channel) => (
            <div key={channel} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={channel}
                checked={newTemplate.channels.includes(channel)}
                onChange={() => handleChannelToggle(channel)}
                className="rounded"
              />
              <Label htmlFor={channel} className="capitalize">
                {channel}
              </Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label>Subject</Label>
        <Input
          value={newTemplate.subject}
          onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
          placeholder="Enter subject line"
        />
      </div>
      <div>
        <Label>Message Content</Label>
        <Textarea
          value={newTemplate.content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Enter message content. Use {variable_name} for dynamic content."
          rows={4}
        />
        <p className="text-xs text-gray-500 mt-1">
          Available variables: {"{customer_name}, {amount}, {due_date}, {plan_name}, {support_number}"}
        </p>
      </div>
      {newTemplate.variables.length > 0 && (
        <div>
          <Label>Detected Variables</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {newTemplate.variables.map((variable) => (
              <Badge key={variable} variant="outline">
                {variable}
              </Badge>
            ))}
          </div>
        </div>
      )}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
          Cancel
        </Button>
        <Button onClick={handleCreateTemplate}>Create Template</Button>
      </div>
    </div>
  )
}
