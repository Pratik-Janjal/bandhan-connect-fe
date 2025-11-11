import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Heart, MessageCircle, Calendar, Eye, Star, Award } from 'lucide-react';

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');

  const profileViewsData = [
    { name: 'Mon', views: 12 },
    { name: 'Tue', views: 19 },
    { name: 'Wed', views: 8 },
    { name: 'Thu', views: 15 },
    { name: 'Fri', views: 22 },
    { name: 'Sat', views: 18 },
    { name: 'Sun', views: 14 }
  ];

  const matchQualityData = [
    { name: 'Jan', quality: 78 },
    { name: 'Feb', quality: 82 },
    { name: 'Mar', quality: 85 },
    { name: 'Apr', quality: 88 },
    { name: 'May', quality: 91 },
    { name: 'Jun', quality: 89 }
  ];

  const interactionData = [
    { name: 'Profile Views', value: 245, color: '#FF6B35' },
    { name: 'Likes Received', value: 89, color: '#14B8A6' },
    { name: 'Messages Sent', value: 34, color: '#3B82F6' },
    { name: 'Messages Received', value: 67, color: '#8B5CF6' }
  ];

  const compatibilityBreakdown = [
    { category: 'Values', score: 95 },
    { category: 'Interests', score: 88 },
    { category: 'Lifestyle', score: 92 },
    { category: 'Communication', score: 87 },
    { category: 'Goals', score: 90 }
  ];

  const stats = [
    {
      title: 'Profile Views',
      value: '245',
      change: '+12%',
      trend: 'up',
      icon: Eye,
      color: 'bg-blue-500'
    },
    {
      title: 'Match Quality',
      value: '89%',
      change: '+3%',
      trend: 'up',
      icon: Star,
      color: 'bg-green-500'
    },
    {
      title: 'Response Rate',
      value: '76%',
      change: '+8%',
      trend: 'up',
      icon: MessageCircle,
      color: 'bg-purple-500'
    },
    {
      title: 'Profile Score',
      value: '92/100',
      change: '+5',
      trend: 'up',
      icon: Award,
      color: 'bg-saffron'
    }
  ];

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your profile performance and match insights</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="input-field w-32"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 3 months</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className={`w-4 h-4 mr-1 ${
                    stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`} />
                  <span className={`text-sm ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Profile Views Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Views This Week</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={profileViewsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="views" fill="#FF6B35" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Match Quality Trend */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Match Quality Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={matchQualityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[70, 100]} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="quality" 
                stroke="#14B8A6" 
                strokeWidth={3}
                dot={{ fill: '#14B8A6', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interaction Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Interaction Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={interactionData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {interactionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Compatibility Breakdown */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Compatibility Breakdown</h3>
          <div className="space-y-4">
            {compatibilityBreakdown.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.category}</span>
                  <span className="text-sm font-bold text-gray-900">{item.score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-saffron to-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${item.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Insights</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium text-green-800">Strong Profile Performance</h4>
                <p className="text-sm text-green-700">Your profile views increased by 12% this week. Your recent photo updates are working well!</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium text-blue-800">High Compatibility Scores</h4>
                <p className="text-sm text-blue-700">Your matches show 89% average compatibility. Your detailed preferences are helping find better matches.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium text-purple-800">Active Engagement</h4>
                <p className="text-sm text-purple-700">Your response rate is 76%, which is above average. Keep up the great communication!</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium text-yellow-800">Add More Photos</h4>
                <p className="text-sm text-yellow-700">Profiles with 4+ photos get 40% more views. Consider adding lifestyle photos.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium text-orange-800">Update Your Bio</h4>
                <p className="text-sm text-orange-700">Mention your hobbies and what you're looking for in a partner to improve match quality.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-teal-50 rounded-lg">
              <div className="w-2 h-2 bg-teal-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium text-teal-800">Be More Active</h4>
                <p className="text-sm text-teal-700">Users who log in daily get 3x more matches. Try to check your matches regularly.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="mt-8">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-saffron mb-2">89%</div>
              <div className="text-sm text-gray-600 mb-1">Average Match Quality</div>
              <div className="text-xs text-green-600">+3% from last month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600 mb-2">76%</div>
              <div className="text-sm text-gray-600 mb-1">Response Rate</div>
              <div className="text-xs text-green-600">+8% from last month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">245</div>
              <div className="text-sm text-gray-600 mb-1">Profile Views</div>
              <div className="text-xs text-green-600">+12% from last week</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;