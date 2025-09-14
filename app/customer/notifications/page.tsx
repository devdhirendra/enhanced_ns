"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  Gift,
  CreditCard,
  Wifi,
  Search,
  Filter,
  Award as MarkAsRead,
  Trash2,
  Star,
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function CustomerNotificationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "Payment Successful",
      message: "Your payment of ₹1,999 for February 2024 has been processed successfully.",
      type: "success",
      category: "billing",
      time: "2024-01-20T10:30:00Z",
      read: false,
      important: false,
    },
    {
      id: "2",
      title: "Network Maintenance Scheduled",
      message: "Scheduled maintenance in your area on Jan 25, 2024 from 2:00 AM to 4:00 AM.",
      type: "info",
      category: "service",
      time: "2024-01-19T14:15:00Z",
      read: false,
      important: true,
    },
    {
      id: "3",
      title: "Special Offer: Upgrade Your Plan",
      message: "Upgrade to our Premium 200 Mbps plan and get 2 months free! Limited time offer.",
      type: "offer",
      category: "promotional",
      time: "2024-01-18T09:00:00Z",
      read: true,
      important: false,
    },
    {
      id: "4",
      title: "Bill Generated",
      message: "Your bill for February 2024 is ready. Amount due: ₹1,999. Due date: Feb 28, 2024.",
      type: "info",
      category: "billing",
      time: "2024-01-15T08:00:00Z",
      read: true,
      important: false,
    },
    {
      id: "5",
      title: "Service Restored",
      message: "The network issue in your area has been resolved. Thank you for your patience.",
      type: "success",
      category: "service",
      time: "2024-01-12T16:45:00Z",
      read: true,
      important: false,
    },
  ])

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    billingAlerts: true,
    serviceUpdates: true,
    promotionalOffers: true,
    maintenanceAlerts: true,
  })

  const { toast } = useToast()

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case "info":
        return <Info className="h-5 w-5 text-blue-600" />
      case "offer":
        return <Gift className="h-5 w-5 text-purple-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const getNotificationBg = (type: string, read: boolean) => {
    const baseClasses = read ? "bg-white" : "bg-blue-50"
    switch (type) {
      case "success":
        return `${baseClasses} border-l-4 border-l-green-500`
      case "warning":
        return `${baseClasses} border-l-4 border-l-yellow-500`
      case "info":
        return `${baseClasses} border-l-4 border-l-blue-500`
      case "offer":
        return `${baseClasses} border-l-4 border-l-purple-500`
      default:
        return `${baseClasses} border-l-4 border-l-gray-500`
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "billing":
        return <CreditCard className="h-4 w-4 text-gray-500" />
      case "service":
        return <Wifi className="h-4 w-4 text-gray-500" />
      case "promotional":
        return <Gift className="h-4 w-4 text-gray-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
    toast({
      title: "Marked as Read",
      description: "Notification has been marked as read.",
    })
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
    toast({
      title: "All Marked as Read",
      description: "All notifications have been marked as read.",
    })
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
    toast({
      title: "Notification Deleted",
      description: "Notification has been deleted.",
    })
  }

  const toggleImportant = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, important: !notification.important } : notification,
      ),
    )
  }

  const updatePreference = (key: string, value: boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
    toast({
      title: "Preference Updated",
      description: "Your notification preferences have been saved.",
    })
  }

  const unreadCount = notifications.filter((n) => !n.read).length
  const importantCount = notifications.filter((n) => n.important).length

  return (
    <DashboardLayout title="Notifications" description="Manage your notifications and preferences">
      <div className="space-y-6">
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
            <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
            <TabsTrigger value="important">Important ({importantCount})</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {/* Actions Bar */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search notifications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64"
                      />
                    </div>
                    <Button variant="outline">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                  <Button onClick={markAllAsRead}>
                    <MarkAsRead className="h-4 w-4 mr-2" />
                    Mark All Read
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notifications List */}
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card key={notification.id} className={getNotificationBg(notification.type, notification.read)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className={`font-semibold ${notification.read ? "text-gray-700" : "text-gray-900"}`}>
                              {notification.title}
                            </h3>
                            {notification.important && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                            {!notification.read && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                          </div>
                          <p className={`text-sm ${notification.read ? "text-gray-500" : "text-gray-700"} mb-3`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              {getCategoryIcon(notification.category)}
                              <span className="capitalize">{notification.category}</span>
                            </div>
                            <span>{formatDate(notification.time)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button size="sm" variant="ghost" onClick={() => toggleImportant(notification.id)}>
                          <Star
                            className={`h-4 w-4 ${notification.important ? "text-yellow-500 fill-current" : "text-gray-400"}`}
                          />
                        </Button>
                        {!notification.read && (
                          <Button size="sm" variant="ghost" onClick={() => markAsRead(notification.id)}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => deleteNotification(notification.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="unread" className="space-y-6">
            <div className="space-y-4">
              {notifications
                .filter((n) => !n.read)
                .map((notification) => (
                  <Card key={notification.id} className={getNotificationBg(notification.type, notification.read)}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                              {notification.important && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                              <div className="w-2 h-2 bg-blue-600 rounded-full" />
                            </div>
                            <p className="text-sm text-gray-700 mb-3">{notification.message}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                {getCategoryIcon(notification.category)}
                                <span className="capitalize">{notification.category}</span>
                              </div>
                              <span>{formatDate(notification.time)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Button size="sm" variant="ghost" onClick={() => toggleImportant(notification.id)}>
                            <Star
                              className={`h-4 w-4 ${notification.important ? "text-yellow-500 fill-current" : "text-gray-400"}`}
                            />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => markAsRead(notification.id)}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteNotification(notification.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              {notifications.filter((n) => !n.read).length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
                    <p className="text-gray-500">You have no unread notifications.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="important" className="space-y-6">
            <div className="space-y-4">
              {notifications
                .filter((n) => n.important)
                .map((notification) => (
                  <Card key={notification.id} className={getNotificationBg(notification.type, notification.read)}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className={`font-semibold ${notification.read ? "text-gray-700" : "text-gray-900"}`}>
                                {notification.title}
                              </h3>
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              {!notification.read && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                            </div>
                            <p className={`text-sm ${notification.read ? "text-gray-500" : "text-gray-700"} mb-3`}>
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                {getCategoryIcon(notification.category)}
                                <span className="capitalize">{notification.category}</span>
                              </div>
                              <span>{formatDate(notification.time)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Button size="sm" variant="ghost" onClick={() => toggleImportant(notification.id)}>
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          </Button>
                          {!notification.read && (
                            <Button size="sm" variant="ghost" onClick={() => markAsRead(notification.id)}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => deleteNotification(notification.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              {notifications.filter((n) => n.important).length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No important notifications</h3>
                    <p className="text-gray-500">Mark notifications as important to see them here.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications" className="text-base font-medium">
                        Email Notifications
                      </Label>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={preferences.emailNotifications}
                      onCheckedChange={(checked) => updatePreference("emailNotifications", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sms-notifications" className="text-base font-medium">
                        SMS Notifications
                      </Label>
                      <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                    </div>
                    <Switch
                      id="sms-notifications"
                      checked={preferences.smsNotifications}
                      onCheckedChange={(checked) => updatePreference("smsNotifications", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-notifications" className="text-base font-medium">
                        Push Notifications
                      </Label>
                      <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={preferences.pushNotifications}
                      onCheckedChange={(checked) => updatePreference("pushNotifications", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Categories</CardTitle>
                <CardDescription>Choose which types of notifications you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="billing-alerts" className="text-base font-medium">
                        Billing Alerts
                      </Label>
                      <p className="text-sm text-gray-500">Payment confirmations, bill reminders</p>
                    </div>
                    <Switch
                      id="billing-alerts"
                      checked={preferences.billingAlerts}
                      onCheckedChange={(checked) => updatePreference("billingAlerts", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="service-updates" className="text-base font-medium">
                        Service Updates
                      </Label>
                      <p className="text-sm text-gray-500">Network status, outage notifications</p>
                    </div>
                    <Switch
                      id="service-updates"
                      checked={preferences.serviceUpdates}
                      onCheckedChange={(checked) => updatePreference("serviceUpdates", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="promotional-offers" className="text-base font-medium">
                        Promotional Offers
                      </Label>
                      <p className="text-sm text-gray-500">Special deals, upgrade offers</p>
                    </div>
                    <Switch
                      id="promotional-offers"
                      checked={preferences.promotionalOffers}
                      onCheckedChange={(checked) => updatePreference("promotionalOffers", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="maintenance-alerts" className="text-base font-medium">
                        Maintenance Alerts
                      </Label>
                      <p className="text-sm text-gray-500">Scheduled maintenance notifications</p>
                    </div>
                    <Switch
                      id="maintenance-alerts"
                      checked={preferences.maintenanceAlerts}
                      onCheckedChange={(checked) => updatePreference("maintenanceAlerts", checked)}
                    />
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
