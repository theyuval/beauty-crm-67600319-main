import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Users, 
  Star, 
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

export default function StaffPerformanceTable({ staffPerformance }) {
  const getTrendIcon = (value) => {
    if (value > 0) return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    if (value < 0) return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getTrendClass = (value) => {
    if (value > 0) return "text-green-500";
    if (value < 0) return "text-red-500";
    return "text-gray-500";
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Staff Performance</CardTitle>
        <Badge variant="outline" className="flex gap-1 items-center">
          <Users className="h-3.5 w-3.5" />
          {staffPerformance.length} Members
        </Badge>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff Member</TableHead>
              <TableHead>Appointments</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Client Retention</TableHead>
              <TableHead>Rating</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffPerformance.map((staff) => (
              <TableRow key={staff.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {staff.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{staff.name}</div>
                      <div className="text-xs text-gray-500">{staff.role}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{staff.appointments}</span>
                    <span className={getTrendClass(staff.appointmentsTrend)}>
                      {getTrendIcon(staff.appointmentsTrend)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>${staff.revenue.toLocaleString()}</span>
                    <span className={getTrendClass(staff.revenueTrend)}>
                      {getTrendIcon(staff.revenueTrend)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{staff.retention}%</span>
                      {staff.retentionTrend > 0 ? (
                        <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                      ) : staff.retentionTrend < 0 ? (
                        <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                      ) : null}
                    </div>
                    <Progress value={staff.retention} className="h-1.5" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{staff.rating}</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}