"use client"

import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ComplaintsLoading() {
  return (
    <DashboardLayout title="Complaint Management" description="Loading complaint data...">
      <div className="space-y-6">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-12" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-full sm:w-48" />
          <Skeleton className="h-10 w-full sm:w-48" />
          <Skeleton className="h-10 w-full sm:w-48" />
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Skeleton className="h-9 w-full sm:w-24" />
          <Skeleton className="h-9 w-full sm:w-24" />
          <Skeleton className="h-9 w-full sm:w-32" />
        </div>

        {/* Table Skeleton */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
