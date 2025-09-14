"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Search,
  MapPin,
  Navigation,
  Wifi,
  WifiOff,
  Router,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Activity,
  Signal,
  Save,
  Layers,
  Target,
  Camera,
} from "lucide-react"

// Mock network data
const mockNetworkNodes = [
  {
    id: "NODE-001",
    type: "fiber_hub",
    name: "Main Distribution Hub",
    location: {
      address: "Central Exchange, Sector 17, Chandigarh",
      coordinates: { lat: 30.7333, lng: 76.7794 },
    },
    status: "active",
    capacity: 1000,
    currentLoad: 750,
    connectedNodes: 15,
    lastMaintenance: "2024-01-15",
    technician: "Rajesh Kumar",
    issues: [],
  },
  {
    id: "NODE-002",
    type: "distribution_point",
    name: "Sector 15 Distribution Point",
    location: {
      address: "Near Community Center, Sector 15, Chandigarh",
      coordinates: { lat: 30.7425, lng: 76.7681 },
    },
    status: "active",
    capacity: 200,
    currentLoad: 180,
    connectedNodes: 8,
    lastMaintenance: "2024-01-10",
    technician: "Priya Singh",
    issues: ["High load warning"],
  },
  {
    id: "NODE-003",
    type: "customer_premises",
    name: "Rajesh Kumar - House 123",
    location: {
      address: "House 123, Sector 15, Chandigarh",
      coordinates: { lat: 30.7445, lng: 76.7701 },
    },
    status: "active",
    capacity: 1,
    currentLoad: 1,
    connectedNodes: 0,
    lastMaintenance: "2024-01-18",
    technician: "Amit Sharma",
    issues: [],
    customerInfo: {
      name: "Rajesh Kumar",
      phone: "+91 9876543210",
      plan: "100 Mbps Unlimited",
      connectionType: "Fiber",
    },
  },
  {
    id: "NODE-004",
    type: "distribution_point",
    name: "Sector 22 Distribution Point",
    location: {
      address: "Market Area, Sector 22, Chandigarh",
      coordinates: { lat: 30.7614, lng: 76.7911 },
    },
    status: "maintenance",
    capacity: 150,
    currentLoad: 0,
    connectedNodes: 6,
    lastMaintenance: "2024-01-20",
    technician: "Neha Gupta",
    issues: ["Scheduled maintenance", "Fiber cable replacement"],
  },
  {
    id: "NODE-005",
    type: "customer_premises",
    name: "Priya Singh - Flat 45",
    location: {
      address: "Flat 45, Sector 22, Chandigarh",
      coordinates: { lat: 30.7634, lng: 76.7931 },
    },
    status: "issue",
    capacity: 1,
    currentLoad: 0,
    connectedNodes: 0,
    lastMaintenance: "2024-01-19",
    technician: "Amit Sharma",
    issues: ["No signal", "Possible fiber cut"],
    customerInfo: {
      name: "Priya Singh",
      phone: "+91 9876543211",
      plan: "50 Mbps Unlimited",
      connectionType: "Fiber",
    },
  },
]

const mockTasks = [
  {
    id: "TASK-001",
    nodeId: "NODE-004",
    type: "maintenance",
    title: "Fiber cable replacement",
    priority: "high",
    assignedTo: "Neha Gupta",
    dueDate: "2024-01-21",
    status: "in_progress",
  },
  {
    id: "TASK-002",
    nodeId: "NODE-005",
    type: "repair",
    title: "Investigate signal loss",
    priority: "high",
    assignedTo: "Amit Sharma",
    dueDate: "2024-01-20",
    status: "pending",
  },
  {
    id: "TASK-003",
    nodeId: "NODE-002",
    type: "inspection",
    title: "Load balancing check",
    priority: "medium",
    assignedTo: "Priya Singh",
    dueDate: "2024-01-22",
    status: "pending",
  },
]

// Simple ReportIssueForm component definition
function ReportIssueForm() {
  return (
    <form className="space-y-4">
      <Input placeholder="Describe the issue..." />
      <Button type="submit" className="w-full">Submit Issue</Button>
    </form>
  )
}

