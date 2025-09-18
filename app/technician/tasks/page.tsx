"use client"

import { use, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  CheckCircle,
  Play,
  Pause,
  Navigation,
  AlertTriangle,
  Wrench,
  Zap,
  Activity,
  FileText,
  Camera,
  Save,
  Download,
  Filter,
} from "lucide-react"
import { inter } from "@/app/layout"
import { taskApi } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

interface Customer {
  name: string
  phone: string
  address: string
  email: string
}

interface Task {
  id: string
  ticketNumber: string
  type: string
  title: string
  description: string
  customer: Customer
  priority: string
  status: string
  assignedDate: string
  dueDate: string
  estimatedDuration: string
  location: { lat: number; lng: number }
  materials: string[]
  notes: string
  createdBy: string
  startedAt?: string
  completedAt?: string
  workNotes?: string
  completionNotes?: string
}

interface TaskUpdate {
  id: string
  status?: string
  workNotes?: string
  completionNotes?: string
}

interface TaskFilter {
  type: string
  priority: string
  status: string
  search: string
}

interface TaskStats {
  total: number
  assigned: number
  inProgress: number
  completed: number
}

interface TaskActionHandlers {
  onStartTask: (taskId: string) => void
  onPauseTask: (taskId: string) => void
  onCompleteTask: (taskId: string) => void
  onNavigate: (location: any) => void
  onCallCustomer: (phone: string) => void
  onViewDetails: (task: Task) => void
  getPriorityColor: (priority: string) => string
  getStatusColor: (status: string) => string
  getTaskTypeIcon: (type: string) => JSX.Element
}

