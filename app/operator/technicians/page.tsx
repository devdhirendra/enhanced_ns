"use client"
import { DialogFooter } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  Search,
  Eye,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  User,
  HardHat,
  TrendingUp,
  Target,
  Award,
  UserCheck,
  Edit,
  Trash2,
  Phone,
  Mail,
  AlertTriangle,
  MoreHorizontal,
  RefreshCw,
  Filter,
  Users,
  AlertCircle,
} from "lucide-react"
import { operatorApi, taskApi } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

interface Technician {
  userId: string
  email: string
  profileDetail: {
    name: string
    phone: string
    area: string
    specialization: string
    salary: number
    assignedOperatorId: string
  }
  status?: string
  attendance?: string
  checkInTime?: string
  checkOutTime?: string
  tasksCompleted?: number
  tasksAssigned?: number
  avgRating?: number
  lastActive?: string
  joinDate?: string
}

interface Task {
  taskId: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  assignTo: string
  customerName?: string
  customerPhone?: string
  address?: string
  dueDate: string
  assignedDate: string
  completedDate?: string
  createdBy: string
  technicianName?: string
}

const TechnicianSkeleton = () => (
  <TableRow>
    <TableCell><Skeleton className="h-4 w-[180px]" /></TableCell>
    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
    <TableCell><Skeleton className="h-4 w-[140px]" /></TableCell>
    <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
    <TableCell><Skeleton className="h-6 w-[90px]" /></TableCell>
    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
    <TableCell><Skeleton className="h-8 w-[100px]" /></TableCell>
  </TableRow>
)

