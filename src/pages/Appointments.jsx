import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Plus, 
  Calendar, 
  Check, 
  Clock, 
  X, 
  AlertCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { format } from 'date-fns';
import { Appointment } from '@/api/entities';
import { Client } from '@/api/entities';
import { Staff } from '@/api/entities';
import { Treatment } from '@/api/entities';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';
import AppointmentForm from '../components/appointments/AppointmentForm';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState({});
  const [staff, setStaff] = useState({});
  const [treatments, setTreatments] = useState({});
  const [currentStatus, setCurrentStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'asc' });

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
      setClients(clientsData.reduce((acc, client) => ({ ...acc, [client.id]: client }), {}));
      setStaff(staffData.reduce((acc, s) => ({ ...acc, [s.id]: s }), {}));
      setTreatments(treatmentsData.reduce((acc, t) => ({ ...acc, [t.id]: t }), {}));
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800 border border-blue-200"><Clock className="w-3 h-3 mr-1" /> Scheduled</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 border border-green-200"><Check className="w-3 h-3 mr-1" /> Confirmed</Badge>;
      case 'completed':
        return <Badge className="bg-purple-100 text-purple-800 border border-purple-200"><Check className="w-3 h-3 mr-1" /> Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border border-red-200"><X className="w-3 h-3 mr-1" /> Cancelled</Badge>;
      case 'no_show':
        return <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200"><AlertCircle className="w-3 h-3 mr-1" /> No Show</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? 
      <ArrowUp className="w-4 h-4 ml-1" /> : 
      <ArrowDown className="w-4 h-4 ml-1" />;
  };

  const filteredAppointments = appointments
    .filter(app => currentStatus === 'all' || app.status === currentStatus)
    .sort((a, b) => {
      const { key, direction } = sortConfig;
      
      if (key === 'date' || key === 'time') {
        const aValue = key === 'date' ? new Date(a[key] + "T" + a.time) : new Date("2000-01-01T" + a[key]);
        const bValue = key === 'date' ? new Date(b[key] + "T" + b.time) : new Date("2000-01-01T" + b[key]);
        
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      if (key === 'client_id') {
        const aValue = clients[a[key]]?.full_name?.toLowerCase() || '';
        const bValue = clients[b[key]]?.full_name?.toLowerCase() || '';
        
        return direction === 'asc' ? 
          aValue.localeCompare(bValue) : 
          bValue.localeCompare(aValue);
      }
      
      if (key === 'treatment_id') {
        const aValue = treatments[a[key]]?.name?.toLowerCase() || '';
        const bValue = treatments[b[key]]?.name?.toLowerCase() || '';
        
        return direction === 'asc' ? 
          aValue.localeCompare(bValue) : 
          bValue.localeCompare(aValue);
      }
      
      if (key === 'staff_id') {
        const aValue = staff[a[key]]?.full_name?.toLowerCase() || '';
        const bValue = staff[b[key]]?.full_name?.toLowerCase() || '';
        
        return direction === 'asc' ? 
          aValue.localeCompare(bValue) : 
          bValue.localeCompare(aValue);
      }
      
      return 0;
    });

  const handleStatusChange = async (id, newStatus) => {
    try {
      await Appointment.update(id, { status: newStatus });
      loadData();
    } catch (error) {
      console.error("Error updating appointment status:", error);
    }
  };

  const handleAppointmentSuccess = () => {
    loadData();
    setShowAppointmentForm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Appointments</h1>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowAppointmentForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Appointment
        </Button>
      </div>

      <Tabs defaultValue="all" value={currentStatus} onValueChange={setCurrentStatus} className="mb-6">
        <TabsList className="w-full max-w-2xl grid-cols-5 grid">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>
                  <div className="flex items-center">
                    Date {getSortIcon('date')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('time')}>
                  <div className="flex items-center">
                    Time {getSortIcon('time')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('client_id')}>
                  <div className="flex items-center">
                    Client {getSortIcon('client_id')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('treatment_id')}>
                  <div className="flex items-center">
                    Treatment {getSortIcon('treatment_id')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('staff_id')}>
                  <div className="flex items-center">
                    Staff {getSortIcon('staff_id')}
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                      <span className="ml-2">Loading...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredAppointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No appointments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      {format(new Date(appointment.date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>{appointment.time}</TableCell>
                    <TableCell>{clients[appointment.client_id]?.full_name || 'Unknown'}</TableCell>
                    <TableCell>{treatments[appointment.treatment_id]?.name || 'Unknown'}</TableCell>
                    <TableCell>{staff[appointment.staff_id]?.full_name || 'Unknown'}</TableCell>
                    <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {appointment.status === 'scheduled' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                          >
                            Confirm
                          </Button>
                        )}
                        {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleStatusChange(appointment.id, 'completed')}
                          >
                            Complete
                          </Button>
                        )}
                        {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <AppointmentForm 
        isOpen={showAppointmentForm}
        onClose={() => setShowAppointmentForm(false)}
        onSuccess={handleAppointmentSuccess}
        selectedDate={new Date()}
        selectedTime="09:00"
      />
    </div>
  );
}