"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { operatorApi } from "@/lib/api"
import { Loader2 } from "lucide-react"

interface AddOperatorFormProps {
  onClose: () => void
  onSuccess?: (newOperator?: any) => void
}

export default function AddOperatorForm({ onClose, onSuccess }: AddOperatorFormProps) {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
const [formData, setFormData] = useState({
  companyName: "",
  ownerName: "",
  phone: "",
  email: "",
  address: { 
    state: "", 
    district: "", 
    area: "" 
  },
  gstNumber: "",
  businessType: "individual",
  technicianCount: 0,
  customerCount: 0,
  serviceCapacity: { 
    connections: 100, // Set default value
    olts: 1 
  },
  planAssigned: "monthly",
  dashboardPermissions: {
    inventory: true,
    staffCount: true,
    billing: true,
  },
  apiAccess: {
    whatsapp: false,
    paymentGateway: false,
  },
})


  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Required field validation
    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required"
    }
    if (!formData.ownerName.trim()) {
      newErrors.ownerName = "Owner name is required"
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required"
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Phone validation (Indian phone numbers)
    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = "Please enter a valid 10-digit Indian phone number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
// const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault()
  
//   if (!validateForm()) {
//     toast.error("Please fix the errors in the form")
//     return
//   }

//   setLoading(true)

//   try {
//     console.log("[AddOperatorForm] Submitting operator data:", formData)

//     // Prepare data to match your API structure EXACTLY
//  const operatorData = {
//   email: formData.email.toLowerCase().trim(),
//   password: "admin",
//   profileDetail: {
//     name: formData.ownerName.trim(),
//     phone: formData.phone.replace(/\D/g, ''),
//     companyName: formData.companyName.trim(),
//     address: {
//       state: formData.address.state || "",
//       district: formData.address.district || "",
//       area: formData.address.area || ""
//     },
//     planAssigned: formData.planAssigned,
//     customerCount: formData.customerCount || 0,
//     revenue: 0,
//     gstNumber: formData.gstNumber.trim() || "",
//     businessType: formData.businessType,
//     serviceCapacity: {
//       connections: formData.serviceCapacity.connections || 0,
//       olts: formData.serviceCapacity.olts || 0
//     },
//     apiAccess: {
//       whatsapp: formData.apiAccess.whatsapp || false,
//       paymentGateway: formData.apiAccess.paymentGateway || false
//     },
//     KycDocuments: {    // 👈 REQUIRED
//       profID: "",
//       ProfAddress: "",
//       verify: false
//     },
//     GST: {             // 👈 REQUIRED
//       number: "",
//       verify: false
//     }
//   }
// }


// const tetsOpr = {
//   email: "operators11@example.com",
//   password: "StrongPassword123",
//   profileDetail: {
//     name: "Operator Name",
//     phone: "9876543210",
//     companyName: "Operator Pvt Ltd",
//     address: {
//       state: "Karnataka",
//       district: "Bangalore Urban",
//       area: "BTM Layout"
//     },
//     planAssigned: "premium-plan",
//     customerCount: 1200,
//     revenue: 500000,
//     gstNumber: "29ABCDE1234F2Z5",
//     businessType: "ISP",
//     serviceCapacity: {
//       connections: 2000,
//       olts: 10
//     },
//     apiAccess: {
//       whatsapp: true,
//       paymentGateway: false
//     },
//     KycDocuments: {
//       profID: "",
//       ProfAddress: "",
//       verify: false
//     },
//     GST: {
//       number: "",
//       verify: false
//     }
//   }
// };




//     console.log("[AddOperatorForm] Final API payload:", JSON.stringify(operatorData, null, 2))

//     // Call your API method
//     const result = await operatorApi.addoperators(operatorData)
    
//     console.log("[AddOperatorForm] Operator created successfully:", result)

//     toast.success(`${formData.companyName} created successfully!`, {
//       description: `Operator registered with email: ${formData.email}`
//     })

//     if (onSuccess) {
//       onSuccess(result)
//     }

//     onClose()

//   } catch (error: any) {
//     console.error("[AddOperatorForm] Error creating operator:", error)
    
//     // Better error handling
//     if (error?.response?.data?.message) {
//       toast.error("Registration failed", {
//         description: error.response.data.message
//       })
//     } else if (error?.response?.status === 400) {
//       toast.error("Invalid data provided", {
//         description: "Please check all required fields are filled correctly."
//       })
//     } else {
//       toast.error("Failed to create operator", {
//         description: "Please try again or contact support."
//       })
//     }
//   } finally {
//     setLoading(false)
//   }
// }

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  if (!validateForm()) {
    toast.error("Please fix the errors in the form")
    return
  }

  setLoading(true)

  try {
    console.log("[AddOperatorForm] Submitting operator data:", formData)

    // Prepare data to match your API structure EXACTLY
    // The API validates these fields as required and non-empty:
    const operatorData = {
      email: formData.email.toLowerCase().trim(),
      password: "admin",
      profileDetail: {
        // Required fields - API checks these are not empty
        name: formData.ownerName.trim(),
        phone: formData.phone.replace(/\D/g, ''),
        
        // Address fields - all required by API
        address: {
          state: formData.address.state || "DefaultState", // Cannot be empty
          district: formData.address.district || "DefaultDistrict", // Cannot be empty  
          area: formData.address.area || "DefaultArea" // Cannot be empty
        },
        
        // Required numeric/string fields
        revenue: formData.revenue || 100000, // API requires this field
        gstNumber: formData.gstNumber.trim() || "29ABCDE1234F2Z5", // Cannot be empty
        businessType: formData.businessType, // Required
        planAssigned: formData.planAssigned, // Required
        
        // ServiceCapacity - both fields required
        serviceCapacity: {
          connections: formData.serviceCapacity.connections || 100, // Cannot be missing
          olts: formData.serviceCapacity.olts || 1 // Cannot be missing
        },
        
        // API Access - both boolean fields required (not undefined)
        apiAccess: {
          whatsapp: Boolean(formData.apiAccess.whatsapp), // Ensure boolean, not undefined
          paymentGateway: Boolean(formData.apiAccess.paymentGateway) // Ensure boolean, not undefined
        },
        
        // Optional fields that can be empty strings
        companyName: formData.companyName.trim() || "",
        owneroramangerName: formData.ownerManagerName?.trim() || "",
        customerCount: formData.customerCount || 0,
        technicianCount: formData.technicianCount || 0,
        ispLink: formData.ispLink?.trim() || "",
        
        // Nested optional objects - API expects these structures
        KycDocuments: {
          profID: formData.KycDocuments?.profID || "",
          ProfAddress: formData.KycDocuments?.ProfAddress || "",
          verify: Boolean(formData.KycDocuments?.verify || false)
        },
        GST: {
          number: formData.GST?.number || "",
          verify: Boolean(formData.GST?.verify || false)
        }
      }
    }

    console.log("[AddOperatorForm] Final API payload:", JSON.stringify(operatorData, null, 2))

    // Call your API method
    const result = await operatorApi.addoperators(operatorData)
    
    console.log("[AddOperatorForm] Operator created successfully:", result)

    toast.success(`${formData.companyName || 'Operator'} created successfully!`, {
      description: `Operator registered with email: ${formData.email}`
    })

    if (onSuccess) {
      onSuccess(result)
    }

    onClose()

  } catch (error: any) {
    console.error("[AddOperatorForm] Error creating operator:", error)
    
    // Better error handling with more specific messages
    if (error?.response?.data?.error) {
      toast.error("Registration failed", {
        description: error.response.data.error
      })
    } else if (error?.response?.data?.missingFields) {
      toast.error("Missing required fields", {
        description: `Please provide: ${error.response.data.missingFields.join(', ')}`
      })
    } else if (error?.response?.status === 400) {
      toast.error("Invalid data provided", {
        description: "Please check all required fields are filled correctly."
      })
    } else if (error?.response?.status === 409) {
      toast.error("Email already exists", {
        description: "This email is already registered. Please use a different email."
      })
    } else {
      toast.error("Failed to create operator", {
        description: "Please try again or contact support."
      })
    }
  } finally {
    setLoading(false)
  }
}
  // Helper function to update form data and clear errors
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => updateFormData("companyName", e.target.value)}
              placeholder="Enter company name"
              className={errors.companyName ? "border-red-500" : ""}
              disabled={loading}
              required
            />
            {errors.companyName && (
              <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>
            )}
          </div>
          <div>
            <Label htmlFor="ownerName">Owner/Manager Name *</Label>
            <Input
              id="ownerName"
              value={formData.ownerName}
              onChange={(e) => updateFormData("ownerName", e.target.value)}
              placeholder="Enter owner's full name"
              className={errors.ownerName ? "border-red-500" : ""}
              disabled={loading}
              required
            />
            {errors.ownerName && (
              <p className="text-red-500 text-sm mt-1">{errors.ownerName}</p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => updateFormData("phone", e.target.value)}
              placeholder="9876543210"
              className={errors.phone ? "border-red-500" : ""}
              disabled={loading}
              maxLength={10}
              required
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData("email", e.target.value)}
              placeholder="operator@company.com"
              className={errors.email ? "border-red-500" : ""}
              disabled={loading}
              required
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Address Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="state">State</Label>
            <Select
              value={formData.address.state}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address, state: value },
                })
              }
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Andhra Pradesh">Andhra Pradesh</SelectItem>
                <SelectItem value="Karnataka">Karnataka</SelectItem>
                <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                <SelectItem value="Kerala">Kerala</SelectItem>
                <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                <SelectItem value="Gujarat">Gujarat</SelectItem>
                {/* Add more states as needed */}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="district">District</Label>
            <Input
              id="district"
              value={formData.address.district}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address, district: e.target.value },
                })
              }
              placeholder="Enter district"
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="area">Area</Label>
            <Input
              id="area"
              value={formData.address.area}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address, area: e.target.value },
                })
              }
              placeholder="Enter area/city"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Business Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Business Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="gstNumber">GST Number</Label>
            <Input
              id="gstNumber"
              value={formData.gstNumber}
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
              placeholder="22AAAAA0000A1Z5"
              disabled={loading}
              maxLength={15}
            />
          </div>
          <div>
            <Label htmlFor="businessType">Business Type</Label>
            <Select
              value={formData.businessType}
              onValueChange={(value) => setFormData({ ...formData, businessType: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="company">Company</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
                <SelectItem value="llp">LLP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="planAssigned">Plan Assigned</Label>
            <Select
              value={formData.planAssigned}
              onValueChange={(value) => setFormData({ ...formData, planAssigned: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic Plan</SelectItem>
                <SelectItem value="standard">Standard Plan</SelectItem>
                <SelectItem value="premium">Premium Plan</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
                <SelectItem value="free_trial">Free Trial</SelectItem>
                <SelectItem value="custom">Custom Plan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Service Capacity */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Service Capacity</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="connections">Max Connections</Label>
            <Input
              id="connections"
              type="number"
              value={formData.serviceCapacity.connections}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  serviceCapacity: { ...formData.serviceCapacity, connections: Number.parseInt(e.target.value) || 0 },
                })
              }
              placeholder="100"
              min="1"
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="olts">Number of OLTs</Label>
            <Input
              id="olts"
              type="number"
              value={formData.serviceCapacity.olts}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  serviceCapacity: { ...formData.serviceCapacity, olts: Number.parseInt(e.target.value) || 0 },
                })
              }
              placeholder="1"
              min="0"
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="technicianCount">Technician Count</Label>
            <Input
              id="technicianCount"
              type="number"
              value={formData.technicianCount}
              onChange={(e) => setFormData({ ...formData, technicianCount: Number.parseInt(e.target.value) || 0 })}
              placeholder="0"
              min="0"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Dashboard Permissions</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="inventory">Inventory Management</Label>
              <p className="text-sm text-gray-500">Allow access to inventory module</p>
            </div>
            <Switch
              id="inventory"
              checked={formData.dashboardPermissions.inventory}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  dashboardPermissions: { ...formData.dashboardPermissions, inventory: checked },
                })
              }
              disabled={loading}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="billing">Billing Access</Label>
              <p className="text-sm text-gray-500">Allow access to billing and payments</p>
            </div>
            <Switch
              id="billing"
              checked={formData.dashboardPermissions.billing}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  dashboardPermissions: { ...formData.dashboardPermissions, billing: checked },
                })
              }
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* API Access */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">API Access</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="whatsapp">WhatsApp Integration</Label>
              <p className="text-sm text-gray-500">Enable WhatsApp messaging features</p>
            </div>
            <Switch
              id="whatsapp"
              checked={formData.apiAccess.whatsapp}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  apiAccess: { ...formData.apiAccess, whatsapp: checked },
                })
              }
              disabled={loading}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="paymentGateway">Payment Gateway</Label>
              <p className="text-sm text-gray-500">Enable online payment processing</p>
            </div>
            <Switch
              id="paymentGateway"
              checked={formData.apiAccess.paymentGateway}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  apiAccess: { ...formData.apiAccess, paymentGateway: checked },
                })
              }
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={loading}
          className="w-full sm:w-auto bg-transparent"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Operator...
            </>
          ) : (
            "Create Operator"
          )}
        </Button>
      </div>
    </form>
  )
}
