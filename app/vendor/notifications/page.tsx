"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { useAuth } from "@/contexts/AuthContext"
import { notificationApi } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import {
  Bell,
  BellRing,
  Check,
  Package,
  ShoppingCart,
  CreditCard,
  Info,
  CheckCircle,
  Clock,
  Filter,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Notification {
  id: string
  title: string
  message: string
  type: "order" | "payment" | "product" | "system" | "promotion"
  priority: "low" | "medium" | "high"
  read: boolean
  createdAt: string
  data?: any
}

export default function VendorNotificationsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  useEffect(() => {
    if (user?.user_id) {
      fetchNotifications()
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const data = await notificationApi.getAll(user.user_id)

      // Mock notifications for demo
      const mockNotifications: Notification[] = [
        {
          id: "1",
          title: "New Order Received",
          message: "You have received a new order for Fiber Optic Cable (Qty: 50)",
          type: "order",
          priority: "high",
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
        {
          id: "2",
          title: "Payment Processed",
          message: "Payment of ₹25,000 has been processed for Order #ORD-001",
          type: "payment",
          priority: "medium",
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        },
        {
          id: "3",
          title: "Product Stock Low",
          message: "Router Model XR-500 is running low on stock (5 units remaining)",
          type: "product",
          priority: "medium",
          read: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        },
        {
          id: "4",
          title: "KYC Verification Approved",
          message: "Your KYC documents have been verified and approved",
          type: "system",
          priority: "high",
          read: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        },
        {
          id: "5",
          title: "Promotional Campaign Started",
          message: "Your 'Summer Sale' promotion is now live and active",
          type: "promotion",
          priority: "low",
          read: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        },
      ]

      setNotifications(mockNotifications)
    } catch (error) {
      console.error("Error fetching notifications:", error)
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationApi.markRead(notificationId)
      setNotifications((prev) => prev.map((notif) => (notif.id === notificationId ? { ...notif, read: true } : notif)))
      toast({
        title: "Success",
        description: "Notification marked as read",
      })
    } catch (error) {
      console.error("Error marking notification as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      })
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.read)
      await Promise.all(unreadNotifications.map((n) => notificationApi.markRead(n.id)))

      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
      toast({
        title: "Success",
        description: "All notifications marked as read",
      })
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      })
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingCart className="w-5 h-5 text-blue-600" />
      case "payment":
        return <CreditCard className="w-5 h-5 text-green-600" />
      case "product":
        return <Package className="w-5 h-5 text-orange-600" />
      case "system":
        return <Info className="w-5 h-5 text-purple-600" />
      case "promotion":
        return <Bell className="w-5 h-5 text-pink-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
      case "low":
        return <Badge className="bg-green-100 text-green-800">Low</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Normal</Badge>
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    const matchesReadFilter =
      filter === "all" || (filter === "read" && notification.read) || (filter === "unread" && !notification.read)

    const matchesTypeFilter = typeFilter === "all" || notification.type === typeFilter

    return matchesReadFilter && matchesTypeFilter
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
        <DashboardLayout title="Vendor Dashboard" description="Overview of your network operations">
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BellRing className="w-8 h-8" />
            Notifications
            {unreadCount > 0 && <Badge className="bg-red-500 text-white ml-2">{unreadCount}</Badge>}
          </h1>
          <p className="text-gray-600 mt-1">Stay updated with your business activities</p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex gap-2">
              <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
                All ({notifications.length})
              </Button>
              <Button
                variant={filter === "unread" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("unread")}
              >
                Unread ({unreadCount})
              </Button>
              <Button variant={filter === "read" ? "default" : "outline"} size="sm" onClick={() => setFilter("read")}>
                Read ({notifications.length - unreadCount})
              </Button>
            </div>

            <Separator orientation="vertical" className="h-8" />

            <div className="flex gap-2">
              <Button
                variant={typeFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("all")}
              >
                All Types
              </Button>
              <Button
                variant={typeFilter === "order" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("order")}
              >
                Orders
              </Button>
              <Button
                variant={typeFilter === "payment" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("payment")}
              >
                Payments
              </Button>
              <Button
                variant={typeFilter === "product" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("product")}
              >
                Products
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No notifications found</h3>
              <p className="text-gray-500 text-center">
                {filter === "unread"
                  ? "You're all caught up! No unread notifications."
                  : "No notifications match your current filters."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all duration-200 hover:shadow-md ${
                !notification.read ? "border-l-4 border-l-blue-500 bg-blue-50/30" : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className={`font-semibold ${!notification.read ? "text-gray-900" : "text-gray-700"}`}>
                          {notification.title}
                        </h3>
                        {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                        {getPriorityBadge(notification.priority)}
                      </div>
                      <p className="text-gray-600 mb-3">{notification.message}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {notification.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {!notification.read && (
                    <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)} className="ml-4">
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
    </DashboardLayout>
  )
}