export default function TasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [workNotes, setWorkNotes] = useState("")
  const [completionNotes, setCompletionNotes] = useState("")
  const [hasChanges, setHasChanges] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  // Map API status values to component status values
  const mapApiStatus = (apiStatus: string): string => {
    const statusMap: Record<string, string> = {
      'Pending': 'assigned',
      'In Progress': 'in_progress',
      'Completed': 'completed',
      'Cancelled': 'cancelled'
    }
    return statusMap[apiStatus] || 'assigned'
  }

  // Map component status values to API status values
  const mapComponentToApiStatus = (componentStatus: string): string => {
    const statusMap: Record<string, string> = {
      'assigned': 'Pending',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'paused': 'Pending', // Map paused back to Pending since API doesn't support Paused
      'cancelled': 'Cancelled'
    }
    return statusMap[componentStatus] || 'Pending'
  }

  // Map API priority values to component priority values
  const mapApiPriority = (apiPriority: string): string => {
    return apiPriority.toLowerCase() // "High" -> "high", "Medium" -> "medium", "Low" -> "low"
  }

  // Map API category to component type
  const mapApiCategory = (apiCategory: string): string => {
    const categoryMap: Record<string, string> = {
      'Bug': 'repair',
      'Error': 'repair',
      'Feature': 'installation',
      'Maintenance': 'maintenance',
      'Installation': 'installation'
    }
    return categoryMap[apiCategory] || 'repair'
  }

  // Generate customer info based on task data (placeholder implementation)
  const generateCustomerInfo = (taskId: string) => {
    // This is a placeholder - in a real app, you'd fetch this from an API
    const customers = [
      { name: "Rajesh Kumar", phone: "+91 9876543210", address: "House 123, Sector 15, Chandigarh", email: "rajesh@example.com" },
      { name: "Priya Singh", phone: "+91 9876543211", address: "Flat 45, Sector 22, Chandigarh", email: "priya@example.com" },
      { name: "Amit Sharma", phone: "+91 9876543212", address: "Shop 67, Sector 35, Chandigarh", email: "amit@example.com" },
      { name: "Tech Solutions Pvt Ltd", phone: "+91 9876543213", address: "Office 12, IT Park, Chandigarh", email: "admin@techsolutions.com" },
    ]
    const index = parseInt(taskId.slice(-1)) || 0
    return customers[index % customers.length]
  }

  // Generate location based on task (placeholder implementation)
  const generateLocation = () => {
    const locations = [
      { lat: 30.7333, lng: 76.7794 },
      { lat: 30.7614, lng: 76.7911 },
      { lat: 30.6942, lng: 76.7611 },
      { lat: 30.7046, lng: 76.7179 },
    ]
    return locations[Math.floor(Math.random() * locations.length)]
  }

  // Generate materials based on task type
  const generateMaterials = (type: string) => {
    const materialMap: Record<string, string[]> = {
      'installation': ["Fiber Cable - 50m", "ONT Device", "Router"],
      'maintenance': ["Router - AC1200", "Ethernet Cable"],
      'repair': ["Signal Meter", "Fiber Splitter"],
    }
    return materialMap[type] || []
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === "all" || task.type === typeFilter
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
    const matchesStatus = statusFilter === "all" || task.status === statusFilter

    return matchesSearch && matchesType && matchesPriority && matchesStatus
  })

  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter((task) => task.status === status)
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
      case "paused":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
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

  const handleStartTask = async (taskId: string) => {
    try {
      // Update status via API - use correct API status value
      await taskApi.updateStatus(taskId, "In Progress")
      
      // Update local state
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, status: "in_progress", startedAt: new Date().toISOString() } : task,
        ),
      )
      setSuccessMessage("Task started successfully")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Failed to start task:", error)
      setError("Failed to start task. Please try again.")
      setTimeout(() => setError(null), 5000)
    }
  }

  const handlePauseTask = async (taskId: string) => {
    try {
      // Since API doesn't support "Paused", we'll set it back to "Pending"
      await taskApi.updateStatus(taskId, "Pending")
      
      // Update local state to show paused in UI
      setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: "paused" } : task)))
      setSuccessMessage("Task paused (set to Pending)")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Failed to pause task:", error)
      setError("Failed to pause task. Please try again.")
      setTimeout(() => setError(null), 5000)
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    try {
      // Update status via API - use correct API status value
      await taskApi.updateStatus(taskId, "Completed")
      
      // Update local state
      setTasks(
        tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status: "completed",
                completedAt: new Date().toISOString(),
                completionNotes: completionNotes || "Task completed successfully",
              }
            : task,
        ),
      )
      setCompletionNotes("")
      setSuccessMessage("Task completed successfully")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Failed to complete task:", error)
      setError("Failed to complete task. Please try again.")
      setTimeout(() => setError(null), 5000)
    }
  }

  const handleUpdateNotes = async (taskId: string) => {
    try {
      // You can extend the API to support updating notes
      // For now, just update local state
      setTasks(tasks.map((task) => (task.id === taskId ? { ...task, workNotes: workNotes } : task)))
      setWorkNotes("")
      console.log(`Work notes updated for task ${taskId}`)
    } catch (error) {
      console.error("Failed to update notes:", error)
      setError("Failed to update notes")
    }
  }

  const handleNavigate = (location: any) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`
    window.open(url, "_blank")
  }

  const handleCallCustomer = (phone: string) => {
    window.open(`tel:${phone}`)
  }

  const handleApplyChanges = async () => {
    try {
      console.log("All changes have been automatically applied via API calls")
      setHasChanges(false)
    } catch (error) {
      console.error("Failed to apply changes:", error)
      setError("Failed to save changes")
    }
  }

  const taskStats = {
    total: tasks.length,
    assigned: tasks.filter((t) => t.status === "assigned").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    paused: tasks.filter((t) => t.status === "paused").length,
  }

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const result = await taskApi.getAssigned(user?.user_id)
        
        if (result?.data && Array.isArray(result.data)) {
          // Transform API data to component format
          const transformedTasks: Task[] = result.data.map((apiTask: any) => {
            const customerInfo = generateCustomerInfo(apiTask.taskId)
            const taskType = mapApiCategory(apiTask.category)
            
            return {
              id: apiTask.taskId,
              ticketNumber: apiTask.taskId,
              type: taskType,
              title: apiTask.title,
              description: apiTask.description,
              customer: customerInfo,
              priority: mapApiPriority(apiTask.priority),
              status: mapApiStatus(apiTask.status),
              assignedDate: apiTask.createdAt,
              dueDate: apiTask.dueDate,
              estimatedDuration: "2 hours", // Default value
              location: generateLocation(),
              materials: generateMaterials(taskType),
              notes: `Task created by: ${apiTask.createdBy}`,
              createdBy: apiTask.createdBy,
              startedAt: undefined,
              completedAt: undefined,
              workNotes: undefined,
              completionNotes: undefined,
            }
          })
          
          setTasks(transformedTasks)
        } else {
          setTasks([]) // Set empty array if no data
        }
      } catch (error) {
        console.error("Failed to fetch tasks:", error)
        setError("Failed to load tasks")
        setTasks([]) // Set empty array on error
      } finally {
        setLoading(false)
      }
    }

    if (user?.user_id) {
      fetchTasks()
    }
  }, [user?.user_id])

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading tasks...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-500">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-green-800">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-500">Manage your assigned tasks and track progress</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Total Tasks</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{taskStats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Assigned</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{taskStats.assigned}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">In Progress</CardTitle>
            <Play className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{taskStats.inProgress}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{taskStats.completed}</div>
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
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Task Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="installation">Installation</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="repair">Repair</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
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
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Tasks ({taskStats.assigned + taskStats.inProgress + taskStats.paused})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({taskStats.completed})</TabsTrigger>
          <TabsTrigger value="all">All Tasks ({taskStats.total})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <TaskList
            tasks={getTasksByStatus("assigned").concat(getTasksByStatus("in_progress")).concat(getTasksByStatus("paused"))}
            onStartTask={handleStartTask}
            onPauseTask={handlePauseTask}
            onCompleteTask={handleCompleteTask}
            onNavigate={handleNavigate}
            onCallCustomer={handleCallCustomer}
            onViewDetails={(task: Task) => {
              setSelectedTask(task)
              setShowTaskDialog(true)
            }}
            getPriorityColor={getPriorityColor}
            getStatusColor={getStatusColor}
            getTaskTypeIcon={getTaskTypeIcon}
          />
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <TaskList
            tasks={getTasksByStatus("completed")}
            onStartTask={handleStartTask}
            onPauseTask={handlePauseTask}
            onCompleteTask={handleCompleteTask}
            onNavigate={handleNavigate}
            onCallCustomer={handleCallCustomer}
            onViewDetails={(task: Task) => {
              setSelectedTask(task)
              setShowTaskDialog(true)
            }}
            getPriorityColor={getPriorityColor}
            getStatusColor={getStatusColor}
            getTaskTypeIcon={getTaskTypeIcon}
          />
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <TaskList
            tasks={filteredTasks}
            onStartTask={handleStartTask}
            onPauseTask={handlePauseTask}
            onCompleteTask={handleCompleteTask}
            onNavigate={handleNavigate}
            onCallCustomer={handleCallCustomer}
            onViewDetails={(task: Task) => {
              setSelectedTask(task)
              setShowTaskDialog(true)
            }}
            getPriorityColor={getPriorityColor}
            getStatusColor={getStatusColor}
            getTaskTypeIcon={getTaskTypeIcon}
          />
        </TabsContent>
      </Tabs>

      {/* Task Details Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Task Details - {selectedTask?.ticketNumber}</DialogTitle>
            <DialogDescription>Complete task information and actions</DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <TaskDetailsModal
              task={selectedTask}
              workNotes={workNotes}
              setWorkNotes={setWorkNotes}
              completionNotes={completionNotes}
              setCompletionNotes={setCompletionNotes}
              onUpdateNotes={() => handleUpdateNotes(selectedTask.id)}
              onStartTask={() => handleStartTask(selectedTask.id)}
              onPauseTask={() => handlePauseTask(selectedTask.id)}
              onCompleteTask={() => handleCompleteTask(selectedTask.id)}
              onNavigate={() => handleNavigate(selectedTask.location)}
              onCallCustomer={() => handleCallCustomer(selectedTask.customer.phone)}
              getPriorityColor={getPriorityColor}
              getStatusColor={getStatusColor}
              getTaskTypeIcon={getTaskTypeIcon}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Task List Component
function TaskList({
  tasks,
  onStartTask,
  onPauseTask,
  onCompleteTask,
  onNavigate,
  onCallCustomer,
  onViewDetails,
  getPriorityColor,
  getStatusColor,
  getTaskTypeIcon,
}: any) {
  return (
    <div className="space-y-4">
      {tasks.map((task: any) => (
        <Card key={task.id} className="hover:shadow-md transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-3 mb-3">
                  <div className="flex items-center space-x-2">
                    {getTaskTypeIcon(task.type)}
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                    <Badge variant="outline">{task.ticketNumber}</Badge>
                    <Badge className="bg-blue-100 text-blue-800 capitalize">{task.type}</Badge>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <p>{task.description}</p>
                  <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{task.customer.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>{task.customer.phone}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{task.customer.address}</span>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {new Date(task.dueDate).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Est: {task.estimatedDuration}</span>
                    </div>
                  </div>
                  {task.notes && (
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span className="italic">{task.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col space-y-2 lg:ml-4">
                <Badge className={getStatusColor(task.status)}>{task.status.replace("_", " ").toUpperCase()}</Badge>

                <div className="flex flex-wrap gap-2">
                  {task.status === "assigned" && (
                    <Button size="sm" onClick={() => onStartTask(task.id)} className="bg-blue-600 hover:bg-blue-700">
                      <Play className="h-4 w-4 mr-1" />
                      Start
                    </Button>
                  )}

                  {task.status === "in_progress" && (
                    <>
                      <Button size="sm" onClick={() => onPauseTask(task.id)} variant="outline">
                        <Pause className="h-4 w-4 mr-1" />
                        Pause
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onCompleteTask(task.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    </>
                  )}

                  {task.status === "paused" && (
                    <>
                      <Button size="sm" onClick={() => onStartTask(task.id)} className="bg-blue-600 hover:bg-blue-700">
                        <Play className="h-4 w-4 mr-1" />
                        Resume
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onCompleteTask(task.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    </>
                  )}

                  <Button size="sm" variant="outline" onClick={() => onNavigate(task.location)}>
                    <Navigation className="h-4 w-4 mr-1" />
                    Navigate
                  </Button>

                  <Button size="sm" variant="outline" onClick={() => onCallCustomer(task.customer.phone)}>
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </Button>

                  <Button size="sm" variant="outline" onClick={() => onViewDetails(task)}>
                    <FileText className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {tasks.length === 0 && (
        <div className="text-center text-gray-500 py-8">No tasks found matching the current filters.</div>
      )}
    </div>
  )
}

// Task Details Modal Component
function TaskDetailsModal({
  task,
  workNotes,
  setWorkNotes,
  completionNotes,
  setCompletionNotes,
  onUpdateNotes,
  onStartTask,
  onPauseTask,
  onCompleteTask,
  onNavigate,
  onCallCustomer,
  getPriorityColor,
  getStatusColor,
  getTaskTypeIcon,
}: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {getTaskTypeIcon(task.type)}
        <span className="font-medium">{task.title}</span>
        <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
        <Badge className={getStatusColor(task.status)}>{task.status.replace("_", " ").toUpperCase()}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Customer Information</Label>
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span>{task.customer.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{task.customer.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{task.customer.address}</span>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Task Information</Label>
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="capitalize">{task.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span>{task.estimatedDuration}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Due Date:</span>
              <span>{new Date(task.dueDate).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium">Description</Label>
        <p className="mt-2 text-sm text-gray-600">{task.description}</p>
      </div>

      {task.materials && task.materials.length > 0 && (
        <div>
          <Label className="text-sm font-medium">Required Materials</Label>
          <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
            {task.materials.map((material: string, index: number) => (
              <li key={index}>{material}</li>
            ))}
          </ul>
        </div>
      )}

      {task.notes && (
        <div>
          <Label className="text-sm font-medium">Initial Notes</Label>
          <p className="mt-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">{task.notes}</p>
        </div>
      )}

      {task.status === "in_progress" && (
        <div>
          <Label htmlFor="workNotes" className="text-sm font-medium">
            Work Notes
          </Label>
          <Textarea
            id="workNotes"
            value={workNotes}
            onChange={(e) => setWorkNotes(e.target.value)}
            placeholder="Add work progress notes..."
            className="mt-2"
            rows={3}
          />
          <Button onClick={onUpdateNotes} className="mt-2" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Update Notes
          </Button>
        </div>
      )}

      {task.status === "in_progress" && (
        <div>
          <Label htmlFor="completionNotes" className="text-sm font-medium">
            Completion Notes
          </Label>
          <Textarea
            id="completionNotes"
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            placeholder="Add completion details..."
            className="mt-2"
            rows={3}
          />
        </div>
      )}

      {task.workNotes && (
        <div>
          <Label className="text-sm font-medium">Work Progress</Label>
          <p className="mt-2 text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">{task.workNotes}</p>
        </div>
      )}

      {task.completionNotes && (
        <div>
          <Label className="text-sm font-medium">Completion Details</Label>
          <p className="mt-2 text-sm text-gray-600 bg-green-50 p-3 rounded-lg">{task.completionNotes}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-4 border-t">
        {task.status === "assigned" && (
          <Button onClick={onStartTask} className="bg-blue-600 hover:bg-blue-700">
            <Play className="h-4 w-4 mr-2" />
            Start Task
          </Button>
        )}

        {task.status === "in_progress" && (
          <>
            <Button onClick={onPauseTask} variant="outline">
              <Pause className="h-4 w-4 mr-2" />
              Pause Task
            </Button>
            <Button onClick={onCompleteTask} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Task
            </Button>
          </>
        )}

        {task.status === "paused" && (
          <>
            <Button onClick={onStartTask} className="bg-blue-600 hover:bg-blue-700">
              <Play className="h-4 w-4 mr-2" />
              Resume Task
            </Button>
            <Button onClick={onCompleteTask} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Task
            </Button>
          </>
        )}

        <Button onClick={onNavigate} variant="outline">
          <Navigation className="h-4 w-4 mr-2" />
          Navigate
        </Button>

        <Button onClick={onCallCustomer} variant="outline">
          <Phone className="h-4 w-4 mr-2" />
          Call Customer
        </Button>

        <Button variant="outline">
          <Camera className="h-4 w-4 mr-2" />
          Add Photo
        </Button>
      </div>
    </div>
  )
}