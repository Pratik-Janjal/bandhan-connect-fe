import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import {
  sampleCounselorProfile,
  sampleCounselorAnalytics,
  sampleCounselorTimeSlots,
  sampleCounselingRequests,
  sampleCounselorSessions,
  sampleCommunityProfile,
  sampleCommunityAnalytics,
  sampleCommunityMembers,
  sampleCommunityEvents,
  sampleMatrimonialProfiles,
  sampleCommunityQueries
} from '../data/sampleData';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const API_BASE_URL = 'https://bandhan-connect-be.onrender.com/api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Socket.IO connection
let socket: Socket | null = null;

export const initializeSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
    });
    
    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });
    
    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Added for CORS with credentials
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/login', { email, password });
      return response.data;
    } catch (error) {
      console.log("Login failed", error);
    }
  },
  
  register: async (userData: any) => {
    try {
      const response = await api.post('/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
    }
  },
  
  verifyEmail: async (token: string) => {
    const response = await api.post('/users/verify-email', { token });
    return response.data;
  },
  
  forgotPassword: async (email: string) => {
    const response = await api.post('/users/forgot-password', { email });
    return response.data;
  },
  
  resetPassword: async (token: string, password: string) => {
    const response = await api.post('/users/reset-password', { token, password });
    return response.data;
  }
};

// fetchProfileById
export const fetchProfileAPI = {
    profileById : async (userId : string) => {
      try{
        const response = await api.get(`/profile/${userId}`);
        return response.data;
      }catch(error){
        console.error('Error :', error);
      }
    }
}

//update profile by id
export const updateProfileAPI = async (data:any) =>{
    try{
      const res = await api.post("/profile/updateProfile", data);
      return res.data;
    }
    catch(error){
      console.log(error);
    }
}

//filter-profile 
export const filterProfileAPI = async (parmas : any) => {
  try {
    const res = await api.get(`/filter?${parmas}`);
    return res.data;
  }catch(error){
    console.log(error);
  }
}

// Update user-info for verification
export const updateInfoAPI = {
  addInfo : async (data : object)=>{
    try{
      const response = await api.post('/profile/info', data);
      return response.data;
    }catch(error){
      console.error('Error :', error);
    }
  },

  aboutYourself : async (data : object)=> {
    try{
      const response = await api.post('/profile/bio', data);
      return response.data;
    }catch(error){
      console.error('Error :', error);
    }
  },

   uploadPhotos : async (formData: any) => {
    try {
      const res = await api.post("/profile/add-photos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (err) {
      console.error("Upload error:", err);
      throw err; // Throw error so it can be caught in the component
    }
  },
  
  partnersPreferences : async (data:object) => {
    try {
      const response = await api.post('/profile/partner-preferences', data);
      return response.data;
    }catch(error){
      console.error('Error :', error);
    }
  }
}

// User API
export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  
  updateProfile: async (profileData: any) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },
  
  uploadPhoto: async (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await api.post('/users/upload-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  getAllPosts: async () => {
    const response = await api.get('/posts');
    return response.data;
  },
  getAllReports: async () => {
    const response = await api.get('/admin/reports');
    return response.data;
  },
  getAnnouncements: async () => {
    const response = await api.get('/announcements');
    return response.data.map((a: any) => ({
      ...a,
      id: a._id,
      title: a.title || '',
      content: a.content || '',
      author: a.author || '',
      timestamp: a.timestamp || '',
      isActive: typeof a.isActive === 'boolean' ? a.isActive : true,
      targetAudience: a.targetAudience || ['all'],
    }));
  }
};

// Matches API
export const matchesAPI = {
  getMatches: async (userId : string | null) => {
    try {
      const response = await api.get(`/feeds/${userId}`);
      return response.data.matches;
    } catch (error) {
      return error;
    }
  },
  
  likeUser: async (userId: string) => {
    try {
      const response = await api.post('/matches/like', { userId });
      return response.data;
    } catch (error) {
      console.warn('Backend not available, simulating like action',error);
      return { message: 'User liked successfully' };
    }
  },
  
  rejectUser: async (userId: string) => {
    try {
      const response = await api.post('/matches/reject', { userId });
      return response.data;
    } catch (error) {
      console.warn('Backend not available, simulating reject action',error);
      return { message: 'User rejected successfully' };
    }
  },
  
  getLikedUsers: async () => {
    const response = await api.get('/matches/liked');
    return response.data;
  }
};

