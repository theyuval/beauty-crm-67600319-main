import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUp, ArrowDown } from "lucide-react";

export default function RevenueChart({ data, comparisonPercentage }) {
  const formatCurrency = (value) => {
    return `$${value.toFixed(2)}`;
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-medium">Revenue Overview</CardTitle>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <span className={comparisonPercentage >= 0 ? "text-green-600" : "text-red-600"}>
              {comparisonPercentage >= 0 ? (
                <ArrowUp className="h-4 w-4 inline mr-1" />
              ) : (
                <ArrowDown className="h-4 w-4 inline mr-1" />
              )}
              {Math.abs(comparisonPercentage)}% from previous period
            </span>
          </div>
        </div>
        <Tabs defaultValue="weekly">
          <TabsList className="grid w-32 grid-cols-2">
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tickFormatter={formatCurrency}
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip 
                formatter={(value) => [`${formatCurrency(value)}`, 'Revenue']}
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}
              />
              <Bar 
                dataKey="revenue" 
                fill="url(#colorRevenue)" 
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}