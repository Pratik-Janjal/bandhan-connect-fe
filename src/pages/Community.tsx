import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, ThumbsUp, Users, Calendar, MapPin, Plus, Filter, X } from 'lucide-react';
import api from '../services/api';
import { communityAPI } from '../services/api';

// interface Post {
//   id: string;
//   author: {
//     name: string;
//     photo: string;
//     verified: boolean;
//   };
//   content: string;
//   image?: string;
//   timestamp: string;
//   likes: number;
//   comments: number;
//   shares: number;
//   liked: boolean;
//   type: 'success_story' | 'advice' | 'general';
// }


   const Community: React.FC = () => {
  // const [activeTab, setActiveTab] = useState('feed');
  const [showCreatePost, setShowCreatePost] = useState(false);
  // const [showArticle, setShowArticle] = useState(false);
  // const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [newPost, setNewPost] = useState({
    content: '',
    type: 'general' as const,
    image: ''
  });
  const [submitting, setSubmitting] = useState(false);
  
  // const [posts, setPosts] = useState<Post[]>([
  //   {
  //     id: '1',
  //     author: {
  //       name: 'Rajesh Kumar',
  //       photo: 'https://images.pexels.com/photos/1391498/pexels-photo-1391498.jpeg?auto=compress&cs=tinysrgb&w=400',
  //       verified: true
  //     },
  //     content: 'Just wanted to share some advice for first meetings - always meet in a public place and let your family know where you are. Safety first! 🙏',
  //     timestamp: '2 hours ago',
  //     likes: 24,
  //     comments: 8,
  //     shares: 3,
  //     liked: false,
  //     type: 'advice'
  //   },
  //   {
  //     id: '2',
  //     author: {
  //       name: 'Priya Patel',
  //       photo: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
  //       verified: true
  //     },
  //     content: 'Celebrating 6 months since we found each other on BandhanConnect! Thank you to this amazing community for all the support. ❤️',
  //     image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400',
  //     timestamp: '5 hours ago',
  //     likes: 156,
  //     comments: 23,
  //     shares: 12,
  //     liked: true,
  //     type: 'success_story'
  //   },
  //   {
  //     id: '3',
  //     author: {
  //       name: 'Community Team',
  //       photo: 'https://images.pexels.com/photos/1382734/pexels-photo-1382734.jpeg?auto=compress&cs=tinysrgb&w=400',
  //       verified: true
  //     },
  //     content: 'Join us for our virtual speed networking event this Saturday! Meet multiple potential matches in a fun, relaxed environment. Register now!',
  //     timestamp: '1 day ago',
  //     likes: 89,
  //     comments: 15,
  //     shares: 25,
  //     liked: false,
  //     type: 'general'
  //   }
  // ]);

  const [caption, setCaption] = useState("");
  const [postType, setPostType] = useState("general");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const userId = localStorage.getItem("user_id")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("userId", userId || "");
      formData.append("caption", caption);
      formData.append("postType", postType);
      if (image) formData.append("image", image);

      const res = await communityAPI.createCommunityPost(formData);
      setMessage("✅ Post created successfully!");
      console.log("Response:", res);
    } catch (error: any) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // const handleCreatePost = async () => {
  //   if (!newPost.content) return;
  //   setSubmitting(true);
  //   try {
  //     const payload = {
  //       author: {
  //         name: 'You',
  //         photo: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
  //         verified: true
  //       },
  //       content: newPost.content,
  //       image: newPost.image,
  //       timestamp: 'Just now',
  //       type: newPost.type
  //     };
  //     const res = await api.post('/posts', payload); 
  //     const savedPost = res.data;  
  //     setPosts([{ ...savedPost, id: savedPost._id || Date.now().toString(), likes: 0, comments: 0, shares: 0, liked: false }, ...posts]); 
  //     setNewPost({ content: '', type: 'general', image: '' }); 
  //     setShowCreatePost(false); 
  //   } catch (err) { 
  //     alert('Failed to create post. Please try again.');
  //   } finally { 
  //     setSubmitting(false); 
  //   }
  // };
 
  // const formatTime = (timestamp: string) => {
  //   return timestamp;
  // };

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community</h1>
          <p className="text-gray-600">Connect with others on their journey to find love</p>
        </div>
        <button 
          onClick={() => setShowCreatePost(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Post
        </button>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create Post</h3>
              <button onClick={() => setShowCreatePost(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
                  value={postType}
                  onChange={(e) => setPostType(e.target.value)}
                >
                  <option value="general">General</option>
                  <option value="advice">Advice</option>
                  <option value="success">Success Story</option>
                </select>
                <input
          type="file"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
          accept="image/*"
        />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSubmit}
                  className="btn-primary flex-1"
                  disabled={submitting}
                >
                  {submitting ? 'Posting...' : 'Post'}
                </button>
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
