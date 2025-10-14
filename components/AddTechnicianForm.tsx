"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { admintechnicianApi } from "@/lib/api"

interface AddTechnicianFormProps {
  onClose: () => void
  onSuccess: () => void
}

export default function AddTechnicianForm({ onClose, onSuccess }: AddTechnicianFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    area: "",
    specialization: "",
    salary: "",
    assignedOperatorId: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = {
        email: formData.email,
        password: formData.password,
        profileDetail: {
          name: formData.name,
          phone: formData.phone,
          area: formData.area,
          specialization: formData.specialization,
          salary: formData.salary,
          assignedOperatorId: formData.assignedOperatorId,
        },
      }

      await admintechnicianApi.add(submitData)
      onSuccess()
    } catch (error: any) {
      console.error("Error adding technician:", error)
      toast({
        title: "Error Adding Technician",
        description: error.message || "Failed to add technician. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Account Information */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="technician@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            placeholder="Enter secure password"
            required
          />
        </div>

        {/* Personal Information */}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Enter full name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="+91 9876543210"
            required
          />
        </div>

        {/* Work Information */}
        <div className="space-y-2">
          <Label htmlFor="area">Assigned Area *</Label>
          <Input
            id="area"
            value={formData.area}
            onChange={(e) => handleInputChange("area", e.target.value)}
            placeholder="Zone A - Central District"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="salary">Monthly Salary (₹) *</Label>
          <Input
            id="salary"
            type="number"
            value={formData.salary}
            onChange={(e) => handleInputChange("salary", e.target.value)}
            placeholder="35000"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="assignedOperatorId">Assigned Operator ID</Label>
          <Input
            id="assignedOperatorId"
            value={formData.assignedOperatorId}
            onChange={(e) => handleInputChange("assignedOperatorId", e.target.value)}
            placeholder="OP001"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialization">Specialization *</Label>
        <Textarea
          id="specialization"
          value={formData.specialization}
          onChange={(e) => handleInputChange("specialization", e.target.value)}
          placeholder="Fiber Installation, Network Maintenance, Customer Support..."
          className="min-h-[80px]"
          required
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Adding..." : "Add Technician"}
        </Button>
      </div>
    </form>
  )
}
