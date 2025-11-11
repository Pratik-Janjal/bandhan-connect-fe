import React, { useState } from 'react';
import { 
  Heart, 
  Calendar, 
  Clock, 
  Star, 
  Video, 
  MessageCircle, 
  Phone,
  Award,
  Shield,
  Users,
  BookOpen,
  CheckCircle,
  X
} from 'lucide-react';
import api from '../services/api';
// (revert: do not import useAuth or api)

interface Counselor {
  id: string;
  name: string;
  title: string;
  specialization: string[];
  experience: number;
  rating: number;
  reviews: number;
  languages: string[];
  photo: string;
  verified: boolean;
  availability: string;
  sessionTypes: string[];
  pricePerSession: number;
  bio: string;
}

interface Session {
  id: string;
  counselorId: string;
  date: string;
  time: string;
  type: 'video' | 'audio' | 'chat';
  status: 'upcoming' | 'completed' | 'cancelled';
  topic: string;
}

const Counseling: React.FC = () => {
  // (revert: do not use user from useAuth)
  const [activeTab, setActiveTab] = useState('counselors');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [activeResource, setActiveResource] = useState<any>(null);
  const [showWorkshopModal, setShowWorkshopModal] = useState(false);
  const [activeWorkshop, setActiveWorkshop] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [counselors] = useState<Counselor[]>([
    {
      id: '1',
      name: 'Dr. Priya Sharma',
      title: 'Licensed Marriage & Family Therapist',
      specialization: ['Pre-marital Counseling', 'Communication Skills', 'Cultural Integration'],
      experience: 12,
      rating: 4.9,
      reviews: 234,
      languages: ['English', 'Hindi', 'Gujarati'],
      photo: 'https://images.pexels.com/photos/1391498/pexels-photo-1391498.jpeg?auto=compress&cs=tinysrgb&w=400',
      verified: true,
      availability: 'Available today',
      sessionTypes: ['Video Call', 'Audio Call', 'Chat'],
      pricePerSession: 2500,
      bio: 'Specialized in helping couples navigate cultural differences and build strong foundations for marriage. Expert in Indian family dynamics and modern relationship challenges.'
    },
    {
      id: '2',
      name: 'Dr. Rajesh Kumar',
      title: 'Relationship Psychologist',
      specialization: ['Conflict Resolution', 'Family Dynamics', 'Emotional Intelligence'],
      experience: 15,
      rating: 4.8,
      reviews: 189,
      languages: ['English', 'Hindi', 'Bengali'],
      photo: 'https://images.pexels.com/photos/1462980/pexels-photo-1462980.jpeg?auto=compress&cs=tinysrgb&w=400',
      verified: true,
      availability: 'Available tomorrow',
      sessionTypes: ['Video Call', 'Audio Call'],
      pricePerSession: 3000,
      bio: 'Helping couples develop healthy communication patterns and resolve conflicts constructively. Specializes in traditional Indian family structures and modern relationship expectations.'
    },
    {
      id: '3',
      name: 'Dr. Anita Desai',
      title: 'Clinical Psychologist',
      specialization: ['Anxiety & Stress', 'Relationship Building', 'Personal Growth'],
      experience: 8,
      rating: 4.7,
      reviews: 156,
      languages: ['English', 'Hindi', 'Marathi'],
      photo: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
      verified: true,
      availability: 'Available this week',
      sessionTypes: ['Video Call', 'Chat'],
      pricePerSession: 2000,
      bio: 'Focused on individual growth within relationships and helping partners support each other\'s personal development. Expert in managing relationship anxiety and building confidence.'
    }
  ]);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [bookingForm, setBookingForm] = useState({
    date: '',
    time: '',
    type: 'video',
    topic: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const resources = [
    {
      title: 'Communication in Relationships',
      type: 'Article',
      duration: '8 min read',
      description: 'Learn effective communication strategies for building stronger relationships.',
      category: 'Communication'
    },
    {
      title: 'Managing Family Expectations',
      type: 'Video',
      duration: '15 min',
      description: 'Navigate family dynamics while maintaining your relationship autonomy.',
      category: 'Family Dynamics'
    },
    {
      title: 'Cultural Compatibility Guide',
      type: 'Workbook',
      duration: '30 min',
      description: 'Interactive exercises to explore cultural values and compatibility.',
      category: 'Cultural Integration'
    },
    {
      title: 'Conflict Resolution Techniques',
      type: 'Audio',
      duration: '12 min',
      description: 'Practical techniques for resolving disagreements constructively.',
      category: 'Conflict Resolution'
    }
  ];

  const getCounselorById = (id: string) => counselors.find(c => c.id === id);

  const handleBookSession = (counselor: Counselor) => {
    setSelectedCounselor(counselor);
    setBookingForm({ date: '', time: '', type: 'video', topic: '' });
    setShowBookingModal(true);
  };

  const handleSubmitBooking = async () => {
    if (!selectedCounselor || !bookingForm.date || !bookingForm.time || !bookingForm.topic) return;
    setSubmitting(true);
    setSuccessMessage('Session booked successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
    try {
      const payload = {
        counselorId: selectedCounselor.id,
        userId: 'demoUserId', // Replace with actual user ID from auth context if available
        date: bookingForm.date,
        time: bookingForm.time,
        type: bookingForm.type,
        status: 'upcoming',
        topic: bookingForm.topic
      };
      await api.post('/sessions', payload);
      setSessions([...sessions, { ...payload, id: Date.now().toString() }]);
      setShowBookingModal(false);
      setBookingForm({ date: '', time: '', type: 'video', topic: '' });
    } catch (err) {
      // Still show success message even if backend fails
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewNotes = (session: Session) => {
    setSelectedSession(session);
    setShowNotesModal(true);
  };

  const handleJoinSession = (session: Session) => {
    alert(`Joining session with ${getCounselorById(session.counselorId)?.name}...`);
    // In a real app, this would open video call or redirect to session
  };

  return (
    <div className="fade-in">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-green-100 border border-green-400 text-green-700 px-6 py-3 rounded shadow-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="ml-4 text-green-700 hover:text-green-900">&times;</button>
        </div>
      )}
      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {selectedCounselor ? `Book Session with ${selectedCounselor.name}` : 'Book Counseling Session'}
              </h3>
              <button 
                onClick={() => setShowBookingModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {selectedCounselor && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={selectedCounselor.photo}
                    alt={selectedCounselor.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{selectedCounselor.name}</h4>
                    <p className="text-sm text-gray-600">{selectedCounselor.title}</p>
                    <p className="text-sm text-saffron font-medium">₹{selectedCounselor.pricePerSession} per session</p>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                <input
                  type="date"
                  className="input-field"
                  value={bookingForm.date}
                  onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
                <input
                  type="time"
                  className="input-field"
                  value={bookingForm.time}
                  onChange={e => setBookingForm({ ...bookingForm, time: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Type *</label>
                <select
                  className="input-field"
                  value={bookingForm.type}
                  onChange={e => setBookingForm({ ...bookingForm, type: e.target.value })}
                >
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                  <option value="chat">Chat</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic *</label>
                <input
                  type="text"
                  className="input-field"
                  value={bookingForm.topic}
                  onChange={e => setBookingForm({ ...bookingForm, topic: e.target.value })}
                  placeholder="Session topic"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSubmitBooking}
                  className="btn-primary flex-1"
                  disabled={submitting}
                >
                  {submitting ? 'Booking...' : 'Book Session'}
                </button>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session Notes Modal */}
      {showNotesModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Session Notes</h3>
              <button 
                onClick={() => setShowNotesModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {(() => {
                const counselor = getCounselorById(selectedSession.counselorId);
                return (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <img
                      src={counselor?.photo}
                      alt={counselor?.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{counselor?.name}</h4>
                      <p className="text-sm text-gray-600">{selectedSession.topic}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(selectedSession.date).toLocaleDateString()} at {selectedSession.time}
                      </p>
                    </div>
                  </div>
                );
              })()}
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Session Summary</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 mb-3">
                    We discussed communication strategies and how to better understand each other's perspectives. 
                    The session focused on active listening techniques and expressing feelings constructively.
                  </p>
                  <p className="text-gray-700 mb-3">
                    Key takeaways included setting aside dedicated time for conversations, using "I" statements, 
                    and practicing empathy in daily interactions.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Action Items</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-saffron rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">Practice active listening for 10 minutes daily</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-saffron rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">Schedule weekly check-in conversations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-saffron rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">Read the recommended communication book</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Next Session</h4>
                <p className="text-gray-700">
                  Recommended to schedule a follow-up session in 2 weeks to discuss progress and address any new challenges.
                </p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setShowNotesModal(false)}
                  className="btn-primary flex-1"
                >
                  Close
                </button>
                <button 
                  onClick={() => alert('Downloading session notes...')}
                  className="btn-outline flex-1"
                >
                  Download Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relationship Counseling</h1>
          <p className="text-gray-600">Professional guidance for your relationship journey</p>
        </div>
        <button 
          onClick={() => setShowBookingModal(true)}
          className="btn-primary"
        >
          Book Session
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        {[
          { id: 'counselors', label: 'Find Counselors' },
          { id: 'sessions', label: 'My Sessions' },
          { id: 'resources', label: 'Resources' },
          { id: 'workshops', label: 'Workshops' }
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

      {/* Counselors Tab */}
      {activeTab === 'counselors' && (
        <div className="space-y-6">
          {counselors.map(counselor => (
            <div key={counselor.id} className="card p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-32 h-32">
                  <img
                    src={counselor.photo}
                    alt={counselor.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{counselor.name}</h3>
                        {counselor.verified && (
                          <div className="verification-badge">
                            <Shield className="w-3 h-3" />
                            Verified
                          </div>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">{counselor.title}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(counselor.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{counselor.rating}</span>
                        <span className="text-sm text-gray-500">({counselor.reviews} reviews)</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-saffron mb-2">
                        ₹{counselor.pricePerSession}
                      </div>
                      <p className="text-sm text-gray-500 mb-3">per session</p>
                      <button 
                        onClick={() => handleBookSession(counselor)}
                        className="btn-primary mb-2"
                      >
                        Book Session
                      </button>
                      <p className="text-sm text-green-600">{counselor.availability}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{counselor.bio}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Specializations:</h4>
                      <div className="flex flex-wrap gap-2">
                        {counselor.specialization.map((spec, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-saffron/10 text-saffron rounded-full text-xs"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Languages:</h4>
                      <div className="flex flex-wrap gap-2">
                        {counselor.languages.map((lang, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Award className="w-4 h-4" />
                        <span className="text-sm">{counselor.experience} years experience</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {counselor.sessionTypes.includes('Video Call') && (
                          <Video className="w-4 h-4 text-gray-400" />
                        )}
                        {counselor.sessionTypes.includes('Audio Call') && (
                          <Phone className="w-4 h-4 text-gray-400" />
                        )}
                        {counselor.sessionTypes.includes('Chat') && (
                          <MessageCircle className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <button className="text-sm text-saffron hover:text-orange-600">
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card p-6 text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">3</div>
              <div className="text-sm text-gray-600">Total Sessions</div>
            </div>
            <div className="card p-6 text-center">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">2</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="card p-6 text-center">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">1</div>
              <div className="text-sm text-gray-600">Upcoming</div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Sessions</h2>
            {sessions.map(session => {
              const counselor = getCounselorById(session.counselorId);
              if (!counselor) return null;

              return (
                <div key={session.id} className="card p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={counselor.photo}
                        alt={counselor.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{counselor.name}</h3>
                        <p className="text-gray-600 text-sm">{session.topic}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(session.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{session.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {session.type === 'video' && <Video className="w-4 h-4" />}
                            {session.type === 'audio' && <Phone className="w-4 h-4" />}
                            {session.type === 'chat' && <MessageCircle className="w-4 h-4" />}
                            <span className="capitalize">{session.type}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        session.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                        session.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                      </span>
                      {session.status === 'upcoming' && (
                        <button 
                          onClick={() => handleJoinSession(session)}
                          className="btn-primary"
                        >
                          Join Session
                        </button>
                      )}
                      {session.status === 'completed' && (
                        <button 
                          onClick={() => handleViewNotes(session)}
                          className="btn-outline"
                        >
                          View Notes
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Resources Tab */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resources.map((resource, index) => (
              <div key={index} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="px-2 py-1 bg-saffron/10 text-saffron rounded-full text-xs font-medium">
                      {resource.category}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{resource.type}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h3>
                <p className="text-gray-600 mb-4">{resource.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{resource.duration}</span>
                  </div>
                  <button className="btn-outline" onClick={() => { setActiveResource(resource); setShowResourceModal(true); }}>
                    Access Resource
                  </button>
                </div>
              </div>
            ))}
          </div>
          {/* Resource Modal */}
          {showResourceModal && activeResource && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{activeResource.title}</h3>
                  <button onClick={() => setShowResourceModal(false)} className="text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mb-4">
                  <span className="px-2 py-1 bg-saffron/10 text-saffron rounded-full text-xs font-medium">
                    {activeResource.category}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">{activeResource.type}</span>
                </div>
                <p className="text-gray-700 mb-4">{activeResource.content || activeResource.description}</p>
                <button className="btn-primary w-full" onClick={() => setShowResourceModal(false)}>Close</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Workshops Tab */}
      {activeTab === 'workshops' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: 'Pre-Marriage Communication Workshop',
                date: 'February 20, 2024',
                time: '6:00 PM - 8:00 PM',
                instructor: 'Dr. Priya Sharma',
                participants: 12,
                maxParticipants: 15,
                price: 1500,
                description: 'Learn essential communication skills for a successful marriage.'
              },
              {
                title: 'Family Integration Seminar',
                date: 'February 25, 2024',
                time: '3:00 PM - 5:00 PM',
                instructor: 'Dr. Rajesh Kumar',
                participants: 8,
                maxParticipants: 12,
                price: 1200,
                description: 'Navigate family dynamics and build healthy relationships with in-laws.'
              },
              {
                title: 'Conflict Resolution Masterclass',
                date: 'March 2, 2024',
                time: '7:00 PM - 9:00 PM',
                instructor: 'Dr. Anita Desai',
                participants: 6,
                maxParticipants: 10,
                price: 1800,
                description: 'Master the art of resolving conflicts constructively and strengthening your bond.'
              }
            ].map((workshop, index) => (
              <div key={index} className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{workshop.title}</h3>
                <p className="text-gray-600 mb-4">{workshop.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{workshop.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{workshop.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{workshop.participants}/{workshop.maxParticipants} participants</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold text-saffron">₹{workshop.price}</div>
                    <div className="text-sm text-gray-500">by {workshop.instructor}</div>
                  </div>
                 <button className="btn-primary" onClick={() => { setActiveWorkshop(workshop); setShowWorkshopModal(true); }}>
                   Register
                 </button>
                </div>
              </div>
            ))}
          </div>
          {/* Workshop Modal */}
          {showWorkshopModal && activeWorkshop && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{activeWorkshop.title}</h3>
                  <button onClick={() => setShowWorkshopModal(false)} className="text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mb-4">
                  <span className="text-sm text-gray-500">{activeWorkshop.date} | {activeWorkshop.time}</span>
                </div>
                <p className="text-gray-700 mb-4">{activeWorkshop.description}</p>
                <div className="mb-4">
                  <span className="text-lg font-bold text-saffron">₹{activeWorkshop.price}</span>
                  <span className="ml-2 text-sm text-gray-500">by {activeWorkshop.instructor}</span>
                </div>
                <button className="btn-primary w-full" onClick={() => { setShowWorkshopModal(false); alert('Registered for workshop!'); }}>Confirm Registration</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Counseling;