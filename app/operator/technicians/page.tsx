"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Plus,
  Search,
  Eye,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  CalendarIcon,
  User,
  HardHat,
  TrendingUp,
  Target,
  Award,
  UserCheck,
} from "lucide-react"
import { format } from "date-fns"

// Demo data
const techniciansData = [
  {
    id: "TECH001",
    name: "Ravi Kumar",
    phone: "+91 9876543220",
    email: "ravi.kumar@network.com",
    area: "Zone A",
    specialization: "Fiber Installation",
    status: "active",
    attendance: "present",
    checkInTime: "09:15 AM",
    checkOutTime: null,
    location: { lat: 28.6139, lng: 77.209 },
    tasksCompleted: 45,
    tasksAssigned: 48,
    avgRating: 4.8,
    salary: 25000,
    joinDate: "2023-06-15",
    lastActive: "2024-01-15T10:30:00Z",
  },
  {
    id: "TECH002",
    name: "Suresh Singh",
    phone: "+91 9876543221",
    email: "suresh.singh@network.com",
    area: "Zone B",
    specialization: "Network Troubleshooting",
    status: "active",
    attendance: "present",
    checkInTime: "09:30 AM",
    checkOutTime: null,
    location: { lat: 28.4595, lng: 77.0266 },
    tasksCompleted: 52,
    tasksAssigned: 55,
    avgRating: 4.6,
    salary: 28000,
    joinDate: "2023-04-20",
    lastActive: "2024-01-15T11:15:00Z",
  },
  {
    id: "TECH003",
    name: "Vikash Kumar",
    phone: "+91 9876543222",
    email: "vikash.kumar@network.com",
    area: "Zone C",
    specialization: "Hardware Repair",
    status: "active",
    attendance: "absent",
    checkInTime: null,
    checkOutTime: null,
    location: null,
    tasksCompleted: 38,
    tasksAssigned: 42,
    avgRating: 4.4,
    salary: 24000,
    joinDate: "2023-08-10",
    lastActive: "2024-01-14T18:45:00Z",
  },
  {
    id: "TECH004",
    name: "Rohit Kumar",
    phone: "+91 9876543223",
    email: "rohit.kumar@network.com",
    area: "Zone D",
    specialization: "ONU Configuration",
    status: "active",
    attendance: "present",
    checkInTime: "10:00 AM",
    checkOutTime: null,
    location: { lat: 28.7041, lng: 77.1025 },
    tasksCompleted: 41,
    tasksAssigned: 44,
    avgRating: 4.7,
    salary: 26000,
    joinDate: "2023-07-05",
    lastActive: "2024-01-15T09:45:00Z",
  },
]

const tasksData = [
  {
    id: "TASK001",
    title: "Fiber Installation - Sector 15",
    description: "Install new fiber connection for customer CUST1245",
    technicianId: "TECH001",
    technicianName: "Ravi Kumar",
    priority: "high",
    status: "in_progress",
    assignedDate: "2024-01-15T08:00:00Z",
    dueDate: "2024-01-15T18:00:00Z",
    completedDate: null,
    customerName: "Rajesh Kumar",
    customerPhone: "+91 9876543210",
    address: "Sector 15, Noida",
  },
  {
    id: "TASK002",
    title: "Speed Issue Resolution",
    description: "Resolve slow internet speed complaint",
    technicianId: "TECH002",
    technicianName: "Suresh Singh",
    priority: "medium",
    status: "completed",
    assignedDate: "2024-01-14T10:00:00Z",
    dueDate: "2024-01-15T16:00:00Z",
    completedDate: "2024-01-15T14:30:00Z",
    customerName: "Priya Singh",
    customerPhone: "+91 9876543211",
    address: "Sector 22, Gurgaon",
  },
]

const attendanceData = [
  { date: "2024-01-15", present: 15, absent: 3, leave: 2, total: 20 },
  { date: "2024-01-14", present: 17, absent: 2, leave: 1, total: 20 },
  { date: "2024-01-13", present: 16, absent: 3, leave: 1, total: 20 },
  { date: "2024-01-12", present: 18, absent: 1, leave: 1, total: 20 },
  { date: "2024-01-11", present: 19, absent: 1, leave: 0, total: 20 },
]

