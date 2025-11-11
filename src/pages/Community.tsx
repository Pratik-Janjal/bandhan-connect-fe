import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, ThumbsUp, Users, Calendar, MapPin, Plus, Filter, X } from 'lucide-react';
import api from '../services/api';

interface Post {
  id: string;
  author: {
    name: string;
    photo: string;
    verified: boolean;
  };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  liked: boolean;
  type: 'success_story' | 'advice' | 'general';
}

interface SuccessStory {
  id: string;
  couple: {
    name1: string;
    name2: string;
    photo1: string;
    photo2: string;
  };
  story: string;
  weddingDate: string;
  location: string;
  photos: string[];
}

interface Article {
  id: string;
  title: string;
  category: string;
  author: string;
  readTime: string;
  excerpt: string;
  content: string;
}

const Community: React.FC = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showArticle, setShowArticle] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [newPost, setNewPost] = useState({
    content: '',
    type: 'general' as const,
    image: ''
  });
  const [submitting, setSubmitting] = useState(false);
  
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: {
        name: 'Rajesh Kumar',
        photo: 'https://images.pexels.com/photos/1391498/pexels-photo-1391498.jpeg?auto=compress&cs=tinysrgb&w=400',
        verified: true
      },
      content: 'Just wanted to share some advice for first meetings - always meet in a public place and let your family know where you are. Safety first! 🙏',
      timestamp: '2 hours ago',
      likes: 24,
      comments: 8,
      shares: 3,
      liked: false,
      type: 'advice'
    },
    {
      id: '2',
      author: {
        name: 'Priya Patel',
        photo: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
        verified: true
      },
      content: 'Celebrating 6 months since we found each other on BandhanConnect! Thank you to this amazing community for all the support. ❤️',
      image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400',
      timestamp: '5 hours ago',
      likes: 156,
      comments: 23,
      shares: 12,
      liked: true,
      type: 'success_story'
    },
    {
      id: '3',
      author: {
        name: 'Community Team',
        photo: 'https://images.pexels.com/photos/1382734/pexels-photo-1382734.jpeg?auto=compress&cs=tinysrgb&w=400',
        verified: true
      },
      content: 'Join us for our virtual speed networking event this Saturday! Meet multiple potential matches in a fun, relaxed environment. Register now!',
      timestamp: '1 day ago',
      likes: 89,
      comments: 15,
      shares: 25,
      liked: false,
      type: 'general'
    }
  ]);

  const [successStories] = useState<SuccessStory[]>([
    {
      id: '1',
      couple: {
        name1: 'Arjun',
        name2: 'Kavya',
        photo1: 'https://images.pexels.com/photos/1391498/pexels-photo-1391498.jpeg?auto=compress&cs=tinysrgb&w=400',
        photo2: 'https://images.pexels.com/photos/1382734/pexels-photo-1382734.jpeg?auto=compress&cs=tinysrgb&w=400'
      },
      story: 'We matched on BandhanConnect in January 2024. What started as a simple conversation about our shared love for travel turned into something beautiful. Our families connected instantly, and we knew we had found our perfect match.',
      weddingDate: '2024-12-15',
      location: 'Mumbai, Maharashtra',
      photos: [
        'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg?auto=compress&cs=tinysrgb&w=400'
      ]
    },
    {
      id: '2',
      couple: {
        name1: 'Rohit',
        name2: 'Sneha',
        photo1: 'https://images.pexels.com/photos/1462980/pexels-photo-1462980.jpeg?auto=compress&cs=tinysrgb&w=400',
        photo2: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400'
      },
      story: 'Our compatibility score was 98%! We were both skeptical at first, but after our first video call, we knew the algorithm got it right. Six months later, we\'re planning our future together.',
      weddingDate: '2024-11-20',
      location: 'Bangalore, Karnataka',
      photos: [
        'https://images.pexels.com/photos/1845534/pexels-photo-1845534.jpeg?auto=compress&cs=tinysrgb&w=400'
      ]
    }
  ]);

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleCreatePost = async () => {
    if (!newPost.content) return;
    setSubmitting(true);
    try {
      const payload = {
        author: {
          name: 'You',
          photo: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
          verified: true
        },
        content: newPost.content,
        image: newPost.image,
        timestamp: 'Just now',
        type: newPost.type
      };
      const res = await api.post('/posts', payload);
      const savedPost = res.data;
      setPosts([{ ...savedPost, id: savedPost._id || Date.now().toString(), likes: 0, comments: 0, shares: 0, liked: false }, ...posts]);
      setNewPost({ content: '', type: 'general', image: '' });
      setShowCreatePost(false);
    } catch (err) {
      alert('Failed to create post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // const handleReadArticle = (article: Article) => {
  //   setSelectedArticle(article);
  //   setShowArticle(true);
  // };

  const formatTime = (timestamp: string) => {
    return timestamp;
  };

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
            </div>
            <div className="space-y-4">
              <textarea
                className="input-field w-full h-24 resize-none"
                placeholder="What's on your mind? Share your thoughts, advice, or a success story..."
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              />
              <div className="flex gap-2">
                <select
                  className="input-field"
                  value={newPost.type}
                  onChange={(e) => setNewPost({ ...newPost, type: e.target.value as Post['type'] })}
                >
                  <option value="general">General</option>
                  <option value="advice">Advice</option>
                  <option value="success_story">Success Story</option>
                </select>
                <input
                  type="text"
                  className="input-field flex-1"
                  placeholder="Image URL (optional)"
                  value={newPost.image}
                  onChange={(e) => setNewPost({ ...newPost, image: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreatePost}
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

      {/* Article Modal */}
      {showArticle && selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">{selectedArticle.title}</h3>
              <button 
                onClick={() => setShowArticle(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <span className="px-2 py-1 bg-saffron/10 text-saffron rounded-full text-xs font-medium">
                {selectedArticle.category}
              </span>
              <span className="ml-2 text-sm text-gray-500">
                By {selectedArticle.author} • {selectedArticle.readTime}
              </span>
            </div>
            <div className="prose max-w-none">
              {selectedArticle.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      {/* <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        {[
          { id: 'feed', label: 'Community Feed' },
          { id: 'stories', label: 'Success Stories' },
          { id: 'advice', label: 'Advice Corner' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-saffron shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div> */}

      {/* Community Feed */}
      {activeTab === 'feed' && (
        <div className="space-y-6">
          {posts.map(post => (
            <div key={post.id} className="card p-6">
              <div className="flex items-start gap-4">
                <img
                  src={post.author.photo}
                  alt={post.author.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
                    {post.author.verified && (
                      <div className="verification-badge">
                        <Heart className="w-3 h-3" />
                        Verified
                      </div>
                    )}
                    <span className="text-sm text-gray-500">• {formatTime(post.timestamp)}</span>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{post.content}</p>
                  
                  {post.image && (
                    <img
                      src={post.image}
                      alt="Post image"
                      className="w-full h-64 object-cover rounded-lg mb-4"
                    />
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-6">
                      {/* <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-2 ${
                          post.liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-sm">{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">{post.comments}</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-500 hover:text-green-500">
                        <Share2 className="w-4 h-4" />
                        <span className="text-sm">{post.shares}</span>
                      </button> */}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      post.type === 'success_story' ? 'bg-green-100 text-green-800' :
                      post.type === 'advice' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {post.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Success Stories */}
      {/* {activeTab === 'stories' && (
        <div className="space-y-8">
          {successStories.map(story => (
            <div key={story.id} className="card p-8">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <img
                    src={story.couple.photo1}
                    alt={story.couple.name1}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <Heart className="w-8 h-8 text-red-500" />
                  <img
                    src={story.couple.photo2}
                    alt={story.couple.name2}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {story.couple.name1} & {story.couple.name2}
                </h3>
                <div className="flex items-center justify-center gap-4 text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Wedding: {new Date(story.weddingDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{story.location}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 text-lg leading-relaxed mb-6 text-center">
                "{story.story}"
              </p>
              
              {story.photos.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {story.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`${story.couple.name1} & ${story.couple.name2} photo ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )} */}

      {/* Advice Corner */}
      {/* {activeTab === 'advice' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <div key={index} className="card p-6">
                <div className="mb-4">
                  <span className="px-2 py-1 bg-saffron/10 text-saffron rounded-full text-xs font-medium">
                    {article.category}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h3>
                <p className="text-gray-600 mb-4">{article.excerpt}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>By {article.author}</span>
                  <span>{article.readTime}</span>
                </div>
                <button 
                  onClick={() => handleReadArticle(article)}
                  className="btn-outline w-full mt-4"
                >
                  Read Article
                </button>
              </div>
            ))}
          </div>
        </div>
      )} */}
    </div>
  );
};

export default Community;