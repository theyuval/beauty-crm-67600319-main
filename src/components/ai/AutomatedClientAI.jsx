import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  Bot, 
  Calendar, 
  MessageSquare, 
  Clock, 
  Mail, 
  Phone, 
  Edit, 
  Trash, 
  Plus,
  Play, 
  Pause,
  Copy,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { CommunicationTemplate } from "@/api/entities";
import { CommunicationLog } from "@/api/entities";
import { Treatment } from "@/api/entities";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InvokeLLM } from "@/api/integrations";
import { format } from "date-fns";

export default function AutomatedClientAI() {
  const [activeTab, setActiveTab] = useState("templates");
  const [treatments, setTreatments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [previewContent, setPreviewContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGeneratedContent, setAiGeneratedContent] = useState("");
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "follow_up",
    treatment_id: "",
    trigger_days: 1,
    channel: "sms",
    content: "",
    subject: "",
    is_automated: true,
    active: true,
    seasonal_month: "jan"
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [templatesData, treatmentsData, logsData] = await Promise.all([
        CommunicationTemplate.list(),
        Treatment.list(),
        CommunicationLog.list("-created_date", 50)
      ]);
      setTemplates(templatesData);
      setTreatments(treatmentsData);
      setLogs(logsData);
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Failed to load data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field if it exists
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }
    
    if (!formData.content.trim()) {
      errors.content = "Content is required";
    }
    
    if (formData.type === "follow_up" && !formData.treatment_id) {
      errors.treatment_id = "Treatment is required for follow-ups";
    }
    
    if (formData.channel === "email" && !formData.subject.trim()) {
      errors.subject = "Subject is required for email communications";
    }
    
    if (["follow_up", "appointment_reminder", "treatment_cycle", "re_engagement"].includes(formData.type)) {
      if (!formData.trigger_days && formData.trigger_days !== 0) {
        errors.trigger_days = "Days value is required";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateTemplate = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await CommunicationTemplate.create(formData);
      setShowTemplateDialog(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error("Error creating template:", error);
      setError("Failed to create template. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await CommunicationTemplate.update(editingTemplate.id, formData);
      setShowTemplateDialog(false);
      setEditingTemplate(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error("Error updating template:", error);
      setError("Failed to update template. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;
    
    setIsLoading(true);
    try {
      await CommunicationTemplate.delete(templateToDelete.id);
      setShowDeleteConfirm(false);
      setTemplateToDelete(null);
      loadData();
    } catch (error) {
      console.error("Error deleting template:", error);
      setError("Failed to delete template. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const editTemplate = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      treatment_id: template.treatment_id || "",
      trigger_days: template.trigger_days,
      channel: template.channel,
      content: template.content,
      subject: template.subject || "",
      is_automated: template.is_automated,
      active: template.active,
      seasonal_month: template.seasonal_month || "jan"
    });
    setShowTemplateDialog(true);
  };

  const confirmDeleteTemplate = (template) => {
    setTemplateToDelete(template);
    setShowDeleteConfirm(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "follow_up",
      treatment_id: "",
      trigger_days: 1,
      channel: "sms",
      content: "",
      subject: "",
      is_automated: true,
      active: true,
      seasonal_month: "jan"
    });
    setFormErrors({});
  };

  const createNewTemplate = () => {
    setEditingTemplate(null);
    resetForm();
    setShowTemplateDialog(true);
  };

  const previewTemplate = (template) => {
    setPreviewContent(template.content);
    setShowPreview(true);
  };

  const toggleTemplateStatus = async (template) => {
    setIsLoading(true);
    try {
      await CommunicationTemplate.update(template.id, {
        active: !template.active
      });
      loadData();
    } catch (error) {
      console.error("Error updating template status:", error);
      setError("Failed to update template status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getTemplateTypeLabel = (type) => {
    const types = {
      follow_up: "Post-treatment Follow-up",
      appointment_reminder: "Appointment Reminder",
      treatment_cycle: "Treatment Cycle",
      seasonal: "Seasonal Check-in",
      birthday: "Birthday",
      re_engagement: "Re-engagement",
      custom: "Custom"
    };
    return types[type] || type;
  };
  
  const getTemplateTypeBadgeColor = (type) => {
    const colors = {
      follow_up: "bg-blue-100 text-blue-800",
      appointment_reminder: "bg-purple-100 text-purple-800",
      treatment_cycle: "bg-green-100 text-green-800",
      seasonal: "bg-orange-100 text-orange-800",
      birthday: "bg-pink-100 text-pink-800",
      re_engagement: "bg-red-100 text-red-800",
      custom: "bg-gray-100 text-gray-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };
  
  const getChannelIcon = (channel) => {
    switch (channel) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "sms":
        return <MessageSquare className="h-4 w-4" />;
      case "whatsapp":
        return <Phone className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const generateAIContent = async () => {
    setIsGeneratingAI(true);
    setError(null);
    
    try {
      let prompt = "";
      
      switch (formData.type) {
        case "follow_up":
          const treatment = treatments.find(t => t.id === formData.treatment_id);
          prompt = `Create a concise and friendly ${formData.channel === 'sms' ? 'text message' : 'message'} for a client who received a ${treatment?.name || 'beauty treatment'} ${formData.trigger_days} days ago. 
This is a follow-up message to check how they're doing post-treatment. 
Include personalized care tips specific to this treatment.
${formData.channel === 'sms' ? 'Keep it under 160 characters.' : ''}
Use {{client_name}} as a placeholder for the client's name.`;
          break;
          
        case "appointment_reminder":
          prompt = `Create a concise and friendly ${formData.channel === 'sms' ? 'text message' : 'message'} to remind a client about their upcoming appointment ${formData.trigger_days === 1 ? 'tomorrow' : 'in a few hours'}.
Include a note to call if they need to reschedule.
${formData.channel === 'sms' ? 'Keep it under 160 characters.' : ''}
Use {{client_name}} as a placeholder for the client's name and {{appointment_time}} for their appointment time.`;
          break;
          
        case "treatment_cycle":
          prompt = `Create a concise and friendly ${formData.channel === 'sms' ? 'text message' : 'message'} to remind a client that it's time for their next treatment cycle.
Mention the benefits of maintaining regular treatment schedules.
Encourage them to book their next appointment.
${formData.channel === 'sms' ? 'Keep it under 160 characters.' : ''}
Use {{client_name}} as a placeholder for the client's name and {{treatment_name}} for the treatment.`;
          break;
          
        case "seasonal":
          const seasons = {
            jan: "winter", feb: "winter", mar: "spring", apr: "spring", 
            may: "spring", jun: "summer", jul: "summer", aug: "summer", 
            sep: "fall", oct: "fall", nov: "fall", dec: "winter"
          };
          const season = seasons[formData.seasonal_month] || "seasonal";
          
          prompt = `Create a concise and friendly ${formData.channel === 'sms' ? 'text message' : 'message'} for ${season} skincare advice.
Include specific tips related to ${season} skin concerns and how our treatments can help.
${formData.channel === 'sms' ? 'Keep it under 160 characters.' : ''}
Use {{client_name}} as a placeholder for the client's name.`;
          break;
          
        case "birthday":
          prompt = `Create a warm and personalized birthday message for a spa/beauty client.
Include a special birthday offer or discount if appropriate.
${formData.channel === 'sms' ? 'Keep it under 160 characters.' : ''}
Use {{client_name}} as a placeholder for the client's name.`;
          break;
          
        case "re_engagement":
          prompt = `Create a friendly message for a client who hasn't visited in ${formData.trigger_days} days.
Express that we miss them and would love to see them again.
Include a special offer to encourage them to return.
${formData.channel === 'sms' ? 'Keep it under 160 characters.' : ''}
Use {{client_name}} as a placeholder for the client's name.`;
          break;
          
        default:
          prompt = `Create a friendly and professional message for a spa/beauty client.
${formData.channel === 'sms' ? 'Keep it under 160 characters.' : ''}
Use {{client_name}} as a placeholder for the client's name.`;
      }
      
      if (formData.channel === "email" && !formData.subject) {
        prompt += "\nAlso suggest a subject line for this email.";
      }
      
      const result = await InvokeLLM({
        prompt,
        add_context_from_internet: false
      });
      
      // Check if we need to extract a subject line
      if (formData.channel === "email" && !formData.subject && result.includes("Subject:")) {
        const parts = result.split(/Subject:|SUBJECT:/i, 2);
        if (parts.length > 1) {
          const subject = parts[1].split("\n")[0].trim();
          setFormData(prev => ({
            ...prev,
            subject: subject
          }));
          
          // Remove the subject line from the content
          const content = result.replace(/Subject:.*\n/i, "").trim();
          setAiGeneratedContent(content);
        } else {
          setAiGeneratedContent(result);
        }
      } else {
        setAiGeneratedContent(result);
      }
      
    } catch (error) {
      console.error("Error generating content with AI:", error);
      setError("Failed to generate content with AI. Please try again.");
    } finally {
      setIsGeneratingAI(false);
    }
  };
  
  const useAIContent = () => {
    setFormData(prev => ({
      ...prev,
      content: aiGeneratedContent
    }));
    setAiGeneratedContent("");
  };

  const getSeasonalMonth = (month) => {
    const months = {
      jan: "January", feb: "February", mar: "March",
      apr: "April", may: "May", jun: "June",
      jul: "July", aug: "August", sep: "September",
      oct: "October", nov: "November", dec: "December"
    };
    return months[month] || month;
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Automated Messages</TabsTrigger>
          <TabsTrigger value="logs">Communication Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates" className="space-y-6 pt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Automated Message Templates</h2>
            <Button onClick={createNewTemplate}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Template
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Trigger</TableHead>
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
                  ) : templates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No templates found. Create your first automated message template.
                      </TableCell>
                    </TableRow>
                  ) : (
                    templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell>
                          <Badge className={getTemplateTypeBadgeColor(template.type)}>
                            {getTemplateTypeLabel(template.type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getChannelIcon(template.channel)}
                            <span className="capitalize">{template.channel}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {template.type === "follow_up" && `${template.trigger_days} days after treatment`}
                          {template.type === "appointment_reminder" && `${template.trigger_days === 1 ? "24h" : "1h"} before appointment`}
                          {template.type === "treatment_cycle" && `Every ${template.trigger_days} days`}
                          {template.type === "seasonal" && template.seasonal_month && `${getSeasonalMonth(template.seasonal_month)}`}
                          {template.type === "birthday" && "On birthday"}
                          {template.type === "re_engagement" && `After ${template.trigger_days} days inactive`}
                          {template.type === "custom" && "Manual trigger"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={template.active ? "default" : "outline"} className={template.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                            {template.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => toggleTemplateStatus(template)}>
                              {template.active ? (
                                <Pause className="h-4 w-4 text-amber-500" />
                              ) : (
                                <Play className="h-4 w-4 text-green-500" />
                              )}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => previewTemplate(template)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => editTemplate(template)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => confirmDeleteTemplate(template)}>
                              <Trash className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About Automated Messaging</CardTitle>
              <CardDescription>
                Set up automated messages that will be sent based on specific triggers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg bg-blue-50">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Appointment Reminders</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Automatically remind clients of upcoming appointments 24h or 1h before
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg bg-green-50">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Clock className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Treatment Follow-ups</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Check in with clients post-treatment for feedback and continued care
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg bg-amber-50">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 rounded-full">
                      <Bot className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">AI-Driven Personalization</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Create personalized messages with AI assistance tailored to each client
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs" className="space-y-6 pt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Communication Logs</h2>
            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Content</TableHead>
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
                  ) : logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No communication logs found. They will appear here once messages are sent.
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {format(new Date(log.created_date), "MMM d, yyyy h:mma")}
                        </TableCell>
                        <TableCell className="font-medium">
                          {log.client_id || "Unknown"}
                        </TableCell>
                        <TableCell>
                          <Badge className={getTemplateTypeBadgeColor(log.type)}>
                            {getTemplateTypeLabel(log.type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getChannelIcon(log.channel)}
                            <span className="capitalize">{log.channel}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={log.status === "sent" ? "default" : "outline"} className={
                            log.status === "sent" ? "bg-green-100 text-green-800" : 
                            log.status === "failed" ? "bg-red-100 text-red-800" :
                            "bg-amber-100 text-amber-800"
                          }>
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs"
                            onClick={() => {
                              setPreviewContent(log.content);
                              setShowPreview(true);
                            }}
                          >
                            View Content
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Template Form Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Edit Template" : "Create New Template"}</DialogTitle>
            <DialogDescription>
              {editingTemplate ? "Update your message template" : "Configure a new automated message template"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
              />
              {formErrors.name && (
                <span className="text-sm text-red-500">{formErrors.name}</span>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Message Type</Label>
                <Select value={formData.type} onValueChange={(value) => handleFormChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="follow_up">Post-treatment Follow-up</SelectItem>
                    <SelectItem value="appointment_reminder">Appointment Reminder</SelectItem>
                    <SelectItem value="treatment_cycle">Treatment Cycle</SelectItem>
                    <SelectItem value="seasonal">Seasonal Check-in</SelectItem>
                    <SelectItem value="birthday">Birthday</SelectItem>
                    <SelectItem value="re_engagement">Re-engagement</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="channel">Channel</Label>
                <Select value={formData.channel} onValueChange={(value) => handleFormChange("channel", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {formData.type === "follow_up" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="treatment">Treatment</Label>
                  <Select 
                    value={formData.treatment_id} 
                    onValueChange={(value) => handleFormChange("treatment_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select treatment" />
                    </SelectTrigger>
                    <SelectContent>
                      {treatments.map(treatment => (
                        <SelectItem key={treatment.id} value={treatment.id}>
                          {treatment.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.treatment_id && (
                    <span className="text-sm text-red-500">{formErrors.treatment_id}</span>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="trigger_days">Days After Treatment</Label>
                  <Input
                    id="trigger_days"
                    type="number"
                    min="1"
                    value={formData.trigger_days}
                    onChange={(e) => handleFormChange("trigger_days", parseInt(e.target.value))}
                  />
                  {formErrors.trigger_days && (
                    <span className="text-sm text-red-500">{formErrors.trigger_days}</span>
                  )}
                </div>
              </div>
            )}
            
            {formData.type === "appointment_reminder" && (
              <div className="grid gap-2">
                <Label htmlFor="reminder_timing">Reminder Timing</Label>
                <Select 
                  value={formData.trigger_days.toString()} 
                  onValueChange={(value) => handleFormChange("trigger_days", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">24 hours before</SelectItem>
                    <SelectItem value="0">1 hour before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {formData.type === "treatment_cycle" && (
              <div className="grid gap-2">
                <Label htmlFor="cycle_days">Cycle Length (Days)</Label>
                <Input
                  id="cycle_days"
                  type="number"
                  min="1"
                  value={formData.trigger_days}
                  onChange={(e) => handleFormChange("trigger_days", parseInt(e.target.value))}
                />
                {formErrors.trigger_days && (
                  <span className="text-sm text-red-500">{formErrors.trigger_days}</span>
                )}
              </div>
            )}
            
            {formData.type === "seasonal" && (
              <div className="grid gap-2">
                <Label htmlFor="seasonal_month">Month to Send</Label>
                <Select 
                  value={formData.seasonal_month} 
                  onValueChange={(value) => handleFormChange("seasonal_month", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jan">January</SelectItem>
                    <SelectItem value="feb">February</SelectItem>
                    <SelectItem value="mar">March</SelectItem>
                    <SelectItem value="apr">April</SelectItem>
                    <SelectItem value="may">May</SelectItem>
                    <SelectItem value="jun">June</SelectItem>
                    <SelectItem value="jul">July</SelectItem>
                    <SelectItem value="aug">August</SelectItem>
                    <SelectItem value="sep">September</SelectItem>
                    <SelectItem value="oct">October</SelectItem>
                    <SelectItem value="nov">November</SelectItem>
                    <SelectItem value="dec">December</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {formData.type === "re_engagement" && (
              <div className="grid gap-2">
                <Label htmlFor="inactive_days">Days Since Last Visit</Label>
                <Input
                  id="inactive_days"
                  type="number"
                  min="30"
                  value={formData.trigger_days}
                  onChange={(e) => handleFormChange("trigger_days", parseInt(e.target.value))}
                />
                {formErrors.trigger_days && (
                  <span className="text-sm text-red-500">{formErrors.trigger_days}</span>
                )}
              </div>
            )}
            
            {formData.channel === "email" && (
              <div className="grid gap-2">
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleFormChange("subject", e.target.value)}
                />
                {formErrors.subject && (
                  <span className="text-sm text-red-500">{formErrors.subject}</span>
                )}
              </div>
            )}
            
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="content">Message Content</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generateAIContent}
                  disabled={isGeneratingAI || 
                    (formData.type === "follow_up" && !formData.treatment_id)}
                  className="gap-1 text-xs h-8"
                >
                  {isGeneratingAI ? (
                    <>
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Bot className="h-3 w-3" />
                      AI Assist
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleFormChange("content", e.target.value)}
                placeholder="Enter your message content here. Use {{client_name}} as a placeholder for the client's name."
                rows={5}
              />
              {formErrors.content && (
                <span className="text-sm text-red-500">{formErrors.content}</span>
              )}
              
              {/* AI Generated Content */}
              {aiGeneratedContent && (
                <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1.5">
                      <Bot className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-blue-700">AI Suggested Content</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={useAIContent}
                      className="text-xs h-7"
                    >
                      Use This
                    </Button>
                  </div>
                  <div className="text-sm whitespace-pre-wrap">
                    {aiGeneratedContent}
                  </div>
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-1">
                Available placeholders: &#123;&#123;client_name&#125;&#125;, &#123;&#123;appointment_time&#125;&#125;, &#123;&#123;treatment_name&#125;&#125;
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => handleFormChange("active", checked)}
              />
              <Label htmlFor="active">Active</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="automated"
                checked={formData.is_automated}
                onCheckedChange={(checked) => handleFormChange("is_automated", checked)}
              />
              <Label htmlFor="automated">Run Automatically</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Saving...
                </div>
              ) : (
                editingTemplate ? "Update Template" : "Create Template"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteTemplate}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Message Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Message Preview</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[300px] rounded-md border p-4">
            <div className="whitespace-pre-wrap">
              {previewContent}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button onClick={() => setShowPreview(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}