const technicianStats = {
  totalTechnicians: 18,
  activeTechnicians: 15,
  presentToday: 15,
  absentToday: 3,
  onLeave: 2,
  avgTaskCompletion: 92.5,
  totalTasksToday: 28,
  completedTasksToday: 22,
}

export default function TechnicianManagement() {
  const [technicians, setTechnicians] = useState(techniciansData)
  const [tasks, setTasks] = useState(tasksData)
  const [selectedTechnician, setSelectedTechnician] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [isAddTechDialogOpen, setIsAddTechDialogOpen] = useState(false)
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [attendanceFilter, setAttendanceFilter] = useState("all")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [newTechnician, setNewTechnician] = useState({
    name: "",
    phone: "",
    email: "",
    area: "",
    specialization: "",
    salary: "",
  })
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    technicianId: "",
    priority: "medium",
    customerName: "",
    customerPhone: "",
    address: "",
    dueDate: "",
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      case "on_leave":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getAttendanceColor = (attendance: string) => {
    switch (attendance) {
      case "present":
        return "bg-green-100 text-green-800"
      case "absent":
        return "bg-red-100 text-red-800"
      case "leave":
        return "bg-yellow-100 text-yellow-800"
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

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredTechnicians = technicians.filter((tech) => {
    const matchesSearch =
      tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.phone.includes(searchTerm) ||
      tech.area.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || tech.status === statusFilter
    const matchesAttendance = attendanceFilter === "all" || tech.attendance === attendanceFilter
    return matchesSearch && matchesStatus && matchesAttendance
  })

  const handleAddTechnician = () => {
    const technician = {
      id: `TECH${String(technicians.length + 1).padStart(3, "0")}`,
      name: newTechnician.name,
      phone: newTechnician.phone,
      email: newTechnician.email,
      area: newTechnician.area,
      specialization: newTechnician.specialization,
      status: "active",
      attendance: "absent",
      checkInTime: null,
      checkOutTime: null,
      location: null,
      tasksCompleted: 0,
      tasksAssigned: 0,
      avgRating: 0,
      salary: Number.parseFloat(newTechnician.salary),
      joinDate: new Date().toISOString().split("T")[0],
      lastActive: new Date().toISOString(),
    }
    setTechnicians([...technicians, technician])
    setNewTechnician({
      name: "",
      phone: "",
      email: "",
      area: "",
      specialization: "",
      salary: "",
    })
    setIsAddTechDialogOpen(false)
  }

  const handleAddTask = () => {
    const task = {
      id: `TASK${String(tasks.length + 1).padStart(3, "0")}`,
      title: newTask.title,
      description: newTask.description,
      technicianId: newTask.technicianId,
      technicianName: technicians.find((t) => t.id === newTask.technicianId)?.name || "",
      priority: newTask.priority,
      status: "pending",
      assignedDate: new Date().toISOString(),
      dueDate: new Date(newTask.dueDate).toISOString(),
      completedDate: null,
      customerName: newTask.customerName,
      customerPhone: newTask.customerPhone,
      address: newTask.address,
    }
    setTasks([task, ...tasks])
    setNewTask({
      title: "",
      description: "",
      technicianId: "",
      priority: "medium",
      customerName: "",
      customerPhone: "",
      address: "",
      dueDate: "",
    })
    setIsAddTaskDialogOpen(false)
  }

  const handleStatusUpdate = (techId, newStatus) => {
    setTechnicians(technicians.map((tech) => (tech.id === techId ? { ...tech, status: newStatus } : tech)))
  }

  const handleTaskStatusUpdate = (taskId, newStatus) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: newStatus,
              completedDate: newStatus === "completed" ? new Date().toISOString() : null,
            }
          : task,
      ),
    )
  }

  return (
    <DashboardLayout title="Operator Dashboard" description="Overview of your network operations">
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-4 sm:p-6 space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Technician Management</h1>
            <p className="text-gray-600 mt-1">Manage field staff, attendance, and task assignments</p>
          </div>
          <div className="flex space-x-3">
            <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-white/80 backdrop-blur-sm">
                  <Target className="h-4 w-4 mr-2" />
                  Assign Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Assign New Task</DialogTitle>
                  <DialogDescription>Create and assign a new task to a technician</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="taskTitle">Task Title</Label>
                    <Input
                      id="taskTitle"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="e.g., Fiber Installation - Sector 15"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="taskDescription">Description</Label>
                    <Textarea
                      id="taskDescription"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="Detailed task description..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="technician">Assign to Technician</Label>
                    <Select
                      value={newTask.technicianId}
                      onValueChange={(value) => setNewTask({ ...newTask, technicianId: value })}
                    >
                      <SelectTrigger className="bg-white/80 backdrop-blur-sm">
                        <SelectValue placeholder="Select technician" />
                      </SelectTrigger>
                      <SelectContent>
                        {technicians
                          .filter((tech) => tech.status === "active")
                          .map((tech) => (
                            <SelectItem key={tech.id} value={tech.id}>
                              {tech.name} - {tech.area}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                    >
                      <SelectTrigger className="bg-white/80 backdrop-blur-sm">
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
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input
                      id="customerName"
                      value={newTask.customerName}
                      onChange={(e) => setNewTask({ ...newTask, customerName: e.target.value })}
                      placeholder="Customer name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Customer Phone</Label>
                    <Input
                      id="customerPhone"
                      value={newTask.customerPhone}
                      onChange={(e) => setNewTask({ ...newTask, customerPhone: e.target.value })}
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={newTask.address}
                      onChange={(e) => setNewTask({ ...newTask, address: e.target.value })}
                      placeholder="Complete address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="datetime-local"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddTaskDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddTask} className="bg-blue-600 hover:bg-blue-700">
                    Assign Task
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={isAddTechDialogOpen} onOpenChange={setIsAddTechDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Technician
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Technician</DialogTitle>
                  <DialogDescription>Add a new technician to your team</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={newTechnician.name}
                      onChange={(e) => setNewTechnician({ ...newTechnician, name: e.target.value })}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={newTechnician.phone}
                      onChange={(e) => setNewTechnician({ ...newTechnician, phone: e.target.value })}
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newTechnician.email}
                      onChange={(e) => setNewTechnician({ ...newTechnician, email: e.target.value })}
                      placeholder="technician@network.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">Assigned Area</Label>
                    <Input
                      id="area"
                      value={newTechnician.area}
                      onChange={(e) => setNewTechnician({ ...newTechnician, area: e.target.value })}
                      placeholder="Zone A"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Select
                      value={newTechnician.specialization}
                      onValueChange={(value) => setNewTechnician({ ...newTechnician, specialization: value })}
                    >
                      <SelectTrigger className="bg-white/80 backdrop-blur-sm">
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
                    <Label htmlFor="salary">Monthly Salary (₹)</Label>
                    <Input
                      id="salary"
                      type="number"
                      value={newTechnician.salary}
                      onChange={(e) => setNewTechnician({ ...newTechnician, salary: e.target.value })}
                      placeholder="25000"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddTechDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddTechnician} className="bg-blue-600 hover:bg-blue-700">
                    Add Technician
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Technicians</CardTitle>
              <HardHat className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{technicianStats.totalTechnicians}</div>
              <div className="flex items-center space-x-2 mt-2">
                <Badge className="bg-green-100 text-green-800 text-xs">
                  {technicianStats.activeTechnicians} active
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Present Today</CardTitle>
              <UserCheck className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{technicianStats.presentToday}</div>
              <div className="flex items-center space-x-2 mt-2">
                <Badge className="bg-red-100 text-red-800 text-xs">{technicianStats.absentToday} absent</Badge>
                <Badge className="bg-yellow-100 text-yellow-800 text-xs">{technicianStats.onLeave} on leave</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Task Completion</CardTitle>
              <Award className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{technicianStats.avgTaskCompletion}%</div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600 font-medium">+5.2%</span>
                <span className="text-sm text-gray-500 ml-1">vs last week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Tasks Today</CardTitle>
              <Target className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {technicianStats.completedTasksToday}/{technicianStats.totalTasksToday}
              </div>
              <div className="flex items-center mt-2">
                <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600 font-medium">
                  {Math.round((technicianStats.completedTasksToday / technicianStats.totalTasksToday) * 100)}% completed
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Technician Management</CardTitle>
            <CardDescription>Manage your field staff and their activities</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="technicians" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm">
                <TabsTrigger value="technicians">Technicians</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>

              <TabsContent value="technicians" className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search technicians by name, phone, or area..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white/80 backdrop-blur-sm"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px] bg-white/80 backdrop-blur-sm">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={attendanceFilter} onValueChange={setAttendanceFilter}>
                    <SelectTrigger className="w-[180px] bg-white/80 backdrop-blur-sm">
                      <SelectValue placeholder="Filter by attendance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Attendance</SelectItem>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                      <SelectItem value="leave">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Technician</TableHead>
                        <TableHead>Area</TableHead>
                        <TableHead>Specialization</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Attendance</TableHead>
                        <TableHead>Tasks</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTechnicians.map((tech) => (
                        <TableRow key={tech.id} className="hover:bg-gray-50 transition-colors">
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{tech.name}</div>
                              <div className="text-sm text-gray-500">{tech.phone}</div>
                              <div className="text-sm text-gray-500">{tech.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                              {tech.area}
                            </div>
                          </TableCell>
                          <TableCell>{tech.specialization}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(tech.status)}>{tech.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <Badge className={getAttendanceColor(tech.attendance)}>{tech.attendance}</Badge>
                              {tech.checkInTime && (
                                <div className="text-xs text-gray-500 mt-1">In: {tech.checkInTime}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>
                                {tech.tasksCompleted}/{tech.tasksAssigned}
                              </div>
                              <div className="text-xs text-gray-500">
                                {Math.round((tech.tasksCompleted / tech.tasksAssigned) * 100) || 0}% completion
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Award className="h-4 w-4 text-yellow-500 mr-1" />
                              <span>{tech.avgRating}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedTechnician(tech)
                                  setIsDetailsDialogOpen(true)
                                }}
                                className="hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Select value={tech.status} onValueChange={(value) => handleStatusUpdate(tech.id, value)}>
                                <SelectTrigger className="w-[100px] bg-white/80 backdrop-blur-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="inactive">Inactive</SelectItem>
                                  <SelectItem value="on_leave">On Leave</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="attendance" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Attendance Overview</h3>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="bg-white/80 backdrop-blur-sm">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(selectedDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Present</p>
                          <p className="text-2xl font-bold text-green-600">15</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Absent</p>
                          <p className="text-2xl font-bold text-red-600">3</p>
                        </div>
                        <XCircle className="h-8 w-8 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">On Leave</p>
                          <p className="text-2xl font-bold text-yellow-600">2</p>
                        </div>
                        <Clock className="h-8 w-8 text-yellow-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total</p>
                          <p className="text-2xl font-bold text-blue-600">20</p>
                        </div>
                        <User className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Technician</TableHead>
                        <TableHead>Check In</TableHead>
                        <TableHead>Check Out</TableHead>
                        <TableHead>Hours Worked</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {technicians.map((tech) => (
                        <TableRow key={tech.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="bg-blue-100 p-2 rounded-full mr-3">
                                <User className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium">{tech.name}</div>
                                <div className="text-sm text-gray-500">{tech.area}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{tech.checkInTime || "-"}</TableCell>
                          <TableCell>{tech.checkOutTime || "-"}</TableCell>
                          <TableCell>
                            {tech.checkInTime && tech.checkOutTime ? "8h 30m" : tech.checkInTime ? "In Progress" : "-"}
                          </TableCell>
                          <TableCell>
                            {tech.location ? (
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 text-green-600 mr-1" />
                                <span className="text-sm text-green-600">Tracked</span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">No location</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={getAttendanceColor(tech.attendance)}>{tech.attendance}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="tasks" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Task Management</h3>
                  <Button onClick={() => setIsAddTaskDialogOpen(true)} className="bg-white/80 backdrop-blur-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Assign Task
                  </Button>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Technician</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">{task.id}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{task.title}</div>
                              <div className="text-sm text-gray-500">{task.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>{task.technicianName}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{task.customerName}</div>
                              <div className="text-sm text-gray-500">{task.customerPhone}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={task.status}
                              onValueChange={(value) => handleTaskStatusUpdate(task.id, value)}
                            >
                              <SelectTrigger className="w-[130px] bg-white/80 backdrop-blur-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{new Date(task.dueDate).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-500">{new Date(task.dueDate).toLocaleTimeString()}</div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedTask(task)
                                setIsDetailsDialogOpen(true)
                              }}
                              className="hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="reports" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle>Performance Summary</CardTitle>
                      <CardDescription>Overall technician performance metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Average Task Completion Rate</span>
                          <span className="text-sm font-bold text-green-600">92.5%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Average Response Time</span>
                          <span className="text-sm font-bold text-blue-600">2.3 hours</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Customer Satisfaction</span>
                          <span className="text-sm font-bold text-purple-600">4.6/5.0</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Attendance Rate</span>
                          <span className="text-sm font-bold text-orange-600">88.9%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle>Top Performers</CardTitle>
                      <CardDescription>Best performing technicians this month</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {technicians
                          .sort((a, b) => b.avgRating - a.avgRating)
                          .slice(0, 3)
                          .map((tech, index) => (
                            <div key={tech.name} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mr-3 ${
                                    index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-orange-500"
                                  }`}
                                >
                                  {index + 1}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{tech.name}</div>
                                  <div className="text-sm text-gray-500">{tech.area}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-gray-900">{tech.avgRating}</div>
                                <div className="text-sm text-gray-500">{tech.tasksCompleted} tasks</div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Technician Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {selectedTechnician
                  ? `${selectedTechnician.name} - Details`
                  : selectedTask
                    ? `Task ${selectedTask.id} - Details`
                    : "Details"}
              </DialogTitle>
              <DialogDescription>
                {selectedTechnician ? "Complete technician information and performance" : "Complete task information"}
              </DialogDescription>
            </DialogHeader>
            {selectedTechnician && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Personal Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Name:</span> {selectedTechnician.name}
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span> {selectedTechnician.phone}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {selectedTechnician.email}
                      </div>
                      <div>
                        <span className="font-medium">Join Date:</span> {selectedTechnician.joinDate}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Work Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Area:</span> {selectedTechnician.area}
                      </div>
                      <div>
                        <span className="font-medium">Specialization:</span> {selectedTechnician.specialization}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>{" "}
                        <Badge className={getStatusColor(selectedTechnician.status)}>{selectedTechnician.status}</Badge>
                      </div>
                      <div>
                        <span className="font-medium">Salary:</span> ₹{selectedTechnician.salary.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Performance</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Tasks Completed:</span> {selectedTechnician.tasksCompleted}
                      </div>
                      <div>
                        <span className="font-medium">Tasks Assigned:</span> {selectedTechnician.tasksAssigned}
                      </div>
                      <div>
                        <span className="font-medium">Completion Rate:</span>{" "}
                        {Math.round((selectedTechnician.tasksCompleted / selectedTechnician.tasksAssigned) * 100) || 0}%
                      </div>
                      <div>
                        <span className="font-medium">Average Rating:</span> {selectedTechnician.avgRating}/5.0
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Today's Status</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Attendance:</span>{" "}
                        <Badge className={getAttendanceColor(selectedTechnician.attendance)}>
                          {selectedTechnician.attendance}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Check In:</span>{" "}
                        {selectedTechnician.checkInTime || "Not checked in"}
                      </div>
                      <div>
                        <span className="font-medium">Check Out:</span>{" "}
                        {selectedTechnician.checkOutTime || "Not checked out"}
                      </div>
                      <div>
                        <span className="font-medium">Last Active:</span>{" "}
                        {new Date(selectedTechnician.lastActive).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {selectedTask && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Task Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Title:</span> {selectedTask.title}
                      </div>
                      <div>
                        <span className="font-medium">Description:</span> {selectedTask.description}
                      </div>
                      <div>
                        <span className="font-medium">Priority:</span>{" "}
                        <Badge className={getPriorityColor(selectedTask.priority)}>{selectedTask.priority}</Badge>
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>{" "}
                        <Badge className={getTaskStatusColor(selectedTask.status)}>{selectedTask.status}</Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Assignment Details</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Technician:</span> {selectedTask.technicianName}
                      </div>
                      <div>
                        <span className="font-medium">Customer:</span> {selectedTask.customerName}
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span> {selectedTask.customerPhone}
                      </div>
                      <div>
                        <span className="font-medium">Address:</span> {selectedTask.address}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Timeline</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Assigned:</span>{" "}
                      {new Date(selectedTask.assignedDate).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Due Date:</span> {new Date(selectedTask.dueDate).toLocaleString()}
                    </div>
                    {selectedTask.completedDate && (
                      <div>
                        <span className="font-medium">Completed:</span>{" "}
                        {new Date(selectedTask.completedDate).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                Close
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Edit Element
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
    </DashboardLayout>
  )
}
