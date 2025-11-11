import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Package, 
  Users, 
  MessageSquare, 
  Building
} from 'lucide-react';

const VendorBottomNav: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/vendor/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/vendor/services', label: 'Services', icon: Package },
    { path: '/vendor/leads', label: 'Leads', icon: Users },
    { path: '/vendor/messages', label: 'Messages', icon: MessageSquare },
    { path: '/vendor/profile', label: 'Profile', icon: Building },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-3 flex-1 ${
                isActive(item.path)
                  ? 'text-saffron'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive(item.path) && (
                <div className="w-1 h-1 bg-saffron rounded-full mt-1"></div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default VendorBottomNav; 