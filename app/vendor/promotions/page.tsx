"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Gift,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Percent,
  Tag,
  TrendingUp,
  Users,
  ShoppingCart,
  Eye,
  Play,
  Pause,
  BarChart3,
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"

interface Promotion {
  id: string
  title: string
  description: string
  type: "percentage" | "fixed" | "bogo" | "free_shipping"
  value: number
  minOrderValue?: number
  maxDiscount?: number
  startDate: string
  endDate: string
  status: "draft" | "active" | "paused" | "expired"
  usageCount: number
  usageLimit?: number
  applicableProducts: string[]
  createdAt: string
}

export default function VendorPromotionsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewPromotion, setShowNewPromotion] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "percentage" as const,
    value: 0,
    minOrderValue: 0,
    maxDiscount: 0,
    startDate: "",
    endDate: "",
    usageLimit: 0,
    applicableProducts: [] as string[],
  })

  useEffect(() => {
    fetchPromotions()
  }, [])

  const fetchPromotions = async () => {
    try {
      setLoading(true)

      // Mock promotions for demo
      const mockPromotions: Promotion[] = [
        {
          id: "PROMO-001",
          title: "Summer Sale 2024",
          description: "Get 20% off on all networking equipment",
          type: "percentage",
          value: 20,
          minOrderValue: 5000,
          maxDiscount: 2000,
          startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
          endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 23).toISOString(),
          status: "active",
          usageCount: 45,
          usageLimit: 100,
          applicableProducts: ["all"],
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
        },
        {
          id: "PROMO-002",
          title: "Bulk Order Discount",
          description: "₹500 off on orders above ₹10,000",
          type: "fixed",
          value: 500,
          minOrderValue: 10000,
          startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
          endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString(),
          status: "active",
          usageCount: 23,
          usageLimit: 50,
          applicableProducts: ["cables", "routers"],
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
        },
        {
          id: "PROMO-003",
          title: "Free Shipping Weekend",
          description: "Free shipping on all orders this weekend",
          type: "free_shipping",
          value: 0,
          startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          endDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          status: "expired",
          usageCount: 67,
          usageLimit: 200,
          applicableProducts: ["all"],
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        },
      ]

      setPromotions(mockPromotions)
    } catch (error) {
      console.error("Error fetching promotions:", error)
      toast({
        title: "Error",
        description: "Failed to load promotions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createPromotion = async () => {
    try {
      const newPromotion: Promotion = {
        id: `PROMO-${String(promotions.length + 1).padStart(3, "0")}`,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        value: formData.value,
        minOrderValue: formData.minOrderValue || undefined,
        maxDiscount: formData.maxDiscount || undefined,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: "draft",
        usageCount: 0,
        usageLimit: formData.usageLimit || undefined,
        applicableProducts: formData.applicableProducts,
        createdAt: new Date().toISOString(),
      }

      setPromotions((prev) => [newPromotion, ...prev])
      resetForm()
      setShowNewPromotion(false)

      toast({
        title: "Success",
        description: "Promotion created successfully",
      })
    } catch (error) {
      console.error("Error creating promotion:", error)
      toast({
        title: "Error",
        description: "Failed to create promotion",
        variant: "destructive",
      })
    }
  }

  const updatePromotionStatus = async (promotionId: string, status: Promotion["status"]) => {
    try {
      setPromotions((prev) => prev.map((promo) => (promo.id === promotionId ? { ...promo, status } : promo)))

      toast({
        title: "Success",
        description: `Promotion ${status === "active" ? "activated" : status === "paused" ? "paused" : "updated"} successfully`,
      })
    } catch (error) {
      console.error("Error updating promotion status:", error)
      toast({
        title: "Error",
        description: "Failed to update promotion status",
        variant: "destructive",
      })
    }
  }

  const deletePromotion = async (promotionId: string) => {
    try {
      setPromotions((prev) => prev.filter((promo) => promo.id !== promotionId))

      toast({
        title: "Success",
        description: "Promotion deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting promotion:", error)
      toast({
        title: "Error",
        description: "Failed to delete promotion",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "percentage",
      value: 0,
      minOrderValue: 0,
      maxDiscount: 0,
      startDate: "",
      endDate: "",
      usageLimit: 0,
      applicableProducts: [],
    })
    setEditingPromotion(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
      case "paused":
        return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>
      case "expired":
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "percentage":
        return <Percent className="w-4 h-4" />
      case "fixed":
        return <Tag className="w-4 h-4" />
      case "bogo":
        return <Gift className="w-4 h-4" />
      case "free_shipping":
        return <ShoppingCart className="w-4 h-4" />
      default:
        return <Gift className="w-4 h-4" />
    }
  }

  const formatPromotionValue = (promotion: Promotion) => {
    switch (promotion.type) {
      case "percentage":
        return `${promotion.value}% OFF`
      case "fixed":
        return `₹${promotion.value} OFF`
      case "free_shipping":
        return "FREE SHIPPING"
      case "bogo":
        return "BUY ONE GET ONE"
      default:
        return promotion.value.toString()
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
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Gift className="w-8 h-8" />
            Offers & Promotions
          </h1>
          <p className="text-gray-600 mt-1">Create and manage promotional campaigns for your products</p>
        </div>
        <Button onClick={() => setShowNewPromotion(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          New Promotion
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Promotions</p>
                <p className="text-2xl font-bold text-green-600">
                  {promotions.filter((p) => p.status === "active").length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Usage</p>
                <p className="text-2xl font-bold text-blue-600">
                  {promotions.reduce((sum, p) => sum + p.usageCount, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Draft Promotions</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {promotions.filter((p) => p.status === "draft").length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-red-600">
                  {promotions.filter((p) => p.status === "expired").length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New/Edit Promotion Form */}
      {(showNewPromotion || editingPromotion) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingPromotion ? "Edit Promotion" : "Create New Promotion"}</CardTitle>
            <CardDescription>Set up promotional offers to boost your sales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Promotion Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter promotion title"
                />
              </div>
              <div>
                <Label htmlFor="type">Promotion Type</Label>
                <select
                  id="type"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                >
                  <option value="percentage">Percentage Discount</option>
                  <option value="fixed">Fixed Amount Discount</option>
                  <option value="free_shipping">Free Shipping</option>
                  <option value="bogo">Buy One Get One</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your promotion"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {formData.type !== "free_shipping" && (
                <div>
                  <Label htmlFor="value">{formData.type === "percentage" ? "Discount %" : "Discount Amount (₹)"}</Label>
                  <Input
                    id="value"
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    placeholder="Enter value"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="minOrderValue">Minimum Order Value (₹)</Label>
                <Input
                  id="minOrderValue"
                  type="number"
                  value={formData.minOrderValue}
                  onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              {formData.type === "percentage" && (
                <div>
                  <Label htmlFor="maxDiscount">Maximum Discount (₹)</Label>
                  <Input
                    id="maxDiscount"
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="usageLimit">Usage Limit</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                  placeholder="0 = Unlimited"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={createPromotion} className="bg-green-600 hover:bg-green-700">
                {editingPromotion ? "Update" : "Create"} Promotion
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewPromotion(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Promotions List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Promotions</CardTitle>
          <CardDescription>Manage your promotional campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          {promotions.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No promotions yet</h3>
              <p className="text-gray-500">Create your first promotional campaign to boost sales.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {promotions.map((promotion) => (
                <div key={promotion.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon(promotion.type)}
                        <h3 className="font-semibold text-lg">{promotion.title}</h3>
                        {getStatusBadge(promotion.status)}
                      </div>
                      <p className="text-gray-600 mb-2">{promotion.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>#{promotion.id}</span>
                        <span>Created {formatDistanceToNow(new Date(promotion.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600 mb-1">{formatPromotionValue(promotion)}</div>
                      <div className="text-sm text-gray-500">
                        {promotion.usageLimit
                          ? `${promotion.usageCount}/${promotion.usageLimit} used`
                          : `${promotion.usageCount} used`}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Valid From:</span>
                      <p className="font-medium">{format(new Date(promotion.startDate), "MMM dd, yyyy HH:mm")}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Valid Until:</span>
                      <p className="font-medium">{format(new Date(promotion.endDate), "MMM dd, yyyy HH:mm")}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Min Order:</span>
                      <p className="font-medium">
                        {promotion.minOrderValue ? `₹${promotion.minOrderValue}` : "No minimum"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {promotion.status === "draft" && (
                        <Button
                          size="sm"
                          onClick={() => updatePromotionStatus(promotion.id, "active")}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Activate
                        </Button>
                      )}
                      {promotion.status === "active" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updatePromotionStatus(promotion.id, "paused")}
                        >
                          <Pause className="w-4 h-4 mr-1" />
                          Pause
                        </Button>
                      )}
                      {promotion.status === "paused" && (
                        <Button
                          size="sm"
                          onClick={() => updatePromotionStatus(promotion.id, "active")}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Resume
                        </Button>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <BarChart3 className="w-4 h-4 mr-1" />
                        Analytics
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deletePromotion(promotion.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  )
}
