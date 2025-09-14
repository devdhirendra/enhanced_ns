// components/skeletons/OperatorSkeletons.tsx
import React from 'react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

// Search and Filter Skeleton
export const SearchFilterSkeleton = () => (
  <Card className="shadow-sm">
    <CardContent className="p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-10 w-full sm:w-48" />
        </div>
      </div>
    </CardContent>
  </Card>
)

// Action Buttons Skeleton
export const ActionButtonsSkeleton = () => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div className="flex flex-wrap gap-2">
      <Skeleton className="h-9 w-24" />
      <Skeleton className="h-9 w-28" />
      <Skeleton className="h-9 w-28" />
    </div>
    <Skeleton className="h-9 w-40" />
  </div>
)

// Desktop Table Skeleton
export const DesktopTableSkeleton = ({ rows = 8 }: { rows?: number }) => (
  <div className="hidden md:block">
    <ScrollArea className="w-full">
      <div className="min-w-[1200px]">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="w-[250px] font-semibold">Company</TableHead>
              <TableHead className="w-[180px] font-semibold">Owner</TableHead>
              <TableHead className="w-[200px] font-semibold">Contact</TableHead>
              <TableHead className="w-[160px] font-semibold">Location</TableHead>
              <TableHead className="w-[140px] font-semibold">Connections</TableHead>
              <TableHead className="w-[120px] font-semibold">Revenue</TableHead>
              <TableHead className="w-[100px] font-semibold">Plan</TableHead>
              <TableHead className="w-[100px] font-semibold">Status</TableHead>
              <TableHead className="w-[100px] font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, index) => (
              <TableRow key={index}>
                {/* Company */}
                <TableCell className="py-4">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </TableCell>

                {/* Owner */}
                <TableCell className="py-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </TableCell>

                {/* Contact */}
                <TableCell className="py-4">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </TableCell>

                {/* Location */}
                <TableCell className="py-4">
                  <Skeleton className="h-3 w-28" />
                </TableCell>

                {/* Connections */}
                <TableCell className="py-4">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </TableCell>

                {/* Revenue */}
                <TableCell className="py-4">
                  <Skeleton className="h-4 w-20" />
                </TableCell>

                {/* Plan */}
                <TableCell className="py-4">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </TableCell>

                {/* Status */}
                <TableCell className="py-4">
                  <Skeleton className="h-6 w-20 rounded-full" />
                </TableCell>

                {/* Actions */}
                <TableCell className="py-4">
                  <Skeleton className="h-8 w-8 rounded" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  </div>
)

// Mobile Card Skeleton
export const MobileCardSkeleton = ({ cards = 6 }: { cards?: number }) => (
  <div className="md:hidden">
    <ScrollArea className="h-[600px] w-full">
      <div className="space-y-3 p-4">
        {Array.from({ length: cards }).map((_, index) => (
          <Card key={index} className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </div>

                {/* Owner and Plan */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>

                {/* Contact Grid */}
                <div className="space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-36" />
                  <Skeleton className="h-3 w-28" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  </div>
)

// Main Content Card Header Skeleton
export const CardHeaderSkeleton = () => (
  <CardHeader className="pb-4">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-5 w-5 rounded-full" />
    </div>
  </CardHeader>
)

// Complete Loading State Component
export const OperatorsLoadingSkeleton = () => (
  <div className="space-y-4">
    {/* Search and Filter Skeleton */}
    <SearchFilterSkeleton />
    
    {/* Action Buttons Skeleton */}
    <ActionButtonsSkeleton />
    
    {/* Main Content Skeleton */}
    <Card className="border-0 shadow-lg">
      <CardHeaderSkeleton />
      <CardContent className="p-0">
        <DesktopTableSkeleton />
        <MobileCardSkeleton />
      </CardContent>
    </Card>
  </div>
)
