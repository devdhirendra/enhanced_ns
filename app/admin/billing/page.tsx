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
import {
  Search,
  CreditCard,
  DollarSign,
  Calendar,
  Building2,
  Download,
  Eye,
  Edit,
  Plus,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Receipt,
  Banknote,
  PieChart,
} from "lucide-react"
import { formatCurrency, formatDate, getStatusColor, exportToCSV } from "@/lib/utils"
import { toast } from "sonner"

// Demo data for operator invoices
const operatorInvoices = [
  {
    id: "INV001",
    operator: "City Networks",
    operatorId: "OP001",
    amount: 25000,
    plan: "Annual Premium",
    issueDate: "2024-01-01",
    dueDate: "2024-01-31",
    paidDate: "2024-01-15",
    status: "paid",
    type: "subscription",
    description: "Annual subscription renewal",
    gst: 4500,
    totalAmount: 29500,
  },
  {
    id: "INV002",
    operator: "Metro Fiber",
    operatorId: "OP002",
    amount: 15000,
    plan: "Monthly Standard",
    issueDate: "2024-01-15",
    dueDate: "2024-02-15",
    paidDate: null,
    status: "pending",
    type: "subscription",
    description: "Monthly subscription",
    gst: 2700,
    totalAmount: 17700,
  },
  {
    id: "INV003",
    operator: "Speed Net",
    operatorId: "OP003",
    amount: 8000,
    plan: "Basic Monthly",
    issueDate: "2024-01-10",
    dueDate: "2024-02-10",
    paidDate: null,
    status: "overdue",
    type: "subscription",
    description: "Monthly subscription",
    gst: 1440,
    totalAmount: 9440,
  },
  {
    id: "INV004",
    operator: "Connect Plus",
    operatorId: "OP004",
    amount: 12000,
    plan: "Custom Plan",
    issueDate: "2024-01-20",
    dueDate: "2024-02-20",
    paidDate: "2024-01-22",
    status: "paid",
    type: "subscription",
    description: "Custom plan subscription",
    gst: 2160,
    totalAmount: 14160,
  },
]

// Demo data for marketplace payments
const marketplacePayments = [
  {
    id: "MP001",
    operator: "City Networks",
    orderAmount: 80000,
    commission: 8000,
    vendor: "Tech Distributors Ltd",
    vendorPayout: 72000,
    paymentDate: "2024-01-22",
    status: "completed",
    orderId: "ORD001",
  },
  {
    id: "MP002",
    operator: "Metro Fiber",
    orderAmount: 36000,
    commission: 3600,
    vendor: "Cable Corporation",
    vendorPayout: 32400,
    paymentDate: "2024-01-20",
    status: "completed",
    orderId: "ORD002",
  },
  {
    id: "MP003",
    operator: "Speed Net",
    orderAmount: 19000,
    commission: 1900,
    vendor: "Component Supplies",
    vendorPayout: 17100,
    paymentDate: null,
    status: "pending",
    orderId: "ORD003",
  },
]

// Demo data for subscription plans
const subscriptionPlans = [
  {
    id: "PLAN001",
    name: "Basic Monthly",
    type: "monthly",
    price: 8000,
    features: ["Up to 500 connections", "Basic support", "Standard dashboard"],
    maxConnections: 500,
    maxTechnicians: 5,
    status: "active",
    subscribers: 45,
  },
  {
    id: "PLAN002",
    name: "Standard Monthly",
    type: "monthly",
    price: 15000,
    features: ["Up to 1000 connections", "Priority support", "Advanced dashboard", "API access"],
    maxConnections: 1000,
    maxTechnicians: 10,
    status: "active",
    subscribers: 67,
  },
  {
    id: "PLAN003",
    name: "Premium Annual",
    type: "annual",
    price: 25000,
    features: ["Unlimited connections", "24/7 support", "Full dashboard", "API access", "Custom integrations"],
    maxConnections: -1,
    maxTechnicians: -1,
    status: "active",
    subscribers: 34,
  },
  {
    id: "PLAN004",
    name: "Enterprise Custom",
    type: "custom",
    price: 50000,
    features: ["Custom features", "Dedicated support", "White-label solution"],
    maxConnections: -1,
    maxTechnicians: -1,
    status: "active",
    subscribers: 8,
  },
]

// Demo data for payment history
const paymentHistory = [
  {
    id: "PAY001",
    operator: "City Networks",
    amount: 29500,
    method: "Bank Transfer",
    transactionId: "TXN123456789",
    date: "2024-01-15",
    status: "success",
    invoiceId: "INV001",
  },
  {
    id: "PAY002",
    operator: "Connect Plus",
    amount: 14160,
    method: "UPI",
    transactionId: "UPI987654321",
    date: "2024-01-22",
    status: "success",
    invoiceId: "INV004",
  },
  {
    id: "PAY003",
    operator: "Metro Fiber",
    amount: 17700,
    method: "Credit Card",
    transactionId: "CC456789123",
    date: "2024-01-18",
    status: "failed",
    invoiceId: "INV002",
  },
]

