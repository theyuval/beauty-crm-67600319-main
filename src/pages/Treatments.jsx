import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Plus, 
  FileText, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  Edit, 
  Trash2 
} from 'lucide-react';
import { Treatment } from '@/api/entities';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

export default function Treatments() {
  const [treatments, setTreatments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);
  const [currentTreatment, setCurrentTreatment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    duration: 60,
    price: 0,
    description: '',
    category: 'facial',
    recovery_time: '',
    follow_up_required: false,
    follow_up_days: 30
  });

  useEffect(() => {
    loadTreatments();
  }, []);

  const loadTreatments = async () => {
    setIsLoading(true);
    try {
      const data = await Treatment.list();
      setTreatments(data);
    } catch (error) {
      console.error("Error loading treatments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewTreatment = () => {
    setCurrentTreatment(null);
    setFormData({
      name: '',
      duration: 60,
      price: 0,
      description: '',
      category: 'facial',
      recovery_time: '',
      follow_up_required: false,
      follow_up_days: 30
    });
    setShowTreatmentForm(true);
  };

  const handleEditTreatment = (treatment) => {
    setCurrentTreatment(treatment);
    setFormData({
      name: treatment.name,
      duration: treatment.duration,
      price: treatment.price,
      description: treatment.description || '',
      category: treatment.category,
      recovery_time: treatment.recovery_time || '',
      follow_up_required: treatment.follow_up_required || false,
      follow_up_days: treatment.follow_up_days || 30
    });
    setShowTreatmentForm(true);
  };

  const handleDeleteTreatment = async (id) => {
    if (window.confirm("Are you sure you want to delete this treatment?")) {
      try {
        await Treatment.delete(id);
        loadTreatments();
      } catch (error) {
        console.error("Error deleting treatment:", error);
      }
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (currentTreatment) {
        await Treatment.update(currentTreatment.id, formData);
      } else {
        await Treatment.create(formData);
      }
      setShowTreatmentForm(false);
      loadTreatments();
    } catch (error) {
      console.error("Error saving treatment:", error);
    }
  };

  const getCategoryBadge = (category) => {
    const categories = {
      'facial': 'bg-blue-100 text-blue-800',
      'laser': 'bg-red-100 text-red-800',
      'injection': 'bg-purple-100 text-purple-800',
      'peel': 'bg-green-100 text-green-800',
      'massage': 'bg-yellow-100 text-yellow-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={categories[category] || 'bg-gray-100 text-gray-800'}>
        {category.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Treatments</h1>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={handleNewTreatment}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Treatment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Treatments</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{treatments.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {treatments.length ? Math.round(treatments.reduce((sum, t) => sum + t.duration, 0) / treatments.length) : 0} min
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${treatments.length ? Math.round(treatments.reduce((sum, t) => sum + t.price, 0) / treatments.length) : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Treatment Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Follow-up</TableHead>
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
              ) : treatments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No treatments found
                  </TableCell>
                </TableRow>
              ) : (
                treatments.map((treatment) => (
                  <TableRow key={treatment.id}>
                    <TableCell className="font-medium">{treatment.name}</TableCell>
                    <TableCell>{getCategoryBadge(treatment.category)}</TableCell>
                    <TableCell>{treatment.duration} min</TableCell>
                    <TableCell>${treatment.price}</TableCell>
                    <TableCell>
                      {treatment.follow_up_required ? (
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          {treatment.follow_up_days} days
                        </div>
                      ) : "Not required"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleEditTreatment(treatment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteTreatment(treatment.id)}
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

      {/* Treatment Form Dialog */}
      <Dialog open={showTreatmentForm} onOpenChange={setShowTreatmentForm}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{currentTreatment ? "Edit Treatment" : "Add New Treatment"}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Treatment Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="5"
                    step="5"
                    value={formData.duration}
                    onChange={(e) => handleFormChange('duration', parseInt(e.target.value))}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleFormChange('price', parseFloat(e.target.value))}
                    required
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleFormChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facial">Facial</SelectItem>
                    <SelectItem value="laser">Laser</SelectItem>
                    <SelectItem value="injection">Injection</SelectItem>
                    <SelectItem value="peel">Peel</SelectItem>
                    <SelectItem value="massage">Massage</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="Description of the treatment..."
                  rows={3}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="recovery_time">Recovery Time</Label>
                <Input
                  id="recovery_time"
                  value={formData.recovery_time}
                  onChange={(e) => handleFormChange('recovery_time', e.target.value)}
                  placeholder="e.g., 2-3 days"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="follow_up"
                  checked={formData.follow_up_required}
                  onCheckedChange={(checked) => handleFormChange('follow_up_required', checked)}
                />
                <Label htmlFor="follow_up">Follow-up Required</Label>
              </div>
              
              {formData.follow_up_required && (
                <div className="grid gap-2">
                  <Label htmlFor="follow_up_days">Follow-up After (days)</Label>
                  <Input
                    id="follow_up_days"
                    type="number"
                    min="1"
                    value={formData.follow_up_days}
                    onChange={(e) => handleFormChange('follow_up_days', parseInt(e.target.value))}
                  />
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowTreatmentForm(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {currentTreatment ? "Update Treatment" : "Add Treatment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}