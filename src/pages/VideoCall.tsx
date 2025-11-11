import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Settings, 
  Users,
  MessageCircle,
  MoreHorizontal,
  Volume2,
  VolumeX
} from 'lucide-react';
import { sampleUsers } from '../data/sampleData';

const VideoCall: React.FC = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [showControls, setShowControls] = useState(true);

  const user = sampleUsers.find(u => u.id === userId);

  useEffect(() => {
    // Simulate call connection
    const connectTimer = setTimeout(() => {
      setCallStatus('connected');
    }, 3000);

    return () => clearTimeout(connectTimer);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  useEffect(() => {
    // Auto-hide controls after 5 seconds
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [showControls]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    setTimeout(() => {
      navigate('/app/messages');
    }, 2000);
  };

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div 
      className="fixed inset-0 bg-black flex flex-col"
      onMouseMove={() => setShowControls(true)}
    >
      {/* Call Status Header */}
      <div className={`absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/50 to-transparent transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <img
              src={user.photos[0]}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h2 className="font-semibold">{user.name}</h2>
              <p className="text-sm text-gray-300">
                {callStatus === 'connecting' && 'Connecting...'}
                {callStatus === 'connected' && formatDuration(callDuration)}
                {callStatus === 'ended' && 'Call ended'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <Users className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative">
        {/* Remote Video */}
        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
          {callStatus === 'connecting' ? (
            <div className="text-center text-white">
              <div className="w-24 h-24 bg-gradient-to-r from-saffron to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">{user.name.charAt(0)}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{user.name}</h3>
              <p className="text-gray-300">Connecting...</p>
              <div className="flex justify-center mt-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            </div>
          ) : callStatus === 'ended' ? (
            <div className="text-center text-white">
              <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <PhoneOff className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Call Ended</h3>
              <p className="text-gray-300">Duration: {formatDuration(callDuration)}</p>
            </div>
          ) : (
            <img
              src={user.photos[0]}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Local Video (Picture-in-Picture) */}
        <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20">
          {isVideoOn ? (
            <div className="w-full h-full bg-gradient-to-br from-saffron to-orange-500 flex items-center justify-center">
              <span className="text-white font-bold">You</span>
            </div>
          ) : (
            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
              <VideoOff className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className={`absolute bottom-0 left-0 right-0 z-20 p-6 bg-gradient-to-t from-black/50 to-transparent transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="flex items-center justify-center gap-4">
          {/* Audio Toggle */}
          <button
            onClick={() => setIsAudioOn(!isAudioOn)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isAudioOn ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isAudioOn ? (
              <Mic className="w-6 h-6 text-white" />
            ) : (
              <MicOff className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Video Toggle */}
          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isVideoOn ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isVideoOn ? (
              <Video className="w-6 h-6 text-white" />
            ) : (
              <VideoOff className="w-6 h-6 text-white" />
            )}
          </button>

          {/* End Call */}
          <button
            onClick={handleEndCall}
            className="w-14 h-14 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors"
          >
            <PhoneOff className="w-7 h-7 text-white" />
          </button>

          {/* Speaker Toggle */}
          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isSpeakerOn ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isSpeakerOn ? (
              <Volume2 className="w-6 h-6 text-white" />
            ) : (
              <VolumeX className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Chat */}
          <button className="w-12 h-12 bg-gray-600 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors">
            <MessageCircle className="w-6 h-6 text-white" />
          </button>

          {/* Settings */}
          <button className="w-12 h-12 bg-gray-600 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors">
            <Settings className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Call Quality Indicator */}
        <div className="flex items-center justify-center mt-4">
          <div className="flex items-center gap-2 text-white text-sm">
            <div className="flex gap-1">
              <div className="w-1 h-3 bg-green-500 rounded"></div>
              <div className="w-1 h-3 bg-green-500 rounded"></div>
              <div className="w-1 h-3 bg-green-500 rounded"></div>
              <div className="w-1 h-3 bg-gray-500 rounded"></div>
            </div>
            <span>Good connection</span>
          </div>
        </div>
      </div>

      {/* Call ended overlay */}
      {callStatus === 'ended' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-30">
          <div className="text-center text-white">
            <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <PhoneOff className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Call Ended</h3>
            <p className="text-gray-300 mb-4">Duration: {formatDuration(callDuration)}</p>
            <button
              onClick={() => navigate('/app/messages')}
              className="btn-primary"
            >
              Back to Messages
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCall;