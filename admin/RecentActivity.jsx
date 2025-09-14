import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistance } from "date-fns";
import { Users, Headphones, DollarSign, Package } from "lucide-react";

const ActivityIcon = ({ type }) => {
  const icons = {
    operator: Users,
    complaint: Headphones,
    payment: DollarSign,
    inventory: Package
  };
  
  const Icon = icons[type] || Users;
  return <Icon className="w-4 h-4" />;
};

const StatusBadge = ({ status }) => {
  const variants = {
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800", 
    error: "bg-red-100 text-red-800"
  };
  
  return (
    <div className={`px-2 py-1 rounded-full text-xs ${variants[status] || variants.success}`}>
      {status}
    </div>
  );
};

export default function RecentActivity({ activities, isLoading }) {
  return (
    <Card className="neumorphic-card border-none h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))
          ) : (
            activities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 neumorphic-inset rounded-lg">
                <div className="neumorphic-button w-8 h-8 rounded-full flex items-center justify-center bg-blue-100">
                  <ActivityIcon type={activity.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 font-medium">{activity.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      {formatDistance(new Date(activity.time), new Date(), { addSuffix: true })}
                    </p>
                    <StatusBadge status={activity.status} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
