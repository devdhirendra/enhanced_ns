"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { technicianApi, inventoryApi, complaintApi, taskApi } from "@/lib/api"
import Link from "next/link"
import DashboardLayout from "@/components/layout/DashboardLayout"
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
      console.log("[Dashboard] Fetching technician dashboard data...")

      // Fetch technician's assigned complaints and tasks
      const technicianId = user.profileDetail?.technicianId || user.user_id

      const [assignedComplaints, assignedTasks, technicianStock] = await Promise.all([
        technicianApi.getAssignedComplaints(technicianId).catch((err) => {
          console.warn("[Dashboard] Failed to fetch complaints:", err)
          return []
        }),
        taskApi.getAssigned(user.user_id).catch((err) => {
          console.warn("[Dashboard] Failed to fetch tasks:", err)
          return { data: [] }
        }),
        inventoryApi.getTechnicianStock(technicianId).catch((err) => {
          console.warn("[Dashboard] Failed to fetch inventory:", err)
          return []
        }),
      ])

      console.log("[Dashboard] Fetched complaints:", assignedComplaints)
      console.log("[Dashboard] Fetched tasks:", assignedTasks)
      console.log("[Dashboard] Fetched inventory:", technicianStock)

      // Filter out resolved complaints and only show active ones (open, assigned, in-progress)
      const activeComplaints = Array.isArray(assignedComplaints)
        ? assignedComplaints.filter((complaint) => {
            const status = complaint.status?.toLowerCase()
            return status === "open" || status === "assigned" || status === "in-progress"
          })
        : []

      // Filter out completed tasks and only show active ones (Pending, In Progress)
      const activeTasks = Array.isArray(assignedTasks?.data)
        ? assignedTasks.data.filter((task) => {
            const status = task.status?.toLowerCase()
            return status === "pending" || status === "in progress"
          })
        : []

      // Transform active complaints to unified task format
      const transformedComplaints = activeComplaints.map((complaint) => ({
        id: complaint.complaint_id || complaint.id,
        type: complaint.type || "repair",
        title: complaint.description || "Service Request",
        customer: {
          name: complaint.customerName || "Unknown Customer",
          phone: complaint.customerPhone || "N/A",
          address: complaint.Area || complaint.customerAddress || "Unknown Location",
        },
        priority: complaint.priority?.toLowerCase() || "medium",
        status: mapComplaintStatus(complaint.status),
        dueTime: new Date(complaint.createdAt).toLocaleTimeString(),
        estimatedDuration: "2 hours",
        location: { lat: 30.7333, lng: 76.7794 },
        originalStatus: complaint.status,
        createdAt: complaint.createdAt,
        category: complaint.category || "General",
        technicianNotes: complaint.technicianNotes || "",
        dataSource: "complaint", // Flag to identify source
      }))

      // Transform active tasks to unified task format
      const transformedTasks = activeTasks.map((task) => ({
        id: task.taskId,
        type: mapTaskCategory(task.category),
        title: task.title || "Task Assignment",
        customer: {
          name: "Assigned Customer", // Tasks might not have customer info directly
          phone: "N/A",
          address: "Task Location",
        },
        priority: task.priority?.toLowerCase() || "medium",
        status: mapTaskStatus(task.status),
        dueTime: new Date(task.dueDate || task.createdAt).toLocaleTimeString(),
        estimatedDuration: `${task.estimatedHours || 2} hours`,
        location: { lat: 30.7333, lng: 76.7794 },
        originalStatus: task.status,
        createdAt: task.createdAt,
        category: task.category || "General",
        technicianNotes: task.description || "",
        dataSource: "task", // Flag to identify source
        taskData: task, // Keep original task data for updates
      }))

      // Combine both complaints and tasks, then sort by creation date
      const allActiveTasks = [...transformedComplaints, ...transformedTasks].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )

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

      // Calculate stats from all active tasks (complaints + tasks)
      const calculatedStats = {
        tasksCompleted: 0, // Only count from historical data, not current active tasks
        tasksInProgress: allActiveTasks.filter((t) => t.status === "in_progress").length,
        tasksPending: allActiveTasks.filter((t) => t.status === "assigned" || t.status === "open").length,
        customersSatisfied: 45, // This would come from a separate API
        avgResponseTime: "25 min",
        completionRate: 94,
        monthlyTarget: 50,
        currentMonth: 0, // Only count completed tasks, not active ones
      }

      // Generate recent activities from all active tasks (show task assignments and starts)
      const activities = allActiveTasks.slice(0, 4).map((task, index) => {
        const createdDate = new Date(task.createdAt)
        const now = new Date()
        const hoursDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60))
        const daysDiff = Math.floor(hoursDiff / 24)

        let timeAgo = ""
        if (daysDiff > 0) {
          timeAgo = `${daysDiff} day${daysDiff === 1 ? "" : "s"} ago`
        } else if (hoursDiff > 0) {
          timeAgo = `${hoursDiff} hour${hoursDiff === 1 ? "" : "s"} ago`
        } else {
          timeAgo = "Less than an hour ago"
        }

        return {
          id: index + 1,
          type: task.status === "in_progress" ? "task_started" : "task_assigned",
          description:
            task.status === "in_progress"
              ? `Started working on: ${task.title}`
              : `New ${task.dataSource} assigned: ${task.title}`,
          time: timeAgo,
          customer: task.customer.name,
          dataSource: task.dataSource,
        }
      })

      console.log("[Dashboard] Combined active tasks loaded:", allActiveTasks.length)
      console.log("[Dashboard] Complaints:", transformedComplaints.length, "Tasks:", transformedTasks.length)

      setTasks(allActiveTasks)
      setInventory(transformedInventory)
      setStats(calculatedStats)
      setRecentActivities(activities)

      console.log("[Dashboard] Dashboard data loaded successfully")
    } catch (error) {
      console.error("[Dashboard] Error fetching dashboard data:", error)
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

  // Helper function to map complaint status to display status
  const mapComplaintStatus = (status: string) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "assigned"
      case "assigned":
        return "assigned"
      case "in-progress":
        return "in_progress"
      default:
        return "assigned"
    }
  }

  // Helper function to map task status to display status
  const mapTaskStatus = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "assigned"
      case "in progress":
        return "in_progress"
      case "completed":
        return "completed"
      default:
        return "assigned"
    }
  }

  // Helper function to map task category to type
  const mapTaskCategory = (category: string) => {
    switch (category?.toLowerCase()) {
      case "fiber installation":
        return "installation"
      case "maintenance":
        return "maintenance"
      case "repair":
        return "repair"
      case "network setup":
        return "installation"
      case "troubleshooting":
        return "repair"
      default:
        return "repair"
    }
  }

  // Helper function to map display status back to API status
  const mapToApiStatus = (displayStatus: string) => {
    switch (displayStatus) {
      case "assigned":
        return "assigned"
      case "in_progress":
        return "in-progress"
      default:
        return displayStatus
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
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
    switch (status?.toLowerCase()) {
      case "resolved":
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "assigned":
      case "open":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTaskTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "installation":
        return <Zap className="h-4 w-4" />
      case "maintenance":
        return <Wrench className="h-4 w-4" />
      case "repair":
      case "service issue":
        return <AlertTriangle className="h-4 w-4" />
      case "billing":
        return <User className="h-4 w-4" />
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

  const handleStartTask = async (task: any) => {
    try {
      const taskId = task.id
      console.log("[Dashboard] Starting task:", taskId, "Source:", task.dataSource)

      let updateResult
      if (task.dataSource === "complaint") {
        // Update complaint status
        updateResult = await complaintApi.changestatus(taskId, {
          status: "in-progress",
        })
      } else if (task.dataSource === "task") {
        // Update task status
        updateResult = await taskApi.updateStatus(taskId, "In Progress")
      }

      console.log("[Dashboard] Update result:", updateResult)

      // Update local state optimistically
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: "in_progress",
                startedAt: new Date().toLocaleTimeString(),
              }
            : t,
        ),
      )

      // Update stats
      setStats((prevStats) => ({
        ...prevStats,
        tasksInProgress: prevStats.tasksInProgress + 1,
        tasksPending: Math.max(0, prevStats.tasksPending - 1),
      }))

      toast({
        title: "Task Started",
        description: `${task.dataSource === "complaint" ? "Complaint" : "Task"} has been marked as in progress.`,
      })
    } catch (error) {
      console.error("[Dashboard] Error starting task:", error)
      toast({
        title: "Error",
        description: `Failed to start ${task.dataSource}: ${error.message || "Please check network connection"}`,
        variant: "destructive",
      })
    }
  }

  const handleCompleteTask = async (task: any) => {
    try {
      const taskId = task.id
      console.log("[Dashboard] Completing task:", taskId, "Source:", task.dataSource)

      let updateResult
      if (task.dataSource === "complaint") {
        // Update complaint status
        updateResult = await complaintApi.changestatus(taskId, {
          status: "resolved",
        })
      } else if (task.dataSource === "task") {
        // Update task status
        updateResult = await taskApi.updateStatus(taskId, "Completed")
      }

      console.log("[Dashboard] Complete result:", updateResult)

      // Remove the task from local state since it's now completed
      setTasks((prevTasks) => prevTasks.filter((t) => t.id !== taskId))

      // Update stats
      setStats((prevStats) => ({
        ...prevStats,
        tasksCompleted: prevStats.tasksCompleted + 1,
        tasksInProgress: Math.max(0, prevStats.tasksInProgress - 1),
        currentMonth: prevStats.currentMonth + 1,
      }))

      toast({
        title: `${task.dataSource === "complaint" ? "Complaint" : "Task"} Completed`,
        description: `${task.dataSource === "complaint" ? "Complaint" : "Task"} has been marked as completed and removed from active list.`,
      })
    } catch (error) {
      console.error("[Dashboard] Error completing task:", error)
      toast({
        title: "Error",
        description: `Failed to complete ${task.dataSource}: ${error.message || "Please check network connection"}`,
        variant: "destructive",
      })
    }
  }

  const handleNavigate = (location: any) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`
    window.open(url, "_blank")
  }

  const handleCallCustomer = (phone: string) => {
    if (phone && phone !== "N/A") {
      window.open(`tel:${phone}`)
    }
  }

  const refreshTasks = async () => {
    await fetchDashboardData()
    toast({
      title: "Work Items Refreshed",
      description: "Active tasks and complaints list has been updated with latest data.",
    })
  }

  const formatCreatedDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`
    } else {
      return "Just now"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <DashboardLayout title="Dashboard" description="View all summary">
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-orange-50 via-blue-50 to-green-50 rounded-lg p-6 border-0 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user.profileDetail?.avatar || "/placeholder.svg"}
                alt={user.profileDetail?.name || "User"}
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {(user.profileDetail?.name || "User")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user.profileDetail?.name || "Technician"}!
              </h1>
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
        <Link href="/technician/tasks" className="block">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-md cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500">
            {/* Tasks Completed */}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Tasks Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{stats.tasksCompleted}</div>
              <p className="text-xs text-green-600 mt-1">This month</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/technician/tasks" className="block">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-md cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500">
            {/* In Progress */}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">In Progress</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{stats.tasksInProgress}</div>
              <p className="text-xs text-blue-600 mt-1">Active tasks</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/technician/tasks" className="block">
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-md cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500">
            {/* Pending */}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">Pending</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{stats.tasksPending}</div>
              <p className="text-xs text-orange-600 mt-1">Awaiting start</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/technician/tasks" className="block">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-md cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500">
            {/* Active Tasks */}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">Active Tasks</CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{tasks.length}</div>
              <p className="text-xs text-purple-600 mt-1">Total active</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Active Tasks */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <div>
                  <CardTitle>Active Work Items</CardTitle>
                  <CardDescription>Your current active tasks and complaints (excluding resolved)</CardDescription>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={refreshTasks} disabled={loading}>
                {loading ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No active work items assigned</p>
                <p className="text-sm">All tasks and complaints are either completed or none are assigned</p>
              </div>
            ) : (
              tasks.map((task) => (
                <Link href={`/task/${task.id}`} key={task.id}>
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300 bg-gradient-to-r from-white to-gray-50">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getTaskTypeIcon(task.type)}
                          <h3 className="font-medium text-gray-900">{task.title}</h3>
                          <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                          <Badge variant="outline" className="text-xs">
                            ID: {task.id}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs ${task.dataSource === "complaint" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}
                          >
                            {task.dataSource === "complaint" ? "Complaint" : "Task"}
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span>{task.customer?.name || "Unknown"}</span>
                          </div>
                          {task.customer?.phone && task.customer.phone !== "N/A" && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4" />
                              <span>{task.customer.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>{task.customer?.address || "Location not specified"}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>Created: {formatCreatedDate(task.createdAt)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Activity className="h-4 w-4" />
                              <span>Category: {task.category}</span>
                            </div>
                            {task.startedAt && (
                              <div className="flex items-center space-x-1">
                                <Play className="h-4 w-4 text-blue-600" />
                                <span className="text-blue-600">Started: {task.startedAt}</span>
                              </div>
                            )}
                          </div>
                          {task.technicianNotes && (
                            <div className="bg-yellow-50 p-2 rounded text-xs">
                              <strong>Notes:</strong> {task.technicianNotes}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 lg:ml-4">
                        <Badge className={getStatusColor(task.status)}>
                          {task.status === "in_progress" ? "IN PROGRESS" : task.status.toUpperCase()}
                        </Badge>

                        <div className="flex flex-wrap gap-2">
                          {task.status === "assigned" && (
                            <Button
                              size="sm"
                              onClick={() => handleStartTask(task)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Start
                            </Button>
                          )}

                          {task.status === "in_progress" && (
                            <Button
                              size="sm"
                              onClick={() => handleCompleteTask(task)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Complete
                            </Button>
                          )}

                          {task.location && (
                            <Button size="sm" variant="outline" onClick={() => handleNavigate(task.location)}>
                              <Navigation className="h-4 w-4 mr-1" />
                              Navigate
                            </Button>
                          )}

                          {task.customer?.phone && task.customer.phone !== "N/A" && (
                            <Button size="sm" variant="outline" onClick={() => handleCallCustomer(task.customer.phone)}>
                              <Phone className="h-4 w-4 mr-1" />
                              Call
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
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
                  style={{ width: `${Math.min(100, (stats.currentMonth / stats.monthlyTarget) * 100)}%` }}
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
            <CardDescription>Your latest work activities (active tasks only)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  <p className="text-sm">No recent activities</p>
                  <p className="text-xs">Activities will appear when you start working on tasks</p>
                </div>
              ) : (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          activity.type === "task_started" ? "bg-blue-500" : "bg-orange-500"
                        }`}
                      ></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                      {activity.customer && <p className="text-xs text-gray-400">Customer: {activity.customer}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </DashboardLayout>
  )
}
