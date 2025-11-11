import React, { useState, useEffect } from 'react';
import { supportAPI, getSocket } from '../services/api';
import { 
  MessageSquare, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  X,
  Send,
  Loader,
  Filter,
  Search
} from 'lucide-react';

const Support: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [newTicket, setNewTicket] = useState({
    subject: '',
    message: '',
    category: 'general',
    priority: 'medium'
  });

  const [replyMessage, setReplyMessage] = useState('');
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    fetchTickets();
    
    // Request notification permission for reply alerts
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    // Set up periodic refresh for tickets (every 30 seconds)
    const ticketRefreshInterval = setInterval(() => {
      fetchTickets();
    }, 30000);
    
    // Set up socket event listeners for real-time updates
    const socket = getSocket();
    
    // Listen for ticket updates
    socket.on('supportTicketUpdated', ({ ticket }) => {
      // Check if this is a new reply from admin
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const isMyTicket = ticket.userId._id === currentUser._id;
      const hasNewReply = ticket.replies && ticket.replies.length > 0;
      
      if (isMyTicket && hasNewReply) {
        const lastReply = ticket.replies[ticket.replies.length - 1];
        const isNewReply = new Date(lastReply.timestamp) > new Date(Date.now() - 10 * 1000); // Within last 10 seconds
        const isFromAdmin = lastReply.isAdmin;
        
        if (isNewReply && isFromAdmin) {
          // Show browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('New Support Reply', {
              body: `Admin replied to your ticket: ${ticket.subject}`,
              icon: '/favicon.ico'
            });
          }
        }
      }
      
      // Update the tickets list
      setTickets(prevTickets => 
        prevTickets.map(t => t._id === ticket._id ? ticket : t)
      );
      
      // Update selected ticket if it's the one being updated
      if (selectedTicket && selectedTicket._id === ticket._id) {
        setSelectedTicket(ticket);
      }
    });
    
    // Listen for new tickets (in case user creates from another device)
    socket.on('supportTicketCreated', ({ ticket }) => {
      // Only add if it belongs to the current user
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (ticket.userId._id === currentUser._id) {
        setTickets(prevTickets => [ticket, ...prevTickets]);
      }
    });
    
    // Handle connection status
    socket.on('connect', () => {
      setIsConnected(true);
    });
    
    socket.on('disconnect', () => {
      setIsConnected(false);
    });
    
    // Cleanup socket listeners and interval on unmount
    return () => {
      clearInterval(ticketRefreshInterval);
      socket.off('supportTicketUpdated');
      socket.off('supportTicketCreated');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [selectedTicket]);

  useEffect(() => {
    if (tickets && tickets.length > 0) {
      console.log('All tickets statuses:', tickets.map(t => t.status));
    }
  }, [tickets]);

  const fetchTickets = async (retryCount = 0) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await supportAPI.getMyTickets();
      setTickets(data);
    } catch (err: any) {
      console.error('Error fetching tickets:', err);
      const errorMessage = err.message || 'Unknown error';
      
      // Retry logic for network errors
      if (retryCount < 3 && (errorMessage.includes('Failed to fetch') || errorMessage.includes('Network Error') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ERR_NETWORK'))) {
        setTimeout(() => fetchTickets(retryCount + 1), 2000);
        return;
      }
      
      setError(`Failed to fetch tickets: ${errorMessage}`);
      
      // If it's an authentication error, redirect to login
      if (errorMessage.includes('Authentication required')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!newTicket.subject || !newTicket.message) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const createdTicket = await supportAPI.createTicket(newTicket);
      
      setSuccess('Support ticket created successfully!');
      setShowCreateForm(false);
      setNewTicket({ subject: '', message: '', category: 'general', priority: 'medium' });
      
      // Add the new ticket to the list immediately
      setTickets(prev => [createdTicket, ...prev]);
      
      // Auto-select the new ticket
      setSelectedTicket(createdTicket);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err: any) {
      console.error('Error creating ticket:', err);
      const errorMessage = err.message || 'Unknown error';
      setError(`Failed to create ticket: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReply = async () => {
    if (!replyMessage.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const updatedTicket = await supportAPI.addReply(selectedTicket._id, replyMessage);
      
      setReplyMessage('');
      
      // Update the ticket in the list
      setTickets(prev => 
        prev.map(t => t._id === updatedTicket._id ? updatedTicket : t)
      );
      
      // Update the selected ticket
      setSelectedTicket(updatedTicket);
      
      // Show success message
      setSuccess('Reply sent successfully!');
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err: any) {
      console.error('Error adding reply:', err);
      const errorMessage = err.message || 'Unknown error';
      setError(`Failed to add reply: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      in_progress: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      resolved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      closed: { color: 'bg-gray-100 text-gray-800', icon: X }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityConfig[priority as keyof typeof priorityConfig]}`}>
        {priority}
      </span>
    );
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="fade-in min-h-screen bg-gray-50">
      {/* Error Notification */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg z-50 max-w-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm">{error}</span>
            <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900 ml-2">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {success && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg z-50 max-w-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm">{success}</span>
            <button onClick={() => setSuccess(null)} className="text-green-700 hover:text-green-900 ml-2">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Support</h1>
          <p className="text-gray-600 text-lg">Get help with your account, technical issues, or general inquiries</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Tickets List - Takes 1/4 on large screens */}
          <div className="xl:col-span-1">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-gray-900">My Tickets</h2>
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} title={isConnected ? 'Connected' : 'Disconnected'}></div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchTickets()}
                    disabled={loading}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    title="Refresh tickets"
                  >
                    <Loader className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="btn-primary flex items-center gap-2 text-sm px-4 py-2"
                  >
                    <Plus className="w-4 h-4" />
                    New Ticket
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="space-y-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10 w-full text-sm"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-field w-full text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Tickets List */}
              <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
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
                ) : filteredTickets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No tickets found</p>
                    <p className="text-xs text-gray-400 mt-1">Create a new ticket to get started</p>
                    <button
                      onClick={() => fetchTickets()}
                      className="mt-2 text-sm text-saffron hover:text-orange-600"
                    >
                      Refresh
                    </button>
                  </div>
                ) : (
                  filteredTickets.map(ticket => (
                    <div
                      key={ticket._id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedTicket?._id === ticket._id
                          ? 'border-saffron bg-saffron/5 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{ticket.subject}</h3>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ticket.message}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {getStatusBadge(ticket.status)}
                          {getPriorityBadge(ticket.priority)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                          {ticket.replies && ticket.replies.length > 0 && 
                           new Date(ticket.replies[ticket.replies.length - 1].timestamp) > new Date(Date.now() - 5 * 60 * 1000) && (
                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              New Reply
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

          {/* Ticket Details - Takes 3/4 on large screens */}
          <div className="xl:col-span-3">
            {selectedTicket ? (
              <div className="card p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">{selectedTicket.subject}</h2>
                    <div className="flex items-center gap-3 flex-wrap">
                      {getStatusBadge(selectedTicket.status)}
                      {getPriorityBadge(selectedTicket.priority)}
                      <span className="text-sm text-gray-500">
                        #{selectedTicket._id?.slice(-6) || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="text-gray-400 hover:text-gray-600 p-1 ml-4"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Ticket Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Status</label>
                    <p className="text-sm font-medium text-gray-900 mt-1 capitalize">{selectedTicket.status.replace('_', ' ')}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Priority</label>
                    <p className="text-sm font-medium text-gray-900 mt-1 capitalize">{selectedTicket.priority}</p>
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
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{selectedTicket.message}</p>
                </div>

                {/* Replies */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversation</h3>
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
                              {reply.isAdmin ? 'Support Team' : 'You'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(reply.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{reply.message}</p>
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

                {/* Add Reply */}
                {selectedTicket.status !== 'closed' && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Reply</h3>
                    <div className="flex gap-3">
                      <textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 input-field resize-none"
                        rows={4}
                      />
                      <button
                        onClick={handleAddReply}
                        disabled={!replyMessage.trim() || loading}
                        className="btn-primary self-end px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="card p-12">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Ticket</h3>
                  <p className="text-gray-500">Choose a ticket from the list to view details and add replies</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Create Support Ticket</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="input-field w-full"
                  placeholder="Brief description of your issue"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                    className="input-field w-full"
                  >
                    <option value="general">General</option>
                    <option value="technical">Technical</option>
                    <option value="billing">Billing</option>
                    <option value="account">Account</option>
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    className="input-field w-full"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  className="input-field w-full resize-none"
                  rows={6}
                  placeholder="Please provide detailed information about your issue..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTicket}
                  disabled={loading || !newTicket.subject || !newTicket.message}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Create Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support; 