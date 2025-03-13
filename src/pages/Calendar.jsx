import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from 'date-fns';
import { Appointment } from '@/api/entities';
import { Client } from '@/api/entities';
import { Staff } from '@/api/entities';
import { Treatment } from '@/api/entities';
import AppointmentForm from '../components/appointments/AppointmentForm';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState({});
  const [staff, setStaff] = useState({});
  const [treatments, setTreatments] = useState({});
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState({
    date: null,
    time: null
  });

  useEffect(() => {
    loadData();
  }, [currentDate]);

  const loadData = async () => {
    // Load appointments for the current week
    const start = startOfWeek(currentDate);
    const end = endOfWeek(currentDate);
    const appointmentsData = await Appointment.list();
    setAppointments(appointmentsData);

    // Load related data
    const clientsData = await Client.list();
    const staffData = await Staff.list();
    const treatmentsData = await Treatment.list();

    // Convert to lookup objects
    setClients(clientsData.reduce((acc, client) => ({ ...acc, [client.id]: client }), {}));
    setStaff(staffData.reduce((acc, s) => ({ ...acc, [s.id]: s }), {}));
    setTreatments(treatmentsData.reduce((acc, t) => ({ ...acc, [t.id]: t }), {}));
  };

  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentDate),
    end: endOfWeek(currentDate)
  });

  const getAppointmentsForDay = (date) => {
    return appointments.filter(app => 
      format(new Date(app.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const timeSlots = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

  const handleNewAppointment = () => {
    setSelectedTimeSlot({
      date: new Date(),
      time: "09:00"
    });
    setShowAppointmentForm(true);
  };

  const handleTimeSlotClick = (date, time) => {
    setSelectedTimeSlot({
      date,
      time
    });
    setShowAppointmentForm(true);
  };

  const handleAppointmentSuccess = () => {
    loadData();
  };

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Calendar</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="text-lg font-medium">
              {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
            </span>
          </div>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={handleNewAppointment}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Appointment
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-8 border-b">
          <div className="p-4 border-r bg-gray-50"></div>
          {weekDays.map((day, i) => (
            <div
              key={i}
              className="p-4 text-center border-r last:border-r-0 bg-gray-50"
            >
              <div className="font-medium">{format(day, 'EEE')}</div>
              <div className="text-sm text-gray-500">{format(day, 'MMM d')}</div>
            </div>
          ))}
        </div>

        <div className="relative">
          <div className="grid grid-cols-8">
            <div className="border-r">
              {timeSlots.map((time, i) => (
                <div key={i} className="h-20 border-b p-2 text-sm text-gray-500">
                  {time}
                </div>
              ))}
            </div>

            {weekDays.map((day, dayIndex) => (
              <div key={dayIndex} className="border-r last:border-r-0">
                {timeSlots.map((time, timeIndex) => {
                  const dayAppointments = getAppointmentsForDay(day).filter(
                    app => app.time.startsWith(time)
                  );

                  return (
                    <div 
                      key={timeIndex} 
                      className="h-20 border-b p-2 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleTimeSlotClick(day, time)}
                    >
                      {dayAppointments.map((app, i) => (
                        <div
                          key={i}
                          className="bg-blue-100 text-blue-800 p-2 rounded text-sm mb-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="font-medium">
                            {clients[app.client_id]?.full_name}
                          </div>
                          <div className="text-xs">
                            {treatments[app.treatment_id]?.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Card>

      <AppointmentForm 
        isOpen={showAppointmentForm}
        onClose={() => setShowAppointmentForm(false)}
        onSuccess={handleAppointmentSuccess}
        selectedDate={selectedTimeSlot.date}
        selectedTime={selectedTimeSlot.time}
      />
    </div>
  );
}