import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const revenueData = [
  { month: 'Jan', revenue: 12000, operators: 15 },
  { month: 'Feb', revenue: 15000, operators: 18 },
  { month: 'Mar', revenue: 18000, operators: 22 },
  { month: 'Apr', revenue: 22000, operators: 25 },
  { month: 'May', revenue: 25000, operators: 28 },
  { month: 'Jun', revenue: 28000, operators: 30 }
];

const complaintData = [
  { type: 'Network', count: 45, color: '#ef4444' },
  { type: 'Billing', count: 25, color: '#f59e0b' },
  { type: 'Hardware', count: 20, color: '#3b82f6' },
  { type: 'Other', count: 10, color: '#10b981' }
];

export default function SystemOverview({ operators, revenue, complaints, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid lg:grid-cols-3 gap-6">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i} className="neumorphic-card border-none">
            <CardHeader>
              <div className="h-6 bg-gray-300 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-gray-300 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Revenue Trend */}
      <Card className="neumorphic-card border-none">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">Revenue Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Operator Growth */}
      <Card className="neumorphic-card border-none">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">Operator Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Bar dataKey="operators" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Complaint Distribution */}
      <Card className="neumorphic-card border-none">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">Complaint Types</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={complaintData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="count"
                label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
              >
                {complaintData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
