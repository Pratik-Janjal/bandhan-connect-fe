import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import VendorHeader from './VendorHeader';
import VendorSidebar from './VendorSidebar';
import VendorBottomNav from './VendorBottomNav';

const VendorLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <VendorHeader />
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:w-64">
          <VendorSidebar />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <main className="container mx-auto px-4 py-6 pb-20 lg:pb-6">
            <Outlet />
          </main>
        </div>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <VendorBottomNav />
      </div>
    </div>
  );
};

export default VendorLayout; 