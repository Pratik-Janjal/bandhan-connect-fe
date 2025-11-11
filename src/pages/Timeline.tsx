import React, { useState } from 'react';
import { Calendar, Plus, Heart, Camera, MapPin, Users, Gift, Star, Edit3, Trash2 } from 'lucide-react';
import api from '../services/api';

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'milestone' | 'meeting' | 'ceremony' | 'memory';
  status: 'completed' | 'upcoming' | 'planned';
  photos: string[];
  location?: string;
  participants: string[];
  isPrivate: boolean;
}

const Timeline: React.FC = () => {
  const [events, setEvents] = useState<TimelineEvent[]>([
    {
      id: '1',
      title: 'First Message',
      description: 'Started our conversation on BandhanConnect',
      date: '2024-01-10',
      type: 'milestone',
      status: 'completed',
      photos: [],
      participants: ['You', 'Priya Sharma'],
      isPrivate: false
    },
    {
      id: '2',
      title: 'First Video Call',
      description: 'Had our first video call and got to know each other better',
      date: '2024-01-15',
      type: 'milestone',
      status: 'completed',
      photos: ['https://images.pexels.com/photos/4348401/pexels-photo-4348401.jpeg?auto=compress&cs=tinysrgb&w=400'],
      participants: ['You', 'Priya Sharma'],
      isPrivate: false
    },
    {
      id: '3',
      title: 'Family Introduction',
      description: 'Introduced to each other\'s families via video call',
      date: '2024-01-25',
      type: 'meeting',
      status: 'completed',
      photos: ['https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=400'],
      participants: ['You', 'Priya Sharma', 'Both Families'],
      isPrivate: false
    },
    {
      id: '4',
      title: 'First In-Person Meeting',
      description: 'Met in person at a coffee shop in Mumbai',
      date: '2024-02-05',
      type: 'meeting',
      status: 'upcoming',
      photos: [],
      location: 'Cafe Mocha, Mumbai',
      participants: ['You', 'Priya Sharma'],
      isPrivate: false
    },
    {
      id: '5',
      title: 'Engagement Ceremony',
      description: 'Traditional engagement ceremony with both families',
      date: '2024-03-15',
      type: 'ceremony',
      status: 'planned',
      photos: [],
      location: 'Mumbai',
      participants: ['You', 'Priya Sharma', 'Both Families'],
      isPrivate: false
    }
  ]);

  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    type: 'milestone' as TimelineEvent['type'],
    location: '',
    isPrivate: false
  });
  const [submitting, setSubmitting] = useState(false);

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.date) return;
    setSubmitting(true);
    try {
      const payload = {
        ...newEvent,
        status: new Date(newEvent.date) > new Date() ? 'upcoming' : 'completed',
        photos: [],
        participants: ['You', 'Priya Sharma']
      };
      const res = await api.post('/timeline', payload);
      const savedEvent = res.data;
      setEvents([...events, {
        ...savedEvent,
        id: savedEvent._id || Date.now().toString()
      }].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      setNewEvent({
        title: '',
        description: '',
        date: '',
        type: 'milestone',
        location: '',
        isPrivate: false
      });
      setShowAddEvent(false);
    } catch (err) {
      alert('Failed to add event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'milestone': return Heart;
      case 'meeting': return Users;
      case 'ceremony': return Star;
      case 'memory': return Camera;
      default: return Calendar;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'upcoming': return 'bg-blue-500';
      case 'planned': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Journey Timeline</h1>
          <p className="text-gray-600">Track your relationship milestones and memories</p>
        </div>
        <button
          onClick={() => setShowAddEvent(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      </div>

      {/* Add Event Modal */}
      {showAddEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Event</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  className="input-field"
                  placeholder="Event title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  className="input-field"
                  rows={3}
                  placeholder="Event description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({...newEvent, type: e.target.value as TimelineEvent['type']})}
                  className="input-field"
                >
                  <option value="milestone">Milestone</option>
                  <option value="meeting">Meeting</option>
                  <option value="ceremony">Ceremony</option>
                  <option value="memory">Memory</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location (Optional)</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                  className="input-field"
                  placeholder="Event location"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="private"
                  checked={newEvent.isPrivate}
                  onChange={(e) => setNewEvent({...newEvent, isPrivate: e.target.checked})}
                  className="rounded border-gray-300 text-saffron focus:ring-saffron"
                />
                <label htmlFor="private" className="ml-2 text-sm text-gray-700">
                  Keep this event private
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddEvent(false)}
                className="flex-1 btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                className="flex-1 btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Adding...' : 'Add Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        <div className="space-y-8">
          {events.map((event, index) => {
            const Icon = getEventIcon(event.type);
            return (
              <div key={event.id} className="relative flex items-start gap-6">
                <div className={`w-16 h-16 rounded-full ${getStatusColor(event.status)} flex items-center justify-center relative z-10`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                
                <div className="flex-1 card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                      <p className="text-gray-600 mt-1">{event.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{event.participants.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.status === 'completed' ? 'bg-green-100 text-green-800' :
                        event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {event.photos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                      {event.photos.map((photo, photoIndex) => (
                        <img
                          key={photoIndex}
                          src={photo}
                          alt={`${event.title} photo ${photoIndex + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button className="text-sm text-saffron hover:text-orange-600 flex items-center gap-1">
                        <Camera className="w-4 h-4" />
                        Add Photos
                      </button>
                      <button className="text-sm text-saffron hover:text-orange-600 flex items-center gap-1">
                        <Gift className="w-4 h-4" />
                        Add Memory
                      </button>
                    </div>
                    {event.isPrivate && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Private
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Milestones */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Suggested Next Steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Plan First Date',
              description: 'Schedule a romantic first date',
              icon: Heart,
              color: 'bg-pink-500'
            },
            {
              title: 'Meet Extended Family',
              description: 'Introduce to extended family members',
              icon: Users,
              color: 'bg-blue-500'
            },
            {
              title: 'Cultural Exchange',
              description: 'Share cultural traditions and values',
              icon: Star,
              color: 'bg-purple-500'
            }
          ].map((suggestion, index) => (
            <div key={index} className="card p-6 text-center">
              <div className={`w-12 h-12 ${suggestion.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                <suggestion.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{suggestion.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{suggestion.description}</p>
              <button className="btn-outline w-full">
                Plan This
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline;