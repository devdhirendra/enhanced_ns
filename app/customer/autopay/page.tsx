"use client"

import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Bell } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <DashboardLayout
      title="Analytics & Reports"
      description="Comprehensive business intelligence and performance metrics"
    >
      <div className="min-h-[500px] flex items-center justify-center">
        <Card className="max-w-md w-full text-center shadow-lg">
          <CardContent className="p-12">
            <div className="space-y-6">
              {/* Icon */}
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-gray-600" />
              </div>

              {/* Title */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Autopay Dashboard
                </h1>
                <p className="text-gray-500">
                  Coming Soon in Next Update
                </p>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed">
                We're building powerful analytics tools to give you insights into your business performance.
              </p>

              {/* CTA */}
              <Button variant="outline" className="w-full">
                <Bell className="h-4 w-4 mr-2" />
                Notify Me
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}