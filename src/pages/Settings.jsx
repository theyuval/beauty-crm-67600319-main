import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Save, 
  Store, 
  Settings as SettingsIcon, 
  Bell, 
  CreditCard, 
  PanelRight, 
  Smartphone,
  AlertTriangle,
  User
} from 'lucide-react';
import { User as UserEntity } from '@/api/entities';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [user, setUser] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [businessSettings, setBusinessSettings] = useState({
    business_name: 'Beauty CRM',
    address: '',
    phone: '',
    email: '',
    website: '',
    logo_url: '',
    schedule_start: '09:00',
    schedule_end: '18:00',
    time_slot_duration: '30',
    currency: 'USD',
    tax_rate: '0'
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    appointment_confirmation: true,
    appointment_reminder: true,
    appointment_reminder_time: '1_day',
    appointment_follow_up: true,
    marketing_emails: false,
    special_offers: false
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const userData = await UserEntity.me();
      setUser(userData);
      
      // If user has saved settings, load them
      if (userData.business_settings) {
        setBusinessSettings(userData.business_settings);
      }
      
      if (userData.notification_settings) {
        setNotificationSettings(userData.notification_settings);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      await UserEntity.updateMyUserData({
        business_settings: businessSettings,
        notification_settings: notificationSettings
      });
      
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBusinessChange = (field, value) => {
    setBusinessSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field, value) => {
    setNotificationSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={saveSettings}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </div>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      {isSaved && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>Settings saved successfully!</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 grid w-full grid-cols-3">
          <TabsTrigger value="general">
            <Store className="h-4 w-4 mr-2" />
            Business Info
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="integration">
            <PanelRight className="h-4 w-4 mr-2" />
            Integrations
          </TabsTrigger>
        </TabsList>
        
        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Manage your business details and operational settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="business_name">Business Name</Label>
                  <Input
                    id="business_name"
                    value={businessSettings.business_name}
                    onChange={(e) => handleBusinessChange('business_name', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Business Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={businessSettings.email}
                    onChange={(e) => handleBusinessChange('email', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Business Phone</Label>
                  <Input
                    id="phone"
                    value={businessSettings.phone}
                    onChange={(e) => handleBusinessChange('phone', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={businessSettings.website}
                    onChange={(e) => handleBusinessChange('website', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={businessSettings.address}
                  onChange={(e) => handleBusinessChange('address', e.target.value)}
                  rows={2}
                />
              </div>
              
              <Separator />
              
              <h3 className="text-lg font-medium">Schedule Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="schedule_start">Working Hours (Start)</Label>
                  <Select
                    value={businessSettings.schedule_start}
                    onValueChange={(value) => handleBusinessChange('schedule_start', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 13 }, (_, i) => i + 7).map(hour => (
                        <SelectItem key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                          {`${hour}:00`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="schedule_end">Working Hours (End)</Label>
                  <Select
                    value={businessSettings.schedule_end}
                    onValueChange={(value) => handleBusinessChange('schedule_end', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 11 }, (_, i) => i + 14).map(hour => (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {`${hour}:00`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time_slot">Default Time Slot (minutes)</Label>
                  <Select
                    value={businessSettings.time_slot_duration}
                    onValueChange={(value) => handleBusinessChange('time_slot_duration', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <h3 className="text-lg font-medium">Billing Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={businessSettings.currency}
                    onValueChange={(value) => handleBusinessChange('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="GBP">British Pound (£)</SelectItem>
                      <SelectItem value="CAD">Canadian Dollar (C$)</SelectItem>
                      <SelectItem value="AUD">Australian Dollar (A$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={businessSettings.tax_rate}
                    onChange={(e) => handleBusinessChange('tax_rate', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when notifications are sent to clients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="appointment_confirmation">Appointment Confirmation</Label>
                    <p className="text-sm text-gray-500">
                      Send confirmation emails when appointments are booked
                    </p>
                  </div>
                  <Switch
                    id="appointment_confirmation"
                    checked={notificationSettings.appointment_confirmation}
                    onCheckedChange={(value) => handleNotificationChange('appointment_confirmation', value)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="appointment_reminder">Appointment Reminders</Label>
                    <p className="text-sm text-gray-500">
                      Send reminders before scheduled appointments
                    </p>
                  </div>
                  <Switch
                    id="appointment_reminder"
                    checked={notificationSettings.appointment_reminder}
                    onCheckedChange={(value) => handleNotificationChange('appointment_reminder', value)}
                  />
                </div>
                
                {notificationSettings.appointment_reminder && (
                  <div className="ml-6 mt-2">
                    <Label htmlFor="reminder_time">Send reminder:</Label>
                    <Select
                      value={notificationSettings.appointment_reminder_time}
                      onValueChange={(value) => handleNotificationChange('appointment_reminder_time', value)}
                    >
                      <SelectTrigger className="w-64 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1_hour">1 hour before</SelectItem>
                        <SelectItem value="2_hours">2 hours before</SelectItem>
                        <SelectItem value="1_day">1 day before</SelectItem>
                        <SelectItem value="2_days">2 days before</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="appointment_follow_up">Post-Treatment Follow-ups</Label>
                    <p className="text-sm text-gray-500">
                      Send follow-up messages after treatments
                    </p>
                  </div>
                  <Switch
                    id="appointment_follow_up"
                    checked={notificationSettings.appointment_follow_up}
                    onCheckedChange={(value) => handleNotificationChange('appointment_follow_up', value)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing_emails">Marketing Emails</Label>
                    <p className="text-sm text-gray-500">
                      Send occasional newsletters and updates
                    </p>
                  </div>
                  <Switch
                    id="marketing_emails"
                    checked={notificationSettings.marketing_emails}
                    onCheckedChange={(value) => handleNotificationChange('marketing_emails', value)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="special_offers">Special Offers & Promotions</Label>
                    <p className="text-sm text-gray-500">
                      Send notifications about special deals and promotions
                    </p>
                  </div>
                  <Switch
                    id="special_offers"
                    checked={notificationSettings.special_offers}
                    onCheckedChange={(value) => handleNotificationChange('special_offers', value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Integration Settings */}
        <TabsContent value="integration">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>
                Connect with third-party services and payment processors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription>
                  Integrations with third-party services are currently under development and will be available soon.
                </AlertDescription>
              </Alert>
              
              <div className="grid gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Payment Processing</CardTitle>
                      <CreditCard className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 mb-4">
                      Connect payment processors to accept online payments and deposits.
                    </p>
                    <Button variant="outline" disabled>Connect Payment Processor</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">SMS Notifications</CardTitle>
                      <Smartphone className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 mb-4">
                      Connect SMS service to send text message notifications to clients.
                    </p>
                    <Button variant="outline" disabled>Set Up SMS Service</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Staff Calendar Sync</CardTitle>
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 mb-4">
                      Sync staff calendars with external calendar services.
                    </p>
                    <Button variant="outline" disabled>Connect Calendar</Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}