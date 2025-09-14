"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  ClipboardList,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Calendar,
  Search,
  Eye,
  Edit,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function StaffTasksPage() {
  const [priorityRange, setPriorityRange] = useState([1, 5])
  const [progressRange, setProgressRange] = useState([0, 100])
  const [searchTerm, setSearchTerm] = useState("")
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    assignedTo: "",
    dueDate: "",
    category: "",
  })
  const { toast } = useToast()

  const tasks = [
    {
      id: "TSK-2024-001",
      title: "Review operator onboarding documents",
      description: "Review and approve KYC documents for City Networks operator registration",
      priority: "high",
      status: "in-progress",
      progress: 60,
      assignedTo: "John Smith",
      assignedBy: "Admin",
      createdDate: "2024-01-20",
      dueDate: "2024-01-25",
      category: "Onboarding",
      estimatedHours: 4,
      actualHours: 2.5,
    },
    {
      id: "TSK-2024-002",
      title: "Handle customer complaint escalation",
      description: "Resolve billing dispute for customer ID CUST001234",
      priority: "high",
      status: "pending",
      progress: 0,
      assignedTo: "Sarah Johnson",
      assignedBy: "Support Lead",
      createdDate: "2024-01-22",
      dueDate: "2024-01-24",
      category: "Support",
      estimatedHours: 2,
      actualHours: 0,
    },
    {
      id: "TSK-2024-003",
      title: "Vendor performance evaluation",
      description: "Quarterly performance review for TechGear Solutions vendor",
      priority: "medium",
      status: "completed",
      progress: 100,
      assignedTo: "Mike Wilson",
      assignedBy: "Marketplace Admin",
      createdDate: "2024-01-15",
      dueDate: "2024-01-30",
      category: "Vendor Management",
      estimatedHours: 6,
      actualHours: 5.5,
    },
    {
      id: "TSK-2024-004",
      title: "Update operator billing configuration",
      description: "Configure new billing plan for Metro Fiber operator",
      priority: "medium",
      status: "in-progress",
      progress: 30,
      assignedTo: "Lisa Chen",
      assignedBy: "Technical Lead",
      createdDate: "2024-01-18",
      dueDate: "2024-01-28",
      category: "Technical",
      estimatedHours: 3,
      actualHours: 1,
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "pending":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800"
      case "pending":
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Support":
        return "bg-blue-100 text-blue-800"
      case "Onboarding":
        return "bg-purple-100 text-purple-800"
      case "Technical":
        return "bg-orange-100 text-orange-800"
      case "Vendor Management":
        return "bg-indigo-100 text-indigo-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.description || !newTask.assignedTo) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Task Created",
      description: "New task has been created and assigned successfully.",
    })

    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      assignedTo: "",
      dueDate: "",
      category: "",
    })
  }

  const handleTaskAction = (taskId: string, action: string) => {
    toast({
      title: `Task ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      description: `Task ${taskId} has been ${action}.`,
    })
  }

  const myTasks = tasks.filter((task) => task.assignedTo === "John Smith")
  const allTasks = tasks

  return (
    <DashboardLayout title="My Tasks" description="Manage your assigned tasks and create new ones">
      <div className="space-y-6">
        <Tabs defaultValue="my-tasks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="my-tasks">My Tasks ({myTasks.length})</TabsTrigger>
            <TabsTrigger value="all-tasks">All Tasks ({allTasks.length})</TabsTrigger>
            <TabsTrigger value="create">Create Task</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="my-tasks" className="space-y-6">
            {/* Task Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Tasks</CardTitle>
                <CardDescription>Filter tasks by priority, progress, and search terms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>
                      Priority Range: {priorityRange[0]} - {priorityRange[1]}
                    </Label>
                    <Slider
                      value={priorityRange}
                      onValueChange={setPriorityRange}
                      max={5}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Progress Range: {progressRange[0]}% - {progressRange[1]}%
                    </Label>
                    <Slider
                      value={progressRange}
                      onValueChange={setProgressRange}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <Button variant="outline">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* My Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {myTasks.map((task) => (
                <Card key={task.id} className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <CardTitle className="text-lg">{task.title}</CardTitle>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </Badge>
                        </div>
                        <CardDescription>{task.description}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(task.status)}
                        <Badge className={getStatusColor(task.status)}>
                          {task.status.replace("-", " ").charAt(0).toUpperCase() +
                            task.status.replace("-", " ").slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Category:</span>
                        <Badge variant="outline" className={`ml-2 ${getCategoryColor(task.category)}`}>
                          {task.category}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-gray-500">Due Date:</span>
                        <span className="ml-2 font-medium">{formatDate(task.dueDate)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Estimated:</span>
                        <span className="ml-2 font-medium">{task.estimatedHours}h</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Actual:</span>
                        <span className="ml-2 font-medium">{task.actualHours}h</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-medium">{task.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1">
                        <Play className="h-3 w-3 mr-1" />
                        Start
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        <Pause className="h-3 w-3 mr-1" />
                        Pause
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="all-tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Tasks</CardTitle>
                <CardDescription>Overview of all tasks in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{task.title}</div>
                            <div className="text-sm text-gray-500">{task.id}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{task.assignedTo}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getCategoryColor(task.category)}>
                            {task.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(task.status)}
                            <Badge className={getStatusColor(task.status)}>
                              {task.status.replace("-", " ").charAt(0).toUpperCase() +
                                task.status.replace("-", " ").slice(1)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${task.progress}%` }} />
                            </div>
                            <span className="text-sm font-medium">{task.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(task.dueDate)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <RotateCcw className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Task</CardTitle>
                <CardDescription>Assign a new task to a team member</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Task Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter task title"
                      value={newTask.title}
                      onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newTask.category}
                      onValueChange={(value) => setNewTask((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Support">Support</SelectItem>
                        <SelectItem value="Onboarding">Onboarding</SelectItem>
                        <SelectItem value="Technical">Technical</SelectItem>
                        <SelectItem value="Vendor Management">Vendor Management</SelectItem>
                        <SelectItem value="Quality Control">Quality Control</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value) => setNewTask((prev) => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assignedTo">Assign To *</Label>
                    <Select
                      value={newTask.assignedTo}
                      onValueChange={(value) => setNewTask((prev) => ({ ...prev, assignedTo: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select team member" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="John Smith">John Smith (Support Agent)</SelectItem>
                        <SelectItem value="Sarah Johnson">Sarah Johnson (Onboarding Manager)</SelectItem>
                        <SelectItem value="Mike Wilson">Mike Wilson (Technical Lead)</SelectItem>
                        <SelectItem value="Lisa Chen">Lisa Chen (Sales Manager)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask((prev) => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed task description..."
                    rows={4}
                    value={newTask.description}
                    onChange={(e) => setNewTask((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="flex space-x-4">
                  <Button onClick={handleCreateTask} className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Task
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Later
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-blue-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Total Tasks</CardTitle>
                  <div className="p-2 bg-indigo-500 rounded-lg">
                    <ClipboardList className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{tasks.length}</div>
                  <p className="text-xs text-gray-500 mt-1">All time</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Completed</CardTitle>
                  <div className="p-2 bg-green-500 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {tasks.filter((t) => t.status === "completed").length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Successfully completed</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">In Progress</CardTitle>
                  <div className="p-2 bg-yellow-500 rounded-lg">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {tasks.filter((t) => t.status === "in-progress").length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Currently working</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Avg Progress</CardTitle>
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length)}%
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Overall progress</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Task Distribution</CardTitle>
                <CardDescription>Breakdown of tasks by category and priority</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">By Category</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Support</span>
                        <span className="font-medium">{tasks.filter((t) => t.category === "Support").length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Onboarding</span>
                        <span className="font-medium">{tasks.filter((t) => t.category === "Onboarding").length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Technical</span>
                        <span className="font-medium">{tasks.filter((t) => t.category === "Technical").length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Vendor Management</span>
                        <span className="font-medium">
                          {tasks.filter((t) => t.category === "Vendor Management").length}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">By Priority</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">High Priority</span>
                        <span className="font-medium text-red-600">
                          {tasks.filter((t) => t.priority === "high").length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Medium Priority</span>
                        <span className="font-medium text-yellow-600">
                          {tasks.filter((t) => t.priority === "medium").length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Low Priority</span>
                        <span className="font-medium text-green-600">
                          {tasks.filter((t) => t.priority === "low").length}
                        </span>
                      </div>
                    </div>
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
