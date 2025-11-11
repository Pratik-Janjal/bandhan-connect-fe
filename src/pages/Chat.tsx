import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { messagesAPI } from '../services/api';
import { Send, ArrowLeft, Phone, Video, MoreHorizontal, Smile, Paperclip } from 'lucide-react';
import { sampleUsers, sampleMessages } from '../data/sampleData';

const Chat: React.FC = () => {
  const { userId } = useParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadMessages();
      loadUser();
    }
  }, [userId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await messagesAPI.getMessages(userId!);
      console.log('Loaded messages for user:', userId, data);
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
      // Fallback to sample messages
      const filteredMessages = sampleMessages.filter(m => 
        (m.senderId === userId || m.receiverId === userId) || 
        (m.senderId === 'currentUser' || m.receiverId === 'currentUser')
      );
      setMessages(filteredMessages);
    } finally {
      setLoading(false);
    }
  };

  const loadUser = async () => {
    try {
      // Find user from sample data
      const foundUser = sampleUsers.find(u => u.id === userId);
      if (foundUser) {
        setUser({
          id: foundUser.id,
          name: foundUser.name,
          photos: foundUser.photos
        });
      } else {
        // Fallback user data
        setUser({
          id: userId,
          name: 'User Name',
          photos: ['https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400']
        });
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && userId) {
      try {
        const newMessage = await messagesAPI.sendMessage(userId, message);
        setMessages([...messages, newMessage]);
        setMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
        // Fallback: add message locally
        const localMessage = {
          id: Date.now().toString(),
          senderId: 'currentUser',
          receiverId: userId,
          message: message.trim(),
          timestamp: new Date().toISOString(),
          isRead: false
        };
        setMessages([...messages, localMessage]);
        setMessage('');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron"></div>
      </div>
    );
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Link to="/app/messages" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={user.photos[0]}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{user.name}</h2>
              <p className="text-sm text-gray-600">Active now</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Video className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <MoreHorizontal className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.senderId === 'currentUser' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.senderId === 'currentUser'
                  ? 'bg-saffron text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{msg.message}</p>
              <p className={`text-xs mt-1 ${
                msg.senderId === 'currentUser' ? 'text-orange-100' : 'text-gray-500'
              }`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <Smile className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
          />
          <button
            type="submit"
            className="p-2 bg-saffron text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;