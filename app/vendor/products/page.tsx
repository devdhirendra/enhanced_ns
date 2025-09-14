"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Star, 
  Filter,
  Loader2,
  RefreshCw,
  AlertTriangle
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { productApi } from "@/lib/api"

interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  description: string
  specifications: string
  warranty: string
  discount: number
  status: "active" | "inactive" | "pending"
  rating: number
  sold: number
  createdDate: string
}

interface ProductFormData {
  name: string
  category: string
  price: string
  stock: string
  description: string
  specifications: string
  warranty: string
  discount: string
}

const categories = [
  { value: "Routers", label: "Routers" },
  { value: "Cables", label: "OFC Cables" },
  { value: "ONUs", label: "ONUs" },
  { value: "Switches", label: "Switches" },
  { value: "Tools", label: "Splicing Tools" },
  { value: "Accessories", label: "Patch Cords & Splitters" },
]

export default function ProductsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  // ✅ Updated to use user.user_id
  const vendorId = user?.user_id || user?.profileDetail?.vendorId || ""
  
  // State management
  const [productList, setProductList] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const [newProduct, setNewProduct] = useState<ProductFormData>({
    name: "",
    category: "Routers",
    price: "",
    stock: "",
    description: "",
    specifications: "",
    warranty: "",
    discount: "0",
  })

  // Dashboard Layout props
  const dashboardTitle = "Product Management"
  const dashboardDescription = "Manage your product catalog and inventory"

  // Fetch products on component mount
  useEffect(() => {
    if (vendorId) {
      fetchProducts()
    }
  }, [vendorId])

  // ✅ Updated fetchProducts with new API structure
  const fetchProducts = async () => {
    if (!vendorId) return
    
    setLoading(true)
    try {
      console.log("Fetching products for vendorId:", vendorId)
      const response = await productApi.get(vendorId)
      
      if (response?.success) {
        console.log("Fetched products:", response.data)
        setProductList(response.data || [])
      } else {
        throw new Error(response?.error || "Failed to fetch products")
      }
    } catch (error: any) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch products. Please try again.",
        variant: "destructive"
      })
      // Set empty array on error to show empty state
      setProductList([])
    } finally {
      setLoading(false)
    }
  }

  // Enhanced filtering logic with category API support
  const filteredProducts = productList.filter((product) => {
    const matchesSearch = 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.specifications?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    const matchesStatus = selectedStatus === "all" || product.status === selectedStatus
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Utility functions
  const getStockStatusColor = (stock: number) => {
    if (stock <= 5) return "text-red-600"
    if (stock <= 15) return "text-yellow-600"
    return "text-green-600"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const resetForm = () => {
    setNewProduct({
      name: "",
      category: "Routers",
      price: "",
      stock: "",
      description: "",
      specifications: "",
      warranty: "",
      discount: "0",
    })
  }

  // ✅ Updated handleAddProduct with new API
  const handleAddProduct = async () => {
    if (!vendorId) return
    
    setActionLoading("add")
    try {
      const productData = {
        name: newProduct.name,
        category: newProduct.category,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        description: newProduct.description,
        specifications: newProduct.specifications,
        warranty: newProduct.warranty,
        discount: parseFloat(newProduct.discount) || 0,
        vendorId: vendorId, // Include vendorId in the payload
        status: "active" // Default status
      }

      console.log("Creating product:", productData)
      const response = await productApi.create(productData)
      
      if (response?.success) {
        resetForm()
        setIsAddDialogOpen(false)
        await fetchProducts() // Refresh the list
        
        toast({
          title: "Product Added",
          description: `${productData.name} has been added to your catalog.`,
        })
      } else {
        throw new Error(response?.error || "Failed to add product")
      }
    } catch (error: any) {
      console.error("Error adding product:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add product. Please try again.",
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setNewProduct({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      description: product.description,
      specifications: product.specifications,
      warranty: product.warranty,
      discount: product.discount.toString(),
    })
    setIsEditDialogOpen(true)
  }

  // ✅ Updated handleUpdateProduct with new API
  const handleUpdateProduct = async () => {
    if (!selectedProduct) return
    
    setActionLoading("update")
    try {
      const productData = {
        name: newProduct.name,
        category: newProduct.category,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        description: newProduct.description,
        specifications: newProduct.specifications,
        warranty: newProduct.warranty,
        discount: parseFloat(newProduct.discount) || 0,
      }

      console.log("Updating product:", selectedProduct.id, productData)
      const response = await productApi.update(selectedProduct.id, productData)
      
      if (response?.success) {
        setIsEditDialogOpen(false)
        setSelectedProduct(null)
        resetForm()
        await fetchProducts() // Refresh the list
        
        toast({
          title: "Product Updated",
          description: `${productData.name} has been updated successfully.`,
        })
      } else {
        throw new Error(response?.error || "Failed to update product")
      }
    } catch (error: any) {
      console.error("Error updating product:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update product. Please try again.",
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  // ✅ Updated handleDeleteProduct with new API
  const handleDeleteProduct = async (productId: string) => {
    setActionLoading("delete")
    try {
      console.log("Deleting product:", productId)
      const response = await productApi.delete(productId)
      
      if (response?.success) {
        await fetchProducts() // Refresh the list
        
        toast({
          title: "Product Deleted",
          description: "Product has been removed from your catalog.",
        })
      } else {
        throw new Error(response?.error || "Failed to delete product")
      }
    } catch (error: any) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete product. Please try again.",
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  // ✅ Enhanced handleRefresh
  const handleRefresh = async () => {
    await fetchProducts()
    toast({
      title: "Refreshed",
      description: "Product list has been updated.",
    })
  }

  // ✅ Filter by category using API
  const handleCategoryFilter = async (category: string) => {
    setSelectedCategory(category)
    
    if (category !== "all") {
      setLoading(true)
      try {
        const categoryProducts = await productApi.getByCategory(category)
        setProductList(categoryProducts || [])
      } catch (error) {
        console.error("Error filtering by category:", error)
        toast({
          title: "Error",
          description: "Failed to filter products by category",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    } else {
      // Reset to all products
      await fetchProducts()
    }
  }

  // Loading skeleton component
  const ProductTableSkeleton = () => (
    <div className="space-y-3">
      {Array(5).fill(0).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4">
          <Skeleton className="h-12 w-12 rounded" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-3 w-[150px]" />
          </div>
          <Skeleton className="h-8 w-[80px]" />
          <Skeleton className="h-8 w-[60px]" />
          <Skeleton className="h-8 w-[80px]" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      ))}
    </div>
  )

  if (!user || !vendorId) {
    return (
      <DashboardLayout title={dashboardTitle} description={dashboardDescription}>
        <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-semibold">Authentication Required</h2>
          <p className="text-gray-600 text-center">
            Please log in to manage your products.
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>Debug info:</p>
            <p>User ID: {user?.user_id || 'None'}</p>
            <p>Vendor ID: {user?.profileDetail?.vendorId || 'None'}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title={dashboardTitle} description={dashboardDescription}>
      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4 mt-2">
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                Total: {productList.length} products
              </Badge>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Active: {productList.filter(p => p.status === 'active').length}
              </Badge>
              <Badge variant="outline" className="text-gray-600 border-gray-600">
                Vendor ID: {vendorId}
              </Badge>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <ProductFormDialog
                title="Add New Product"
                description="Create a new product listing for your marketplace"
                product={newProduct}
                onProductChange={setNewProduct}
                onSubmit={handleAddProduct}
                onCancel={() => {
                  setIsAddDialogOpen(false)
                  resetForm()
                }}
                isLoading={actionLoading === "add"}
                submitLabel="Add Product"
              />
            </Dialog>
          </div>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2 text-green-600" />
              Product Catalog
            </CardTitle>
            <CardDescription>View and manage all your products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* ✅ Enhanced Filters */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search products by name, description, or specifications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={handleCategoryFilter}>
                  <SelectTrigger className="w-[200px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Results Count */}
              {!loading && (
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>
                    Showing {filteredProducts.length} of {productList.length} products
                  </span>
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchTerm("")}
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              )}

              {/* Table */}
              {loading ? (
                <ProductTableSkeleton />
              ) : filteredProducts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Sold</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="flex items-center mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < Math.floor(product.rating || 0)
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                              <span className="text-xs text-gray-500 ml-1">
                                ({product.rating || 0})
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(product.price)}
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${getStockStatusColor(product.stock)}`}>
                            {product.stock}
                          </span>
                        </TableCell>
                        <TableCell>{product.sold || 0}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(product.status)}>
                            {product.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{product.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteProduct(product.id)}
                                    disabled={actionLoading === "delete"}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    {actionLoading === "delete" && (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    )}
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || selectedCategory !== "all" || selectedStatus !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "Get started by adding your first product."}
                  </p>
                  {(!searchTerm && selectedCategory === "all" && selectedStatus === "all") && (
                    <div className="mt-6">
                      <Button onClick={() => setIsAddDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Product Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <ProductFormDialog
            title="Edit Product"
            description="Update product information"
            product={newProduct}
            onProductChange={setNewProduct}
            onSubmit={handleUpdateProduct}
            onCancel={() => {
              setIsEditDialogOpen(false)
              setSelectedProduct(null)
              resetForm()
            }}
            isLoading={actionLoading === "update"}
            submitLabel="Update Product"
          />
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

// Product Form Dialog Component (unchanged)
interface ProductFormDialogProps {
  title: string
  description: string
  product: ProductFormData
  onProductChange: (product: ProductFormData) => void
  onSubmit: () => void
  onCancel: () => void
  isLoading: boolean
  submitLabel: string
}

const ProductFormDialog: React.FC<ProductFormDialogProps> = ({
  title,
  description,
  product,
  onProductChange,
  onSubmit,
  onCancel,
  isLoading,
  submitLabel,
}) => {
  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="productName">Product Name *</Label>
            <Input
              id="productName"
              value={product.name}
              onChange={(e) => onProductChange({ ...product, name: e.target.value })}
              placeholder="Enter product name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={product.category}
              onValueChange={(value) => onProductChange({ ...product, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price (₹) *</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={product.price}
              onChange={(e) => onProductChange({ ...product, price: e.target.value })}
              placeholder="3500"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock">Stock Quantity *</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              value={product.stock}
              onChange={(e) => onProductChange({ ...product, stock: e.target.value })}
              placeholder="50"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount">Discount (%)</Label>
            <Input
              id="discount"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={product.discount}
              onChange={(e) => onProductChange({ ...product, discount: e.target.value })}
              placeholder="10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={product.description}
            onChange={(e) => onProductChange({ ...product, description: e.target.value })}
            placeholder="Detailed product description"
            rows={3}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="specifications">Technical Specifications</Label>
          <Textarea
            id="specifications"
            value={product.specifications}
            onChange={(e) => onProductChange({ ...product, specifications: e.target.value })}
            placeholder="Technical specifications and features"
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="warranty">Warranty Information</Label>
          <Input
            id="warranty"
            value={product.warranty}
            onChange={(e) => onProductChange({ ...product, warranty: e.target.value })}
            placeholder="2 years manufacturer warranty"
          />
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button 
          onClick={onSubmit} 
          className="bg-green-600 hover:bg-green-700"
          disabled={isLoading || !product.name || !product.price || !product.stock || !product.description}
        >
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </DialogContent>
  )
}
