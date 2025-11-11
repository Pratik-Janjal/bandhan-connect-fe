import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { matchesAPI } from '../services/api';
import MatchCard from '../components/MatchCard';
import { Filter, Heart } from 'lucide-react';

interface User {
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
}

const Matches: React.FC = () => {
  const [matches, setMatches] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    ageRange: '',
    location: '',
    education: '',
    profession: ''
  });
  const navigate = useNavigate();
  
  // const { id } = useParams<{ id: string }>();
  const id = localStorage.getItem('id');
  
  const loadMatches = useCallback(async () => {
    try {
      setLoading(true);
      const data = await matchesAPI.getMatches(id);
  
      // ✅ Ensure matches is always an array
      if (Array.isArray(data)) {
        setMatches(data);
      } else {
        console.error("Unexpected API response:", data);
        setMatches([]);
      }
    } catch (error) {
      console.error("Error loading matches:", error);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, [id]);
  

  useEffect(() => {
    if(id){
      loadMatches()
      console.log("fetch matches");
    }else{
      navigate("/")
      console.log("userid-failed")
    }
  }, [id, loadMatches]);

  const handleLike = async (userId: string) => {
    try {
      await matchesAPI.likeUser(userId);
      // Remove the liked user from the list
      setMatches(matches.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error liking user:', error);
    }
  };

  const handleMessage = (userId: string) => {
    navigate(`/app/chat/${userId}`);
  };

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Your Matches</h1>
          <p className="text-gray-600 text-sm lg:text-lg ">Discover profiles perfectly matched for you</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-outline flex items-center gap-2"
        >
          <Filter className="w-4 h-4"/>
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="card p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age Range</label>
              <select 
                value={filters.ageRange}
                onChange={(e) => setFilters(prev => ({...prev, ageRange: e.target.value}))}
                className="input-field"
              >
                <option value="">All Ages</option>
                <option value="24-28">24-28</option>
                <option value="29-33">29-33</option>
                <option value="34-38">34-38</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select 
                value={filters.location}
                onChange={(e) => setFilters(prev => ({...prev, location: e.target.value}))}
                className="input-field"
              >
                <option value="">All Locations</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Bangalore">Bangalore</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
              <select 
                value={filters.education}
                onChange={(e) => setFilters(prev => ({...prev, education: e.target.value}))}
                className="input-field"
              >
                <option value="">All Education</option>
                <option value="Graduate">Graduate</option>
                <option value="Post Graduate">Post Graduate</option>
                <option value="Professional">Professional</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profession</label>
              <select 
                value={filters.profession}
                onChange={(e) => setFilters(prev => ({...prev, profession: e.target.value}))}
                className="input-field"
              >
                <option value="">All Professions</option>
                <option value="Software">Software</option>
                <option value="Business">Business</option>
                <option value="Healthcare">Healthcare</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading matches...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((user) => (
            <MatchCard
              key={user.id}
              user={user}
              onLike={handleLike}
              onMessage={handleMessage}
            />
          ))}
        </div>
      )}

      {matches.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No More Matches</h3>
          <p className="text-gray-600">You've seen all available matches. Try adjusting your preferences!</p>
        </div>
      )}
    </div>
  );
};

export default Matches;