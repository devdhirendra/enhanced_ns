"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2, Lock, Mail, X, Phone, Send } from "lucide-react"
import { toast } from "sonner"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const { login, loading } = useAuth()
  const [showContactPopup, setShowContactPopup] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Professional network solution images
  const sliderImages = [
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=1400&fit=crop&q=80", // Global network connectivity
    "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=1200&h=1400&fit=crop&q=80", // Data center servers
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=1400&fit=crop&q=80", // Network infrastructure
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % sliderImages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      const errorMsg = "Please fill in all fields"
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    try {
      console.log("[v0] LoginForm: Attempting login for:", email)
      toast.loading("Signing in...", { id: "login-toast" })

      await login(email, password)
      console.log("[v0] LoginForm: Login successful")

      toast.success("Login successful! Redirecting...", { id: "login-toast" })
    } catch (error) {
      console.error("[v0] LoginForm: Login failed:", error)
      const errorMsg = error instanceof Error ? error.message : "Login failed. Please try again."
      setError(errorMsg)

      toast.error(errorMsg, { id: "login-toast" })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Animated Network Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 bg-blue-500 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}

        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          {[...Array(6)].map((_, i) => (
            <line
              key={i}
              x1={`${Math.random() * 100}%`}
              y1={`${Math.random() * 100}%`}
              x2={`${Math.random() * 100}%`}
              y2={`${Math.random() * 100}%`}
              stroke="url(#lineGradient)"
              strokeWidth="2"
              className="animate-pulse"
              style={{ animationDelay: `${i * 0.5}s` }}
            />
          ))}
        </svg>
      </div>

      {/* Company Logo - Top Right */}
      <div className="absolute top-6 right-6 lg:top-8 lg:right-12 z-20">
        <img
          src="/logo.png"
          alt="Network Solution Logo"
          className="h-12 lg:h-16 w-auto object-contain"
          onError={(e) => {
            // Fallback if logo.png is not found
            e.currentTarget.style.display = "logo"
          }}
        />
      </div>

      {/* Onboarding Button - Top Left */}
      <div className="absolute top-6 left-6 lg:top-8 lg:left-12 z-20">
        <a
          href="/onboarding"
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow hover:opacity-90 transition"
          aria-label="Start onboarding for operator, vendor, or staff"
        >
          {/* Simple plus icon using CSS to avoid new imports */}
          <span className="inline-block w-4 h-4 relative">
            <span
              className="absolute inset-0 bg-[hsl(var(--primary-foreground))]"
              style={{
                clipPath:
                  "polygon(45% 0,55% 0,55% 45%,100% 45%,100% 55%,55% 55%,55% 100%,45% 100%,45% 55%,0 55%,0 45%,45% 45%)",
              }}
            />
          </span>
          New Onboarding
        </a>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full h-screen flex">
        {/* Left Side - Image Slider (55%) */}
        <div className="hidden lg:block relative w-[55%] overflow-hidden">
          {sliderImages.map((img, index) => (
            <div
              key={index}
              className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
              style={{ opacity: currentImageIndex === index ? 1 : 0 }}
            >
              <img
                src={img || "/placeholder.svg"}
                alt={`Network Solution ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-transparent"></div>
            </div>
          ))}

          {/* Overlay Content */}
          <div className="absolute bottom-16 left-12 right-12 text-white z-10">
            <h2 className="text-4xl xl:text-5xl font-bold mb-4 leading-tight">
              Powering Global
              <br />
              Network Infrastructure
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-lg">
              Enterprise-grade connectivity solutions trusted by businesses worldwide
            </p>

            {/* Slider Indicators */}
            <div className="flex gap-3">
              {sliderImages.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentImageIndex === index ? "w-12 bg-white" : "w-8 bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Login Form (45%) */}
        <div className="w-full lg:w-[45%] flex items-center justify-center px-6 lg:px-12 xl:px-20">
          <div className="w-full max-w-md">
            <div className="mb-10">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-3">Welcome Back</h1>
              <p className="text-base lg:text-lg text-gray-600">Sign in to access your dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg transition-all text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    className="h-12 pr-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 rounded-lg transition-all text-base"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-4 hover:bg-blue-50 rounded-r-lg"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm pt-1">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-gray-600 group-hover:text-gray-800 transition-colors">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowContactPopup(true)}
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full h-13 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] text-base rounded-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 text-gray-500 font-medium">Secure Access</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Need access?{" "}
                  <button
                    type="button"
                    onClick={() => setShowContactPopup(true)}
                    className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
                  >
                    Contact Administrator
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Contact Administrator Popup - Professional Design */}
      {showContactPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full relative">
            {/* Header */}
            <div className="border-b border-gray-200 px-8 py-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Contact Administrator</h3>
                <p className="text-sm text-gray-600 mt-1">Get assistance from our support team</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-gray-100 rounded-full p-2 h-auto"
                onClick={() => setShowContactPopup(false)}
              >
                <X className="h-5 w-5 text-gray-400" />
              </Button>
            </div>

            {/* Content */}
            <div className="px-8 py-8 space-y-6">
              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-gray-700" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Phone Number</h4>
                  <a
                    href="tel:+918384343283"
                    className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    +91 83843 43283
                  </a>
                  <p className="text-xs text-gray-500 mt-1">Available 24/7 for support</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Send className="w-6 h-6 text-gray-700" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Email Address</h4>
                  <a
                    href="mailto:admin@networksolution.com"
                    className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors break-all"
                  >
                    admin@networksolution.com
                  </a>
                  <p className="text-xs text-gray-500 mt-1">Response within 24 hours</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-8 py-5 bg-gray-50 rounded-b-xl">
              <div className="flex gap-3">
                <Button
                  onClick={() => (window.location.href = "tel:+918384343283")}
                  className="flex-1 bg-gray-800 hover:bg-gray-900 text-white h-11 font-medium"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
                <Button
                  onClick={() => (window.location.href = "mailto:admin@networksolution.com")}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-11 font-medium"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
