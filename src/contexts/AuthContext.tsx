import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { authAPI, fetchProfileAPI } from '../services/api';

interface User {
  _id: string;
  email: string;
  name: string;
  age:number;
  location : string;
  religion : string;
  education:string;
  profession : string;
  bio : string;
  interests : string[];
  photos : string[];
  profileComplete: boolean;
  role: 'user' | 'admin';
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  // userId : string;
  isAuthenticated: boolean;
  refreshUser : any;
  setUser : any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(()=>{
    console.log(user,"user in hook");
  },[user])

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token") || localStorage.getItem("userToken");
    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        // Ensure token is stored with the expected key
        if (!localStorage.getItem("token") && localStorage.getItem("userToken")) {
          localStorage.setItem("token", localStorage.getItem("userToken")!);
        }
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("userToken");
      }
    }
  }, []);

  const register = useCallback(async (userData: any) => {
    try {
      const response = await authAPI.register(userData);
      // const userDataFromResponse = response.user;
      if (response?.user_id) {
        localStorage.setItem('user_id', response.user_id);
      }
      // setUser(userDataFromResponse);
      setIsAuthenticated(true);
      // localStorage.setItem('token', token);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      const userToken = response.token;
      localStorage.setItem("id",response.user._id);
      // setUserId(id);
      setIsAuthenticated(true);
      localStorage.setItem('token', userToken);
      localStorage.setItem('userToken', userToken); // Keep for backward compatibility
      localStorage.setItem('user', JSON.stringify(response.user))
      // return id; // ✅ return it
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const userId = localStorage.getItem("id");
    if (!userId) return;
  
    const res = await fetchProfileAPI.profileById(userId);
    setUser(res.user);
    localStorage.setItem("user", JSON.stringify(res.user)); // persist latest info
  }, []);
  
  
  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userToken");
    localStorage.removeItem("id");
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    login,
    register,
    logout,
    isAuthenticated,
    refreshUser,
    setUser
  }), [user, login, register, logout, isAuthenticated, refreshUser]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};