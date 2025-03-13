import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { format } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock } from "lucide-react";
import { Client } from "@/api/entities";
import { Staff } from "@/api/entities";
import { Treatment } from "@/api/entities";
import { Appointment } from "@/api/entities";

export default function AppointmentForm({ isOpen, onClose, onSuccess, selectedDate, selectedTime }) {
  const [clients, setClients] = useState([]);
  const [staff, setStaff] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    client_id: "",
    treatment_id: "",
    staff_id: "",
    date: selectedDate || new Date(),
    time: selectedTime || "09:00",
    notes: "",
    status: "scheduled",
    payment_status: "pending"
  });

  useEffect(() => {
    loadFormData();
  }, []);
  
  useEffect(() => {
    // Update form if props change
    if (selectedDate) {
      setFormData(prev => ({ ...prev, date: selectedDate }));
    }
    if (selectedTime) {
      setFormData(prev => ({ ...prev, time: selectedTime }));
    }
  }, [selectedDate, selectedTime]);

  const loadFormData = async () => {
    try {
      const [clientsData, staffData, treatmentsData] = await Promise.all([
        Client.list(),
        Staff.list(),
        Treatment.list()
      ]);
      
      setClients(clientsData);
      setStaff(staffData);
      setTreatments(treatmentsData);
    } catch (error) {
      console.error("Error loading form data:", error);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const appointment = {
        ...formData,
        date: format(formData.date, 'yyyy-MM-dd')
      };
      
      await Appointment.create(appointment);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating appointment:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generate time slots from 8am to 8pm in 30-minute intervals
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 20; hour++) {
      for (let minute of ['00', '30']) {
        slots.push(`${hour.toString().padStart(2, '0')}:${minute}`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule New Appointment</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="client">Client</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => handleChange('client_id', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="treatment">Treatment</Label>
              <Select
                value={formData.treatment_id}
                onValueChange={(value) => handleChange('treatment_id', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a treatment" />
                </SelectTrigger>
                <SelectContent>
                  {treatments.map((treatment) => (
                    <SelectItem key={treatment.id} value={treatment.id}>
                      {treatment.name} ({treatment.duration} min - ${treatment.price})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="staff">Staff Member</Label>
              <Select
                value={formData.staff_id}
                onValueChange={(value) => handleChange('staff_id', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.full_name} ({person.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-left font-normal"
                      type="button"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? (
                        format(formData.date, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => handleChange('date', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="grid gap-2">
                <Label>Time</Label>
                <Select
                  value={formData.time}
                  onValueChange={(value) => handleChange('time', value)}
                >
                  <SelectTrigger>
                    <SelectValue>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        {formData.time}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Add any additional notes here..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Scheduling..." : "Schedule Appointment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}