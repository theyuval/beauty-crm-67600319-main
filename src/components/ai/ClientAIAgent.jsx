import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Bot, 
  Send, 
  RefreshCw, 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  CheckCircle2
} from "lucide-react";
import { InvokeLLM } from "@/api/integrations";
import { Client } from "@/api/entities";
import { Treatment } from "@/api/entities";
import { Appointment } from "@/api/entities";

export default function ClientAIAgent() {
  const [activeTab, setActiveTab] = useState("follow-up");
  const [clientId, setClientId] = useState("");
  const [seasonalFocus, setSeasonalFocus] = useState("summer");
  const [treatmentType, setTreatmentType] = useState("facial");
  const [messageType, setMessageType] = useState("follow_up");
  const [communicationChannel, setCommunicationChannel] = useState("email");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [treatments, setTreatments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [messageHistory, setMessageHistory] = useState([]);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    loadData();
  }, []);

  React.useEffect(() => {
    if (clientId) {
      loadClientData(clientId);
    }
  }, [clientId]);

  const loadData = async () => {
    try {
      const clientsData = await Client.list();
      setClients(clientsData);
      
      const treatmentsData = await Treatment.list();
      setTreatments(treatmentsData);
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Failed to load client data. Please try again.");
    }
  };

  const loadClientData = async (id) => {
    try {
      const client = clients.find(c => c.id === id);
      setSelectedClient(client);
      
      const appointmentsData = await Appointment.list();
      const clientAppointments = appointmentsData.filter(a => a.client_id === id);
      setAppointments(clientAppointments);
    } catch (error) {
      console.error("Error loading client data:", error);
    }
  };

  const generateMessage = async () => {
    if (!clientId) {
      setError("Please select a client first");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      let prompt = "";
      
      if (activeTab === "follow-up") {
        // Build the follow-up message prompt
        const client = clients.find(c => c.id === clientId);
        const clientAppointments = appointments.filter(a => a.client_id === clientId);
        
        // Get the most recent appointment and its treatment
        const recentAppointment = clientAppointments.sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        )[0];
        
        const treatmentDetails = recentAppointment 
          ? treatments.find(t => t.id === recentAppointment.treatment_id)
          : null;
        
        prompt = `Generate a personalized ${messageType} message for a spa/beauty client named ${client.full_name}.
${treatmentDetails ? `Their last treatment was a ${treatmentDetails.name} on ${recentAppointment.date}.` : ''}
The client's skin type is ${client.skin_type || 'unknown'}.
Their main concerns are ${client.concerns ? client.concerns.join(', ') : 'unknown'}.
The message should be sent via ${communicationChannel}.
Make the message warm, professional, and include specific aftercare advice relevant to their treatment.
The message should be 3-4 paragraphs maximum, personalized, and include a gentle call to action to book their next appointment.`;
      } else if (activeTab === "seasonal") {
        // Build the seasonal care message prompt
        const client = clients.find(c => c.id === clientId);
        
        prompt = `Generate a personalized skincare recommendation message for the ${seasonalFocus} season for a spa/beauty client named ${client.full_name}.
The client's skin type is ${client.skin_type || 'unknown'}.
Their main concerns are ${client.concerns ? client.concerns.join(', ') : 'unknown'}.
The message should address how the ${seasonalFocus} season affects their specific skin type and concerns.
Recommend 2-3 specific treatments we offer that would benefit them during this season.
The message should be warm, helpful, and include a promotion for booking a seasonal treatment.
The message will be sent via ${communicationChannel} and should be 3-4 paragraphs maximum.`;
      } else if (activeTab === "custom") {
        prompt = customPrompt;
      }
      
      const result = await InvokeLLM({
        prompt,
        add_context_from_internet: false
      });
      
      setGeneratedMessage(result);
      
      // Add to message history
      setMessageHistory(prev => [
        {
          id: Date.now(),
          client: selectedClient?.full_name || "Unknown Client",
          type: activeTab === "follow-up" ? "Follow-up" : activeTab === "seasonal" ? "Seasonal Care" : "Custom",
          message: result,
          timestamp: new Date()
        },
        ...prev
      ].slice(0, 10)); // Keep only the last 10 messages
      
    } catch (error) {
      console.error("Error generating message:", error);
      setError("Failed to generate message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMessage);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRefresh = () => {
    generateMessage();
  };

  const MessageGenerator = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Select Client</Label>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map(client => (
                <SelectItem key={client.id} value={client.id}>
                  {client.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      
        {activeTab === "follow-up" && (
          <>
            <div className="space-y-2">
              <Label>Message Type</Label>
              <Select value={messageType} onValueChange={setMessageType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="follow_up">Treatment Follow-up</SelectItem>
                  <SelectItem value="maintenance">Maintenance Reminder</SelectItem>
                  <SelectItem value="birthday">Birthday Message</SelectItem>
                  <SelectItem value="reactivation">Client Reactivation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
        
        {activeTab === "seasonal" && (
          <div className="space-y-2">
            <Label>Seasonal Focus</Label>
            <Select value={seasonalFocus} onValueChange={setSeasonalFocus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summer">Summer</SelectItem>
                <SelectItem value="fall">Fall</SelectItem>
                <SelectItem value="winter">Winter</SelectItem>
                <SelectItem value="spring">Spring</SelectItem>
                <SelectItem value="holiday">Holiday Season</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        {activeTab === "custom" && (
          <div className="space-y-2">
            <Label>Custom Prompt</Label>
            <Textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Write a custom prompt for the AI to generate a personalized message..."
              rows={5}
            />
          </div>
        )}
        
        <div className="space-y-2">
          <Label>Communication Channel</Label>
          <Select value={communicationChannel} onValueChange={setCommunicationChannel}>
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
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Button 
          onClick={generateMessage} 
          disabled={isLoading || !clientId} 
          className="w-full gap-2"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Bot className="h-4 w-4" />
              Generate Message
            </>
          )}
        </Button>
      </div>
      
      {generatedMessage && (
        <Card className="mt-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex justify-between items-center">
              <span>Generated Message</span>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleRefresh} 
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleCopy}
                >
                  {isCopied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-sm">
              {generatedMessage}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" size="icon">
                <ThumbsDown className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button className="gap-2" size="sm">
                <Send className="h-4 w-4" />
                Send to Client
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-500" />
          AI Communication Assistant
        </CardTitle>
        <CardDescription>
          Generate personalized client messages for different scenarios
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="follow-up" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="follow-up">Treatment Follow-up</TabsTrigger>
            <TabsTrigger value="seasonal">Seasonal Care</TabsTrigger>
            <TabsTrigger value="custom">Custom Message</TabsTrigger>
          </TabsList>
          <TabsContent value="follow-up" className="mt-6">
            <MessageGenerator />
          </TabsContent>
          <TabsContent value="seasonal" className="mt-6">
            <MessageGenerator />
          </TabsContent>
          <TabsContent value="custom" className="mt-6">
            <MessageGenerator />
          </TabsContent>
        </Tabs>
        
        {messageHistory.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Message History</h3>
            <div className="space-y-4">
              {messageHistory.map(msg => (
                <Card key={msg.id} className="bg-gray-50">
                  <CardHeader className="py-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm">{msg.client}</p>
                        <p className="text-xs text-gray-500">{msg.type} • {new Date(msg.timestamp).toLocaleString()}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => {
                        navigator.clipboard.writeText(msg.message);
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2000);
                      }}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="py-2">
                    <p className="text-sm line-clamp-2">{msg.message}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}