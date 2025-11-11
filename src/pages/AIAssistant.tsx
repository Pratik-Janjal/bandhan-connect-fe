import React, { useState } from 'react';
import { Bot, Send, Heart, MessageCircle, Calendar, Users, Lightbulb, Star } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  suggestions?: string[];
}

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI relationship assistant. I\'m here to help you with conversation starters, relationship advice, and planning your journey together. How can I assist you today?',
      timestamp: new Date().toISOString(),
      suggestions: [
        'Help me start a conversation',
        'Relationship advice',
        'Plan our first meeting',
        'Cultural compatibility tips'
      ]
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickActions = [
    {
      title: 'Conversation Starters',
      description: 'Get personalized conversation topics',
      icon: MessageCircle,
      color: 'bg-blue-500'
    },
    {
      title: 'Date Ideas',
      description: 'Discover perfect date suggestions',
      icon: Heart,
      color: 'bg-pink-500'
    },
    {
      title: 'Meeting Planner',
      description: 'Plan your first meeting',
      icon: Calendar,
      color: 'bg-green-500'
    },
    {
      title: 'Family Tips',
      description: 'Navigate family introductions',
      icon: Users,
      color: 'bg-purple-500'
    }
  ];

  const aiResponses = {
    'conversation': {
      content: 'Here are some great conversation starters based on your shared interests:\n\n• "I noticed you love traveling too! What\'s the most memorable place you\'ve visited?"\n• "Your profile mentions you enjoy cooking. Do you have a signature dish?"\n• "I see we both value family traditions. What\'s your favorite family celebration?"\n• "You seem passionate about your career. What inspired you to choose your profession?"',
      suggestions: ['More conversation topics', 'How to keep conversations flowing', 'Video call tips']
    },
    'advice': {
      content: 'Here\'s some relationship advice for building a strong connection:\n\n• Be authentic and honest about your values and expectations\n• Listen actively and show genuine interest in their thoughts\n• Respect boundaries and take things at a comfortable pace\n• Involve families appropriately while maintaining your independence\n• Focus on emotional compatibility alongside other factors',
      suggestions: ['Communication tips', 'Dealing with differences', 'Long-term planning']
    },
    'meeting': {
      content: 'Great idea to plan your first meeting! Here are some suggestions:\n\n• Choose a public, comfortable location like a café or restaurant\n• Plan for 1-2 hours to avoid pressure\n• Inform your families about the meeting\n• Prepare some conversation topics in advance\n• Be yourself and stay relaxed\n• Consider a cultural activity you both enjoy',
      suggestions: ['Safety tips', 'What to wear', 'Follow-up etiquette']
    },
    'cultural': {
      content: 'Cultural compatibility is important! Here are some tips:\n\n• Discuss your religious practices and expectations\n• Share family traditions and values\n• Talk about lifestyle preferences and habits\n• Understand each other\'s career ambitions\n• Discuss future plans including location and family\n• Be open about dietary preferences and restrictions',
      suggestions: ['Handling differences', 'Family integration', 'Compromise strategies']
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responseKey = getResponseKey(inputMessage);
      const response = aiResponses[responseKey] || {
        content: 'I understand you\'re looking for guidance. Could you be more specific about what you\'d like help with? I can assist with conversation starters, relationship advice, meeting planning, or cultural compatibility tips.',
        suggestions: ['Conversation starters', 'Relationship advice', 'Meeting planning', 'Cultural tips']
      };

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.content,
        timestamp: new Date().toISOString(),
        suggestions: response.suggestions
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const getResponseKey = (message: string): keyof typeof aiResponses => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('conversation') || lowerMessage.includes('talk') || lowerMessage.includes('chat')) {
      return 'conversation';
    }
    if (lowerMessage.includes('advice') || lowerMessage.includes('relationship') || lowerMessage.includes('help')) {
      return 'advice';
    }
    if (lowerMessage.includes('meeting') || lowerMessage.includes('date') || lowerMessage.includes('meet')) {
      return 'meeting';
    }
    if (lowerMessage.includes('cultural') || lowerMessage.includes('family') || lowerMessage.includes('tradition')) {
      return 'cultural';
    }
    return 'advice';
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const handleQuickAction = (action: string) => {
    const actionMessages = {
      'Conversation Starters': 'Help me start a conversation with my match',
      'Date Ideas': 'Suggest some good first date ideas',
      'Meeting Planner': 'Help me plan our first meeting',
      'Family Tips': 'Give me tips for family introductions'
    };
    
    setInputMessage(actionMessages[action] || action);
  };

  return (
    <div className="fade-in h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bot className="w-8 h-8 text-saffron" />
            AI Relationship Assistant
          </h1>
          <p className="text-gray-600">Get personalized advice and guidance for your relationship journey</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleQuickAction(action.title)}
            className="card p-4 text-left hover:shadow-lg transition-shadow"
          >
            <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
              <action.icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
            <p className="text-sm text-gray-600">{action.description}</p>
          </button>
        ))}
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col card">
        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map(message => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md ${
                message.type === 'user' 
                  ? 'bg-saffron text-white' 
                  : 'bg-gray-100 text-gray-900'
              } rounded-lg p-4`}>
                {message.type === 'ai' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4 text-saffron" />
                    <span className="text-sm font-medium text-saffron">AI Assistant</span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                <p className={`text-xs mt-2 ${
                  message.type === 'user' ? 'text-orange-100' : 'text-gray-500'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
                
                {message.suggestions && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-gray-500 font-medium">Suggested follow-ups:</p>
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full text-left text-xs bg-white text-gray-700 px-3 py-2 rounded border hover:bg-gray-50 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 rounded-lg p-4 max-w-xs">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-saffron" />
                  <span className="text-sm font-medium text-saffron">AI Assistant</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me anything about relationships, conversations, or planning..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="p-2 bg-saffron text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* AI Features */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Smart Conversation Analysis',
              description: 'AI analyzes your conversations to suggest better communication strategies',
              icon: MessageCircle
            },
            {
              title: 'Compatibility Insights',
              description: 'Get detailed insights about your compatibility based on interactions',
              icon: Star
            },
            {
              title: 'Personalized Recommendations',
              description: 'Receive tailored advice based on your profile and preferences',
              icon: Lightbulb
            }
          ].map((feature, index) => (
            <div key={index} className="card p-4 text-center">
              <feature.icon className="w-8 h-8 text-saffron mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;