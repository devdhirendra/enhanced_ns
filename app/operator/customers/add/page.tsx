"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save, UserPlus, Phone, Mail, MapPin, Wifi, CreditCard, Calendar, Settings } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function AddCustomerPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    alternateNumber: "",
    email: "",
    houseNumber: "",
    locality: "",
    landmark: "",
    pinCode: "",
    district: "",
    state: "",
    connectionType: "",
    serviceProvider: "",
    planAssigned: "",
    monthlyRate: "",
    connectionDate: "",
    status: "active",
    assignedTechnician: "",
    initialPayment: "",
    sendWelcomeSMS: true,
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Generate customer ID
    const customerId = `CUST${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`

    toast.success(`Customer ${customerId} created successfully!`)
    console.log("Customer Data:", { ...formData, customerId })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6">
      <div className="container mx-auto max-w-3xl p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/operator/customers">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Customers
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Customer</h1>
            <p className="text-gray-600 mt-1">Create a new customer account and connection</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Basic customer details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="Enter customer's full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="mobileNumber">Mobile Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                      placeholder="+91 9876543210"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="alternateNumber">Alternate Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="alternateNumber"
                      value={formData.alternateNumber}
                      onChange={(e) => handleInputChange("alternateNumber", e.target.value)}
                      placeholder="+91 9876543211"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="customer@email.com"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address Information
              </CardTitle>
              <CardDescription>Complete address details for service location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="houseNumber">House Number *</Label>
                  <Input
                    id="houseNumber"
                    value={formData.houseNumber}
                    onChange={(e) => handleInputChange("houseNumber", e.target.value)}
                    placeholder="123, Block A"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="locality">Locality/Area *</Label>
                  <Input
                    id="locality"
                    value={formData.locality}
                    onChange={(e) => handleInputChange("locality", e.target.value)}
                    placeholder="Sector 15, MG Road"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="landmark">Landmark</Label>
                  <Input
                    id="landmark"
                    value={formData.landmark}
                    onChange={(e) => handleInputChange("landmark", e.target.value)}
                    placeholder="Near Metro Station"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="pinCode">Pin Code *</Label>
                  <Input
                    id="pinCode"
                    value={formData.pinCode}
                    onChange={(e) => handleInputChange("pinCode", e.target.value)}
                    placeholder="110001"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="district">District *</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => handleInputChange("district", e.target.value)}
                    placeholder="New Delhi"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    placeholder="Delhi"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Connection Details */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                Connection Details
              </CardTitle>
              <CardDescription>Internet plan and service configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="connectionType">Connection Type *</Label>
                  <Select
                    value={formData.connectionType}
                    onValueChange={(value) => handleInputChange("connectionType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select connection type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fiber">Fiber</SelectItem>
                      <SelectItem value="wireless">Wireless</SelectItem>
                      <SelectItem value="onu">ONU</SelectItem>
                      <SelectItem value="router">Router</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="serviceProvider">Service Provider *</Label>
                  <Select
                    value={formData.serviceProvider}
                    onValueChange={(value) => handleInputChange("serviceProvider", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select ISP" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bsnl">BSNL</SelectItem>
                      <SelectItem value="railtel">RailTel</SelectItem>
                      <SelectItem value="excitel">Excitel</SelectItem>
                      <SelectItem value="pioneer">Pioneer</SelectItem>
                      <SelectItem value="alliance">Alliance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="planAssigned">Plan Assigned *</Label>
                  <Select
                    value={formData.planAssigned}
                    onValueChange={(value) => handleInputChange("planAssigned", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic25">Basic 25 Mbps - ₹299</SelectItem>
                      <SelectItem value="standard50">Standard 50 Mbps - ₹499</SelectItem>
                      <SelectItem value="premium100">Premium 100 Mbps - ₹699</SelectItem>
                      <SelectItem value="unlimited75">Unlimited 75 Mbps - ₹599</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="monthlyRate">Monthly Rate (₹) *</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="monthlyRate"
                      type="number"
                      value={formData.monthlyRate}
                      onChange={(e) => handleInputChange("monthlyRate", e.target.value)}
                      placeholder="499"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="connectionDate">Connection Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="connectionDate"
                      type="date"
                      value={formData.connectionDate}
                      onChange={(e) => handleInputChange("connectionDate", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignment & Payment */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Assignment & Payment
              </CardTitle>
              <CardDescription>Technician assignment and initial payment details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assignedTechnician">Assign Technician</Label>
                  <Select
                    value={formData.assignedTechnician}
                    onValueChange={(value) => handleInputChange("assignedTechnician", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select technician" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tech001">Ramesh Kumar (Tech001)</SelectItem>
                      <SelectItem value="tech002">Suresh Singh (Tech002)</SelectItem>
                      <SelectItem value="tech003">Amit Sharma (Tech003)</SelectItem>
                      <SelectItem value="tech004">Vijay Gupta (Tech004)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="initialPayment">Initial Payment (₹)</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="initialPayment"
                      type="number"
                      value={formData.initialPayment}
                      onChange={(e) => handleInputChange("initialPayment", e.target.value)}
                      placeholder="499"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Send Welcome SMS</Label>
                  <p className="text-sm text-muted-foreground">Send welcome message with login info to customer</p>
                </div>
                <Switch
                  checked={formData.sendWelcomeSMS}
                  onCheckedChange={(checked) => handleInputChange("sendWelcomeSMS", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Link href="/operator/customers">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              Create Customer
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
