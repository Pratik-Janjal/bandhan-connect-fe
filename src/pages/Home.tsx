import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Users, Sparkles, Building, ArrowRight, UserPlus, X } from 'lucide-react';
import { requestAPI } from '../services/api';

const Home: React.FC = () => {
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationData, setApplicationData] = useState({
    name: '',
    email: '',
    phone: '',
    roleRequested: 'vendor',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleApplicationSubmit = async () => {
    if (!applicationData.name || !applicationData.email || !applicationData.phone) {
      alert('Please fill in all required fields');
      return;
    }
    
    setSubmitting(true);
    try {
      await requestAPI.createRequest(applicationData);
      alert('Application submitted successfully! We will review your application and contact you soon.');
      setShowApplicationForm(false);
      setApplicationData({
        name: '',
        email: '',
        phone: '',
        roleRequested: 'vendor',
        message: ''
      });
    } catch (err: any) {
      alert('Failed to submit application. Please try again.');
      console.error('Error submitting application:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-white">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-saffron to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-bold text-gray-900">BandhanConnect</span>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowApplicationForm(true)}
              className="text-gray-600 hover:text-saffron transition-colors flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Apply to Join
            </button>
            <Link to="/login" className="text-gray-600 hover:text-saffron transition-colors">
              Login
            </Link>
            <Link to="/register" className="btn-primary">
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Find Your Perfect
            <span className="text-saffron"> Life Partner</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Modern Indian matrimonial platform combining traditional values with cutting-edge technology. 
            Secure, authentic, and designed for today's generation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-lg px-8 py-4">
              Start Your Journey
            </Link>
            <Link to="/login" className="btn-outline text-lg px-8 py-4">
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
          <div className="text-center p-6 card">
            <div className="w-12 h-12 bg-gradient-to-r from-saffron to-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">TRUST Verification</h3>
            <p className="text-gray-600">Aadhaar-based verification ensures authentic profiles and secure connections.</p>
          </div>

          <div className="text-center p-6 card">
            <div className="w-12 h-12 bg-gradient-to-r from-teal to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Matching</h3>
            <p className="text-gray-600">AI-powered compatibility algorithm based on values, interests, and lifestyle.</p>
          </div>

          <div className="text-center p-6 card">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Family Connect</h3>
            <p className="text-gray-600">Balanced family involvement while respecting individual choice and privacy.</p>
          </div>

          <div className="text-center p-6 card">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Journey Timeline</h3>
            <p className="text-gray-600">Track your relationship milestones and plan your future together.</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 text-center">
          <div>
            <h3 className="text-3xl font-bold text-gray-900">125K+</h3>
            <p className="text-gray-600">Verified Profiles</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-900">8.9K+</h3>
            <p className="text-gray-600">Successful Matches</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-900">45K+</h3>
            <p className="text-gray-600">Active Users</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-20 border-t border-gray-200">
        <div className="text-center text-gray-600">
          <p>&copy; 2024 BandhanConnect. All rights reserved.</p>
        </div>
      </footer>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Apply to Join BandhanConnect</h3>
              <button 
                onClick={() => setShowApplicationForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium text-blue-900">Join Our Platform</h4>
                </div>
                <p className="text-sm text-blue-700">
                  Choose your role and become part of our trusted network. We offer opportunities for vendors, counselors, and community managers.
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
                    value={applicationData.name}
                    onChange={e => setApplicationData({ ...applicationData, name: e.target.value })}
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
                    value={applicationData.email}
                    onChange={e => setApplicationData({ ...applicationData, email: e.target.value })}
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
                  value={applicationData.phone}
                  onChange={e => setApplicationData({ ...applicationData, phone: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  I want to serve as *
                </label>
                <select 
                  className="input-field"
                  value={applicationData.roleRequested}
                  onChange={e => setApplicationData({ ...applicationData, roleRequested: e.target.value })}
                >
                  <option value="vendor">Vendor (Wedding Services)</option>
                  <option value="counselor">Counselor (Relationship Guidance)</option>
                  <option value="community">Community Manager</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tell us about yourself
                </label>
                <textarea 
                  className="input-field h-32 resize-none" 
                  placeholder="Describe your experience, qualifications, and why you'd like to join our platform..."
                  value={applicationData.message}
                  onChange={e => setApplicationData({ ...applicationData, message: e.target.value })}
                ></textarea>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">What happens next?</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• We'll review your application within 2-3 business days</li>
                  <li>• If approved, we'll create your account</li>
                  <li>• You'll receive login credentials via email</li>
                  <li>• Start using your role-specific dashboard</li>
                </ul>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={handleApplicationSubmit}
                  className="btn-primary flex-1"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
                <button 
                  onClick={() => setShowApplicationForm(false)}
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

export default Home;