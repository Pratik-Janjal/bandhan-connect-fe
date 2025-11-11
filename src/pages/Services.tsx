import React, { useState } from 'react';
import { 
  Heart, 
  Camera, 
  Music, 
  Utensils, 
  Car, 
  Home, 
  Palette, 
  Gift,
  Star,
  MapPin,
  Phone,
  Mail,
  Clock,
  Shield,
  Award,
  X,
  UserPlus,
  Building
} from 'lucide-react';
import api from '../services/api';
import { requestAPI } from '../services/api';

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  rating: number;
  reviews: number;
  priceRange: string;
  location: string;
  image: string;
  verified: boolean;
  featured: boolean;
  contact: {
    phone: string;
    email: string;
  };
  services: string[];
}

const Services: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [showListService, setShowListService] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showServiceDetails, setShowServiceDetails] = useState(false);
  
  const [services, setServices] = useState<Service[]>([
    {
      id: '1',
      name: 'Royal Wedding Photography',
      category: 'photography',
      description: 'Capturing your special moments with artistic excellence. Specializing in traditional and contemporary wedding photography.',
      rating: 4.9,
      reviews: 156,
      priceRange: '₹50,000 - ₹2,00,000',
      location: 'Mumbai, Delhi, Bangalore',
      image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400',
      verified: true,
      featured: true,
      contact: {
        phone: '+91 98765 43210',
        email: 'info@royalweddingphoto.com'
      },
      services: ['Pre-wedding Shoot', 'Wedding Day Photography', 'Reception Coverage', 'Album Design']
    },
    {
      id: '2',
      name: 'Melodious Moments',
      category: 'music',
      description: 'Professional musicians and DJs for all your wedding celebrations. From classical to contemporary music.',
      rating: 4.7,
      reviews: 89,
      priceRange: '₹25,000 - ₹1,50,000',
      location: 'Delhi, Gurgaon, Noida',
      image: 'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg?auto=compress&cs=tinysrgb&w=400',
      verified: true,
      featured: false,
      contact: {
        phone: '+91 87654 32109',
        email: 'bookings@melodiousmoments.com'
      },
      services: ['Live Band', 'DJ Services', 'Sound System', 'Traditional Musicians']
    },
    {
      id: '3',
      name: 'Spice Garden Catering',
      category: 'catering',
      description: 'Authentic Indian cuisine with modern presentation. Customized menus for all dietary preferences.',
      rating: 4.8,
      reviews: 234,
      priceRange: '₹800 - ₹2,500 per plate',
      location: 'Bangalore, Chennai, Hyderabad',
      image: 'https://images.pexels.com/photos/1845534/pexels-photo-1845534.jpeg?auto=compress&cs=tinysrgb&w=400',
      verified: true,
      featured: true,
      contact: {
        phone: '+91 76543 21098',
        email: 'orders@spicegardencatering.com'
      },
      services: ['Multi-cuisine Menu', 'Live Counters', 'Dessert Station', 'Beverage Service']
    },
    {
      id: '4',
      name: 'Elegant Decorators',
      category: 'decoration',
      description: 'Transform your venue into a magical space with our creative decoration and design services.',
      rating: 4.6,
      reviews: 112,
      priceRange: '₹75,000 - ₹5,00,000',
      location: 'Mumbai, Pune, Nashik',
      image: 'https://images.pexels.com/photos/1382734/pexels-photo-1382734.jpeg?auto=compress&cs=tinysrgb&w=400',
      verified: true,
      featured: false,
      contact: {
        phone: '+91 65432 10987',
        email: 'design@elegantdecorators.com'
      },
      services: ['Mandap Decoration', 'Floral Arrangements', 'Lighting Design', 'Stage Setup']
    },
    {
      id: '5',
      name: 'Luxury Transport Services',
      category: 'transport',
      description: 'Premium transportation for the wedding party. Luxury cars, decorated vehicles, and group transport.',
      rating: 4.5,
      reviews: 67,
      priceRange: '₹15,000 - ₹1,00,000',
      location: 'Delhi, Mumbai, Bangalore',
      image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
      verified: true,
      featured: false,
      contact: {
        phone: '+91 54321 09876',
        email: 'bookings@luxurytransport.com'
      },
      services: ['Bridal Car', 'Guest Transportation', 'Decorated Vehicles', 'Airport Transfers']
    },
    {
      id: '6',
      name: 'Dream Venues',
      category: 'venue',
      description: 'Beautiful venues for all your wedding functions. From intimate gatherings to grand celebrations.',
      rating: 4.9,
      reviews: 198,
      priceRange: '₹1,00,000 - ₹10,00,000',
      location: 'Goa, Udaipur, Jaipur',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
      verified: true,
      featured: true,
      contact: {
        phone: '+91 43210 98765',
        email: 'venues@dreamvenues.com'
      },
      services: ['Banquet Halls', 'Outdoor Venues', 'Destination Weddings', 'Accommodation']
    }
  ]);

  const [newService, setNewService] = useState({
    name: '',
    category: 'photography',
    description: '',
    rating: 5,
    reviews: 0,
    priceRange: '',
    location: '',
    image: '',
    verified: false,
    featured: false,
    contact: { phone: '', email: '' },
    services: ['']
  });
  const [submitting, setSubmitting] = useState(false);
  
  // Vendor application state
  const [showVendorApplication, setShowVendorApplication] = useState(false);
  const [vendorApplication, setVendorApplication] = useState({
    name: '',
    email: '',
    phone: '',
    roleRequested: 'vendor',
    message: ''
  });
  const [submittingVendor, setSubmittingVendor] = useState(false);

  const categories = [
    { id: 'all', label: 'All Services', icon: Heart },
    { id: 'photography', label: 'Photography', icon: Camera },
    { id: 'music', label: 'Music & Entertainment', icon: Music },
    { id: 'catering', label: 'Catering', icon: Utensils },
    { id: 'decoration', label: 'Decoration', icon: Palette },
    { id: 'transport', label: 'Transportation', icon: Car },
    { id: 'venue', label: 'Venues', icon: Home },
    { id: 'gifts', label: 'Gifts & Favors', icon: Gift }
  ];

  const filteredServices = activeCategory === 'all' 
    ? services 
    : services.filter(service => service.category === activeCategory);

  const featuredServices = services.filter(service => service.featured);

  const handleViewDetails = (service: Service) => {
    setSelectedService(service);
    setShowServiceDetails(true);
  };

  const handleListService = async () => {
    if (!newService.name || !newService.category || !newService.description) return;
    setSubmitting(true);
    try {
      const payload = {
        ...newService,
        services: newService.services.filter(s => s.trim() !== '')
      };
      const res = await api.post('/services', payload);
      const savedService = res.data;
      setServices([{ ...savedService, id: savedService._id || Date.now().toString() }, ...services]);
      setShowListService(false);
      setNewService({
        name: '',
        category: 'photography',
        description: '',
        rating: 5,
        reviews: 0,
        priceRange: '',
        location: '',
        image: '',
        verified: false,
        featured: false,
        contact: { phone: '', email: '' },
        services: ['']
      });
    } catch (err) {
      alert('Failed to list service. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGetQuote = (service: Service) => {
    alert(`Quote request sent to ${service.name}! They will contact you soon.`);
  };

  const handleViewPortfolio = (service: Service) => {
    alert(`Opening portfolio for ${service.name}...`);
  };

  const handleSendMessage = (service: Service) => {
    alert(`Opening chat with ${service.name}...`);
  };

  const handleCallNow = (service: Service) => {
    window.open(`tel:${service.contact.phone}`, '_blank');
  };

  const handleVendorApplication = async () => {
    if (!vendorApplication.name || !vendorApplication.email || !vendorApplication.phone) {
      alert('Please fill in all required fields');
      return;
    }
    
    setSubmittingVendor(true);
    try {
      await requestAPI.createRequest(vendorApplication);
      alert('Vendor application submitted successfully! We will review your application and contact you soon.');
      setShowVendorApplication(false);
      setVendorApplication({
        name: '',
        email: '',
        phone: '',
        roleRequested: 'vendor',
        message: ''
      });
    } catch (err: any) {
      alert('Failed to submit application. Please try again.');
      console.error('Error submitting vendor application:', err);
    } finally {
      setSubmittingVendor(false);
    }
  };

  return (
    <div className="fade-in">
      {/* List Service Modal */}
      {showListService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">List Your Service</h3>
              <button 
                onClick={() => setShowListService(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Name</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Enter service name"
                    value={newService.name}
                    onChange={e => setNewService({ ...newService, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select 
                    className="input-field"
                    value={newService.category}
                    onChange={e => setNewService({ ...newService, category: e.target.value })}
                  >
                    <option value="photography">Photography</option>
                    <option value="music">Music & Entertainment</option>
                    <option value="catering">Catering</option>
                    <option value="decoration">Decoration</option>
                    <option value="transport">Transportation</option>
                    <option value="venue">Venues</option>
                    <option value="gifts">Gifts & Favors</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea 
                  className="input-field h-32 resize-none" 
                  placeholder="Describe your service..."
                  value={newService.description}
                  onChange={e => setNewService({ ...newService, description: e.target.value })}
                ></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="e.g., ₹10,000 - ₹50,000"
                    value={newService.priceRange}
                    onChange={e => setNewService({ ...newService, priceRange: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="City, State"
                    value={newService.location}
                    onChange={e => setNewService({ ...newService, location: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input 
                    type="tel" 
                    className="input-field" 
                    placeholder="+91 98765 43210"
                    value={newService.contact.phone}
                    onChange={e => setNewService({ ...newService, contact: { ...newService.contact, phone: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    className="input-field" 
                    placeholder="your@email.com"
                    value={newService.contact.email}
                    onChange={e => setNewService({ ...newService, contact: { ...newService.contact, email: e.target.value } })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Image URL"
                  value={newService.image}
                  onChange={e => setNewService({ ...newService, image: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-4 mb-2">
                <label className="block text-sm font-medium text-gray-700">Verified</label>
                <input 
                  type="checkbox" 
                  checked={newService.verified}
                  onChange={e => setNewService({ ...newService, verified: e.target.checked })}
                />
                <label className="block text-sm font-medium text-gray-700">Featured</label>
                <input 
                  type="checkbox" 
                  checked={newService.featured}
                  onChange={e => setNewService({ ...newService, featured: e.target.checked })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Services Offered</label>
                {newService.services.map((service, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      className="input-field flex-1"
                      placeholder="Service name"
                      value={service}
                      onChange={e => {
                        const updated = [...newService.services];
                        updated[idx] = e.target.value;
                        setNewService({ ...newService, services: updated });
                      }}
                    />
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => {
                        setNewService({
                          ...newService,
                          services: newService.services.filter((_, i) => i !== idx)
                        });
                      }}
                      disabled={newService.services.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setNewService({ ...newService, services: [...newService.services, ''] })}
                >
                  Add Service
                </button>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleListService}
                  className="btn-primary flex-1"
                  disabled={submitting}
                >
                  {submitting ? 'Listing...' : 'List Service'}
                </button>
                <button 
                  onClick={() => setShowListService(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Details Modal */}
      {showServiceDetails && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">{selectedService.name}</h3>
              <button 
                onClick={() => setShowServiceDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <img
                  src={selectedService.image}
                  alt={selectedService.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {selectedService.verified && (
                    <div className="verification-badge">
                      <Shield className="w-3 h-3" />
                      Verified
                    </div>
                  )}
                  {selectedService.featured && (
                    <span className="bg-saffron text-white px-2 py-1 rounded-full text-xs font-medium">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-gray-700 mb-4">{selectedService.description}</p>
                
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(selectedService.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{selectedService.rating}</span>
                  <span className="text-sm text-gray-500">({selectedService.reviews} reviews)</span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{selectedService.location}</span>
                  </div>
                  <div className="text-sm font-medium text-saffron">
                    {selectedService.priceRange}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Services Offered:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedService.services.map((serviceItem, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                      >
                        {serviceItem}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{selectedService.contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{selectedService.contact.email}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleGetQuote(selectedService)}
                    className="btn-primary flex-1"
                  >
                    Get Quote
                  </button>
                  <button 
                    onClick={() => handleCallNow(selectedService)}
                    className="btn-outline flex-1"
                  >
                    Call Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wedding Services</h1>
          <p className="text-gray-600">Find trusted vendors for your perfect wedding</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowVendorApplication(true)}
            className="btn-outline flex items-center gap-2"
          >
            <Building className="w-4 h-4" />
            Apply to Join as Vendor
          </button>
          <button 
            onClick={() => setShowListService(true)}
            className="btn-primary"
          >
            List Your Service
          </button>
        </div>
      </div>

      {/* Featured Services */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Featured Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredServices.map(service => (
            <div key={service.id} className="card overflow-hidden">
              <div className="relative">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-saffron text-white px-2 py-1 rounded-full text-xs font-medium">
                    Featured
                  </span>
                </div>
                {service.verified && (
                  <div className="absolute top-4 right-4 verification-badge">
                    <Shield className="w-3 h-3" />
                    Verified
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{service.description}</p>
                
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(service.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{service.rating}</span>
                  <span className="text-sm text-gray-500">({service.reviews} reviews)</span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{service.location}</span>
                  </div>
                  <div className="text-sm font-medium text-saffron">
                    {service.priceRange}
                  </div>
                </div>

                <button 
                  onClick={() => handleViewDetails(service)}
                  className="btn-primary w-full"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`p-4 rounded-lg border-2 transition-all text-center ${
                  activeCategory === category.id
                    ? 'border-saffron bg-saffron/10 text-saffron'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <Icon className="w-6 h-6 mx-auto mb-2" />
                <span className="text-xs font-medium">{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Services List */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {activeCategory === 'all' ? 'All Services' : categories.find(c => c.id === activeCategory)?.label} 
          ({filteredServices.length})
        </h2>
        <div className="space-y-6">
          {filteredServices.map(service => (
            <div key={service.id} className="card p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-48 h-32 md:h-auto">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{service.name}</h3>
                        {service.verified && (
                          <div className="verification-badge">
                            <Shield className="w-3 h-3" />
                            Verified
                          </div>
                        )}
                        {service.featured && (
                          <span className="bg-saffron text-white px-2 py-1 rounded-full text-xs font-medium">
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{service.description}</p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(service.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{service.rating}</span>
                        <span className="text-sm text-gray-500">({service.reviews} reviews)</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-saffron mb-2">
                        {service.priceRange}
                      </div>
                      <button 
                        onClick={() => handleGetQuote(service)}
                        className="btn-primary mb-2"
                      >
                        Get Quote
                      </button>
                      <button 
                        onClick={() => handleViewPortfolio(service)}
                        className="btn-outline w-full"
                      >
                        View Portfolio
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{service.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{service.contact.phone}</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Services Offered:</h4>
                    <div className="flex flex-wrap gap-2">
                      {service.services.map((serviceItem, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                        >
                          {serviceItem}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleSendMessage(service)}
                        className="text-sm text-saffron hover:text-orange-600 flex items-center gap-1"
                      >
                        <Mail className="w-4 h-4" />
                        Send Message
                      </button>
                      <button 
                        onClick={() => handleCallNow(service)}
                        className="text-sm text-saffron hover:text-orange-600 flex items-center gap-1"
                      >
                        <Phone className="w-4 h-4" />
                        Call Now
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>Responds within 2 hours</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vendor Application Modal */}
      {showVendorApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Apply to Join as Vendor</h3>
              <button 
                onClick={() => setShowVendorApplication(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium text-blue-900">Become a Wedding Vendor</h4>
                </div>
                <p className="text-sm text-blue-700">
                  Join our trusted network of wedding vendors and reach thousands of couples planning their special day. 
                  We offer photography, catering, decoration, music, transportation, and more services.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Enter your full name"
                    value={vendorApplication.name}
                    onChange={e => setVendorApplication({ ...vendorApplication, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input 
                    type="email" 
                    className="input-field" 
                    placeholder="your@email.com"
                    value={vendorApplication.email}
                    onChange={e => setVendorApplication({ ...vendorApplication, email: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input 
                  type="tel" 
                  className="input-field" 
                  placeholder="+91 98765 43210"
                  value={vendorApplication.phone}
                  onChange={e => setVendorApplication({ ...vendorApplication, phone: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tell us about your business
                </label>
                <textarea 
                  className="input-field h-32 resize-none" 
                  placeholder="Describe your business, services offered, experience, and why you'd like to join our platform..."
                  value={vendorApplication.message}
                  onChange={e => setVendorApplication({ ...vendorApplication, message: e.target.value })}
                ></textarea>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">What happens next?</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• We'll review your application within 2-3 business days</li>
                  <li>• If approved, we'll create your vendor account</li>
                  <li>• You'll receive login credentials via email</li>
                  <li>• Start listing your services and connecting with couples</li>
                </ul>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={handleVendorApplication}
                  className="btn-primary flex-1"
                  disabled={submittingVendor}
                >
                  {submittingVendor ? 'Submitting...' : 'Submit Application'}
                </button>
                <button 
                  onClick={() => setShowVendorApplication(false)}
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

export default Services;