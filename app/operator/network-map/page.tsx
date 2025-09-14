"use client"
import { useState, useRef } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import {
  MapPin,
  Plus,
  Layers,
  Zap,
  Router,
  Cable,
  Users,
  AlertTriangle,
  Search,
  Download,
  Upload,
  Settings,
  Navigation,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Network elements data
const networkElements = {
  olts: [
    {
      id: "OLT001",
      name: "Main OLT - Sector 15",
      type: "OLT",
      location: { lat: 30.7333, lng: 76.7794 },
      status: "active",
      capacity: 1024,
      used: 856,
      vendor: "Huawei",
      model: "MA5800-X7",
      installDate: "2023-06-15",
      lastMaintenance: "2024-01-10",
      connectedSplitters: 12,
      activeCustomers: 856,
    },
    {
      id: "OLT002",
      name: "Secondary OLT - Sector 22",
      type: "OLT",
      location: { lat: 30.7614, lng: 76.7911 },
      status: "active",
      capacity: 512,
      used: 387,
      vendor: "ZTE",
      model: "C320",
      installDate: "2023-08-20",
      lastMaintenance: "2024-01-08",
      connectedSplitters: 8,
      activeCustomers: 387,
    },
  ],
  splitters: [
    {
      id: "SPL001",
      name: "1:8 Splitter - Block A",
      type: "Splitter",
      location: { lat: 30.7425, lng: 76.7681 },
      status: "active",
      ratio: "1:8",
      parentOLT: "OLT001",
      connectedCustomers: 7,
      capacity: 8,
      installDate: "2023-07-01",
    },
    {
      id: "SPL002",
      name: "1:16 Splitter - Block B",
      type: "Splitter",
      location: { lat: 30.7445, lng: 76.7701 },
      status: "active",
      ratio: "1:16",
      parentOLT: "OLT001",
      connectedCustomers: 14,
      capacity: 16,
      installDate: "2023-07-05",
    },
  ],
  customers: [
    {
      id: "CUST001",
      name: "Rajesh Kumar",
      type: "Customer",
      location: { lat: 30.7445, lng: 76.7701 },
      status: "active",
      plan: "50 Mbps Fiber",
      parentSplitter: "SPL001",
      connectionDate: "2023-08-15",
      lastPayment: "2024-01-01",
      complaints: 0,
    },
    {
      id: "CUST002",
      name: "Priya Singh",
      type: "Customer",
      location: { lat: 30.7634, lng: 76.7931 },
      status: "active",
      plan: "100 Mbps Unlimited",
      parentSplitter: "SPL002",
      connectionDate: "2023-09-01",
      lastPayment: "2024-01-01",
      complaints: 1,
    },
  ],
  fiberRoutes: [
    {
      id: "ROUTE001",
      name: "Main Trunk - Sector 15 to 22",
      type: "FiberRoute",
      path: [
        { lat: 30.7333, lng: 76.7794 },
        { lat: 30.7425, lng: 76.7681 },
        { lat: 30.7614, lng: 76.7911 },
      ],
      status: "active",
      length: 15.2,
      cableType: "Single Mode",
      capacity: 144,
      used: 96,
      installDate: "2023-06-01",
    },
  ],
  complaints: [
    {
      id: "CMP001",
      customerId: "CUST002",
      location: { lat: 30.7634, lng: 76.7931 },
      type: "No Internet",
      status: "open",
      priority: "high",
      reportedDate: "2024-01-15",
      assignedTechnician: "TECH001",
    },
  ],
}

const mapLayers = {
  olts: { visible: true, color: "#3b82f6", icon: Zap },
  splitters: { visible: true, color: "#10b981", icon: Router },
  customers: { visible: true, color: "#8b5cf6", icon: Users },
  fiberRoutes: { visible: true, color: "#f59e0b", icon: Cable },
  complaints: { visible: true, color: "#ef4444", icon: AlertTriangle },
}

export default function NetworkMap() {
  const [elements, setElements] = useState(networkElements)
  const [layers, setLayers] = useState(mapLayers)
  const [selectedElement, setSelectedElement] = useState(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [mapMode, setMapMode] = useState("view") // view, edit, add
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [newElement, setNewElement] = useState({
    name: "",
    type: "Customer",
    location: { lat: 30.7333, lng: 76.7794 },
    status: "active",
    parentId: "",
  })
  const mapRef = useRef(null)
  const { toast } = useToast()

  const toggleLayer = (layerName: string) => {
    setLayers((prev) => ({
      ...prev,
      [layerName]: { ...prev[layerName], visible: !prev[layerName].visible },
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getElementIcon = (type: string) => {
    switch (type) {
      case "OLT":
        return <Zap className="h-4 w-4" />
      case "Splitter":
        return <Router className="h-4 w-4" />
      case "Customer":
        return <Users className="h-4 w-4" />
      case "FiberRoute":
        return <Cable className="h-4 w-4" />
      case "Complaint":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  const handleAddElement = () => {
    const element = {
      id: `${newElement.type.toUpperCase()}${String(Date.now()).slice(-3)}`,
      ...newElement,
      installDate: new Date().toISOString().split("T")[0],
    }

    // Add to appropriate category
    const category = newElement.type.toLowerCase() + "s"
    if (elements[category]) {
      setElements((prev) => ({
        ...prev,
        [category]: [...prev[category], element],
      }))
    }

    setNewElement({
      name: "",
      type: "Customer",
      location: { lat: 30.7333, lng: 76.7794 },
      status: "active",
      parentId: "",
    })
    setIsAddDialogOpen(false)
    toast({
      title: "Element Added",
      description: `${element.name} added to the network map.`,
    })
  }

  const exportMapData = () => {
    const dataStr = JSON.stringify(elements, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = `network-map-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
    toast({
      title: "Map Exported",
      description: "Network map data exported to JSON file.",
    })
  }

  return (
    <DashboardLayout title="Network Map" description="Visualize and manage your fiber network infrastructure">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Network Map</h1>
            <p className="text-gray-600 mt-1">Visualize and manage your fiber network infrastructure</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={exportMapData}>
              <Download className="h-4 w-4 mr-2" />
              Export Map
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Element
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Network Element</DialogTitle>
                  <DialogDescription>Add a new element to the network map</DialogDescription>
                </DialogHeader>
                <AddElementForm
                  newElement={newElement}
                  setNewElement={setNewElement}
                  handleAddElement={handleAddElement}
                  setIsAddDialogOpen={setIsAddDialogOpen}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map Controls */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Layers className="h-5 w-5 mr-2" />
                Map Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="space-y-2">
                <Label>Search Elements</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filter */}
              <div className="space-y-2">
                <Label>Filter by Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="olts">OLTs</SelectItem>
                    <SelectItem value="splitters">Splitters</SelectItem>
                    <SelectItem value="customers">Customers</SelectItem>
                    <SelectItem value="fiberRoutes">Fiber Routes</SelectItem>
                    <SelectItem value="complaints">Complaints</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Layer Controls */}
              <div className="space-y-3">
                <Label>Map Layers</Label>
                {Object.entries(layers).map(([layerName, layer]) => {
                  const IconComponent = layer.icon
                  return (
                    <div key={layerName} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: layer.color }} />
                        <IconComponent className="h-4 w-4" />
                        <span className="text-sm capitalize">{layerName}</span>
                      </div>
                      <Switch checked={layer.visible} onCheckedChange={() => toggleLayer(layerName)} />
                    </div>
                  )
                })}
              </div>

              {/* Map Mode */}
              <div className="space-y-2">
                <Label>Map Mode</Label>
                <Select value={mapMode} onValueChange={setMapMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View Mode</SelectItem>
                    <SelectItem value="edit">Edit Mode</SelectItem>
                    <SelectItem value="add">Add Mode</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Map Display */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Navigation className="h-5 w-5 mr-2" />
                  Network Topology Map
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Map Settings
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                ref={mapRef}
                className="w-full h-[600px] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden"
              >
                {/* Simulated Map Interface */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
                  {/* Grid Pattern */}
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `
                      linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                    `,
                      backgroundSize: "20px 20px",
                    }}
                  />

                  {/* Network Elements */}
                  {layers.olts.visible &&
                    elements.olts.map((olt, index) => (
                      <div
                        key={olt.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                        style={{
                          left: `${20 + index * 200}px`,
                          top: `${100 + index * 50}px`,
                        }}
                        onClick={() => {
                          setSelectedElement(olt)
                          setIsDetailsDialogOpen(true)
                        }}
                      >
                        <div className="bg-blue-500 text-white p-3 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                          <Zap className="h-6 w-6 mx-auto mb-1" />
                          <div className="text-xs font-medium text-center">{olt.name}</div>
                          <div className="text-xs text-center opacity-75">
                            {olt.used}/{olt.capacity}
                          </div>
                        </div>
                      </div>
                    ))}

                  {layers.splitters.visible &&
                    elements.splitters.map((splitter, index) => (
                      <div
                        key={splitter.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                        style={{
                          left: `${120 + index * 150}px`,
                          top: `${250 + index * 30}px`,
                        }}
                        onClick={() => {
                          setSelectedElement(splitter)
                          setIsDetailsDialogOpen(true)
                        }}
                      >
                        <div className="bg-green-500 text-white p-2 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                          <Router className="h-5 w-5 mx-auto mb-1" />
                          <div className="text-xs font-medium text-center">{splitter.name}</div>
                          <div className="text-xs text-center opacity-75">{splitter.ratio}</div>
                        </div>
                      </div>
                    ))}

                  {layers.customers.visible &&
                    elements.customers.map((customer, index) => (
                      <div
                        key={customer.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                        style={{
                          left: `${200 + index * 100}px`,
                          top: `${400 + index * 20}px`,
                        }}
                        onClick={() => {
                          setSelectedElement(customer)
                          setIsDetailsDialogOpen(true)
                        }}
                      >
                        <div className="bg-purple-500 text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-shadow">
                          <Users className="h-4 w-4" />
                        </div>
                        <div className="text-xs font-medium text-center mt-1 bg-white px-1 rounded shadow">
                          {customer.name}
                        </div>
                      </div>
                    ))}

                  {layers.complaints.visible &&
                    elements.complaints.map((complaint, index) => (
                      <div
                        key={complaint.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer animate-pulse"
                        style={{
                          left: `${200 + index * 100}px`,
                          top: `${380 + index * 20}px`,
                        }}
                        onClick={() => {
                          setSelectedElement(complaint)
                          setIsDetailsDialogOpen(true)
                        }}
                      >
                        <div className="bg-red-500 text-white p-1 rounded-full shadow-lg">
                          <AlertTriangle className="h-3 w-3" />
                        </div>
                      </div>
                    ))}

                  {/* Connection Lines */}
                  <svg className="absolute inset-0 pointer-events-none">
                    {/* OLT to Splitter connections */}
                    <line x1="120" y1="125" x2="195" y2="265" stroke="#10b981" strokeWidth="2" strokeDasharray="5,5" />
                    <line x1="220" y1="175" x2="345" y2="295" stroke="#10b981" strokeWidth="2" strokeDasharray="5,5" />

                    {/* Splitter to Customer connections */}
                    <line x1="195" y1="285" x2="250" y2="420" stroke="#8b5cf6" strokeWidth="1" />
                    <line x1="345" y1="315" x2="350" y2="440" stroke="#8b5cf6" strokeWidth="1" />
                  </svg>

                  {/* Map Legend */}
                  <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg">
                    <div className="text-sm font-semibold mb-2">Legend</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded" />
                        <span>OLT</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded" />
                        <span>Splitter</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full" />
                        <span>Customer</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full" />
                        <span>Complaint</span>
                      </div>
                    </div>
                  </div>

                  {/* Map Info */}
                  <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg">
                    <div className="text-sm font-semibold mb-2">Network Stats</div>
                    <div className="space-y-1 text-xs">
                      <div>OLTs: {elements.olts.length}</div>
                      <div>Splitters: {elements.splitters.length}</div>
                      <div>Customers: {elements.customers.length}</div>
                      <div>Active Complaints: {elements.complaints.length}</div>
                    </div>
                  </div>
                </div>

                {mapMode === "add" && (
                  <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                      <p className="text-sm font-medium">Click on the map to add a new element</p>
                      <p className="text-xs text-gray-500 mt-1">Use the form dialog to specify element details</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

function AddElementForm({ newElement, setNewElement, handleAddElement, setIsAddDialogOpen }: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="elementName">Element Name</Label>
          <Input
            id="elementName"
            value={newElement.name}
            onChange={(e) => setNewElement({ ...newElement, name: e.target.value })}
            placeholder="Enter element name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="elementType">Type</Label>
          <Select value={newElement.type} onValueChange={(value) => setNewElement({ ...newElement, type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OLT">OLT</SelectItem>
              <SelectItem value="Splitter">Splitter</SelectItem>
              <SelectItem value="Customer">Customer</SelectItem>
              <SelectItem value="FiberRoute">Fiber Route</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            type="number"
            step="0.000001"
            value={newElement.location.lat}
            onChange={(e) =>
              setNewElement({
                ...newElement,
                location: { ...newElement.location, lat: Number.parseFloat(e.target.value) },
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            type="number"
            step="0.000001"
            value={newElement.location.lng}
            onChange={(e) =>
              setNewElement({
                ...newElement,
                location: { ...newElement.location, lng: Number.parseFloat(e.target.value) },
              })
            }
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={newElement.status} onValueChange={(value) => setNewElement({ ...newElement, status: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
          Cancel
        </Button>
        <Button onClick={handleAddElement}>Add Element</Button>
      </div>
    </div>
  )
}
