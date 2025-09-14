"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Receipt,
  Download,
  Calendar,
  DollarSign,
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

export default function CustomerPaymentsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("")
  const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false)

  // Mock data - replace with actual API calls
  const paymentMethods = [
    {
      id: "pm_1",
      type: "card",
      last4: "4242",
      brand: "visa",
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
    },
    {
      id: "pm_2",
      type: "upi",
      upiId: "user@paytm",
      isDefault: false,
    },
    {
      id: "pm_3",
      type: "netbanking",
      bankName: "HDFC Bank",
      accountNumber: "****1234",
      isDefault: false,
    },
  ]

  const paymentHistory = [
    {
      id: "pay_001",
      amount: 1999,
      status: "success",
      method: "UPI",
      date: "2024-01-20T10:30:00Z",
      billId: "INV-2024-001",
      transactionId: "TXN123456789",
    },
    {
      id: "pay_002",
      amount: 1999,
      status: "success",
      method: "Credit Card",
      date: "2023-12-18T14:15:00Z",
      billId: "INV-2023-012",
      transactionId: "TXN123456788",
    },
    {
      id: "pay_003",
      amount: 1999,
      status: "failed",
      method: "Net Banking",
      date: "2023-11-20T09:00:00Z",
      billId: "INV-2023-011",
      transactionId: "TXN123456787",
    },
  ]

  const upcomingPayments = [
    {
      id: "upcoming_1",
      amount: 1999,
      dueDate: "2024-02-28",
      billId: "INV-2024-002",
      plan: "Premium Fiber 100 Mbps",
      status: "pending",
    },
  ]

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case "card":
        return <CreditCard className="h-5 w-5" />
      case "upi":
        return <Smartphone className="h-5 w-5" />
      case "netbanking":
        return <Building2 className="h-5 w-5" />
      default:
        return <Wallet className="h-5 w-5" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handlePayNow = (billId: string, amount: number) => {
    if (!selectedPaymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method to proceed.",
        variant: "destructive",
      })
      return
    }

    // Implement payment processing logic
    toast({
      title: "Payment Initiated",
      description: `Payment of ${formatCurrency(amount)} has been initiated.`,
    })
  }

  const setDefaultPaymentMethod = (methodId: string) => {
    // Implement set default payment method logic
    toast({
      title: "Default Payment Method Updated",
      description: "Your default payment method has been updated successfully.",
    })
  }

  const deletePaymentMethod = (methodId: string) => {
    // Implement delete payment method logic
    toast({
      title: "Payment Method Removed",
      description: "Payment method has been removed successfully.",
    })
  }

  return (
    <DashboardLayout title="Payments & Methods" description="Manage your payment methods and history">
      <div className="space-y-6">
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upcoming">Upcoming Payments</TabsTrigger>
            <TabsTrigger value="methods">Payment Methods</TabsTrigger>
            <TabsTrigger value="history">Payment History</TabsTrigger>
            <TabsTrigger value="analytics">Payment Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6">
            {/* Current Bill Payment */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Current Bill Payment</span>
                  <Badge className="bg-yellow-100 text-yellow-800">Due Soon</Badge>
                </CardTitle>
                <CardDescription>Your current billing period payment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {upcomingPayments.map((payment) => (
                  <div key={payment.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{formatCurrency(payment.amount)}</h3>
                        <p className="text-sm text-gray-600">{payment.plan}</p>
                        <p className="text-sm text-gray-500">Due: {formatDate(payment.dueDate)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Bill ID: {payment.billId}</p>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="payment-method">Select Payment Method</Label>
                        <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentMethods.map((method) => (
                              <SelectItem key={method.id} value={method.id}>
                                <div className="flex items-center space-x-2">
                                  {getPaymentMethodIcon(method.type)}
                                  <span>
                                    {method.type === "card"
                                      ? `**** ${method.last4}`
                                      : method.type === "upi"
                                        ? method.upiId
                                        : method.bankName}
                                  </span>
                                  {method.isDefault && (
                                    <Badge variant="outline" className="text-xs">
                                      Default
                                    </Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex space-x-4">
                        <Button className="flex-1" onClick={() => handlePayNow(payment.billId, payment.amount)}>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pay Now
                        </Button>
                        <Button variant="outline" className="flex-1 bg-transparent">
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Payment
                        </Button>
                        <Button variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download Bill
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="methods" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Payment Methods</h3>
                <p className="text-sm text-gray-600">Manage your saved payment methods</p>
              </div>
              <Button onClick={() => setIsAddingPaymentMethod(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paymentMethods.map((method) => (
                <Card key={method.id} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getPaymentMethodIcon(method.type)}
                        <div>
                          <p className="font-medium">
                            {method.type === "card"
                              ? `${method.brand?.toUpperCase()} **** ${method.last4}`
                              : method.type === "upi"
                                ? method.upiId
                                : method.bankName}
                          </p>
                          {method.type === "card" && (
                            <p className="text-sm text-gray-500">
                              Expires {method.expiryMonth}/{method.expiryYear}
                            </p>
                          )}
                          {method.type === "netbanking" && (
                            <p className="text-sm text-gray-500">Account: {method.accountNumber}</p>
                          )}
                        </div>
                      </div>
                      {method.isDefault && <Badge className="bg-green-100 text-green-800">Default</Badge>}
                    </div>

                    <div className="flex space-x-2">
                      {!method.isDefault && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDefaultPaymentMethod(method.id)}
                          className="flex-1"
                        >
                          Set Default
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deletePaymentMethod(method.id)}
                        disabled={method.isDefault}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Your complete payment transaction history</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Bill ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentHistory.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.transactionId}</TableCell>
                        <TableCell>{payment.billId}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(payment.status)}
                            <Badge className={getStatusColor(payment.status)}>
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(payment.date)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              <Receipt className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3" />
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

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Total Paid</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">₹23,988</div>
                  <p className="text-xs text-gray-500 mt-1">Last 12 months</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Success Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">95.2%</div>
                  <p className="text-xs text-gray-500 mt-1">Payment success</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Avg Payment</CardTitle>
                  <Receipt className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">₹1,999</div>
                  <p className="text-xs text-gray-500 mt-1">Per transaction</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">On-Time Payments</CardTitle>
                  <Calendar className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">11/12</div>
                  <p className="text-xs text-gray-500 mt-1">This year</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method Usage</CardTitle>
                <CardDescription>Your preferred payment methods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="h-5 w-5 text-blue-600" />
                      <span>UPI</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: "60%" }}></div>
                      </div>
                      <span className="text-sm text-gray-600">60%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-5 w-5 text-green-600" />
                      <span>Credit Card</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: "30%" }}></div>
                      </div>
                      <span className="text-sm text-gray-600">30%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Building2 className="h-5 w-5 text-purple-600" />
                      <span>Net Banking</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: "10%" }}></div>
                      </div>
                      <span className="text-sm text-gray-600">10%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
