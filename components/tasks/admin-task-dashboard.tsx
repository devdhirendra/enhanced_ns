"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ClipboardList,
  Plus,
  Search,
  MoreHorizontal,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  ArrowUpDown,
  Loader2,
  Gavel as Label,
} from "lucide-react"
import { taskApi } from "@/lib/task-api"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"
import TaskDetailModal from "./task-detail-modal"
import TaskCreateForm from "./task-create-form"
import Pagination from "./pagination"

interface AdminTaskDashboardProps {
  userId: string
  onCreateTask?: () => void
}

export default function AdminTaskDashboard({ userId, onCreateTask }: AdminTaskDashboardProps) {
  const { toast } = useToast()
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showReassignModal, setShowReassignModal] = useState(false)
  const [reassignTaskId, setReassignTaskId] = useState<string | null>(null)
  const [reassignEmail, setReassignEmail] = useState("")
  const [reassignLoading, setReassignLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const itemsPerPage = 10
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
  })

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setLoading(true)
      const result = await taskApi.getAll()
      if (result?.data && Array.isArray(result.data)) {
        setTasks(result.data)
        calculateStats(result.data)
      }
    } catch (error) {
      console.error("Error fetching tasks:", error)
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (taskList: any[]) => {
    const now = new Date()
    setStats({
      total: taskList.length,
      pending: taskList.filter((t) => t.status === "Pending").length,
      inProgress: taskList.filter((t) => t.status === "In Progress").length,
      completed: taskList.filter((t) => t.status === "Completed").length,
      overdue: taskList.filter((t) => new Date(t.dueDate) < now && t.status !== "Completed").length,
    })
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const handleStatClick = (status: string) => {
    if (status === "pending") setStatusFilter("Pending")
    else if (status === "inProgress") setStatusFilter("In Progress")
    else if (status === "completed") setStatusFilter("Completed")
    setCurrentPage(1)
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return

    try {
      const result = await taskApi.delete(taskId, userId)
      if (result.success) {
        toast({
          title: "Success",
          description: "Task deleted successfully",
        })
        fetchTasks()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete task",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting task:", error)
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      })
    }
  }

  const handleReassignTask = async () => {
    if (!reassignTaskId || !reassignEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    try {
      setReassignLoading(true)
      const userResult = await taskApi.getUserByEmail(reassignEmail)

      if (!userResult || !userResult.user_id) {
        toast({
          title: "Error",
          description: "User not found with this email",
          variant: "destructive",
        })
        return
      }

      const result = await taskApi.reassign(reassignTaskId, userId, { assignTo: userResult.user_id })

      if (result.success) {
        toast({
          title: "Success",
          description: `Task reassigned to ${userResult.profileDetail?.name || reassignEmail}`,
        })
        setShowReassignModal(false)
        setReassignEmail("")
        setReassignTaskId(null)
        fetchTasks()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to reassign task",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reassign task",
        variant: "destructive",
      })
    } finally {
      setReassignLoading(false)
    }
  }

  const handleStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      const result = await taskApi.updateStatus(taskId, userId, { status: newStatus })
      if (result.success) {
        toast({
          title: "Success",
          description: `Task status updated to ${newStatus}`,
        })
        fetchTasks()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      })
    }
  }

  const filteredTasks = tasks
    .filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || task.status === statusFilter
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    })
    .sort((a, b) => {
      let aVal = a[sortBy]
      let bVal = b[sortBy]

      if (sortBy === "createdAt" || sortBy === "dueDate") {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage)
  const paginatedTasks = filteredTasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "in progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "in progress":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "pending":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards - Made clickable to filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card
          className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => {
            setStatusFilter("all")
            setCurrentPage(1)
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Total Tasks</CardTitle>
            <ClipboardList className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
          </CardContent>
        </Card>

        <Card
          className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleStatClick("pending")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-900">Pending</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card
          className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleStatClick("inProgress")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card
          className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleStatClick("completed")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-900">Overdue</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{stats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Task Management</CardTitle>
              <CardDescription>Manage all tasks and assignments</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchTasks}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <DialogDescription>Assign a task to team members</DialogDescription>
                  </DialogHeader>
                  <TaskCreateForm
                    userId={userId}
                    userRole="admin"
                    onTaskCreated={() => {
                      setShowCreateModal(false)
                      fetchTasks()
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-full md:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={priorityFilter}
              onValueChange={(value) => {
                setPriorityFilter(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-full md:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="dueDate">Due Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTasks.length > 0 ? (
                  paginatedTasks.map((task) => (
                    <TableRow key={task.taskId}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">{task.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">{task.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(task.status)}
                          <Badge variant="outline" className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {task.assignToDetail?.profileDetail?.name || task.assignTo || "Unassigned"}
                          </div>
                          <div className="text-xs text-gray-500">{task.assignToDetail?.email}</div>
                          <div className="text-xs text-gray-600 font-medium">{task.assignToDetail?.role}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(task.dueDate)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{task.category}</Badge>
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
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedTask(task)
                                setShowDetailModal(true)
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setReassignTaskId(task.taskId)
                                setShowReassignModal(true)
                              }}
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              {task.assignTo ? "Reassign" : "Assign"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleStatusUpdate(task.taskId, "In Progress")}>
                              <Clock className="mr-2 h-4 w-4" />
                              Start Task
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(task.taskId, "Completed")}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark Complete
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeleteTask(task.taskId)} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No tasks found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredTasks.length}
          />
        </CardContent>
      </Card>

      {/* Task Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <TaskDetailModal
              task={selectedTask}
              userId={userId}
              userRole="admin"
              onClose={() => setShowDetailModal(false)}
              onTaskUpdated={fetchTasks}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showReassignModal} onOpenChange={setShowReassignModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reassign Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reassign-email">Search User by Email</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="reassign-email"
                  type="email"
                  placeholder="Enter email address..."
                  value={reassignEmail}
                  onChange={(e) => setReassignEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {reassignEmail && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="text-sm text-gray-600">
                    <p>
                      Searching for user with email: <span className="font-medium">{reassignEmail}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-2">
              <Button onClick={handleReassignTask} disabled={reassignLoading || !reassignEmail} className="flex-1">
                {reassignLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Reassigning...
                  </>
                ) : (
                  "Reassign"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowReassignModal(false)
                  setReassignEmail("")
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
