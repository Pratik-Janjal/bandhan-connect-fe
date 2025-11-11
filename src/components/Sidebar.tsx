import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Heart, 
  Search, 
  MessageCircle, 
  User, 
  Shield, 
  Calendar,
  Users,
  Briefcase,
  Bot,
  BarChart3,
  Video,
  HeartHandshake,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/app/matches', label: 'Matches', icon: Heart },
    { path: '/app/search', label: 'Search', icon: Search },
    { path: '/app/messages', label: 'Messages', icon: MessageCircle },
    { path: '/app/timeline', label: 'Timeline', icon: Calendar },
    { path: '/app/community', label: 'Community', icon: Users },
    { path: '/app/services', label: 'Services', icon: Briefcase },
    { path: '/app/counseling', label: 'Counseling', icon: HeartHandshake },
    { path: '/app/wedding-planning', label: 'Wedding Planning', icon: Heart },
    { path: '/app/ai-assistant', label: 'AI Assistant', icon: Bot },
    { path: '/app/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/app/support', label: 'Support', icon: MessageSquare },
    { path: '/app/profile', label: 'Profile', icon: User },
    { path: '/app/events', label: 'Events', icon: Calendar },
  ];

  if (user?.role === 'admin' && user?.email === 'admin@bandhan.com') {
    menuItems.push({ path: '/app/admin', label: 'Admin', icon: Shield });
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-16">
      <div className="p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-saffron text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.label === 'Messages' && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    3
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;