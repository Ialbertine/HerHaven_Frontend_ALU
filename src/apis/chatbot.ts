import apiClient from './axiosConfig';
import type { ChatbotApiResponse, ChatHistoryItem } from '@/components/chatbot/types';

// Send message to chatbot API
export const sendChatMessage = async (
  message: string,
  history: ChatHistoryItem[] = []
): Promise<ChatbotApiResponse> => {
  try {
    const response = await apiClient.post('/api/chat', {
      message,
      history,
    });

    const responseText = response.data?.response || response.data;
    
    return {
      success: true,
      response: typeof responseText === 'string' ? responseText : response.data?.response || '',
      timestamp: response.data?.timestamp || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Chatbot API error:', error);
    
    const isAxiosError = (err: unknown): err is { response?: { status?: number; data?: { message?: string; error?: string } } } => {
      return typeof err === 'object' && err !== null && 'response' in err;
    };
    
    if (isAxiosError(error)) {
      console.error('Backend error details:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        data: error.response?.data
      });
      
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Sorry, I encountered an error. Please try again.';
      
      return {
        success: false,
        message: errorMessage,
      };
    }
    
    return {
      success: false,
      message: 'Sorry, I encountered an error. Please try again.',
    };
  }
};