// Messages API
export const messagesAPI = {
  getConversations: async () => {
    try {
      const response = await api.get('/messages/conversations');
      return response.data;
    } catch (error) {
      console.warn('Backend not available, using sample conversations',error);
      const { sampleConversations } = await import('../data/sampleData');
      return sampleConversations;
    }
  },
  
  getMessages: async (userId: string) => {
    try {
      const response = await api.get(`/messages/${userId}`);
      return response.data;
    } catch (error) {
      console.warn('Backend not available, using sample messages', error);
      const { sampleMessages } = await import('../data/sampleData');
      return sampleMessages.filter(m => 
        (m.senderId === userId || m.receiverId === userId) || 
        (m.senderId === 'currentUser' || m.receiverId === 'currentUser')
      );
    }
  },
  
  sendMessage: async (receiverId: string, message: string) => {
    try {
      const response = await api.post('/messages', { receiverId, message });
      return response.data;
    } catch (error) {
      console.warn('Backend not available, simulating message send',error);
      return {
        id: Date.now().toString(),
        senderId: 'currentUser',
        receiverId,
        message,
        timestamp: new Date().toISOString(),
        isRead: false
      };
    }
  },
  
  markAsRead: async (messageId: string) => {
    const response = await api.put(`/messages/${messageId}/read`);
    return response.data;
  }
};

// Services API
export const servicesAPI = {
  getServices: async () => {
    const response = await api.get('/services');
    return response.data;
  },
  
  bookService: async (serviceId: string, bookingData: any) => {
    const response = await api.post(`/services/${serviceId}/book`, bookingData);
    return response.data;
  }
};

// Counseling API
export const counselingAPI = {
  getCounselors: async () => {
    const response = await api.get('/counselors');
    return response.data;
  },
  
  bookSession: async (counselorId: string, sessionData: any) => {
    const response = await api.post(`/counselors/${counselorId}/sessions`, sessionData);
    return response.data;
  },
  
  getSessions: async () => {
    const response = await api.get('/sessions');
    return response.data;
  }
};

// Timeline API
export const timelineAPI = {
  getTimeline: async () => {
    const response = await api.get('/timeline');
    return response.data;
  },
  
  addEvent: async (eventData: any) => {
    const response = await api.post('/timeline', eventData);
    return response.data;
  }
};

// Community API
export const communityAPI = {
  getPosts: async () => {
    const response = await api.get('/posts');
    return response.data;
  },
  
  createPost: async (postData: any) => {
    const response = await api.post('/posts', postData);
    return response.data;
  },
  
  likePost: async (postId: string) => {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  }
};

// Notifications API
export const notificationsAPI = {
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },
  
  markAsRead: async (notificationId: string) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },
  
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },
  markNotificationAsRead: async (id: string) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },
  markAllNotificationsAsRead: async (userId: string) => {
    const response = await api.put(`/notifications/read-all?userId=${userId}`);
    return response.data;
  }
};

