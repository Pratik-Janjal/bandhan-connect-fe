import React from 'react';
import { Heart, MapPin, GraduationCap, Briefcase, MessageCircle, Shield } from 'lucide-react';

interface MatchCardProps {
  user: {
    id: string;
    name: string;
    age: number;
    location: string;
    education: string;
    profession: string;
    interests: string[];
    photos: string[];
    compatibility: number;
    verificationStatus: string;
    lastActive: string;
  };
  onLike: (id: string) => void;
  onMessage: (id: string) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ user, onLike, onMessage }) => {
  return (
    <div className="card overflow-hidden fade-in">
      <div className="relative">
        <img 
          src={user.photos[0]} 
          alt={user.name}
          className="w-full h-64 object-cover"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="text-sm font-semibold text-gray-800">{user.compatibility}% Match</span>
        </div>
        {user.verificationStatus === 'verified' && (
          <div className="absolute top-4 left-4 verification-badge">
            <Shield className="w-4 h-4"/>
            Verified
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{user.name}, {user.age}</h3>
            <p className="text-gray-600 text-sm">Active {user.lastActive}</p>
          </div>
          <button
            onClick={() => onLike(user.id)}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Heart className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
            <span className="text-sm">{user.location}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <GraduationCap className="w-4 h-4 mr-2 text-gray-400" />
            <span className="text-sm">{user.education}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
            <span className="text-sm">{user.profession}</span>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Interests</h4>
          <div className="flex flex-wrap gap-2">
            {user.interests.slice(0, 3).map((interest, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
              >
                {interest}
              </span>
            ))}
            {user.interests.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                +{user.interests.length - 3} more
              </span>
            )}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Compatibility</span>
            <span className="text-sm font-semibold text-green-600">{user.compatibility}%</span>
          </div>
          <div className="compatibility-bar">
            <div 
              className="compatibility-fill" 
              style={{ width: `${user.compatibility}%` }}
            ></div>
          </div>
        </div>

        <button
          onClick={() => onMessage(user.id)}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          Send Message
        </button>
      </div>
    </div>
  );
};

export default MatchCard;