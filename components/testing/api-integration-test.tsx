"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { api, operatorApi, technicianApi, inventoryApi } from "@/lib/api"

interface TestResult {
  name: string
  status: "success" | "error" | "warning"
  message: string
}

export default function ApiIntegrationTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runTests = async () => {
    setIsRunning(true)
    const results: TestResult[] = []

    // Test Admin APIs
    try {
      await api.getOperators()
      results.push({ name: "Admin - Get Operators", status: "success", message: "API endpoint working" })
    } catch (error) {
      results.push({ name: "Admin - Get Operators", status: "error", message: "API endpoint not implemented" })
    }

    try {
      await api.getStaff()
      results.push({ name: "Admin - Get Staff", status: "success", message: "API endpoint working" })
    } catch (error) {
      results.push({ name: "Admin - Get Staff", status: "error", message: "API endpoint not implemented" })
    }

    // Test Operator APIs
    try {
      await operatorApi.getTechnicians()
      results.push({ name: "Operator - Get Technicians", status: "success", message: "API endpoint working" })
    } catch (error) {
      results.push({ name: "Operator - Get Technicians", status: "error", message: "API endpoint not implemented" })
    }

    try {
      await operatorApi.getCustomers()
      results.push({ name: "Operator - Get Customers", status: "success", message: "API endpoint working" })
    } catch (error) {
      results.push({ name: "Operator - Get Customers", status: "error", message: "API endpoint not implemented" })
    }

    // Test Technician APIs
    try {
      await technicianApi.getProfile()
      results.push({ name: "Technician - Get Profile", status: "success", message: "API endpoint working" })
    } catch (error) {
      results.push({ name: "Technician - Get Profile", status: "error", message: "API endpoint not implemented" })
    }

    try {
      await technicianApi.getAttendance()
      results.push({ name: "Technician - Get Attendance", status: "success", message: "API endpoint working" })
    } catch (error) {
      results.push({ name: "Technician - Get Attendance", status: "error", message: "API endpoint not implemented" })
    }

    // Test Inventory APIs
    try {
      await inventoryApi.getStock()
      results.push({ name: "Inventory - Get Stock", status: "success", message: "API endpoint working" })
    } catch (error) {
      results.push({ name: "Inventory - Get Stock", status: "error", message: "API endpoint not implemented" })
    }

    setTestResults(results)
    setIsRunning(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>API Integration Test Suite</CardTitle>
        <CardDescription>Test all integrated APIs to verify functionality</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTests} disabled={isRunning} className="w-full">
          {isRunning ? "Running Tests..." : "Run API Tests"}
        </Button>

        {testResults.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Test Results</h3>
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(result.status)}
                  <span className="font-medium">{result.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{result.message}</span>
                  <Badge variant={result.status === "success" ? "default" : "destructive"}>{result.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
