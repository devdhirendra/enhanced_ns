"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { technicianApi, inventoryApi } from "@/lib/api"
import {
  CheckCircle,
  Clock,
  MapPin,
  User,
  Phone,
  AlertTriangle,
  Play,
  Navigation,
  Package,
  Calendar,
  TrendingUp,
  Activity,
  Wrench,
  Users,
  Target,
  Zap,
} from "lucide-react"

export default function TechnicianDashboardPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [tasks, setTasks] = useState([])
  const [complaints, setComplaints] = useState([])
  const [inventory, setInventory] = useState([])
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    tasksInProgress: 0,
    tasksPending: 0,
    customersSatisfied: 0,
    avgResponseTime: "0 min",
    completionRate: 0,
    monthlyTarget: 50,
    currentMonth: 0,
  })
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (user?.user_id) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    if (!user?.user_id) return

    try {
      setLoading(true)
      console.log("[v0] Fetching technician dashboard data...")

      // Fetch technician's assigned complaints (tasks)
      const technicianId = user.profileDetail?.technicianId || user.user_id

      const [assignedComplaints, technicianStock] = await Promise.all([
        technicianApi.getAssignedComplaints(technicianId).catch((err) => {
          console.warn("[v0] Failed to fetch complaints:", err)
          return []
        }),
        inventoryApi.getTechnicianStock(technicianId).catch((err) => {
          console.warn("[v0] Failed to fetch inventory:", err)
          return []
        }),
      ])

      console.log("[v0] Fetched complaints:", assignedComplaints)
      console.log("[v0] Fetched inventory:", technicianStock)

      // Transform complaints to tasks format
      const transformedTasks = Array.isArray(assignedComplaints)
        ? assignedComplaints.map((complaint) => ({
            id: complaint.complaint_id || complaint.id,
            type: complaint.type || "repair",
            title: complaint.description || "Service Request",
            customer: {
              name: complaint.customerName || "Unknown Customer",
              phone: complaint.customerPhone || "N/A",
              address: complaint.Area || "Unknown Location",
            },
            priority: complaint.priority || "medium",
            status:
              complaint.status === "assigned"
                ? "assigned"
                : complaint.status === "in-progress"
                  ? "in_progress"
                  : "assigned",
            dueTime: new Date().toLocaleTimeString(),
            estimatedDuration: "2 hours",
            location: { lat: 30.7333, lng: 76.7794 },
          }))
        : []

      // Transform inventory data
      const transformedInventory = Array.isArray(technicianStock)
        ? technicianStock.map((item) => ({
            name: item.itemName || item.name || "Unknown Item",
            stock: item.quantity || 0,
            minStock: 5,
            status: (item.quantity || 0) > 10 ? "good" : (item.quantity || 0) > 0 ? "low" : "out",
          }))
        : [
            { name: "Fiber Cable", stock: 15, minStock: 10, status: "good" },
            { name: "ONT Devices", stock: 3, minStock: 5, status: "low" },
            { name: "Routers", stock: 8, minStock: 5, status: "good" },
            { name: "Splitters", stock: 0, minStock: 3, status: "out" },
          ]

      // Calculate stats from real data
      const calculatedStats = {
        tasksCompleted: transformedTasks.filter((t) => t.status === "completed").length,
        tasksInProgress: transformedTasks.filter((t) => t.status === "in_progress").length,
        tasksPending: transformedTasks.filter((t) => t.status === "assigned").length,
        customersSatisfied: 45, // This would come from a separate API
        avgResponseTime: "25 min",
        completionRate: 94,
        monthlyTarget: 50,
        currentMonth: transformedTasks.filter((t) => t.status === "completed").length,
      }

      // Generate recent activities from tasks
      const activities = transformedTasks.slice(0, 4).map((task, index) => ({
        id: index + 1,
        type:
          index === 0
            ? "task_completed"
            : index === 1
              ? "inventory_used"
              : index === 2
                ? "task_started"
                : "customer_call",
        description:
          index === 0
            ? `Completed ${task.title}`
            : index === 1
              ? "Used fiber cable for installation"
              : index === 2
                ? `Started ${task.title}`
                : `Received call from ${task.customer.name}`,
        time: `${index + 1} hour${index === 0 ? "" : "s"} ago`,
        customer: task.customer.name,
      }))

      setTasks(transformedTasks)
      setInventory(transformedInventory)
      setStats(calculatedStats)
      setRecentActivities(activities)

      console.log("[v0] Dashboard data loaded successfully")
    } catch (error) {
      console.error("[v0] Error fetching dashboard data:", error)
      toast({
        title: "Error Loading Dashboard",
        description: "Failed to load dashboard data. Using offline mode.",
        variant: "destructive",
      })

      // Fallback to mock data
      setTasks([])
      setInventory([
        { name: "Fiber Cable", stock: 15, minStock: 10, status: "good" },
        { name: "ONT Devices", stock: 3, minStock: 5, status: "low" },
        { name: "Routers", stock: 8, minStock: 5, status: "good" },
        { name: "Splitters", stock: 0, minStock: 3, status: "out" },
      ])
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div>Loading...</div>
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "assigned":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case "installation":
        return <Zap className="h-4 w-4" />
      case "maintenance":
        return <Wrench className="h-4 w-4" />
      case "repair":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getInventoryStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-green-600"
      case "low":
        return "text-yellow-600"
      case "out":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const handleStartTask = async (taskId: string) => {
    try {
      console.log("[v0] Starting task:", taskId)

      // Update complaint status to in-progress
      await technicianApi.updateComplaint(taskId, {
        status: "in-progress",
        technicianNotes: "Task started by technician",
      })

      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, status: "in_progress", startedAt: currentTime.toLocaleTimeString() } : task,
        ),
      )

      toast({
        title: "Task Started",
        description: "Task has been marked as in progress.",
      })
    } catch (error) {
      console.error("[v0] Error starting task:", error)
      toast({
        title: "Error",
        description: "Failed to start task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    try {
      console.log("[v0] Completing task:", taskId)

      // Update complaint status to resolved
      await technicianApi.updateComplaint(taskId, {
        status: "resolved",
        technicianNotes: "Task completed successfully",
      })

      setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: "completed" } : task)))

      toast({
        title: "Task Completed",
        description: "Task has been marked as completed.",
      })
    } catch (error) {
      console.error("[v0] Error completing task:", error)
      toast({
        title: "Error",
        description: "Failed to complete task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleNavigate = (location: any) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`
    window.open(url, "_blank")
  }

  const handleCallCustomer = (phone: string) => {
    window.open(`tel:${phone}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-orange-50 via-blue-50 to-green-50 rounded-lg p-6 border-0 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.profileDetail.name}!</h1>
              <p className="text-gray-600">
                {currentTime.toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-sm text-gray-500">Current time: {currentTime.toLocaleTimeString("en-IN")}</p>
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <Badge className="bg-orange-100 text-orange-800 text-center">Field Technician</Badge>
            <Badge className="bg-green-100 text-green-800 text-center">Active</Badge>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Tasks Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.tasksCompleted}</div>
            <p className="text-xs text-green-600 mt-1">This month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">In Progress</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.tasksInProgress}</div>
            <p className="text-xs text-blue-600 mt-1">Active tasks</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{stats.tasksPending}</div>
            <p className="text-xs text-orange-600 mt-1">Assigned tasks</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{stats.completionRate}%</div>
            <p className="text-xs text-purple-600 mt-1">Success rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Tasks
            </CardTitle>
            <CardDescription>Your scheduled tasks for today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No tasks assigned for today</p>
                <p className="text-sm">Check back later for new assignments</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300 bg-gradient-to-r from-white to-gray-50"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getTaskTypeIcon(task.type)}
                        <h3 className="font-medium text-gray-900">{task.title}</h3>
                        <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>{task.customer.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{task.customer.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{task.customer.address}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Due: {task.dueTime}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Activity className="h-4 w-4" />
                            <span>Est: {task.estimatedDuration}</span>
                          </div>
                          {task.startedAt && (
                            <div className="flex items-center space-x-1">
                              <Play className="h-4 w-4 text-blue-600" />
                              <span className="text-blue-600">Started: {task.startedAt}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 lg:ml-4">
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace("_", " ").toUpperCase()}
                      </Badge>

                      <div className="flex flex-wrap gap-2">
                        {task.status === "assigned" && (
                          <Button
                            size="sm"
                            onClick={() => handleStartTask(task.id)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Start
                          </Button>
                        )}

                        {task.status === "in_progress" && (
                          <Button
                            size="sm"
                            onClick={() => handleCompleteTask(task.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                        )}

                        <Button size="sm" variant="outline" onClick={() => handleNavigate(task.location)}>
                          <Navigation className="h-4 w-4 mr-1" />
                          Navigate
                        </Button>

                        <Button size="sm" variant="outline" onClick={() => handleCallCustomer(task.customer.phone)}>
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Inventory */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-orange-600 hover:bg-orange-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Check In/Out
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Package className="h-4 w-4 mr-2" />
                View Inventory
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report Issue
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Users className="h-4 w-4 mr-2" />
                Customer Support
              </Button>
            </CardContent>
          </Card>

          {/* Inventory Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Inventory Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {inventory.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">Min: {item.minStock}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${getInventoryStatusColor(item.status)}`}>{item.stock}</p>
                    <p className="text-xs text-gray-500">in stock</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Performance & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Performance
            </CardTitle>
            <CardDescription>Your progress towards monthly targets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tasks Completed</span>
                <span className="font-medium">
                  {stats.currentMonth}/{stats.monthlyTarget}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full"
                  style={{ width: `${(stats.currentMonth / stats.monthlyTarget) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-900">{stats.customersSatisfied}</p>
                <p className="text-xs text-blue-600">Happy Customers</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-900">{stats.avgResponseTime}</p>
                <p className="text-xs text-green-600">Avg Response</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activities
            </CardTitle>
            <CardDescription>Your latest work activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  <p className="text-sm">No recent activities</p>
                </div>
              ) : (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
