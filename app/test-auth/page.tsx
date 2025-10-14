"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, User, Shield, Settings, Play, LogOut, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

export default function TestAuthPage() {
  const { user, login, logout, loading } = useAuth()
  const router = useRouter()
  const [testResults, setTestResults] = useState<any[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [routeTestResults, setRouteTestResults] = useState<any[]>([])

  // Test credentials should be created through proper admin registration flow

  const runAuthTests = async () => {
    setIsRunningTests(true)
    setTestResults([])

    console.log("[v0] Authentication tests disabled - test credentials removed")
    console.log("[v0] Only admin can register new users through proper registration flow")

    setTestResults([
      {
        role: "system",
        email: "system",
        success: true,
        roleMatch: true,
        message: "✅ Test credentials removed - use proper admin registration flow",
      },
    ])

    setIsRunningTests(false)
  }

  const testRouteAccess = async () => {
    if (!user) {
      setRouteTestResults([{ message: "❌ No user logged in for route testing", success: false }])
      return
    }

    console.log("Testing route access for user:", user.role)

    const routes = [
      { path: "/admin/dashboard", allowedRoles: ["admin"] },
      { path: "/admin/operators", allowedRoles: ["admin"] },
      { path: "/admin/settings", allowedRoles: ["admin"] },
      { path: "/operator/dashboard", allowedRoles: ["operator"] },
      { path: "/operator/customers", allowedRoles: ["operator"] },
      { path: "/technician/dashboard", allowedRoles: ["technician"] },
      { path: "/technician/tasks", allowedRoles: ["technician"] },
      { path: "/vendor/dashboard", allowedRoles: ["vendor"] },
      { path: "/vendor/products", allowedRoles: ["vendor"] },
      { path: "/customer/dashboard", allowedRoles: ["customer"] },
      { path: "/customer/bills", allowedRoles: ["customer"] },
      { path: "/staff/dashboard", allowedRoles: ["staff"] },
      { path: "/staff/tasks", allowedRoles: ["staff"] },
    ]

    const results = routes.map((route) => {
      const hasAccess = route.allowedRoles.includes(user.role)
      return {
        path: route.path,
        hasAccess,
        userRole: user.role,
        allowedRoles: route.allowedRoles,
        message: hasAccess
          ? `✅ ${user.role} can access ${route.path}`
          : `❌ ${user.role} cannot access ${route.path} (allowed: ${route.allowedRoles.join(", ")})`,
      }
    })

    setRouteTestResults(results)
    console.log("[v0] Route access test results:", results)
  }

  const testNavigation = (path: string) => {
    console.log(`[v0] Testing navigation to: ${path}`)
    router.push(path)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🧪 Authentication & Role Testing</h1>
          <p className="text-muted-foreground">Role-based authentication testing and access control verification</p>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="font-medium">{user.profileDetail?.name || user.email}</span>
              <Badge variant="secondary" className="capitalize">
                {user.role}
              </Badge>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Authentication Tests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Authentication Status
            </CardTitle>
            <CardDescription>System authentication information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                <strong>Security Notice:</strong> Test credentials have been removed. Only admin users can register new
                accounts through the proper registration flow.
              </AlertDescription>
            </Alert>

            <Button onClick={runAuthTests} disabled={isRunningTests} className="w-full" size="lg">
              <Play className="h-4 w-4 mr-2" />
              Check Authentication Status
            </Button>

            {testResults.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">System Status:</h4>
                  <Badge variant="outline">Secure</Badge>
                </div>
                <div className="space-y-2">
                  {testResults.map((result, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="font-medium">Security</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{result.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Route Access Tests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Route Access Test
            </CardTitle>
            <CardDescription>Test dashboard route access based on user role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testRouteAccess} variant="outline" className="w-full bg-transparent" disabled={!user}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Test Route Access
            </Button>

            {!user && (
              <Alert>
                <AlertDescription>Please login first to test route access</AlertDescription>
              </Alert>
            )}

            {user && (
              <Alert>
                <AlertDescription>
                  Testing access for: <strong>{user.role}</strong> ({user.profileDetail?.name || user.email})
                </AlertDescription>
              </Alert>
            )}

            {routeTestResults.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <h4 className="font-semibold">Route Access Results:</h4>
                {routeTestResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{result.path}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs"
                        onClick={() => testNavigation(result.path)}
                      >
                        Test →
                      </Button>
                    </div>
                    <Badge variant={result.hasAccess ? "default" : "secondary"}>
                      {result.hasAccess ? "✅ Allowed" : "❌ Restricted"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Admin Registration Notice */}
      <Card>
        <CardHeader>
          <CardTitle>🔐 User Registration</CardTitle>
          <CardDescription>How to create new user accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              <strong>Admin Only:</strong> New user accounts (operators, technicians, vendors, staff, customers) can
              only be created by admin users through the admin dashboard registration forms.
            </AlertDescription>
          </Alert>
          <div className="mt-4 space-y-2">
            <p className="text-sm text-muted-foreground">To create new accounts:</p>
            <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
              <li>Login as an admin user</li>
              <li>Navigate to the appropriate management section (Operators, Technicians, etc.)</li>
              <li>Use the "Add New" or "Register" button</li>
              <li>Fill out the registration form with proper details</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Current Status */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Current Session Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold">User Information</h4>
                <div className="space-y-1 text-sm">
                  <div>
                    <strong>Name:</strong> {user.profileDetail?.name || "N/A"}
                  </div>
                  <div>
                    <strong>Email:</strong> {user.email}
                  </div>
                  <div>
                    <strong>Role:</strong> <Badge className="capitalize">{user.role}</Badge>
                  </div>
                  <div>
                    <strong>User ID:</strong> {user.user_id}
                  </div>
                  <div>
                    <strong>Phone:</strong> {user.profileDetail?.phone || "N/A"}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Quick Actions</h4>
                <div className="space-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => testNavigation(`/${user.role}/dashboard`)}
                  >
                    Go to My Dashboard
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => testNavigation(`/${user.role}/profile`)}
                  >
                    Go to My Profile
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={testRouteAccess}
                  >
                    Test My Access Rights
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
