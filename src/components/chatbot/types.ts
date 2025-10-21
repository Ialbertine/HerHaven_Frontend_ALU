export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

export interface ChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface ChatbotConfig {
  botName: string;
  welcomeMessage: string;
  placeholder: string;
  maxMessages?: number;
}

export interface ChatbotApiResponse {
  success: boolean;
  message?: string;
  response?: string;
  timestamp?: string;
}

export interface ChatbotSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastActivity: Date;
}
