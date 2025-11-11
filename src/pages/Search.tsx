import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { sampleUsers } from '../data/sampleData';
import { Search as SearchIcon, MapPin, GraduationCap, Briefcase, Heart } from 'lucide-react';
import { filterProfileAPI } from '../services/api';

const Search: React.FC = () => {
  // const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    name : "",
    ageMin: "",
    ageMax: "",
    location: "",
    education: "",
    profession: "",
  });
  const [results, setResults] = useState();
  // const navigate = useNavigate();
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try{
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    //  console.log(params.toString());
      const filtered = await filterProfileAPI(params.toString());
      if(filtered) {
        setResults(filtered)
        console.log("Filtered data fetch successfully");        
      }
    }catch (err){
      console.log(err);      
    }
  }

  // const handleMessage = (userId: string) => {
  //   navigate(`/app/chat/${userId}`);
  // };

  const handleChange = (e:any) => {
    const {name, value} = e.target;
    setFilters((prev)=> ({...prev, [name] : value}))
  }

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Search Profiles</h1>
        <p className="text-gray-600">Find your perfect match with advanced search</p>
      </div>

      {/* Search Form */}
      <div className="card p-6 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name='name'
                value={filters.name}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="Search by name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Age</label>
              <input
                type="number"
                name='ageMin'
                value={filters.ageMin}
                onChange={handleChange}
                className="input-field"
                placeholder="24"
                min="18"
                max="40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Age</label>
              <input
                type="number"
                name='ageMax'
                value={filters.ageMax}
                onChange={handleChange}
                className="input-field"
                placeholder="35"
                min="35"
                max="60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                name='location'
                value={filters.location}
                onChange={handleChange}
                className="input-field"
                placeholder="Any city"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
              <select
                name = "education"
                value={filters.education}
                onChange={handleChange}
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
                onChange={handleChange}
                className="input-field"
              >
                <option value="">All Professions</option>
                <option value="Software">Software</option>
                <option value="Business">Business</option>
                <option value="Healthcare">Healthcare</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary">
            Search Profiles
          </button>
        </form>
      </div>

      {/* Search Results */}
      <div className="space-y-4">
      {results?.length > 0 && (
        <h2 className="text-lg font-semibold text-gray-900">Search Results ({results?.length})</h2>
      )}
        
        {results?.map(user => (
          <div key={user.id} className="card p-6 hover:shadow-xl transition-shadow">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden">
                <img
                  src={user.photos[0]}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{user.name}, {user.age}</h3>
                    <p className="text-gray-600">Active {user.lastActive}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
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
                    <Briefcase className="w-4 h-4 mr-2 text-gray-400"/>
                    <span className="text-sm">{user.profession}</span>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 line-clamp-2">{user.bio}</p>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {user.interests.slice(0, 3).map((interest, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                  
                  <button
                    // onClick={() => handleMessage(user.id)}
                    className="btn-primary"
                  >
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Search;