export default function BillingPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showCreateInvoiceDialog, setShowCreateInvoiceDialog] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false)

  const filteredInvoices = operatorInvoices.filter((invoice) => {
    const matchesSearch =
      invoice.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleExport = () => {
    const exportData = operatorInvoices.map((invoice) => ({
      "Invoice ID": invoice.id,
      Operator: invoice.operator,
      Amount: invoice.amount,
      "Total Amount": invoice.totalAmount,
      Plan: invoice.plan,
      "Issue Date": invoice.issueDate,
      "Due Date": invoice.dueDate,
      "Paid Date": invoice.paidDate || "Not Paid",
      Status: invoice.status,
    }))
    exportToCSV(exportData, "billing-invoices")
    toast.success("Billing data exported successfully!")
  }

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice)
    setShowInvoiceDialog(true)
  }

  const handleDownloadInvoice = (invoice: any) => {
    toast.success(`Invoice ${invoice.id} downloaded successfully!`)
  }

  const handleEditInvoice = (invoice: any) => {
    toast.info(`Edit invoice ${invoice.id}`)
  }

  const handleDeleteInvoice = (invoice: any) => {
    toast.warning(`Invoice ${invoice.id} deleted`)
  }

  const totalRevenue = operatorInvoices.reduce((sum, inv) => sum + (inv.status === "paid" ? inv.totalAmount : 0), 0)
  const pendingAmount = operatorInvoices.reduce((sum, inv) => sum + (inv.status === "pending" ? inv.totalAmount : 0), 0)
  const overdueAmount = operatorInvoices.reduce((sum, inv) => sum + (inv.status === "overdue" ? inv.totalAmount : 0), 0)
  const totalInvoices = operatorInvoices.length
  const paidInvoices = operatorInvoices.filter((inv) => inv.status === "paid").length
  const marketplaceRevenue = marketplacePayments.reduce((sum, pay) => sum + pay.commission, 0)

  return (
    <DashboardLayout title="Billing & Finance" description="Manage operator subscriptions and marketplace payments">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Revenue</CardTitle>
              <div className="p-2 bg-green-500 rounded-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600 font-medium">+12.5%</span>
                <span className="text-sm text-gray-500 ml-1">this month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-amber-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Pending Amount</CardTitle>
              <div className="p-2 bg-yellow-500 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{formatCurrency(pendingAmount)}</div>
              <p className="text-sm text-gray-500 mt-2">Awaiting payment</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-rose-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Overdue Amount</CardTitle>
              {/* <div className="p-2 bg-red-500 rounded-lg"> */}
              <AlertTriangle className="h-5 w-5 text-white" />
              {/* </div> */}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{formatCurrency(overdueAmount)}</div>
              <p className="text-sm text-red-600 mt-2 font-medium">Requires attention</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Marketplace Revenue</CardTitle>
              <div className="p-2 bg-purple-500 rounded-lg">
                <PieChart className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{formatCurrency(marketplaceRevenue)}</div>
              <p className="text-sm text-gray-500 mt-2">Commission earned</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="invoices" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="invoices" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Operator Invoices
              </TabsTrigger>
              <TabsTrigger value="marketplace" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Marketplace
              </TabsTrigger>
              <TabsTrigger value="plans" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Plans
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Payment History
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Dialog open={showCreateInvoiceDialog} onOpenChange={setShowCreateInvoiceDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Invoice
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Invoice</DialogTitle>
                    <DialogDescription>Generate a new invoice for an operator</DialogDescription>
                  </DialogHeader>
                  <CreateInvoiceForm onClose={() => setShowCreateInvoiceDialog(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <TabsContent value="invoices" className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Invoices Table */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Operator Invoices ({filteredInvoices.length})
                </CardTitle>
                <CardDescription>Subscription billing and invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice Details</TableHead>
                      <TableHead>Operator</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{invoice.id}</div>
                            <div className="text-sm text-gray-500">{invoice.description}</div>
                            <div className="text-xs text-gray-400">Type: {invoice.type}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Building2 className="h-4 w-4 text-blue-600" />
                            <div>
                              <div className="font-medium text-gray-900">{invoice.operator}</div>
                              <div className="text-xs text-gray-500">{invoice.operatorId}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {invoice.plan}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{formatCurrency(invoice.amount)}</div>
                            <div className="text-sm text-gray-500">GST: {formatCurrency(invoice.gst)}</div>
                            <div className="text-sm font-medium text-blue-600">
                              Total: {formatCurrency(invoice.totalAmount)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Issued: {formatDate(invoice.issueDate)}</div>
                            <div>Due: {formatDate(invoice.dueDate)}</div>
                            {invoice.paidDate && (
                              <div className="text-green-600">Paid: {formatDate(invoice.paidDate)}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => console.log("View invoice", invoice.id)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => console.log("Download invoice", invoice.id)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => console.log("Edit invoice", invoice.id)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="marketplace" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Marketplace Payments</CardTitle>
                <CardDescription>Commission and vendor payouts from marketplace orders</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Operator</TableHead>
                      <TableHead>Order Amount</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Vendor Payout</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {marketplacePayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Building2 className="h-4 w-4 text-blue-600" />
                            <span>{payment.operator}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(payment.orderAmount)}</TableCell>
                        <TableCell className="font-medium text-green-600">
                          {formatCurrency(payment.commission)}
                        </TableCell>
                        <TableCell>{payment.vendor}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(payment.vendorPayout)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => console.log("View payment", payment.id)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => console.log("Process payment", payment.id)}
                            >
                              <Banknote className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subscriptionPlans.map((plan) => (
                <Card key={plan.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-bold text-gray-900">{plan.name}</CardTitle>
                        <CardDescription className="capitalize">{plan.type} plan</CardDescription>
                      </div>
                      <Badge className={getStatusColor(plan.status)}>{plan.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">{formatCurrency(plan.price)}</div>
                      <p className="text-sm text-gray-500">per {plan.type === "annual" ? "year" : "month"}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subscribers:</span>
                        <span className="font-medium">{plan.subscribers}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Max Connections:</span>
                        <span className="font-medium">
                          {plan.maxConnections === -1 ? "Unlimited" : plan.maxConnections}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Max Technicians:</span>
                        <span className="font-medium">
                          {plan.maxTechnicians === -1 ? "Unlimited" : plan.maxTechnicians}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Features:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() => console.log("Edit plan", plan.id)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => console.log("View subscribers", plan.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Payment History</CardTitle>
                <CardDescription>All payment transactions from operators</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Operator</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentHistory.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Building2 className="h-4 w-4 text-blue-600" />
                            <span>{payment.operator}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <CreditCard className="h-4 w-4 text-gray-400" />
                            <span>{payment.method}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{payment.transactionId}</TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                            {formatDate(payment.date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => console.log("View payment", payment.id)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => console.log("Download receipt", payment.id)}
                            >
                              <Receipt className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

// Create Invoice Form Component
function CreateInvoiceForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    operator: "",
    plan: "",
    amount: 0,
    gst: 18,
    description: "",
    dueDate: "",
    type: "subscription",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Invoice form submitted:", formData)
    onClose()
  }

  const totalAmount = formData.amount + (formData.amount * formData.gst) / 100

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="operator">Operator *</Label>
          <Select value={formData.operator} onValueChange={(value) => setFormData({ ...formData, operator: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select operator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="City Networks">City Networks</SelectItem>
              <SelectItem value="Metro Fiber">Metro Fiber</SelectItem>
              <SelectItem value="Speed Net">Speed Net</SelectItem>
              <SelectItem value="Connect Plus">Connect Plus</SelectItem>
              <SelectItem value="Digital Link">Digital Link</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="plan">Plan *</Label>
          <Select value={formData.plan} onValueChange={(value) => setFormData({ ...formData, plan: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Basic Monthly">Basic Monthly</SelectItem>
              <SelectItem value="Standard Monthly">Standard Monthly</SelectItem>
              <SelectItem value="Premium Annual">Premium Annual</SelectItem>
              <SelectItem value="Custom Plan">Custom Plan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Invoice description"
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="amount">Amount *</Label>
          <Input
            id="amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: Number.parseFloat(e.target.value) || 0 })}
            required
          />
        </div>
        <div>
          <Label htmlFor="gst">GST % *</Label>
          <Input
            id="gst"
            type="number"
            value={formData.gst}
            onChange={(e) => setFormData({ ...formData, gst: Number.parseFloat(e.target.value) || 0 })}
            required
          />
        </div>
        <div>
          <Label htmlFor="total">Total Amount</Label>
          <Input id="total" value={formatCurrency(totalAmount)} disabled className="bg-gray-50" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dueDate">Due Date *</Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="subscription">Subscription</SelectItem>
              <SelectItem value="one-time">One-time</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Create Invoice</Button>
      </div>
    </form>
  )
}
