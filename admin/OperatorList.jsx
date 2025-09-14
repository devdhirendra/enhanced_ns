import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Link } from "react-router-dom"
import { createPageUrl } from "@/lib/utils" // Fixed import path from @/utils to @/lib/utils where createPageUrl is actually exported
import { MoreHorizontal } from "lucide-react"
import { format } from "date-fns"

const StatusBadge = ({ status }) => {
  const variants = {
    active: "bg-green-100 text-green-800",
    suspended: "bg-yellow-100 text-yellow-800",
    expired: "bg-red-100 text-red-800",
  }

  return <Badge className={`${variants[status] || variants.active} border-none`}>{status}</Badge>
}

export default function OperatorsList({ operators, isLoading, showAll = true }) {
  return (
    <Card className="neumorphic-card border-none">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-gray-800">
          {showAll ? "All Operators" : "Recent Operators"}
        </CardTitle>
        {!showAll && (
          <Link to={createPageUrl("OperatorManagement")}>
            <Button variant="ghost" size="sm" className="neumorphic-button text-blue-600">
              View All
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading
            ? Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="neumorphic-inset p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                ))
            : operators.map((operator) => (
                <div key={operator.id} className="neumorphic-inset p-4 rounded-lg hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="neumorphic-button w-12 h-12 rounded-full flex items-center justify-center bg-blue-100">
                        <span className="text-sm font-medium text-blue-700">
                          {operator.company_name?.charAt(0) || "O"}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-800">{operator.company_name}</h4>
                        <p className="text-xs text-gray-500">{operator.owner_name}</p>
                        <p className="text-xs text-gray-500">{operator.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <StatusBadge status={operator.status} />
                      <div className="text-right">
                        <p className="text-xs text-gray-500">₹{operator.revenue || 0}</p>
                        <p className="text-xs text-gray-400">
                          {operator.created_date && format(new Date(operator.created_date), "MMM d")}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="neumorphic-button">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </CardContent>
    </Card>
  )
}
