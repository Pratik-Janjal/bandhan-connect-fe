// import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import CreateProfile from './pages/CreateProfile';
import Matches from './pages/Matches';
import Messages from './pages/Messages';
import Chat from './pages/Chat';
import Search from './pages/Search';
import Admin from './pages/Admin';
import Verification from './pages/Verification';
import Timeline from './pages/Timeline';
import Community from './pages/Community';
import Events from './pages/Events';
import Services from './pages/Services';
import Analytics from './pages/Analytics';
import AIAssistant from './pages/AIAssistant';
import VideoCall from './pages/VideoCall';
import Counseling from './pages/Counseling';
import WeddingPlanning from './pages/WeddingPlanning';
import Support from './pages/Support';
import VendorDashboard from './pages/VendorDashboard';
import VendorOnboarding from './pages/VendorOnboarding';
import CounselorDashboard from './pages/CounselorDashboard';
import CommunityDashboard from './pages/CommunityDashboard';
import VendorLayout from './components/VendorLayout';

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <NotificationProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verification" element={<Verification />} />
              <Route path="/create-profile" element={<CreateProfile />} />
              <Route path="/app" element={<Layout />}>
                <Route index element={<Matches />} />
                <Route path="matches" element={<Matches />} />
                <Route path="search" element={<Search />} />
                <Route path="messages" element={<Messages />} />
                <Route path="chat/:userId" element={<Chat />} />
                <Route path="video-call/:userId" element={<VideoCall />} />
                <Route path="profile" element={<Profile />} />
                <Route path="timeline" element={<Timeline />} />
                <Route path="community" element={<Community />} />
                <Route path="services" element={<Services />} />
                <Route path="counseling" element={<Counseling />} />
                <Route path="wedding-planning" element={<WeddingPlanning />} />
                <Route path="ai-assistant" element={<AIAssistant />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="admin" element={<Admin />} />
                <Route path="events" element={<Events />} />
                <Route path="support" element={<Support />} />
              </Route>

              {/* Dynamic routes for counselor and community dashboards by ID */}
              <Route path="/app/counselor/:counselorId" element={<CounselorDashboard />} />
              <Route path="/app/community/:communityId" element={<CommunityDashboard />} />

              {/* Vendor-specific routes with vendor layout */}
              <Route path="/vendor" element={<VendorLayout />}>
                <Route path="onboarding" element={<VendorOnboarding />} />
                <Route path="dashboard" element={<VendorDashboard />} />
                <Route path="services" element={<div className="p-6"><h2 className="text-2xl font-bold">Vendor Services</h2><p>Manage your service packages here.</p></div>} />
                <Route path="leads" element={<div className="p-6"><h2 className="text-2xl font-bold">Client Leads</h2><p>Manage your client inquiries here.</p></div>} />
                <Route path="messages" element={<div className="p-6"><h2 className="text-2xl font-bold">Messages</h2><p>Communicate with clients here.</p></div>} />
                <Route path="bookings" element={<div className="p-6"><h2 className="text-2xl font-bold">Bookings</h2><p>Manage your appointments here.</p></div>} />
                <Route path="reviews" element={<div className="p-6"><h2 className="text-2xl font-bold">Reviews</h2><p>View client feedback here.</p></div>} />
                <Route path="earnings" element={<div className="p-6"><h2 className="text-2xl font-bold">Earnings</h2><p>Track your revenue here.</p></div>} />
                <Route path="profile" element={<div className="p-6"><h2 className="text-2xl font-bold">Business Profile</h2><p>Manage your business information here.</p></div>} />
                <Route path="documents" element={<div className="p-6"><h2 className="text-2xl font-bold">Documents</h2><p>Upload certificates and licenses here.</p></div>} />
                <Route path="achievements" element={<div className="p-6"><h2 className="text-2xl font-bold">Achievements</h2><p>View your awards and recognition here.</p></div>} />
                <Route path="settings" element={<div className="p-6"><h2 className="text-2xl font-bold">Settings</h2><p>Configure your account here.</p></div>} />
                <Route path="support" element={<div className="p-6"><h2 className="text-2xl font-bold">Support</h2><p>Get help and assistance here.</p></div>} />
              </Route>

              {/* Redirect any /app/vendor/* route to /vendor/dashboard */}
              <Route path="/app/vendor/*" element={<Navigate to="/vendor/dashboard" replace />} />
              {/* Redirect any /vendor/:id to /vendor/dashboard */}
              <Route path="/vendor/:id" element={<Navigate to="/vendor/dashboard" replace />} />
            </Routes>
          </Router>
        </NotificationProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;