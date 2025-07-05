'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type LucideIcon, DollarSign, Package, Archive, TrendingDown, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export type InventoryStats = {
  totalProducts: number;
  totalQuantity: number;
  totalPurchaseValue: number;
  totalSellingValue: number;
  lowStockCount: number;
  expiringSoonCount: number;
};

interface InventoryDashboardProps {
  stats: InventoryStats | undefined;
  isLoading: boolean;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  isLoading: boolean;
}

const StatCard = ({ title, value, icon: Icon, description, isLoading }: StatCardProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
          <div className="mt-1 h-4 w-32 animate-pulse rounded-md bg-muted" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
};


export function InventoryDashboard({ stats, isLoading }: InventoryDashboardProps) {
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return '₱0.00';
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
  };

  const dashboardStats: Omit<StatCardProps, 'isLoading'>[] = [
    { title: "Total Products", value: stats?.totalProducts ?? 0, icon: Package, description: "Number of unique items" },
    { title: "Total Units", value: stats?.totalQuantity ?? 0, icon: Archive, description: "Total quantity of all items" },
    { title: "Total Purchase Value", value: formatCurrency(stats?.totalPurchaseValue), icon: DollarSign, description: "Based on purchase price" },
    { title: "Total Selling Value", value: formatCurrency(stats?.totalSellingValue), icon: DollarSign, description: "Based on selling price" },
    { title: "Low Stock Items", value: stats?.lowStockCount ?? 0, icon: TrendingDown, description: "Items at or below reorder level" },
    { title: "Expiring Soon", value: stats?.expiringSoonCount ?? 0, icon: AlertTriangle, description: "Items expiring in next 30 days" },
  ];

  const chartData = [
    { name: 'Overview', "Total Products": stats?.totalProducts ?? 0, "Low Stock": stats?.lowStockCount ?? 0, "Expiring Soon": stats?.expiringSoonCount ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {dashboardStats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            description={stat.description}
            isLoading={isLoading}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  borderColor: 'hsl(var(--border))' 
                }}
              />
              <Legend />
              <Bar dataKey="Total Products" fill="#8884d8" />
              <Bar dataKey="Low Stock" fill="#82ca9d" />
              <Bar dataKey="Expiring Soon" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
} 