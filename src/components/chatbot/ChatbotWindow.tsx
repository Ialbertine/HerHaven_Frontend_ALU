import React, { useState, useEffect, useRef } from 'react';
import { X, Minimize2, MessageCircle, RotateCcw } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import type { ChatMessage as ChatMessageType, ChatbotConfig, ChatHistoryItem } from './types';
import { sendChatMessage } from '@/apis/chatbot';

interface ChatbotWindowProps {
  onClose: () => void;
  onMinimize?: () => void;
  isOpen: boolean;
  config?: Partial<ChatbotConfig>;
  className?: string;
}

const defaultConfig: ChatbotConfig = {
  botName: 'Haven AI',
  welcomeMessage: 'Hello! I\'m Haven AI, your mental health companion. I\'m here to listen, support, and help you find the resources you need. How can I help you today?',
  placeholder: 'Ask me anything about mental health, resources, or just talk...',
  maxMessages: 100,
};

export const ChatbotWindow: React.FC<ChatbotWindowProps> = ({
  onClose,
  onMinimize,
  isOpen,
  config = {},
  className = '',
}) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatbotConfig = { ...defaultConfig, ...config };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessageType = {
        id: Date.now().toString(),
        role: 'assistant',
        content: chatbotConfig.welcomeMessage,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length, chatbotConfig.welcomeMessage]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const typingMessage: ChatMessageType = {
      id: `typing-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true,
    };

    setMessages(prev => [...prev, typingMessage]);

    try {
      const history: ChatHistoryItem[] = messages
        .filter(msg => !msg.isTyping)
        .slice(1)
        .map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
        }));

      // Send message to API with conversation
      const response = await sendChatMessage(content, history);
      setMessages(prev => prev.filter(msg => msg.id !== typingMessage.id));

      if (response.success && response.response) {
        const botMessage: ChatMessageType = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: response.response,
          timestamp: response.timestamp ? new Date(response.timestamp) : new Date(),
        };

        setMessages(prev => [...prev, botMessage]);
      } else {
        const errorMessage: ChatMessageType = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: response.message || 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch {
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => msg.id !== typingMessage.id);
        return [
          ...withoutTyping,
          {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: 'Sorry, I encountered an error. Please try again.',
            timestamp: new Date(),
          }
        ];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([]);
    const welcomeMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'assistant',
      content: chatbotConfig.welcomeMessage,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  if (!isOpen) return null;

  return (
    <div className={`flex flex-col h-full bg-white border border-gray-200 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-[#9c27b0] to-[#7b1fa2] text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <h3 className="font-semibold">{chatbotConfig.botName}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetChat}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Reset conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          {onMinimize && (
            <button
              onClick={onMinimize}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              aria-label="Minimize"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        placeholder={chatbotConfig.placeholder}
        disabled={isLoading}
        isLoading={isLoading}
      />
    </div>
  );
};
