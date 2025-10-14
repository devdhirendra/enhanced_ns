"use client"

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RotateCcw, Search, Eye, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { returnApi } from "@/lib/api"

interface Return {
  id: string
  orderId: string
  customerName: string
  customerEmail: string
  productName: string
  quantity: number
  reason: string
  returnType: "refund" | "exchange" | "repair"
  status: "pending" | "approved" | "rejected" | "processing" | "completed" | "cancelled"
  requestDate: string
  approvalDate?: string
  completionDate?: string
  refundAmount?: number
  notes?: string
  images?: string[]
  condition: "new" | "used" | "damaged" | "defective"
  restockable: boolean
}

export default function VendorReturnsPage() {
  const [returns, setReturns] = useState<Return[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    returnApi
      .getAll()
      .then((res) => {
        setReturns(res)
      })
      .catch((err) => {
        console.error("Error fetching returns:", err)
        // Mock data for development
        setReturns([
          {
            id: "RET001",
            orderId: "ORD001",
            customerName: "Rajesh Kumar",
            customerEmail: "rajesh@example.com",
            productName: "TP-Link AC1200 Router",
            quantity: 1,
            reason: "Product not working as expected",
            returnType: "refund",
            status: "pending",
            requestDate: "2024-01-14T10:00:00Z",
            refundAmount: 3500,
            condition: "defective",
            restockable: false,
            notes: "Customer reports WiFi connectivity issues",
          },
          {
            id: "RET002",
            orderId: "ORD002",
            customerName: "Priya Sharma",
            customerEmail: "priya@example.com",
            productName: "Fiber Optic Cable 2km",
            quantity: 1,
            reason: "Wrong product delivered",
            returnType: "exchange",
            status: "approved",
            requestDate: "2024-01-12T14:30:00Z",
            approvalDate: "2024-01-13T09:00:00Z",
            condition: "new",
            restockable: true,
            notes: "Customer ordered 1km cable but received 2km",
          },
          {
            id: "RET003",
            orderId: "ORD003",
            customerName: "Amit Patel",
            customerEmail: "amit@example.com",
            productName: "GPON ONU Device",
            quantity: 1,
            reason: "Damaged during shipping",
            returnType: "refund",
            status: "completed",
            requestDate: "2024-01-10T16:45:00Z",
            approvalDate: "2024-01-11T10:00:00Z",
            completionDate: "2024-01-13T15:30:00Z",
            refundAmount: 4200,
            condition: "damaged",
            restockable: false,
            notes: "Package was damaged during transit, device not functional",
          },
        ])
      })
  }, [])

  const filteredReturns = returns.filter((returnItem) => {
    const matchesSearch =
      returnItem.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.productName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || returnItem.status === selectedStatus
    const matchesType = selectedType === "all" || returnItem.returnType === selectedType
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-blue-100 text-blue-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "processing":
        return "bg-purple-100 text-purple-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      case "processing":
        return <RefreshCw className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "refund":
        return "bg-green-100 text-green-800"
      case "exchange":
        return "bg-blue-100 text-blue-800"
      case "repair":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "new":
        return "bg-green-100 text-green-800"
      case "used":
        return "bg-yellow-100 text-yellow-800"
      case "damaged":
        return "bg-red-100 text-red-800"
      case "defective":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleReturnAction = (returnId: string, action: "approve" | "reject" | "complete") => {
    const updatedReturns = returns.map((returnItem) => {
      if (returnItem.id === returnId) {
        let newStatus = returnItem.status
        const now = new Date().toISOString()

        if (action === "approve") {
          newStatus = "approved"
          return { ...returnItem, status: newStatus, approvalDate: now }
        } else if (action === "reject") {
          newStatus = "rejected"
          return { ...returnItem, status: newStatus, approvalDate: now }
        } else if (action === "complete") {
          newStatus = "completed"
          return { ...returnItem, status: newStatus, completionDate: now }
        }
      }
      return returnItem
    })

    setReturns(updatedReturns)
    toast({
      title: "Return Updated",
      description: `Return ${returnId} has been ${action}d successfully.`,
    })
  }

  const viewReturnDetails = (returnItem: Return) => {
    setSelectedReturn(returnItem)
    setIsDetailsDialogOpen(true)
  }

  const getReturnsByStatus = (status: string) => {
    return returns.filter((returnItem) => returnItem.status === status)
  }

  const getTotalRefundAmount = () => {
    return returns
      .filter((returnItem) => returnItem.returnType === "refund" && returnItem.refundAmount)
      .reduce((total, returnItem) => total + (returnItem.refundAmount || 0), 0)
  }

  return (
            <DashboardLayout title="Vendor Dashboard" description="Overview of your network operations">

    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Returns Management</h1>
          <p className="text-gray-600">Handle customer returns, refunds, and exchanges</p>
        </div>
      </div>

      {/* Returns Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
            <RotateCcw className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{returns.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getReturnsByStatus("pending").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getReturnsByStatus("approved").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <RefreshCw className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getReturnsByStatus("processing").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getReturnsByStatus("completed").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
            <RotateCcw className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(getTotalRefundAmount())}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Return Requests</CardTitle>
          <CardDescription>Manage customer return requests and process refunds/exchanges</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="all">All Returns</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <div className="mt-4 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search returns..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="refund">Refund</SelectItem>
                    <SelectItem value="exchange">Exchange</SelectItem>
                    <SelectItem value="repair">Repair</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <TabsContent value="all">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Return ID</TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReturns.map((returnItem) => (
                      <TableRow key={returnItem.id}>
                        <TableCell className="font-medium">{returnItem.id}</TableCell>
                        <TableCell>{returnItem.orderId}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{returnItem.customerName}</div>
                            <div className="text-sm text-gray-500">{returnItem.customerEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{returnItem.productName}</div>
                            <div className="text-sm text-gray-500">Qty: {returnItem.quantity}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(returnItem.returnType)}>{returnItem.returnType}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{returnItem.reason}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(returnItem.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(returnItem.status)}
                              <span>{returnItem.status}</span>
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(returnItem.requestDate)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => viewReturnDetails(returnItem)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {returnItem.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleReturnAction(returnItem.id, "approve")}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReturnAction(returnItem.id, "reject")}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {returnItem.status === "approved" && (
                              <Button
                                size="sm"
                                onClick={() => handleReturnAction(returnItem.id, "complete")}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                Complete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              {["pending", "approved", "rejected", "processing", "completed", "cancelled"].map((status) => (
                <TabsContent key={status} value={status}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Return ID</TableHead>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Request Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getReturnsByStatus(status).map((returnItem) => (
                        <TableRow key={returnItem.id}>
                          <TableCell className="font-medium">{returnItem.id}</TableCell>
                          <TableCell>{returnItem.orderId}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{returnItem.customerName}</div>
                              <div className="text-sm text-gray-500">{returnItem.customerEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{returnItem.productName}</div>
                              <div className="text-sm text-gray-500">Qty: {returnItem.quantity}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getTypeColor(returnItem.returnType)}>{returnItem.returnType}</Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{returnItem.reason}</TableCell>
                          <TableCell>{formatDate(returnItem.requestDate)}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={() => viewReturnDetails(returnItem)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Return Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Return Details</DialogTitle>
            <DialogDescription>Complete information about the return request</DialogDescription>
          </DialogHeader>
          {selectedReturn && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Return Information</h4>
                  <div className="mt-2 space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Return ID:</span> {selectedReturn.id}
                    </div>
                    <div>
                      <span className="font-medium">Order ID:</span> {selectedReturn.orderId}
                    </div>
                    <div>
                      <span className="font-medium">Request Date:</span> {formatDate(selectedReturn.requestDate)}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <Badge className={`ml-2 ${getStatusColor(selectedReturn.status)}`}>{selectedReturn.status}</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Customer Information</h4>
                  <div className="mt-2 space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Name:</span> {selectedReturn.customerName}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {selectedReturn.customerEmail}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900">Product Information</h4>
                <div className="mt-2 space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Product:</span> {selectedReturn.productName}
                  </div>
                  <div>
                    <span className="font-medium">Quantity:</span> {selectedReturn.quantity}
                  </div>
                  <div>
                    <span className="font-medium">Condition:</span>
                    <Badge className={`ml-2 ${getConditionColor(selectedReturn.condition)}`}>
                      {selectedReturn.condition}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Restockable:</span> {selectedReturn.restockable ? "Yes" : "No"}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900">Return Details</h4>
                <div className="mt-2 space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Type:</span>
                    <Badge className={`ml-2 ${getTypeColor(selectedReturn.returnType)}`}>
                      {selectedReturn.returnType}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Reason:</span> {selectedReturn.reason}
                  </div>
                  {selectedReturn.refundAmount && (
                    <div>
                      <span className="font-medium">Refund Amount:</span> {formatCurrency(selectedReturn.refundAmount)}
                    </div>
                  )}
                  {selectedReturn.notes && (
                    <div>
                      <span className="font-medium">Notes:</span> {selectedReturn.notes}
                    </div>
                  )}
                </div>
              </div>

              {(selectedReturn.approvalDate || selectedReturn.completionDate) && (
                <div>
                  <h4 className="font-medium text-gray-900">Timeline</h4>
                  <div className="mt-2 space-y-2 text-sm">
                    {selectedReturn.approvalDate && (
                      <div>
                        <span className="font-medium">Approval Date:</span> {formatDate(selectedReturn.approvalDate)}
                      </div>
                    )}
                    {selectedReturn.completionDate && (
                      <div>
                        <span className="font-medium">Completion Date:</span>{" "}
                        {formatDate(selectedReturn.completionDate)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </DashboardLayout>
  )
}
