
import { AxiosError } from "axios";
import apiClient from "./axiosConfig";

// Type Definitions matching your backend notification model
export interface NotificationDeliveryStatus {
  channel: 'email' | 'inApp';
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  sentAt?: string;
  deliveredAt?: string;
  error?: string;
}

export interface Notification {
  _id: string;
  user: string;
  type: 
    | 'appointment_booked'
    | 'appointment_confirmed'
    | 'appointment_rejected'
    | 'appointment_cancelled'
    | 'appointment_reminder_24h'
    | 'appointment_reminder_1h'
    | 'session_starting'
    | 'session_completed'
    | 'payment_success'
    | 'payment_failed'
    | 'counselor_approved'
    | 'counselor_rejected'
    | 'assessment_completed'
    | 'assessment_crisis'
    | 'assessment_shared'
    | 'assessment_crisis_shared';
  title: string;
  message: string;
  appointment?: {
    _id: string;
    appointmentDate: string;
    appointmentTime: string;
    status: string;
  };
  counselor?: {
    _id: string;
    firstName: string;
    lastName: string;
    specialization: string;
  };
  assessment?: {
    _id: string;
    templateName: string;
    severityLevel: string;
    isCrisis: boolean;
  };
  channels: ('email' | 'inApp')[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'sent' | 'failed' | 'read';
  readAt?: string;
  sentAt?: string;
  deliveryStatus: NotificationDeliveryStatus[];
  scheduledFor?: string;
  data?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// 1. GET USER NOTIFICATIONS
export const getUserNotifications = async (params?: {
  limit?: number;
  skip?: number;
  unreadOnly?: boolean;
}): Promise<ApiResponse<{
  notifications: Notification[];
  unreadCount: number;
  total: number;
}>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.skip) queryParams.append('skip', String(params.skip));
    if (params?.unreadOnly !== undefined) 
      queryParams.append('unreadOnly', String(params.unreadOnly));

    const response = await apiClient.get<ApiResponse<{
      notifications: Notification[];
      unreadCount: number;
      total: number;
    }>>(
      `/api/notifications/all${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'Failed to fetch notifications',
    };
  }
};

// 2. MARK NOTIFICATION AS READ
export const markNotificationAsRead = async (
  notificationId: string
): Promise<ApiResponse<{
  notificationId: string;
  readAt: string;
}>> => {
  try {
    const response = await apiClient.put<ApiResponse<{
      notificationId: string;
      readAt: string;
    }>>(
      `/api/notifications/${notificationId}/read`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'Failed to mark notification as read',
    };
  }
};

// 3. GET UNREAD COUNT
export const getUnreadNotificationCount = async (): Promise<ApiResponse<{
  unreadCount: number;
}>> => {
  try {
    const response = await apiClient.get<ApiResponse<{
      unreadCount: number;
    }>>(
      '/api/notifications/unread'
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'Failed to get unread count',
    };
  }
};

// Helper function to format notification time
export const formatNotificationTime = (timestamp: string): string => {
  const now = new Date();
  const notificationDate = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else {
    return notificationDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: notificationDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
};