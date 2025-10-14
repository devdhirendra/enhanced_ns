import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Wrench, AlertTriangle, TrendingUp, Package, Briefcase } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const StatCard = ({ title, value, icon: Icon, description, isLoading }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      <Icon className="w-4 h-4 text-gray-500" />
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <>
          <Skeleton className="h-8 w-24 mt-1" />
          <Skeleton className="h-3 w-32 mt-2" />
        </>
      ) : (
        <>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <p className="text-xs text-gray-500">{description}</p>
        </>
      )}
    </CardContent>
  </Card>
);

export default function DashboardStats({ data, isLoading }) {
  const stats = [
    {
      title: "Total Operators",
      value: data.totalOperators,
      icon: Briefcase,
      description: `${data.activeOperators} active`,
    },
    {
      title: "Total Connections",
      value: data.totalConnections,
      icon: Users,
      description: "Across all operators",
    },
    {
      title: "Active Technicians",
      value: data.activeTechnicians,
      icon: Wrench,
      description: "Currently on field",
    },
    {
      title: "Total Revenue",
      value: `₹${data.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: "All-time paid invoices",
    },
    {
      title: "Pending Payments",
      value: data.pendingPayments,
      icon: AlertTriangle,
      description: "Requires follow-up",
    },
    {
      title: "Open Complaints",
      value: data.totalComplaints,
      icon: Headphones,
      description: "Tickets needing resolution",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          description={stat.description}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
