import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, Search, MessageCircle, User, Shield, Calendar, Users, Bot, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center py-2">
        <Link
          to="/app/matches"
          className={`flex flex-col items-center p-2 ${
            isActive('/app/matches') ? 'text-saffron' : 'text-gray-600'
          }`}
        >
          <Heart className="w-5 h-5" />
          <span className="text-xs mt-1">Matches</span>
        </Link>
        
        <Link
          to="/app/search"
          className={`flex flex-col items-center p-2 ${
            isActive('/app/search') ? 'text-saffron' : 'text-gray-600'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-xs mt-1">Search</span>
        </Link>
        
        <Link
          to="/app/messages"
          className={`flex flex-col items-center p-2 relative ${
            isActive('/app/messages') ? 'text-saffron' : 'text-gray-600'
          }`}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-xs mt-1">Messages</span>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
            3
          </span>
        </Link>

        <Link
          to="/app/timeline"
          className={`flex flex-col items-center p-2 ${
            isActive('/app/timeline') ? 'text-saffron' : 'text-gray-600'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-xs mt-1">Timeline</span>
        </Link>

        <Link
          to="/app/community"
          className={`flex flex-col items-center p-2 ${
            isActive('/app/community') ? 'text-saffron' : 'text-gray-600'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-xs mt-1">Community</span>
        </Link>

        <Link
          to="/app/support"
          className={`flex flex-col items-center p-2 ${
            isActive('/app/support') ? 'text-saffron' : 'text-gray-600'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-xs mt-1">Support</span>
        </Link>
        
        <Link
          to="/app/profile"
          className={`flex flex-col items-center p-2 ${
            isActive('/app/profile') ? 'text-saffron' : 'text-gray-600'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-xs mt-1">Profile</span>
        </Link>

        {user?.role === 'admin' && user?.email === 'admin@bandhan.com' && (
          <Link
            to="/app/admin"
            className={`flex flex-col items-center p-2 ${
              isActive('/app/admin') ? 'text-saffron' : 'text-gray-600'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span className="text-xs mt-1">Admin</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default BottomNav;