import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  Calendar, 
  Clipboard, 
  Filter, 
  User,
  Eye
} from 'lucide-react';
import { Client } from '@/api/entities';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import ClientForm from '../components/clients/ClientForm';

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [filterSkinType, setFilterSkinType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      const data = await Client.list();
      setClients(data);
    } catch (error) {
      console.error("Error loading clients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.phone && client.phone.includes(searchTerm));
    
    const matchesSkinType = filterSkinType === 'all' || client.skin_type === filterSkinType;
    
    return matchesSearch && matchesSkinType;
  });

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleNewClientSuccess = () => {
    setIsNewClientModalOpen(false);
    loadClients();
  };

  const handleViewClientDetails = (clientId) => {
    navigate(`${createPageUrl('ClientDetails')}?id=${clientId}`);
  };

  const skinTypeOptions = [
    { value: 'all', label: 'All Skin Types' },
    { value: 'normal', label: 'Normal' },
    { value: 'dry', label: 'Dry' },
    { value: 'oily', label: 'Oily' },
    { value: 'combination', label: 'Combination' },
    { value: 'sensitive', label: 'Sensitive' }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsNewClientModalOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Client
        </Button>
      </div>

      <Card className="mb-6">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                className="pl-10"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  <span>{filterSkinType === 'all' ? 'All Skin Types' : 
                    filterSkinType.charAt(0).toUpperCase() + filterSkinType.slice(1)}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {skinTypeOptions.map(option => (
                  <DropdownMenuItem 
                    key={option.value}
                    onClick={() => setFilterSkinType(option.value)}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-lg transition-shadow">
              <div className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={client.profile_photo} alt={client.full_name} />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {getInitials(client.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold truncate">{client.full_name}</h3>
                    
                    {client.skin_type && (
                      <Badge variant="outline" className="mt-1">
                        {client.skin_type}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.last_visit && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>Last visit: {format(new Date(client.last_visit), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </div>

                {client.concerns && client.concerns.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {client.concerns.slice(0, 3).map((concern, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="text-xs py-0"
                        >
                          {concern.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                      {client.concerns.length > 3 && (
                        <Badge
                          variant="secondary"
                          className="text-xs py-0"
                        >
                          +{client.concerns.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewClientDetails(client.id)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Link 
                    to={createPageUrl('Calendar')}
                    className="flex-1"
                  >
                    <Button 
                      size="sm" 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Clipboard className="w-4 h-4 mr-2" />
                      Book
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {filteredClients.length === 0 && !isLoading && (
        <div className="text-center py-12 text-gray-500">
          <User className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-2">No clients found</h3>
          <p className="mb-4">Try adjusting your search or filters</p>
          <Button onClick={() => setIsNewClientModalOpen(true)}>
            Add New Client
          </Button>
        </div>
      )}

      <ClientForm 
        isOpen={isNewClientModalOpen} 
        onClose={() => setIsNewClientModalOpen(false)}
        onSuccess={handleNewClientSuccess}
      />
    </div>
  );
}