"use client"

import type React from "react"

import { useState } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Wifi,
  DollarSign,
  Users,
  TrendingUp,
  Package,
  Zap,
} from "lucide-react"
import { formatCurrency, getStatusColor, exportToCSV } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

// Demo data for plans
const plans = [
  {
    id: "PLAN001",
    name: "Basic Starter",
    speed: "25 Mbps",
    downloadSpeed: 25,
    uploadSpeed: 5,
    price: 500,
    type: "residential",
    status: "active",
    description: "Perfect for basic internet browsing and email",
    features: ["Unlimited Data", "24/7 Support", "Basic Speed"],
    customerCount: 45,
    revenue: 22500,
    dataLimit: "Unlimited",
    validity: 30,
    installation: 1000,
    equipment: "Basic Router",
    createdDate: "2023-01-15",
  },
  {
    id: "PLAN002",
    name: "Home Essential",
    speed: "50 Mbps",
    downloadSpeed: 50,
    uploadSpeed: 10,
    price: 800,
    type: "residential",
    status: "active",
    description: "Ideal for streaming and moderate usage",
    features: ["Unlimited Data", "HD Streaming", "Priority Support", "Free Router"],
    customerCount: 89,
    revenue: 71200,
    dataLimit: "Unlimited",
    validity: 30,
    installation: 1000,
    equipment: "Dual Band Router",
    createdDate: "2023-01-15",
  },
  {
    id: "PLAN003",
    name: "Family Premium",
    speed: "100 Mbps",
    downloadSpeed: 100,
    uploadSpeed: 20,
    price: 1200,
    type: "residential",
    status: "active",
    description: "Great for families with multiple devices",
    features: ["Unlimited Data", "4K Streaming", "Gaming Optimized", "Premium Support", "Free Installation"],
    customerCount: 156,
    revenue: 187200,
    dataLimit: "Unlimited",
    validity: 30,
    installation: 0,
    equipment: "High-Speed Router",
    createdDate: "2023-02-01",
  },
  {
    id: "PLAN004",
    name: "Ultra Fast",
    speed: "200 Mbps",
    downloadSpeed: 200,
    uploadSpeed: 50,
    price: 2000,
    type: "residential",
    status: "active",
    description: "Maximum speed for power users",
    features: ["Unlimited Data", "Ultra HD Streaming", "Gaming Priority", "24/7 Premium Support", "Free Equipment"],
    customerCount: 67,
    revenue: 134000,
    dataLimit: "Unlimited",
    validity: 30,
    installation: 0,
    equipment: "Enterprise Router",
    createdDate: "2023-03-01",
  },
  {
    id: "PLAN005",
    name: "Business Basic",
    speed: "100 Mbps",
    downloadSpeed: 100,
    uploadSpeed: 100,
    price: 2500,
    type: "business",
    status: "active",
    description: "Symmetric speeds for small businesses",
    features: ["Unlimited Data", "Symmetric Speeds", "Business Support", "Static IP", "SLA Guarantee"],
    customerCount: 23,
    revenue: 57500,
    dataLimit: "Unlimited",
    validity: 30,
    installation: 2000,
    equipment: "Business Router",
    createdDate: "2023-04-01",
  },
  {
    id: "PLAN006",
    name: "Enterprise Pro",
    speed: "500 Mbps",
    downloadSpeed: 500,
    uploadSpeed: 500,
    price: 5000,
    type: "business",
    status: "active",
    description: "High-performance connectivity for enterprises",
    features: ["Unlimited Data", "Dedicated Bandwidth", "Priority Support", "Multiple Static IPs", "99.9% SLA"],
    customerCount: 8,
    revenue: 40000,
    dataLimit: "Unlimited",
    validity: 30,
    installation: 5000,
    equipment: "Enterprise Grade Equipment",
    createdDate: "2023-05-01",
  },
  {
    id: "PLAN007",
    name: "Student Special",
    speed: "75 Mbps",
    downloadSpeed: 75,
    uploadSpeed: 15,
    price: 600,
    type: "promotional",
    status: "inactive",
    description: "Special discounted plan for students",
    features: ["Unlimited Data", "Student Discount", "Flexible Terms", "Basic Support"],
    customerCount: 12,
    revenue: 7200,
    dataLimit: "Unlimited",
    validity: 30,
    installation: 500,
    equipment: "Basic Router",
    createdDate: "2023-06-01",
  },
]

