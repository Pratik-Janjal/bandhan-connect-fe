import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building, 
  Bell, 
  Settings, 
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const VendorHeader: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-saffron to-orange-500 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">BandhaConnect</span>
              <span className="text-sm text-saffron font-medium">Vendor</span>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-600 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
                <div className="w-8 h-8 bg-saffron rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Vendor'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </button>
            </div>

            {/* Settings */}
            <Link 
              to="/vendor/settings" 
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <Settings className="w-5 h-5" />
            </Link>

            {/* Logout */}
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default VendorHeader; 