import React, { useState } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import ClientAIAgent from '../components/ai/ClientAIAgent';
import AutomatedClientAI from '../components/ai/AutomatedClientAI';

export default function ClientAI() {
  const [activeTab, setActiveTab] = useState("manual");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Client Communication</h1>
        <p className="text-gray-500">Generate and manage personalized client communications</p>
      </div>
      
      <Tabs defaultValue="manual" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual Messages</TabsTrigger>
          <TabsTrigger value="automated">Automated System</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual" className="mt-6">
          <ClientAIAgent />
        </TabsContent>
        
        <TabsContent value="automated" className="mt-6">
          <AutomatedClientAI />
        </TabsContent>
      </Tabs>
    </div>
  );
}