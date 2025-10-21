import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageCircle, Heart, Shield, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ChatbotWindow } from '@/components/chatbot';

const HavenChatbot: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  const features = [
    {
      icon: Heart,
      title: 'Mental Health Support',
      description: 'Get compassionate support and guidance for your mental health journey.',
    },
    {
      icon: Shield,
      title: 'Safe & Private',
      description: 'Your conversations are confidential and secure.',
    },
    {
      icon: Users,
      title: '24/7 Available',
      description: 'Access support whenever you need it, day or night.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#9c27b0] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#9c27b0] to-[#7b1fa2] rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Haven AI</h1>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Your compassionate AI companion for mental health support, available 24/7 to listen, guide, and provide resources when you need them most.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
              <ChatbotWindow
                isOpen={isInitialized}
                onClose={() => { }} // Full-page, so no close functionality needed
                config={{
                  botName: 'Haven AI',
                  welcomeMessage: 'Welcome! I\'m Haven AI, your mental health companion. I\'m here to listen without judgment and provide support, resources, and guidance to help you on your wellness journey. What\'s on your mind today?',
                  placeholder: 'Share what you\'re feeling or ask me anything about mental health...',
                }}
                className="h-full"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Features */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold text-lg text-gray-800 mb-4">How I Can Help</h3>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-[#9c27b0]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{feature.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-yellow-800">Important Notice</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Haven AI is designed to provide supportive conversations and general mental health resources.
                    It is not a replacement for professional therapy or emergency services.
                  </p>
                </div>
              </div>
            </div>

            {/* Emergency Resources */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-800">Need Immediate Help?</h4>
                  <p className="text-sm text-red-700 mt-1 mb-2">
                    If you're in crisis or having thoughts of self-harm, please reach out to:
                  </p>
                  <ul className="text-xs text-red-600 space-y-1">
                    <li>• National Suicide Prevention Lifeline: 116</li>
                    <li>• Health services: 114</li>
                    <li>• Emergency Services: 112</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HavenChatbot;
