"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  Filter,
  Download,
  Calendar,
  CreditCard,
  Users,
  TrendingUp,
} from "lucide-react"
import { toast } from "sonner"

const subscriptions = [
  {
    id: "SUB001",
    operatorName: "NetConnect Solutions",
    operatorId: "OP001",
    planName: "Premium Enterprise",
    startDate: "2024-01-15",
    endDate: "2024-12-15",
    amount: 25000,
    status: "active",
    customers: 450,
    revenue: 125000,
    paymentStatus: "paid",
  },
  {
    id: "SUB002",
    operatorName: "FiberLink Networks",
    operatorId: "OP002",
    planName: "Standard Business",
    startDate: "2024-02-01",
    endDate: "2024-11-30",
    amount: 15000,
    status: "active",
    customers: 280,
    revenue: 85000,
    paymentStatus: "pending",
  },
  {
    id: "SUB003",
    operatorName: "QuickNet ISP",
    operatorId: "OP003",
    planName: "Basic Starter",
    startDate: "2023-12-01",
    endDate: "2024-11-30",
    amount: 8000,
    status: "expiring",
    customers: 150,
    revenue: 45000,
    paymentStatus: "paid",
  },
]

export default function SubscriptionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "expired":
        return "bg-red-100 text-red-800"
      case "expiring":
        return "bg-yellow-100 text-yellow-800"
      case "suspended":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.operatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.revenue, 0)
  const activeSubscriptions = subscriptions.filter((sub) => sub.status === "active").length
  const expiringSubscriptions = subscriptions.filter((sub) => sub.status === "expiring").length

  return (
    <DashboardLayout title="Subscription Management" description="Manage operator subscriptions and billing">
    <div className=" space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        {/* <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-600 mt-1">Manage operator subscriptions and billing</p>
        </div> */}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{expiringSubscriptions}</div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">1</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      
      <Card>
        <div className="flex items-center justify-between p-4">
        <CardHeader>
          <CardTitle>Subscription List</CardTitle>
          <CardDescription>Manage all operator subscriptions</CardDescription>
        </CardHeader>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Subscription
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Subscription</DialogTitle>
              <DialogDescription>Create a new subscription plan for an operator</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="operator">Select Operator</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose operator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="op1">NetConnect Solutions</SelectItem>
                    <SelectItem value="op2">FiberLink Networks</SelectItem>
                    <SelectItem value="op3">QuickNet ISP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="plan">Subscription Plan</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic Starter - ₹8,000/year</SelectItem>
                    <SelectItem value="standard">Standard Business - ₹15,000/year</SelectItem>
                    <SelectItem value="premium">Premium Enterprise - ₹25,000/year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input type="date" id="startDate" />
              </div>
              <div>
                <Label htmlFor="duration">Duration</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 Months</SelectItem>
                    <SelectItem value="12">12 Months</SelectItem>
                    <SelectItem value="24">24 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea id="notes" placeholder="Additional notes..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast.success("Subscription created successfully!")
                  setIsAddDialogOpen(false)
                }}
              >
                Create Subscription
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search subscriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expiring">Expiring</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subscription ID</TableHead>
                  <TableHead>Operator</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Customers</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell className="font-medium">{subscription.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{subscription.operatorName}</div>
                        <div className="text-sm text-gray-500">{subscription.operatorId}</div>
                      </div>
                    </TableCell>
                    <TableCell>{subscription.planName}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{subscription.startDate}</div>
                        <div className="text-gray-500">to {subscription.endDate}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">₹{subscription.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(subscription.status)}>{subscription.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPaymentStatusColor(subscription.paymentStatus)}>
                        {subscription.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>{subscription.customers}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
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
    </div>
    </DashboardLayout>
  )
}
