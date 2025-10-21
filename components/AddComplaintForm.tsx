"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { userApi, type User1 } from "@/lib/user-api"
import { complaintApi } from "@/lib/complaint-api"
import { Search, Loader2, User, Phone, MapPin, Mail } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"

interface AddComplaintFormProps {
  onClose: () => void
  onSuccess?: () => void
  userId?: string
}

interface CustomerInfo {
  name: string
  email: string
  phone: string
  customerId: string
  address?: string
  connectionType?: string
  planId?: string
}

export default function AddComplaintForm({ onClose, onSuccess, userId }: AddComplaintFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Internet Services",
    priority: "medium",
    customerInfo: {
      name: "",
      email: "",
      phone: "",
      customerId: "",
      address: "",
      connectionType: "",
      planId: "",
    } as CustomerInfo,
    source: "phone",
    assignedTo: "",
    expectedResolution: "",
    attachments: [] as string[],
  })

  const [technicians, setTechnicians] = useState<User1[]>([])
  const [loadingTechnicians, setLoadingTechnicians] = useState(false)
  const [searchingCustomer, setSearchingCustomer] = useState(false)
  const [technicianSearch, setTechnicianSearch] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()

  // Fetch technicians on component mount
  useEffect(() => {
    fetchTechnicians()
  }, [])

  const fetchTechnicians = async () => {
    try {
      setLoadingTechnicians(true)
      const techniciansData = await userApi.getAllTechnicians()
      setTechnicians(techniciansData)
    } catch (error) {
      console.error("[v0] Error fetching technicians:", error)
      toast.error("Failed to load technicians")
    } finally {
      setLoadingTechnicians(false)
    }
  }

  const searchCustomerByEmail = async (email: string) => {
    if (!email || !email.includes('@')) {
      return
    }

    try {
      setSearchingCustomer(true)
      const response = await fetch(`https://nsbackend-silk.vercel.app/api/admin/customer/email/${email}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const customerData = await response.json()
        
        if (customerData && customerData.profileDetail) {
          const profile = customerData.profileDetail
          setFormData(prev => ({
            ...prev,
            customerInfo: {
              name: profile.name || "",
              email: profile.email || email,
              phone: profile.phone || "",
              customerId: profile.customerId || "",
              address: profile.address || "",
              connectionType: profile.connectionType || "",
              planId: profile.planId || ""
            }
          }))
          toast.success("Customer details loaded successfully!")
        } else {
          toast.error("Customer not found")
        }
      } else {
        toast.error("Customer not found or access denied")
      }
    } catch (error) {
      console.error("[v0] Error searching customer:", error)
      toast.error("Failed to search customer")
    } finally {
      setSearchingCustomer(false)
    }
  }

  const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const email = e.target.value.trim()
    if (email && email.includes('@')) {
      searchCustomerByEmail(email)
    }
  }

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const email = formData.customerInfo.email.trim()
      if (email && email.includes('@')) {
        searchCustomerByEmail(email)
      }
    }
  }

  const filteredTechnicians = technicians.filter(tech =>
    tech.profileDetail.name.toLowerCase().includes(technicianSearch.toLowerCase()) ||
    tech.profileDetail.specialization?.toLowerCase().includes(technicianSearch.toLowerCase()) ||
    tech.profileDetail.area?.toLowerCase().includes(technicianSearch.toLowerCase())
  )

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  // Validate required fields
  if (!formData.title || !formData.description || !formData.customerInfo.name || !formData.customerInfo.phone) {
    toast.error("Please fill in all required fields")
    return
  }

  try {
    setSubmitting(true)

    // Prepare complaint data for API - EXACT FIELD NAMES AS REQUIRED
    const complaintData = {
      type: formData.title,
      priority: formData.priority === "medium" ? "Medium" : 
               formData.priority === "high" ? "High" : "Low",
      description: formData.description,
      technicianId: formData.assignedTo || "",
      Area: formData.customerInfo.address || "Not specified",
      category: formData.category,
      response: `Complaint created via ${formData.source}`,
      customerName: formData.customerInfo.name,
      customerphoneNumber: formData.customerInfo.phone,
      address: formData.customerInfo.address || "Not specified",
      customerID: formData.customerInfo.customerId || `CUST_${Date.now()}`
    }

    console.log("[v0] Creating complaint with data:", complaintData)

    // Determine the user ID to use - use the customer's user ID if available
    let targetUserId = userId || 'admin'
    
    // If we have customer info from email search, try to use their user ID
    if (formData.customerInfo.customerId) {
      // We need to get the actual user_id for this customer
      try {
        const customerResponse = await fetch(`https://nsbackend-silk.vercel.app/api/admin/customer/email/${formData.customerInfo.email}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (customerResponse.ok) {
          const customerData = await customerResponse.json()
          if (customerData.user_id) {
            targetUserId = customerData.user_id
            console.log("[v0] Using customer user_id:", targetUserId)
          }
        }
      } catch (error) {
        console.warn("[v0] Could not fetch customer user_id, using default:", error)
      }
    }

    // Call the complaint creation API
    const response = await complaintApi.createComplaint(targetUserId, complaintData)

    console.log("[v0] Complaint creation FULL response:", response)
    console.log("[v0] Complaint data in response:", response.data)

    if (response.success || response.message?.toLowerCase().includes("success") || response.data) {
      toast.success(`Complaint "${formData.title}" created successfully!`)
      
      if (onSuccess) {
        onSuccess()
      }

      onClose()
    } else {
      throw new Error(response.message || "Failed to create complaint")
    }

  } catch (error: any) {
    console.error("[v0] Error creating complaint:", error)
    
    let errorMessage = "Failed to create complaint. Please try again."
    if (error.message.includes("AUTHENTICATION_FAILED")) {
      errorMessage = "Authentication failed. Please log in again."
    } else if (error.message.includes("ACCESS_DENIED")) {
      errorMessage = "You don't have permission to create complaints."
    } else if (error.message) {
      errorMessage = error.message
    }
    
    toast.error(errorMessage)
  } finally {
    setSubmitting(false)
  }
}

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>
        
        {/* Email Search */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="customerEmail">Email Address *</Label>
            <div className="relative">
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerInfo.email}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  customerInfo: { ...formData.customerInfo, email: e.target.value }
                })}
                onBlur={handleEmailBlur}
                onKeyDown={handleEmailKeyDown}
                placeholder="Enter customer email to auto-fill details"
                required
              />
              {searchingCustomer && (
                <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-500" />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Press Enter or click away to search for customer details
            </p>
          </div>

          {/* Customer Details Card */}
          {(formData.customerInfo.name || formData.customerInfo.phone) && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 space-y-2">
                    {formData.customerInfo.name && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{formData.customerInfo.name}</span>
                        {formData.customerInfo.customerId && (
                          <Badge variant="outline" className="text-xs">
                            ID: {formData.customerInfo.customerId}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      {formData.customerInfo.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{formData.customerInfo.phone}</span>
                        </div>
                      )}
                      
                      {formData.customerInfo.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <span>{formData.customerInfo.email}</span>
                        </div>
                      )}
                      
                      {formData.customerInfo.address && (
                        <div className="flex items-center space-x-2 md:col-span-2">
                          <MapPin className="h-4 w-4" />
                          <span className="flex-1">{formData.customerInfo.address}</span>
                        </div>
                      )}
                      
                      {(formData.customerInfo.connectionType || formData.customerInfo.planId) && (
                        <div className="flex items-center space-x-4 md:col-span-2 pt-1">
                          {formData.customerInfo.connectionType && (
                            <Badge variant="secondary" className="text-xs">
                              {formData.customerInfo.connectionType}
                            </Badge>
                          )}
                          {formData.customerInfo.planId && (
                            <Badge variant="secondary" className="text-xs">
                              Plan: {formData.customerInfo.planId}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Other Customer Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customerName">Customer Name *</Label>
            <Input
              id="customerName"
              value={formData.customerInfo.name}
              onChange={(e) => setFormData({ 
                ...formData, 
                customerInfo: { ...formData.customerInfo, name: e.target.value }
              })}
              required
            />
          </div>
          <div>
            <Label htmlFor="customerId">Customer ID</Label>
            <Input
              id="customerId"
              value={formData.customerInfo.customerId}
              onChange={(e) => setFormData({ 
                ...formData, 
                customerInfo: { ...formData.customerInfo, customerId: e.target.value }
              })}
              placeholder="Auto-filled from email search"
            />
          </div>
          <div>
            <Label htmlFor="customerPhone">Phone Number *</Label>
            <Input
              id="customerPhone"
              value={formData.customerInfo.phone}
              onChange={(e) => setFormData({ 
                ...formData, 
                customerInfo: { ...formData.customerInfo, phone: e.target.value }
              })}
              required
            />
          </div>
          <div>
            <Label htmlFor="customerAddress">Address *</Label>
            <Input
              id="customerAddress"
              value={formData.customerInfo.address}
              onChange={(e) => setFormData({ 
                ...formData, 
                customerInfo: { ...formData.customerInfo, address: e.target.value }
              })}
              placeholder="Customer address"
              required
            />
          </div>
        </div>
      </div>

      {/* Complaint Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Complaint Details</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="title">Complaint Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief description of the issue"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide detailed information about the complaint..."
              rows={4}
              required
            />
          </div>
        </div>
      </div>

      {/* Classification */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Classification</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Internet Services">Internet Services</SelectItem>
                <SelectItem value="Billing">Billing</SelectItem>
                <SelectItem value="Service Quality">Service Quality</SelectItem>
                <SelectItem value="Installation">Installation</SelectItem>
                <SelectItem value="Connectivity">Connectivity</SelectItem>
                <SelectItem value="Technical Issue">Technical Issue</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="priority">Priority *</Label>
            <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="source">Source</Label>
            <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phone">Phone Call</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="social">Social Media</SelectItem>
                <SelectItem value="inperson">In Person</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Assignment */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Assignment & Resolution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="assignedTo">Assign To Technician</Label>
            <Select value={formData.assignedTo} onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select technician" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {/* Search Input inside Dropdown */}
                <div className="p-2 border-b">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search technicians..."
                      value={technicianSearch}
                      onChange={(e) => setTechnicianSearch(e.target.value)}
                      className="pl-8 h-9 text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>

                {loadingTechnicians ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm">Loading technicians...</span>
                  </div>
                ) : filteredTechnicians.length === 0 ? (
                  <div className="py-4 text-center text-sm text-gray-500">
                    No technicians found
                  </div>
                ) : (
                  filteredTechnicians.map((tech) => (
                    <SelectItem 
                      key={tech.user_id} 
                      value={tech.profileDetail.technicianId || tech.user_id}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{tech.profileDetail.name}</span>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>{tech.profileDetail.specialization}</span>
                          {tech.profileDetail.area && (
                            <>
                              <span>•</span>
                              <span>{tech.profileDetail.area}</span>
                            </>
                          )}
                          {tech.profileDetail.rating !== undefined && (
                            <>
                              <span>•</span>
                              <span>Rating: {tech.profileDetail.rating}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="expectedResolution">Expected Resolution Date</Label>
            <Input
              id="expectedResolution"
              type="date"
              value={formData.expectedResolution}
              onChange={(e) => setFormData({ ...formData, expectedResolution: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto bg-transparent" disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" className="w-full sm:w-auto" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Creating...
            </>
          ) : (
            "Create Complaint"
          )}
        </Button>
      </div>
    </form>
  )
}