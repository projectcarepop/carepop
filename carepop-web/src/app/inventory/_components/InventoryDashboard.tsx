'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, Archive, TrendingDown, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import React from 'react';

// Custom Peso Icon Component
const PesoSign = () => <span className="font-bold">₱</span>;

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
  icon: React.ElementType;
  description?: string;
  isLoading: boolean;
  iconColor?: string;
}

const StatCard = ({ title, value, icon: Icon, description, isLoading, iconColor }: StatCardProps) => {
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
        <Icon className="h-4 w-4" style={{ color: iconColor }} />
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
    { title: "Total Products", value: stats?.totalProducts ?? 0, icon: Package, description: "Number of unique items", iconColor: "hsl(var(--primary))" },
    { title: "Total Units", value: stats?.totalQuantity ?? 0, icon: Archive, description: "Total quantity of all items", iconColor: "hsl(var(--secondary))" },
    { title: "Low Stock Items", value: stats?.lowStockCount ?? 0, icon: TrendingDown, description: "Items at or below reorder level", iconColor: "hsl(var(--warning))" },
    { title: "Expiring Soon", value: stats?.expiringSoonCount ?? 0, icon: AlertTriangle, description: "Items expiring in next 30 days", iconColor: "hsl(var(--destructive))" },
    { title: "Total Purchase Value", value: formatCurrency(stats?.totalPurchaseValue), icon: PesoSign, description: "Based on purchase price", iconColor: "hsl(var(--info))" },
    { title: "Total Selling Value", value: formatCurrency(stats?.totalSellingValue), icon: PesoSign, description: "Potential revenue", iconColor: "hsl(var(--success))" },
  ];

  const valueDistributionData = [
    { name: 'Total Purchase Value', value: stats?.totalPurchaseValue ?? 0 },
    { name: 'Total Selling Value', value: stats?.totalSellingValue ?? 0 },
  ];
  
  const valueChartColors = ["hsl(var(--primary))", "hsl(var(--secondary))"];

  const overviewChartData = [
    { name: 'Products vs Units', "Products": stats?.totalProducts ?? 0, "Units": stats?.totalQuantity ?? 0 },
    { name: 'Issues', "Low Stock": stats?.lowStockCount ?? 0, "Expiring Soon": stats?.expiringSoonCount ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dashboardStats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            description={stat.description}
            isLoading={isLoading}
            iconColor={stat.iconColor}
          />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Inventory At-a-Glance</CardTitle>
            <CardDescription>
                A side-by-side comparison of key inventory metrics.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={overviewChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}/>
                    <Legend />
                    <Bar dataKey="Products" fill="hsl(var(--primary))" />
                    <Bar dataKey="Units" fill="hsl(var(--secondary))" />
                    <Bar dataKey="Low Stock" fill="hsl(var(--warning))" />
                    <Bar dataKey="Expiring Soon" fill="hsl(var(--destructive))" />
                </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Inventory Value Distribution</CardTitle>
                <CardDescription>
                    The split between the cost of your inventory and its potential revenue.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={valueDistributionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                        >
                            {valueDistributionData.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={valueChartColors[index % valueChartColors.length]} />
                            ))}
                        </Pie>
                         <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}/>
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>
    </div>
  );
} 