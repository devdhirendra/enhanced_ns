"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { customerApi } from "@/lib/api"

interface AddCustomerFormProps {
  onClose: () => void
  onSuccess?: () => void
}

export default function AddCustomerForm({ onClose, onSuccess }: AddCustomerFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    customerId: "",
    plan: "basic",
    connectionType: "fiber",
    monthlyCharges: 599,
    address: "",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const planRates = {
    basic: 599,
    standard: 899,
    premium: 1299,
    enterprise: 2499,
  }

  const generateCustomerId = () => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substr(2, 3).toUpperCase()
    return `CUST${timestamp}${random}`
  }

  const handlePlanChange = (newPlan: string) => {
    setFormData({
      ...formData,
      plan: newPlan,
      monthlyCharges: planRates[newPlan as keyof typeof planRates],
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      })
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const customerData = {
        email: formData.email,
        password: formData.password,
        profileDetail: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          planId: formData.plan,
          connectionType: formData.connectionType,
          monthlyRate: formData.monthlyCharges,
          customerId: formData.customerId || generateCustomerId(),
        }
      }

      await customerApi.add(customerData)

      toast({
        title: "Success",
        description: `${formData.name} has been added successfully!`,
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error adding customer:", error)
      toast({
        title: "Error",
        description: "Failed to add customer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="customerId">Customer ID (Optional)</Label>
          <Input
            id="customerId"
            value={formData.customerId}
            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
            placeholder="Auto-generated if empty"
            disabled={loading}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={loading}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            minLength={6}
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm Password *</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
            disabled={loading}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          disabled={loading}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="plan">Service Plan *</Label>
          <Select 
            value={formData.plan} 
            onValueChange={handlePlanChange}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic (50 Mbps) - ₹599</SelectItem>
              <SelectItem value="standard">Standard (100 Mbps) - ₹899</SelectItem>
              <SelectItem value="premium">Premium (200 Mbps) - ₹1,299</SelectItem>
              <SelectItem value="enterprise">Enterprise (500 Mbps) - ₹2,499</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="connectionType">Connection Type *</Label>
          <Select 
            value={formData.connectionType} 
            onValueChange={(value) => setFormData({ ...formData, connectionType: value })}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fiber">Fiber</SelectItem>
              <SelectItem value="broadband">Broadband</SelectItem>
              <SelectItem value="wireless">Wireless</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="monthlyCharges">Monthly Charges (₹)</Label>
        <Input
          id="monthlyCharges"
          type="number"
          value={formData.monthlyCharges}
          onChange={(e) => setFormData({ ...formData, monthlyCharges: Number.parseInt(e.target.value) || 0 })}
          disabled={loading}
          readOnly
        />
      </div>
      
      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Adding Customer..." : "Add Customer"}
        </Button>
      </div>
    </form>
  )
}
