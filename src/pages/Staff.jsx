import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
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
  User, 
  Mail, 
  Phone, 
  Edit, 
  Trash2, 
  Clock,
  X,
  Check,
  Briefcase
} from 'lucide-react';
import { Staff } from '@/api/entities';
import { Badge } from '@/components/ui/badge';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function StaffPage() {
  const [staffMembers, setStaffMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [currentStaff, setCurrentStaff] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'therapist',
    specialties: [],
    working_hours: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      sunday: []
    },
    status: 'active'
  });

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'sunday'];

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    setIsLoading(true);
    try {
      const data = await Staff.list();
      setStaffMembers(data);
    } catch (error) {
      console.error("Error loading staff:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewStaff = () => {
    setCurrentStaff(null);
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      role: 'therapist',
      specialties: [],
      working_hours: {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        sunday: []
      },
      status: 'active'
    });
    setShowStaffForm(true);
  };

  const handleEditStaff = (staff) => {
    setCurrentStaff(staff);
    
    // Convert working_hours to the expected format for the form
    const workingHours = {};
    daysOfWeek.forEach(day => {
      workingHours[day] = staff.working_hours?.[day] || [];
    });
    
    setFormData({
      full_name: staff.full_name,
      email: staff.email,
      phone: staff.phone || '',
      role: staff.role,
      specialties: staff.specialties || [],
      working_hours: workingHours,
      status: staff.status || 'active'
    });
    
    setShowStaffForm(true);
  };

  const handleDeleteStaff = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        await Staff.delete(id);
        loadStaff();
      } catch (error) {
        console.error("Error deleting staff member:", error);
      }
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSpecialtiesChange = (e) => {
    const value = e.target.value.trim();
    if (value && !formData.specialties.includes(value)) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, value]
      }));
      e.target.value = '';
    }
  };

  const removeSpecialty = (specialty) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }));
  };

  const handleWorkingHoursChange = (day, value) => {
    setFormData(prev => ({
      ...prev,
      working_hours: {
        ...prev.working_hours,
        [day]: [value]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (currentStaff) {
        await Staff.update(currentStaff.id, formData);
      } else {
        await Staff.create(formData);
      }
      setShowStaffForm(false);
      loadStaff();
    } catch (error) {
      console.error("Error saving staff member:", error);
    }
  };

  const getRoleBadge = (role) => {
    const roles = {
      'therapist': 'bg-blue-100 text-blue-800',
      'doctor': 'bg-purple-100 text-purple-800',
      'nurse': 'bg-green-100 text-green-800',
      'receptionist': 'bg-yellow-100 text-yellow-800',
      'manager': 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={roles[role] || 'bg-gray-100 text-gray-800'}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><Check className="w-3 h-3 mr-1" /> Active</Badge>;
      case 'on_leave':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> On Leave</Badge>;
      case 'terminated':
        return <Badge className="bg-red-100 text-red-800"><X className="w-3 h-3 mr-1" /> Terminated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Staff</h1>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={handleNewStaff}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Specialties</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                      <span className="ml-2">Loading...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : staffMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No staff members found
                  </TableCell>
                </TableRow>
              ) : (
                staffMembers.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        {staff.full_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{staff.email}</span>
                        </div>
                        {staff.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">{staff.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(staff.role)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {staff.specialties?.map((specialty, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(staff.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleEditStaff(staff)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteStaff(staff.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Staff Form Dialog */}
      <Dialog open={showStaffForm} onOpenChange={setShowStaffForm}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentStaff ? "Edit Staff Member" : "Add New Staff Member"}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleFormChange('full_name', e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleFormChange('phone', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleFormChange('role', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="therapist">Therapist</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="nurse">Nurse</SelectItem>
                      <SelectItem value="receptionist">Receptionist</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleFormChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="specialties">Specialties</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.specialties.map((specialty, index) => (
                    <Badge key={index} className="flex items-center gap-1 py-1">
                      {specialty}
                      <button 
                        type="button"
                        onClick={() => removeSpecialty(specialty)}
                        className="text-xs font-bold hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    id="specialties"
                    placeholder="Add a specialty and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSpecialtiesChange(e);
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    onClick={(e) => handleSpecialtiesChange({ target: document.getElementById('specialties') })}
                  >
                    Add
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label>Working Hours</Label>
                <Accordion type="single" collapsible className="w-full border rounded-lg">
                  {daysOfWeek.map((day) => (
                    <AccordionItem key={day} value={day}>
                      <AccordionTrigger className="px-4 py-2 text-sm capitalize">
                        {day}
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="flex gap-2 items-center">
                          <Input
                            placeholder="e.g. 09:00-17:00"
                            value={formData.working_hours?.[day]?.[0] || ""}
                            onChange={(e) => handleWorkingHoursChange(day, e.target.value)}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowStaffForm(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {currentStaff ? "Update Staff" : "Add Staff"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}