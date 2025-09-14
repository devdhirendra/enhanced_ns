"use client"
import { useState } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  ShoppingCart,
  Package,
  Star,
  Truck,
  Eye,
  Plus,
  Minus,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Demo marketplace data
const marketplaceProducts = [
  {
    id: "PROD001",
    name: "Single Mode Fiber Cable - 2KM",
    category: "OFC Cable",
    brand: "Corning",
    price: 2400,
    originalPrice: 2800,
    discount: 14,
    rating: 4.8,
    reviews: 156,
    inStock: true,
    stockCount: 25,
    vendor: "Fiber Tech Solutions",
    vendorRating: 4.9,
    image: "/placeholder.svg?height=200&width=200",
    description: "High-quality single mode fiber optic cable suitable for long-distance transmission",
    specifications: {
      "Cable Type": "Single Mode",
      "Core Diameter": "9/125 μm",
      Length: "2 KM",
      "Jacket Color": "Yellow",
      "Operating Temperature": "-40°C to +70°C",
    },
    deliveryTime: "2-3 days",
    warranty: "2 years",
  },
  {
    id: "PROD002",
    name: "GPON ONU 4-Port Gigabit",
    category: "ONUs & Routers",
    brand: "Huawei",
    price: 2800,
    originalPrice: 3200,
    discount: 12,
    rating: 4.6,
    reviews: 89,
    inStock: true,
    stockCount: 42,
    vendor: "Network Devices Ltd",
    vendorRating: 4.7,
    image: "/placeholder.svg?height=200&width=200",
    description: "4-port Gigabit GPON ONU with WiFi capability for residential and small business use",
    specifications: {
      Ports: "4 x Gigabit Ethernet",
      WiFi: "802.11ac",
      "GPON Standard": "ITU-T G.984",
      Power: "12V DC",
      Dimensions: "200 x 150 x 35 mm",
    },
    deliveryTime: "1-2 days",
    warranty: "1 year",
  },
  {
    id: "PROD003",
    name: "SC-SC Patch Cord Bundle (50 pcs)",
    category: "Patch Cords",
    brand: "Panduit",
    price: 7500,
    originalPrice: 8500,
    discount: 12,
    rating: 4.7,
    reviews: 234,
    inStock: true,
    stockCount: 15,
    vendor: "Cable Connect Co",
    vendorRating: 4.8,
    image: "/placeholder.svg?height=200&width=200",
    description: "Bundle of 50 high-quality SC-SC fiber patch cords, 3 meters length",
    specifications: {
      "Connector Type": "SC to SC",
      Length: "3 meters",
      Quantity: "50 pieces",
      "Fiber Type": "Single Mode",
      Polish: "UPC",
    },
    deliveryTime: "3-4 days",
    warranty: "1 year",
  },
  {
    id: "PROD004",
    name: "Fusion Splicer Professional Kit",
    category: "Splicing Tools",
    brand: "Fujikura",
    price: 125000,
    originalPrice: 140000,
    discount: 11,
    rating: 4.9,
    reviews: 45,
    inStock: false,
    stockCount: 0,
    vendor: "Professional Tools Inc",
    vendorRating: 4.9,
    image: "/placeholder.svg?height=200&width=200",
    description: "Professional fusion splicer kit with carrying case and all accessories",
    specifications: {
      "Splice Loss": "≤0.02 dB",
      "Splice Time": "7 seconds",
      "Heating Time": "30 seconds",
      "Battery Life": "200 splices",
      Weight: "2.1 kg",
    },
    deliveryTime: "7-10 days",
    warranty: "3 years",
  },
]

const orderHistory = [
  {
    id: "ORD001",
    date: "2024-01-10",
    vendor: "Fiber Tech Solutions",
    items: 3,
    total: 15600,
    status: "delivered",
    trackingId: "FTS123456789",
    deliveredDate: "2024-01-12",
  },
  {
    id: "ORD002",
    date: "2024-01-08",
    vendor: "Network Devices Ltd",
    items: 5,
    total: 28500,
    status: "shipped",
    trackingId: "NDL987654321",
    estimatedDelivery: "2024-01-16",
  },
  {
    id: "ORD003",
    date: "2024-01-05",
    vendor: "Cable Connect Co",
    items: 2,
    total: 8900,
    status: "processing",
    trackingId: "CCC456789123",
    estimatedDelivery: "2024-01-18",
  },
]

const categories = [
  "All Categories",
  "OFC Cable",
  "ONUs & Routers",
  "Patch Cords",
  "Splicing Tools",
  "T-Boxes & Couplers",
  "Installation Tools",
]

