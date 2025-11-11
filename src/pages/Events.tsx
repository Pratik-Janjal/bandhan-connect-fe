import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, Filter, Plus, Heart, Star, X } from 'lucide-react';
import { eventsAPI } from '../services/api';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'virtual' | 'in-person' | 'hybrid';
  category: 'networking' | 'workshop' | 'social' | 'cultural';
  maxParticipants: number;
  currentParticipants: number;
  price: number;
  organizer: string;
  image: string;
  featured: boolean;
}

interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'virtual' | 'in-person' | 'hybrid';
  category: 'networking' | 'workshop' | 'social' | 'cultural';
  maxParticipants: number;
  price: number;
  organizer: string;
  image: string;
  featured: boolean;
}

const Events: React.FC = () => {
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    type: 'virtual',
    category: 'networking',
    maxParticipants: 50,
    price: 0,
    organizer: '',
    image: 'https://images.pexels.com/photos/4348401/pexels-photo-4348401.jpeg?auto=compress&cs=tinysrgb&w=400',
    featured: false
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsAPI.getEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
      // Fallback to sample data
      setEvents([
        {
          id: '1',
          title: 'Virtual Speed Networking - Mumbai',
          description: 'Meet 8-10 potential matches in structured 5-minute conversations. Perfect for busy professionals!',
          date: '2024-02-10',
          time: '19:00',
          location: 'Virtual Event',
          type: 'virtual',
          category: 'networking',
          maxParticipants: 50,
          currentParticipants: 42,
          price: 299,
          organizer: 'BandhanConnect Team',
          image: 'https://images.pexels.com/photos/4348401/pexels-photo-4348401.jpeg?auto=compress&cs=tinysrgb&w=400',
          featured: true
        },
        {
          id: '2',
          title: 'Cultural Heritage Workshop',
          description: 'Explore different Indian cultural traditions and their role in modern relationships.',
          date: '2024-02-15',
          time: '15:00',
          location: 'Cultural Center, Delhi',
          type: 'in-person',
          category: 'cultural',
          maxParticipants: 30,
          currentParticipants: 18,
          price: 499,
          organizer: 'Cultural Heritage Foundation',
          image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=400',
          featured: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitEvent = async () => {
    // Basic validation
    if (!formData.title || !formData.description || !formData.date || !formData.time || !formData.location) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const newEvent = await eventsAPI.createEvent(formData);
      console.log('Event created:', newEvent);
      
      // Add the new event to the list
      setEvents(prev => [newEvent, ...prev]);
      
      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        type: 'virtual',
        category: 'networking',
        maxParticipants: 50,
        price: 0,
        organizer: '',
        image: 'https://images.pexels.com/photos/4348401/pexels-photo-4348401.jpeg?auto=compress&cs=tinysrgb&w=400',
        featured: false
      });
      setShowCreateEvent(false);
      
      alert('Event created successfully!');
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      type: 'virtual',
      category: 'networking',
      maxParticipants: 50,
      price: 0,
      organizer: '',
      image: 'https://images.pexels.com/photos/4348401/pexels-photo-4348401.jpeg?auto=compress&cs=tinysrgb&w=400',
      featured: false
    });
  };

  const [filter, setFilter] = useState({
    type: 'all',
    category: 'all',
    priceRange: 'all'
  });

  const filteredEvents = events.filter(event => {
    if (filter.type !== 'all' && event.type !== filter.type) return false;
    if (filter.category !== 'all' && event.category !== filter.category) return false;
    if (filter.priceRange !== 'all') {
      if (filter.priceRange === 'free' && event.price > 0) return false;
      if (filter.priceRange === 'paid' && event.price === 0) return false;
      if (filter.priceRange === 'under500' && event.price >= 500) return false;
      if (filter.priceRange === 'over500' && event.price < 500) return false;
    }
    return true;
  });

  const featuredEvents = events.filter(event => event.featured);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'virtual': return 'bg-blue-100 text-blue-800';
      case 'in-person': return 'bg-green-100 text-green-800';
      case 'hybrid': return 'bg-purple-100 text-purple-800';
      default: return '';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
              <button 
          className="btn btn-primary flex items-center"
          onClick={() => setShowCreateEvent(true)}
        >
          <Plus className="w-4 h-4 mr-2" /> Create Event
              </button>
            </div>
      {/* Filter UI */}
      <div className="mb-6 flex gap-4 items-center">
                <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select 
            className="form-select"
            value={filter.type}
            onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}
          >
            <option value="all">All</option>
                    <option value="virtual">Virtual</option>
                    <option value="in-person">In-Person</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
              </div>
              <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select 
            className="form-select"
            value={filter.category}
            onChange={e => setFilter(f => ({ ...f, category: e.target.value }))}
          >
            <option value="all">All</option>
                    <option value="networking">Networking</option>
                    <option value="workshop">Workshop</option>
                    <option value="social">Social</option>
                    <option value="cultural">Cultural</option>
                  </select>
                </div>
                <div>
          <label className="block text-sm font-medium text-gray-700">Price</label>
          <select
            className="form-select"
            value={filter.priceRange}
            onChange={e => setFilter(f => ({ ...f, priceRange: e.target.value }))}
          >
            <option value="all">All</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
            <option value="under500">Under ₹500</option>
            <option value="over500">Over ₹500</option>
          </select>
                </div>
              </div>
      {/* Featured Events */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Featured Events</h2>
      {loading ? (
        <p className="mt-4 text-gray-600">Loading events...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {featuredEvents.map(event => (
            <div key={event.id} className="card p-6 flex flex-col">
              <img src={event.image} alt={event.title} className="w-full h-40 object-cover rounded mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(event.date).toLocaleDateString()}</span>
                <Clock className="w-4 h-4 ml-4" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <MapPin className="w-4 h-4" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Users className="w-4 h-4" />
                <span>{event.currentParticipants}/{event.maxParticipants} participants</span>
              </div>
              <p className="text-gray-700 mb-4">{event.description}</p>
              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getTypeColor(event.type)}`}>{event.type}</span>
              <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800 ml-2">{event.category}</span>
              <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800 ml-2">₹{event.price}</span>
            </div>
          ))}
        </div>
      )}
      {/* All Events */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">All Events ({filteredEvents.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEvents.map(event => (
          <div key={event.id} className="card p-6 flex flex-col">
            <img src={event.image} alt={event.title} className="w-full h-40 object-cover rounded mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
            <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Calendar className="w-4 h-4" />
              <span>{new Date(event.date).toLocaleDateString()}</span>
              <Clock className="w-4 h-4 ml-4" />
              <span>{event.time}</span>
                      </div>
            <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <MapPin className="w-4 h-4" />
              <span>{event.location}</span>
                      </div>
            <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Users className="w-4 h-4" />
              <span>{event.currentParticipants}/{event.maxParticipants} participants</span>
                      </div>
            <p className="text-gray-700 mb-4">{event.description}</p>
            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getTypeColor(event.type)}`}>{event.type}</span>
            <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800 ml-2">{event.category}</span>
            <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800 ml-2">₹{event.price}</span>
          </div>
        ))}
      </div>
      {/* Create Event Modal */}
      {showCreateEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setShowCreateEvent(false)}>
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Event</h3>
            <div className="space-y-4">
              <input
                className="form-input w-full"
                placeholder="Title"
                value={formData.title}
                onChange={e => handleInputChange('title', e.target.value)}
              />
              <textarea
                className="form-textarea w-full"
                placeholder="Description"
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
              />
              <input
                className="form-input w-full"
                type="date"
                value={formData.date}
                onChange={e => handleInputChange('date', e.target.value)}
              />
              <input
                className="form-input w-full"
                type="time"
                value={formData.time}
                onChange={e => handleInputChange('time', e.target.value)}
              />
              <input
                className="form-input w-full"
                placeholder="Location"
                value={formData.location}
                onChange={e => handleInputChange('location', e.target.value)}
              />
            <select
                className="form-select w-full"
                value={formData.type}
                onChange={e => handleInputChange('type', e.target.value)}
              >
              <option value="virtual">Virtual</option>
              <option value="in-person">In-Person</option>
              <option value="hybrid">Hybrid</option>
            </select>
            <select
                className="form-select w-full"
                value={formData.category}
                onChange={e => handleInputChange('category', e.target.value)}
              >
              <option value="networking">Networking</option>
              <option value="workshop">Workshop</option>
              <option value="social">Social</option>
              <option value="cultural">Cultural</option>
            </select>
              <input
                className="form-input w-full"
                type="number"
                placeholder="Max Participants"
                value={formData.maxParticipants}
                onChange={e => handleInputChange('maxParticipants', Number(e.target.value))}
              />
              <input
                className="form-input w-full"
                type="number"
                placeholder="Price (₹)"
                value={formData.price}
                onChange={e => handleInputChange('price', Number(e.target.value))}
              />
              <input
                className="form-input w-full"
                placeholder="Organizer"
                value={formData.organizer}
                onChange={e => handleInputChange('organizer', e.target.value)}
              />
              <input
                className="form-input w-full"
                placeholder="Image URL"
                value={formData.image}
                onChange={e => handleInputChange('image', e.target.value)}
              />
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={e => handleInputChange('featured', e.target.checked)}
                  className="form-checkbox"
                />
                <span className="ml-2">Featured Event</span>
              </label>
          </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                className="btn btn-secondary"
                onClick={resetForm}
                disabled={submitting}
              >
                Reset
              </button>
                        <button 
                className="btn btn-primary"
                onClick={handleSubmitEvent}
                disabled={submitting}
              >
                {submitting ? 'Creating...' : 'Create Event'}
                        </button>
                      </div>
                    </div>
        </div>
      )}
    </div>
  );
};

export default Events;