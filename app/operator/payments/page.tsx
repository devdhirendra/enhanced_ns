"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import {
  Plus,
  Search,
  Download,
  CreditCard,
  DollarSign,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  QrCode,
  Smartphone,
  Banknote,
  Globe,
  Receipt,
  Send,
} from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

// Demo data
const paymentsData = [
  {
    id: "PAY001",
    customerId: "CUST1245",
    customerName: "Rajesh Kumar",
    customerPhone: "+91 9876543210",
    amount: 699,
    month: "January 2024",
    paymentMode: "UPI",
    transactionId: "UPI123456789",
    status: "paid",
    paidDate: "2024-01-15T10:30:00Z",
    dueDate: "2024-01-31T23:59:59Z",
    plan: "Fiber Pro 100 Mbps",
  },
  {
    id: "PAY002",
    customerId: "CUST1246",
    customerName: "Priya Singh",
    customerPhone: "+91 9876543211",
    amount: 499,
    month: "January 2024",
    paymentMode: "Cash",
    transactionId: "CASH001",
    status: "paid",
    paidDate: "2024-01-14T15:45:00Z",
    dueDate: "2024-01-31T23:59:59Z",
    plan: "Basic 50 Mbps",
  },
  {
    id: "PAY003",
    customerId: "CUST1247",
    customerName: "Amit Sharma",
    customerPhone: "+91 9876543212",
    amount: 999,
    month: "January 2024",
    paymentMode: "Online",
    transactionId: "RZP_123456",
    status: "unpaid",
    paidDate: null,
    dueDate: "2024-01-31T23:59:59Z",
    plan: "Premium 200 Mbps",
  },
  {
    id: "PAY004",
    customerId: "CUST1248",
    customerName: "Neha Gupta",
    customerPhone: "+91 9876543213",
    amount: 799,
    month: "January 2024",
    paymentMode: "UPI",
    transactionId: "UPI987654321",
    status: "paid",
    paidDate: "2024-01-13T09:15:00Z",
    dueDate: "2024-01-31T23:59:59Z",
    plan: "Fiber Plus 150 Mbps",
  },
]

const paymentStats = {
  totalRevenue: 847500,
  collectedToday: 45600,
  pendingAmount: 125400,
  totalCustomers: 1247,
  paidCustomers: 1198,
  unpaidCustomers: 49,
  avgPaymentTime: "2.3 days",
  collectionRate: 96.1,
}

const paymentTrendData = [
  { month: "Aug", collected: 785000, pending: 95000 },
  { month: "Sep", collected: 812000, pending: 88000 },
  { month: "Oct", collected: 798000, pending: 102000 },
  { month: "Nov", collected: 834000, pending: 76000 },
  { month: "Dec", collected: 821000, pending: 89000 },
  { month: "Jan", collected: 847500, pending: 125400 },
]

const paymentModeData = [
  { mode: "UPI", amount: 425000, count: 623, color: "#3b82f6" },
  { mode: "Cash", amount: 254250, count: 387, color: "#10b981" },
  { mode: "Online", amount: 168250, count: 237, color: "#f59e0b" },
]

export default function PaymentsCollections() {
  const [payments, setPayments] = useState(paymentsData)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [modeFilter, setModeFilter] = useState("all")
  const [bulkAmount, setBulkAmount] = useState([500])
  const [newPayment, setNewPayment] = useState({
    customerName: "",
    customerPhone: "",
    amount: "",
    month: "",
    paymentMode: "UPI",
    transactionId: "",
  })

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "unpaid":
        return "bg-red-100 text-red-800"
      case "overdue":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getModeIcon = (mode) => {
    switch (mode) {
      case "UPI":
        return <Smartphone className="h-4 w-4" />
      case "Cash":
        return <Banknote className="h-4 w-4" />
      case "Online":
        return <Globe className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customerPhone.includes(searchTerm)
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter
    const matchesMode = modeFilter === "all" || payment.paymentMode === modeFilter
    return matchesSearch && matchesStatus && matchesMode
  })

  const handleAddPayment = () => {
    const payment = {
      id: `PAY${String(payments.length + 1).padStart(3, "0")}`,
      customerId: `CUST${Math.floor(Math.random() * 9999)}`,
      customerName: newPayment.customerName,
      customerPhone: newPayment.customerPhone,
      amount: Number.parseFloat(newPayment.amount),
      month: newPayment.month,
      paymentMode: newPayment.paymentMode,
      transactionId: newPayment.transactionId,
      status: "paid",
      paidDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      plan: "Standard Plan",
    }
    setPayments([payment, ...payments])
    setNewPayment({
      customerName: "",
      customerPhone: "",
      amount: "",
      month: "",
      paymentMode: "UPI",
      transactionId: "",
    })
    setIsAddDialogOpen(false)
  }

  const handleStatusUpdate = (paymentId, newStatus) => {
    setPayments(
      payments.map((payment) =>
        payment.id === paymentId
          ? {
              ...payment,
              status: newStatus,
              paidDate: newStatus === "paid" ? new Date().toISOString() : null,
            }
          : payment,
      ),
    )
  }

  const generateQRCode = (payment) => {
    // In a real app, this would generate an actual QR code
    alert(`QR Code generated for ${payment.customerName} - Amount: ₹${payment.amount}`)
  }

  const sendPaymentLink = (payment) => {
    // In a real app, this would send via WhatsApp/SMS
    alert(`Payment link sent to ${payment.customerName} at ${payment.customerPhone}`)
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments & Collections</h1>
          <p className="text-gray-600 mt-1">Manage customer payments and track collections</p>
        </div>
        <div className="flex space-x-3">
          <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Send className="h-4 w-4 mr-2" />
                Bulk QR Send
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Bulk Payment QR Codes</DialogTitle>
                <DialogDescription>Send payment QR codes to multiple customers via WhatsApp</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Minimum Amount Filter</Label>
                  <div className="mt-2">
                    <Slider
                      value={bulkAmount}
                      onValueChange={setBulkAmount}
                      max={2000}
                      min={100}
                      step={50}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>₹100</span>
                      <span>₹{bulkAmount[0]}</span>
                      <span>₹2000</span>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    This will send QR codes to{" "}
                    {payments.filter((p) => p.amount >= bulkAmount[0] && p.status === "unpaid").length} customers with
                    unpaid bills ≥ ₹{bulkAmount[0]}
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsBulkDialogOpen(false)}>Send QR Codes</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record New Payment</DialogTitle>
                <DialogDescription>Add a new payment record to the system</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={newPayment.customerName}
                    onChange={(e) => setNewPayment({ ...newPayment, customerName: e.target.value })}
                    placeholder="Enter customer name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone Number</Label>
                  <Input
                    id="customerPhone"
                    value={newPayment.customerPhone}
                    onChange={(e) => setNewPayment({ ...newPayment, customerPhone: e.target.value })}
                    placeholder="+91 9876543210"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                    placeholder="699"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="month">Billing Month</Label>
                  <Input
                    id="month"
                    value={newPayment.month}
                    onChange={(e) => setNewPayment({ ...newPayment, month: e.target.value })}
                    placeholder="January 2024"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMode">Payment Mode</Label>
                  <Select
                    value={newPayment.paymentMode}
                    onValueChange={(value) => setNewPayment({ ...newPayment, paymentMode: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Online">Online Banking</SelectItem>
                      <SelectItem value="Card">Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transactionId">Transaction ID</Label>
                  <Input
                    id="transactionId"
                    value={newPayment.transactionId}
                    onChange={(e) => setNewPayment({ ...newPayment, transactionId: e.target.value })}
                    placeholder="UPI123456789"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddPayment} className="bg-blue-600 hover:bg-blue-700">
                  Record Payment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">₹{(paymentStats.totalRevenue / 100000).toFixed(1)}L</div>
            <div className="flex items-center space-x-2 mt-2">
              <Badge className="bg-green-100 text-green-800 text-xs">
                ₹{(paymentStats.collectedToday / 1000).toFixed(0)}K today
              </Badge>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600 font-medium">+12.8%</span>
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Amount</CardTitle>
            <AlertCircle className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">₹{(paymentStats.pendingAmount / 1000).toFixed(0)}K</div>
            <div className="flex items-center space-x-2 mt-2">
              <Badge className="bg-orange-100 text-orange-800 text-xs">{paymentStats.unpaidCustomers} customers</Badge>
            </div>
            <div className="flex items-center mt-2">
              <Clock className="h-4 w-4 text-orange-600 mr-1" />
              <span className="text-sm text-orange-600 font-medium">Avg {paymentStats.avgPaymentTime}</span>
              <span className="text-sm text-gray-500 ml-1">delay</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Collection Rate</CardTitle>
            <CheckCircle className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{paymentStats.collectionRate}%</div>
            <div className="flex items-center space-x-2 mt-2">
              <Badge className="bg-blue-100 text-blue-800 text-xs">{paymentStats.paidCustomers} paid</Badge>
            </div>
            <div className="flex items-center mt-2">
              <Users className="h-4 w-4 text-blue-600 mr-1" />
              <span className="text-sm text-blue-600 font-medium">of {paymentStats.totalCustomers}</span>
              <span className="text-sm text-gray-500 ml-1">customers</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Payment Methods</CardTitle>
            <CreditCard className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">3</div>
            <div className="flex items-center space-x-2 mt-2">
              <Badge className="bg-purple-100 text-purple-800 text-xs">UPI Leading</Badge>
            </div>
            <div className="flex items-center mt-2">
              <Smartphone className="h-4 w-4 text-purple-600 mr-1" />
              <span className="text-sm text-purple-600 font-medium">50.2%</span>
              <span className="text-sm text-gray-500 ml-1">via UPI</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Payment Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Payment Collection Trend</CardTitle>
            <CardDescription>Monthly collection vs pending amounts</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={paymentTrendData}>
                <defs>
                  <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Area
                  type="monotone"
                  dataKey="collected"
                  stackId="1"
                  stroke="#10b981"
                  fill="url(#colorCollected)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="pending"
                  stackId="1"
                  stroke="#f59e0b"
                  fill="url(#colorPending)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Mode Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Distribution by payment mode</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentModeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="amount"
                  label={({ mode, count }) => `${mode} (${count})`}
                >
                  {paymentModeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {paymentModeData.map((item) => (
                <div key={item.mode} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                    <span className="text-sm">{item.mode}</span>
                  </div>
                  <span className="text-sm font-medium">₹{(item.amount / 1000).toFixed(0)}K</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Records</CardTitle>
          <CardDescription>Track all customer payments and collections</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Payments</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
              <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by customer name, phone, or payment ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={modeFilter} onValueChange={setModeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modes</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Online">Online</SelectItem>
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
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Month</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{payment.customerName}</div>
                            <div className="text-sm text-gray-500">{payment.customerPhone}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">₹{payment.amount}</TableCell>
                        <TableCell>{payment.month}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {getModeIcon(payment.paymentMode)}
                            <span className="ml-2">{payment.paymentMode}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {payment.paidDate ? (
                            <div className="text-sm">{new Date(payment.paidDate).toLocaleDateString()}</div>
                          ) : (
                            <div className="text-sm text-gray-500">
                              Due: {new Date(payment.dueDate).toLocaleDateString()}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {payment.status === "unpaid" && (
                              <>
                                <Button variant="outline" size="sm" onClick={() => generateQRCode(payment)}>
                                  <QrCode className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => sendPaymentLink(payment)}>
                                  <Send className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleStatusUpdate(payment.id, payment.status === "paid" ? "unpaid" : "paid")
                              }
                            >
                              <Receipt className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