export default function MarketplaceIntegration() {
// Define a type for cart item
type CartItem = typeof marketplaceProducts[number] & { quantity: number }

// States
const [products, setProducts] = useState(marketplaceProducts)
const [orders, setOrders] = useState(orderHistory)
const [cart, setCart] = useState<CartItem[]>([])   // 👈 fix here
const [searchTerm, setSearchTerm] = useState("")
const [categoryFilter, setCategoryFilter] = useState("All Categories")
const [sortBy, setSortBy] = useState("relevance")
const [selectedProduct, setSelectedProduct] = useState<typeof marketplaceProducts[number] | null>(null)

  const { toast } = useToast()

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "All Categories" || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price_low":
        return a.price - b.price
      case "price_high":
        return b.price - a.price
      case "rating":
        return b.rating - a.rating
      case "discount":
        return b.discount - a.discount
      default:
        return 0
    }
  })

  const addToCart = (product: any, quantity = 1) => {
    const existingItem = cart.find((item) => item.id === product.id)
    if (existingItem) {
      setCart(cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item)))
    } else {
      setCart([...cart, { ...product, quantity }])
    }
    toast({
      title: "Item Added to Cart",
      description: `${quantity} x ${product.name} added to your cart.`,
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.id !== productId))
    toast({
      title: "Item Removed",
      description: "Item removed from your cart.",
    })
  }

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      setCart(cart.map((item) => (item.id === productId ? { ...item, quantity } : item)))
      toast({
        title: "Cart Updated",
        description: "Cart quantity updated.",
      })
    }
  }

  const getTotalCartValue = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800"
      case "shipped":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "processing":
        return <Clock className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <DashboardLayout title="Marketplace" description="Purchase networking equipment from verified vendors">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
            <p className="text-gray-600 mt-1">Purchase networking equipment from verified vendors</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="relative bg-transparent">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Cart
              {cart.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">{cart.length}</Badge>
              )}
            </Button>
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit Full Store
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="cart">Cart {cart.length > 0 && `(${cart.length})`}</TabsTrigger>
            <TabsTrigger value="orders">Order History</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search items by name, category, or supplier..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="price_low">Price: Low to High</SelectItem>
                      <SelectItem value="price_high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="discount">Best Discount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                        {product.discount > 0 && (
                          <Badge className="bg-red-100 text-red-800 text-xs">-{product.discount}%</Badge>
                        )}
                      </div>

                      <div className="text-xs text-gray-500">
                        {product.brand} • {product.category}
                      </div>

                      <div className="flex items-center space-x-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {product.rating} ({product.reviews})
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-lg">₹{product.price.toLocaleString()}</span>
                        {product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through">
                            ₹{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-gray-500">
                        <div className="flex items-center">
                          <Truck className="h-3 w-3 mr-1" />
                          {product.deliveryTime}
                        </div>
                        <div className="flex items-center mt-1">
                          <Package className="h-3 w-3 mr-1" />
                          {product.inStock ? (
                            <span className="text-green-600">In Stock ({product.stockCount})</span>
                          ) : (
                            <span className="text-red-600">Out of Stock</span>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 bg-transparent"
                          onClick={() => setSelectedProduct(product)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          disabled={!product.inStock}
                          onClick={() => addToCart(product)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="cart" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shopping Cart</CardTitle>
                <CardDescription>Review your selected items before checkout</CardDescription>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Your cart is empty</p>
                    <p className="text-sm text-gray-400">Add some products to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-gray-500">{item.brand}</p>
                          <p className="font-medium">₹{item.price.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold">Total: ₹{getTotalCartValue().toLocaleString()}</span>
                      </div>
                      <div className="flex space-x-3">
                        <Button variant="outline" onClick={() => setCart([])}>
                          Clear Cart
                        </Button>
                        <Button className="flex-1">Proceed to Checkout</Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>Track your previous orders and deliveries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">Order #{order.id}</h3>
                          <p className="text-sm text-gray-500">Placed on {new Date(order.date).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-500">Vendor: {order.vendor}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹{order.total.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">{order.items} items</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(order.status)}
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                          <span className="text-sm text-gray-500">Tracking: {order.trackingId}</span>
                        </div>

                        <div className="text-sm text-gray-500">
                          {order.status === "delivered" ? (
                            <span>Delivered on {new Date(order.deliveredDate).toLocaleDateString()}</span>
                          ) : (
                            <span>Est. delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Product Details Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
                  <Button variant="ghost" onClick={() => setSelectedProduct(null)}>
                    ×
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="aspect-square bg-gray-100 rounded-lg mb-4">
                      <img
                        src={selectedProduct.image || "/placeholder.svg"}
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl font-bold">₹{selectedProduct.price.toLocaleString()}</span>
                        {selectedProduct.originalPrice > selectedProduct.price && (
                          <span className="text-lg text-gray-500 line-through">
                            ₹{selectedProduct.originalPrice.toLocaleString()}
                          </span>
                        )}
                        {selectedProduct.discount > 0 && (
                          <Badge className="bg-red-100 text-red-800">-{selectedProduct.discount}%</Badge>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 mb-4">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(selectedProduct.rating)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {selectedProduct.rating} ({selectedProduct.reviews} reviews)
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-gray-700">{selectedProduct.description}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Specifications</h3>
                      <div className="space-y-1">
                        {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-gray-600">{key}:</span>
                            <span>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Vendor:</span>
                        <div className="flex items-center">
                          <span>{selectedProduct.vendor}</span>
                          <div className="flex items-center ml-2">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs">{selectedProduct.vendorRating}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Delivery:</span>
                        <span className="block">{selectedProduct.deliveryTime}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Warranty:</span>
                        <span className="block">{selectedProduct.warranty}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Stock:</span>
                        <span className={`block ${selectedProduct.inStock ? "text-green-600" : "text-red-600"}`}>
                          {selectedProduct.inStock ? `${selectedProduct.stockCount} available` : "Out of stock"}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <Button
                        className="flex-1"
                        disabled={!selectedProduct.inStock}
                        onClick={() => {
                          addToCart(selectedProduct)
                          setSelectedProduct(null)
                        }}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Button variant="outline" className="flex-1 bg-transparent">
                        Contact Vendor
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
