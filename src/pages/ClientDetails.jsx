import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Calendar, 
  Edit, 
  User, 
  Phone, 
  Mail, 
  Clock, 
  PlusCircle,
  Camera,
  Upload,
  Star,
  Trash,
  History,
  FileText,
  AlarmClock,
  ShoppingBag
} from 'lucide-react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Client } from '@/api/entities';
import { Appointment } from '@/api/entities';
import { Treatment } from '@/api/entities';
import { TreatmentHistory } from '@/api/entities';
import { UploadFile } from '@/api/integrations';

export default function ClientDetails() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const clientId = urlParams.get('id');
  
  const [client, setClient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [treatmentHistory, setTreatmentHistory] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [editNotes, setEditNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [photoDescription, setPhotoDescription] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showSkinHistoryDialog, setShowSkinHistoryDialog] = useState(false);
  const [newSkinType, setNewSkinType] = useState("normal");
  const [skinNotes, setSkinNotes] = useState("");
  const [showRoutineDialog, setShowRoutineDialog] = useState(false);
  const [routineType, setRoutineType] = useState("morning");
  const [routineItem, setRoutineItem] = useState("");
  
  useEffect(() => {
    if (clientId) {
      loadClientData();
    } else {
      navigate(createPageUrl('Clients'));
    }
  }, [clientId]);

  const loadClientData = async () => {
    setLoading(true);
    try {
      // Load client, appointments, and treatments
      const [clientData, appointmentsData, treatmentHistoryData, treatmentsData] = await Promise.all([
        Client.list().then(clients => clients.find(c => c.id === clientId)),
        Appointment.list().then(appointments => appointments.filter(a => a.client_id === clientId)),
        TreatmentHistory.list().then(history => history.filter(h => h.client_id === clientId)),
        Treatment.list()
      ]);
      
      if (!clientData) {
        navigate(createPageUrl('Clients'));
        return;
      }
      
      setClient(clientData);
      setAppointments(appointmentsData);
      setTreatmentHistory(treatmentHistoryData);
      setTreatments(treatmentsData);
      setNotes(clientData.notes || "");
      
    } catch (error) {
      console.error("Error loading client data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotesUpdate = async () => {
    try {
      await Client.update(clientId, { notes });
      setEditNotes(false);
      loadClientData();
    } catch (error) {
      console.error("Error updating notes:", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProgressPhoto = async () => {
    if (!photoFile) return;
    
    setUploadingPhoto(true);
    try {
      // Upload the file
      const { file_url } = await UploadFile({ file: photoFile });
      
      // Update client data with the new photo
      const newProgressPhotos = [
        ...(client.progress_photos || []),
        {
          url: file_url,
          date: new Date().toISOString().split('T')[0],
          description: photoDescription
        }
      ];
      
      await Client.update(clientId, { progress_photos: newProgressPhotos });
      
      // Reset states
      setPhotoFile(null);
      setPhotoPreview(null);
      setPhotoDescription("");
      setShowPhotoDialog(false);
      
      // Reload client data
      loadClientData();
    } catch (error) {
      console.error("Error uploading photo:", error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const addSkinTypeHistory = async () => {
    try {
      const newSkinHistory = [
        ...(client.skin_type_history || []),
        {
          date: new Date().toISOString().split('T')[0],
          skin_type: newSkinType,
          notes: skinNotes
        }
      ];
      
      await Client.update(clientId, { 
        skin_type_history: newSkinHistory,
        skin_type: newSkinType // Also update current skin type
      });
      
      setShowSkinHistoryDialog(false);
      setSkinNotes("");
      loadClientData();
    } catch (error) {
      console.error("Error updating skin history:", error);
    }
  };

  const addRoutineItem = async () => {
    if (!routineItem.trim()) return;
    
    try {
      const currentRoutine = client.treatment_routine || {
        morning: [],
        evening: [],
        weekly: [],
        notes: ""
      };
      
      const updatedRoutine = {
        ...currentRoutine,
        [routineType]: [...(currentRoutine[routineType] || []), routineItem]
      };
      
      await Client.update(clientId, { treatment_routine: updatedRoutine });
      
      setRoutineItem("");
      setShowRoutineDialog(false);
      loadClientData();
    } catch (error) {
      console.error("Error updating routine:", error);
    }
  };

  const removeRoutineItem = async (type, index) => {
    try {
      const currentRoutine = client.treatment_routine || {
        morning: [],
        evening: [],
        weekly: [],
        notes: ""
      };
      
      const updatedRoutine = {
        ...currentRoutine,
        [type]: currentRoutine[type].filter((_, i) => i !== index)
      };
      
      await Client.update(clientId, { treatment_routine: updatedRoutine });
      loadClientData();
    } catch (error) {
      console.error("Error removing routine item:", error);
    }
  };

  const updateRoutineNotes = async (notes) => {
    try {
      const currentRoutine = client.treatment_routine || {
        morning: [],
        evening: [],
        weekly: [],
        notes: ""
      };
      
      const updatedRoutine = {
        ...currentRoutine,
        notes
      };
      
      await Client.update(clientId, { treatment_routine: updatedRoutine });
      loadClientData();
    } catch (error) {
      console.error("Error updating routine notes:", error);
    }
  };

  const deleteProgressPhoto = async (index) => {
    if (!window.confirm("Are you sure you want to delete this photo?")) return;
    
    try {
      const updatedPhotos = (client.progress_photos || []).filter((_, i) => i !== index);
      await Client.update(clientId, { progress_photos: updatedPhotos });
      loadClientData();
    } catch (error) {
      console.error("Error deleting photo:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold mb-4">Client Not Found</h2>
        <Button onClick={() => navigate(createPageUrl('Clients'))}>Back to Clients</Button>
      </div>
    );
  }

  // Get initials for avatar fallback
  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => navigate(createPageUrl('Clients'))}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Client Details</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Client overview panel */}
        <div className="md:w-1/3">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={client.profile_photo} alt={client.full_name} />
                  <AvatarFallback className="text-lg bg-blue-100 text-blue-600">
                    {getInitials(client.full_name)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{client.full_name}</h2>
                
                <div className="flex items-center mt-1 text-gray-500">
                  <Star className="h-4 w-4 mr-1 text-amber-400" />
                  <span>
                    {client.loyalty_points ? `${client.loyalty_points} points` : 'No loyalty points'}
                  </span>
                </div>
                
                <div className="mt-4 space-y-3 w-full">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="flex-1 text-left">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="flex-1 text-left">{client.phone}</span>
                  </div>
                  {client.birth_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="flex-1 text-left">
                        {format(new Date(client.birth_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                  {client.last_visit && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="flex-1 text-left">
                        Last visit: {format(new Date(client.last_visit), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => navigate(createPageUrl('Calendar'))}
                  >
                    <Calendar className="h-4 w-4" />
                    Book Appointment
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => navigate(createPageUrl('ClientAI'))}
                  >
                    <Mail className="h-4 w-4" />
                    Send Message
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs area */}
        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="treatments">Treatments</TabsTrigger>
              <TabsTrigger value="photos">Progress Photos</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Skin Profile</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowSkinHistoryDialog(true)}
                  >
                    <History className="h-4 w-4 mr-2" />
                    Update
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <div className="bg-blue-50 px-3 py-1.5 rounded-lg flex items-center">
                      <span className="text-sm text-blue-800 font-medium mr-2">Skin Type:</span>
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{client.skin_type || 'Not specified'}</Badge>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Concerns:</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {client.concerns?.map((concern, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary"
                          className="capitalize"
                        >
                          {concern.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                      {(!client.concerns || client.concerns.length === 0) && (
                        <span className="text-sm text-gray-500">No concerns specified</span>
                      )}
                    </div>
                  </div>
                  
                  {client.skin_type_history && client.skin_type_history.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Skin Type History:</h3>
                      <div className="space-y-2">
                        {client.skin_type_history.slice().reverse().map((entry, index) => (
                          <div key={index} className="border-l-2 border-blue-200 pl-4 py-1">
                            <div className="flex justify-between">
                              <span className="font-medium">{entry.skin_type}</span>
                              <span className="text-gray-500 text-sm">{entry.date}</span>
                            </div>
                            {entry.notes && <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Treatment Routine</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowRoutineDialog(true)}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {client.treatment_routine ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-amber-50">
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm">Morning Routine</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-2">
                            {client.treatment_routine.morning?.length > 0 ? (
                              <ul className="space-y-2">
                                {client.treatment_routine.morning.map((item, i) => (
                                  <li key={i} className="flex justify-between items-center">
                                    <span className="text-sm">{item}</span>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-6 w-6" 
                                      onClick={() => removeRoutineItem('morning', i)}
                                    >
                                      <Trash className="h-3 w-3 text-gray-500" />
                                    </Button>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-500">No morning routine</p>
                            )}
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-indigo-50">
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm">Evening Routine</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-2">
                            {client.treatment_routine.evening?.length > 0 ? (
                              <ul className="space-y-2">
                                {client.treatment_routine.evening.map((item, i) => (
                                  <li key={i} className="flex justify-between items-center">
                                    <span className="text-sm">{item}</span>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-6 w-6" 
                                      onClick={() => removeRoutineItem('evening', i)}
                                    >
                                      <Trash className="h-3 w-3 text-gray-500" />
                                    </Button>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-500">No evening routine</p>
                            )}
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-green-50">
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm">Weekly Treatments</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-2">
                            {client.treatment_routine.weekly?.length > 0 ? (
                              <ul className="space-y-2">
                                {client.treatment_routine.weekly.map((item, i) => (
                                  <li key={i} className="flex justify-between items-center">
                                    <span className="text-sm">{item}</span>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-6 w-6" 
                                      onClick={() => removeRoutineItem('weekly', i)}
                                    >
                                      <Trash className="h-3 w-3 text-gray-500" />
                                    </Button>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-500">No weekly treatments</p>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="mt-4">
                        <h3 className="text-sm font-medium mb-2">Notes:</h3>
                        <div className="relative bg-gray-50 p-3 rounded-md border">
                          {editNotes ? (
                            <div className="space-y-2">
                              <Textarea 
                                value={client.treatment_routine.notes || ""} 
                                onChange={(e) => updateRoutineNotes(e.target.value)}
                                rows={3}
                              />
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => setEditNotes(false)}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  size="sm" 
                                  onClick={() => setEditNotes(false)}
                                >
                                  Save
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm pr-8">
                                {client.treatment_routine.notes || "No additional notes."}
                              </p>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="absolute top-2 right-2"
                                onClick={() => setEditNotes(true)}
                              >
                                <Edit className="h-4 w-4 text-gray-400" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500 mb-4">No treatment routine set up</p>
                      <Button onClick={() => setShowRoutineDialog(true)}>
                        Set up Routine
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Notes</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setEditNotes(!editNotes)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {editNotes ? (
                    <div className="space-y-2">
                      <Textarea 
                        value={notes} 
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes about this client..."
                        rows={5}
                      />
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setNotes(client.notes || "");
                            setEditNotes(false);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleNotesUpdate}>
                          Save Notes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">
                      {client.notes || "No notes yet for this client."}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Treatments Tab */}
            <TabsContent value="treatments">
              <Card>
                <CardHeader>
                  <CardTitle>Treatment History</CardTitle>
                  <CardDescription>
                    Record of all treatments received by the client
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {appointments.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">No treatment history recorded</p>
                      <Button onClick={() => navigate(createPageUrl('Calendar'))}>
                        Book First Appointment
                      </Button>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Treatment</TableHead>
                          <TableHead>Staff</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {appointments.sort((a, b) => new Date(b.date) - new Date(a.date)).map((appointment) => {
                          const treatment = treatments.find(t => t.id === appointment.treatment_id);
                          const history = treatmentHistory.find(h => h.appointment_id === appointment.id);
                          
                          return (
                            <TableRow key={appointment.id}>
                              <TableCell>
                                {format(new Date(appointment.date), 'MMM d, yyyy')}
                                <div className="text-xs text-gray-500">{appointment.time}</div>
                              </TableCell>
                              <TableCell>{treatment?.name || 'Unknown'}</TableCell>
                              <TableCell>{appointment.staff_id}</TableCell>
                              <TableCell>
                                <Badge className={
                                  appointment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                  appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                                  'bg-blue-100 text-blue-800'
                                }>
                                  {appointment.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {history?.notes || appointment.notes || (
                                  <span className="text-gray-400 text-sm">No notes</span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Progress Photos Tab */}
            <TabsContent value="photos">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Progress Photos</CardTitle>
                    <CardDescription>
                      Visual record of treatment progress
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowPhotoDialog(true)}>
                    <Camera className="h-4 w-4 mr-2" />
                    Add Photo
                  </Button>
                </CardHeader>
                <CardContent>
                  {(!client.progress_photos || client.progress_photos.length === 0) ? (
                    <div className="text-center py-12 border rounded-md bg-gray-50">
                      <Camera className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">No progress photos yet</p>
                      <Button variant="outline" onClick={() => setShowPhotoDialog(true)}>
                        Upload First Photo
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {client.progress_photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-md overflow-hidden border bg-gray-50 relative group">
                            <img 
                              src={photo.url} 
                              alt={`Progress photo ${index + 1}`}
                              className="object-cover w-full h-full"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <Button 
                                variant="destructive" 
                                size="icon" 
                                className="h-8 w-8 rounded-full"
                                onClick={() => deleteProgressPhoto(index)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="mt-2">
                            <p className="text-xs font-medium">{photo.date}</p>
                            <p className="text-xs text-gray-500 line-clamp-2">{photo.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Preferences Tab */}
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Client Preferences</CardTitle>
                  <CardDescription>
                    Personalized preferences for better service
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="treatments">
                      <AccordionTrigger>
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4 text-blue-500" />
                          <span>Treatment Preferences</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 p-4 bg-gray-50 rounded-md">
                          <div>
                            <h3 className="text-sm font-medium mb-2">Favorite Treatments:</h3>
                            <div className="flex flex-wrap gap-2">
                              {client.preferences?.favorite_treatments?.map((treatment, index) => (
                                <Badge key={index} variant="outline">
                                  {treatment}
                                </Badge>
                              ))}
                              {(!client.preferences?.favorite_treatments || client.preferences.favorite_treatments.length === 0) && (
                                <span className="text-sm text-gray-500">No favorite treatments specified</span>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium mb-2">Preferred Staff:</h3>
                            <div className="flex flex-wrap gap-2">
                              {client.preferences?.preferred_staff?.map((staff, index) => (
                                <Badge key={index} variant="outline">
                                  {staff}
                                </Badge>
                              ))}
                              {(!client.preferences?.preferred_staff || client.preferences.preferred_staff.length === 0) && (
                                <span className="text-sm text-gray-500">No preferred staff specified</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="communication">
                      <AccordionTrigger>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-blue-500" />
                          <span>Communication Preferences</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 p-4 bg-gray-50 rounded-md">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Preferred Communication:</span>
                            <Badge variant="outline">
                              {client.preferences?.communication_preference || "Not specified"}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Booking Preference:</span>
                            <Badge variant="outline">
                              {client.preferences?.booking_preference || "Not specified"}
                            </Badge>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="comfort">
                      <AccordionTrigger>
                        <div className="flex items-center gap-2">
                          <AlarmClock className="h-4 w-4 text-blue-500" />
                          <span>Comfort Preferences</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 p-4 bg-gray-50 rounded-md">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Relaxation Preference:</span>
                            <Badge variant="outline">
                              {client.preferences?.relaxation_preference || "Not specified"}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Temperature Preference:</span>
                            <Badge variant="outline">
                              {client.preferences?.temperature_preference || "Not specified"}
                            </Badge>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Add Progress Photo Dialog */}
      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Progress Photo</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            {photoPreview ? (
              <div className="relative w-full aspect-square rounded-md overflow-hidden border">
                <img 
                  src={photoPreview} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm" 
                  onClick={() => {
                    setPhotoFile(null);
                    setPhotoPreview(null);
                  }}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => document.getElementById('photo-upload').click()}
              >
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-500 mb-1">Click to upload a photo</p>
                <p className="text-xs text-gray-400">JPEG, PNG, or GIF</p>
                <input 
                  type="file" 
                  id="photo-upload" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="photo-description">Description</Label>
              <Textarea 
                id="photo-description" 
                placeholder="Describe the progress shown or any details about this photo..."
                value={photoDescription}
                onChange={(e) => setPhotoDescription(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setPhotoFile(null);
                setPhotoPreview(null);
                setPhotoDescription("");
                setShowPhotoDialog(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={uploadProgressPhoto} 
              disabled={!photoFile || uploadingPhoto}
            >
              {uploadingPhoto ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                "Save Photo"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Skin Type History Dialog */}
      <Dialog open={showSkinHistoryDialog} onOpenChange={setShowSkinHistoryDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Skin Type</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <div className="space-y-2">
              <Label htmlFor="skin-type">Current Skin Type</Label>
              <Select value={newSkinType} onValueChange={setNewSkinType}>
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
            
            <div className="space-y-2">
              <Label htmlFor="skin-notes">Notes</Label>
              <Textarea 
                id="skin-notes" 
                placeholder="Add any observations or reasons for the change..."
                value={skinNotes}
                onChange={(e) => setSkinNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setSkinNotes("");
                setShowSkinHistoryDialog(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={addSkinTypeHistory}>
              Update Skin Type
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Routine Item Dialog */}
      <Dialog open={showRoutineDialog} onOpenChange={setShowRoutineDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add to Treatment Routine</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <div className="space-y-2">
              <Label htmlFor="routine-type">Routine Type</Label>
              <Select value={routineType} onValueChange={setRoutineType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning Routine</SelectItem>
                  <SelectItem value="evening">Evening Routine</SelectItem>
                  <SelectItem value="weekly">Weekly Treatments</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="routine-item">Product or Treatment</Label>
              <Input 
                id="routine-item" 
                placeholder="e.g., Vitamin C Serum, Hydrating Mask..."
                value={routineItem}
                onChange={(e) => setRoutineItem(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setRoutineItem("");
                setShowRoutineDialog(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={addRoutineItem} disabled={!routineItem.trim()}>
              Add to Routine
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}