import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { Bell, User, LogOut, Shield, X, Bot, Cross, Menu } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const toggleNav = () => {
    setShowNav(!showNav)
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed z-20 w-full lg:block">
      <div className="container ml-5 py-4">
        <div className="flex lg:justify-between">

          {/* Logo */}
          <Link to="/app" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-saffron to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-bold text-gray-900">BandhanConnect</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link to="/app/matches" className="text-gray-600 hover:text-saffron transition-colors">
              Matches
            </Link>
            <Link to="/app/search" className="text-gray-600 hover:text-saffron transition-colors">
              Search
            </Link>
            <Link to="/app/messages" className="text-gray-600 hover:text-saffron transition-colors">
              Messages
            </Link>
            <Link to="/app/timeline" className="text-gray-600 hover:text-saffron transition-colors">
              Timeline
            </Link>
            <Link to="/app/community" className="text-gray-600 hover:text-saffron transition-colors">
              Community
            </Link>
            <Link to="/app/services" className="text-gray-600 hover:text-saffron transition-colors">
              Services
            </Link>
            <Link to="/app/ai-assistant" className="text-gray-600 hover:text-saffron transition-colors flex items-center gap-1">
              <Bot className="w-4 h-4" />
              AI Assistant
            </Link>
            {user?.role === 'admin' && user?.email === 'admin@bandhan.com' && (
              <Link to="/app/admin" className="text-gray-600 hover:text-saffron transition-colors flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}
          </nav>

         <div className='lg:hidden absolute right-3'>
            {showNav ? "" : <Menu onClick={()=>toggleNav()}/>}
         </div>
                         
         { showNav ?    
      <section className='lg:hidden fixed top-0 z-40 left-0 bg-white w-full transition-all duration-500'>
        <Cross onClick={()=> toggleNav()} className='absolute right-3 top-2 rotate-45'/>
        <nav className='[&>*]:block pl-6 py-5 [&>*]:py-1.5'>
        <Link to="/app/matches" className="text-gray-600 hover:text-saffron transition-colors ">
          Matches
        </Link>
        <Link to="/app/search" className="text-gray-600 hover:text-saffron transition-colors ">
          Search
        </Link>
        <Link to="/app/messages" className="text-gray-600 hover:text-saffron transition-colors ">
          Messages
        </Link>
        <Link to="/app/timeline" className="text-gray-600 hover:text-saffron transition-colors ">
          Timeline
        </Link>
        <Link to="/app/community" className="text-gray-600 hover:text-saffron transition-colors ">
          Community
        </Link>
        <Link to="/app/services" className="text-gray-600 hover:text-saffron transition-colors ">
          Services
        </Link>
        <Link to="/app/ai-assistant" className="text-gray-600 hover:text-saffron transition-colors items-center gap-1 flex">
          <Bot className="w-4 h-4" />
          <div>
            AI Assistant
          </div>
        </Link>
        {user?.role === 'admin' && user?.email === 'admin@bandhan.com' && (
          <Link to="/app/admin" className="text-gray-600 hover:text-saffron transition-colors items-center gap-1 flex">
            <Shield className="w-4 h-4" />
            Admin
          </Link>
          )}
        </nav>
      </section> : ""
       }
          {/* User Actions */}
          <div className="flex space-x-4 justify-items-end">
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-600 hover:text-saffron transition-colors relative lg:flex hidden" 
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={markAllAsRead}
                          className="text-sm text-saffron hover:text-orange-600"
                        >
                          Mark all read
                        </button>
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map(notification => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                            !notification.read ? 'bg-blue-50' : ''
                          } ${notification.type === 'announcement' ? 'bg-yellow-50 border-yellow-200' : ''}`}
                          onClick={() => {
                            markAsRead(notification.id);
                            if (notification.actionUrl) {
                              navigate(notification.actionUrl);
                              setShowNotifications(false);
                            }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              notification.type === 'announcement' ? 'bg-yellow-500' :
                              notification.type === 'success' ? 'bg-green-500' :
                              notification.type === 'warning' ? 'bg-yellow-500' :
                              notification.type === 'error' ? 'bg-red-500' :
                              'bg-blue-500'
                            }`} />
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{notification.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-2">
                                {notification.type === 'announcement' && notification.author && `By ${notification.author} • `}
                                {formatTime(notification.timestamp)}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-saffron to-orange-500 rounded-full lg:flex items-center justify-center hidden ">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-red-500 transition-colors lg:block hidden"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;