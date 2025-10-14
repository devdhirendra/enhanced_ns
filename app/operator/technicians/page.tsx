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
  TrendingUp,
  RefreshCw,
  MoreHorizontal,
  Trash2,
  PlayCircle,
  UserCheck,
  Wrench,
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { 
  taskApi, 
  technicianApi,
  customerApi
} from "@/lib/api"

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
  technianId?: string;
}

interface TaskStats {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  pendingTasks: number
  overdueTasks: number
  highPriorityTasks: number
}

interface Technician {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  area?: string;
  specialization?: string;
  profileID?: string;
}

interface Customer {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  profileId? : string;
 }

export default function AdminTasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<AdminTask[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<AdminTask | null>(null)

  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedTaskForAssignment, setSelectedTaskForAssignment] = useState<AdminTask | null>(null)
  const [selectedTechnician, setSelectedTechnician] = useState("")

  // Only technicians and customers needed
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "Medium" as const,
    assignTo: "",
    assignFor: "",
    dueDate: "",
    category: "Fiber Installation" as const,
    estimatedHours: 8,
  })
  const { toast } = useToast()

  // Fetch technicians only
  const fetchTechnicians = async () => {
    try {
      const response = await technicianApi.getAll()
      const data = response.data || response
      const mappedTechnicians: Technician[] = data.map((tech: any) => ({
        id: tech.user_id,
        name: tech.profileDetail?.name || 'Unknown',
        role: 'technician',
        email: tech.email,
        phone: tech.profileDetail?.phone,
        area: tech.profileDetail?.area,
        profileID : tech.profileDetail?.technicianId,
        specialization: tech.profileDetail?.specialization
      }))
      setTechnicians(mappedTechnicians)
    } catch (error) {
      console.error('Error fetching technicians:', error)
      toast({
        title: "Error",
        description: "Failed to load technicians",
        variant: "destructive",
      })
    }
  }

  // Fetch customers for assignFor field
  const fetchCustomers = async () => {
    try {
      const response = await customerApi.getAll1()
      const data = response.data || response
      const mappedCustomers: Customer[] = data.map((customer: any) => ({
        id: customer.user_id,
        name: customer.profileDetail?.name || 'Unknown',
        role: 'customer',
        email: customer.email,
        phone: customer.profileDetail?.phone,
        profileId : customer.profileDetail?.customerId
      }))
 
      setCustomers(mappedCustomers)
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchTechnicians()
    fetchCustomers()
  }, [])

  useEffect(() => {
    if (user?.user_id) {
      fetchTasks(user.user_id);
    }
  }, [user]);

