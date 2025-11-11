import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { X, Plus } from 'lucide-react';
import { updateInfoAPI } from '../services/api';

const CreateProfile: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const { updateProfile } = useUser();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    age: '',
    location: '',
    education: '',
    profession: '',
    religion: '',
    bio: '',
    interests: [] as string[],
    photos: [] as string[],
    userId: '',
    preferences: {
      ageRange: [24, 35] as [number, number],
      location: '',
      education: '',
      profession: '',
    },
  });

  const userId = localStorage.getItem('user_id');
  const interestOptions = [
    'Reading',
    'Traveling',
    'Cooking',
    'Photography',
    'Music',
    'Dancing',
    'Fitness',
    'Yoga',
    'Movies',
    'Art',
    'Technology',
    'Sports',
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleNextStep = async () => {
    setIsLoading(true);
    try {
      if (step === 1) {
        if (!formData.age || !formData.location || !formData.education || !formData.profession || !formData.religion) {
          alert("Please fill in all required fields");
          return;
        }
        await updateProfile({
          age: formData.age,
          location: formData.location,
          education: formData.education,
          profession: formData.profession,
          religion: formData.religion,
          userId: userId,
        });
      } else if (step === 2) {
        if (!formData.bio || !formData.interests) {
          alert("Please fill in all required fields");
          return;
        }
        await updateProfile({
          bio: formData.bio,
          interests: formData.interests,
          userId: userId,
        });
      } else if (step === 3) {
        if (!formData.age || !formData.interests) {
          alert("Please fill in all required fields");
          return;
        }
        // await updateProfile({ photos: formData.photos, userId });
      }
      setStep((prev) => prev + 1);
    } catch (error) {
      console.error('Step submission error:', error);
      alert('Error while saving this step.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteProfile = async () => {
    if (!formData.preferences) {
      alert("Please fill in all required fields");
      return;
    }
    setIsLoading(true);
    try {
      await updateProfile({ preferences: formData.preferences, userId });
      alert('Profile completed successfully!');
      navigate('/app/matches');
    } catch (error) {
      console.error('Error completing profile:', error);
      alert('Failed to complete profile. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const prevStep = () => setStep(step - 1);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (isUploadingPhotos) return; // Prevent multiple simultaneous uploads

    const filesArray = Array.from(e.target.files);
    if (filesArray.length === 0) return;
    
    const userIdValue = userId!;
    
    // Count only non-blob URLs (actual uploaded photos, not previews)
    const currentBackendPhotoCount = formData.photos.filter(url => 
      !url.startsWith('blob:')
    ).length;
    
    // Check if we've reached the maximum (single file upload, so filesArray.length will be 1)
    if (currentBackendPhotoCount >= 6) {
      alert('Maximum 6 photos allowed. Please remove a photo before adding a new one.');
      e.target.value = ''; // Reset input
      return;
    }
    
    // Single file upload - take only the first file
    const fileToUpload = filesArray[0];

    // Show preview immediately using blob URL for better UX
    const previewUrl = URL.createObjectURL(fileToUpload);
    const previewUrls = [previewUrl];

    // Update state with preview URL immediately
    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, previewUrl],
    }));

    setIsUploadingPhotos(true);
    try {
      const formDataToUpload = new FormData();
      formDataToUpload.append("userId", userIdValue);
      formDataToUpload.append("photos", fileToUpload); // Single file upload

      const response = await updateInfoAPI.uploadPhotos(formDataToUpload);
      
      // if (response && response.success && response.photos) {
      //   // Clean up preview URLs
      //   previewUrls.forEach((url) => URL.revokeObjectURL(url));
        
      //   // Backend returns ALL photos (existing + newly uploaded)
      //   // Use backend response as source of truth to avoid duplicates
      //   // Filter to ensure we only keep valid HTTP/HTTPS URLs (not blob URLs)
      //   const backendPhotos = (response.photos || [])
      //     .filter((url: string) => 
      //       typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))
      //     )
      //     .slice(0, 6); // Ensure max 6 photos
        
      //   // Update state with backend photos (backend is the source of truth)
      //   setFormData((prev) => ({
      //     ...prev,
      //     photos: backendPhotos,
      //   }));
      // } else {
      //   // If upload fails, remove only the preview URLs we just added
      //   setFormData((prev) => ({
      //     ...prev,
      //     photos: prev.photos.filter((url) => !previewUrls.includes(url)),
      //   }));
        
      //   // Clean up preview URLs
      //   previewUrls.forEach((url) => URL.revokeObjectURL(url));
      //   alert("Failed to upload photos. Please try again.");
      // }
    } catch (error) {
      console.error("Error uploading photos:", error);
      // Remove preview URLs on error
      setFormData((prev) => ({
        ...prev,
        photos: prev.photos.filter((url) => !previewUrls.includes(url)),
      }));
      
      // Clean up preview URLs
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      alert("Failed to upload photos. Please try again.");
    } finally {
      setIsUploadingPhotos(false);
      // Reset file input to allow selecting the same file again if needed
      e.target.value = '';
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Profile</h1>
          <p className="text-gray-600">Tell us about yourself to find your perfect match</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step {step} of 4</span>
            <span className="text-sm text-gray-500">{Math.round((step / 4) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-saffron to-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        <div className="card p-8">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Age" 
                  required
                />
              </div>
              <input
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Location"
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Education"
                  required
                />
                <input
                  name="profession"
                  value={formData.profession}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Profession"
                  required
                />
              </div>
              <select
                name="religion"
                value={formData.religion}
                onChange={handleInputChange}
                className="input-field"
                required
              >
                <option value="">Select Religion</option>
                <option value="Hindu">Hindu</option>
                <option value="Muslim">Muslim</option>
                <option value="Christian">Christian</option>
                <option value="Sikh">Sikh</option>
                <option value="Buddhist">Buddhist</option>
                <option value="Jain">Jain</option>
                <option value="Other">Other</option>
              </select>
              <button onClick={handleNextStep} className="w-full btn-primary" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Next Step'}
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About Yourself</h2>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className="input-field"
                placeholder="Tell us about yourself..."
                required
              />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {interestOptions.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestToggle(interest)}
                    className={`p-2 rounded-lg border text-sm transition-all ${
                      formData.interests.includes(interest)
                        ? 'bg-saffron text-white border-saffron'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-saffron'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              <div className="flex gap-4">
                <button onClick={prevStep} className="flex-1 btn-outline">
                  Previous
                </button>
                <button onClick={handleNextStep} className="flex-1 btn-primary" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Next Step'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Photos</h2>
              {/* {isUploadingPhotos && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                  <p className="text-blue-700 text-sm">Uploading photos... Please wait.</p>
                </div>
              )} */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Display existing photos */}
                {formData.photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-40 rounded-lg object-cover"
                      onError={() => {
                        // Handle broken image URLs
                        console.error('Failed to load image:', photo);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      disabled={isUploadingPhotos}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Upload new photo */}
                {formData.photos.length < 6 && (
                  <label 
                    className={`aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors ${isUploadingPhotos ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={(e) => {
                      if (isUploadingPhotos) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <Plus className="w-8 h-8 text-gray-400 mb-1" />
                    <span className="text-gray-500 text-sm">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploadingPhotos}
                      onChange={handleFileChange}
                      onClick={(e) => {
                        // Prevent multiple rapid clicks
                        if (isUploadingPhotos) {
                          e.preventDefault();
                          return false;
                        }
                      }}
                    />
                  </label>
                )}
              </div>
              {formData.photos.length > 0 && (
                <p className="text-sm text-gray-500 text-center">
                  {formData.photos.length} photo(s) added. You can add up to 6 photos.
                </p>
              )}

              <div className="flex gap-4 mt-4">
                <button onClick={prevStep} className="flex-1 btn-outline">
                  Previous
                </button>
                <button onClick={handleNextStep} className="flex-1 btn-primary" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Next Step'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Partner Preferences</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age Range</label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={formData.preferences.ageRange[0]}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          ageRange: [parseInt(e.target.value), prev.preferences.ageRange[1]],
                        },
                      }))
                    }
                    className="input-field"
                    placeholder="Min age"
                    min="18"
                    max="60"
                    required
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="number"
                    value={formData.preferences.ageRange[1]}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          ageRange: [prev.preferences.ageRange[0], parseInt(e.target.value)],
                        },
                      }))
                    }
                    className="input-field"
                    placeholder="Max age"
                    min="18"
                    max="60"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Location</label>
                <input
                  type="text"
                  value={formData.preferences.location}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      preferences: { ...prev.preferences, location: e.target.value },
                    }))
                  }
                  className="input-field"
                  placeholder="Any specific location preference"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Education Preference
                  </label>
                  <input
                    type="text"
                    value={formData.preferences.education}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        preferences: { ...prev.preferences, education: e.target.value },
                      }))
                    }
                    className="input-field"
                    placeholder="Education preference"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profession Preference
                  </label>
                  <input
                    type="text"
                    value={formData.preferences.profession}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        preferences: { ...prev.preferences, profession: e.target.value },
                      }))
                    }
                    className="input-field"
                    placeholder="Profession preference"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={prevStep} className="flex-1 btn-outline">
                  Previous
                </button>
                <button onClick={handleCompleteProfile} className="flex-1 btn-primary">
                  Complete Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateProfile;
