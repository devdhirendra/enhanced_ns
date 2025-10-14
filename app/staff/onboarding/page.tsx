"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, AlertCircle, XCircle, User, FileText, Phone, Mail, Eye, Search } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

export default function StaffOnboardingPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [onboardings, setOnboardings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [selectedOnboarding, setSelectedOnboarding] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // Mock data - replace with actual API calls
  const onboardingData = [
    {
      id: "ONB-001",
      type: "operator",
      name: "TechNet Solutions",
      email: "admin@technet.com",
      phone: "+91 9876543210",
      status: "pending",
      progress: 25,
      createdAt: "2024-01-20T10:30:00Z",
      updatedAt: "2024-01-21T14:15:00Z",
      assignedTo: user?.user_id,
      assignedStaff: user?.profileDetail?.name || "Current User",
      documents: {
        businessLicense: "pending",
        gstCertificate: "pending",
        bankDetails: "submitted",
        identityProof: "approved",
      },
      details: {
        companyName: "TechNet Solutions",
        businessType: "ISP",
        address: {
          state: "Maharashtra",
          district: "Mumbai",
          area: "Andheri West",
        },
        gstNumber: "27ABCDE1234F1Z5",
        serviceCapacity: {
          connections: 1000,
          olts: 5,
        },
      },
    },
    {
      id: "ONB-002",
      type: "customer",
      name: "John Doe",
      email: "john@example.com",
      phone: "+91 9876543211",
      status: "in-progress",
      progress: 75,
      createdAt: "2024-01-18T09:00:00Z",
      updatedAt: "2024-01-22T16:30:00Z",
      assignedTo: user?.user_id,
      assignedStaff: user?.profileDetail?.name || "Current User",
      documents: {
        identityProof: "approved",
        addressProof: "approved",
        bankDetails: "pending",
      },
      details: {
        planId: "premium-100",
        connectionType: "Fiber",
        monthlyRate: 1999,
        address: "123 Main Street, Andheri West, Mumbai",
      },
    },
    {
      id: "ONB-003",
      type: "operator",
      name: "FastNet Communications",
      email: "info@fastnet.com",
      phone: "+91 9876543212",
      status: "completed",
      progress: 100,
      createdAt: "2024-01-15T11:45:00Z",
      updatedAt: "2024-01-20T10:30:00Z",
      assignedTo: "STAFF-002",
      assignedStaff: "Onboarding Team",
      documents: {
        businessLicense: "approved",
        gstCertificate: "approved",
        bankDetails: "approved",
        identityProof: "approved",
      },
      details: {
        companyName: "FastNet Communications",
        businessType: "ISP",
        address: {
          state: "Karnataka",
          district: "Bangalore",
          area: "Koramangala",
        },
      },
    },
  ]

  useEffect(() => {
    // Simulate loading onboardings
    setTimeout(() => {
      setOnboardings(onboardingData)
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "in-progress":
        return <AlertCircle className="h-4 w-4 text-blue-600" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "submitted":
        return "bg-blue-100 text-blue-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleStatusChange = async (onboardingId: string, newStatus: string) => {
    try {
      // Update local state
      setOnboardings((prev) =>
        prev.map((onboarding) =>
          onboarding.id === onboardingId
            ? {
                ...onboarding,
                status: newStatus,
                progress: newStatus === "completed" ? 100 : onboarding.progress,
                updatedAt: new Date().toISOString(),
              }
            : onboarding,
        ),
      )

      toast({
        title: "Status Updated",
        description: `Onboarding status has been updated to ${newStatus}.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update onboarding status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDocumentApproval = async (onboardingId: string, documentType: string, status: string) => {
    try {
      // Update local state
      setOnboardings((prev) =>
        prev.map((onboarding) =>
          onboarding.id === onboardingId
            ? {
                ...onboarding,
                documents: { ...onboarding.documents, [documentType]: status },
                updatedAt: new Date().toISOString(),
              }
            : onboarding,
        ),
      )

      toast({
        title: "Document Updated",
        description: `Document ${documentType} has been ${status}.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update document status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredOnboardings = onboardingData.filter((onboarding) => {
    const matchesSearch =
      onboarding.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      onboarding.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || onboarding.status === filterStatus
    const matchesType = filterType === "all" || onboarding.type === filterType
    return matchesSearch && matchesStatus && matchesType
  })

  const onboardingStats = {
    total: onboardingData.length,
    pending: onboardingData.filter((o) => o.status === "pending").length,
    inProgress: onboardingData.filter((o) => o.status === "in-progress").length,
    completed: onboardingData.filter((o) => o.status === "completed").length,
    myOnboardings: onboardingData.filter((o) => o.assignedTo === user?.user_id).length,
  }

  return (
    <DashboardLayout title="Onboarding Management" description="Manage operator and customer onboarding processes">
      <div className="space-y-6">
        {/* Onboarding Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{onboardingStats.total}</p>
                </div>
                <User className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{onboardingStats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{onboardingStats.inProgress}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{onboardingStats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">My Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{onboardingStats.myOnboardings}</p>
                </div>
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All Onboardings</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search onboardings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="operator">Operators</SelectItem>
                      <SelectItem value="customer">Customers</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Onboardings Table */}
            <Card>
              <CardHeader>
                <CardTitle>Onboarding Requests</CardTitle>
                <CardDescription>Manage operator and customer onboarding processes</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOnboardings.map((onboarding) => (
                      <TableRow key={onboarding.id}>
                        <TableCell className="font-medium">{onboarding.id}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {onboarding.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{onboarding.name}</div>
                            <div className="text-sm text-gray-500">{onboarding.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span>{onboarding.phone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(onboarding.status)}
                            <Badge className={getStatusColor(onboarding.status)}>
                              {onboarding.status.charAt(0).toUpperCase() + onboarding.status.slice(1)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="w-24">
                            <Progress value={onboarding.progress} className="w-full" />
                            <span className="text-xs text-gray-500">{onboarding.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{onboarding.assignedStaff}</TableCell>
                        <TableCell>{formatDate(onboarding.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedOnboarding(onboarding)
                                setIsViewDialogOpen(true)
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Select onValueChange={(value) => handleStatusChange(onboarding.id, value)}>
                              <SelectTrigger className="w-32 h-8">
                                <SelectValue placeholder="Update" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tab contents would filter by status */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Onboardings</CardTitle>
                <CardDescription>New onboarding requests awaiting review</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {onboardingData
                    .filter((o) => o.status === "pending")
                    .map((onboarding) => (
                      <Card key={onboarding.id} className="border-l-4 border-l-yellow-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <Badge variant="outline" className="capitalize">
                                  {onboarding.type}
                                </Badge>
                                <h3 className="font-semibold text-gray-900">{onboarding.name}</h3>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <div className="flex items-center space-x-2">
                                  <Mail className="h-3 w-3" />
                                  <span>{onboarding.email}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Phone className="h-3 w-3" />
                                  <span>{onboarding.phone}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button size="sm" onClick={() => handleStatusChange(onboarding.id, "in-progress")}>
                                Start Review
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedOnboarding(onboarding)
                                  setIsViewDialogOpen(true)
                                }}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-tasks">
            <Card>
              <CardHeader>
                <CardTitle>My Assigned Onboardings</CardTitle>
                <CardDescription>Onboarding tasks assigned to you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {onboardingData
                    .filter((o) => o.assignedTo === user?.user_id)
                    .map((onboarding) => (
                      <Card key={onboarding.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <Badge variant="outline" className="capitalize">
                                  {onboarding.type}
                                </Badge>
                                <h3 className="font-semibold text-gray-900">{onboarding.name}</h3>
                                <Badge className={getStatusColor(onboarding.status)}>
                                  {onboarding.status.charAt(0).toUpperCase() + onboarding.status.slice(1)}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>Progress: {onboarding.progress}%</span>
                                <span>Updated: {formatDate(onboarding.updatedAt)}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedOnboarding(onboarding)
                                  setIsViewDialogOpen(true)
                                }}
                              >
                                Continue
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Onboarding Detail Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Onboarding Details - {selectedOnboarding?.id}</DialogTitle>
              <DialogDescription>Review and manage {selectedOnboarding?.type} onboarding process</DialogDescription>
            </DialogHeader>
            {selectedOnboarding && (
              <div className="space-y-6">
                {/* Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{selectedOnboarding.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{selectedOnboarding.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{selectedOnboarding.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="capitalize">
                          {selectedOnboarding.type}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Onboarding Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm text-gray-500">{selectedOnboarding.progress}%</span>
                      </div>
                      <Progress value={selectedOnboarding.progress} className="w-full" />
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(selectedOnboarding.status)}
                        <Badge className={getStatusColor(selectedOnboarding.status)}>
                          {selectedOnboarding.status.charAt(0).toUpperCase() + selectedOnboarding.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Documents */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Document Verification</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(selectedOnboarding.documents).map(([docType, status]) => (
                        <div key={docType} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="font-medium capitalize">{docType.replace(/([A-Z])/g, " $1").trim()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getDocumentStatusColor(status)}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Badge>
                            {status === "submitted" && (
                              <div className="flex space-x-1">
                                <Button
                                  size="sm"
                                  onClick={() => handleDocumentApproval(selectedOnboarding.id, docType, "approved")}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDocumentApproval(selectedOnboarding.id, docType, "rejected")}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Additional Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedOnboarding.type === "operator" ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Company Name</Label>
                            <p className="text-gray-900">{selectedOnboarding.details.companyName}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Business Type</Label>
                            <p className="text-gray-900">{selectedOnboarding.details.businessType}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">GST Number</Label>
                            <p className="text-gray-900">{selectedOnboarding.details.gstNumber}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Service Capacity</Label>
                            <p className="text-gray-900">
                              {selectedOnboarding.details.serviceCapacity?.connections} connections,{" "}
                              {selectedOnboarding.details.serviceCapacity?.olts} OLTs
                            </p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Address</Label>
                          <p className="text-gray-900">
                            {selectedOnboarding.details.address?.area}, {selectedOnboarding.details.address?.district},{" "}
                            {selectedOnboarding.details.address?.state}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Plan ID</Label>
                            <p className="text-gray-900">{selectedOnboarding.details.planId}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Connection Type</Label>
                            <p className="text-gray-900">{selectedOnboarding.details.connectionType}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Monthly Rate</Label>
                            <p className="text-gray-900">₹{selectedOnboarding.details.monthlyRate}</p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Address</Label>
                          <p className="text-gray-900">{selectedOnboarding.details.address}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                    Close
                  </Button>
                  <Button variant="outline" onClick={() => handleStatusChange(selectedOnboarding.id, "rejected")}>
                    Reject
                  </Button>
                  <Button onClick={() => handleStatusChange(selectedOnboarding.id, "completed")}>
                    Approve & Complete
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
