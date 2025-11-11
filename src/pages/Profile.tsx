import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Edit3, Camera, MapPin, GraduationCap, Briefcase, Heart, Shield, Settings, X } from 'lucide-react';
import { updateProfileAPI } from '../services/api';


const Profile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<any>({
    userId : user?._id,
    name: user?.name,
    age: user?.age,
    location:user?.location,
    education: user?.education,
    profession: user?.profession,
    religion: user?.religion,
    bio: user?.bio,
    interests: [],
    photos: []
  });

  useEffect(() => {
    if(user){
      setProfileData({
        userId : user?._id,
        name: user?.name,
        age: user?.age,
        location: user?.location,
        education: user?.education,
        profession: user?.profession,
        religion: user?.religion,
        bio: user?.bio,
        interests: user?.interests ,
        photos: user?.photos
      })
    }
  }, [user,refreshUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev:any) => ({ ...prev, [name]: value }));
  };
  
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      
      const res = await updateProfileAPI(profileData);
      if (res.success) {
        alert("Profile updated successfully!");
        refreshUser(); // 🔁 refresh data from backend
        setIsEditing(false);
      } else {
        alert(res.message || "Update failed");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Something went wrong. Try again.");
    }
  };

  const handleCancel = () => {
    refreshUser();
    setIsEditing(false);
  };

  const handleAccountSettings = () => {
    alert('Account settings page would open here');
  };

  const handlePrivacySettings = () => {
    alert('Privacy settings page would open here');
  };

  const handlePreferences = () => {
    alert('Preferences page would open here');
  };

  return (
    <div className="max-w-4xl mx-auto fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your profile information</p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button onClick={handleCancel} className="btn-outline">
                Cancel
              </button>
              <button onClick={handleSave} className="btn-primary">
                Save Changes
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="btn-primary flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Photo & Stats */}
        <div className="lg:col-span-1">
          <div className="card p-6 text-center">
            <div className="relative inline-block mb-4">
              <img
                src={profileData.photos[0]}
                alt={profileData.name}
                className="w-32 h-32 rounded-full object-cover mx-auto"
              />
              {isEditing && (
                <button 
                  onClick={() => alert('Photo upload functionality would open here')}
                  className="absolute bottom-0 right-0 p-2 bg-saffron text-white rounded-full hover:bg-orange-600"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-1">{profileData.name}</h2>
            <p className="text-gray-600 mb-4">{profileData.age} years old</p>
            
            <div className="verification-badge mb-4">
              <Shield className="w-4 h-4" />
              Verified Profile
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-saffron">95%</div>
                <div className="text-sm text-gray-600">Profile Complete</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-teal-600">24</div>
                <div className="text-sm text-gray-600">Profile Views</div>
              </div>
            </div>
          </div>

          <div className="card p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={handleAccountSettings}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center gap-3"
              >
                <Settings className="w-5 h-5 text-gray-400" />
                <span>Account Settings</span>
              </button>
              <button 
                onClick={handlePrivacySettings}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center gap-3"
              >
                <Shield className="w-5 h-5 text-gray-400" />
                <span>Privacy Settings</span>
              </button>
              <button 
                onClick={handlePreferences}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center gap-3"
              >
                <Heart className="w-5 h-5 text-gray-400" />
                <span>Preferences</span>
              </button>
            </div>
          </div>
        </div>


        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name='name'
                    value={profileData.name}
                    onChange={handleChange}
                    className="input-field"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                {isEditing ? (
                  <input
                    type="number"
                    name='age'
                    value={profileData.age}
                    onChange={handleChange}
                    className="input-field"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.age}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                {isEditing ? (
                  <input
                    type="text"
                    name='location'
                    value={profileData.location}
                    onChange={handleChange}
                    className="input-field"
                  />
                ) : (
                  <div className="flex items-center text-gray-900">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    {profileData.location}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Religion</label>
                {isEditing ? (
                  <select
                    value={profileData.religion}
                    onChange={handleChange}
                    className="input-field"
                    name='religion'
                  >
                    <option value="Hindu">Hindu</option>
                    <option value="Muslim">Muslim</option>
                    <option value="Christian">Christian</option>
                    <option value="Sikh">Sikh</option>
                    <option value="Buddhist">Buddhist</option>
                    <option value="Jain">Jain</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{profileData.religion}</p>
                )}
              </div>
            </div>
          </div>

          {/* Education & Career */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Education & Career</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.education}
                    onChange={handleChange}
                    className="input-field"
                    name='education'
                  />
                ) : (
                  <div className="flex items-center text-gray-900">
                    <GraduationCap className="w-4 h-4 mr-2 text-gray-400" />
                    {profileData.education}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profession</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.profession}
                    onChange={handleChange}
                    className="input-field"
                    name='profession'
                  />
                ) : (
                  <div className="flex items-center text-gray-900">
                    <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                    {profileData.profession}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* About Me */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">About Me</h3>
            {isEditing ? (
              <textarea
                value={profileData.bio}
                onChange={handleChange}
                rows={4}
                className="input-field"
                name='bio'
              />
            ) : (
              <p className="text-gray-700 leading-relaxed">{profileData.bio}</p>
            )}
          </div>

          {/* Interests */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {profileData?.interests?.map((interest, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-saffron/10 text-saffron rounded-full text-sm font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Photos */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Photos</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {profileData?.photos?.map((photo, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  {isEditing && (
                    <button className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {isEditing && (
                <div 
                  onClick={() => alert('Add photo functionality would open here')}
                  className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200"
                >
                  <Camera className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;







