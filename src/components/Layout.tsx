import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.includes('/admin');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:w-56 mt-24">
          <Sidebar />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 lg:ml-0 mt-20">
          <main className="container mx-auto px-4 py-6 pb-20 lg:pb-6">
            <Outlet />
          </main>
        </div>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
};

export default Layout;