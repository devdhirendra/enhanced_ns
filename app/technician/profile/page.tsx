"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Camera, Save, User, Mail, Phone, Building, Calendar, Shield, MapPin } from "lucide-react"
import { useState, useEffect } from "react"
import { technicianApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { showConfirmation } from "@/lib/confirmation-dialog"

export default function TechnicianProfilePage() {
  const { user, fetchUserProfile } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    area: "",
    specialization: "",
    salary: "",
    assignedOperatorId: "",
  })

  useEffect(() => {
    if (user?.profileDetail) {
      setFormData({
        name: user.profileDetail.name || "",
        email: user.email || "",
        phone: user.profileDetail.phone || "",
        area: user.profileDetail.area || "",
        specialization: user.profileDetail.specialization || "",
        salary: user.profileDetail.salary || "",
        assignedOperatorId: user.profileDetail.assignedOperatorId || "",
      })
    }
  }, [user])

  if (!user) {
    return <div>Loading...</div>
  }

  const handleSave = async () => {
    if (!user?.user_id) return

    const confirmed = await showConfirmation({
      title: "Update Profile",
      message: "Are you sure you want to update your profile information?",
      confirmText: "Update",
      cancelText: "Cancel",
    })

    if (!confirmed) return

    try {
      setLoading(true)
      console.log("[v0] Updating technician profile:", formData)

      await technicianApi.updateProfile(user.user_id, {
        email: formData.email,
        profileDetail: {
          name: formData.name,
          phone: formData.phone,
          area: formData.area,
          specialization: formData.specialization,
          salary: formData.salary,
          assignedOperatorId: formData.assignedOperatorId,
        },
      })

      // Refresh user profile data
      await fetchUserProfile()

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      })

      setIsEditing(false)
    } catch (error) {
      console.error("[v0] Error updating profile:", error)
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800"
      case "operator":
        return "bg-blue-100 text-blue-800"
      case "technician":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-500">Manage your account information and preferences</p>
        </div>
        <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "outline" : "default"} disabled={loading}>
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="relative mx-auto">
              <Avatar className="h-24 w-24 mx-auto">
                <AvatarImage src={user.profileDetail?.avatar || "/placeholder.svg"} alt={user.profileDetail?.name} />
                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white text-2xl">
                  {user.profileDetail?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-transparent"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>
            <CardTitle className="mt-4">{user.profileDetail?.name}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
            <div className="flex justify-center gap-2 mt-2">
              <Badge className={getRoleColor(user.role)}>{user.role.toUpperCase()}</Badge>
              <Badge className={getStatusColor(user.status || "active")}>
                {(user.status || "active").toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-gray-500" />
                <span>ID: {user.profileDetail?.technicianId || user.user_id}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Building className="h-4 w-4 text-gray-500" />
                <span>Operator: {user.profileDetail?.assignedOperatorId || "Not Assigned"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              {user.lastLogin && (
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <span>Last Login: {new Date(user.lastLogin).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing || loading}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing || loading}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing || loading}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Service Area</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="area"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    disabled={!isEditing || loading}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                disabled={!isEditing || loading}
                placeholder="e.g., Fiber Installation, Network Troubleshooting"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary">Salary</Label>
              <Input
                id="salary"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                disabled={!isEditing || loading}
                placeholder="Monthly salary"
              />
            </div>

            {isEditing && (
              <>
                <Separator />
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsEditing(false)} disabled={loading}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Skills & Certifications */}
      <Card>
        <CardHeader>
          <CardTitle>Skills & Certifications</CardTitle>
          <CardDescription>Your technical skills and certifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {["Fiber Installation", "Network Troubleshooting", "Equipment Repair", "Customer Service"].map((skill) => (
              <div key={skill} className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                <Shield className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">{skill}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
