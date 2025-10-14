"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { useAuth } from "@/contexts/AuthContext"
import { vendorApi } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { User, Building2, Phone, Mail, MapPin, FileText, Shield, CheckCircle, AlertCircle, Save } from "lucide-react"

export default function VendorProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [vendorData, setVendorData] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    address: {
      state: "",
      district: "",
      area: "",
      pincode: "",
      fullAddress: "",
    },
    businessDetails: {
      gstNumber: "",
      panNumber: "",
      businessType: "",
      establishedYear: "",
      description: "",
    },
    bankDetails: {
      accountNumber: "",
      ifscCode: "",
      bankName: "",
      accountHolderName: "",
    },
    kycStatus: "pending",
  })

  useEffect(() => {
    if (user?.user_id) {
      fetchVendorProfile()
    }
  }, [user])

  const fetchVendorProfile = async () => {
    try {
      setLoading(true)
      const profile = await vendorApi.getProfile(user.user_id)
      setVendorData(profile)

      // Populate form with existing data
      setFormData({
        name: profile.profileDetail?.name || "",
        email: profile.email || "",
        phone: profile.profileDetail?.phone || "",
        companyName: profile.profileDetail?.companyName || "",
        address: {
          state: profile.profileDetail?.address?.state || "",
          district: profile.profileDetail?.address?.district || "",
          area: profile.profileDetail?.address?.area || "",
          pincode: profile.profileDetail?.address?.pincode || "",
          fullAddress: profile.profileDetail?.address?.fullAddress || "",
        },
        businessDetails: {
          gstNumber: profile.profileDetail?.businessDetails?.gstNumber || "",
          panNumber: profile.profileDetail?.businessDetails?.panNumber || "",
          businessType: profile.profileDetail?.businessDetails?.businessType || "",
          establishedYear: profile.profileDetail?.businessDetails?.establishedYear || "",
          description: profile.profileDetail?.businessDetails?.description || "",
        },
        bankDetails: {
          accountNumber: profile.profileDetail?.bankDetails?.accountNumber || "",
          ifscCode: profile.profileDetail?.bankDetails?.ifscCode || "",
          bankName: profile.profileDetail?.bankDetails?.bankName || "",
          accountHolderName: profile.profileDetail?.bankDetails?.accountHolderName || "",
        },
        kycStatus: profile.profileDetail?.kycStatus || "pending",
      })
    } catch (error) {
      console.error("Error fetching vendor profile:", error)
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await vendorApi.update(user.user_id, {
        email: formData.email,
        profileDetail: {
          name: formData.name,
          phone: formData.phone,
          companyName: formData.companyName,
          address: formData.address,
          businessDetails: formData.businessDetails,
          bankDetails: formData.bankDetails,
          kycStatus: formData.kycStatus,
        },
      })

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })

      fetchVendorProfile()
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const getKycStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return <Badge className="bg-gray-100 text-gray-800">Not Started</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
        <DashboardLayout title="Vendor Dashboard" description="Overview of your network operations">
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Profile & KYC</h1>
          <p className="text-gray-600 mt-1">Manage your business profile and complete KYC verification</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-20 h-20 mb-4">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-green-100 text-green-800 text-lg">
                  {formData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-lg">{formData.name}</h3>
              <p className="text-gray-600">{formData.companyName}</p>
              <div className="mt-2">{getKycStatusBadge(formData.kycStatus)}</div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>{formData.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{formData.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>
                  {formData.address.area}, {formData.address.district}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Basic Information
              </CardTitle>
              <CardDescription>Update your basic business information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Contact Person Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter contact person name"
                  />
                </div>
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.address.state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, state: e.target.value },
                      })
                    }
                    placeholder="Enter state"
                  />
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
                    placeholder="Enter area"
                  />
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={formData.address.pincode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, pincode: e.target.value },
                      })
                    }
                    placeholder="Enter pincode"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="fullAddress">Full Address</Label>
                <Textarea
                  id="fullAddress"
                  value={formData.address.fullAddress}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, fullAddress: e.target.value },
                    })
                  }
                  placeholder="Enter complete address"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Business Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Business Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gstNumber">GST Number</Label>
                  <Input
                    id="gstNumber"
                    value={formData.businessDetails.gstNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        businessDetails: { ...formData.businessDetails, gstNumber: e.target.value },
                      })
                    }
                    placeholder="Enter GST number"
                  />
                </div>
                <div>
                  <Label htmlFor="panNumber">PAN Number</Label>
                  <Input
                    id="panNumber"
                    value={formData.businessDetails.panNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        businessDetails: { ...formData.businessDetails, panNumber: e.target.value },
                      })
                    }
                    placeholder="Enter PAN number"
                  />
                </div>
                <div>
                  <Label htmlFor="businessType">Business Type</Label>
                  <Input
                    id="businessType"
                    value={formData.businessDetails.businessType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        businessDetails: { ...formData.businessDetails, businessType: e.target.value },
                      })
                    }
                    placeholder="e.g., Private Limited, Partnership"
                  />
                </div>
                <div>
                  <Label htmlFor="establishedYear">Established Year</Label>
                  <Input
                    id="establishedYear"
                    value={formData.businessDetails.establishedYear}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        businessDetails: { ...formData.businessDetails, establishedYear: e.target.value },
                      })
                    }
                    placeholder="Enter year"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  value={formData.businessDetails.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      businessDetails: { ...formData.businessDetails, description: e.target.value },
                    })
                  }
                  placeholder="Describe your business"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Bank Details
              </CardTitle>
              <CardDescription>Secure payment settlement information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="accountHolderName">Account Holder Name</Label>
                  <Input
                    id="accountHolderName"
                    value={formData.bankDetails.accountHolderName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankDetails: { ...formData.bankDetails, accountHolderName: e.target.value },
                      })
                    }
                    placeholder="Enter account holder name"
                  />
                </div>
                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={formData.bankDetails.accountNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankDetails: { ...formData.bankDetails, accountNumber: e.target.value },
                      })
                    }
                    placeholder="Enter account number"
                  />
                </div>
                <div>
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input
                    id="ifscCode"
                    value={formData.bankDetails.ifscCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankDetails: { ...formData.bankDetails, ifscCode: e.target.value },
                      })
                    }
                    placeholder="Enter IFSC code"
                  />
                </div>
                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={formData.bankDetails.bankName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankDetails: { ...formData.bankDetails, bankName: e.target.value },
                      })
                    }
                    placeholder="Enter bank name"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </DashboardLayout>
  )
}
