import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { messagesAPI } from '../services/api';
import { MessageCircle, Search, MoreHorizontal } from 'lucide-react';
import { sampleConversations } from '../data/sampleData';

const Messages: React.FC = () => {
  const [conversations, setConversations] = useState(sampleConversations);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadConversations();
  }, []);

  // Debug: Force load sample data for testing
  useEffect(() => {
    const loadSampleData = async () => {
      try {
        const { sampleConversations } = await import('../data/sampleData');
        console.log('Sample conversations loaded:', sampleConversations);
        if (conversations.length === 0) {
          setConversations(sampleConversations);
        }
      } catch (error) {
        console.error('Error loading sample data:', error);
      }
    };
    
    // Load sample data after a short delay if no conversations are loaded
    const timer = setTimeout(() => {
      if (conversations.length === 0 && !loading) {
        loadSampleData();
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [conversations.length, loading]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await messagesAPI.getConversations();
      console.log('Loaded conversations:', data);
      if (data && data.length > 0) {
        setConversations(data);
      } else {
        // Fallback to sample data if API returns empty
        setConversations(sampleConversations);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      // Fallback to sample data if API fails
      setConversations(sampleConversations);
    } finally {
      setLoading(false);
    }
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

  const filteredConversations = conversations.filter(conversation =>
    conversation.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Connect with your matches</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search conversations..."
            className="input-field pl-10 w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading conversations...</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredConversations.map(conversation => (
          <Link
            key={conversation.userId}
            to={`/app/chat/${conversation.userId}`}
            className="block p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={conversation.userPhoto}
                  alt={conversation.userName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {conversation.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">{conversation.userName}</h3>
                  <span className="text-xs text-gray-500">{formatTime(conversation.timestamp)}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
              </div>
              
              <div className="flex items-center gap-2">
                {conversation.unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {conversation.unreadCount}
                  </span>
                )}
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Link>
          ))}
        </div>
      )}

      {!loading && filteredConversations.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Messages Yet</h3>
          <p className="text-gray-600">Start a conversation with your matches!</p>
        </div>
      )}
    </div>
  );
};

export default Messages;