export default function TechnicianManagement() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  // State Management
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [tasksLoading, setTasksLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Dialog States
  const [isAddTechDialogOpen, setIsAddTechDialogOpen] = useState(false)
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  
  // Confirmation Dialog States
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    description: string
    action: () => void
  }>({
    open: false,
    title: "",
    description: "",
    action: () => {}
  })
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [attendanceFilter, setAttendanceFilter] = useState("all")
  const [taskStatusFilter, setTaskStatusFilter] = useState("all")
  
  // Form States
  const [newTechnician, setNewTechnician] = useState({
    name: "",
    phone: "",
    email: "",
    area: "",
    specialization: "",
    salary: "",
    password: "default123"
  })
  
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    technicianId: "",
    priority: "medium" as const,
    customerName: "",
    customerPhone: "",
    address: "",
    dueDate: ""
  })

  // Calculate Stats
  const totalTechnicians = technicians.length
  const activeTechnicians = technicians.filter(t => t.status === 'active' || !t.status).length
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'completed').length

  // Fetch Data
  useEffect(() => {
    fetchTechnicians()
    fetchTasks()
  }, [])

  // const fetchTechnicians = async () => {
  //   try {
  //     setLoading(true)
  //     setError(null)
  //     const response = await operatorApi.getTechnicians()
  //     console.log('Technicians response:', response)
      
  //     let technicianData: Technician[] = []
      
  //     if (Array.isArray(response)) {
  //       technicianData = response
  //     } else if (response?.data && Array.isArray(response.data)) {
  //       technicianData = response.data
  //     } else if (response?.success && Array.isArray(response.data)) {
  //       technicianData = response.data
  //     }
      
  //     setTechnicians(technicianData)
      
  //     if (technicianData.length === 0) {
  //       toast({
  //         title: "No Technicians",
  //         description: "No technicians found. Add some technicians to get started.",
  //       })
  //     }
  //   } catch (err: any) {
  //     console.error('Fetch technicians error:', err)
  //     setError('Failed to fetch technicians: ' + (err.message || 'Unknown error'))
  //     toast({
  //       title: "Error",
  //       description: "Failed to fetch technicians. Please try again.",
  //       variant: "destructive",
  //     })
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const fetchTechnicians = async () => {
  try {
    setLoading(true)
    setError(null)
    const response = await operatorApi.getTechnicians()
    console.log('Technicians response:', response)
    
    let technicianData: Technician[] = []
    
    // Extract data based on different possible response structures
    let rawData: any[] = []
    if (Array.isArray(response)) {
      rawData = response
    } else if (response?.data && Array.isArray(response.data)) {
      rawData = response.data
    } else if (response?.success && Array.isArray(response.data)) {
      rawData = response.data
    }
    
    // Map the API response to your expected Technician interface
    technicianData = rawData.map((tech: any) => ({
      userId: tech.user_id || tech.userId || '',
      email: tech.email || '',
      profileDetail: {
        name: tech.profileDetail?.name || 'Unknown',
        phone: tech.profileDetail?.phone || 'N/A',
        area: tech.profileDetail?.area || 'Not Assigned',
        specialization: tech.profileDetail?.specialization || 'General',
        salary: typeof tech.profileDetail?.salary === 'string' 
          ? parseInt(tech.profileDetail.salary) || 0 
          : tech.profileDetail?.salary || 0,
        assignedOperatorId: tech.profileDetail?.assignedOperatorId || ''
      },
      status: tech.status || 'active',
      attendance: tech.attendance || 'present',
      checkInTime: tech.checkInTime,
      checkOutTime: tech.checkOutTime,
      tasksCompleted: tech.tasksCompleted || 0,
      tasksAssigned: tech.tasksAssigned || 0,
      avgRating: tech.profileDetail?.rating || tech.avgRating || 0,
      lastActive: tech.lastActive,
      joinDate: tech.createdAt || tech.joinDate
    }))
    
    setTechnicians(technicianData)
    
    if (technicianData.length === 0) {
      toast({
        title: "No Technicians",
        description: "No technicians found. Add some technicians to get started.",
      })
    }
  } catch (err: any) {
    console.error('Fetch technicians error:', err)
    setError('Failed to fetch technicians: ' + (err.message || 'Unknown error'))
    toast({
      title: "Error",
      description: "Failed to fetch technicians. Please try again.",
      variant: "destructive",
    })
  } finally {
    setLoading(false)
  }
}
  const fetchTasks = async () => {
    try {
      setTasksLoading(true)
      const response = await taskApi.getCreated(user?.user_id)
      console.log('Tasks response:', response)
      
      let taskData: Task[] = []
      
      if (Array.isArray(response)) {
        taskData = response
      } else if (response?.data && Array.isArray(response.data)) {
        taskData = response.data
      } else if (response?.success && Array.isArray(response.data)) {
        taskData = response.data
      }
      
      // Add technician names to tasks
      const tasksWithNames = taskData.map(task => ({
        ...task,
        technicianName: technicians.find(t => t.userId === task.assignTo)?.profileDetail?.name || 'Unknown'
      }))
      
      setTasks(tasksWithNames)
    } catch (err: any) {
      console.error('Fetch tasks error:', err)
      toast({
        title: "Error",
        description: "Failed to fetch tasks: " + (err.message || 'Unknown error'),
        variant: "destructive",
      })
    } finally {
      setTasksLoading(false)
    }
  }

  // const handleAddTechnician = async () => {
  //   try {
  //     if (!newTechnician.name.trim() || !newTechnician.email.trim() || !newTechnician.phone.trim()) {
  //       toast({
  //         title: "Validation Error",
  //         description: "Please fill in all required fields (Name, Email, Phone).",
  //         variant: "destructive",
  //       })
  //       return
  //     }

  //     if (!user?.userId) {
  //       toast({
  //         title: "Authentication Error",
  //         description: "User not authenticated. Please login again.",
  //         variant: "destructive",
  //       })
  //       return
  //     }

  //     const technicianData = {
  //       email: newTechnician.email.trim(),
  //       password: newTechnician.password,
  //       profileDetail: {
  //         name: newTechnician.name.trim(),
  //         phone: newTechnician.phone.trim(),
  //         area: newTechnician.area.trim() || "Not Assigned",
  //         specialization: newTechnician.specialization || "General",
  //         salary: parseInt(newTechnician.salary) || 0,
  //         assignedOperatorId: user.userId
  //       }
  //     }

  //     console.log('Adding technician with data:', technicianData)
      
  //     const response = await operatorApi.registerTechnician(technicianData)
  //     console.log('Add technician response:', response)
      
  //     toast({
  //       title: "Success",
  //       description: `Technician ${newTechnician.name} added successfully!`,
  //     })
      
  //     setIsAddTechDialogOpen(false)
  //     setNewTechnician({
  //       name: "",
  //       phone: "",
  //       email: "",
  //       area: "",
  //       specialization: "",
  //       salary: "",
  //       password: "default123"
  //     })
      
  //     // Refresh the list
  //     await fetchTechnicians()
  //   } catch (err: any) {
  //     console.error('Add technician error:', err)
  //     toast({
  //       title: "Error",
  //       description: "Failed to add technician: " + (err.message || 'Please try again.'),
  //       variant: "destructive",
  //     })
  //   }
  // }

  const handleAddTechnician = async () => {
  try {
    if (!newTechnician.name.trim() || !newTechnician.email.trim() || !newTechnician.phone.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Name, Email, Phone).",
        variant: "destructive",
      })
      return
    }

    if (!user?.userId) {
      toast({
        title: "Authentication Error",
        description: "User not authenticated. Please login again.",
        variant: "destructive",
      })
      return
    }

    const technicianData = {
      email: newTechnician.email.trim(),
      password: newTechnician.password,
      profileDetail: {
        name: newTechnician.name.trim(),
        phone: newTechnician.phone.trim(),
        area: newTechnician.area.trim() || "Not Assigned",
        specialization: newTechnician.specialization || "General",
        salary: parseInt(newTechnician.salary) || 0,
        assignedOperatorId: user.userId
      },
      role: "technician" // Make sure to include the role
    }

    console.log('Adding technician with data:', technicianData)
    
    const response = await operatorApi.registerTechnician(technicianData)
    console.log('Add technician response:', response)
    
    toast({
      title: "Success",
      description: `Technician ${newTechnician.name} added successfully!`,
    })
    
    setIsAddTechDialogOpen(false)
    setNewTechnician({
      name: "",
      phone: "",
      email: "",
      area: "",
      specialization: "",
      salary: "",
      password: "default123"
    })
    
    // Refresh the list
    await fetchTechnicians()
  } catch (err: any) {
    console.error('Add technician error:', err)
    toast({
      title: "Error",
      description: "Failed to add technician: " + (err.message || 'Please try again.'),
      variant: "destructive",
    })
  }
}
  // const handleCreateTask = async () => {
  //   try {
  //     if (!newTask.title.trim() || !newTask.technicianId || !newTask.dueDate) {
  //       toast({
  //         title: "Validation Error",
  //         description: "Please fill in all required fields (Title, Technician, Due Date).",
  //         variant: "destructive",
  //       })
  //       return
  //     }

  //     if (!user?.user_id) {
  //       toast({
  //         title: "Authentication Error",
  //         description: "User not authenticated. Please login again.",
  //         variant: "destructive",
  //       })
  //       return
  //     }

  //   const taskData = {
  //     title: newTask.title.trim(),
  //     description: newTask.description.trim(),
  //     priority: "HIGH",
  //     status: 'Pending', // Capital P as required by API
  //     assignTo: newTask.technicianId,
  //     customerName: newTask.customerName.trim(),
  //     customerPhone: newTask.customerPhone.trim(),
  //     address: newTask.address.trim(),
  //     dueDate: new Date(newTask.dueDate).toISOString(),
  //     category: "Maintenance" // Default category
  //   }
  //     console.log('Creating task with data:', taskData)
      
  //     const response = await taskApi.create(user.userId, taskData)
  //     console.log('Create task response:', response)
      
  //     toast({
  //       title: "Success",
  //       description: `Task "${newTask.title}" created and assigned successfully!`,
  //     })
      
  //     setIsCreateTaskDialogOpen(false)
  //     setNewTask({
  //       title: "",
  //       description: "",
  //       technicianId: "",
  //       priority: "medium",
  //       customerName: "",
  //       customerPhone: "",
  //       address: "",
  //       dueDate: ""
  //     })
      
  //     // Refresh the tasks list
  //     await fetchTasks()
  //   } catch (err: any) {
  //     console.error('Create task error:', err)
  //     toast({
  //       title: "Error",
  //       description: "Failed to create task: " + (err.message || 'Please try again.'),
  //       variant: "destructive",
  //     })
  //   }
  // }

  // const handleStatusUpdate = (techId: string, newStatus: string) => {
  //   setConfirmDialog({
  //     open: true,
  //     title: "Update Technician Status",
  //     description: `Are you sure you want to change the status to "${newStatus}"?`,
  //     action: async () => {
  //       try {
  //         await operatorApi.updateTechnicianProfile(techId, { 
  //           profileDetail: { 
  //             assignedOperatorId: user?.userId || "" 
  //           } 
  //         })
          
  //         setTechnicians(prev => prev.map((tech) => 
  //           (tech.userId === techId ? { ...tech, status: newStatus } : tech)
  //         ))
          
  //         toast({
  //           title: "Success",
  //           description: "Technician status updated successfully!",
  //         })
  //       } catch (err: any) {
  //         console.error('Status update error:', err)
  //         toast({
  //           title: "Error",
  //           description: "Failed to update status: " + (err.message || 'Please try again.'),
  //           variant: "destructive",
  //         })
  //       }
  //     }
  //   })
  // }

  const handleCreateTask = async () => {
  try {
    if (!newTask.title.trim() || !newTask.technicianId || !newTask.dueDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Title, Technician, Due Date).",
        variant: "destructive",
      })
      return
    }

    if (!user?.user_id) {
      toast({
        title: "Authentication Error",
        description: "User not authenticated. Please login again.",
        variant: "destructive",
      })
      return
    }

    // Format priority and status to match API expectations
    const formatPriority = (priority: string) => {
      switch (priority) {
        case 'low': return 'Low'
        case 'medium': return 'Medium'
        case 'high': return 'High'
        default: return 'Medium'
      }
    }

    const taskData = {
      title: newTask.title.trim(),
      description: newTask.description.trim(),
      priority: formatPriority(newTask.priority),
      status: 'Pending', // Capital P as required by API
      assignTo: newTask.technicianId,
      customerName: newTask.customerName.trim(),
      customerPhone: newTask.customerPhone.trim(),
      address: newTask.address.trim(),
      dueDate: new Date(newTask.dueDate).toISOString(),
      category: "Maintenance" // Default category
    }

    console.log('Creating task with data:', taskData)
    
    const response = await taskApi.create(user.user_id, taskData)
    console.log('Create task response:', response)
    
    toast({
      title: "Success",
      description: `Task "${newTask.title}" created and assigned successfully!`,
    })
    
    setIsCreateTaskDialogOpen(false)
    setNewTask({
      title: "",
      description: "",
      technicianId: "",
      priority: "medium",
      customerName: "",
      customerPhone: "",
      address: "",
      dueDate: ""
    })
    
    // Refresh the tasks list
    await fetchTasks()
  } catch (err: any) {
    console.error('Create task error:', err)
    toast({
      title: "Error",
      description: "Failed to create task: " + (err.message || 'Please try again.'),
      variant: "destructive",
    })
  }
}
const handleStatusUpdate = (techId: string, newStatus: string) => {
  setConfirmDialog({
    open: true,
    title: "Update Technician Status",
    description: `Are you sure you want to change the status to "${newStatus}"?`,
    action: async () => {
      try {
        // Update the status field directly
        await operatorApi.updateTechnicianProfile(techId, { 
          status: newStatus
        })
        
        setTechnicians(prev => prev.map((tech) => 
          (tech.userId === techId ? { ...tech, status: newStatus } : tech)
        ))
        
        toast({
          title: "Success",
          description: "Technician status updated successfully!",
        })
      } catch (err: any) {
        console.error('Status update error:', err)
        toast({
          title: "Error",
          description: "Failed to update status: " + (err.message || 'Please try again.'),
          variant: "destructive",
        })
      }
    }
  })
}
  const handleTaskStatusUpdate = (taskId: string, newStatus: Task['status']) => {
    setConfirmDialog({
      open: true,
      title: "Update Task Status",
      description: `Are you sure you want to change the task status to "${newStatus.replace('_', ' ')}"?`,
      action: async () => {
        try {
          await taskApi.updateStatus(taskId, newStatus)
          
          setTasks(prev => prev.map((task) =>
            task.taskId === taskId
              ? {
                  ...task,
                  status: newStatus,
                  completedDate: newStatus === "completed" ? new Date().toISOString() : task.completedDate,
                }
              : task
          ))
          
          toast({
            title: "Success",
            description: "Task status updated successfully!",
          })
        } catch (err: any) {
          console.error('Task status update error:', err)
          toast({
            title: "Error",
            description: "Failed to update task status: " + (err.message || 'Please try again.'),
            variant: "destructive",
          })
        }
      }
    })
  }

  const handleDeleteTechnician = (techId: string, techName: string) => {
    setConfirmDialog({
      open: true,
      title: "Delete Technician",
      description: `Are you sure you want to delete "${techName}"? This action cannot be undone.`,
      action: async () => {
        try {
          await operatorApi.deleteTechnician(techId)
          setTechnicians(prev => prev.filter(tech => tech.userId !== techId))
          
          toast({
            title: "Success",
            description: `Technician "${techName}" deleted successfully!`,
          })
        } catch (err: any) {
          console.error('Delete technician error:', err)
          toast({
            title: "Error",
            description: "Failed to delete technician: " + (err.message || 'Please try again.'),
            variant: "destructive",
          })
        }
      }
    })
  }

  const handleDeleteTask = (taskId: string, taskTitle: string) => {
    setConfirmDialog({
      open: true,
      title: "Delete Task",
      description: `Are you sure you want to delete "${taskTitle}"? This action cannot be undone.`,
      action: async () => {
        try {
          await taskApi.delete(taskId)
          setTasks(prev => prev.filter(task => task.taskId !== taskId))
          
          toast({
            title: "Success",
            description: `Task "${taskTitle}" deleted successfully!`,
          })
        } catch (err: any) {
          console.error('Delete task error:', err)
          toast({
            title: "Error",
            description: "Failed to delete task: " + (err.message || 'Please try again.'),
            variant: "destructive",
          })
        }
      }
    })
  }

  // Filter Functions
  const filteredTechnicians = technicians.filter((tech) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = tech.profileDetail?.name?.toLowerCase().includes(searchLower) ||
                         tech.profileDetail?.phone?.includes(searchTerm) ||
                         tech.profileDetail?.area?.toLowerCase().includes(searchLower) ||
                         tech.email?.toLowerCase().includes(searchLower)
    
    const techStatus = tech.status || 'active'
    const matchesStatus = statusFilter === "all" || techStatus === statusFilter
    
    const techAttendance = tech.attendance || 'present'
    const matchesAttendance = attendanceFilter === "all" || techAttendance === attendanceFilter
    
    return matchesSearch && matchesStatus && matchesAttendance
  })

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = taskStatusFilter === "all" || task.status === taskStatusFilter
    return matchesStatus
  })

  // Utility Functions
  const getStatusBadge = (status?: string) => {
    const effectiveStatus = status || 'active'
    const statusConfig = {
      active: "bg-green-50 text-green-700 border-green-200",
      inactive: "bg-red-50 text-red-700 border-red-200",
      on_leave: "bg-yellow-50 text-yellow-700 border-yellow-200"
    }
    
    return (
      <Badge className={`${statusConfig[effectiveStatus as keyof typeof statusConfig] || "bg-gray-50 text-gray-700 border-gray-200"} font-medium`}>
        {effectiveStatus}
      </Badge>
    )
  }

  const getAttendanceBadge = (attendance?: string) => {
    const effectiveAttendance = attendance || 'present'
    const attendanceConfig = {
      present: "bg-green-50 text-green-700 border-green-200",
      absent: "bg-red-50 text-red-700 border-red-200",
      leave: "bg-orange-50 text-orange-700 border-orange-200"
    }
    
    return (
      <Badge className={`${attendanceConfig[effectiveAttendance as keyof typeof attendanceConfig]} font-medium`}>
        {effectiveAttendance}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      high: "bg-red-50 text-red-700 border-red-200",
      medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
      low: "bg-blue-50 text-blue-700 border-blue-200"
    }
    
    return (
      <Badge className={`${priorityConfig[priority as keyof typeof priorityConfig]} font-medium`}>
        {priority}
      </Badge>
    )
  }

  const getTaskStatusBadge = (status: string) => {
    const statusConfig = {
      completed: "bg-green-50 text-green-700 border-green-200",
      in_progress: "bg-blue-50 text-blue-700 border-blue-200",
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      cancelled: "bg-red-50 text-red-700 border-red-200"
    }
    
    return (
      <Badge className={`${statusConfig[status as keyof typeof statusConfig]} font-medium`}>
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  const getTechnicianDisplayId = (userId: string) => {
    if (!userId || typeof userId !== 'string') return 'N/A'
    return userId.length > 8 ? userId.substring(0, 8) : userId
  }

  return (
    <DashboardLayout title="Technician Management" description="Manage field staff and task assignments">
      <div className="min-h-screen bg-gray-50 overflow-hidden">
        <div className="grid grid-cols-1">
          <main className="h-[calc(100vh-4rem)]">
            <div className="max-w-7xl mx-auto">
              <div className="space-y-4">
                {/* Error Alert */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                      <p className="text-red-800">{error}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={fetchTechnicians}
                        className="ml-auto"
                      >
                        Retry
                      </Button>
                    </div>
                  </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  {[
                    {
                      title: "Total Technicians",
                      value: totalTechnicians,
                      description: "Registered technicians",
                      icon: Users,
                      gradient: "from-blue-50 to-blue-100",
                      iconBg: "bg-blue-500"
                    },
                    {
                      title: "Active",
                      value: activeTechnicians,
                      description: "Active technicians",
                      icon: UserCheck,
                      gradient: "from-green-50 to-green-100",
                      iconBg: "bg-green-500"
                    },
                    {
                      title: "Total Tasks",
                      value: totalTasks,
                      description: "All assigned tasks",
                      icon: Target,
                      gradient: "from-purple-50 to-purple-100",
                      iconBg: "bg-purple-500"
                    },
                    {
                      title: "Completed",
                      value: completedTasks,
                      description: "Finished tasks",
                      icon: Award,
                      gradient: "from-orange-50 to-orange-100",
                      iconBg: "bg-orange-500"
                    }
                  ].map((stat, index) => (
                    <Card key={`stat-card-${index}`} className={`border-0 shadow-lg bg-gradient-to-br ${stat.gradient}`}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 lg:px-6">
                        <CardTitle className="text-xs sm:text-sm font-medium text-gray-700 truncate">{stat.title}</CardTitle>
                        <div className={`p-2 ${stat.iconBg} rounded-lg flex-shrink-0`}>
                          <stat.icon className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                        </div>
                      </CardHeader>
                      <CardContent className="px-4 lg:px-6">
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">{stat.value}</div>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">{stat.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Header Section */}
                <div className="flex flex-col space-y-4">
                  {/* Search and Filter Section */}
                  <Card className="shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            placeholder="Search technicians by name, phone, or area..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-10"
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-48 h-10">
                              <Filter className="h-4 w-4 mr-2" />
                              <SelectValue placeholder="Filter by Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="on_leave">On Leave</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select value={attendanceFilter} onValueChange={setAttendanceFilter}>
                            <SelectTrigger className="w-full sm:w-48 h-10">
                              <Filter className="h-4 w-4 mr-2" />
                              <SelectValue placeholder="Filter by Attendance" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Attendance</SelectItem>
                              <SelectItem value="present">Present</SelectItem>
                              <SelectItem value="absent">Absent</SelectItem>
                              <SelectItem value="leave">On Leave</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons Section */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchTechnicians}
                        disabled={loading}
                        className="h-9"
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                        Refresh ({filteredTechnicians.length})
                      </Button>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <Dialog open={isCreateTaskDialogOpen} onOpenChange={setIsCreateTaskDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="h-9">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Task
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Create New Task</DialogTitle>
                            <DialogDescription>
                              Create and assign a new task to a technician
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                            <div className="col-span-1 md:col-span-2 space-y-2">
                              <Label htmlFor="taskTitle" className="text-sm font-medium">
                                Task Title *
                              </Label>
                              <Input
                                id="taskTitle"
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                placeholder="e.g., Fiber Installation - Sector 15"
                              />
                            </div>
                            <div className="col-span-1 md:col-span-2 space-y-2">
                              <Label htmlFor="taskDescription" className="text-sm font-medium">
                                Description
                              </Label>
                              <Textarea
                                id="taskDescription"
                                value={newTask.description}
                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                placeholder="Detailed task description..."
                                rows={3}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="technician" className="text-sm font-medium">
                                Assign to Technician *
                              </Label>
                              <Select
                                value={newTask.technicianId}
                                onValueChange={(value) => setNewTask({ ...newTask, technicianId: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select technician" />
                                </SelectTrigger>
                                <SelectContent>
                                  {filteredTechnicians
                                    .filter((tech) => (tech.status || 'active') === "active")
                                    .map((tech, index) => (
                                      <SelectItem key={`tech-option-${tech.userId}-${index}`} value={tech.userId}>
                                        {tech.profileDetail?.name || 'Unknown'} - {tech.profileDetail?.area || 'No Area'}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="priority" className="text-sm font-medium">
                                Priority
                              </Label>
                              <Select
                                value={newTask.priority}
                                onValueChange={(value) => setNewTask({ ...newTask, priority: value as any })}
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
                              <Label htmlFor="customerName" className="text-sm font-medium">
                                Customer Name
                              </Label>
                              <Input
                                id="customerName"
                                value={newTask.customerName}
                                onChange={(e) => setNewTask({ ...newTask, customerName: e.target.value })}
                                placeholder="Customer name"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="customerPhone" className="text-sm font-medium">
                                Customer Phone
                              </Label>
                              <Input
                                id="customerPhone"
                                value={newTask.customerPhone}
                                onChange={(e) => setNewTask({ ...newTask, customerPhone: e.target.value })}
                                placeholder="+91 9876543210"
                              />
                            </div>
                            <div className="col-span-1 md:col-span-2 space-y-2">
                              <Label htmlFor="address" className="text-sm font-medium">
                                Address
                              </Label>
                              <Input
                                id="address"
                                value={newTask.address}
                                onChange={(e) => setNewTask({ ...newTask, address: e.target.value })}
                                placeholder="Complete address"
                              />
                            </div>
                            <div className="col-span-1 md:col-span-2 space-y-2">
                              <Label htmlFor="dueDate" className="text-sm font-medium">
                                Due Date *
                              </Label>
                              <Input
                                id="dueDate"
                                type="datetime-local"
                                value={newTask.dueDate}
                                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                              />
                            </div>
                          </div>
                          <DialogFooter className="gap-2">
                            <Button 
                              variant="outline" 
                              onClick={() => setIsCreateTaskDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleCreateTask}>
                              Create Task
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={isAddTechDialogOpen} onOpenChange={setIsAddTechDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="h-9">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Technician
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Add New Technician</DialogTitle>
                            <DialogDescription>
                              Add a new technician to your team
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="name" className="text-sm font-medium">
                                Full Name *
                              </Label>
                              <Input
                                id="name"
                                value={newTechnician.name}
                                onChange={(e) => setNewTechnician({ ...newTechnician, name: e.target.value })}
                                placeholder="Enter full name"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="phone" className="text-sm font-medium">
                                Phone Number *
                              </Label>
                              <Input
                                id="phone"
                                value={newTechnician.phone}
                                onChange={(e) => setNewTechnician({ ...newTechnician, phone: e.target.value })}
                                placeholder="+91 9876543210"
                              />
                            </div>
                            <div className="col-span-1 md:col-span-2 space-y-2">
                              <Label htmlFor="email" className="text-sm font-medium">
                                Email Address *
                              </Label>
                              <Input
                                id="email"
                                type="email"
                                value={newTechnician.email}
                                onChange={(e) => setNewTechnician({ ...newTechnician, email: e.target.value })}
                                placeholder="technician@network.com"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="area" className="text-sm font-medium">
                                Assigned Area
                              </Label>
                              <Input
                                id="area"
                                value={newTechnician.area}
                                onChange={(e) => setNewTechnician({ ...newTechnician, area: e.target.value })}
                                placeholder="Zone A"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="specialization" className="text-sm font-medium">
                                Specialization
                              </Label>
                              <Select
                                value={newTechnician.specialization}
                                onValueChange={(value) => setNewTechnician({ ...newTechnician, specialization: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select specialization" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Fiber Installation">Fiber Installation</SelectItem>
                                  <SelectItem value="Network Troubleshooting">Network Troubleshooting</SelectItem>
                                  <SelectItem value="Hardware Repair">Hardware Repair</SelectItem>
                                  <SelectItem value="ONU Configuration">ONU Configuration</SelectItem>
                                  <SelectItem value="General Maintenance">General Maintenance</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="salary" className="text-sm font-medium">
                                Monthly Salary (₹)
                              </Label>
                              <Input
                                id="salary"
                                type="number"
                                value={newTechnician.salary}
                                onChange={(e) => setNewTechnician({ ...newTechnician, salary: e.target.value })}
                                placeholder="25000"
                              />
                            </div>
                          </div>
                          <DialogFooter className="gap-2">
                            <Button 
                              variant="outline" 
                              onClick={() => setIsAddTechDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleAddTechnician}>
                              Add Technician
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>

                {/* Main Content Card */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-semibold text-gray-900">
                          Technician Management
                        </CardTitle>
                        <CardDescription className="text-gray-600 mt-1">
                          Manage your field staff and their activities
                          {searchTerm && ` • Filtered by: "${searchTerm}"`}
                        </CardDescription>
                      </div>
                      {(loading || tasksLoading) && (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-0">
                    <Tabs defaultValue="technicians" className="w-full">
                      <div className="px-6">
                        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 bg-gray-100 p-1 rounded-lg">
                          <TabsTrigger value="technicians">Technicians</TabsTrigger>
                          <TabsTrigger value="tasks">Tasks</TabsTrigger>
                          <TabsTrigger value="reports">Reports</TabsTrigger>
                        </TabsList>
                      </div>

                      <TabsContent value="technicians" className="mt-6">
                        {/* Desktop/Tablet Table View */}
                        <div className="hidden md:block">
                          <ScrollArea className="w-full">
                            <div className="min-w-[1000px]">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-gray-50/50">
                                    <TableHead className="w-[200px] font-semibold">Technician</TableHead>
                                    <TableHead className="w-[180px] font-semibold">Contact</TableHead>
                                    <TableHead className="w-[140px] font-semibold">Area & Specialization</TableHead>
                                    <TableHead className="w-[120px] font-semibold">Status</TableHead>
                                    <TableHead className="w-[120px] font-semibold">Attendance</TableHead>
                                    <TableHead className="w-[140px] font-semibold">Performance</TableHead>
                                    <TableHead className="w-[100px] font-semibold">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {loading ? (
                                    Array(5).fill(0).map((_, i) => <TechnicianSkeleton key={`skeleton-${i}`} />)
                                  ) : (
                                    filteredTechnicians.map((tech, index) => (
                                      <TableRow key={`tech-row-${tech.userId}-${index}`} className="hover:bg-gray-50/50 transition-colors">
                                        <TableCell className="py-4">
                                          <div className="flex items-center space-x-3">
                                            <div className="bg-blue-100 p-2.5 rounded-lg flex-shrink-0">
                                              <User className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div className="min-w-0">
                                              <div className="font-medium text-gray-900 truncate">
                                                {tech.profileDetail?.name || 'Unknown'}
                                              </div>
                                              <div className="text-sm text-gray-500 truncate">
                                                ID: {getTechnicianDisplayId(tech.userId)}
                                              </div>
                                            </div>
                                          </div>
                                        </TableCell>
                                        
                                        <TableCell className="py-4">
                                          <div className="space-y-1">
                                            <div className="flex items-center text-sm text-gray-600">
                                              <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                                              <span className="truncate">{tech.profileDetail?.phone || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                              <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                                              <span className="truncate">{tech.email || 'N/A'}</span>
                                            </div>
                                          </div>
                                        </TableCell>
                                        
                                        <TableCell className="py-4">
                                          <div className="space-y-1">
                                            <div className="flex items-center text-sm text-gray-900">
                                              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                              <span className="truncate">{tech.profileDetail?.area || 'N/A'}</span>
                                            </div>
                                            <div className="text-sm text-gray-500 truncate">
                                              {tech.profileDetail?.specialization || 'General'}
                                            </div>
                                          </div>
                                        </TableCell>
                                        
                                        <TableCell className="py-4">
                                          {getStatusBadge(tech.status)}
                                        </TableCell>
                                        
                                        <TableCell className="py-4">
                                          {getAttendanceBadge(tech.attendance)}
                                        </TableCell>
                                        
                                        <TableCell className="py-4">
                                          <div>
                                            <div className="font-medium text-gray-900">
                                              ₹{tech.profileDetail?.salary?.toLocaleString() || '0'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                              {tech.tasksCompleted || 0}/{tech.tasksAssigned || 0} tasks
                                            </div>
                                          </div>
                                        </TableCell>
                                        
                                        <TableCell className="py-4">
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-48" align="end">
                                              <DropdownMenuItem
                                                onClick={() => {
                                                  setSelectedTechnician(tech)
                                                  setIsDetailsDialogOpen(true)
                                                }}
                                              >
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                              </DropdownMenuItem>
                                              <DropdownMenuItem
                                                onClick={() => handleStatusUpdate(tech.userId, 'active')}
                                              >
                                                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                                Mark Active
                                              </DropdownMenuItem>
                                              <DropdownMenuItem
                                                onClick={() => handleStatusUpdate(tech.userId, 'inactive')}
                                              >
                                                <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                                Mark Inactive
                                              </DropdownMenuItem>
                                              <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={() => handleDeleteTechnician(tech.userId, tech.profileDetail?.name || 'Unknown')}
                                              >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </TableCell>
                                      </TableRow>
                                    ))
                                  )}
                                </TableBody>
                              </Table>
                            </div>
                            <ScrollBar orientation="horizontal" />
                          </ScrollArea>
                          
                          {/* Empty State for Desktop */}
                          {filteredTechnicians.length === 0 && !loading && (
                            <div className="text-center text-gray-500 py-12">
                              <div className="flex flex-col items-center">
                                <HardHat className="h-16 w-16 text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium mb-2">No technicians found</h3>
                                {searchTerm ? (
                                  <p className="text-sm">Try adjusting your search terms or filters.</p>
                                ) : (
                                  <p className="text-sm">Get started by adding your first technician.</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden">
                          <ScrollArea className="h-[600px] w-full">
                            <div className="space-y-3 p-4">
                              {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                  <Card key={`mobile-skeleton-${i}`} className="border border-gray-200">
                                    <CardContent className="p-4 space-y-3">
                                      <Skeleton className="h-4 w-3/4" />
                                      <Skeleton className="h-4 w-1/2" />
                                      <Skeleton className="h-8 w-20" />
                                    </CardContent>
                                  </Card>
                                ))
                              ) : (
                                filteredTechnicians.map((tech, index) => (
                                  <Card key={`mobile-tech-${tech.userId}-${index}`} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                      <div className="space-y-4">
                                        {/* Header */}
                                        <div className="flex items-start justify-between">
                                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                                            <div className="bg-blue-100 p-2.5 rounded-lg flex-shrink-0">
                                              <User className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                              <h3 className="font-semibold text-gray-900 truncate text-sm">
                                                {tech.profileDetail?.name || 'Unknown'}
                                              </h3>
                                              <p className="text-xs text-gray-500 truncate">
                                                ID: {getTechnicianDisplayId(tech.userId)}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="flex items-center space-x-2 flex-shrink-0">
                                            {getStatusBadge(tech.status)}
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                  <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent className="w-48" align="end">
                                                <DropdownMenuItem onClick={() => {
                                                  setSelectedTechnician(tech)
                                                  setIsDetailsDialogOpen(true)
                                                }}>
                                                  <Eye className="h-4 w-4 mr-2" />
                                                  View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusUpdate(tech.userId, 'active')}>
                                                  <CheckCircle className="h-4 w-4 mr-2" />
                                                  Mark Active
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteTechnician(tech.userId, tech.profileDetail?.name || 'Unknown')}>
                                                  <Trash2 className="h-4 w-4 mr-2" />
                                                  Delete
                                                </DropdownMenuItem>
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          </div>
                                        </div>

                                        {/* Details */}
                                        <div className="space-y-2">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                              <MapPin className="h-3 w-3 text-gray-400" />
                                              <span className="text-sm text-gray-600">{tech.profileDetail?.area || 'N/A'}</span>
                                            </div>
                                            {getAttendanceBadge(tech.attendance)}
                                          </div>
                                          
                                          <div className="grid grid-cols-1 gap-2">
                                            <div className="flex items-center text-sm text-gray-600">
                                              <Phone className="h-3 w-3 mr-2 flex-shrink-0" />
                                              {tech.profileDetail?.phone || 'N/A'}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                              <Mail className="h-3 w-3 mr-2 flex-shrink-0" />
                                              {tech.email || 'N/A'}
                                            </div>
                                          </div>

                                          <div className="pt-2 border-t border-gray-100 flex justify-between text-sm">
                                            <span className="text-gray-500">{tech.profileDetail?.specialization || 'General'}</span>
                                            <span className="font-medium">₹{tech.profileDetail?.salary?.toLocaleString() || '0'}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))
                              )}

                              {/* Empty State for Mobile */}
                              {filteredTechnicians.length === 0 && !loading && (
                                <div className="text-center text-gray-500 py-12">
                                  <HardHat className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                                  <h3 className="text-lg font-medium mb-2">No technicians found</h3>
                                  {searchTerm ? (
                                    <p className="text-sm">Try adjusting your search terms or filters.</p>
                                  ) : (
                                    <p className="text-sm">Get started by adding your first technician.</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </div>
                      </TabsContent>

                      <TabsContent value="tasks" className="mt-6">
                        <div className="px-6 mb-4">
                          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            <h3 className="text-lg font-semibold text-gray-900">Task Management</h3>
                            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                              <Select value={taskStatusFilter} onValueChange={setTaskStatusFilter}>
                                <SelectTrigger className="w-full sm:w-[150px] h-9">
                                  <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All Status</SelectItem>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button onClick={() => setIsCreateTaskDialogOpen(true)} className="h-9">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Task
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Desktop Tasks Table */}
                        <div className="hidden md:block">
                          <ScrollArea className="w-full">
                            <div className="min-w-[1000px]">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-gray-50/50">
                                    <TableHead className="w-[200px] font-semibold">Task</TableHead>
                                    <TableHead className="w-[150px] font-semibold">Technician</TableHead>
                                    <TableHead className="w-[100px] font-semibold">Priority</TableHead>
                                    <TableHead className="w-[120px] font-semibold">Status</TableHead>
                                    <TableHead className="w-[180px] font-semibold">Customer</TableHead>
                                    <TableHead className="w-[150px] font-semibold">Due Date</TableHead>
                                    <TableHead className="w-[100px] font-semibold">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {tasksLoading ? (
                                    Array(5).fill(0).map((_, i) => (
                                      <TableRow key={`task-skeleton-${i}`}>
                                        <TableCell><Skeleton className="h-4 w-[180px]" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-[90px]" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-[140px]" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-[80px]" /></TableCell>
                                      </TableRow>
                                    ))
                                  ) : (
                                    filteredTasks.map((task, index) => (
                                      <TableRow key={`task-row-${task.taskId}-${index}`} className="hover:bg-gray-50/50 transition-colors">
                                        <TableCell className="py-4">
                                          <div>
                                            <div className="font-medium text-gray-900 truncate">{task.title}</div>
                                            <div className="text-sm text-gray-500 truncate">
                                              {task.taskId}    {task?.technicianName}
                                            </div>
                                          </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                          <div className="flex items-center space-x-2">
                                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                              <User className="h-3 w-3 text-green-600" />
                                            </div>
                                            <span className="text-sm font-medium truncate">
                                              {task?.technicianName}
                                            </span>
                                          </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                          {getPriorityBadge(task.priority)}
                                        </TableCell>
                                        <TableCell className="py-4">
                                          {getTaskStatusBadge(task.status)}
                                        </TableCell>
                                        <TableCell className="py-4">
                                          <div className="text-sm">
                                            <div className="font-medium truncate">{task.customerName || 'N/A'}</div>
                                     
                                          </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                          <div className="text-sm">
                                            <div className="flex items-center text-gray-600">
                                              <Clock className="h-3 w-3 mr-1" />
                                              {new Date(task.dueDate).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              {new Date(task.dueDate).toLocaleTimeString()}
                                            </div>
                                          </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-48" align="end">
                                              <DropdownMenuItem
                                                onClick={() => {
                                                  setSelectedTask(task)
                                                  setIsDetailsDialogOpen(true)
                                                }}
                                              >
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                              </DropdownMenuItem>
                                              <DropdownMenuItem
                                                onClick={() => handleTaskStatusUpdate(task.taskId, 'in_progress')}
                                              >
                                                <Clock className="h-4 w-4 mr-2 text-blue-600" />
                                                Mark In Progress
                                              </DropdownMenuItem>
                                              <DropdownMenuItem
                                                onClick={() => handleTaskStatusUpdate(task.taskId, 'completed')}
                                              >
                                                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                                Mark Completed
                                              </DropdownMenuItem>
                                              <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={() => handleDeleteTask(task.taskId, task.title)}
                                              >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete Task
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </TableCell>
                                      </TableRow>
                                    ))
                                  )}
                                </TableBody>
                              </Table>
                            </div>
                            <ScrollBar orientation="horizontal" />
                          </ScrollArea>

                          {/* Tasks Empty State */}
                          {filteredTasks.length === 0 && !tasksLoading && (
                            <div className="text-center text-gray-500 py-12">
                              <Target className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                              <h3 className="text-lg font-medium mb-2">No tasks found</h3>
                              <p className="text-sm">Get started by creating your first task.</p>
                            </div>
                          )}
                        </div>

                        {/* Mobile Tasks View */}
                        <div className="md:hidden">
                          <ScrollArea className="h-[600px] w-full">
                            <div className="space-y-3 px-4">
                              {tasksLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                  <Card key={`mobile-task-skeleton-${i}`} className="border border-gray-200">
                                    <CardContent className="p-4 space-y-3">
                                      <Skeleton className="h-4 w-3/4" />
                                      <Skeleton className="h-4 w-1/2" />
                                      <Skeleton className="h-8 w-20" />
                                    </CardContent>
                                  </Card>
                                ))
                              ) : (
                                filteredTasks.map((task, index) => (
                                  <Card key={`mobile-task-${task.taskId}-${index}`} className="border border-gray-200 shadow-sm">
                                    <CardContent className="p-4">
                                      <div className="space-y-3">
                                        <div className="flex justify-between items-start">
                                          <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-gray-900 truncate">{task.title}</h4>
                                            <p className="text-sm text-gray-500 truncate">{task.description}</p>
                                          </div>
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                              <DropdownMenuItem onClick={() => {
                                                setSelectedTask(task)
                                                setIsDetailsDialogOpen(true)
                                              }}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                              </DropdownMenuItem>
                                              <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={() => handleDeleteTask(task.taskId, task.title)}
                                              >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-2">
                                          {getPriorityBadge(task.priority)}
                                          {getTaskStatusBadge(task.status)}
                                        </div>
                                        
                                        <div className="space-y-2 text-sm">
                                          <div className="flex items-center text-gray-600">
                                            <User className="h-3 w-3 mr-2" />
                                            {task.technicianName || 'Assigned'}
                                          </div>
                                          {task.customerName && (
                                            <div className="flex items-center text-gray-600">
                                              <Phone className="h-3 w-3 mr-2" />
                                              {task.customerName} - {task.customerPhone}
                                            </div>
                                          )}
                                          <div className="flex items-center text-gray-600">
                                            <Clock className="h-3 w-3 mr-2" />
                                            Due: {new Date(task.dueDate).toLocaleDateString()}
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))
                              )}

                              {filteredTasks.length === 0 && !tasksLoading && (
                                <div className="text-center text-gray-500 py-12">
                                  <Target className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                                  <h3 className="text-lg font-medium mb-2">No tasks found</h3>
                                  <p className="text-sm">Get started by creating your first task.</p>
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </div>
                      </TabsContent>

                      <TabsContent value="reports" className="mt-6">
                        <div className="text-center py-12">
                          <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-700 mb-2">Performance Reports</h3>
                          <p className="text-gray-500">
                            Comprehensive reports and analytics will be displayed here.
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Details Dialog */}
                <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {selectedTechnician
                          ? `${selectedTechnician.profileDetail?.name || 'Unknown'} - Details`
                          : selectedTask
                            ? `${selectedTask.title} - Details`
                            : "Details"}
                      </DialogTitle>
                      <DialogDescription>
                        {selectedTechnician ? "Complete technician information" : "Complete task information"}
                      </DialogDescription>
                    </DialogHeader>
                    
                    {selectedTechnician && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border border-gray-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center">
                              <User className="h-4 w-4 mr-2" />
                              Personal Information
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">Name:</span>
                              <span>{selectedTechnician.profileDetail?.name || 'Unknown'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">Phone:</span>
                              <span>{selectedTechnician.profileDetail?.phone || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">Email:</span>
                              <span className="truncate">{selectedTechnician.email || 'N/A'}</span>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border border-gray-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center">
                              <HardHat className="h-4 w-4 mr-2" />
                              Work Information
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">Area:</span>
                              <span>{selectedTechnician.profileDetail?.area || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">Specialization:</span>
                              <span>{selectedTechnician.profileDetail?.specialization || 'General'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">Salary:</span>
                              <span>₹{selectedTechnician.profileDetail?.salary?.toLocaleString() || '0'}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {selectedTask && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border border-gray-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center">
                              <Target className="h-4 w-4 mr-2" />
                              Task Information
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm">
                            <div>
                              <span className="font-medium text-gray-600">Title:</span>
                              <p className="mt-1">{selectedTask.title}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Description:</span>
                              <p className="mt-1 text-gray-700">{selectedTask.description}</p>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">Priority:</span>
                              {getPriorityBadge(selectedTask.priority)}
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">Status:</span>
                              {getTaskStatusBadge(selectedTask.status)}
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border border-gray-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              Timeline
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">Assigned:</span>
                              <span>{new Date(selectedTask.assignedDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">Due Date:</span>
                              <span>{new Date(selectedTask.dueDate).toLocaleDateString()}</span>
                            </div>
                            {selectedTask.completedDate && (
                              <div className="flex justify-between">
                                <span className="font-medium text-gray-600">Completed:</span>
                                <span>{new Date(selectedTask.completedDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    <DialogFooter className="gap-2">
                      <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                        Close
                      </Button>
                      <Button>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Details
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Confirmation Dialog */}
                <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {confirmDialog.description}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={confirmDialog.action}>
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </main>
        </div>
      </div>
    </DashboardLayout>
  )
}