export default function PlansPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showAddPlanDialog, setShowAddPlanDialog] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [showPlanDetailsDialog, setShowPlanDetailsDialog] = useState(false)
  const { toast } = useToast()

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.speed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || plan.type === typeFilter
    const matchesStatus = statusFilter === "all" || plan.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const handleExport = () => {
    const exportData = plans.map((plan) => ({
      ID: plan.id,
      Name: plan.name,
      Speed: plan.speed,
      Price: plan.price,
      Type: plan.type,
      Status: plan.status,
      Customers: plan.customerCount,
      Revenue: plan.revenue,
      "Created Date": plan.createdDate,
    }))
    exportToCSV(exportData, "service-plans")
    toast({
      title: "Export Successful",
      description: "Service plans data has been exported to CSV file.",
    })
  }

  const handleViewPlan = (plan: any) => {
    setSelectedPlan(plan)
    setShowPlanDetailsDialog(true)
  }

  const handleEditPlan = (planId: string) => {
    toast({
      title: "Edit Plan",
      description: `Opening edit form for plan ${planId}`,
    })
  }

  const handleDeletePlan = (planId: string) => {
    toast({
      title: "Delete Plan",
      description: `Plan ${planId} deletion requested`,
      variant: "destructive",
    })
  }

  const planStats = {
    total: plans.length,
    active: plans.filter((p) => p.status === "active").length,
    totalCustomers: plans.reduce((sum, p) => sum + p.customerCount, 0),
    totalRevenue: plans.reduce((sum, p) => sum + p.revenue, 0),
    averagePrice: plans.reduce((sum, p) => sum + p.price, 0) / plans.length,
  }

  return (
    <DashboardLayout title="Service Plans" description="Manage your internet service plans and pricing">
      <div className="space-y-6">
        {/* Plan Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Plans</CardTitle>
              <div className="p-2 bg-blue-500 rounded-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{planStats.total}</div>
              <p className="text-sm text-gray-500 mt-2">{planStats.active} active plans</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Subscribers</CardTitle>
              <div className="p-2 bg-green-500 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{planStats.totalCustomers}</div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600 font-medium">+8%</span>
                <span className="text-sm text-gray-500 ml-1">this month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Revenue</CardTitle>
              <div className="p-2 bg-purple-500 rounded-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">
                {formatCurrency(planStats.totalRevenue)}
              </div>
              <p className="text-sm text-gray-500 mt-2">Monthly recurring</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Average Price</CardTitle>
              <div className="p-2 bg-orange-500 rounded-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">
                {formatCurrency(planStats.averagePrice)}
              </div>
              <p className="text-sm text-gray-500 mt-2">Per plan</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="plans" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="plans" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                All Plans
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Analytics
              </TabsTrigger>
            </TabsList>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Dialog open={showAddPlanDialog} onOpenChange={setShowAddPlanDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Plan
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Service Plan</DialogTitle>
                    <DialogDescription>Create a new internet service plan</DialogDescription>
                  </DialogHeader>
                  <AddPlanForm onClose={() => setShowAddPlanDialog(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <TabsContent value="plans" className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search plans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="promotional">Promotional</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Plans Grid View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlans.map((plan) => (
                <Card key={plan.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-bold text-gray-900">{plan.name}</CardTitle>
                        <CardDescription className="mt-1">{plan.description}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(plan.status)}>{plan.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{formatCurrency(plan.price)}</div>
                      <p className="text-sm text-gray-500">per month</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Wifi className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm">Speed</span>
                        </div>
                        <span className="font-medium">{plan.speed}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm">Customers</span>
                        </div>
                        <span className="font-medium">{plan.customerCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm">Revenue</span>
                        </div>
                        <span className="font-medium">{formatCurrency(plan.revenue)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Package className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm">Type</span>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {plan.type}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {plan.features.slice(0, 3).map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {plan.features.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{plan.features.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() => handleViewPlan(plan)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() => handleEditPlan(plan.id)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeletePlan(plan.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Plans Table View */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Service Plans ({filteredPlans.length})
                </CardTitle>
                <CardDescription>Detailed view of all service plans</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">Plan Details</TableHead>
                        <TableHead className="min-w-[120px]">Speed & Price</TableHead>
                        <TableHead className="min-w-[100px]">Type</TableHead>
                        <TableHead className="min-w-[100px]">Status</TableHead>
                        <TableHead className="min-w-[120px]">Customers</TableHead>
                        <TableHead className="min-w-[120px]">Revenue</TableHead>
                        <TableHead className="min-w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPlans.map((plan) => (
                        <TableRow key={plan.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{plan.name}</div>
                              <div className="text-sm text-gray-500">{plan.id}</div>
                              <div className="text-xs text-gray-400 mt-1 line-clamp-2">{plan.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="flex items-center font-medium">
                                <Wifi className="h-4 w-4 mr-1 text-gray-400" />
                                {plan.speed}
                              </div>
                              <div className="flex items-center text-sm font-medium text-green-600">
                                <DollarSign className="h-3 w-3 mr-1" />
                                {formatCurrency(plan.price)}/mo
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {plan.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(plan.status)}>{plan.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <div className="font-medium">{plan.customerCount}</div>
                              <div className="text-xs text-gray-500">subscribers</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-green-600">{formatCurrency(plan.revenue)}</div>
                            <div className="text-xs text-gray-500">monthly</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="icon" onClick={() => handleViewPlan(plan)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleEditPlan(plan.id)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeletePlan(plan.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Plan Performance</CardTitle>
                  <CardDescription>Revenue and customer distribution by plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {plans
                      .filter((p) => p.status === "active")
                      .map((plan) => {
                        const revenuePercentage = (plan.revenue / planStats.totalRevenue) * 100
                        return (
                          <div key={plan.id} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{plan.name}</span>
                              <span>
                                {formatCurrency(plan.revenue)} ({revenuePercentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${revenuePercentage}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Plan Type Distribution</CardTitle>
                  <CardDescription>Customer distribution by plan type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {["residential", "business", "promotional"].map((type) => {
                      const typePlans = plans.filter((p) => p.type === type)
                      const typeCustomers = typePlans.reduce((sum, p) => sum + p.customerCount, 0)
                      const typeRevenue = typePlans.reduce((sum, p) => sum + p.revenue, 0)
                      const percentage = (typeCustomers / planStats.totalCustomers) * 100

                      return (
                        <div key={type} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium capitalize">{type}</span>
                            <div className="text-right">
                              <div className="text-sm font-medium">{typeCustomers} customers</div>
                              <div className="text-xs text-gray-500">{formatCurrency(typeRevenue)}</div>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                type === "residential"
                                  ? "bg-blue-600"
                                  : type === "business"
                                    ? "bg-green-600"
                                    : "bg-purple-600"
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Plan Details Dialog */}
        <Dialog open={showPlanDetailsDialog} onOpenChange={setShowPlanDetailsDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Plan Details</DialogTitle>
              <DialogDescription>Complete information about the service plan</DialogDescription>
            </DialogHeader>
            {selectedPlan && <PlanDetailsView plan={selectedPlan} />}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

// Add Plan Form Component
function AddPlanForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    speed: "",
    downloadSpeed: "",
    uploadSpeed: "",
    price: "",
    type: "residential",
    description: "",
    features: "",
    dataLimit: "Unlimited",
    validity: "30",
    installation: "",
    equipment: "",
    status: "active",
  })
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Plan form submitted:", formData)
    toast({
      title: "Plan Added",
      description: `${formData.name} has been created successfully.`,
    })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Plan Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="speed">Speed Display *</Label>
          <Input
            id="speed"
            placeholder="e.g., 100 Mbps"
            value={formData.speed}
            onChange={(e) => setFormData({ ...formData, speed: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="downloadSpeed">Download Speed (Mbps) *</Label>
          <Input
            id="downloadSpeed"
            type="number"
            value={formData.downloadSpeed}
            onChange={(e) => setFormData({ ...formData, downloadSpeed: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="uploadSpeed">Upload Speed (Mbps) *</Label>
          <Input
            id="uploadSpeed"
            type="number"
            value={formData.uploadSpeed}
            onChange={(e) => setFormData({ ...formData, uploadSpeed: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Monthly Price (₹) *</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="type">Plan Type *</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="promotional">Promotional</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          placeholder="Brief description of the plan..."
        />
      </div>
      <div>
        <Label htmlFor="features">Features (comma-separated)</Label>
        <Textarea
          id="features"
          value={formData.features}
          onChange={(e) => setFormData({ ...formData, features: e.target.value })}
          rows={3}
          placeholder="e.g., Unlimited Data, 24/7 Support, Free Router"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="validity">Validity (Days)</Label>
          <Input
            id="validity"
            type="number"
            value={formData.validity}
            onChange={(e) => setFormData({ ...formData, validity: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="installation">Installation Fee (₹)</Label>
          <Input
            id="installation"
            type="number"
            value={formData.installation}
            onChange={(e) => setFormData({ ...formData, installation: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="equipment">Equipment Included</Label>
        <Input
          id="equipment"
          value={formData.equipment}
          onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
          placeholder="e.g., Dual Band Router, ONT Device"
        />
      </div>
      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Create Plan</Button>
      </div>
    </form>
  )
}

// Plan Details View Component
function PlanDetailsView({ plan }: { plan: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Basic Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Plan Name:</span>
                <span className="font-medium">{plan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Plan ID:</span>
                <span className="font-medium">{plan.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Type:</span>
                <Badge variant="outline" className="capitalize">
                  {plan.type}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <Badge className={getStatusColor(plan.status)}>{plan.status}</Badge>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Description</h3>
            <p className="text-sm text-gray-600">{plan.description}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Technical Specifications</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Speed:</span>
                <span className="font-medium">{plan.speed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Download:</span>
                <span className="font-medium">{plan.downloadSpeed} Mbps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Upload:</span>
                <span className="font-medium">{plan.uploadSpeed} Mbps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Data Limit:</span>
                <span className="font-medium">{plan.dataLimit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Validity:</span>
                <span className="font-medium">{plan.validity} days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-medium text-gray-900 mb-2">Pricing & Fees</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-gray-500">Monthly Price:</span>
            <div className="font-medium text-lg text-green-600 mt-1">{formatCurrency(plan.price)}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-gray-500">Installation Fee:</span>
            <div className="font-medium text-lg mt-1">{formatCurrency(plan.installation)}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-gray-500">Equipment:</span>
            <div className="font-medium mt-1">{plan.equipment}</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-medium text-gray-900 mb-2">Features</h3>
        <div className="flex flex-wrap gap-2">
          {plan.features.map((feature: string, index: number) => (
            <Badge key={index} variant="secondary">
              {feature}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium text-gray-900 mb-2">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-blue-50 p-3 rounded-lg">
            <span className="text-gray-500">Total Customers:</span>
            <div className="font-medium text-lg text-blue-600 mt-1">{plan.customerCount}</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <span className="text-gray-500">Monthly Revenue:</span>
            <div className="font-medium text-lg text-green-600 mt-1">{formatCurrency(plan.revenue)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
