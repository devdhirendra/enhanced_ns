"use client"
import { useState } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  FileText,
  Plus,
  Download,
  Printer,
  Mail,
  Eye,
  Edit,
  Trash2,
  Calculator,
  Receipt,
  CalendarIcon,
  Search,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { getStatusColor, formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

// Sample invoice data
const invoicesData = [
  {
    id: "INV001",
    invoiceNumber: "NW-2024-001",
    customerId: "CUST1245",
    customerName: "Rajesh Kumar",
    customerPhone: "+91 9876543210",
    customerEmail: "rajesh@email.com",
    customerAddress: "123, MG Road, Sector 15, Gurgaon",
    plan: "Fiber Pro 100 Mbps",
    amount: 699,
    tax: 125.82,
    totalAmount: 824.82,
    dueDate: "2024-01-31",
    issueDate: "2024-01-01",
    status: "paid",
    paidDate: "2024-01-15",
    paymentMethod: "UPI",
    billingPeriod: "January 2024",
    gstNumber: "27AABCU9603R1ZX",
    type: "recurring",
  },
  {
    id: "INV002",
    invoiceNumber: "NW-2024-002",
    customerId: "CUST1246",
    customerName: "Priya Singh",
    customerPhone: "+91 9876543211",
    customerEmail: "priya@email.com",
    customerAddress: "456, Park Street, Block A, Delhi",
    plan: "Basic 50 Mbps",
    amount: 499,
    tax: 89.82,
    totalAmount: 588.82,
    dueDate: "2024-01-31",
    issueDate: "2024-01-01",
    status: "overdue",
    paidDate: null,
    paymentMethod: null,
    billingPeriod: "January 2024",
    gstNumber: "07AABCU9603R1ZY",
    type: "recurring",
  },
  {
    id: "INV003",
    invoiceNumber: "NW-2024-003",
    customerId: "CUST1247",
    customerName: "Amit Sharma",
    customerPhone: "+91 9876543212",
    customerEmail: "amit@email.com",
    customerAddress: "789, Civil Lines, Noida",
    plan: "Installation Charges",
    amount: 2500,
    tax: 450,
    totalAmount: 2950,
    dueDate: "2024-01-20",
    issueDate: "2024-01-05",
    status: "pending",
    paidDate: null,
    paymentMethod: null,
    billingPeriod: "One-time",
    gstNumber: "09AABCU9603R1ZZ",
    type: "one_time",
  },
]

// Sample quotation data
const quotationsData = [
  {
    id: "QUO001",
    quotationNumber: "NW-Q-2024-001",
    customerName: "Neha Gupta",
    customerPhone: "+91 9876543213",
    customerEmail: "neha@email.com",
    items: [
      { description: "Fiber Connection Setup", quantity: 1, rate: 1500, amount: 1500 },
      { description: "Router (Dual Band)", quantity: 1, rate: 2500, amount: 2500 },
      { description: "Installation Charges", quantity: 1, rate: 1000, amount: 1000 },
    ],
    subtotal: 5000,
    tax: 900,
    total: 5900,
    validUntil: "2024-02-15",
    issueDate: "2024-01-15",
    status: "sent",
    notes: "Includes 6 months warranty on router",
  },
  {
    id: "QUO002",
    quotationNumber: "NW-Q-2024-002",
    customerName: "Vikash Patel",
    customerPhone: "+91 9876543214",
    customerEmail: "vikash@email.com",
    items: [
      { description: "Premium Fiber Plan - 200 Mbps", quantity: 12, rate: 999, amount: 11988 },
      { description: "Advanced Router", quantity: 1, rate: 3500, amount: 3500 },
    ],
    subtotal: 15488,
    tax: 2787.84,
    total: 18275.84,
    validUntil: "2024-02-20",
    issueDate: "2024-01-20",
    status: "accepted",
    notes: "Annual plan with 2 months free",
  },
]

const invoiceStats = {
  totalInvoices: 156,
  totalAmount: 847500,
  paidAmount: 723400,
  pendingAmount: 124100,
  overdueAmount: 45600,
  thisMonthInvoices: 89,
  avgInvoiceValue: 5432,
  collectionRate: 85.4,
}

export default function InvoicingEstimates() {
  const [invoices, setInvoices] = useState(invoicesData)
  const [quotations, setQuotations] = useState(quotationsData)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [selectedQuotation, setSelectedQuotation] = useState(null)
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false)
  const [isQuotationDialogOpen, setIsQuotationDialogOpen] = useState(false)
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState({ from: null, to: null })
  const [gstEnabled, setGstEnabled] = useState(true)
  const [newInvoice, setNewInvoice] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerAddress: "",
    plan: "",
    amount: "",
    billingPeriod: "",
    dueDate: "",
    type: "recurring",
  })
  const [newQuotation, setNewQuotation] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    items: [{ description: "", quantity: 1, rate: 0, amount: 0 }],
    validUntil: "",
    notes: "",
  })
  const { toast } = useToast()

  const calculateTax = (amount: number) => {
    return gstEnabled ? amount * 0.18 : 0
  }

  const handleCreateInvoice = () => {
    const amount = Number.parseFloat(newInvoice.amount)
    const tax = calculateTax(amount)
    const invoice = {
      id: `INV${String(invoices.length + 1).padStart(3, "0")}`,
      invoiceNumber: `NW-2024-${String(invoices.length + 1).padStart(3, "0")}`,
      customerId: `CUST${Math.floor(Math.random() * 9999)}`,
      customerName: newInvoice.customerName,
      customerPhone: newInvoice.customerPhone,
      customerEmail: newInvoice.customerEmail,
      customerAddress: newInvoice.customerAddress,
      plan: newInvoice.plan,
      amount,
      tax,
      totalAmount: amount + tax,
      dueDate: newInvoice.dueDate,
      issueDate: new Date().toISOString().split("T")[0],
      status: "pending",
      paidDate: null,
      paymentMethod: null,
      billingPeriod: newInvoice.billingPeriod,
      gstNumber: "27AABCU9603R1ZX",
      type: newInvoice.type,
    }
    setInvoices([invoice, ...invoices])
    setNewInvoice({
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      customerAddress: "",
      plan: "",
      amount: "",
      billingPeriod: "",
      dueDate: "",
      type: "recurring",
    })
    setIsInvoiceDialogOpen(false)
    toast({
      title: "Invoice Created",
      description: `Invoice ${invoice.invoiceNumber} created for ${invoice.customerName}`,
    })
  }

  const handleCreateQuotation = () => {
    const subtotal = newQuotation.items.reduce((sum, item) => sum + item.amount, 0)
    const tax = calculateTax(subtotal)
    const quotation = {
      id: `QUO${String(quotations.length + 1).padStart(3, "0")}`,
      quotationNumber: `NW-Q-2024-${String(quotations.length + 1).padStart(3, "0")}`,
      customerName: newQuotation.customerName,
      customerPhone: newQuotation.customerPhone,
      customerEmail: newQuotation.customerEmail,
      items: newQuotation.items,
      subtotal,
      tax,
      total: subtotal + tax,
      validUntil: newQuotation.validUntil,
      issueDate: new Date().toISOString().split("T")[0],
      status: "draft",
      notes: newQuotation.notes,
    }
    setQuotations([quotation, ...quotations])
    setNewQuotation({
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      items: [{ description: "", quantity: 1, rate: 0, amount: 0 }],
      validUntil: "",
      notes: "",
    })
    setIsQuotationDialogOpen(false)
    toast({
      title: "Quotation Created",
      description: `Quotation ${quotation.quotationNumber} created for ${quotation.customerName}`,
    })
  }

  const addQuotationItem = () => {
    setNewQuotation({
      ...newQuotation,
      items: [...newQuotation.items, { description: "", quantity: 1, rate: 0, amount: 0 }],
    })
  }

  const updateQuotationItem = (index: number, field: string, value: any) => {
    const items = [...newQuotation.items]
    items[index][field] = value
    if (field === "quantity" || field === "rate") {
      items[index].amount = items[index].quantity * items[index].rate
    }
    setNewQuotation({ ...newQuotation, items })
  }

  const removeQuotationItem = (index: number) => {
    const items = newQuotation.items.filter((_, i) => i !== index)
    setNewQuotation({ ...newQuotation, items })
  }

  const convertToInvoice = (quotation: any) => {
    const invoice = {
      id: `INV${String(invoices.length + 1).padStart(3, "0")}`,
      invoiceNumber: `NW-2024-${String(invoices.length + 1).padStart(3, "0")}`,
      customerId: `CUST${Math.floor(Math.random() * 9999)}`,
      customerName: quotation.customerName,
      customerPhone: quotation.customerPhone,
      customerEmail: quotation.customerEmail,
      customerAddress: "",
      plan: quotation.items.map((item: any) => item.description).join(", "),
      amount: quotation.subtotal,
      tax: quotation.tax,
      totalAmount: quotation.total,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      issueDate: new Date().toISOString().split("T")[0],
      status: "pending",
      paidDate: null,
      paymentMethod: null,
      billingPeriod: "One-time",
      gstNumber: "27AABCU9603R1ZX",
      type: "one_time",
    }
    setInvoices([invoice, ...invoices])
    toast({
      title: "Quotation Converted",
      description: `Quotation ${quotation.quotationNumber} converted to invoice ${invoice.invoiceNumber}`,
    })
  }

  const downloadPDF = (document: any, type: string) => {
    toast({
      title: "Download Initiated",
      description: `Downloading ${type} ${document.invoiceNumber || document.quotationNumber} as PDF`,
    })
  }

  const sendEmail = (document: any, type: string) => {
    toast({
      title: "Email Sent",
      description: `Sending ${type} ${document.invoiceNumber || document.quotationNumber} via email`,
    })
  }

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerPhone.includes(searchTerm)
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <DashboardLayout title="Invoicing & Estimates" description="Manage invoices, quotations, and billing">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoicing & Estimates</h1>
            <p className="text-gray-600 mt-1">Generate invoices, quotations, and manage billing</p>
          </div>
          <div className="flex space-x-3">
            <div className="flex items-center space-x-2">
              <Label htmlFor="gst-toggle">GST</Label>
              <Switch id="gst-toggle" checked={gstEnabled} onCheckedChange={setGstEnabled} />
            </div>
            <Dialog open={isQuotationDialogOpen} onOpenChange={setIsQuotationDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Calculator className="h-4 w-4 mr-2" />
                  Create Quote
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Create Quotation</DialogTitle>
                  <DialogDescription>Generate a quotation for potential customers</DialogDescription>
                </DialogHeader>
                <QuotationForm
                  newQuotation={newQuotation}
                  setNewQuotation={setNewQuotation}
                  addQuotationItem={addQuotationItem}
                  updateQuotationItem={updateQuotationItem}
                  removeQuotationItem={removeQuotationItem}
                  handleCreateQuotation={handleCreateQuotation}
                  gstEnabled={gstEnabled}
                  calculateTax={calculateTax}
                  setIsQuotationDialogOpen={setIsQuotationDialogOpen}
                />
              </DialogContent>
            </Dialog>
            <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Invoice</DialogTitle>
                  <DialogDescription>Generate a new invoice for a customer</DialogDescription>
                </DialogHeader>
                <InvoiceForm
                  newInvoice={newInvoice}
                  setNewInvoice={setNewInvoice}
                  handleCreateInvoice={handleCreateInvoice}
                  gstEnabled={gstEnabled}
                  calculateTax={calculateTax}
                  setIsInvoiceDialogOpen={setIsInvoiceDialogOpen}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Invoices</p>
                  <p className="text-2xl font-bold text-blue-600">{invoiceStats.totalInvoices}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600 font-medium">+{invoiceStats.thisMonthInvoices}</span>
                <span className="text-sm text-gray-500 ml-1">this month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{(invoiceStats.totalAmount / 100000).toFixed(1)}L
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex items-center mt-2">
                <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600 font-medium">
                  ₹{(invoiceStats.paidAmount / 100000).toFixed(1)}L
                </span>
                <span className="text-sm text-gray-500 ml-1">collected</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Amount</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    ₹{(invoiceStats.pendingAmount / 1000).toFixed(0)}K
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="flex items-center mt-2">
                <AlertCircle className="h-4 w-4 text-red-600 mr-1" />
                <span className="text-sm text-red-600 font-medium">
                  ₹{(invoiceStats.overdueAmount / 1000).toFixed(0)}K
                </span>
                <span className="text-sm text-gray-500 ml-1">overdue</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Collection Rate</p>
                  <p className="text-2xl font-bold text-purple-600">{invoiceStats.collectionRate}%</p>
                </div>
                <Receipt className="h-8 w-8 text-purple-600" />
              </div>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-600">Avg Invoice:</span>
                <span className="text-sm font-medium ml-1">₹{invoiceStats.avgInvoiceValue}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="invoices" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="quotations">Quotations</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Management</CardTitle>
                <CardDescription>Create, manage, and track all customer invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search by customer name, invoice number, or phone..."
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
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Date Range
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Plan/Service</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{invoice.customerName}</div>
                              <div className="text-sm text-gray-500">{invoice.customerPhone}</div>
                            </div>
                          </TableCell>
                          <TableCell>{invoice.plan}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">₹{invoice.totalAmount.toLocaleString()}</div>
                              <div className="text-sm text-gray-500">
                                Base: ₹{invoice.amount} + Tax: ₹{invoice.tax.toFixed(2)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{formatDate(invoice.dueDate)}</div>
                            {invoice.status === "overdue" && (
                              <div className="text-xs text-red-600">
                                {Math.floor((new Date() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))}{" "}
                                days overdue
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedInvoice(invoice)
                                  setIsPreviewDialogOpen(true)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => downloadPDF(invoice, "Invoice")}>
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => sendEmail(invoice, "Invoice")}>
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
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

          <TabsContent value="quotations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quotation Management</CardTitle>
                <CardDescription>Create and manage quotations for potential customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Quote #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Valid Until</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quotations.map((quotation) => (
                        <TableRow key={quotation.id}>
                          <TableCell className="font-medium">{quotation.quotationNumber}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{quotation.customerName}</div>
                              <div className="text-sm text-gray-500">{quotation.customerPhone}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {quotation.items.length} item{quotation.items.length > 1 ? "s" : ""}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">₹{quotation.total.toLocaleString()}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{formatDate(quotation.validUntil)}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(quotation.status)}>{quotation.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedQuotation(quotation)
                                  setIsPreviewDialogOpen(true)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => downloadPDF(quotation, "Quotation")}>
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => sendEmail(quotation, "Quotation")}>
                                <Mail className="h-4 w-4" />
                              </Button>
                              {quotation.status === "accepted" && (
                                <Button size="sm" onClick={() => convertToInvoice(quotation)}>
                                  <Receipt className="h-4 w-4 mr-2" />
                                  Convert
                                </Button>
                              )}
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

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Templates</CardTitle>
                <CardDescription>Customize invoice and quotation templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="border-2 border-dashed border-gray-300 hover:border-blue-300 transition-colors">
                    <CardContent className="p-6 text-center">
                      <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Create New Template</h3>
                      <p className="text-sm text-gray-500 mb-4">Design a custom invoice template</p>
                      <Button>Create Template</Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2 hover:border-blue-200 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">Standard Invoice</h3>
                          <p className="text-sm text-gray-500">Default template</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>• Company logo and details</div>
                        <div>• Customer information</div>
                        <div>• Itemized billing</div>
                        <div>• GST calculation</div>
                        <div>• Payment terms</div>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <Button size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 hover:border-blue-200 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">Quotation Template</h3>
                          <p className="text-sm text-gray-500">For estimates</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>• Professional header</div>
                        <div>• Service breakdown</div>
                        <div>• Validity period</div>
                        <div>• Terms & conditions</div>
                        <div>• Contact information</div>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <Button size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Preview Dialog */}
        <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {selectedInvoice
                  ? `Invoice ${selectedInvoice.invoiceNumber}`
                  : selectedQuotation
                    ? `Quotation ${selectedQuotation.quotationNumber}`
                    : "Document Preview"}
              </DialogTitle>
              <DialogDescription>Preview of the document before printing or sending</DialogDescription>
            </DialogHeader>
            <div className="bg-white p-8 border rounded-lg">
              {selectedInvoice && (
                <div className="space-y-6">
                  {/* Invoice Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-2xl font-bold text-blue-600">INVOICE</h1>
                      <p className="text-gray-600">Network Solutions Pvt. Ltd.</p>
                      <p className="text-sm text-gray-500">123 Business Park, Tech City</p>
                      <p className="text-sm text-gray-500">GST: 27AABCU9603R1ZX</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">Invoice #: {selectedInvoice.invoiceNumber}</p>
                      <p className="text-sm">Issue Date: {formatDate(selectedInvoice.issueDate)}</p>
                      <p className="text-sm">Due Date: {formatDate(selectedInvoice.dueDate)}</p>
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-semibold mb-2">Bill To:</h3>
                      <p className="font-medium">{selectedInvoice.customerName}</p>
                      <p className="text-sm text-gray-600">{selectedInvoice.customerAddress}</p>
                      <p className="text-sm text-gray-600">{selectedInvoice.customerPhone}</p>
                      <p className="text-sm text-gray-600">{selectedInvoice.customerEmail}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Service Period:</h3>
                      <p>{selectedInvoice.billingPeriod}</p>
                      <p className="text-sm text-gray-600">Plan: {selectedInvoice.plan}</p>
                    </div>
                  </div>

                  {/* Invoice Items */}
                  <div>
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 p-3 text-left">Description</th>
                          <th className="border border-gray-300 p-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 p-3">{selectedInvoice.plan}</td>
                          <td className="border border-gray-300 p-3 text-right">
                            ₹{selectedInvoice.amount.toLocaleString()}
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 p-3">GST (18%)</td>
                          <td className="border border-gray-300 p-3 text-right">₹{selectedInvoice.tax.toFixed(2)}</td>
                        </tr>
                        <tr className="bg-gray-50 font-semibold">
                          <td className="border border-gray-300 p-3">Total</td>
                          <td className="border border-gray-300 p-3 text-right">
                            ₹{selectedInvoice.totalAmount.toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Payment Terms */}
                  <div className="text-sm text-gray-600">
                    <p className="font-semibold">Payment Terms:</p>
                    <p>• Payment is due within 30 days of invoice date</p>
                    <p>• Late payments may incur additional charges</p>
                    <p>• For support, contact: support@network.com</p>
                  </div>
                </div>
              )}

              {selectedQuotation && (
                <div className="space-y-6">
                  {/* Quotation Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-2xl font-bold text-blue-600">QUOTATION</h1>
                      <p className="text-gray-600">Network Solutions Pvt. Ltd.</p>
                      <p className="text-sm text-gray-500">123 Business Park, Tech City</p>
                      <p className="text-sm text-gray-500">GST: 27AABCU9603R1ZX</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">Quote #: {selectedQuotation.quotationNumber}</p>
                      <p className="text-sm">Date: {formatDate(selectedQuotation.issueDate)}</p>
                      <p className="text-sm">Valid Until: {formatDate(selectedQuotation.validUntil)}</p>
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div>
                    <h3 className="font-semibold mb-2">Quote For:</h3>
                    <p className="font-medium">{selectedQuotation.customerName}</p>
                    <p className="text-sm text-gray-600">{selectedQuotation.customerPhone}</p>
                    <p className="text-sm text-gray-600">{selectedQuotation.customerEmail}</p>
                  </div>

                  {/* Quotation Items */}
                  <div>
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 p-3 text-left">Description</th>
                          <th className="border border-gray-300 p-3 text-center">Qty</th>
                          <th className="border border-gray-300 p-3 text-right">Rate</th>
                          <th className="border border-gray-300 p-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedQuotation.items.map((item, index) => (
                          <tr key={index}>
                            <td className="border border-gray-300 p-3">{item.description}</td>
                            <td className="border border-gray-300 p-3 text-center">{item.quantity}</td>
                            <td className="border border-gray-300 p-3 text-right">₹{item.rate.toLocaleString()}</td>
                            <td className="border border-gray-300 p-3 text-right">₹{item.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                        <tr>
                          <td colSpan="3" className="border border-gray-300 p-3 text-right font-semibold">
                            Subtotal:
                          </td>
                          <td className="border border-gray-300 p-3 text-right">
                            ₹{selectedQuotation.subtotal.toLocaleString()}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan="3" className="border border-gray-300 p-3 text-right">
                            GST (18%):
                          </td>
                          <td className="border border-gray-300 p-3 text-right">
                            ₹{selectedQuotation.tax.toLocaleString()}
                          </td>
                        </tr>
                        <tr className="bg-gray-50 font-semibold">
                          <td colSpan="3" className="border border-gray-300 p-3 text-right">
                            Total:
                          </td>
                          <td className="border border-gray-300 p-3 text-right">
                            ₹{selectedQuotation.total.toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Notes */}
                  {selectedQuotation.notes && (
                    <div>
                      <h3 className="font-semibold mb-2">Notes:</h3>
                      <p className="text-sm text-gray-600">{selectedQuotation.notes}</p>
                    </div>
                  )}

                  {/* Terms */}
                  <div className="text-sm text-gray-600">
                    <p className="font-semibold">Terms & Conditions:</p>
                    <p>• This quotation is valid until the date mentioned above</p>
                    <p>• Prices are inclusive of all taxes unless specified</p>
                    <p>• Installation charges may apply based on location</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
                Close
              </Button>
              <Button variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

function InvoiceForm({
  newInvoice,
  setNewInvoice,
  handleCreateInvoice,
  gstEnabled,
  calculateTax,
  setIsInvoiceDialogOpen,
}: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Customer Name</Label>
          <Input
            value={newInvoice.customerName}
            onChange={(e) => setNewInvoice({ ...newInvoice, customerName: e.target.value })}
            placeholder="Enter customer name"
          />
        </div>
        <div>
          <Label>Phone Number</Label>
          <Input
            value={newInvoice.customerPhone}
            onChange={(e) => setNewInvoice({ ...newInvoice, customerPhone: e.target.value })}
            placeholder="+91 9876543210"
          />
        </div>
      </div>
      <div>
        <Label>Email Address</Label>
        <Input
          value={newInvoice.customerEmail}
          onChange={(e) => setNewInvoice({ ...newInvoice, customerEmail: e.target.value })}
          placeholder="customer@email.com"
        />
      </div>
      <div>
        <Label>Customer Address</Label>
        <Textarea
          value={newInvoice.customerAddress}
          onChange={(e) => setNewInvoice({ ...newInvoice, customerAddress: e.target.value })}
          placeholder="Complete address"
          rows={2}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Plan/Service</Label>
          <Input
            value={newInvoice.plan}
            onChange={(e) => setNewInvoice({ ...newInvoice, plan: e.target.value })}
            placeholder="e.g., Fiber Pro 100 Mbps"
          />
        </div>
        <div>
          <Label>Amount (₹)</Label>
          <Input
            type="number"
            value={newInvoice.amount}
            onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
            placeholder="699"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Billing Period</Label>
          <Input
            value={newInvoice.billingPeriod}
            onChange={(e) => setNewInvoice({ ...newInvoice, billingPeriod: e.target.value })}
            placeholder="January 2024"
          />
        </div>
        <div>
          <Label>Due Date</Label>
          <Input
            type="date"
            value={newInvoice.dueDate}
            onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label>Invoice Type</Label>
        <Select value={newInvoice.type} onValueChange={(value) => setNewInvoice({ ...newInvoice, type: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recurring">Recurring</SelectItem>
            <SelectItem value="one_time">One-time</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {newInvoice.amount && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Amount:</span>
              <span>₹{Number.parseFloat(newInvoice.amount || "0").toLocaleString()}</span>
            </div>
            {gstEnabled && (
              <div className="flex justify-between">
                <span>GST (18%):</span>
                <span>₹{calculateTax(Number.parseFloat(newInvoice.amount || "0")).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span>Total:</span>
              <span>
                ₹
                {(
                  Number.parseFloat(newInvoice.amount || "0") +
                  calculateTax(Number.parseFloat(newInvoice.amount || "0"))
                ).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => setIsInvoiceDialogOpen(false)}>
          Cancel
        </Button>
        <Button onClick={handleCreateInvoice}>Create Invoice</Button>
      </div>
    </div>
  )
}

function QuotationForm({
  newQuotation,
  setNewQuotation,
  addQuotationItem,
  updateQuotationItem,
  removeQuotationItem,
  handleCreateQuotation,
  gstEnabled,
  calculateTax,
  setIsQuotationDialogOpen,
}: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Customer Name</Label>
          <Input
            value={newQuotation.customerName}
            onChange={(e) => setNewQuotation({ ...newQuotation, customerName: e.target.value })}
            placeholder="Enter customer name"
          />
        </div>
        <div>
          <Label>Phone Number</Label>
          <Input
            value={newQuotation.customerPhone}
            onChange={(e) => setNewQuotation({ ...newQuotation, customerPhone: e.target.value })}
            placeholder="+91 9876543210"
          />
        </div>
        <div>
          <Label>Email Address</Label>
          <Input
            value={newQuotation.customerEmail}
            onChange={(e) => setNewQuotation({ ...newQuotation, customerEmail: e.target.value })}
            placeholder="customer@email.com"
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <Label className="text-lg font-semibold">Items</Label>
          <Button onClick={addQuotationItem} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
        <div className="space-y-3">
          {newQuotation.items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-5">
                <Input
                  value={item.description}
                  onChange={(e) => updateQuotationItem(index, "description", e.target.value)}
                  placeholder="Item description"
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateQuotationItem(index, "quantity", Number.parseInt(e.target.value))}
                  placeholder="Qty"
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  value={item.rate}
                  onChange={(e) => updateQuotationItem(index, "rate", Number.parseFloat(e.target.value))}
                  placeholder="Rate"
                />
              </div>
              <div className="col-span-2">
                <Input value={item.amount} readOnly placeholder="Amount" />
              </div>
              <div className="col-span-1">
                {newQuotation.items.length > 1 && (
                  <Button variant="outline" size="sm" onClick={() => removeQuotationItem(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Valid Until</Label>
          <Input
            type="date"
            value={newQuotation.validUntil}
            onChange={(e) => setNewQuotation({ ...newQuotation, validUntil: e.target.value })}
          />
        </div>
        <div>
          <Label>Notes</Label>
          <Textarea
            value={newQuotation.notes}
            onChange={(e) => setNewQuotation({ ...newQuotation, notes: e.target.value })}
            placeholder="Additional notes..."
            rows={2}
          />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹{newQuotation.items.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}</span>
          </div>
          {gstEnabled && (
            <div className="flex justify-between">
              <span>GST (18%):</span>
              <span>
                ₹{calculateTax(newQuotation.items.reduce((sum, item) => sum + item.amount, 0)).toLocaleString()}
              </span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-lg border-t pt-2">
            <span>Total:</span>
            <span>
              ₹
              {(
                newQuotation.items.reduce((sum, item) => sum + item.amount, 0) +
                calculateTax(newQuotation.items.reduce((sum, item) => sum + item.amount, 0))
              ).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => setIsQuotationDialogOpen(false)}>
          Cancel
        </Button>
        <Button onClick={handleCreateQuotation}>Create Quotation</Button>
      </div>
    </div>
  )
}