export default function NetworkMapPage() {
  const [nodes, setNodes] = useState(mockNetworkNodes)
  const [tasks, setTasks] = useState(mockTasks)
  const [searchTerm, setSearchTerm] = useState("")
  const [nodeTypeFilter, setNodeTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedNode, setSelectedNode] = useState<any>(null)
  const [showNodeDetails, setShowNodeDetails] = useState(false)
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [mapView, setMapView] = useState("topology")
  const [hasChanges, setHasChanges] = useState(false)

  const filteredNodes = nodes.filter((node) => {
    const matchesSearch = 
      node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.location.address.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = nodeTypeFilter === "all" || node.type === nodeTypeFilter
    const matchesStatus = statusFilter === "all" || node.status === statusFilter
    
    return matchesSearch && matchesType && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800"
      case "maintenance": return "bg-yellow-100 text-yellow-800"
      case "issue": return "bg-red-100 text-red-800"
      case "offline": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="h-4 w-4 text-green-600" />
      case "maintenance": return <Clock className="h-4 w-4 text-yellow-600" />
      case "issue": return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "offline": return <WifiOff className="h-4 w-4 text-gray-600" />
      default: return <Wifi className="h-4 w-4 text-gray-600" />
    }
  }

  const getNodeTypeIcon = (type: string) => {
    switch (type) {
      case "fiber_hub": return <Zap className="h-5 w-5" />
      case "distribution_point": return <Router className="h-5 w-5" />
      case "customer_premises": return <Users className="h-5 w-5" />
      default: return <MapPin className="h-5 w-5" />
    }
  }

  const getNodeTypeLabel = (type: string) => {
    switch (type) {
      case "fiber_hub": return "Fiber Hub"
      case "distribution_point": return "Distribution Point"
      case "customer_premises": return "Customer Premises"
      default: return type
    }
  }

  const getLoadPercentage = (node: any) => {
    return Math.round((node.currentLoad / node.capacity) * 100)
  }

  const getLoadColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600"
    if (percentage >= 75) return "text-yellow-600"
    return "text-green-600"
  }

  const handleViewOnMap = (coordinates: any) => {
    const url = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`
    window.open(url, '_blank')
  }

  const handleNavigate = (coordinates: any) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`
    window.open(url, '_blank')
  }

  const handleApplyChanges = () => {
    console.log("Applying network changes:", nodes)
    setHasChanges(false)
  }

  const networkStats = {
    totalNodes: nodes.length,
    activeNodes: nodes.filter(n => n.status === "active").length,
    issueNodes: nodes.filter(n => n.status === "issue").length,
    maintenanceNodes: nodes.filter(n => n.status === "maintenance").length,
    totalCapacity: nodes.reduce((acc, n) => acc + n.capacity, 0),
    totalLoad: nodes.reduce((acc, n) => acc + n.currentLoad, 0),
  }

  const utilizationPercentage = Math.round((networkStats.totalLoad / networkStats.totalCapacity) * 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Network Map</h1>
          <p className="text-gray-500">Monitor network infrastructure and field locations</p>
        </div>
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <Button onClick={handleApplyChanges} className="bg-orange-600 hover:bg-orange-700">
              <Save className="h-4 w-4 mr-2" />
              Apply Changes
            </Button>
          )}
          <Select value={mapView} onValueChange={setMapView}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="topology">Topology</SelectItem>
              <SelectItem value="geographic">Geographic</SelectItem>
              <SelectItem value="status">Status View</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Nodes</CardTitle>
            <MapPin className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{networkStats.totalNodes}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{networkStats.activeNodes}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{networkStats.issueNodes}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Maintenance</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{networkStats.maintenanceNodes}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Utilization</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{utilizationPercentage}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Map View and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Network Map Visualization */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Network Topology - {mapView.charAt(0).toUpperCase() + mapView.slice(1)} View
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Target className="h-4 w-4 mr-2" />
                  Center Map
                </Button>
                <Button variant="outline" size="sm">
                  <Camera className="h-4 w-4 mr-2" />
                  Screenshot
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Simplified Network Visualization */}
            <div className="h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 p-6">
                {/* Network Topology Visualization */}
                <div className="relative h-full w-full">
                  {/* Main Hub */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                        <Zap className="h-8 w-8 text-white" />
                      </div>
                      <span className="text-xs font-medium mt-2">Main Hub</span>
                    </div>
                  </div>

                  {/* Distribution Points */}
                  <div className="absolute top-1/4 left-1/4">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                        <Router className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-xs mt-1">Sector 15</span>
                    </div>
                  </div>

                  <div className="absolute top-1/4 right-1/4">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center shadow-md">
                        <Router className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-xs mt-1">Sector 22</span>
                    </div>
                  </div>

                  {/* Customer Premises */}
                  <div className="absolute bottom-1/4 left-1/6">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center shadow-sm">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-xs mt-1">Customer 1</span>
                    </div>
                  </div>

                  <div className="absolute bottom-1/4 right-1/6">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-red-400 rounded-full flex items-center justify-center shadow-sm">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-xs mt-1">Customer 2</span>
                    </div>
                  </div>

                  {/* Connection Lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <line x1="50%" y1="50%" x2="25%" y2="25%" stroke="#3b82f6" strokeWidth="2" />
                    <line x1="50%" y1="50%" x2="75%" y2="25%" stroke="#3b82f6" strokeWidth="2" />
                    <line x1="25%" y1="25%" x2="16.67%" y2="75%" stroke="#10b981" strokeWidth="2" />
                    <line x1="75%" y1="25%" x2="83.33%" y2="75%" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" />
                  </svg>
                </div>
              </div>
              
              <div className="text-center z-10 bg-white p-4 rounded-lg shadow-md">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 font-medium">Interactive Network Map</p>
                <p className="text-sm text-gray-500">Click on nodes for details</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions and Legend */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Map Legend & Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Legend */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Node Types</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span className="text-xs">Fiber Hub</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-xs">Distribution Point</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                  <span className="text-xs">Customer Premises</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Status Colors</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-xs">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs">Maintenance</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-xs">Issue</span>
                </div>
                <div className="flex items-center gap-2">
                  <WifiOff className="w-4 h-4 text-gray-500" />
                  <span className="text-xs">Offline</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 pt-4 border-t">
              <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                <Navigation className="h-4 w-4 mr-2" />
                Navigate to Location
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                <Signal className="h-4 w-4 mr-2" />
                Signal Test
              </Button>
              <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Report Issue
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Report Network Issue</DialogTitle>
                    <DialogDescription>Report a problem with network infrastructure</DialogDescription>
                  </DialogHeader>
                  <ReportIssueForm />
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network Nodes List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <CardTitle>Network Nodes</CardTitle>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search nodes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full md:w-64"
                />
              </div>
              <Select value={nodeTypeFilter} onValueChange={setNodeTypeFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Node Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="fiber_hub">Fiber Hub</SelectItem>
                  <SelectItem value="distribution_point">Distribution Point</SelectItem>
                  <SelectItem value="customer_premises">Customer Premises</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="issue">Issue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredNodes.map((node) => (
            <div
              key={node.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300 bg-gradient-to-r from-white to-gray-50"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-3 mb-3">
                    <div className="flex items-center space-x-2">
                      {getNodeTypeIcon(node.type)}
                      <h3 className="font-medium text-gray-900">{node.name}</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="capitalize">{getNodeTypeLabel(node.type)}</Badge>
                      <Badge className="bg-gray-100 text-gray-800">{node.id}</Badge>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{node.location.address}</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-4">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4" />
                        <span className="text-gray-800">{node.connectedNodes} Connected Nodes</span>
                        </div>
                        <div className="flex items-center space-x-2">
                        <Signal className="h-4 w-4" />
                        <span className={`text-sm ${getLoadColor(getLoadPercentage(node))}`}>
                          {getLoadPercentage(node)}% Load
                        </span>
                        </div>
                        <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span className="text-gray-500">Last Maintained: {new Date(node.lastMaintenance).toLocaleDateString()}</span>
                        </div>
                        </div>
                    <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>Technician: {node.technician}</span>
                    </div>
                    {node.issues.length > 0 && (
                      <div className="mt-2">
                        <h4 className="font-medium text-red-600">Issues:</h4>
                        <ul className="list-disc list-inside text-sm text-red-500">
                          {node.issues.map((issue, index) => (
                            <li key={index}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    </div>
                    </div>
                <div className="flex flex-col space-y-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                        setSelectedNode(node)
                        setShowNodeDetails(true)
                        }}
                    >
                        View Details
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleViewOnMap(node.location.coordinates)}
                    >
                        View on Map
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleNavigate(node.location.coordinates)}
                    >
                        Navigate
                    </Button>
                </div>
                </div>
            </div>
            ))}
            {filteredNodes.length === 0 && (
            <div className="text-center text-gray-500">
              No nodes found matching the filters.
            </div>
            )}
        </CardContent>
        </Card>
        {/* Node Details Dialog */}
        {showNodeDetails && selectedNode && (
          <Dialog open={showNodeDetails} onOpenChange={setShowNodeDetails}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Node Details</DialogTitle>
                <DialogDescription>
                  Details and actions for network node <span className="font-bold">{selectedNode.name}</span>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {getNodeTypeIcon(selectedNode.type)}
                  <span className="font-medium">{selectedNode.name}</span>
                  <Badge variant="outline" className="capitalize">{getNodeTypeLabel(selectedNode.type)}</Badge>
                  <Badge className="bg-gray-100 text-gray-800">{selectedNode.id}</Badge>
                </div>
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedNode.location.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span>{selectedNode.connectedNodes} Connected Nodes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Signal className="h-4 w-4" />
                    <span className={getLoadColor(getLoadPercentage(selectedNode))}>
                      {getLoadPercentage(selectedNode)}% Load
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Last Maintained: {new Date(selectedNode.lastMaintenance).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Technician: {selectedNode.technician}</span>
                  </div>
                  {selectedNode.customerInfo && (
                    <div className="mt-2">
                      <h4 className="font-medium text-purple-600">Customer Info:</h4>
                      <ul className="list-disc list-inside text-sm text-purple-500">
                        <li>Name: {selectedNode.customerInfo.name}</li>
                        <li>Phone: {selectedNode.customerInfo.phone}</li>
                        <li>Plan: {selectedNode.customerInfo.plan}</li>
                        <li>Connection: {selectedNode.customerInfo.connectionType}</li>
                      </ul>
                    </div>
                  )}
                  {selectedNode.issues.length > 0 && (
                    <div className="mt-2">
                      <h4 className="font-medium text-red-600">Issues:</h4>
                      <ul className="list-disc list-inside text-sm text-red-500">
                        {selectedNode.issues.map((issue: string, index: number) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="flex flex-col space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowNodeDetails(false)}
                  >
                    Close
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleViewOnMap(selectedNode.location.coordinates)}
                  >
                    View on Map
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleNavigate(selectedNode.location.coordinates)}
                  >
                    Navigate
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
        </div>
  )}