const fetchTasks = async (id: string) => {
  try {
    setLoading(true)
    const result = await taskApi.getCreated(id);
    
    if (result && result.data) {
      const transformedTasks = result.data.map((task: any) => ({
        id: task.taskId,
        taskId: task.taskId,
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        status: task.status,
        createdDate: task.createdAt,
        updatedDate: task.updatedAt,
        dueDate: task.dueDate,
        progress: task.status === "Completed" ? 100 : task.status === "In Progress" ? 50 : 0,
        assignTo: task.assignTo,
        assignFor: task.assignFor || "",
        assignRole: task.assignRole || "technician", // Default to technician
        
        operaterId: task.operaterId || null,
        OperatorName: task.OperatorName || "",
        
        technianId: task.technianId || task.assignTo,
        technicianName: task.technicianName || "",
        
        adminID: task.adminID || null,
        AdminName: task.AdminName || "",
        
        customerId: task.customerId || null,
        customerName: task.customerName || "",
        
        estimatedHours: task.estimatedHours || 8,
        actualHours: task.actualHours || 0,
        department: "technician", // Always technician
        createdBy: task.createdBy,
      }));
      
      setTasks(transformedTasks);
    }
  } catch (err) {
    console.error(err);
    toast({
      title: "Error",
      description: "Failed to fetch tasks",
      variant: "destructive",
    })
  } finally {
    setLoading(false)
  }
};

  const taskStats: TaskStats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter((t) => t.status === "Completed").length,
    inProgressTasks: tasks.filter((t) => t.status === "In Progress").length,
    pendingTasks: tasks.filter((t) => t.status === "Pending").length,
    overdueTasks: tasks.filter((t) => new Date(t.dueDate) < new Date() && t.status !== "Completed").length,
    highPriorityTasks: tasks.filter((t) => t.priority === "High" || t.priority === "Critical").length,
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
      case "Critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.description || !newTask.assignTo || !newTask.assignFor) {
      toast({
        title: "Error",
        description: "Please fill in all required fields including customer assignment",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        assignTo: newTask.assignTo,
        assignFor: newTask.assignFor,
        assignRole: "technician", // Always technician
        dueDate: newTask.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        category: newTask.category,
        estimatedHours: newTask.estimatedHours,
        status: "Pending"
      }

      await taskApi.create(user?.user_id!, taskData)
      
      // Refresh tasks
      await fetchTasks(user?.user_id!)
      
      // Reset form
      setNewTask({
        title: "",
        description: "",
        priority: "Medium",
        assignTo: "",
        assignFor: "",
        dueDate: "",
        category: "Fiber Installation",
        estimatedHours: 8,
      })
      
      setIsCreateDialogOpen(false)
      toast({
        title: "Success",
        description: "Task created and assigned to technician successfully",
      })
    } catch (error) {
      console.error('Error creating task:', error)
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewTask = (task: AdminTask) => {
    setSelectedTask(task)
    setIsViewDialogOpen(true)
  }

  const handleEditTask = (task: AdminTask) => {
    setSelectedTask(task)
    setIsEditDialogOpen(true)
  }

  const handleUpdateTask = async () => {
    if (!selectedTask) return

    try {
      setLoading(true)
      await taskApi.update(selectedTask.taskId, {
        title: selectedTask.title,
        description: selectedTask.description,
        priority: selectedTask.priority,
        status: selectedTask.status,
        progress: selectedTask.progress
      })
      
      // Refresh tasks
      await fetchTasks(user?.user_id!)
      
      setIsEditDialogOpen(false)
      setSelectedTask(null)
      toast({
        title: "Success",
        description: "Task updated successfully",
      })
    } catch (error) {
      console.error('Error updating task:', error)
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      setLoading(true)
      await taskApi.delete(taskId)
      
      // Refresh tasks
      await fetchTasks(user?.user_id!)
      
      toast({
        title: "Success",
        description: "Task deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting task:', error)
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (taskId: string, newStatus: AdminTask["status"]) => {
    try {
      setLoading(true)
      await taskApi.updateStatus(taskId, newStatus)
      
      // Refresh tasks
      await fetchTasks(user?.user_id!)
      
      toast({
        title: "Success",
        description: `Task status updated to ${newStatus}`,
      })
    } catch (error) {
      console.error('Error updating task status:', error)
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReassignTechnician = async (task: AdminTask) => {
    setSelectedTaskForAssignment(task)
    setSelectedTechnician(task.assignTo || "")
    setIsAssignDialogOpen(true)
  }

const handleConfirmReassignment = async () => {
  if (!selectedTaskForAssignment || !selectedTechnician) {
    toast({
      title: "Error",
      description: "Please select a technician",
      variant: "destructive",
    })
    return
  }

  try {
    setLoading(true)
    
    // Update the task with new technician assignment
    await taskApi.update(selectedTaskForAssignment.taskId, {
      assignTo: selectedTechnician,
      assignRole: "technician"
    })
    
    // Refresh tasks
    await fetchTasks(user?.user_id!)
    
    const technicianName = technicians.find(t => t.id === selectedTechnician)?.name || selectedTechnician
    toast({
      title: "Success",
      description: `Task reassigned to ${technicianName} successfully`,
    })
    
    setIsAssignDialogOpen(false)
    setSelectedTaskForAssignment(null)
    setSelectedTechnician("")
  } catch (error) {
    console.error('Error reassigning task:', error)
    toast({
      title: "Error",
      description: "Failed to reassign task",
      variant: "destructive",
    })
  } finally {
    setLoading(false)
  }
}

  const getTechnicianDisplay = (task: AdminTask) => {
    const technician = technicians.find(t => t.id === task.assignTo)
    return {
      name: technician?.name || task.technicianName || "Unassigned Technician",
      id: task.assignTo,
      specialization: technician?.specialization,
      area: technician?.area
    }
  }

  const getCustomerDisplay = (task: AdminTask) => {
    const customer = customers.find(c => c.id === task.assignFor)
    return {
      name: customer?.name || task.customerName || "No Customer Assigned",
      id: task.assignFor
    }
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || task.status.toLowerCase().replace(" ", "-") === selectedStatus

    return matchesSearch && matchesStatus
  })

  return (
    <DashboardLayout title="Technician Task Management" description="Assign and manage technician tasks for customers">
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
              <p className="text-xs text-gray-500 mt-1">All technician tasks</p>
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
            <TabsTrigger value="all-tasks">All Technician Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="all-tasks" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Technician Tasks</CardTitle>
                <CardDescription>Filter and search through technician tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <Button 
                      variant="outline" 
                      className="w-full bg-transparent"
                      onClick={() => {
                        setSearchTerm("")
                        setSelectedStatus("all")
                      }}
                    >
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
                    <CardTitle>Technician Tasks</CardTitle>
                    <CardDescription>Manage technician assignments for customer tasks</CardDescription>
                  </div>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Technician Task
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create New Technician Task</DialogTitle>
                        <DialogDescription>Create and assign a new task to a technician for a customer</DialogDescription>
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
                                <SelectItem value="Network Setup">Network Setup</SelectItem>
                                <SelectItem value="Maintenance">Maintenance</SelectItem>
                                <SelectItem value="Repair">Repair</SelectItem>
                                <SelectItem value="Inspection">Inspection</SelectItem>
                                <SelectItem value="Equipment Installation">Equipment Installation</SelectItem>
                                <SelectItem value="Troubleshooting">Troubleshooting</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
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
                                <SelectItem value="Critical">Critical</SelectItem>
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
                            <Label htmlFor="assignTo">Assign To Technician *</Label>
                            <Select
                              value={newTask.assignTo}
                              onValueChange={(value) => setNewTask((prev) => ({ ...prev, assignTo: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select technician" />
                              </SelectTrigger>
                              <SelectContent>
                                {technicians.map((tech) => (
                                  <SelectItem key={tech.id} value={tech.id}>
                                    <div className="flex flex-col">
                                      <span>{tech.name} ({tech.profileID})</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="assignFor">Assign For Customer *</Label>
                            <Select
                              value={newTask.assignFor}
                              onValueChange={(value) => setNewTask((prev) => ({ ...prev, assignFor: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select customer" />
                              </SelectTrigger>
                              <SelectContent>
                                {customers.map((customer) => (
                                  <SelectItem key={customer.id} value={customer.id}>
                                    {customer.name} ({customer.profileId})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
                            placeholder="Provide detailed task description for the technician..."
                            rows={4}
                            value={newTask.description}
                            onChange={(e) => setNewTask((prev) => ({ ...prev, description: e.target.value }))}
                          />
                        </div>

                        <div className="flex space-x-4">
                          <Button onClick={handleCreateTask} className="flex-1" disabled={loading}>
                            <Plus className="h-4 w-4 mr-2" />
                            {loading ? "Creating..." : "Create Task"}
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
                        <TableHead>Technician</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            Loading tasks...
                          </TableCell>
                        </TableRow>
                      ) : filteredTasks.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                            No technician tasks found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTasks.map((task) => {
                          const technicianInfo = getTechnicianDisplay(task)
                          const customerInfo = getCustomerDisplay(task)
                          return (
                            <TableRow key={task.id}>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium">{task.title}</div>
                                  <div className="text-sm text-gray-500">{task.category}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Wrench className="h-4 w-4 text-blue-500" />
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">{technicianInfo.name}</span>
                                    {technicianInfo.specialization && (
                                      <span className="text-xs text-gray-600">{technicianInfo.specialization}</span>
                                    )}
                                    {technicianInfo.area && (
                                      <span className="text-xs text-gray-600">{technicianInfo.area}</span>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <User className="h-4 w-4 text-green-500" />
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">{customerInfo.name}</span>
                                    {customerInfo.id && (
                                      <span className="text-xs text-gray-600">ID: {customerInfo.id}</span>
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
                                    <DropdownMenuItem onClick={() => handleReassignTechnician(task)}>
                                      <UserCheck className="mr-2 h-4 w-4" />
                                      Reassign Technician
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleStatusUpdate(task.taskId, "In Progress")}>
                                      <PlayCircle className="mr-2 h-4 w-4" />
                                      Start Task
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusUpdate(task.taskId, "Completed")}>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Mark Complete
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusUpdate(task.taskId, "On Hold")}>
                                      <Pause className="mr-2 h-4 w-4" />
                                      Put On Hold
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => handleDeleteTask(task.taskId)} 
                                      className="text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete Task
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* View Task Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Technician Task Details</DialogTitle>
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
                    <Label className="text-sm font-medium text-gray-500">Assigned Technician</Label>
                    <p className="text-sm">{getTechnicianDisplay(selectedTask).name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Customer</Label>
                    <p className="text-sm">{getCustomerDisplay(selectedTask).name}</p>
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

        {/* Edit Task Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Technician Task</DialogTitle>
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
                        <SelectItem value="Network Setup">Network Setup</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Repair">Repair</SelectItem>
                        <SelectItem value="Inspection">Inspection</SelectItem>
                        <SelectItem value="Equipment Installation">Equipment Installation</SelectItem>
                        <SelectItem value="Troubleshooting">Troubleshooting</SelectItem>
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
                        <SelectItem value="Critical">Critical</SelectItem>
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
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
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
                  <Button onClick={handleUpdateTask} className="flex-1" disabled={loading}>
                    <Edit className="h-4 w-4 mr-2" />
                    {loading ? "Updating..." : "Update Task"}
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

        {/* Reassign Technician Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Reassign Technician</DialogTitle>
              <DialogDescription>
                Select a different technician to assign "{selectedTaskForAssignment?.title}" to.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="technician-select">
                  Select Technician
                </Label>
                <Select 
                  value={selectedTechnician} 
                  onValueChange={setSelectedTechnician}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a technician" />
                  </SelectTrigger>
                  <SelectContent>
                    {technicians.map((technician) => (
                      <SelectItem key={technician.id} value={technician.id}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex flex-col">
                            <span className="font-medium">{technician.name} ({technician.profileID})  </span>
                          </div>
                          <Badge variant="outline" className="text-xs ml-2">
                            <Wrench className="h-3 w-3 mr-1" />
                            Technician
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Show selected technician details */}
              {selectedTechnician && (
                <div className="space-y-2">
                  <Label>Selected Technician Details</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    {(() => {
                      const selectedTech = technicians.find(t => t.id === selectedTechnician)
                      return selectedTech ? (
                        <div className="space-y-1">
                          <p className="font-medium">{selectedTech.name}</p>
                          <p className="text-sm text-gray-600">ID: {selectedTech.id}</p>
                          {selectedTech.email && (
                            <p className="text-sm text-gray-600">Email: {selectedTech.email}</p>
                          )}
                          {selectedTech.phone && (
                            <p className="text-sm text-gray-600">Phone: {selectedTech.phone}</p>
                          )}
                          {selectedTech.specialization && (
                            <p className="text-sm text-gray-600">Specialization: {selectedTech.specialization}</p>
                          )}
                          {selectedTech.area && (
                            <p className="text-sm text-gray-600">Area: {selectedTech.area}</p>
                          )}
                        </div>
                      ) : null
                    })()}
                  </div>
                </div>
              )}

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
                    <p className="text-sm text-gray-600">
                      Customer: {getCustomerDisplay(selectedTaskForAssignment).name}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsAssignDialogOpen(false)
                setSelectedTechnician("")
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmReassignment} 
                disabled={loading || !selectedTechnician}
              >
                {loading ? "Reassigning..." : "Reassign Task"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}