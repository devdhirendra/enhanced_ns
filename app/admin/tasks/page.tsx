"use client"

import { useEffect, useState } from "react"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  Pause,
  Users,
  TrendingUp,
  RefreshCw,
  BarChart3,
  MoreHorizontal,
  Trash2,
  PlayCircle,
  UserCheck,
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { taskApi } from "@/lib/api"

interface AdminTask {
  id: string;
  taskId: string;
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Pending" | "In Progress" | "Completed" | "Cancelled" | "On Hold";
  progress: number;
  assignRole: string;
  assignTo: string;
  assignFor: string | null;
  createdDate: string;
  dueDate: string;
  category: string;
  estimatedHours: number;
  actualHours: number;
  department: string;
  OperatorName: string;
  operaterId: string;
  createdBy: string;
  AdminName: string;
  technicianName?: string;
  customerName?: string;
  staffName?: string;
  staffId?: string,
  technianId? :string,
}
interface TaskStats {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  pendingTasks: number
  overdueTasks: number
  highPriorityTasks: number
}

const staffMembers = [
  { id: "3812e5bf-1e42-4aa4-8ae8-095cff15d647", name: "John Smith", role: "Technical Lead" },
  { id: "bb70302c-e47b-4a25-b0cd-635b63404029", name: "Sarah Johnson", role: "Field Engineer" },
  { id: "admin-001", name: "Mike Wilson", role: "System Admin" },
  { id: "support-001", name: "Lisa Chen", role: "Support Manager" },
  { id: "sales-001", name: "David Brown", role: "Sales Manager" },
]


export default function AdminTasksPage() {
   const {user} = useAuth()
  const [tasks, setTasks] = useState<AdminTask[]>([])
  const [loading, setLoading] = useState(false)
  const [priorityRange, setPriorityRange] = useState([1, 3])
  const [progressRange, setProgressRange] = useState([0, 100])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<AdminTask | null>(null)

  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [assignmentType, setAssignmentType] = useState<"technician" | "staff">("technician")
  const [selectedTaskForAssignment, setSelectedTaskForAssignment] = useState<AdminTask | null>(null)
  const [selectedAssignee, setSelectedAssignee] = useState("")

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "Medium" as const,
    assignTo: "",
    assignFor: "",
    dueDate: "",
    category: "Fiber Installation" as const,
    estimatedHours: 8,
    department: "Technical" as const,
  })
  const { toast } = useToast()



useEffect(() => {
 

  if (user?.user_id) {
    console.log(user.user_id)
    fetchTasks(user?.user_id);
  }
}, [user]);  // ✅ correct


