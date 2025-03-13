import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";

export default function KPICard({ title, value, icon: Icon, change, changeType, format }) {
  // Determine if change is positive, negative, or neutral
  const isPositive = change > 0;
  const isNegative = change < 0;
  const isNeutral = change === 0;
  
  // Determine the color based on change and expected trend
  const getChangeColor = () => {
    if (isNeutral) return "text-gray-500";
    
    // For some metrics, positive change is good (revenue, clients, etc.)
    if (changeType === 'positive') {
      return isPositive ? "text-green-600" : "text-red-600";
    }
    // For other metrics, negative change is good (e.g., cancellation rate)
    else if (changeType === 'negative') {
      return isNegative ? "text-green-600" : "text-red-600";
    }
    
    return isPositive ? "text-green-600" : "text-red-600";
  };
  
  // Format the value based on the type
  const formatValue = () => {
    if (format === 'currency') {
      return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (format === 'percentage') {
      return `${value}%`;
    } else if (format === 'number') {
      return value.toLocaleString();
    }
    return value;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <div className="p-2 bg-blue-50 rounded-full">
            <Icon className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-bold">{formatValue()}</span>
          {change !== null && (
            <div className={`flex items-center mt-1 ${getChangeColor()}`}>
              {isPositive ? (
                <ArrowUp className="h-4 w-4 mr-1" />
              ) : isNegative ? (
                <ArrowDown className="h-4 w-4 mr-1" />
              ) : null}
              <span className="text-sm font-medium">
                {Math.abs(change)}% {isPositive ? "increase" : isNegative ? "decrease" : ""}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}