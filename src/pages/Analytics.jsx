import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Appointment } from '@/api/entities';
import { Client } from '@/api/entities';
import { Staff } from '@/api/entities';
import { Treatment } from '@/api/entities';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import {
  Calendar,
  DollarSign,
  Users,
  UserCheck,
  RefreshCcw,
  Download,
  TrendingUp,
  Zap,
  Clock
} from 'lucide-react';

import KPICard from '../components/analytics/KPICard';
import RevenueChart from '../components/analytics/RevenueChart';
import ServicesPieChart from '../components/analytics/ServicesPieChart';
import StaffPerformanceTable from '../components/analytics/StaffPerformanceTable';
import ClientRetentionChart from '../components/analytics/ClientRetentionChart';
import BusinessInsights from '../components/analytics/BusinessInsights';

export default function Analytics() {
  const [isLoading, setIsLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [staffData, setStaffData] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  });

  // Derived metrics
  const [kpiData, setKpiData] = useState({
    totalRevenue: 0,
    totalClients: 0,
    retentionRate: 0,
    averageTicket: 0
  });

  // Sample data for the charts
  const [revenueChartData, setRevenueChartData] = useState([]);
  const [servicesPieData, setServicesPieData] = useState([]);
  const [clientRetentionData, setClientRetentionData] = useState([]);
  const [staffPerformance, setStaffPerformance] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [appointmentsData, clientsData, staffData, treatmentsData] = await Promise.all([
        Appointment.list(),
        Client.list(),
        Staff.list(),
        Treatment.list()
      ]);

      setAppointments(appointmentsData);
      setClients(clientsData);
      setStaffData(staffData);
      setTreatments(treatmentsData);

      // Process the data for analytics
      processAnalyticsData(appointmentsData, clientsData, staffData, treatmentsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const processAnalyticsData = (appointments, clients, staff, treatments) => {
    // Create lookup tables for easier data processing
    const treatmentLookup = treatments.reduce((acc, treatment) => {
      acc[treatment.id] = treatment;
      return acc;
    }, {});

    const staffLookup = staff.reduce((acc, member) => {
      acc[member.id] = member;
      return acc;
    }, {});

    // Calculate total revenue from completed appointments
    const completedAppointments = appointments.filter(app => app.status === 'completed');
    const totalRevenue = completedAppointments.reduce(
      (sum, app) => sum + (app.payment_amount || 0), 
      0
    );

    // Calculate average ticket value
    const averageTicket = completedAppointments.length > 0 
      ? totalRevenue / completedAppointments.length 
      : 0;

    // Generate sample KPI data
    setKpiData({
      totalRevenue,
      totalClients: clients.length,
      retentionRate: 72, // Sample retention rate
      averageTicket
    });

    // Generate weekly revenue data
    const weeklyRevenueData = [
      { name: 'Week 1', revenue: 2850 },
      { name: 'Week 2', revenue: 3250 },
      { name: 'Week 3', revenue: 2950 },
      { name: 'Week 4', revenue: 4100 }
    ];
    setRevenueChartData(weeklyRevenueData);

    // Generate services breakdown
    const serviceBreakdown = [
      { name: 'Facial', value: 4200 },
      { name: 'Laser', value: 3100 },
      { name: 'Peel', value: 2300 },
      { name: 'Injection', value: 5600 },
      { name: 'Massage', value: 1800 }
    ];
    setServicesPieData(serviceBreakdown);

    // Generate client retention data
    const retentionData = [
      { name: 'Jan', retention: 68 },
      { name: 'Feb', retention: 71 },
      { name: 'Mar', retention: 70 },
      { name: 'Apr', retention: 72 },
      { name: 'May', retention: 74 },
      { name: 'Jun', retention: 78 }
    ];
    setClientRetentionData(retentionData);

    // Generate staff performance data
    const staffPerformanceData = [
      {
        id: 1,
        name: 'Dr. Sarah Johnson',
        role: 'Doctor',
        appointments: 87,
        appointmentsTrend: 12,
        revenue: 12450,
        revenueTrend: 8,
        retention: 82,
        retentionTrend: 5,
        rating: 4.9
      },
      {
        id: 2,
        name: 'Emma Williams',
        role: 'Therapist',
        appointments: 62,
        appointmentsTrend: -3,
        revenue: 7800,
        revenueTrend: 2,
        retention: 76,
        retentionTrend: 1,
        rating: 4.7
      },
      {
        id: 3,
        name: 'Michael Brown',
        role: 'Therapist',
        appointments: 45,
        appointmentsTrend: 5,
        revenue: 5900,
        revenueTrend: 6,
        retention: 70,
        retentionTrend: 0,
        rating: 4.5
      }
    ];
    setStaffPerformance(staffPerformanceData);
  };

  // Generate business insights
  const businessInsights = [
    {
      type: 'opportunity',
      title: 'Facial treatments are your highest revenue service',
      description: 'Your facial treatments category generates 25% more revenue than other services. Consider expanding this offering with premium options.',
      actionable: 'Develop 2-3 premium facial treatment options.'
    },
    {
      type: 'info',
      title: 'Client retention trends are improving',
      description: 'Your client retention rate has increased 6% over the last 3 months, indicating improved client satisfaction.',
      actionable: 'Continue current customer service quality initiatives.'
    },
    {
      type: 'warning',
      title: 'Tuesday afternoons show low booking rates',
      description: 'Tuesday afternoons (2-5pm) consistently have 40% lower booking rates than other weekday afternoons.',
      actionable: 'Consider running a special promotion for Tuesday afternoon slots.'
    }
  ];

  const exportToCSV = () => {
    // In a real implementation, this would generate a CSV file with analytics data
    alert('Analytics data export functionality would be implemented here');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Business Analytics</h1>
          <p className="text-gray-500">View performance metrics and business insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={loadData} disabled={isLoading}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Revenue" 
          value={kpiData.totalRevenue} 
          icon={DollarSign} 
          change={8.2} 
          changeType="positive" 
          format="currency" 
        />
        <KPICard 
          title="Client Count" 
          value={kpiData.totalClients} 
          icon={Users} 
          change={5.1} 
          changeType="positive" 
          format="number" 
        />
        <KPICard 
          title="Retention Rate" 
          value={kpiData.retentionRate} 
          icon={UserCheck} 
          change={3.7} 
          changeType="positive" 
          format="percentage" 
        />
        <KPICard 
          title="Average Ticket" 
          value={kpiData.averageTicket} 
          icon={TrendingUp} 
          change={2.3} 
          changeType="positive" 
          format="currency" 
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RevenueChart data={revenueChartData} comparisonPercentage={8.2} />
        <ServicesPieChart data={servicesPieData} />
      </div>

      {/* Staff Performance and Client Retention */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ClientRetentionChart data={clientRetentionData} />
        <StaffPerformanceTable staffPerformance={staffPerformance} />
      </div>

      {/* Business Insights */}
      <div className="mt-6">
        <BusinessInsights insights={businessInsights} />
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <div className="text-gray-700 font-medium">Loading analytics data...</div>
          </div>
        </div>
      )}
    </div>
  );
}