"use client"

import type { User } from "@/contexts/AuthContext"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bell, LogOut, Settings, UserIcon, CheckCircle, AlertTriangle, Info } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface DashboardHeaderProps {
  user: User
  title?: string
  description?: string
}

// Demo notifications data
const notifications = [
  {
    id: 1,
    title: "New operator registered",
    message: "City Networks has completed registration",
    type: "success",
    time: "2 minutes ago",
    read: false,
  },
  {
    id: 2,
    title: "Payment overdue",
    message: "Metro Fiber payment is 5 days overdue",
    type: "warning",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 3,
    title: "System maintenance",
    message: "Scheduled maintenance tonight at 2 AM",
    type: "info",
    time: "3 hours ago",
    read: true,
  },
]

export function DashboardHeader({ user, title, description }: DashboardHeaderProps) {
  const { logout } = useAuth()
  const router = useRouter()
  const [notificationsList, setNotificationsList] = useState(notifications)

  const unreadCount = notificationsList.filter((n) => !n.read).length

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

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800"
      case "operator":
        return "bg-blue-100 text-blue-800"
      case "technician":
        return "bg-orange-100 text-orange-800"
      case "vendor":
        return "bg-green-100 text-green-800"
      case "customer":
        return "bg-pink-100 text-pink-800"
      case "staff":
        return "bg-indigo-100 text-indigo-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "info":
        return <Info className="h-4 w-4 text-blue-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const markAsRead = (id: number) => {
    setNotificationsList((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotificationsList((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const handleProfileClick = () => {
    router.push(`/${user.role}/profile`)
  }

  const handleSettingsClick = () => {
    router.push(`/${user.role}/settings`)
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center space-x-4">
          <SidebarTrigger className="lg:hidden" />
          <div className="hidden md:block">
            {title && <h1 className="text-xl font-semibold text-gray-900">{title}</h1>}
            {description && <p className="text-sm text-gray-500">{description}</p>}
          </div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                      Mark all read
                    </Button>
                  )}
                </div>
              </div>
              <div className="max-h-80 w-full overflow-y-auto">
                {notificationsList.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No notifications</div>
                ) : (
                  notificationsList.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                        !notification.read ? "bg-blue-50" : ""
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          <p className="text-sm text-gray-600 truncate">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                        </div>
                        {!notification.read && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-2 border-t">
                <Button
                  variant="ghost"
                  className="w-full text-sm"
                  onClick={() => router.push(`/${user.role}/notifications`)}
                >
                  View all notifications
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-auto px-2 md:px-3">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profileDetail.avatar || "/placeholder.svg"} alt={user.profileDetail.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {user.profileDetail.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user.profileDetail.name}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className={`text-xs ${getRoleColor(user.role)}`}>
                        {user.role}
                      </Badge>
                      <Badge variant="secondary" className={`text-xs ${getStatusColor(user.Permissions.status)}`}>
                        {user.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-2">
                  <p className="text-sm font-medium leading-none">{user.profileDetail.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  {user.profileDetail.companyName && <p className="text-xs leading-none text-muted-foreground">{user.profileDetail.companyName}</p>}
                  <div className="flex items-center space-x-2 pt-1">
                    <Badge variant="secondary" className={`text-xs ${getRoleColor(user.role)}`}>
                      {user.role}
                    </Badge>
                    <Badge variant="secondary" className={`text-xs ${getStatusColor(user.Permissions.status)}`}>
                      {user.status}
                    </Badge>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleProfileClick}>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSettingsClick}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
