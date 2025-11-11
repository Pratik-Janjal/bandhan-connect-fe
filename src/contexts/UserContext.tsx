import React, { createContext, useContext, ReactNode } from 'react';
import { updateInfoAPI } from '../services/api';

interface UserProfile {
  id?: string;
  age?: string;
  location?: string;
  education?: string;
  profession?: string;
  religion?: string;
  interests?: string[];
  bio?: string;
  photos?: string[];
  preferences?: {
    ageRange?: [number, number];
    location?: string;
    education?: string;
    profession?: string;
  };
  userId : string | null;
}

interface UserContextType {
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (updates.location || updates.age){
        await updateInfoAPI.addInfo(updates);
      }
      else if (updates.bio || updates.interests) {
        await updateInfoAPI.aboutYourself(updates);
      } else if (updates.photos) {
        if (updates.userId) {
          await updateInfoAPI.uploadPhotos({ userId: updates.userId, photos: updates.photos });
        } else {
          throw new Error('userId and photos are required to upload pictures');
        }
      } else if (updates.preferences) {
        const payload  = {
          userId : updates.userId,
          partnerPreferences :{
            ...updates.preferences,
            ageRange : updates.preferences.ageRange ? {
              min: updates.preferences.ageRange[0],
              max: updates.preferences.ageRange[1],
            } : undefined
          }
        }
        await updateInfoAPI.partnersPreferences(payload);
      } else {
        await updateInfoAPI.addInfo(updates);
      }
    } catch (err) {
      console.error('Profile update failed:', err);
    }
  };

  return (
    <UserContext.Provider value={{updateProfile}}>
      {children}
    </UserContext.Provider>
  );
};
