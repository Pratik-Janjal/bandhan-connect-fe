import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, userId } = useAuth();
  const navigate = useNavigate();

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsLoading(true);
    
  //   try {
  //     await login(email, password);
  //     const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  //     if (storedUser.role === 'vendor') {
  //       navigate('/vendor/onboarding');
  //     } else if (storedUser.role === 'counselor') {
  //       navigate(`/app/counselor/${storedUser.id}`);
  //     } else if (storedUser.role === 'community') {
  //       navigate(`/app/community/${storedUser.id}`);
  //     } else if (storedUser.role === 'admin') {
  //       navigate('/app/admin');
  //     } else {
  //       navigate('/app');
  //     }
  //   } catch (error) {
  //     console.error('Login failed:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password); 
      const id = localStorage.getItem("id")
      console.log("Logged in successfully with ID:", id);
      navigate(`/app/matches`); 
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-saffron to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">BandhanConnect</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to continue your journey</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-saffron focus:ring-saffron" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              {/* <Link to="/forgot-password" className="text-sm text-saffron hover:text-orange-600">
                Forgot password?
              </Link> */}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-saffron hover:text-orange-600 font-medium">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2 font-medium">Demo Credentials:</p>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">
                <span className="font-medium">Demo User:</span> demo@bandhan.com / password
              </p>
              <p className="text-xs text-gray-500">
                <span className="font-medium">Demo Admin:</span> admin@bandhan.com / password
                <span className="text-blue-600 ml-1">(Admin panel access)</span>
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-2 italic">
              Note: Only demo admin can access the admin panel
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;