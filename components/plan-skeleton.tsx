import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function PlanCardSkeleton() {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <Skeleton className="h-8 w-24 mx-auto mb-2" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </CardContent>
    </Card>
  )
}

export function PlanSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PlanCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function StatsCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-10 rounded-lg" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-12 mb-2" />
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function SubscriptionTableSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  )
}
