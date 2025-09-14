"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, Code, Database, Shield, FileText } from "lucide-react"

interface APIEndpoint {
  id: string
  name: string
  method: string
  endpoint: string
  implemented: boolean
  category: string
  auth: boolean
  description: string
  issues?: string[]
}

export default function APIAuditPage() {
  const [auditResults, setAuditResults] = useState<APIEndpoint[]>([])
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState({
    total: 0,
    implemented: 0,
    missing: 0,
    issues: 0,
  })

  const documentedAPIs: APIEndpoint[] = [
    // Authentication Routes
    {
      id: "auth-1",
      name: "Register User",
      method: "POST",
      endpoint: "/auth/register",
      implemented: true,
      category: "Authentication",
      auth: false,
      description: "User registration",
    },
    {
      id: "auth-2",
      name: "User Login",
      method: "POST",
      endpoint: "/auth/login",
      implemented: true,
      category: "Authentication",
      auth: false,
      description: "User authentication",
    },

    // Admin Management Routes
    {
      id: "admin-1",
      name: "Get All Admins",
      method: "GET",
      endpoint: "/admin/all",
      implemented: true,
      category: "Admin Management",
      auth: true,
      description: "Retrieve all admin users",
    },
    {
      id: "admin-2",
      name: "Add Admin",
      method: "POST",
      endpoint: "/admin/register",
      implemented: true,
      category: "Admin Management",
      auth: true,
      description: "Create new admin user",
    },
    {
      id: "admin-3",
      name: "Get Admin",
      method: "GET",
      endpoint: "/admin/:userId",
      implemented: true,
      category: "Admin Management",
      auth: true,
      description: "Get specific admin",
    },
    {
      id: "admin-4",
      name: "Update Admin",
      method: "PUT",
      endpoint: "/admin/:userId",
      implemented: true,
      category: "Admin Management",
      auth: true,
      description: "Update admin details",
    },
    {
      id: "admin-5",
      name: "Delete Admin",
      method: "DELETE",
      endpoint: "/admin/:userId",
      implemented: true,
      category: "Admin Management",
      auth: true,
      description: "Delete admin user",
    },

    // Operator Management Routes
    {
      id: "op-1",
      name: "Get All Operators",
      method: "GET",
      endpoint: "/admin/operator/all",
      implemented: true,
      category: "Operator Management",
      auth: true,
      description: "Retrieve all operators",
    },
    {
      id: "op-2",
      name: "Add Operator",
      method: "POST",
      endpoint: "/admin/operator/register",
      implemented: true,
      category: "Operator Management",
      auth: true,
      description: "Create new operator",
    },
    {
      id: "op-3",
      name: "Get Operator",
      method: "GET",
      endpoint: "/admin/operator/:userId",
      implemented: true,
      category: "Operator Management",
      auth: true,
      description: "Get specific operator",
    },
    {
      id: "op-4",
      name: "Get Operator Profile",
      method: "GET",
      endpoint: "/admin/operator/profile/:userId",
      implemented: true,
      category: "Operator Management",
      auth: true,
      description: "Get operator profile",
    },
    {
      id: "op-5",
      name: "Update Operator",
      method: "PUT",
      endpoint: "/admin/operator/:userId",
      implemented: true,
      category: "Operator Management",
      auth: true,
      description: "Update operator details",
    },
    {
      id: "op-6",
      name: "Delete Operator",
      method: "DELETE",
      endpoint: "/admin/operator/:userId",
      implemented: true,
      category: "Operator Management",
      auth: true,
      description: "Delete operator",
    },

    // Technician Management Routes
    {
      id: "tech-1",
      name: "Get All Technicians",
      method: "GET",
      endpoint: "/admin/technician/all",
      implemented: true,
      category: "Technician Management",
      auth: true,
      description: "Retrieve all technicians",
    },
    {
      id: "tech-2",
      name: "Add Technician",
      method: "POST",
      endpoint: "/admin/technician/register",
      implemented: true,
      category: "Technician Management",
      auth: true,
      description: "Create new technician",
    },
    {
      id: "tech-3",
      name: "Get Technician",
      method: "GET",
      endpoint: "/admin/technician/:userId",
      implemented: true,
      category: "Technician Management",
      auth: true,
      description: "Get specific technician",
    },
    {
      id: "tech-4",
      name: "Get Technician Profile",
      method: "GET",
      endpoint: "/admin/technician/profile/:userId",
      implemented: true,
      category: "Technician Management",
      auth: true,
      description: "Get technician profile",
    },
    {
      id: "tech-5",
      name: "Update Technician",
      method: "PUT",
      endpoint: "/admin/technician/:userId",
      implemented: true,
      category: "Technician Management",
      auth: true,
      description: "Update technician details",
    },
    {
      id: "tech-6",
      name: "Delete Technician",
      method: "DELETE",
      endpoint: "/admin/technician/:userId",
      implemented: true,
      category: "Technician Management",
      auth: true,
      description: "Delete technician",
    },

    // Staff Management Routes
    {
      id: "staff-1",
      name: "Get All Staff",
      method: "GET",
      endpoint: "/admin/staff/all",
      implemented: true,
      category: "Staff Management",
      auth: true,
      description: "Retrieve all staff members",
    },
    {
      id: "staff-2",
      name: "Add Staff",
      method: "POST",
      endpoint: "/admin/staff/register",
      implemented: true,
      category: "Staff Management",
      auth: true,
      description: "Create new staff member",
    },
    {
      id: "staff-3",
      name: "Get Staff",
      method: "GET",
      endpoint: "/admin/staff/:userId",
      implemented: true,
      category: "Staff Management",
      auth: true,
      description: "Get specific staff member",
    },
    {
      id: "staff-4",
      name: "Get Staff Profile",
      method: "GET",
      endpoint: "/admin/staff/profile/:userId",
      implemented: true,
      category: "Staff Management",
      auth: true,
      description: "Get staff profile",
    },
    {
      id: "staff-5",
      name: "Update Staff",
      method: "PUT",
      endpoint: "/admin/staff/:userId",
      implemented: true,
      category: "Staff Management",
      auth: true,
      description: "Update staff details",
    },
    {
      id: "staff-6",
      name: "Delete Staff",
      method: "DELETE",
      endpoint: "/admin/staff/:userId",
      implemented: true,
      category: "Staff Management",
      auth: true,
      description: "Delete staff member",
    },

    // Vendor Management Routes
    {
      id: "vendor-1",
      name: "Get All Vendors",
      method: "GET",
      endpoint: "/admin/vendor/all",
      implemented: true,
      category: "Vendor Management",
      auth: true,
      description: "Retrieve all vendors",
    },
    {
      id: "vendor-2",
      name: "Add Vendor",
      method: "POST",
      endpoint: "/admin/vendor/register",
      implemented: true,
      category: "Vendor Management",
      auth: true,
      description: "Create new vendor",
    },
    {
      id: "vendor-3",
      name: "Get Vendor",
      method: "GET",
      endpoint: "/admin/vendor/:userId",
      implemented: true,
      category: "Vendor Management",
      auth: true,
      description: "Get specific vendor",
    },
    {
      id: "vendor-4",
      name: "Get Vendor Profile",
      method: "GET",
      endpoint: "/admin/vendor/profile/:userId",
      implemented: true,
      category: "Vendor Management",
      auth: true,
      description: "Get vendor profile",
    },
    {
      id: "vendor-5",
      name: "Update Vendor",
      method: "PUT",
      endpoint: "/admin/vendor/:userId",
      implemented: true,
      category: "Vendor Management",
      auth: true,
      description: "Update vendor details",
    },
    {
      id: "vendor-6",
      name: "Delete Vendor",
      method: "DELETE",
      endpoint: "/admin/vendor/:userId",
      implemented: true,
      category: "Vendor Management",
      auth: true,
      description: "Delete vendor",
    },

    // Customer Management Routes
    {
      id: "cust-1",
      name: "Get All Customers",
      method: "GET",
      endpoint: "/admin/customer/all",
      implemented: true,
      category: "Customer Management",
      auth: true,
      description: "Retrieve all customers",
    },
    {
      id: "cust-2",
      name: "Add Customer",
      method: "POST",
      endpoint: "/admin/customer/register",
      implemented: true,
      category: "Customer Management",
      auth: true,
      description: "Create new customer",
    },
    {
      id: "cust-3",
      name: "Get Customer",
      method: "GET",
      endpoint: "/admin/customer/:userId",
      implemented: false,
      category: "Customer Management",
      auth: true,
      description: "Get specific customer",
      issues: ["Uses profile endpoint instead"],
    },
    {
      id: "cust-4",
      name: "Get Customer Profile",
      method: "GET",
      endpoint: "/admin/customer/profile/:userId",
      implemented: true,
      category: "Customer Management",
      auth: true,
      description: "Get customer profile",
    },
    {
      id: "cust-5",
      name: "Update Customer",
      method: "PUT",
      endpoint: "/admin/customer/:userId",
      implemented: true,
      category: "Customer Management",
      auth: true,
      description: "Update customer details",
    },
    {
      id: "cust-6",
      name: "Delete Customer",
      method: "DELETE",
      endpoint: "/admin/customer/:userId",
      implemented: true,
      category: "Customer Management",
      auth: true,
      description: "Delete customer",
    },

    // Complaint Management Routes
    {
      id: "comp-1",
      name: "Get All Complaints",
      method: "GET",
      endpoint: "/admin/complain/all",
      implemented: true,
      category: "Complaint Management",
      auth: true,
      description: "Retrieve all complaints",
    },
    {
      id: "comp-2",
      name: "Add Complaint",
      method: "POST",
      endpoint: "/admin/complain/register",
      implemented: true,
      category: "Complaint Management",
      auth: true,
      description: "Create new complaint",
    },
    {
      id: "comp-3",
      name: "Update Complaint",
      method: "PUT",
      endpoint: "/admin/complain/:complaintId",
      implemented: true,
      category: "Complaint Management",
      auth: true,
      description: "Update complaint status",
    },
    {
      id: "comp-4",
      name: "Delete Complaint",
      method: "DELETE",
      endpoint: "/admin/complain/:complaintId",
      implemented: true,
      category: "Complaint Management",
      auth: true,
      description: "Delete complaint",
    },

    // Inventory Management Routes
    {
      id: "inv-1",
      name: "Add Stock (Operator)",
      method: "POST",
      endpoint: "/inventory/operator/add",
      implemented: true,
      category: "Inventory Management",
      auth: true,
      description: "Add inventory stock",
    },
    {
      id: "inv-2",
      name: "Assign Stock to Technician",
      method: "PUT",
      endpoint: "/inventory/operator/assign/:itemId",
      implemented: true,
      category: "Inventory Management",
      auth: true,
      description: "Assign stock to technician",
    },
    {
      id: "inv-3",
      name: "Return Items (Technician)",
      method: "PUT",
      endpoint: "/inventory/technician/return/:itemId",
      implemented: true,
      category: "Inventory Management",
      auth: true,
      description: "Return inventory items",
    },
    {
      id: "inv-4",
      name: "Confirm Installation (Customer)",
      method: "PUT",
      endpoint: "/inventory/customer/confirm/:itemId",
      implemented: true,
      category: "Inventory Management",
      auth: true,
      description: "Confirm installation",
    },

    // Leave Management Routes
    {
      id: "leave-1",
      name: "Create Leave Request",
      method: "POST",
      endpoint: "/leave/requests/:technicianId",
      implemented: true,
      category: "Leave Management",
      auth: true,
      description: "Create leave request",
    },
    {
      id: "leave-2",
      name: "Get All Leave Requests",
      method: "GET",
      endpoint: "/leave/requests",
      implemented: true,
      category: "Leave Management",
      auth: true,
      description: "Get all leave requests",
    },
    {
      id: "leave-3",
      name: "Get Technician's Leave Requests",
      method: "GET",
      endpoint: "/leave/requests/my/:technicianId",
      implemented: true,
      category: "Leave Management",
      auth: true,
      description: "Get technician's leave requests",
    },
    {
      id: "leave-4",
      name: "Update Leave Request",
      method: "PUT",
      endpoint: "/leave/requests/:leaveId",
      implemented: true,
      category: "Leave Management",
      auth: true,
      description: "Update leave request",
    },
    {
      id: "leave-5",
      name: "Approve Leave Request",
      method: "PUT",
      endpoint: "/leave/requests/:leaveId/approve",
      implemented: true,
      category: "Leave Management",
      auth: true,
      description: "Approve leave request",
    },
    {
      id: "leave-6",
      name: "Reject Leave Request",
      method: "PUT",
      endpoint: "/leave/requests/:leaveId/reject",
      implemented: true,
      category: "Leave Management",
      auth: true,
      description: "Reject leave request",
    },
    {
      id: "leave-7",
      name: "Delete Leave Request",
      method: "DELETE",
      endpoint: "/leave/requests/:leaveId",
      implemented: true,
      category: "Leave Management",
      auth: true,
      description: "Delete leave request",
    },

    // Product Management Routes
    {
      id: "prod-1",
      name: "Add Product (Vendor)",
      method: "POST",
      endpoint: "/products/add",
      implemented: true,
      category: "Product Management",
      auth: true,
      description: "Add vendor product",
    },
    {
      id: "prod-2",
      name: "Get Vendor Products",
      method: "GET",
      endpoint: "/products",
      implemented: true,
      category: "Product Management",
      auth: true,
      description: "Get vendor products",
    },
    {
      id: "prod-3",
      name: "Browse Product Catalog (Operator)",
      method: "GET",
      endpoint: "/products/catalog",
      implemented: true,
      category: "Product Management",
      auth: true,
      description: "Browse product catalog",
    },
    {
      id: "prod-4",
      name: "Get Vendor Products by ID",
      method: "GET",
      endpoint: "/vendor/products/:vendorId",
      implemented: true,
      category: "Product Management",
      auth: true,
      description: "Get products by vendor ID",
    },
    {
      id: "prod-5",
      name: "Add Vendor Product",
      method: "POST",
      endpoint: "/vendor/products",
      implemented: true,
      category: "Product Management",
      auth: true,
      description: "Add vendor product",
    },
    {
      id: "prod-6",
      name: "Update Vendor Product",
      method: "PUT",
      endpoint: "/vendor/products/:productId",
      implemented: true,
      category: "Product Management",
      auth: true,
      description: "Update vendor product",
    },
    {
      id: "prod-7",
      name: "Delete Vendor Product",
      method: "DELETE",
      endpoint: "/vendor/products/:productId",
      implemented: true,
      category: "Product Management",
      auth: true,
      description: "Delete vendor product",
    },

    // Order Management Routes
    {
      id: "order-1",
      name: "Place Order (Operator)",
      method: "POST",
      endpoint: "/order/Places",
      implemented: true,
      category: "Order Management",
      auth: true,
      description: "Place order",
      issues: ["Typo in endpoint name"],
    },
    {
      id: "order-2",
      name: "View Orders (Vendor)",
      method: "GET",
      endpoint: "/orders",
      implemented: true,
      category: "Order Management",
      auth: true,
      description: "View orders",
    },
    {
      id: "order-3",
      name: "Update Order Status (Vendor)",
      method: "PUT",
      endpoint: "/orders/:orderId",
      implemented: true,
      category: "Order Management",
      auth: true,
      description: "Update order status",
    },
    {
      id: "order-4",
      name: "Get Vendor Orders",
      method: "GET",
      endpoint: "/vendor/orders/:vendorId",
      implemented: true,
      category: "Order Management",
      auth: true,
      description: "Get vendor orders",
    },

    // Stock Management Routes
    {
      id: "stock-1",
      name: "Get Stock Alerts",
      method: "GET",
      endpoint: "/stock/alerts",
      implemented: true,
      category: "Stock Management",
      auth: true,
      description: "Get stock alerts",
    },
    {
      id: "stock-2",
      name: "Get Stock Movements",
      method: "GET",
      endpoint: "/stock/movements",
      implemented: true,
      category: "Stock Management",
      auth: true,
      description: "Get stock movements",
    },
    {
      id: "stock-3",
      name: "Stock Adjustment",
      method: "POST",
      endpoint: "/stock/adjustment",
      implemented: true,
      category: "Stock Management",
      auth: true,
      description: "Adjust stock levels",
    },
    {
      id: "stock-4",
      name: "Get Categories",
      method: "GET",
      endpoint: "/stock/categories",
      implemented: true,
      category: "Stock Management",
      auth: false,
      description: "Get stock categories",
    },
    {
      id: "stock-5",
      name: "Add Category",
      method: "POST",
      endpoint: "/stock/categories",
      implemented: true,
      category: "Stock Management",
      auth: true,
      description: "Add stock category",
    },
    {
      id: "stock-6",
      name: "Get Suppliers",
      method: "GET",
      endpoint: "/stock/suppliers",
      implemented: false,
      category: "Stock Management",
      auth: false,
      description: "Get suppliers",
      issues: ["Not implemented in API client"],
    },

    // Marketplace Routes
    {
      id: "market-1",
      name: "Get Marketplace Products",
      method: "GET",
      endpoint: "/marketplace/products",
      implemented: true,
      category: "Marketplace",
      auth: true,
      description: "Get marketplace products",
    },
    {
      id: "market-2",
      name: "Create Marketplace Order",
      method: "POST",
      endpoint: "/marketplace/orders",
      implemented: true,
      category: "Marketplace",
      auth: true,
      description: "Create marketplace order",
    },

    // Notification Routes
    {
      id: "notif-1",
      name: "Get Notifications",
      method: "GET",
      endpoint: "/notifications/:userId",
      implemented: true,
      category: "Notifications",
      auth: true,
      description: "Get user notifications",
    },
    {
      id: "notif-2",
      name: "Mark Notification Read",
      method: "PUT",
      endpoint: "/notifications/:notificationId/read",
      implemented: true,
      category: "Notifications",
      auth: true,
      description: "Mark notification as read",
    },
    {
      id: "notif-3",
      name: "Send Notification",
      method: "POST",
      endpoint: "/notifications",
      implemented: true,
      category: "Notifications",
      auth: true,
      description: "Send notification",
    },

    // Billing Routes
    {
      id: "bill-1",
      name: "Get Billing History",
      method: "GET",
      endpoint: "/billing/history/:customerId",
      implemented: true,
      category: "Billing",
      auth: true,
      description: "Get billing history",
    },
    {
      id: "bill-2",
      name: "Generate Invoice",
      method: "POST",
      endpoint: "/billing/invoice/:customerId",
      implemented: true,
      category: "Billing",
      auth: true,
      description: "Generate invoice",
    },
    {
      id: "bill-3",
      name: "Process Payment",
      method: "POST",
      endpoint: "/billing/payment",
      implemented: true,
      category: "Billing",
      auth: true,
      description: "Process payment",
    },

    // Missing APIs (from documentation but not implemented)
    {
      id: "missing-1",
      name: "Get Suppliers",
      method: "GET",
      endpoint: "/stock/suppliers",
      implemented: false,
      category: "Stock Management",
      auth: false,
      description: "Get suppliers list",
      issues: ["Missing from API client"],
    },
    {
      id: "missing-2",
      name: "Add Supplier",
      method: "POST",
      endpoint: "/stock/suppliers",
      implemented: false,
      category: "Stock Management",
      auth: true,
      description: "Add new supplier",
      issues: ["Missing from API client"],
    },
    {
      id: "missing-3",
      name: "Network Monitoring",
      method: "GET",
      endpoint: "/network/status",
      implemented: false,
      category: "Network Management",
      auth: true,
      description: "Get network status",
      issues: ["Not implemented"],
    },
    {
      id: "missing-4",
      name: "Device Management",
      method: "GET",
      endpoint: "/devices/all",
      implemented: false,
      category: "Device Management",
      auth: true,
      description: "Get all devices",
      issues: ["Not implemented"],
    },
    {
      id: "missing-5",
      name: "Analytics Data",
      method: "GET",
      endpoint: "/analytics/dashboard",
      implemented: false,
      category: "Analytics",
      auth: true,
      description: "Get analytics data",
      issues: ["Not implemented"],
    },
  ]

  useEffect(() => {
    runAudit()
  }, [])

  const runAudit = () => {
    setLoading(true)

    // Simulate audit process
    setTimeout(() => {
      setAuditResults(documentedAPIs)

      const implemented = documentedAPIs.filter((api) => api.implemented).length
      const missing = documentedAPIs.filter((api) => !api.implemented).length
      const issues = documentedAPIs.filter((api) => api.issues && api.issues.length > 0).length

      setSummary({
        total: documentedAPIs.length,
        implemented,
        missing,
        issues,
      })

      setLoading(false)
    }, 1000)
  }

  const getStatusBadge = (api: APIEndpoint) => {
    if (!api.implemented) {
      return <Badge variant="destructive">Missing</Badge>
    }
    if (api.issues && api.issues.length > 0) {
      return <Badge variant="secondary">Issues</Badge>
    }
    return <Badge variant="default">Implemented</Badge>
  }

  const getMethodBadge = (method: string) => {
    const colors = {
      GET: "bg-green-100 text-green-800",
      POST: "bg-blue-100 text-blue-800",
      PUT: "bg-yellow-100 text-yellow-800",
      DELETE: "bg-red-100 text-red-800",
    }
    return <Badge className={colors[method as keyof typeof colors] || "bg-gray-100 text-gray-800"}>{method}</Badge>
  }

  const categories = [...new Set(documentedAPIs.map((api) => api.category))]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Code className="w-8 h-8" />
            API Implementation Audit
          </h1>
          <p className="text-gray-600 mt-1">Comprehensive audit of API implementation vs documentation</p>
        </div>
        <Button onClick={runAudit} disabled={loading}>
          <Database className="w-4 h-4 mr-2" />
          Re-run Audit
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total APIs</p>
                <p className="text-2xl font-bold text-blue-600">{summary.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Implemented</p>
                <p className="text-2xl font-bold text-green-600">{summary.implemented}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Missing</p>
                <p className="text-2xl font-bold text-red-600">{summary.missing}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">With Issues</p>
                <p className="text-2xl font-bold text-yellow-600">{summary.issues}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Implementation Status */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Status</CardTitle>
          <CardDescription>
            Coverage: {Math.round((summary.implemented / summary.total) * 100)}% implemented
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(summary.implemented / summary.total) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>{summary.implemented} implemented</span>
            <span>{summary.missing} missing</span>
          </div>
        </CardContent>
      </Card>

      {/* Issues Alert */}
      {summary.issues > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Found {summary.issues} APIs with implementation issues that need attention.
          </AlertDescription>
        </Alert>
      )}

      {/* API Details by Category */}
      {categories.map((category) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {category}
            </CardTitle>
            <CardDescription>
              {auditResults.filter((api) => api.category === category && api.implemented).length} of{" "}
              {auditResults.filter((api) => api.category === category).length} APIs implemented
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {auditResults
                .filter((api) => api.category === category)
                .map((api) => (
                  <div key={api.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{api.name}</span>
                        {getMethodBadge(api.method)}
                        {api.auth && (
                          <Badge variant="outline" className="text-xs">
                            Auth Required
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">{api.description}</div>
                      <div className="text-xs font-mono text-gray-500">{api.endpoint}</div>
                      {api.issues && api.issues.length > 0 && (
                        <div className="mt-2">
                          {api.issues.map((issue, index) => (
                            <div key={index} className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                              {issue}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">{getStatusBadge(api)}</div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Missing APIs Summary */}
      {summary.missing > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              Missing APIs ({summary.missing})
            </CardTitle>
            <CardDescription>These APIs are documented but not implemented in the client</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {auditResults
                .filter((api) => !api.implemented)
                .map((api) => (
                  <div
                    key={api.id}
                    className="flex items-center justify-between p-2 border border-red-200 rounded bg-red-50"
                  >
                    <div>
                      <span className="font-medium text-red-800">{api.name}</span>
                      <div className="text-sm text-red-600">{api.endpoint}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getMethodBadge(api.method)}
                      <Badge variant="destructive">Missing</Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
