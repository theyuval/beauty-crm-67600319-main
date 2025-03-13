import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from 'date-fns';
import { Client } from '@/api/entities';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";

export default function ClientForm({ isOpen, onClose, onSuccess, clientToEdit = null }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [client, setClient] = useState(clientToEdit || {
    full_name: '',
    email: '',
    phone: '',
    birth_date: '',
    skin_type: '',
    concerns: [],
    allergies: '',
    notes: '',
    customer_since: new Date().toISOString().split('T')[0]
  });
  const [birthDate, setBirthDate] = useState(clientToEdit?.birth_date ? new Date(clientToEdit.birth_date) : null);

  const concernOptions = [
    { id: 'acne', label: 'Acne' },
    { id: 'aging', label: 'Aging/Wrinkles' },
    { id: 'pigmentation', label: 'Pigmentation' },
    { id: 'sensitivity', label: 'Sensitivity' },
    { id: 'redness', label: 'Redness' },
    { id: 'dehydration', label: 'Dehydration' },
    { id: 'sun_damage', label: 'Sun Damage' },
    { id: 'texture', label: 'Texture' },
    { id: 'fine_lines', label: 'Fine Lines' },
    { id: 'other', label: 'Other' }
  ];

  const handleInputChange = (field, value) => {
    setClient(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBirthDateChange = (date) => {
    setBirthDate(date);
    if (date) {
      handleInputChange('birth_date', date.toISOString().split('T')[0]);
    } else {
      handleInputChange('birth_date', '');
    }
  };

  const handleConcernChange = (id, checked) => {
    if (checked) {
      handleInputChange('concerns', [...(client.concerns || []), id]);
    } else {
      handleInputChange('concerns', (client.concerns || []).filter(c => c !== id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (clientToEdit) {
        await Client.update(clientToEdit.id, client);
      } else {
        await Client.create(client);
      }
      
      onSuccess();
    } catch (error) {
      console.error("Error saving client:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{clientToEdit ? 'Edit Client' : 'Add New Client'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="grid gap-3">
              <h3 className="text-sm font-medium">Basic Information</h3>
              
              <div className="grid gap-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={client.full_name || ''}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={client.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={client.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="birth_date">Birth Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="birth_date"
                        variant={"outline"}
                        className={
                          !birthDate && "text-muted-foreground"
                        }
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {birthDate ? format(birthDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={birthDate}
                        onSelect={handleBirthDateChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="skin_type">Skin Type</Label>
                  <Select
                    value={client.skin_type || ''}
                    onValueChange={(value) => handleInputChange('skin_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select skin type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="dry">Dry</SelectItem>
                      <SelectItem value="oily">Oily</SelectItem>
                      <SelectItem value="combination">Combination</SelectItem>
                      <SelectItem value="sensitive">Sensitive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="grid gap-3">
              <h3 className="text-sm font-medium">Skin Concerns</h3>
              <div className="grid grid-cols-2 gap-2">
                {concernOptions.map((concern) => (
                  <div key={concern.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={concern.id}
                      checked={(client.concerns || []).includes(concern.id)}
                      onCheckedChange={(checked) => handleConcernChange(concern.id, checked)}
                    />
                    <Label htmlFor={concern.id}>{concern.label}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid gap-3">
              <h3 className="text-sm font-medium">Additional Information</h3>
              
              <div className="grid gap-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Input
                  id="allergies"
                  value={client.allergies || ''}
                  onChange={(e) => handleInputChange('allergies', e.target.value)}
                  placeholder="List any known allergies or sensitivities"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={client.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Add any additional notes about the client"
                  rows={3}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {clientToEdit ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                clientToEdit ? 'Update Client' : 'Create Client'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}