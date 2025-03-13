import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LightbulbIcon, TrendingUp, AlertCircle } from "lucide-react";

export default function BusinessInsights({ insights }) {
  const getIconByType = (type) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <LightbulbIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getColorByType = (type) => {
    switch (type) {
      case 'opportunity':
        return 'border-green-100 bg-green-50';
      case 'warning':
        return 'border-yellow-100 bg-yellow-50';
      default:
        return 'border-blue-100 bg-blue-50';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <LightbulbIcon className="h-5 w-5 text-amber-500" />
          Business Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <div 
            key={index} 
            className={`p-4 border rounded-lg ${getColorByType(insight.type)}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {getIconByType(insight.type)}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{insight.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                {insight.actionable && (
                  <div className="mt-2">
                    <span className="text-sm font-medium text-blue-600">
                      Recommended action: {insight.actionable}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}