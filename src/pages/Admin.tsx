import React, { useState, useEffect } from 'react';
import { adminStats, samplePosts, reportedContent, analyticsData, notifications, announcements } from '../data/sampleData';
import { adminAPI, getSocket, userAPI, supportAPI, vendorAPI, requestAPI, emailAPI, counselorAPI, communityManagementAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  UserCheck, 
  Activity, 
  UserPlus, 
  AlertTriangle, 
  Heart,
  Crown,
  TrendingUp,
  Shield,
  Eye,
  Ban,
  CheckCircle,
  X,
  Star,
  Search,
  Download,
  Trash2,
  MessageSquare,
  Loader,
  Clock,
  Send,
  RefreshCw
} from 'lucide-react';

const Admin: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState(samplePosts);
  const [reports, setReports] = useState(reportedContent);
  const [notificationsList, setNotifications] = useState(notifications);
  const [announcementsList, setAnnouncements] = useState(announcements);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showUserDetails, setShowUserDetails] = useState<string | null>(null);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    targetAudience: 'all'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Moderation tab state
  const [postStatusFilter, setPostStatusFilter] = useState('all');

  // Support tab state
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(() => {
    const saved = localStorage.getItem('adminSelectedTicket');
    return saved ? JSON.parse(saved) : null;
  });

  // Save selected ticket to localStorage whenever it changes
  const setSelectedTicketWithPersistence = (ticket: any) => {
    setSelectedTicket(ticket);
    if (ticket) {
      localStorage.setItem('adminSelectedTicket', JSON.stringify(ticket));
    } else {
      localStorage.removeItem('adminSelectedTicket');
    }
  };
  const [ticketStatusFilter, setTicketStatusFilter] = useState('all');
  const [ticketSearchTerm, setTicketSearchTerm] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [newTicketNotification, setNewTicketNotification] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Vendor tab state
  const [vendors, setVendors] = useState<any[]>([]);
  // const [vendorRequests, setVendorRequests] = useState<any[]>([]);
  // const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  // const [vendorSearchTerm, setVendorSearchTerm] = useState('');
  // const [vendorStatusFilter, setVendorStatusFilter] = useState('all');
  const [showVendorDetails, setShowVendorDetails] = useState<string | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState<string | null>(null);
  const [approvalData, setApprovalData] = useState({
    businessName: '',
    services: [] as string[],
    city: '',
    location: ''
  });
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState<string | null>(null);

  // Role management state
  const [roleRequests, setRoleRequests] = useState<any[]>([]);
  const [approvedRoles, setApprovedRoles] = useState<any[]>([]);
  const [roleSearchTerm, setRoleSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showRoleApprovalModal, setShowRoleApprovalModal] = useState<string | null>(null);
  const [roleApprovalData, setRoleApprovalData] = useState({
    businessName: '',
    services: [] as string[],
    city: '',
    location: '',
    specialization: '',
    experience: '',
    counselingMethods: [] as string[],
    sessionFees: '',
    communityName: '',
    religion: '',
    region: '',
    rules: ''
  });
  const [roleRejectionReason, setRoleRejectionReason] = useState('');
  const [showRoleRejectionModal, setShowRoleRejectionModal] = useState<string | null>(null);

  // Email management state
  const [showTestEmailModal, setShowTestEmailModal] = useState(false);
  const [showBulkEmailModal, setShowBulkEmailModal] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [bulkEmailData, setBulkEmailData] = useState({
    roleType: 'vendor',
    subject: '',
    message: ''
  });
  const [emailStats, setEmailStats] = useState<any>(null);

  // Filtered posts and reports for moderation
  const filteredPosts = postStatusFilter === 'all' ? posts : posts.filter(p => p.status === postStatusFilter);

  // Fetch users, posts, and reports from backend on mount
  useEffect(() => {
    console.log('Admin component mounted, fetching data...');
    
    // Check if user is authenticated and has admin role
    const token = localStorage.getItem('token') || localStorage.getItem('userToken');
    
    console.log('Current user from context:', user);
    console.log('Token exists:', !!token);
    
    // Wait a bit for user context to load
    if (!user && !token) {
      console.error('No authentication token found');
      setError('Please log in to access admin panel.');
      return;
    }
    
    // If token exists but user is not loaded yet, wait for it
    if (token && !user) {
      console.log('Token found but user not loaded yet, waiting...');
      return;
    }
    
    if (!token) {
      console.error('No authentication token found');
      setError('Please log in to access admin panel.');
      return;
    }
    
    // Check for admin role - only allow specific admin credentials
    if (!user?.role || user.role !== 'admin') {
      console.error('User does not have admin role:', user?.role);
      setError('Admin access required. Please log in with admin credentials (admin@bandhan.com).');
      return;
    }
    
    // Additional check for demo admin credentials
    if (user.email !== 'admin@bandhan.com') {
      console.error('User is not authorized admin:', user.email);
      setError('Access denied. Only authorized admin users can access this panel.');
      return;
    }
    
    console.log('Admin authentication verified, fetching data...');
    
    // Request notification permission for new ticket alerts
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    // Fetch all data
    const fetchAllData = async () => {
      try {
        await Promise.all([
          fetchUsers(),
          fetchAnnouncements(),
          fetchPosts(),
          fetchReports(),
          fetchSupportTickets(),
          fetchVendors(),
          fetchVendorRequests(),
          fetchApprovedRoles(),
          fetchEmailStats()
        ]);
        console.log('All data fetched successfully');
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchAllData();
  }, [user]);

  // Validate selected ticket after tickets are loaded
  useEffect(() => {
    if (selectedTicket && supportTickets.length > 0) {
      const ticketExists = supportTickets.find(t => t.id === selectedTicket.id);
      if (!ticketExists) {
        console.log('Selected ticket no longer exists, clearing selection');
        setSelectedTicketWithPersistence(null);
      }
    }
  }, [supportTickets, selectedTicket]);

  const fetchUsers = () => {
    setLoading(true);
    setError(null);
    
    userAPI.getAllUsers()
      .then(data => {
        console.log('Users fetched successfully:', data.length);
        setUsers(data.map((u: any) => ({
          ...u,
          id: u._id,
          avatar: u.avatar || (u.photos && u.photos[0]) || '',
          bio: u.bio || '',
          interests: u.interests || [],
          profession: u.profession || '',
          location: u.location || 'Not specified',
          education: u.education || '',
          age: u.age || '',
          status: u.status, // use backend status directly
          isVerified: u.isVerified,
          isPremium: u.isPremium,
          registrationDate: u.createdAt, // map createdAt to registrationDate for compatibility
        })));
      })
      .catch(err => {
        console.error('Error fetching users:', err);
        setError('Failed to fetch users: ' + (err.message || 'Unknown error'));
      })
      .finally(() => setLoading(false));
  };

  const fetchAnnouncements = () => {
    setError(null);
    
    adminAPI.getAnnouncements()
      .then(data => {
        console.log('Announcements fetched successfully:', data.length);
        setAnnouncements(data.map((a: any) => ({
          ...a,
          id: a._id,
          title: a.title || '',
          content: a.content || '',
          author: a.author || '',
          timestamp: a.timestamp || '',
          isActive: typeof a.isActive === 'boolean' ? a.isActive : true,
          targetAudience: a.targetAudience || ['all'],
        })));
      })
      .catch(err => {
        console.error('Error fetching announcements:', err);
        setError('Failed to fetch announcements: ' + (err.message || 'Unknown error'));
      });
  };

  const fetchPosts = () => {
    setLoading(true);
    userAPI.getAllPosts()
      .then(data => {
        console.log('Raw posts data:', data);
        const normalizedPosts = data.map((p: any) => ({
          ...p,
          id: p._id,
          userAvatar: p.author?.photo || '',
          userName: p.author?.name || '',
          status: p.status || 'pending',
          content: p.content || '',
          likes: p.likes || 0,
          comments: p.comments || 0,
          timestamp: p.timestamp || p.createdAt || '',
        }));
        console.log('Normalized posts:', normalizedPosts);
        setPosts(normalizedPosts);
      })
      .catch(err => {
        console.error('Error fetching posts:', err);
        setError('Failed to fetch posts');
      })
      .finally(() => setLoading(false));
  };

  const fetchReports = () => {
    setLoading(true);
    userAPI.getAllReports()
      .then(data => {
        console.log('Raw reports data:', data);
        const normalizedReports = data.map((r: any) => ({
          ...r,
          id: r._id,
          contentType: r.contentType || '',
          contentId: r.contentId || '',
          reportedBy: r.reportedBy || '',
          reason: r.reason || '',
          status: r.status || 'pending',
          timestamp: r.timestamp || '',
          description: r.description || '',
        }));
        console.log('Normalized reports:', normalizedReports);
        setReports(normalizedReports);
      })
      .catch(err => {
        console.error('Error fetching reports:', err);
        setError('Failed to fetch reports');
      })
      .finally(() => setLoading(false));
  };

  const refreshAllData = async () => {
    console.log('Manual refresh triggered...');
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchUsers(),
        fetchAnnouncements(),
        fetchPosts(),
        fetchReports(),
        fetchSupportTickets()
      ]);
      setLastRefresh(new Date());
      console.log('Manual refresh completed successfully');
    } catch (error) {
      console.error('Error during manual refresh:', error);
      setError('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportTickets = (retryCount = 0) => {
    setLoading(true);
    setError(null); // Clear any previous errors
    
    console.log(`Fetching support tickets (attempt ${retryCount + 1})...`);
    
    supportAPI.getAllTickets()
      .then(data => {
        console.log('Support tickets fetched successfully:', data);
        if (Array.isArray(data)) {
          const normalizedTickets = data.map(t => ({
            ...t,
            id: t._id || t.id, // Handle both _id and id
            subject: t.subject || '',
            message: t.message || '',
            category: t.category || 'general',
            priority: t.priority || 'medium',
            status: t.status || 'open',
            userId: t.userId || {},
            assignedTo: t.assignedTo || null,
            replies: t.replies || [],
            createdAt: t.createdAt || '',
            updatedAt: t.updatedAt || '',
          }));
          console.log('Normalized tickets:', normalizedTickets);
          setSupportTickets(normalizedTickets);
        } else {
          console.error('Invalid data format received:', data);
          setError('Invalid data format received from server');
          setSupportTickets([]);
        }
      })
      .catch(err => {
        console.error('Error fetching support tickets:', err);
        const errorMessage = err.message || 'Unknown error';
        
        // Retry logic for network errors
        if (retryCount < 3 && (errorMessage.includes('Failed to fetch') || errorMessage.includes('Network Error') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ERR_NETWORK'))) {
          setTimeout(() => fetchSupportTickets(retryCount + 1), 2000);
          return;
        }
        
        setError(`Failed to fetch support tickets: ${errorMessage}`);
        
        // If it's an authentication error, redirect to login
        if (errorMessage.includes('Authentication required')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        
        // Set empty array to prevent undefined errors
        setSupportTickets([]);
      })
      .finally(() => setLoading(false));
  };

  const fetchVendors = () => {
    setLoading(true);
    setError(null);
    
    vendorAPI.getAllVendors()
      .then(data => {
        console.log('Vendors fetched successfully:', data.length);
        setVendors(data.map((v: any) => ({
          ...v,
          id: v._id,
          businessName: v.businessName || '',
          services: v.services || [],
          city: v.city || '',
          location: v.location || '',
          status: v.status || 'pending',
          rating: v.rating || 0,
          totalReviews: v.totalReviews || 0,
          isVerified: v.isVerified || false,
          createdAt: v.createdAt,
          user: v.userId ? {
            id: v.userId._id,
            name: v.userId.name,
            email: v.userId.email,
            phone: v.userId.phone
          } : null
        })));
      })
      .catch(err => {
        console.error('Error fetching vendors:', err);
        setError('Failed to fetch vendors: ' + (err.message || 'Unknown error'));
      })
      .finally(() => setLoading(false));
  };

  const fetchApprovedRoles = () => {
    setError(null);
    Promise.all([
      vendorAPI.getAllVendors(),
      counselorAPI.getAllCounselors(),
      communityManagementAPI.getAllCommunities()
    ])
      .then(([vendorsData, counselorsData, communitiesData]) => {
        const allRoles = [
          ...vendorsData.map((v: any) => ({
            ...v,
            id: v._id,
            roleType: 'vendor',
            businessName: v.businessName || '',
            services: v.services || [],
            city: v.city || '',
            location: v.location || '',
            status: v.status || 'active',
            rating: v.rating || 0,
            totalReviews: v.totalReviews || 0,
            isVerified: v.isVerified || false,
            createdAt: v.createdAt,
            user: v.userId ? {
              id: v.userId._id,
              name: v.userId.name,
              email: v.userId.email,
              phone: v.userId.phone
            } : null
          })),
          ...((Array.isArray(counselorsData?.data) ? counselorsData.data : [])).map((c: any) => ({
            ...c,
            id: c._id,
            roleType: 'counselor',
            specialization: c.specialization || '',
            experience: c.experience || 0,
            status: c.status || 'active',
            isVerified: c.isVerified || false,
            createdAt: c.createdAt,
            user: c.userId ? {
              id: c.userId._id,
              name: c.userId.name,
              email: c.userId.email,
              phone: c.userId.phone
            } : null
          })),
          ...((Array.isArray(communitiesData?.data) ? communitiesData.data : [])).map((comm: any) => ({
            ...comm,
            id: comm._id,
            roleType: 'community',
            communityName: comm.communityName || '',
            religion: comm.religion || '',
            region: comm.region || '',
            status: comm.status || 'active',
            isVerified: comm.isVerified || false,
            createdAt: comm.createdAt,
            user: comm.userId ? {
              id: comm.userId._id,
              name: comm.userId.name,
              email: comm.userId.email,
              phone: comm.userId.phone
            } : null
          }))
        ];
        setApprovedRoles(allRoles);
      })
      .catch(err => {
        console.error('Error fetching approved roles:', err);
        setError('Failed to fetch approved roles: ' + (err.message || 'Unknown error'));
      });
  };

  const fetchVendorRequests = () => {
    setError(null);
    
    requestAPI.getAllRequests()
      .then(data => {
        console.log('Role requests fetched successfully:', data.length);
        setRoleRequests(data.map((r: any) => ({
          ...r,
          id: r._id,
          name: r.name || '',
          email: r.email || '',
          phone: r.phone || '',
          roleRequested: r.roleRequested || 'vendor',
          message: r.message || '',
          status: r.status || 'pending',
          createdAt: r.createdAt,
          reviewedBy: r.reviewedBy ? {
            id: r.reviewedBy._id,
            name: r.reviewedBy.name,
            email: r.reviewedBy.email
          } : null
        })));
      })
      .catch(err => {
        console.error('Error fetching role requests:', err);
        setError('Failed to fetch role requests: ' + (err.message || 'Unknown error'));
      });
  };

  // Email management functions
  const fetchEmailStats = () => {
    emailAPI.getEmailStats()
      .then(data => {
        setEmailStats(data.data);
      })
      .catch(err => {
        console.error('Error fetching email stats:', err);
      });
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      setError('Please enter an email address');
      return;
    }

    setLoading(true);
    try {
      await emailAPI.sendTestEmail(testEmail);
      showSuccess('Test email sent successfully!');
      setShowTestEmailModal(false);
      setTestEmail('');
    } catch (err: any) {
      setError('Failed to send test email: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSendBulkEmail = async () => {
    if (!bulkEmailData.subject || !bulkEmailData.message) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const result = await emailAPI.sendBulkNotification(
        bulkEmailData.roleType,
        bulkEmailData.subject,
        bulkEmailData.message
      );
      showSuccess(`Bulk email sent successfully! ${result.summary.successful} delivered, ${result.summary.failed} failed.`);
      setShowBulkEmailModal(false);
      setBulkEmailData({ roleType: 'vendor', subject: '', message: '' });
    } catch (err: any) {
      setError('Failed to send bulk email: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleTicketAction = async (ticketId: string, action: string, value?: any) => {
    setLoading(true);
    setError(null);
    
    console.log(`Performing ticket action: ${action} on ticket ${ticketId} with value:`, value);
    
    try {
      let updatedTicket;
      
      switch (action) {
        case 'status':
          console.log('Updating ticket status to:', value);
          updatedTicket = await supportAPI.updateTicketStatus(ticketId, value);
          break;
        case 'priority':
          console.log('Updating ticket priority to:', value);
          updatedTicket = await supportAPI.updateTicketPriority(ticketId, value);
          break;
        case 'assign':
          console.log('Assigning ticket to:', value);
          updatedTicket = await supportAPI.assignTicket(ticketId, value);
          break;
        case 'reply':
          updatedTicket = await supportAPI.addReply(ticketId, replyMessage);
          setReplyMessage('');
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
      
      // Normalize the updated ticket data
      const normalizedTicket = {
        ...updatedTicket,
        id: updatedTicket._id || updatedTicket.id,
        subject: updatedTicket.subject || '',
        message: updatedTicket.message || '',
        category: updatedTicket.category || 'general',
        priority: updatedTicket.priority || 'medium',
        status: updatedTicket.status || 'open',
        userId: updatedTicket.userId || {},
        assignedTo: updatedTicket.assignedTo || null,
        replies: updatedTicket.replies || [],
        createdAt: updatedTicket.createdAt || '',
        updatedAt: updatedTicket.updatedAt || '',
      };
      
      // Update the tickets list immediately
      setSupportTickets(prev => 
        prev.map(t => t.id === ticketId ? normalizedTicket : t)
      );
      
      // If the ticket is not present or not updated, force refresh
      setTimeout(() => {
        const found = supportTickets.find(t => t.id === ticketId);
        if (!found || (found.status !== normalizedTicket.status || found.priority !== normalizedTicket.priority || found.assignedTo !== normalizedTicket.assignedTo)) {
          fetchSupportTickets();
        }
      }, 500);
      
      // Update selected ticket if it's the one being updated
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicketWithPersistence(normalizedTicket);
      }
      
      showSuccess(`Ticket ${action} updated successfully`);
      
    } catch (err: any) {
      console.error('Error in handleTicketAction:', err);
      const errorMessage = err.message || 'Unknown error';
      setError(`Failed to ${action} ticket: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Initialize Socket.IO connection and listen for real-time events
  useEffect(() => {
    // Only initialize socket if user is authenticated
    const token = localStorage.getItem('token') || localStorage.getItem('userToken');
    if (!token || !user) {
      return;
    }
    
    try {
      const socket = getSocket();
      
      // Set up periodic refresh for tickets (every 30 seconds)
      const ticketRefreshInterval = setInterval(() => {
        fetchSupportTickets();
      }, 30000);
      
      // Handle connection status
      socket.on('connect', () => {
        setIsConnected(true);
      });
      
      socket.on('disconnect', () => {
        setIsConnected(false);
      });
      
      // Cleanup interval on unmount
      return () => {
        clearInterval(ticketRefreshInterval);
      };
    } catch (error) {
      console.error('Error initializing socket:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // fetchSupportTickets is stable (only uses setState functions)
  
  // Socket event listeners
  useEffect(() => {
    // Only set up socket listeners if user is authenticated
    const token = localStorage.getItem('token') || localStorage.getItem('userToken');
    if (!token || !user) {
      return;
    }
    
    try {
      const socket = getSocket();
      
      // Listen for user updates
      socket.on('userUpdated', ({ userId, user }) => {
      setUsers(prevUsers => 
        prevUsers.map(u => u.id === userId ? user : u)
      );
      setRecentActivity(prev => [{
        action: user.status === 'verified' ? 'Profile verified' : user.status === 'active' ? 'Profile activated' : user.status === 'suspended' ? 'Profile suspended' : 'User updated',
        user: user.email || user.name || userId,
        time: 'Just now'
      }, ...prev].slice(0, 10));
    });
    
    // Listen for user deletions
    socket.on('userDeleted', ({ userId }) => {
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      setRecentActivity(prev => [{
        action: 'User deleted',
        user: userId,
        time: 'Just now'
      }, ...prev].slice(0, 10));
    });
    
    // Listen for post updates
    socket.on('postUpdated', ({ postId, post }) => {
      setPosts(prevPosts => 
        prevPosts.map(p => p.id === postId ? post : p)
      );
      setRecentActivity(prev => [{
        action: 'Post updated',
        user: post.author?.name || postId,
        time: 'Just now'
      }, ...prev].slice(0, 10));
    });
    
    // Listen for post deletions
    socket.on('postDeleted', ({ postId }) => {
      setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
      setRecentActivity(prev => [{
        action: 'Post deleted',
        user: postId,
        time: 'Just now'
      }, ...prev].slice(0, 10));
    });
    
    // Listen for report updates
    socket.on('reportUpdated', ({ reportId, report }) => {
      setReports(prevReports => 
        prevReports.map(r => r.id === reportId ? report : r)
      );
    });
    
    // Listen for announcement updates
    socket.on('announcementCreated', ({ announcement }) => {
      setAnnouncements(prev => [announcement, ...prev]);
      setRecentActivity(prev => [{
        action: 'Announcement created',
        user: announcement.author,
        time: 'Just now'
      }, ...prev].slice(0, 10));
    });
    
    socket.on('announcementUpdated', ({ announcement }) => {
      setAnnouncements(prev => 
        prev.map(a => a.id === announcement.id ? announcement : a)
      );
    });
    
    socket.on('announcementDeleted', ({ announcementId }) => {
      setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
    });
    
    // Listen for notification updates
    socket.on('notificationCreated', ({ notification }) => {
      setNotifications(prev => [notification, ...prev]);
    });
    
    // Listen for support ticket updates
    socket.on('supportTicketCreated', ({ ticket }) => {
      console.log('New support ticket created:', ticket);
      const normalizedTicket = {
        ...ticket,
        id: ticket._id || ticket.id,
        subject: ticket.subject || '',
        message: ticket.message || '',
        category: ticket.category || 'general',
        priority: ticket.priority || 'medium',
        status: ticket.status || 'open',
        userId: ticket.userId || {},
        assignedTo: ticket.assignedTo || null,
        replies: ticket.replies || [],
        createdAt: ticket.createdAt || '',
        updatedAt: ticket.updatedAt || '',
      };
      setSupportTickets(prev => [normalizedTicket, ...prev]);
      setRecentActivity(prev => [{
        action: 'Support ticket created',
        user: ticket.userId?.name || 'User',
        time: 'Just now'
      }, ...prev].slice(0, 10));
      
      // Show notification for new ticket
      setNewTicketNotification(`New ticket: ${ticket.subject}`);
      
      // Auto-select the new ticket if no ticket is currently selected
      if (!selectedTicket) {
        setSelectedTicketWithPersistence(normalizedTicket);
      }
      
      // Show browser notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('New Support Ticket', {
          body: `New ticket from ${ticket.userId?.name || 'User'}: ${ticket.subject}`,
          icon: '/favicon.ico'
        });
      }
      
      setTimeout(() => setNewTicketNotification(null), 5000);
    });
    
    socket.on('supportTicketUpdated', ({ ticket }) => {
      const normalizedTicket = {
        ...ticket,
        id: ticket._id || ticket.id,
        subject: ticket.subject || '',
        message: ticket.message || '',
        category: ticket.category || 'general',
        priority: ticket.priority || 'medium',
        status: ticket.status || 'open',
        userId: ticket.userId || {},
        assignedTo: ticket.assignedTo || null,
        replies: ticket.replies || [],
        createdAt: ticket.createdAt || '',
        updatedAt: ticket.updatedAt || '',
      };
      
      // Update the ticket in the list
      setSupportTickets(prev => 
        prev.map(t => t.id === normalizedTicket.id ? normalizedTicket : t)
      );
      
      // Update selected ticket if it's the same one
      if (selectedTicket && selectedTicket.id === normalizedTicket.id) {
        setSelectedTicketWithPersistence(normalizedTicket);
      }
      
      setRecentActivity(prev => [{
        action: 'Support ticket updated',
        user: ticket.userId?.name || 'User',
        time: 'Just now'
      }, ...prev].slice(0, 10));
    });
    
      return () => {
        socket.off('userUpdated');
        socket.off('userDeleted');
        socket.off('postUpdated');
        socket.off('postDeleted');
        socket.off('reportUpdated');
        socket.off('announcementCreated');
        socket.off('announcementUpdated');
        socket.off('announcementDeleted');
        socket.off('notificationCreated');
        socket.off('supportTicketCreated');
        socket.off('supportTicketUpdated');
      };
    } catch (error) {
      console.error('Error setting up socket listeners:', error);
    }
  }, [user]);

  // Periodic refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected && user?.role === 'admin') {
        console.log('Performing periodic refresh...');
        refreshAllData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected, user]);

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+{trend}%</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const getStatusBadge = (status: string | undefined) => {
    if (!status) return null; // Prevents crash if status is missing
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
      suspended: { color: 'bg-red-100 text-red-800', icon: Ban },
      verified: { color: 'bg-blue-100 text-blue-800', icon: Shield }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleUserAction = async (userId: string, action: string) => {
    setLoading(true);
    setError(null);
    
    try {
      let result;
      switch (action) {
        case 'verify':
          result = await adminAPI.verifyUser(userId);
          break;
        case 'suspend':
          result = await adminAPI.suspendUser(userId);
          break;
        case 'activate':
          result = await adminAPI.activateUser(userId);
          break;
        case 'premium':
          result = await adminAPI.makePremium(userId);
          break;
        case 'delete':
          result = await adminAPI.deleteUser(userId);
          break;
        default:
          throw new Error('Invalid action');
      }
      
      // Update local state with the result (Socket.IO will also update it)
      if (action === 'delete') {
        setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      } else {
        setUsers(prevUsers => 
          prevUsers.map(u => u.id === userId ? result : u)
        );
      }
      
      showSuccess(`User ${action}ed successfully`);
      fetchUsers(); // Always refetch users after any action
      console.log(`${action} user ${userId} successful`);
    } catch (err: any) {
      setError(err.message || `Failed to ${action} user`);
      console.error(`Error ${action}ing user:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    for (const userId of selectedUsers) {
      await handleUserAction(userId, action);
    }
    setSelectedUsers([]);
  };

  const handleContentAction = async (contentId: string, action: string, contentType: string) => {
    setLoading(true);
    setError(null);
    
    try {
      let result;
      if (contentType === 'post') {
        switch (action) {
          case 'approve':
            result = await adminAPI.approvePost(contentId);
            break;
          case 'reject':
            result = await adminAPI.rejectPost(contentId);
            break;
          case 'delete':
            result = await adminAPI.deletePost(contentId);
            break;
          default:
            throw new Error('Invalid action');
        }
        fetchPosts(); // Refetch posts after moderation action
      }
      
      showSuccess(`${action} ${contentType} ${contentId} successful`);
      console.log(`${action} ${contentType} ${contentId} successful`);
    } catch (err: any) {
      setError(err.message || `Failed to ${action} ${contentType}`);
      console.error(`Error ${action}ing ${contentType}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = async (reportId: string, action: string) => {
    setLoading(true);
    setError(null);
    
    try {
      let result;
      switch (action) {
        case 'resolve':
          result = await adminAPI.resolveReport(reportId);
          break;
        case 'review':
          result = await adminAPI.reviewReport(reportId);
          break;
        default:
          throw new Error('Invalid action');
      }
      fetchReports(); // Refetch reports after moderation action
      showSuccess(`Report ${action}ed successfully`);
      console.log(`${action} report ${reportId} successful`);
    } catch (err: any) {
      setError(err.message || `Failed to ${action} report`);
      console.error(`Error ${action}ing report:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get admin name from localStorage or fallback
      const adminUser = JSON.parse(localStorage.getItem('user') || '{}');
      const author = adminUser?.name || 'Admin';
      await adminAPI.createAnnouncement({ ...newAnnouncement, author });
      setNewAnnouncement({ title: '', content: '', targetAudience: 'all' });
      setShowAnnouncementForm(false);
      showSuccess('Announcement created successfully');
      fetchAnnouncements(); // Refetch announcements after creation
    } catch (err: any) {
      setError(err.message || 'Failed to create announcement');
      console.error('Error creating announcement:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAnnouncement = async (announcementId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await adminAPI.toggleAnnouncement(announcementId);
      showSuccess('Announcement toggled successfully');
      fetchAnnouncements(); // Refetch announcements after toggle
    } catch (err: any) {
      setError(err.message || 'Failed to toggle announcement');
      console.error('Error toggling announcement:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    setLoading(true);
    setError(null);
    try {
      await adminAPI.deleteAnnouncement(announcementId);
      showSuccess('Announcement deleted successfully');
      fetchAnnouncements();
    } catch (err: any) {
      setError(err.message || 'Failed to delete announcement');
      console.error('Error deleting announcement:', err);
    } finally {
      setLoading(false);
    }
  };

  // Vendor action handlers
  const handleVendorAction = async (vendorId: string, action: string) => {
    setLoading(true);
    setError(null);
    
    try {
      let result;
      
      switch (action) {
        case 'activate':
          result = await vendorAPI.updateVendorStatus(vendorId, 'active');
          break;
        case 'suspend':
          result = await vendorAPI.updateVendorStatus(vendorId, 'suspended');
          break;
        case 'verify':
          // Update vendor verification status
          setVendors(prev => prev.map(v => 
            v.id === vendorId ? { ...v, isVerified: true } : v
          ));
          showSuccess('Vendor verified successfully');
          return;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
      
      // Update vendors list
      setVendors(prev => prev.map(v => 
        v.id === vendorId ? { ...v, ...result.vendor } : v
      ));
      
      showSuccess(`Vendor ${action} successful`);
      
    } catch (err: any) {
      setError(err.message || `Failed to ${action} vendor`);
      console.error(`Error ${action}ing vendor:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleVendorRequestAction = async (requestId: string, action: string) => {
    setLoading(true);
    setError(null);
    
    try {
      if (action === 'approve') {
        const result = await vendorAPI.approveVendorRequest(requestId, approvalData);
        showSuccess(`Vendor request approved. Temporary password: ${result.tempPassword}`);
        // Clear approval modal
        setShowApprovalModal(null);
        setApprovalData({ businessName: '', services: [], city: '', location: '' });
        // Refresh data
        await fetchApprovedRoles();
        await fetchVendorRequests();
        await fetchVendors();
      } else if (action === 'reject') {
        await vendorAPI.rejectVendorRequest(requestId, rejectionReason);
        showSuccess('Vendor request rejected');
        // Clear rejection modal
        setShowRejectionModal(null);
        setRejectionReason('');
        // Refresh data
        await fetchApprovedRoles();
        await fetchVendorRequests();
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${action} vendor request`);
      console.error(`Error ${action}ing vendor request:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleRequestAction = async (requestId: string, action: string, reason?: string) => {
    setLoading(true);
    setError(null);
    console.log(`🔄 Starting ${action} process for request:`, requestId);
    try {
      if (action === 'approve') {
        console.log('📧 Calling approveRequest API...');
        const result = await requestAPI.approveRequest(requestId, {});
        console.log('✅ Approval API response:', result);
        showSuccess('Role application approved successfully! Email with login credentials has been sent. Please check spam/junk folder if email is not received.');
        setShowRoleApprovalModal(null);
      } else if (action === 'reject') {
        console.log('📧 Calling rejectRequest API...');
        const result = await requestAPI.rejectRequest(requestId, { reason });
        console.log('✅ Rejection API response:', result);
        showSuccess('Role application rejected');
        setShowRoleRejectionModal(null);
        setRejectionReason('');
      }
      console.log('🔄 Refreshing data...');
      await fetchApprovedRoles();
      await fetchVendorRequests();
      // Do not clear setRoleRequests([]); let it update from fetch
      console.log('✅ Data refresh completed');
    } catch (err: any) {
      console.error(`❌ Error ${action}ing role application:`, err);
      setError(err.message || `Failed to ${action} role application`);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.businessName.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
                         vendor.city.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
                         (vendor.user?.name && vendor.user.name.toLowerCase().includes(vendorSearchTerm.toLowerCase()));
    const matchesStatus = vendorStatusFilter === 'all' || vendor.status === vendorStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  // Check if user has proper admin access
  const hasAdminAccess = user?.role === 'admin' && user?.email === 'admin@bandhan.com';

  // 1. Export to CSV for User Tab
  const exportUsersToCSV = () => {
    if (!filteredUsers.length) return;
    const replacer = (key: string, value: any) => (value === null ? '' : value);
    const header = [
      'name', 'email', 'age', 'profession', 'location', 'education', 'status', 'isVerified', 'isPremium', 'registrationDate'
    ];
    const csv = [
      header.join(','),
      ...filteredUsers.map(user =>
        header.map(fieldName => JSON.stringify(user[fieldName], replacer)).join(',')
      )
    ].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fade-in">
      {/* Access Denied Screen */}
      {!hasAdminAccess && (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-6">
              <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
              <p className="text-gray-600 mb-4">
                This admin panel is restricted to authorized demo admin users only.
              </p>
            </div>
            
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Demo Admin Credentials:</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div><strong>Email:</strong> admin@bandhan.com</div>
                <div><strong>Password:</strong> password</div>
              </div>
            </div>
            
            <button
              onClick={() => window.location.href = '/login'}
              className="btn-primary w-full"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}

      {/* Admin Panel Content - Only show if user has admin access */}
      {hasAdminAccess && (
        <>
          {/* Error Notification */}
          {error && (
            <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
              <div className="flex items-center justify-between">
                <span>{error}</span>
                <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Success Notification */}
      {success && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50">
          <div className="flex items-center justify-between">
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="text-green-700 hover:text-green-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* New Ticket Notification */}
      {newTicketNotification && (
        <div className="fixed top-4 left-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded z-50">
          <div className="flex items-center justify-between">
            <span>{newTicketNotification}</span>
            <button onClick={() => setNewTicketNotification(null)} className="text-blue-700 hover:text-blue-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <Loader className="w-6 h-6 animate-spin text-saffron" />
            <span>Processing...</span>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage users, content, and platform analytics</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            
            {/* Last Refresh */}
            <div className="text-sm text-gray-500">
              Last refresh: {lastRefresh.toLocaleTimeString()}
            </div>
            
            {/* Manual Refresh Button */}
            <button
              onClick={refreshAllData}
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Refresh
            </button>
          </div>
        </div>
        
        {/* New Ticket Notification */}
        {newTicketNotification && (
          <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-blue-800">{newTicketNotification}</span>
              <button
                onClick={() => setNewTicketNotification(null)}
                className="text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </div>
          </div>
        )}
        
        {/* Debug Information */}
        <div className="mt-4 p-3 bg-gray-100 rounded-lg text-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <strong>User ID:</strong> {user?.id || 'Not set'}
            </div>
            <div>
              <strong>User Email:</strong> {user?.email || 'Not set'}
            </div>
            <div>
              <strong>User Role:</strong> {user?.role || 'Not set'}
            </div>
            <div>
              <strong>Token:</strong> {localStorage.getItem('token') ? 'Present' : 'Missing'}
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-600">
            <strong>Note:</strong> Admin access is restricted to authorized demo admin credentials only.
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'users', label: 'Users' },
          { id: 'manage-roles', label: 'Manage Roles' },
          { id: 'moderation', label: 'Moderation' },
          { id: 'support', label: 'Support' },
          { id: 'analytics', label: 'Analytics' },
          { id: 'communication', label: 'Communication' },
          { id: 'email', label: 'Email Management' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-saffron shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Users"
              value={adminStats.totalUsers}
              icon={Users}
              color="bg-blue-500"
              trend={12}
            />
            <StatCard
              title="Verified Users"
              value={adminStats.verifiedUsers}
              icon={UserCheck}
              color="bg-green-500"
              trend={8}
            />
            <StatCard
              title="Active Users"
              value={adminStats.activeUsers}
              icon={Activity}
              color="bg-teal"
              trend={15}
            />
            <StatCard
              title="Premium Users"
              value={adminStats.premiumUsers}
              icon={Crown}
              color="bg-purple-500"
              trend={25}
            />
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="New Registrations"
              value={adminStats.newRegistrations}
              icon={UserPlus}
              color="bg-orange-500"
            />
            <StatCard
              title="Pending Verifications"
              value={adminStats.pendingVerifications}
              icon={Shield}
              color="bg-yellow-500"
            />
            <StatCard
              title="Reported Profiles"
              value={adminStats.reportedProfiles}
              icon={AlertTriangle}
              color="bg-red-500"
            />
            <StatCard
              title="Successful Matches"
              value={adminStats.successfulMatches}
              icon={Heart}
              color="bg-pink-500"
            />
          </div>

          {/* Recent Activity */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-gray-500">No recent activity yet.</div>
              ) : (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.user}</p>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10 w-64"
                />
              </div>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="verified">Verified</option>
              </select>
              <button className="btn-secondary flex items-center gap-2" onClick={exportUsersToCSV}>
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="card p-4 bg-blue-50 border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  {selectedUsers.length} user(s) selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkAction('verify')}
                    className="btn-primary text-sm"
                    disabled={loading}
                  >
                    {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Verify All
                  </button>
                  <button
                    onClick={() => handleBulkAction('suspend')}
                    className="btn-secondary text-sm"
                    disabled={loading}
                  >
                    {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Suspend All
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    disabled={loading}
                  >
                    {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Delete All
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, user.id]);
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={user.avatar}
                            alt={user.name}
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.age} years • {user.profession}</div>
                            {user.isPremium && (
                              <div className="flex items-center mt-1">
                                <Star className="w-3 h-3 text-yellow-500 mr-1" />
                                <span className="text-xs text-yellow-600">Premium</span>
                          </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{user.location}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.registrationDate ? new Date(user.registrationDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setShowUserDetails(user.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {!user.isVerified && (
                          <button
                            onClick={() => handleUserAction(user.id, 'verify')}
                            className="text-green-600 hover:text-green-900"
                              title="Verify User"
                              disabled={loading}
                          >
                              {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          )}
                          {user.status === 'active' && (
                          <button
                              onClick={() => handleUserAction(user.id, 'suspend')}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Suspend User"
                              disabled={loading}
                            >
                              {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                            <Ban className="w-4 h-4" />
                            </button>
                          )}
                          {user.status === 'suspended' && (
                            <button
                              onClick={() => handleUserAction(user.id, 'activate')}
                              className="text-green-600 hover:text-green-900"
                              title="Activate User"
                              disabled={loading}
                            >
                              {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {!user.isPremium && (
                            <button
                              onClick={() => handleUserAction(user.id, 'premium')}
                              className="text-purple-600 hover:text-purple-900"
                              title="Make Premium"
                              disabled={loading}
                            >
                              {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                              <Crown className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleUserAction(user.id, 'delete')}
                            className="text-red-600 hover:text-red-900"
                            title="Delete User"
                            disabled={loading}
                          >
                            {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">User Details</h3>
              <button
                onClick={() => setShowUserDetails(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {(() => {
              const user = users.find(u => u.id === showUserDetails);
              if (!user) return <div className="text-gray-500">User not found.</div>;
              return (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={user.avatar || ''}
                      alt={user.name || 'User'}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="text-xl font-semibold">{user.name || 'N/A'}</h4>
                      <p className="text-gray-600">{user.age ? `${user.age} years old` : ''} {user.profession && `• ${user.profession}`}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        {getStatusBadge(user.status)}
                        {user.isPremium && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Star className="w-3 h-3 mr-1" />
                            Premium
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Location</label>
                      <p className="text-gray-900">{user.location || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Education</label>
                      <p className="text-gray-900">{user.education || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Last Active</label>
                      <p className="text-gray-900">{user.lastActive || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Registration Date</label>
                      <p className="text-gray-900">{user.registrationDate ? new Date(user.registrationDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Bio</label>
                    <p className="text-gray-900 mt-1">{user.bio || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Interests</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(user.interests && user.interests.length > 0) ? user.interests.map((interest: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                        >
                          {interest}
                        </span>
                      )) : <span className="text-gray-500">N/A</span>}
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <button
                      onClick={() => setShowUserDetails(null)}
                      className="btn-secondary"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        handleUserAction(user.id, 'verify');
                        setShowUserDetails(null);
                      }}
                      className="btn-primary"
                      disabled={loading}
                    >
                      {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Verify User
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Manage Roles Tab */}
      {activeTab === 'manage-roles' && (
        <div className="space-y-6">
          {/* Role Requests Section */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Role Applications</h3>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">
                {roleRequests.filter(r => r.status === 'pending').length} pending
              </span>
            </div>
            
            {roleRequests.length === 0 ? (
              <div className="text-center text-gray-400">No role applications found.</div>
            ) : (
              <div className="space-y-4">
                {roleRequests.map(request => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {request.status}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            request.roleRequested === 'vendor' ? 'bg-blue-100 text-blue-800' :
                            request.roleRequested === 'counselor' ? 'bg-purple-100 text-purple-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {request.roleRequested.charAt(0).toUpperCase() + request.roleRequested.slice(1)}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900">{request.name}</h4>
                        <p className="text-sm text-gray-600">{request.email} • {request.phone}</p>
                        {request.message && (
                          <p className="text-sm text-gray-600 mt-2">{request.message}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Submitted: {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>
                      {request.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setShowRoleApprovalModal(request.id)}
                            className="text-green-600 hover:text-green-900 text-sm px-3 py-1 border border-green-300 rounded"
                            disabled={loading}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setShowRoleRejectionModal(request.id)}
                            className="text-red-600 hover:text-red-900 text-sm px-3 py-1 border border-red-300 rounded"
                            disabled={loading}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Approved Roles Section */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Approved Roles</h3>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search roles..."
                    value={roleSearchTerm}
                    onChange={(e) => setRoleSearchTerm(e.target.value)}
                    className="input-field pl-10 w-64"
                  />
                </div>
                <select 
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="all">All Roles</option>
                  <option value="vendor">Vendors</option>
                  <option value="counselor">Counselors</option>
                  <option value="community">Communities</option>
                </select>
              </div>
            </div>

            {/* Filter roles by type and search */}
            {(() => {
              const filteredRoles = approvedRoles.filter(role => {
                const matchesType = roleFilter === 'all' || role.roleType === roleFilter;
                const matchesSearch =
                  (role.roleType === 'vendor' && role.businessName?.toLowerCase().includes(roleSearchTerm.toLowerCase())) ||
                  (role.roleType === 'counselor' && role.specialization?.toLowerCase().includes(roleSearchTerm.toLowerCase())) ||
                  (role.roleType === 'community' && role.communityName?.toLowerCase().includes(roleSearchTerm.toLowerCase()));
                return matchesType && matchesSearch;
              });
              return filteredRoles.length === 0 ? (
                <div className="text-center text-gray-400">No approved roles found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRoles.map(role => (
                        <tr key={role.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {role.roleType === 'vendor' ? role.businessName : 
                                   role.roleType === 'counselor' ? role.specialization : 
                                   role.communityName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {role.user?.name} • {role.user?.email}
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  role.roleType === 'vendor' ? 'bg-blue-100 text-blue-800' :
                                  role.roleType === 'counselor' ? 'bg-purple-100 text-purple-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {role.roleType.charAt(0).toUpperCase() + role.roleType.slice(1)}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {role.roleType === 'vendor' && (
                                <div className="flex flex-wrap gap-1">
                                  {role.services?.slice(0, 3).map((service: string, index: number) => (
                                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                      {service}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {role.roleType === 'counselor' && (
                                <div>
                                  <div className="text-sm">{role.specialization}</div>
                                  <div className="text-xs text-gray-500">{role.experience} years experience</div>
                                </div>
                              )}
                              {role.roleType === 'community' && (
                                <div>
                                  <div className="text-sm">{role.religion}</div>
                                  <div className="text-xs text-gray-500">{role.region}</div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {role.user?.phone}
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(role.status)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setShowVendorDetails(role.id)}
                                className="text-blue-600 hover:text-blue-900"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (role.roleType === 'vendor') {
                                    window.open(`/vendor/dashboard?vendorId=${role.id}`, '_blank');
                                  } else if (role.roleType === 'counselor') {
                                    window.open(`/app/counselor/${role.id}`, '_blank');
                                  } else if (role.roleType === 'community') {
                                    window.open(`/app/community/${role.id}`, '_blank');
                                  }
                                }}
                                className="text-green-600 hover:text-green-900"
                                title="View Dashboard"
                              >
                                <Users className="w-4 h-4" />
                              </button>
                              {role.status === 'active' && (
                                <button
                                  onClick={() => handleVendorAction(role.id, 'suspend')}
                                  className="text-yellow-600 hover:text-yellow-900"
                                  title="Suspend"
                                  disabled={loading}
                                >
                                  <Ban className="w-4 h-4" />
                                </button>
                              )}
                              {role.status === 'suspended' && (
                                <button
                                  onClick={() => handleVendorAction(role.id, 'activate')}
                                  className="text-green-600 hover:text-green-900"
                                  title="Activate"
                                  disabled={loading}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Moderation Tab */}
      {activeTab === 'moderation' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Content Moderation</h2>

          {/* Reported Content */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Reported Content</h3>
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">
                {reports.filter(r => r.status === 'pending').length} pending
              </span>
            </div>
            {loading ? (
              <div className="text-center text-gray-500">Loading reports...</div>
            ) : reports.length === 0 ? (
              <div className="text-center text-gray-400">No reports found.</div>
            ) : (
              reports.map(report => (
                <div key={report.id} className="border rounded-lg p-4 mb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {report.status}
                        </span>
                        <span className="text-sm text-gray-500">{report.contentType}</span>
                      </div>
                      <h4 className="font-medium text-gray-900">{report.reason}</h4>
                      <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Reported by: {report.reportedBy}</span>
                        <span>{report.timestamp ? new Date(report.timestamp).toLocaleDateString() : ''}</span>
                      </div>
                    </div>
                    {report.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleReportAction(report.id, 'resolve')}
                          className="text-green-600 hover:text-green-900 text-sm"
                          disabled={loading}
                        >
                          {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                          Resolve
                        </button>
                        <button
                          onClick={() => handleReportAction(report.id, 'review')}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                          disabled={loading}
                        >
                          {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                          Review
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Posts Moderation */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Posts Moderation</h3>
              <select className="input-field text-sm" value={postStatusFilter} onChange={e => setPostStatusFilter(e.target.value)}>
                <option value="all">All Posts</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            {loading ? (
              <div className="text-center text-gray-500">Loading posts...</div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center text-gray-400">No posts found.</div>
            ) : (
              filteredPosts.map(post => (
                <div key={post.id} className="border rounded-lg p-4 mb-3">
                  <div className="flex items-start gap-4">
                    <img
                      src={post.userAvatar}
                      alt={post.userName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900">{post.userName}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          post.status === 'approved' ? 'bg-green-100 text-green-800' :
                          post.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {post.status}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{post.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{post.likes} likes</span>
                        <span>{post.comments} comments</span>
                        <span>{post.timestamp ? new Date(post.timestamp).toLocaleDateString() : ''}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {post.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleContentAction(post.id, 'approve', 'post')}
                            className="text-green-600 hover:text-green-900"
                            title="Approve Post"
                            disabled={loading}
                          >
                            {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleContentAction(post.id, 'reject', 'post')}
                            className="text-red-600 hover:text-red-900"
                            title="Reject Post"
                            disabled={loading}
                          >
                            {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleContentAction(post.id, 'delete', 'post')}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Post"
                        disabled={loading}
                      >
                        {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Support Tab */}
      {activeTab === 'support' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Support Ticket Management</h2>
            <div className="text-sm text-gray-500">
              Total Tickets: {supportTickets.length}
            </div>
          </div>
          
          {/* Support Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Open Tickets</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {supportTickets.filter(t => t.status === 'open').length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {supportTickets.filter(t => t.status === 'in_progress').length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {supportTickets.filter(t => t.status === 'resolved').length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Urgent</p>
                  <p className="text-2xl font-bold text-red-600">
                    {supportTickets.filter(t => t.priority === 'urgent').length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Tickets List - Takes 1/4 of the space */}
            <div className="xl:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">Tickets</h3>
                      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} title={isConnected ? 'Connected' : 'Disconnected'}></div>
                    </div>
                    <button
                      onClick={() => fetchSupportTickets()}
                      disabled={loading}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      title="Refresh tickets"
                    >
                      <Loader className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search tickets..."
                      value={ticketSearchTerm}
                      onChange={(e) => setTicketSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-saffron focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="mb-4">
                  <select
                    value={ticketStatusFilter}
                    onChange={(e) => setTicketStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-saffron focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                {/* Tickets List */}
                <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-red-700">{error}</p>
                        <button
                          onClick={() => setError(null)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {loading ? (
                    <div className="text-center py-8">
                      <Loader className="w-6 h-6 animate-spin mx-auto text-saffron" />
                      <p className="text-sm text-gray-500 mt-2">Loading tickets...</p>
                    </div>
                  ) : supportTickets.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No tickets found</p>
                      <button
                        onClick={() => fetchSupportTickets()}
                        className="mt-2 text-sm text-saffron hover:text-orange-600"
                      >
                        Refresh
                      </button>
                    </div>
                  ) : (
                    supportTickets
                      .filter(ticket => {
                        console.log('Ticket status:', ticket.status, 'Filter:', ticketStatusFilter);
                        const matchesStatus = ticketStatusFilter === 'all' || ticket.status === ticketStatusFilter;
                        const matchesSearch = ticket.subject.toLowerCase().includes(ticketSearchTerm.toLowerCase()) ||
                                             ticket.message.toLowerCase().includes(ticketSearchTerm.toLowerCase());
                        return matchesStatus && matchesSearch;
                      })
                      .map(ticket => (
                        <div
                          key={ticket.id}
                          onClick={() => {
                            console.log('Ticket clicked:', ticket);
                            setSelectedTicketWithPersistence(ticket);
                          }}
                          className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                            selectedTicket?.id === ticket.id
                              ? 'border-saffron bg-saffron/10 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          } ${ticket.status === 'open' && !ticket.assignedTo ? 'border-l-4 border-l-blue-500' : ''}`}
                        >
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-900 text-sm leading-tight">{ticket.subject}</h4>
                            <p className="text-xs text-gray-500 line-clamp-2">{ticket.message}</p>
                            <div className="flex items-center gap-1">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                ticket.status === 'open' ? 'bg-blue-100 text-blue-700' :
                                ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                                ticket.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {ticket.status.replace('_', ' ')}
                              </span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                ticket.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                ticket.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                ticket.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {ticket.priority}
                              </span>
                            </div>
                            <div className="text-xs text-gray-400">
                              {ticket.userId?.name || 'Unknown'} • {new Date(ticket.createdAt).toLocaleDateString()}
                              {new Date(ticket.createdAt) > new Date(Date.now() - 5 * 60 * 1000) && (
                                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  New
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            {/* Ticket Details - Takes 3/4 of the space */}
            <div className="xl:col-span-3">
              {selectedTicket && selectedTicket.id ? (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedTicket.subject}</h3>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          selectedTicket.status === 'open' ? 'bg-blue-100 text-blue-700' :
                          selectedTicket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                          selectedTicket.status === 'resolved' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {selectedTicket.status.replace('_', ' ')}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          selectedTicket.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                          selectedTicket.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          selectedTicket.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {selectedTicket.priority}
                        </span>
                        <span className="text-sm text-gray-500">
                          #{selectedTicket.id.slice(-6)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedTicketWithPersistence(null)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Ticket Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">User</label>
                      <p className="text-sm font-medium text-gray-900 mt-1">{selectedTicket.userId?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{selectedTicket.userId?.email || 'No email'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Category</label>
                      <p className="text-sm font-medium text-gray-900 mt-1 capitalize">{selectedTicket.category}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Created</label>
                      <p className="text-sm font-medium text-gray-900 mt-1">{new Date(selectedTicket.createdAt).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500">{new Date(selectedTicket.createdAt).toLocaleTimeString()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Assigned To</label>
                      <p className="text-sm font-medium text-gray-900 mt-1">{selectedTicket.assignedTo?.name || 'Unassigned'}</p>
                    </div>
                  </div>

                  {/* Original Message */}
                  <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-900">Original Message</span>
                      <span className="text-xs text-gray-500">
                        {new Date(selectedTicket.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{selectedTicket.message}</p>
                  </div>

                  {/* Replies Section */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Conversation</h4>
                    <div className="space-y-4">
                      {selectedTicket.replies && selectedTicket.replies.length > 0 ? (
                        selectedTicket.replies.map((reply: any, index: number) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border ${
                              reply.isAdmin 
                                ? 'bg-blue-50 border-blue-200 ml-8' 
                                : 'bg-gray-50 border-gray-200 mr-8'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-gray-900">
                                {reply.isAdmin ? 'Support Team' : reply.userId?.name || 'User'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(reply.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">{reply.message}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No replies yet</p>
                        </div>
                      )}
                    </div>
                  </div>

                                      {/* Admin Actions */}
                    <div className="border-t pt-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h4>
                      

                    
                    {/* Action Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                          value={selectedTicket.status}
                          onChange={(e) => handleTicketAction(selectedTicket.id, 'status', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-saffron focus:border-transparent"
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                        <select
                          value={selectedTicket.priority}
                          onChange={(e) => handleTicketAction(selectedTicket.id, 'priority', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-saffron focus:border-transparent"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Assign To</label>
                        <select
                          value={selectedTicket.assignedTo?._id || ''}
                          onChange={(e) => handleTicketAction(selectedTicket.id, 'assign', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-saffron focus:border-transparent"
                        >
                          <option value="">Unassigned</option>
                          {users.filter(u => u.role === 'admin').map(admin => (
                            <option key={admin.id} value={admin.id}>{admin.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Reply Section */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Add Reply</label>
                      <div className="flex gap-3">
                        <textarea
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder="Type your reply to the user..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-saffron focus:border-transparent resize-none"
                          rows={4}
                        />
                        <button
                          onClick={() => handleTicketAction(selectedTicket.id, 'reply')}
                          disabled={!replyMessage.trim() || loading}
                          className="px-4 py-2 bg-saffron text-white rounded-md hover:bg-saffron/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 self-end"
                        >
                          {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-12">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Ticket</h3>
                    <p className="text-gray-500">Choose a ticket from the list to view details and manage</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Analytics & Insights</h2>
          
          {/* Analytics Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Daily Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.engagementMetrics.dailyActiveUsers}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Messages/Day</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.engagementMetrics.messagesPerDay}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Matches/Day</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.engagementMetrics.matchesPerDay}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-pink-500 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Profile Completion</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.engagementMetrics.profileCompletionRate}%</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth Chart */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
              <div className="space-y-3">
                {analyticsData.userGrowth.map((data, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{data.month}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">+{data.newUsers}</span>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(data.users / 1200) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{data.users}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Geographic Distribution */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h3>
              <div className="space-y-3">
                {analyticsData.geographicDistribution.map((data, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{data.city}</span>
                    <div className="flex items-center gap-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${data.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{data.users}</span>
                      <span className="text-sm text-gray-500">({data.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Revenue Analytics */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Monthly Revenue</h4>
                <div className="space-y-2">
                  {analyticsData.revenueData.slice(-6).map((data, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{data.month}</span>
                      <div className="flex items-center gap-4">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full" 
                            style={{ width: `${(data.revenue / 65000) * 100}%` }}
                          ></div>
              </div>
                        <span className="text-sm font-medium">₹{data.revenue.toLocaleString()}</span>
              </div>
              </div>
                  ))}
              </div>
            </div>
              
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Premium Subscriptions</h4>
                <div className="space-y-2">
                  {analyticsData.revenueData.slice(-6).map((data, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{data.month}</span>
                      <div className="flex items-center gap-4">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${(data.subscriptions / 65) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{data.subscriptions}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Engagement Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Session Duration</h4>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{analyticsData.engagementMetrics.averageSessionDuration}</p>
                <p className="text-sm text-gray-600">Average per user</p>
              </div>
            </div>
            
            <div className="card p-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Response Rate</h4>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{analyticsData.engagementMetrics.responseRate}%</p>
                <p className="text-sm text-gray-600">Message responses</p>
              </div>
            </div>
            
            <div className="card p-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Weekly Active Users</h4>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{analyticsData.engagementMetrics.weeklyActiveUsers}</p>
                <p className="text-sm text-gray-600">Active this week</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Communication Tab */}
      {activeTab === 'communication' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Communication Management</h2>
          
          {/* Communication Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Announcements</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {announcementsList.filter(a => a.isActive).length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Unread Notifications</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {notificationsList.filter(n => !n.isRead).length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-yellow-500 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Announcements Management */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Announcements</h3>
              <button
                onClick={() => setShowAnnouncementForm(true)}
                className="btn-primary"
              >
                Create Announcement
              </button>
            </div>
            
            <div className="space-y-4">
              {announcementsList.map(announcement => (
                <div key={announcement.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900">{announcement.title}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          announcement.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {announcement.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {announcement.targetAudience}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{announcement.content}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>By: {announcement.author}</span>
                        <span>{new Date(announcement.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleToggleAnnouncement(announcement.id)}
                        className={`text-sm ${
                          announcement.isActive 
                            ? 'text-yellow-600 hover:text-yellow-900' 
                            : 'text-green-600 hover:text-green-900'
                        }`}
                        disabled={loading}
                      >
                        {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                        {announcement.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                        disabled={loading}
                      >
                        {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Notifications</h3>
            <div className="space-y-3">
              {notificationsList.map(notification => (
                <div key={notification.id} className={`p-3 rounded-lg border ${
                  notification.isRead ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{notification.title}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                          notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {notification.priority}
                        </span>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <span className="text-xs text-gray-500">
                        {new Date(notification.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Announcement Form Modal */}
          {showAnnouncementForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Create Announcement</h3>
                  <button
                    onClick={() => setShowAnnouncementForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                      className="input-field w-full"
                      placeholder="Announcement title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content
                    </label>
                    <textarea
                      value={newAnnouncement.content}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                      className="input-field w-full h-32"
                      placeholder="Announcement content"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Audience
                    </label>
                    <select
                      value={newAnnouncement.targetAudience}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, targetAudience: e.target.value})}
                      className="input-field w-full"
                    >
                      <option value="all">All Users</option>
                      <option value="free_users">Free Users</option>
                      <option value="premium_users">Premium Users</option>
                      <option value="verified_users">Verified Users</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <button
                      onClick={() => setShowAnnouncementForm(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateAnnouncement}
                      className="btn-primary"
                      disabled={!newAnnouncement.title || !newAnnouncement.content || loading}
                    >
                      {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Create Announcement
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vendor Approval Modal */}
          {showApprovalModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Approve Vendor Request</h3>
                  <button
                    onClick={() => setShowApprovalModal(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      value={approvalData.businessName}
                      onChange={(e) => setApprovalData({...approvalData, businessName: e.target.value})}
                      className="input-field w-full"
                      placeholder="Enter business name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Services *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['catering', 'makeup', 'photography', 'decoration', 'music', 'transport', 'jewelry', 'clothing', 'venue', 'other'].map(service => (
                        <label key={service} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={approvalData.services.includes(service)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setApprovalData({
                                  ...approvalData,
                                  services: [...approvalData.services, service]
                                });
                              } else {
                                setApprovalData({
                                  ...approvalData,
                                  services: approvalData.services.filter(s => s !== service)
                                });
                              }
                            }}
                            className="rounded border-gray-300 mr-2"
                          />
                          <span className="text-sm capitalize">{service}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={approvalData.city}
                        onChange={(e) => setApprovalData({...approvalData, city: e.target.value})}
                        className="input-field w-full"
                        placeholder="Enter city"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location *
                      </label>
                      <input
                        type="text"
                        value={approvalData.location}
                        onChange={(e) => setApprovalData({...approvalData, location: e.target.value})}
                        className="input-field w-full"
                        placeholder="Enter location"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <button
                      onClick={() => setShowApprovalModal(null)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleVendorRequestAction(showApprovalModal, 'approve')}
                      className="btn-primary"
                      disabled={!approvalData.businessName || !approvalData.services.length || !approvalData.city || !approvalData.location || loading}
                    >
                      {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Approve Vendor
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vendor Rejection Modal */}
          {showRejectionModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Reject Vendor Request</h3>
                  <button
                    onClick={() => setShowRejectionModal(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Reason *
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="input-field w-full h-32"
                      placeholder="Please provide a reason for rejection..."
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <button
                      onClick={() => setShowRejectionModal(null)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleVendorRequestAction(showRejectionModal, 'reject')}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      disabled={!rejectionReason.trim() || loading}
                    >
                      {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Reject Request
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Test Email Modal */}
          {showTestEmailModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Send Test Email</h3>
                  <button
                    onClick={() => setShowTestEmailModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      className="input-field w-full"
                      placeholder="Enter email address"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <button
                      onClick={() => setShowTestEmailModal(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendTestEmail}
                      className="btn-primary"
                      disabled={!testEmail || loading}
                    >
                      {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Send Test Email
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Email Modal */}
          {showBulkEmailModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Send Bulk Notification</h3>
                  <button
                    onClick={() => setShowBulkEmailModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Role
                    </label>
                    <select
                      value={bulkEmailData.roleType}
                      onChange={(e) => setBulkEmailData({...bulkEmailData, roleType: e.target.value})}
                      className="input-field w-full"
                    >
                      <option value="vendor">Vendors</option>
                      <option value="counselor">Counselors</option>
                      <option value="community">Community Managers</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={bulkEmailData.subject}
                      onChange={(e) => setBulkEmailData({...bulkEmailData, subject: e.target.value})}
                      className="input-field w-full"
                      placeholder="Email subject"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      value={bulkEmailData.message}
                      onChange={(e) => setBulkEmailData({...bulkEmailData, message: e.target.value})}
                      className="input-field w-full h-32"
                      placeholder="Email message content"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <button
                      onClick={() => setShowBulkEmailModal(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendBulkEmail}
                      className="btn-primary"
                      disabled={!bulkEmailData.subject || !bulkEmailData.message || loading}
                    >
                      {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Send Bulk Email
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Email Management Tab */}
      {activeTab === 'email' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Email Management</h2>
          
          {/* Email Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Sent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {emailStats?.totalSent || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <polyline points="3 7 12 13 21 7" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {emailStats?.totalDelivered || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Opened</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {emailStats?.totalOpened || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-yellow-500 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Bounced</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {emailStats?.totalBounced || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-red-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Email Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Testing</h3>
              <p className="text-gray-600 mb-4">
                Send test emails to verify your email configuration is working correctly.
              </p>
              <button
                onClick={() => setShowTestEmailModal(true)}
                className="btn-primary"
              >
                Send Test Email
              </button>
            </div>
            
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Notifications</h3>
              <p className="text-gray-600 mb-4">
                Send notifications to all users of a specific role type.
              </p>
              <button
                onClick={() => setShowBulkEmailModal(true)}
                className="btn-primary"
              >
                Send Bulk Email
              </button>
            </div>
          </div>

          {/* Email Templates */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Role Application Submitted</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Sent when a user submits a role application
                </p>
                <div className="text-xs text-gray-500">
                  <p>• Confirmation of application receipt</p>
                  <p>• Expected review timeline</p>
                  <p>• Contact information</p>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Role Application Approved</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Sent when a role application is approved
                </p>
                <div className="text-xs text-gray-500">
                  <p>• Congratulations message</p>
                  <p>• Dashboard access link</p>
                  <p>• Next steps guidance</p>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Role Application Rejected</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Sent when a role application is rejected
                </p>
                <div className="text-xs text-gray-500">
                  <p>• Rejection reason</p>
                  <p>• Improvement suggestions</p>
                  <p>• Re-application guidance</p>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Account Status Changed</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Sent when account status changes
                </p>
                <div className="text-xs text-gray-500">
                  <p>• Status update notification</p>
                  <p>• Reason for change</p>
                  <p>• Action required</p>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Welcome Email</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Sent to new role users
                </p>
                <div className="text-xs text-gray-500">
                  <p>• Welcome message</p>
                  <p>• Getting started guide</p>
                  <p>• Dashboard access</p>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Custom Notification</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Admin-created bulk notifications
                </p>
                <div className="text-xs text-gray-500">
                  <p>• Custom subject and message</p>
                  <p>• Role-specific targeting</p>
                  <p>• Flexible content</p>
                </div>
              </div>
            </div>
          </div>

          {/* Email Statistics by Role */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Statistics by Role</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Vendors</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Sent:</span>
                    <span className="font-medium">{emailStats?.byRole?.vendor?.sent || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivered:</span>
                    <span className="font-medium">{emailStats?.byRole?.vendor?.delivered || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Opened:</span>
                    <span className="font-medium">{emailStats?.byRole?.vendor?.opened || 0}</span>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Counselors</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Sent:</span>
                    <span className="font-medium">{emailStats?.byRole?.counselor?.sent || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivered:</span>
                    <span className="font-medium">{emailStats?.byRole?.counselor?.delivered || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Opened:</span>
                    <span className="font-medium">{emailStats?.byRole?.counselor?.opened || 0}</span>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Community Managers</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Sent:</span>
                    <span className="font-medium">{emailStats?.byRole?.community?.sent || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivered:</span>
                    <span className="font-medium">{emailStats?.byRole?.community?.delivered || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Opened:</span>
                    <span className="font-medium">{emailStats?.byRole?.community?.opened || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Approval Modal */}
      {showRoleApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Approve Role Application</h3>
              <button
                onClick={() => setShowRoleApprovalModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mb-6 text-gray-700">
              Are you sure you want to approve this role application?
              <div className="mt-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                <strong>Note:</strong> An email with login credentials will be sent to the applicant. 
                Please ask them to check their spam/junk folder if they don't receive the email.
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowRoleApprovalModal(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await handleRoleRequestAction(showRoleApprovalModal, 'approve');
                    setShowRoleApprovalModal(null);
                  } catch (error) {
                    console.error('Approval failed:', error);
                  }
                }}
                className="btn-primary"
                disabled={loading}
              >
                {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Rejection Modal */}
      {showRoleRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Reject Role Application</h3>
              <button
                onClick={() => setShowRoleRejectionModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason *
              </label>
              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                className="input-field w-full h-24"
                placeholder="Please provide a reason for rejection..."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowRoleRejectionModal(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleRoleRequestAction(showRoleRejectionModal, 'reject', rejectionReason);
                  setShowRoleRejectionModal(null);
                  setRejectionReason('');
                }}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                disabled={!rejectionReason.trim() || loading}
              >
                {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
};

export default Admin;