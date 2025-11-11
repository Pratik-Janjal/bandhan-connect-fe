import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { 
  Building, 
  Package, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  LogOut,
  Plus,
  Edit,
  Eye,
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  TrendingUp,
  Heart,
  CheckCircle,
  X,
  FileText,
  Award,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { vendorAPI } from '../services/api';
import { getSocket } from '../services/api';

interface ServicePackage {
  id: string;
  title: string;
  description: string;
  price: number;
  isActive: boolean;
}

interface ClientLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  status: 'new' | 'contacted' | 'quoted' | 'booked' | 'lost';
  createdAt: string;
}

interface Query {
  id: string;
  from: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
  reply?: string; // Added for replies
}

interface Booking {
  id: string;
  clientName: string;
  service: string;
  date: string;
  status: string;
  amount: number;
  notes: string;
}

interface Review {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
}

interface Earning {
  id: string;
  amount: number;
  date: string;
  source: string;
  notes: string;
}

interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
}

const VendorDashboard: React.FC = () => {
  const location = useLocation();
  const { vendorId: paramVendorId } = useParams<{ vendorId: string }>();
  const { user } = useAuth();
  // Declare searchParams only once
  const searchParams = new URLSearchParams(location.search);
  const urlTab = searchParams.get('tab');
  const vendorId = searchParams.get('vendorId') || paramVendorId || user?.id;
  const [activeTab, setActiveTab] = React.useState(urlTab || 'overview');

  // Keep activeTab in sync with URL
  React.useEffect(() => {
    setActiveTab(urlTab || 'overview');
  }, [urlTab]);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    businessName: '',
    services: [] as string[],
    city: '',
    location: '',
    description: '',
    phone: '',
    email: '',
    website: '',
    rating: 0,
    totalReviews: 0,
    isVerified: false
  });

  // Service packages state
  const [servicePackages, setServicePackages] = useState<ServicePackage[]>([]);

  // Client leads state
  const [clientLeads, setClientLeads] = useState<ClientLead[]>([]);

  // Queries state
  const [queries, setQueries] = useState<Query[]>([]);

  // Analytics state
  const [analytics, setAnalytics] = useState({
    totalLeads: 0,
    convertedLeads: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalBookings: 0,
    monthlyGrowth: 0
  });

  const [newPackage, setNewPackage] = useState({
    title: '',
    description: '',
    price: '',
    isActive: true
  });
  const [showAddPackageModal, setShowAddPackageModal] = useState(false);
  const [packageStatusFilter, setPackageStatusFilter] = useState('all');
  const [packageSearch, setPackageSearch] = useState('');
  const [editPackage, setEditPackage] = useState<ServicePackage | null>(null);
  const [showEditPackageModal, setShowEditPackageModal] = useState(false);
  const [deletePackageId, setDeletePackageId] = useState<string | null>(null);

  const [queryStatusFilter, setQueryStatusFilter] = useState('all');
  const [querySearch, setQuerySearch] = useState('');
  const [replyingQuery, setReplyingQuery] = useState<Query | null>(null);
  const [replyText, setReplyText] = useState('');

  // Bookings, Reviews, Earnings, Documents, Achievements state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // Add state for real and mock data for each tab
  const [realPackages, setRealPackages] = useState<ServicePackage[]>([]);
  const [realLeads, setRealLeads] = useState<ClientLead[]>([]);
  const [realQueries, setRealQueries] = useState<Query[]>([]);
  const [realBookings, setRealBookings] = useState<Booking[]>([]);
  const [realReviews, setRealReviews] = useState<Review[]>([]);
  const [realEarnings, setRealEarnings] = useState<Earning[]>([]);
  const [realDocuments, setRealDocuments] = useState<Document[]>([]);
  const [realAchievements, setRealAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    // Load all vendor data
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profileData, analyticsData, packages, leads, queriesData] = await Promise.all([
          vendorAPI.getVendorProfile(),
          vendorAPI.getVendorAnalytics(),
          vendorAPI.getServicePackages(),
          vendorAPI.getClientLeads(),
          vendorAPI.getQueries()
        ]);
        setProfile(profileData || {});
        setAnalytics(analyticsData || {});
        setServicePackages(packages || []);
        setClientLeads(leads || []);
        setQueries(queriesData || []);
        // TODO: fetch bookings, reviews, earnings, documents, achievements from API if available
      } catch (error) {
        // Fallback to mock data
        setProfile({
          businessName: 'Sample Vendor',
          services: ['Photography', 'Catering'],
          city: 'Sample City',
          location: 'Sample Location',
          description: 'Sample vendor description',
          phone: '1234567890',
          email: 'vendor@example.com',
          website: 'https://vendor.com',
          rating: 4.5,
          totalReviews: 10,
          isVerified: true
        });
        setAnalytics({
          totalLeads: 2,
          convertedLeads: 1,
          totalRevenue: 35000,
          averageRating: 4.5,
          totalBookings: 2,
          monthlyGrowth: 10
        });
        setServicePackages(sampleVendorPackages);
        setClientLeads(sampleVendorLeads.map(lead => ({ ...lead, status: lead.status as 'new' | 'contacted' | 'quoted' | 'booked' | 'lost' })));
        setQueries(sampleVendorQueries.map(query => ({ ...query, status: query.status as 'unread' | 'read' | 'replied' })));
        setBookings(sampleVendorBookings);
        setReviews(sampleVendorReviews);
        setEarnings(sampleVendorEarnings);
        setDocuments(sampleVendorDocuments);
        setAchievements(sampleVendorAchievements);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // Real-time updates
    const socket = getSocket();
    socket.on('vendorLeadUpdated', (lead: ClientLead) => {
      setClientLeads(prev => prev.map(l => l.id === lead.id ? lead : l));
    });
    socket.on('vendorLeadCreated', (lead: ClientLead) => {
      setClientLeads(prev => [lead, ...prev]);
    });
    socket.on('vendorQueryUpdated', (query: Query) => {
      setQueries(prev => prev.map(q => q.id === query.id ? query : q));
    });
    socket.on('vendorQueryCreated', (query: Query) => {
      setQueries(prev => [query, ...prev]);
    });
    return () => {
      socket.off('vendorLeadUpdated');
      socket.off('vendorLeadCreated');
      socket.off('vendorQueryUpdated');
      socket.off('vendorQueryCreated');
    };
  }, [vendorId]);

  // Add useEffect to load real data for each tab on tab switch
  useEffect(() => {
    const fetchTabData = async () => {
      if (activeTab === 'services') {
        setRealPackages(await vendorAPI.getServicePackages());
      } else if (activeTab === 'leads') {
        setRealLeads(await vendorAPI.getClientLeads());
      } else if (activeTab === 'queries') {
        setRealQueries(await vendorAPI.getQueries());
      } else if (activeTab === 'bookings') {
        setRealBookings(await vendorAPI.getBookings());
      } else if (activeTab === 'reviews') {
        setRealReviews(await vendorAPI.getReviews());
      } else if (activeTab === 'earnings') {
        setRealEarnings(await vendorAPI.getEarnings());
      } else if (activeTab === 'documents') {
        setRealDocuments(await vendorAPI.getDocuments());
      } else if (activeTab === 'achievements') {
        setRealAchievements(await vendorAPI.getAchievements());
      }
    };
    fetchTabData();
  }, [activeTab]);

  // Update profile
  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await vendorAPI.updateVendorProfile(profile);
      setShowProfileForm(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Service package CRUD
  const handleAddServicePackage = async () => {
    if (!newPackage.title || !newPackage.description || !newPackage.price) {
      alert('Please fill in all fields');
      return;
    }
    try {
      const pkg = await vendorAPI.addServicePackage({
        title: newPackage.title,
        description: newPackage.description,
        price: parseFloat(newPackage.price),
        isActive: newPackage.isActive
      });
      setServicePackages(prev => [...prev, pkg]);
      setShowAddPackageModal(false);
      setNewPackage({ title: '', description: '', price: '', isActive: true });
    } catch (error) {
      alert('Failed to add package');
    }
  };
  const handleUpdatePackage = async () => {
    if (!editPackage?.title || !editPackage.description || !editPackage.price) {
      alert('Please fill in all fields');
      return;
    }
    try {
      const updated = await vendorAPI.updateServicePackage(editPackage.id, editPackage);
      setServicePackages(prev => prev.map(pkg => pkg.id === editPackage.id ? updated : pkg));
      setShowEditPackageModal(false);
      setEditPackage(null);
    } catch (error) {
      alert('Failed to update package');
    }
  };
  const handleDeletePackage = async () => {
    if (deletePackageId) {
      try {
        await vendorAPI.deleteServicePackage(deletePackageId);
        setServicePackages(prev => prev.filter(pkg => pkg.id !== deletePackageId));
        setDeletePackageId(null);
      } catch (error) {
        alert('Failed to delete package');
      }
    }
  };
  const handleToggleActive = async (pkgId: string) => {
    const pkg = servicePackages.find(p => p.id === pkgId);
    if (pkg) {
      try {
        const updated = await vendorAPI.updateServicePackage(pkgId, { ...pkg, isActive: !pkg.isActive });
        setServicePackages(prev => prev.map(p => p.id === pkgId ? updated : p));
      } catch (error) {
        alert('Failed to update package status');
      }
    }
  };

  // Leads
  const handleUpdateLeadStatus = async (leadId: string, status: ClientLead['status']) => {
    try {
      await vendorAPI.updateLeadStatus(leadId, status);
      setClientLeads(prev => prev.map(lead => lead.id === leadId ? { ...lead, status } : lead));
    } catch (error) {
      alert('Failed to update lead status');
    }
  };

  // Queries
  const handleReplyToQuery = async (queryId: string, reply: string) => {
    try {
      await vendorAPI.replyToQuery(queryId, reply);
      setQueries(prev => prev.map(query => query.id === queryId ? { ...query, status: 'replied', reply } : query));
    } catch (error) {
      alert('Failed to reply to query');
    }
  };

  const handleOpenReplyModal = (query: Query) => {
    setReplyingQuery(query);
    setReplyText('');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      quoted: 'bg-purple-100 text-purple-800',
      booked: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status as keyof typeof statusConfig]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredPackages = servicePackages.filter(pkg => {
    const statusMatch = packageStatusFilter === 'all' || (packageStatusFilter === 'active' ? pkg.isActive : !pkg.isActive);
    const searchMatch = pkg.title.toLowerCase().includes(packageSearch.toLowerCase());
    return statusMatch && searchMatch;
  });

  const handleEditPackage = (pkg: ServicePackage) => {
    setEditPackage(pkg);
    setShowEditPackageModal(true);
  };

  const handleSendReply = () => {
    if (!replyText.trim()) {
      alert('Please enter a reply message');
      return;
    }
    handleReplyToQuery(replyingQuery?.id || '', replyText);
    setReplyingQuery(null);
    setReplyText('');
  };

  // Add new tabs
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'services', label: 'Services', icon: Package },
    { id: 'leads', label: 'Client Leads', icon: Users },
    { id: 'queries', label: 'Queries', icon: MessageSquare },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'profile', label: 'Profile', icon: Building },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support', label: 'Support', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Building className="w-8 h-8 text-saffron mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Vendor Dashboard</h1>
                <p className="text-sm text-gray-500">{profile.businessName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowProfileForm(true)}
                className="btn-outline flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Profile
              </button>
              <button className="btn-outline flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    const params = new URLSearchParams(location.search);
                    params.set('tab', tab.id);
                    window.history.replaceState(null, '', `${location.pathname}?${params.toString()}`);
                    setActiveTab(tab.id);
                  }}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-saffron text-saffron'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Leads</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalLeads}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Converted</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.convertedLeads}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">₹{analytics.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Rating</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.averageRating}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {clientLeads.slice(0, 5).map(lead => (
                    <div key={lead.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{lead.name}</p>
                        <p className="text-sm text-gray-600">{lead.service}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(lead.status)}
                        <span className="text-sm text-gray-500">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Service Packages</h2>
            {/* Render realPackages */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {realPackages.map(pkg => (
                <div key={pkg.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{pkg.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{pkg.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-saffron">₹{pkg.price?.toLocaleString?.() ?? pkg.price}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium focus:outline-none ${pkg.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{pkg.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Client Leads</h2>
              <div className="flex gap-2">
                <select className="input-field">
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="quoted">Quoted</option>
                  <option value="booked">Booked</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {realLeads.map(lead => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{lead.name}</div>
                          <div className="text-sm text-gray-500">{lead.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{lead.service}</td>
                      <td className="px-6 py-4">{getStatusBadge(lead.status)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="w-4 h-4" />
                          </button>
                          <select
                            value={lead.status}
                            onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value as ClientLead['status'])}
                            className="text-sm border rounded px-2 py-1"
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="quoted">Quoted</option>
                            <option value="booked">Booked</option>
                            <option value="lost">Lost</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'queries' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Customer Queries</h2>
              <div className="flex gap-2">
                <select
                  className="input-field w-40"
                  value={queryStatusFilter}
                  onChange={e => setQueryStatusFilter(e.target.value)}
                >
                  <option value="all">All Queries</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                </select>
                <input
                  type="text"
                  className="input-field flex-1"
                  placeholder="Search queries..."
                  value={querySearch}
                  onChange={e => setQuerySearch(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-4">
              {realQueries.map(query => (
                <div key={query.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{query.subject}</h3>
                      <p className="text-sm text-gray-500">From: {query.from}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        query.status === 'unread' ? 'bg-red-100 text-red-800' :
                        query.status === 'read' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {query.status.charAt(0).toUpperCase() + query.status.slice(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(query.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">{query.message}</p>
                  <div className="flex gap-2">
                    <button className="btn-primary text-sm" onClick={() => handleOpenReplyModal(query)}>Reply</button>
                    <button className="btn-outline text-sm" onClick={() => setQueries(prev => prev.map(q => q.id === query.id ? { ...q, status: 'read' } : q))}>Mark as Read</button>
                  </div>
                  {query.reply && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                      <strong>Reply:</strong> {query.reply}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* Reply Modal */}
            {replyingQuery && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Reply to Query</h3>
                    <button
                      onClick={() => setReplyingQuery(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reply Message</label>
                      <textarea
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        className="input-field h-24"
                      />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={handleSendReply}
                        className="btn-primary flex-1"
                      >
                        Send Reply
                      </button>
                      <button
                        onClick={() => setReplyingQuery(null)}
                        className="btn-outline flex-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Bookings</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {realBookings.map(b => (
                    <tr key={b.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{b.clientName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{b.service}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{b.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap capitalize">{b.status}</td>
                      <td className="px-6 py-4 whitespace-nowrap">₹{b.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{b.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
            <ul className="bg-white rounded-lg shadow divide-y">
              {realReviews.map(r => (
                <li key={r.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{r.clientName}</span>
                    <span className="text-yellow-500 text-lg">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  <div className="flex-1 text-gray-700 md:mx-4">{r.comment}</div>
                  <span className="text-xs text-gray-400 md:text-right">{r.date}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {activeTab === 'earnings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Earnings</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {realEarnings.map(e => (
                    <tr key={e.id}>
                      <td className="px-6 py-4 whitespace-nowrap">₹{e.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{e.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{e.source}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{e.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Documents</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {realDocuments.map(d => (
                    <tr key={d.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{d.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{d.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{d.uploadedAt}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><a href={d.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'achievements' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Achievements</h2>
            <ul className="bg-white rounded-lg shadow divide-y">
              {realAchievements.map(a => (
                <li key={a.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{a.title}</span>
                    <span className="text-gray-700">{a.description}</span>
                  </div>
                  <span className="text-xs text-gray-400 md:text-right">{a.date}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Business Profile</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong>Business Name:</strong> {profile.businessName}
                </div>
                <div>
                  <strong>City:</strong> {profile.city}
                </div>
                <div>
                  <strong>Location:</strong> {profile.location}
                </div>
                <div>
                  <strong>Email:</strong> {profile.email}
                </div>
                <div>
                  <strong>Phone:</strong> {profile.phone}
                </div>
                <div>
                  <strong>Website:</strong> <a href={profile.website} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{profile.website}</a>
                </div>
                <div className="md:col-span-2">
                  <strong>Description:</strong> {profile.description}
                </div>
                <div>
                  <strong>Rating:</strong> {profile.rating} ★
                </div>
                <div>
                  <strong>Verified:</strong> {profile.isVerified ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
            <div className="bg-white rounded-lg shadow p-6 text-gray-700">
              <p>Settings functionality coming soon. Here you will be able to update your account, notification preferences, and more.</p>
            </div>
          </div>
        )}
        {activeTab === 'support' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Support</h2>
            <div className="bg-white rounded-lg shadow p-6 text-gray-700">
              <p>Need help? Contact our support team at <a href="mailto:support@bandhaconnect.com" className="text-blue-600 underline">support@bandhaconnect.com</a> or call 1800-123-4567.</p>
              <p className="mt-2">Support features and FAQs will be available here soon.</p>
            </div>
          </div>
        )}
      </main>

      {/* Profile Form Modal */}
      {showProfileForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Profile</h3>
              <button
                onClick={() => setShowProfileForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                  <input
                    type="text"
                    value={profile.businessName}
                    onChange={(e) => setProfile({...profile, businessName: e.target.value})}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(e) => setProfile({...profile, city: e.target.value})}
                    className="input-field"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({...profile, location: e.target.value})}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={profile.description}
                  onChange={(e) => setProfile({...profile, description: e.target.value})}
                  className="input-field h-32"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="input-field"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateProfile}
                  className="btn-primary flex-1"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
                <button
                  onClick={() => setShowProfileForm(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddPackageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Service Package</h3>
              <button
                onClick={() => setShowAddPackageModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={newPackage.title}
                  onChange={e => setNewPackage({ ...newPackage, title: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newPackage.description}
                  onChange={e => setNewPackage({ ...newPackage, description: e.target.value })}
                  className="input-field h-24"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (INR)</label>
                <input
                  type="number"
                  min="0"
                  value={newPackage.price}
                  onChange={e => setNewPackage({ ...newPackage, price: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newPackage.isActive}
                  onChange={e => setNewPackage({ ...newPackage, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-saffron focus:ring-saffron"
                  id="isActive"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">Active</label>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleAddServicePackage}
                  className="btn-primary flex-1"
                >
                  Add Package
                </button>
                <button
                  onClick={() => setShowAddPackageModal(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard; 