const fetchTasks = async (id: string) => {
  try {
    const result = await taskApi.getCreated(id);
    console.log(result?.data);
    
    // Transform API data to match your component structure
   const transformedTasks = result?.data.map((task: any) => ({
  id: task.taskId, // React key
  taskId: task.taskId,
  title: task.title,
  description: task.description,
  category: task.category,
  priority: task.priority,
  status: task.status,
  createdDate: task.createdAt,
  updatedDate: task.updatedAt,
  dueDate: task.dueDate,

  // progress calculation
  progress:
    task.status === "Completed" ? 100 :
    task.status === "In Progress" ? 50 : 0,

  // assignment
  assignTo: task.assignTo,
  assignFor: task.assignFor || "",
  assignRole: task.assignRole || "",

  // role-based fields
  // ✅ Operator
  operaterId: task.operaterId || null,
  OperatorName: task.OperatorName || "",
  OperatorNotes: task.OperatorNotes || "",

  // ✅ Staff
  staffId: task.staffId || null,
  staffName: task.staffName || "",
  staffNotes: task.staffNotes || "",

  // ✅ Technician
  technianId: task.technianId || null,
  technicianName: task.technicianName || "",
  technicianNote: task.technicianNote || "",

  // ✅ Admin
  adminID: task.adminID || null,
  AdminName: task.AdminName || "",

  // ✅ Customer (when operator or staff assigns)
  customerId: task.customerId || null,
  customerName: task.customerName || "",
  customerFeedback: task.customerFeedback || "",
  CustomerRate: task.CustomerRate || 0,

  // Defaults (since not in API directly)
  estimatedHours: task.estimatedHours || 8,
  actualHours: task.actualHours || 0,
  department: task.department || "Technical",

  // creator info
  createdBy: task.createdBy,
}));

    
    setTasks(transformedTasks);
  } catch (err) {
    console.error(err);
  }
};
   
  const taskStats: TaskStats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter((t) => t.status === "Completed").length,
    inProgressTasks: tasks.filter((t) => t.status === "In Progress").length,
    pendingTasks: tasks.filter((t) => t.status === "Pending").length,
    overdueTasks: tasks.filter((t) => new Date(t.dueDate) < new Date() && t.status !== "Completed").length,
    highPriorityTasks: tasks.filter((t) => t.priority === "High").length,
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "In Progress":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "Pending":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "On Hold":
        return <Pause className="h-4 w-4 text-gray-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "On Hold":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 border-red-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.description || !newTask.assignTo) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const task: AdminTask = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      status: "Pending",
      progress: 0,
      assignTo: newTask.assignTo,
      assignFor: newTask.assignFor || "general-task",
      createdDate: new Date().toISOString(),
      dueDate: newTask.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      category: newTask.category,
      estimatedHours: newTask.estimatedHours,
      actualHours: 0,
      department: newTask.department,
    }

    setTasks((prev) => [task, ...prev])
    setNewTask({
      title: "",
      description: "",
      priority: "Medium",
      assignTo: "",
      assignFor: "",
      dueDate: "",
      category: "Fiber Installation",
      estimatedHours: 8,
      department: "Technical",
    })
    setIsCreateDialogOpen(false)
    toast({
      title: "Success",
      description: "Task created successfully",
    })
  }

  const handleViewTask = (task: AdminTask) => {
    setSelectedTask(task)
    setIsViewDialogOpen(true)
  }

  const handleEditTask = (task: AdminTask) => {
    setSelectedTask(task)
    setIsEditDialogOpen(true)
  }

  const handleUpdateTask = () => {
    if (!selectedTask) return

    setTasks((prev) => prev.map((task) => (task.id === selectedTask.id ? selectedTask : task)))
    setIsEditDialogOpen(false)
    setSelectedTask(null)
    toast({
      title: "Success",
      description: "Task updated successfully",
    })
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId))
    toast({
      title: "Success",
      description: "Task deleted successfully",
    })
  }

  const handleStatusUpdate = (taskId: string, newStatus: AdminTask["status"]) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: newStatus,
              progress: newStatus === "Completed" ? 100 : task.progress,
            }
          : task,
      ),
    )
    toast({
      title: "Success",
      description: `Task status updated to ${newStatus}`,
    })
  }

  const handleAssignToTechnician = (task: AdminTask) => {
    setSelectedTaskForAssignment(task)
    setAssignmentType("technician")
    setSelectedAssignee("")
    setIsAssignDialogOpen(true)
  }

  const handleAssignToStaff = (task: AdminTask) => {
    setSelectedTaskForAssignment(task)
    setAssignmentType("staff")
    setSelectedAssignee("")
    setIsAssignDialogOpen(true)
  }

  const handleConfirmAssignment = () => {
    if (!selectedTaskForAssignment || !selectedAssignee) {
      toast({
        title: "Error",
        description: "Please select an assignee",
        variant: "destructive",
      })
      return
    }

    setTasks((prev) =>
      prev.map((task) => (task.id === selectedTaskForAssignment.id ? { ...task, assignTo: selectedAssignee } : task)),
    )

    const assigneeName = staffMembers.find((member) => member.id === selectedAssignee)?.name
    toast({
      title: "Success",
      description: `Task assigned to ${assigneeName} successfully`,
    })

    setIsAssignDialogOpen(false)
    setSelectedTaskForAssignment(null)
    setSelectedAssignee("")
  }

  const getFilteredStaffMembers = () => {
    if (assignmentType === "technician") {
      return staffMembers.filter(
        (member) =>
          member.role.toLowerCase().includes("technical") ||
          member.role.toLowerCase().includes("engineer") ||
          member.role.toLowerCase().includes("field"),
      )
    } else {
      return staffMembers.filter(
        (member) =>
          member.role.toLowerCase().includes("admin") ||
          member.role.toLowerCase().includes("manager") ||
          member.role.toLowerCase().includes("support"),
      )
    }
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = selectedDepartment === "all" || task.department === selectedDepartment
    const matchesStatus = selectedStatus === "all" || task.status.toLowerCase().replace(" ", "-") === selectedStatus
    const matchesPriority =
      priorityRange[0] <= (task.priority === "High" ? 3 : task.priority === "Medium" ? 2 : 1) &&
      (task.priority === "High" ? 3 : task.priority === "Medium" ? 2 : 1) <= priorityRange[1]
    const matchesProgress = task.progress >= progressRange[0] && task.progress <= progressRange[1]

    return matchesSearch && matchesDepartment && matchesStatus && matchesPriority && matchesProgress
  })



  return (
    <DashboardLayout title="Task Management" description="Manage administrative tasks and assignments">
      <div className="space-y-6">
        {/* Task Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Tasks</CardTitle>
              <div className="p-2 bg-blue-500 rounded-lg">
                <ClipboardList className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{taskStats.totalTasks}</div>
              <p className="text-xs text-gray-500 mt-1">All tasks</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Completed</CardTitle>
              <div className="p-2 bg-green-500 rounded-lg">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{taskStats.completedTasks}</div>
              <p className="text-xs text-gray-500 mt-1">Successfully done</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">In Progress</CardTitle>
              <div className="p-2 bg-yellow-500 rounded-lg">
                <Clock className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{taskStats.inProgressTasks}</div>
              <p className="text-xs text-gray-500 mt-1">Currently active</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Pending</CardTitle>
              <div className="p-2 bg-purple-500 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{taskStats.pendingTasks}</div>
              <p className="text-xs text-gray-500 mt-1">Awaiting start</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Overdue</CardTitle>
              <div className="p-2 bg-red-500 rounded-lg">
                <Calendar className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{taskStats.overdueTasks}</div>
              <p className="text-xs text-gray-500 mt-1">Past due date</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">High Priority</CardTitle>
              <div className="p-2 bg-orange-500 rounded-lg">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{taskStats.highPriorityTasks}</div>
              <p className="text-xs text-gray-500 mt-1">Urgent tasks</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all-tasks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all-tasks">All Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="all-tasks" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Tasks</CardTitle>
                <CardDescription>Filter and search through administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">Search Tasks</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Search by title or description..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="technician">Admin</SelectItem>
                        <SelectItem value="staff">Technical</SelectItem>
                        <SelectItem value="Operator">Support</SelectItem>
                        <SelectItem value="Vendpor">Sales</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button variant="outline" className="w-full bg-transparent">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tasks Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Administrative Tasks</CardTitle>
                    <CardDescription>Manage all administrative tasks and assignments</CardDescription>
                  </div>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Task
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create New Administrative Task</DialogTitle>
                        <DialogDescription>Create and assign a new task to team members</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
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
                              onValueChange={(value) => setNewTask((prev) => ({ ...prev, category: value as any }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Fiber Installation">Fiber Installation</SelectItem>
                                <SelectItem value="System Management">System Management</SelectItem>
                                <SelectItem value="User Management">User Management</SelectItem>
                                <SelectItem value="Operations">Operations</SelectItem>
                                <SelectItem value="Analytics">Analytics</SelectItem>
                                <SelectItem value="Security">Security</SelectItem>
                                <SelectItem value="Maintenance">Maintenance</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select
                              value={newTask.priority}
                              onValueChange={(value) => setNewTask((prev) => ({ ...prev, priority: value as any }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="department">Department</Label>
                            <Select
                              value={newTask.department}
                              onValueChange={(value) => setNewTask((prev) => ({ ...prev, department: value as any }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="operator">Operator</SelectItem>
                                <SelectItem value="techinican">Techinican</SelectItem>
                                <SelectItem value="staff">Staff</SelectItem>
                                <SelectItem value="vendor">Vender</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="estimatedHours">Estimated Hours</Label>
                            <Input
                              id="estimatedHours"
                              type="number"
                              min="1"
                              max="100"
                              value={newTask.estimatedHours}
                              onChange={(e) =>
                                setNewTask((prev) => ({
                                  ...prev,
                                  estimatedHours: Number.parseInt(e.target.value) || 8,
                                }))
                              }
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="assignTo">Assign To *</Label>
                            <Select
                              value={newTask.assignTo}
                              onValueChange={(value) => setNewTask((prev) => ({ ...prev, assignTo: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select team member" />
                              </SelectTrigger>
                              <SelectContent>
                                {staffMembers.map((member) => (
                                  <SelectItem key={member.id} value={member.id}>
                                    {member.name} ({member.role})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="assignFor">Assign For</Label>
                            <Input
                              id="assignFor"
                              placeholder="Customer ID or reference"
                              value={newTask.assignFor}
                              onChange={(e) => setNewTask((prev) => ({ ...prev, assignFor: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="dueDate">Due Date</Label>
                          <Input
                            id="dueDate"
                            type="datetime-local"
                            value={newTask.dueDate}
                            onChange={(e) => setNewTask((prev) => ({ ...prev, dueDate: e.target.value }))}
                          />
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
                          <Button
                            variant="outline"
                            className="flex-1 bg-transparent"
                            onClick={() => setIsCreateDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{task.title}</div>
                              <div className="text-sm text-gray-500">{task.category}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <div className="flex flex-col">
                                {task.assignRole === "operator" && (
                                    <>
                                    <span className="text-sm font-medium">{task.assignRole}</span>
                                    <span className="text-xs text-gray-600">{task.operaterId}</span>
                                    </>
                                )}
                                {task.assignRole === "staff" && (
                                    <>
                                    <span className="text-sm font-medium">{task.assignRole}</span>
                                    <span className="text-xs text-gray-600">{task.staffId}</span>
                                    </>
                                )}
                                {task.assignRole === "technician" && (
                                    <>
                                    <span className="text-sm font-medium">{task.assignRole}</span>
                                    <span className="text-xs text-gray-600">{task.technianId}</span>
                                    {console.log(task)}
                                    </>
                                )}
                                </div>
                            </div>
                            </TableCell>

                          <TableCell>
                            <Badge variant="outline" className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(task.status)}
                              <Badge variant="outline" className={getStatusColor(task.status)}>
                                {task.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{task.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${task.progress}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{formatDate(task.dueDate)}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{task.department}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleViewTask(task)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditTask(task)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Task
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleAssignToTechnician(task)}>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Assign to Technician
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAssignToStaff(task)}>
                                  <Users className="mr-2 h-4 w-4" />
                                  Assign to Staff
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleStatusUpdate(task.id, "In Progress")}>
                                  <PlayCircle className="mr-2 h-4 w-4" />
                                  Start Task
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusUpdate(task.id, "Completed")}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Mark Complete
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusUpdate(task.id, "On Hold")}>
                                  <Pause className="mr-2 h-4 w-4" />
                                  Put On Hold
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleDeleteTask(task.id)} className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Task
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


         
        </Tabs>

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Task Details</DialogTitle>
              <DialogDescription>View complete task information</DialogDescription>
            </DialogHeader>
            {selectedTask && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Title</Label>
                    <p className="text-sm font-medium">{selectedTask.title}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Category</Label>
                    <p className="text-sm">{selectedTask.category}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Priority</Label>
                    <Badge variant="outline" className={getPriorityColor(selectedTask.priority)}>
                      {selectedTask.priority}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Status</Label>
                    <Badge variant="outline" className={getStatusColor(selectedTask.status)}>
                      {selectedTask.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Progress</Label>
                    <p className="text-sm font-medium">{selectedTask.progress}%</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Assigned To</Label>
                    <p className="text-sm">
                      {staffMembers.find((m) => m.id === selectedTask.assignTo)?.name || selectedTask.assignTo}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Department</Label>
                    <p className="text-sm">{selectedTask.department}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Due Date</Label>
                    <p className="text-sm">{formatDate(selectedTask.dueDate)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Estimated Hours</Label>
                    <p className="text-sm">{selectedTask.estimatedHours}h</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Description</Label>
                  <p className="text-sm mt-1">{selectedTask.description}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
              <DialogDescription>Update task information</DialogDescription>
            </DialogHeader>
            {selectedTask && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Task Title *</Label>
                    <Input
                      id="edit-title"
                      value={selectedTask.title}
                      onChange={(e) => setSelectedTask((prev) => (prev ? { ...prev, title: e.target.value } : null))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Category</Label>
                    <Select
                      value={selectedTask.category}
                      onValueChange={(value) =>
                        setSelectedTask((prev) => (prev ? { ...prev, category: value as any } : null))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fiber Installation">Fiber Installation</SelectItem>
                        <SelectItem value="System Management">System Management</SelectItem>
                        <SelectItem value="User Management">User Management</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                        <SelectItem value="Analytics">Analytics</SelectItem>
                        <SelectItem value="Security">Security</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-priority">Priority</Label>
                    <Select
                      value={selectedTask.priority}
                      onValueChange={(value) =>
                        setSelectedTask((prev) => (prev ? { ...prev, priority: value as any } : null))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select
                      value={selectedTask.status}
                      onValueChange={(value) =>
                        setSelectedTask((prev) => (prev ? { ...prev, status: value as any } : null))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-progress">Progress (%)</Label>
                    <Input
                      id="edit-progress"
                      type="number"
                      min="0"
                      max="100"
                      value={selectedTask.progress}
                      onChange={(e) =>
                        setSelectedTask((prev) =>
                          prev ? { ...prev, progress: Number.parseInt(e.target.value) || 0 } : null,
                        )
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    rows={4}
                    value={selectedTask.description}
                    onChange={(e) =>
                      setSelectedTask((prev) => (prev ? { ...prev, description: e.target.value } : null))
                    }
                  />
                </div>
                <div className="flex space-x-4">
                  <Button onClick={handleUpdateTask} className="flex-1">
                    <Edit className="h-4 w-4 mr-2" />
                    Update Task
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Assign Task to {assignmentType === "technician" ? "Technician" : "Staff"}</DialogTitle>
              <DialogDescription>
                Select a {assignmentType} to assign "{selectedTaskForAssignment?.title}" to.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="assignee">
                  Select {assignmentType === "technician" ? "Technician" : "Staff Member"}
                </Label>
                <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Choose a ${assignmentType}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {getFilteredStaffMembers().map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center space-x-2">
                          <span>{member.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {member.role}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedTaskForAssignment && (
                <div className="space-y-2">
                  <Label>Task Details</Label>
                  <div className="p-3 bg-muted rounded-lg space-y-1">
                    <p className="font-medium">{selectedTaskForAssignment.title}</p>
                    <p className="text-sm text-muted-foreground">{selectedTaskForAssignment.description}</p>
                    <div className="flex items-center space-x-2 text-xs">
                      <Badge variant="outline">{selectedTaskForAssignment.priority}</Badge>
                      <Badge variant="outline">{selectedTaskForAssignment.category}</Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmAssignment}>Assign Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
