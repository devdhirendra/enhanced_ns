// Create a new file: components/vendor/VendorForm.tsx
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"

interface VendorFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editData?: any
}

export function VendorForm({ open, onOpenChange, onSuccess, editData }: VendorFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: editData?.email || "",
    password: "",
    name: editData?.profileDetail?.name || "",
    phone: editData?.profileDetail?.phone || "",
    companyName: editData?.profileDetail?.companyName || "",
    state: editData?.profileDetail?.address?.state || "",
    district: editData?.profileDetail?.address?.district || "",
    area: editData?.profileDetail?.address?.area || "",
    category: editData?.profileDetail?.category || "General",
    commission: editData?.profileDetail?.commission || 15,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editData) {
        // Update existing vendor
        await apiClient.updateVendor(editData.id, {
          email: formData.email,
          profileDetail: {
            name: formData.name,
            phone: formData.phone,
            companyName: formData.companyName,
            category: formData.category,
            commission: Number(formData.commission),
            address: {
              state: formData.state,
              district: formData.district,
              area: formData.area,
            },
          },
        })
        toast({
          title: "Vendor Updated",
          description: "Vendor details have been updated successfully.",
        })
      } else {
        // Create new vendor
        await apiClient.addVendor({
          email: formData.email,
          password: formData.password,
          profileDetail: {
            name: formData.name,
            phone: formData.phone,
            companyName: formData.companyName,
            category: formData.category,
            commission: Number(formData.commission),
            address: {
              state: formData.state,
              district: formData.district,
              area: formData.area,
            },
          },
        })
        toast({
          title: "Vendor Created",
          description: "New vendor has been added successfully.",
        })
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving vendor:", error)
      toast({
        title: "Error",
        description: "Failed to save vendor. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit Vendor" : "Add New Vendor"}</DialogTitle>
          <DialogDescription>
            {editData ? "Update vendor details" : "Fill in the details to add a new vendor"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Contact Person *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {!editData && (
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">District *</Label>
              <Input
                id="district"
                name="district"
                value={formData.district}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="area">Area *</Label>
              <Input
                id="area"
                name="area"
                value={formData.area}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Networking">Networking</SelectItem>
                  <SelectItem value="Hardware">Hardware</SelectItem>
                  <SelectItem value="Software">Software</SelectItem>
                  <SelectItem value="Services">Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="commission">Commission (%)</Label>
            <Input
              id="commission"
              name="commission"
              type="number"
              min="0"
              max="30"
              value={formData.commission}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : editData ? "Update Vendor" : "Add Vendor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}