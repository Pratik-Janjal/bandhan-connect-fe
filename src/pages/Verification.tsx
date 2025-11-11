import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, AlertCircle} from 'lucide-react';

const Verification: React.FC = () => {
  const [step, setStep] = useState(1);
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();

  const handleAadhaarVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsVerifying(false);
      setStep(2);
    }, 2000);
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsVerifying(false);
      setStep(3);
    }, 2000);
  };

  const handleComplete = () => {
    navigate('/create-profile');
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Identity</h1>
          <p className="text-gray-600">Complete verification to build trust with potential matches</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step {step} of 3</span>
            <span className="text-sm text-gray-500">{Math.round((step / 3) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-saffron to-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}>
            </div>
          </div>
        </div>

        <div className="card p-8">
          {step === 1 && (
            <form onSubmit={handleAadhaarVerification} className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-saffron to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Aadhaar Verification</h2>
                <p className="text-gray-600">Enter your Aadhaar number for secure verification</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value)}
                  className="input-field"
                  placeholder="Enter 12-digit Aadhaar number"
                  maxLength={12}
                  pattern="[0-9]{12}"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your Aadhaar details are encrypted and never stored on our servers
                </p>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full btn-primary flex items-center justify-center"
              >
                {isVerifying ? 'Verifying...' : 'Verify Aadhaar'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleOtpVerification} className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-teal to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">OTP Verification</h2>
                <p className="text-gray-600">Enter the OTP sent to your registered mobile number</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="input-field text-center text-lg tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  required
                />
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Didn't receive OTP? <button type="button" className="text-saffron hover:text-orange-600">Resend</button>
                </p>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full btn-primary flex items-center justify-center"
              >
                {isVerifying ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Verification Complete!</h2>
                <p className="text-gray-600">Your identity has been successfully verified</p>
              </div>
              
              <div className="verification-badge justify-center">
                <Shield className="w-4 h-4" />
                Verified Profile
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-green-600 mr-2" />
                  <p className="text-sm text-green-800">
                    Your profile is now verified and will be marked as trustworthy to other users
                  </p>
                </div>
              </div>

              <button
                onClick={handleComplete}
                className="w-full btn-primary"
              >
                Continue to Profile Creation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Verification;