// Events API
export const eventsAPI = {
  getEvents: async () => {
    try {
      const response = await api.get('/events');
      return response.data;
    } catch (error) {
      console.warn('Backend not available, using sample events',error);
      const { eventsList } = await import('../data/sampleData');
      return eventsList;
    }
  },
  
  createEvent: async (eventData: any) => {
    try {
      const response = await api.post('/events', eventData);
      return response.data;
    } catch (error) {
      console.warn('Backend not available, simulating event creation', error);
      // Return a mock event with the submitted data
      return {
        id: Date.now().toString(),
        ...eventData,
        currentParticipants: 0,
        registeredUsers: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  },
  
  joinEvent: async (eventId: string) => {
    try {
      const response = await api.post(`/events/${eventId}/join`);
      return response.data;
    } catch (error) {
      console.warn('Backend not available, simulating event join');
      return { message: 'Successfully registered for event' };
    }
  }
};

// Admin API
export const adminAPI = {
  // User Management
  verifyUser: async (userId: string) => {
    const response = await api.patch(`/users/${userId}/verify`);
    return response.data;
  },
  
  suspendUser: async (userId: string) => {
    const response = await api.patch(`/users/${userId}/suspend`);
    return response.data;
  },
  
  activateUser: async (userId: string) => {
    const response = await api.patch(`/users/${userId}/activate`);
    return response.data;
  },
  
  makePremium: async (userId: string) => {
    const response = await api.patch(`/users/${userId}/premium`);
    return response.data;
  },
  
  deleteUser: async (userId: string) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },
  
  // Content Moderation
  approvePost: async (postId: string) => {
    const response = await api.patch(`/admin/posts/${postId}/approve`);
    return response.data;
  },
  
  rejectPost: async (postId: string) => {
    const response = await api.patch(`/admin/posts/${postId}/reject`);
    return response.data;
  },
  
  deletePost: async (postId: string) => {
    const response = await api.delete(`/admin/posts/${postId}`);
    return response.data;
  },
  
  resolveReport: async (reportId: string) => {
    const response = await api.patch(`/admin/reports/${reportId}/resolve`);
    return response.data;
  },
  
  reviewReport: async (reportId: string) => {
    const response = await api.patch(`/admin/reports/${reportId}/review`);
    return response.data;
  },
  
  // Announcements
  createAnnouncement: async (announcementData: any) => {
    const response = await api.post('/announcements', announcementData);
    return response.data;
  },
  
  getAnnouncements: async () => {
    const response = await api.get('/announcements');
    return response.data;
  },
  
  toggleAnnouncement: async (announcementId: string) => {
    const response = await api.patch(`/announcements/${announcementId}/activate`);
    return response.data;
  },
  
  deleteAnnouncement: async (announcementId: string) => {
    const response = await api.delete(`/announcements/${announcementId}`);
    return response.data;
  },
  
  // Notifications
  createNotification: async (notificationData: any) => {
    const response = await api.post('/notifications', notificationData);
    return response.data;
  },
  
  getNotifications: async (userId?: string) => {
    const params = userId ? { userId } : {};
    const response = await api.get('/notifications', { params });
    return response.data;
  }
};

// Support API
export const supportAPI = {
  // User functions
  createTicket: async (ticketData: any) => {
    try {
      const response = await api.post('/support', ticketData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      throw new Error('Failed to create ticket');
    }
  },
  
  getMyTickets: async () => {
    try {
      const response = await api.get('/support/my-tickets');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user tickets:', error);
      throw new Error('Failed to fetch tickets');
    }
  },
  
  getTicket: async (ticketId: string) => {
    try {
      console.log('Fetching ticket:', ticketId);
      const response = await api.get(`/support/${ticketId}`);
      console.log('Ticket response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching ticket:', error);
      throw new Error('Failed to fetch ticket');
    }
  },
  
  addReply: async (ticketId: string, message: string) => {
    try {
      const response = await api.post(`/support/${ticketId}/reply`, { message });
      return response.data;
    } catch (error: any) {
      console.error('Error adding reply:', error);
      throw new Error('Failed to add reply');
    }
  },
  
  // Admin functions
  getAllTickets: async () => {
    try {
      const response = await api.get('/support/admin/all');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching tickets from backend:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      }
      if (error.response?.status === 403) {
        throw new Error('Admin access required.');
      }
      throw new Error('Failed to fetch tickets from server');
    }
  },
  
  updateTicketStatus: async (ticketId: string, status: string) => {
    try {
      const response = await api.patch(`/support/admin/${ticketId}/status`, { status });
      return response.data;
    } catch (error: any) {
      console.error('Error updating ticket status:', error);
      throw new Error('Failed to update ticket status');
    }
  },
  
  assignTicket: async (ticketId: string, assignedTo: string) => {
    try {
      const response = await api.patch(`/support/admin/${ticketId}/assign`, { assignedTo });
      return response.data;
    } catch (error: any) {
      console.error('Error assigning ticket:', error);
      throw new Error('Failed to assign ticket');
    }
  },
  
  updateTicketPriority: async (ticketId: string, priority: string) => {
    try {
      const response = await api.patch(`/support/admin/${ticketId}/priority`, { priority });
      return response.data;
    } catch (error: any) {
      console.error('Error updating ticket priority:', error);
      throw new Error('Failed to update ticket priority');
    }
  }
};

// Vendor API
export const vendorAPI = {
  // Admin functions
  getAllVendors: async () => {
    try {
      const response = await api.get('/vendors/admin/all');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching vendors:', error);
      throw new Error('Failed to fetch vendors');
    }
  },
  
  getVendorRequests: async () => {
    try {
      const response = await api.get('/vendors/admin/requests');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching vendor requests:', error);
      throw new Error('Failed to fetch vendor requests');
    }
  },
  
  approveVendorRequest: async (requestId: string, vendorData: any) => {
    try {
      const response = await api.post(`/vendors/admin/requests/${requestId}/approve`, vendorData);
      return response.data;
    } catch (error: any) {
      console.error('Error approving vendor request:', error);
      throw new Error('Failed to approve vendor request');
    }
  },
  
  rejectVendorRequest: async (requestId: string, rejectionReason: string) => {
    try {
      const response = await api.post(`/vendors/admin/requests/${requestId}/reject`, { rejectionReason });
      return response.data;
    } catch (error: any) {
      console.error('Error rejecting vendor request:', error);
      throw new Error('Failed to reject vendor request');
    }
  },
  
  updateVendorStatus: async (vendorId: string, status: string) => {
    try {
      const response = await api.put(`/vendors/admin/${vendorId}/status`, { status });
      return response.data;
    } catch (error: any) {
      console.error('Error updating vendor status:', error);
      throw new Error('Failed to update vendor status');
    }
  },
  
  // Vendor functions
  getVendorProfile: async () => {
    try {
      const response = await api.get('/vendors/profile');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching vendor profile:', error);
      throw new Error('Failed to fetch vendor profile');
    }
  },
  
  createVendorProfile: async (profileData: any) => {
    try {
      const response = await api.post('/vendors/profile', profileData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating vendor profile:', error);
      throw new Error('Failed to create vendor profile');
    }
  },
  
  updateVendorProfile: async (profileData: any) => {
    try {
      const response = await api.put('/vendors/profile', profileData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating vendor profile:', error);
      throw new Error('Failed to update vendor profile');
    }
  },
  
  getVendorAnalytics: async () => {
    try {
      const response = await api.get('/vendors/analytics');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching vendor analytics:', error);
      throw new Error('Failed to fetch vendor analytics');
    }
  },

  // Service Packages
  getServicePackages: async () => {
    try {
      const response = await api.get('/vendors/profile/service-packages');
      return response.data;
    } catch (error) {
      console.warn('Backend not available, using mock service packages');
      const { sampleVendorPackages } = await import('../data/sampleData');
      return sampleVendorPackages;
    }
  },
  addServicePackage: async (pkg: any) => {
    try {
      const response = await api.post('/vendors/profile/service-packages', pkg);
      return response.data;
    } catch (error) {
      console.warn('Backend not available, simulating add package');
      return { ...pkg, id: Date.now().toString() };
    }
  },
  updateServicePackage: async (pkgId: string, pkg: any) => {
    try {
      const response = await api.put(`/vendors/profile/service-packages/${pkgId}`, pkg);
      return response.data;
    } catch (error) {
      console.warn('Backend not available, simulating update package');
      return { ...pkg, id: pkgId };
    }
  },
  deleteServicePackage: async (pkgId: string) => {
    try {
      const response = await api.delete(`/vendors/profile/service-packages/${pkgId}`);
      return response.data;
    } catch (error) {
      console.warn('Backend not available, simulating delete package');
      return { success: true };
    }
  },

  // Client Leads
  getClientLeads: async () => {
    try {
      const response = await api.get('/vendors/profile/leads');
      return response.data;
    } catch (error) {
      console.warn('Backend not available, using mock client leads');
      const { sampleVendorLeads } = await import('../data/sampleData');
      return sampleVendorLeads;
    }
  },
  updateLeadStatus: async (leadId: string, status: string) => {
    try {
      const response = await api.put(`/vendors/profile/leads/${leadId}/status`, { status });
      return response.data;
    } catch (error) {
      console.warn('Backend not available, simulating update lead status');
      return { id: leadId, status };
    }
  },

  // Queries
  getQueries: async () => {
    try {
      const response = await api.get('/vendors/profile/queries');
      return response.data;
    } catch (error) {
      console.warn('Backend not available, using mock queries');
      const { sampleVendorQueries } = await import('../data/sampleData');
      return sampleVendorQueries;
    }
  },
  replyToQuery: async (queryId: string, reply: string) => {
    try {
      const response = await api.post(`/vendors/profile/queries/${queryId}/reply`, { reply });
      return response.data;
    } catch (error) {
      console.warn('Backend not available, simulating reply to query');
      return { id: queryId, reply, status: 'replied' };
    }
  },
  // Bookings
  getBookings: async () => {
    try {
      const response = await api.get('/vendors/profile/bookings');
      return response.data;
    } catch (error) {
      const { sampleVendorBookings } = await import('../data/sampleData');
      return sampleVendorBookings;
    }
  },
  addBooking: async (booking: any) => {
    try {
      const response = await api.post('/vendors/profile/bookings', booking);
      return response.data;
    } catch (error) {
      return { ...booking, id: Date.now().toString() };
    }
  },
  // Reviews
  getReviews: async () => {
    try {
      const response = await api.get('/vendors/profile/reviews');
      return response.data;
    } catch (error) {
      const { sampleVendorReviews } = await import('../data/sampleData');
      return sampleVendorReviews;
    }
  },
  addReview: async (review: any) => {
    try {
      const response = await api.post('/vendors/profile/reviews', review);
      return response.data;
    } catch (error) {
      return { ...review, id: Date.now().toString() };
    }
  },
  // Earnings
  getEarnings: async () => {
    try {
      const response = await api.get('/vendors/profile/earnings');
      return response.data;
    } catch (error) {
      const { sampleVendorEarnings } = await import('../data/sampleData');
      return sampleVendorEarnings;
    }
  },
  addEarning: async (earning: any) => {
    try {
      const response = await api.post('/vendors/profile/earnings', earning);
      return response.data;
    } catch (error) {
      return { ...earning, id: Date.now().toString() };
    }
  },
  // Documents
  getDocuments: async () => {
    try {
      const response = await api.get('/vendors/profile/documents');
      return response.data;
    } catch (error) {
      const { sampleVendorDocuments } = await import('../data/sampleData');
      return sampleVendorDocuments;
    }
  },
  addDocument: async (doc: any) => {
    try {
      const response = await api.post('/vendors/profile/documents', doc);
      return response.data;
    } catch (error) {
      return { ...doc, id: Date.now().toString() };
    }
  },
  // Achievements
  getAchievements: async () => {
    try {
      const response = await api.get('/vendors/profile/achievements');
      return response.data;
    } catch (error) {
      const { sampleVendorAchievements } = await import('../data/sampleData');
      return sampleVendorAchievements;
    }
  },
  addAchievement: async (ach: any) => {
    try {
      const response = await api.post('/vendors/profile/achievements', ach);
      return response.data;
    } catch (error) {
      return { ...ach, id: Date.now().toString() };
    }
  }
};

// Request API
export const requestAPI = {
  createRequest: async (data: any) => {
    try {
      const response = await api.post('/requests', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating request:', error);
      throw new Error('Failed to submit application');
    }
  },
  submitRequest: async (requestData: any) => {
    try {
      const response = await api.post('/requests/submit', requestData);
      return response.data;
    } catch (error: any) {
      console.error('Error submitting request:', error);
      throw new Error('Failed to submit request');
    }
  },
  
  checkRequestStatus: async (email: string, roleRequested: string) => {
    try {
      const response = await api.get('/requests/status', { 
        params: { email, roleRequested } 
      });
      return response.data;
    } catch (error: any) {
      console.error('Error checking request status:', error);
      throw new Error('Failed to check request status');
    }
  },
  
  getAllRequests: async (filters?: any) => {
    try {
      const response = await api.get('/requests/admin/all', { params: filters });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      throw new Error('Failed to fetch requests');
    }
  },
  
  getRequestStats: async () => {
    try {
      const response = await api.get('/requests/admin/stats');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching request stats:', error);
      throw new Error('Failed to fetch request stats');
    }
  },
  
  getRequestById: async (requestId: string) => {
    try {
      const response = await api.get(`/requests/admin/${requestId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching request:', error);
      throw new Error('Failed to fetch request');
    }
  },
  approveRequest: async (requestId: string, data: any) => {
    try {
      const response = await api.patch(`/requests/${requestId}/approve`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error approving request:', error);
      throw new Error('Failed to approve request');
    }
  },
  rejectRequest: async (requestId: string, data: any) => {
    try {
      const response = await api.patch(`/requests/${requestId}/reject`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      throw new Error('Failed to reject request');
    }
  }
};

// Counselor API
export const counselorAPI = {
  // Admin functions
  getAllCounselors: async () => {
    try {
      const response = await api.get('/counselors/all');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching counselors:', error);
      throw new Error('Failed to fetch counselors');
    }
  },
  
  getCounselorById: async (counselorId: string) => {
    try {
      const response = await api.get(`/counselors/${counselorId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching counselor:', error);
      throw new Error('Failed to fetch counselor');
    }
  },
  
  updateCounselorStatus: async (counselorId: string, status: string) => {
    try {
      const response = await api.patch(`/counselors/${counselorId}/status`, { status });
      return response.data;
    } catch (error: any) {
      console.error('Error updating counselor status:', error);
      throw new Error('Failed to update counselor status');
    }
  },
  
  // Counselor functions
  getCounselorProfile: async (counselorId: string) => {
    try {
      const response = await api.get(`/counselors/${counselorId}`);
      return response.data;
    } catch (error) {
      console.warn('Backend not available, using mock counselor profile');
      return { data: sampleCounselorProfile };
    }
  },
  
  createCounselorProfile: async (profileData: any) => {
    try {
      const response = await api.post('/counselors', profileData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating counselor profile:', error);
      throw new Error('Failed to create counselor profile');
    }
  },
  
  updateCounselorProfile: async (counselorId: string, profileData: any) => {
    try {
      const response = await api.put(`/counselors/${counselorId}`, profileData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating counselor profile:', error);
      throw new Error('Failed to update counselor profile');
    }
  },
  
  getCounselorAnalytics: async (counselorId: string) => {
    try {
      const response = await api.get(`/counselors/${counselorId}/analytics`);
      return response.data;
    } catch (error) {
      console.warn('Backend not available, using mock counselor analytics');
      return { data: sampleCounselorAnalytics };
    }
  },
  
  // Time slot management
  addTimeSlot: async (counselorId: string, timeSlotData: any) => {
    try {
      const response = await api.post(`/counselors/${counselorId}/time-slots`, timeSlotData);
      return response.data;
    } catch (error) {
      console.warn('Backend not available, simulating add time slot');
      return { ...timeSlotData, id: Date.now().toString() };
    }
  },
  
  updateTimeSlot: async (counselorId: string, slotId: string, timeSlotData: any) => {
    try {
      const response = await api.put(`/counselors/${counselorId}/time-slots/${slotId}`, timeSlotData);
      return response.data;
    } catch (error) {
      console.warn('Backend not available, simulating update time slot');
      return { ...timeSlotData, id: slotId };
    }
  },
  
  deleteTimeSlot: async (counselorId: string, slotId: string) => {
    try {
      const response = await api.delete(`/counselors/${counselorId}/time-slots/${slotId}`);
      return response.data;
    } catch (error) {
      console.warn('Backend not available, simulating delete time slot');
      return { success: true };
    }
  },
  getTimeSlots: async (counselorId: string) => {
    try {
      const response = await api.get(`/counselors/${counselorId}/time-slots`);
      return response.data;
    } catch (error) {
      console.warn('Backend not available, using mock time slots');
      return sampleCounselorTimeSlots;
    }
  },
  getCounselingRequests: async (counselorId: string) => {
    try {
      const response = await api.get(`/counselors/${counselorId}/requests`);
      return response.data;
    } catch (error) {
      console.warn('Backend not available, using mock counseling requests');
      return sampleCounselingRequests;
    }
  },
  updateRequestStatus: async (counselorId: string, requestId: string, status: string) => {
    try {
      const response = await api.put(`/counselors/${counselorId}/requests/${requestId}/status`, { status });
      return response.data;
    } catch (error) {
      console.warn('Backend not available, simulating update request status');
      return { id: requestId, status };
    }
  },
  getSessions: async (counselorId: string) => {
    try {
      const response = await api.get(`/counselors/${counselorId}/sessions`);
      return response.data;
    } catch (error) {
      console.warn('Backend not available, using mock sessions');
      return sampleCounselorSessions;
    }
  },
  updateSessionStatus: async (counselorId: string, sessionId: string, status: string) => {
    try {
      const response = await api.put(`/counselors/${counselorId}/sessions/${sessionId}/status`, { status });
      return response.data;
    } catch (error) {
      console.warn('Backend not available, simulating update session status');
      return { id: sessionId, status };
    }
  }
};

// Community Management API
export const communityManagementAPI = {
  // Admin functions
  getAllCommunities: async () => {
    try {
      const response = await api.get('/community/all');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching communities:', error);
      throw new Error('Failed to fetch communities');
    }
  },
  
  getCommunityById: async (communityId: string) => {
    try {
      const response = await api.get(`/community/${communityId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching community:', error);
      throw new Error('Failed to fetch community');
    }
  },
  
  updateCommunityStatus: async (communityId: string, status: string) => {
    try {
      const response = await api.patch(`/community/${communityId}/status`, { status });
      return response.data;
    } catch (error: any) {
      console.error('Error updating community status:', error);
      throw new Error('Failed to update community status');
    }
  },
  
  // Community functions
  getCommunityProfile: async (communityId: string) => {
    try {
      const response = await api.get(`/community/${communityId}`);
      return response.data;
    } catch (error) {
      console.warn('Backend not available, using mock community profile');
      return { data: sampleCommunityProfile };
    }
  },
  
  createCommunityProfile: async (profileData: any) => {
    try {
      const response = await api.post('/community', profileData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating community profile:', error);
      throw new Error('Failed to create community profile');
    }
  },
  
  updateCommunityProfile: async (communityId: string, profileData: any) => {
    try {
      const response = await api.put(`/community/${communityId}`, profileData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating community profile:', error);
      throw new Error('Failed to update community profile');
    }
  },
  
  getCommunityAnalytics: async (communityId: string) => {
    try {
      const response = await api.get(`/community/${communityId}/analytics`);
      return response.data;
    } catch (error) {
      console.warn('Backend not available, using mock community analytics');
      return { data: sampleCommunityAnalytics };
    }
  },
  
  getCommunityMembers: async (communityId: string, filters?: any) => {
    try {
      const response = await api.get(`/community/${communityId}/members`, { params: filters });
      return response.data;
    } catch (error) {
      console.warn('Backend not available, using mock community members');
      return { data: sampleCommunityMembers };
    }
  },
  
  // Event management
  addEvent: async (communityId: string, eventData: any) => {
    try {
      const response = await api.post(`/community/${communityId}/events`, eventData);
      return response.data;
    } catch (error) {
      console.warn('Backend not available, simulating add event');
      return {
        id: Date.now().toString(),
        ...eventData,
        attendees: 0,
        maxAttendees: eventData.maxAttendees || 100,
        status: 'upcoming'
      };
    }
  },
  
  updateEvent: async (communityId: string, eventId: string, eventData: any) => {
    try {
      const response = await api.put(`/community/${communityId}/events/${eventId}`, eventData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating event:', error);
      throw new Error('Failed to update event');
    }
  },
  
  deleteEvent: async (communityId: string, eventId: string) => {
    try {
      const response = await api.delete(`/community/${communityId}/events/${eventId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting event:', error);
      throw new Error('Failed to delete event');
    }
  },
  getCommunityProfileEvents: async (communityId: string) => {
    try {
      const response = await api.get(`/community/${communityId}`);
      return response.data?.events || [];
    } catch (error) {
      console.warn('Backend not available, using mock community events');
      return sampleCommunityEvents;
    }
  },
  getMatrimonialProfiles: async (communityId: string) => {
    try {
      const response = await api.get(`/community/${communityId}/matrimonial-profiles`);
      return response.data;
    } catch (error) {
      console.warn('Backend not available, using mock matrimonial profiles');
      return sampleMatrimonialProfiles;
    }
  },
  getCommunityQueries: async (communityId: string) => {
    try {
      const response = await api.get(`/community/${communityId}/queries`);
      return response.data;
    } catch (error) {
      console.warn('Backend not available, using mock community queries');
      return sampleCommunityQueries;
    }
  }
};

// Email API
export const emailAPI = {
  // Send test email
  sendTestEmail: async (email: string) => {
    try {
      const response = await api.post('/email/test', { email });
      return response.data;
    } catch (error: any) {
      console.error('Error sending test email:', error);
      throw new Error('Failed to send test email');
    }
  },
  
  // Send welcome email
  sendWelcomeEmail: async (userId: string, roleType: string) => {
    try {
      const response = await api.post('/email/welcome', { userId, roleType });
      return response.data;
    } catch (error: any) {
      console.error('Error sending welcome email:', error);
      throw new Error('Failed to send welcome email');
    }
  },
  
  // Send bulk notification
  sendBulkNotification: async (roleType: string, subject: string, message: string, filters?: any) => {
    try {
      const response = await api.post('/email/bulk', { roleType, subject, message, filters });
      return response.data;
    } catch (error: any) {
      console.error('Error sending bulk notification:', error);
      throw new Error('Failed to send bulk notification');
    }
  },
  
  // Get email statistics
  getEmailStats: async () => {
    try {
      const response = await api.get('/email/stats');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching email stats:', error);
      throw new Error('Failed to fetch email statistics');
    }
  }
};

export default api; 