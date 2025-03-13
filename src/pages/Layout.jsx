
import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Users,
  Clock,
  FileText,
  Settings,
  Menu,
  X,
  LogOut,
  BarChart3,
  Bot
} from 'lucide-react';
import { User } from '@/api/entities';

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = async () => {
    await User.logout();
  };

  const navigation = [
    { name: 'Calendar', icon: Calendar, href: createPageUrl('Calendar') },
    { name: 'Clients', icon: Users, href: createPageUrl('Clients') },
    { name: 'Appointments', icon: Clock, href: createPageUrl('Appointments') },
    { name: 'Treatments', icon: FileText, href: createPageUrl('Treatments') },
    { name: 'Analytics', icon: BarChart3, href: createPageUrl('Analytics') },
    { 
      name: 'Client AI', 
      icon: Bot, 
      href: createPageUrl('ClientAI'),
      highlight: true,
    },
    { name: 'Staff', icon: Users, href: createPageUrl('Staff') },
    { name: 'Settings', icon: Settings, href: createPageUrl('Settings') }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-200 ease 
          lg:translate-x-0 lg:static lg:inset-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <Link to={createPageUrl('Calendar')} className="flex items-center">
              <span className="text-xl font-semibold text-gray-800">
                Beauty CRM
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg
                      ${
                        currentPageName === item.name
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                      ${item.highlight ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : ''}`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-64">
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b h-16 flex items-center px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
