import { AxiosError } from "axios";
import apiClient from "./axiosConfig";

// Type Definitions
export interface SOSContact {
  contactId?: string;
  status: "pending" | "sent" | "failed";
  channel: "sms";
  lastAttemptAt?: string;
  lastError?: string;
  twilioSid?: string;
  history: Array<{
    channel: string;
    status: string;
    sentAt: string;
    metadata?: Record<string, unknown>;
  }>;
  snapshot: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
}

export interface SOSAlert {
  _id: string;
  userId?: string;
  guestSessionId?: string;
  isGuest: boolean;
  status: "sent" | "cancelled";
  contacts: SOSContact[];
  guestContacts?: Array<{
    name: string;
    phoneNumber: string;
    relationship: string;
  }>;
  location?: {
    address: string;
  };
  customNote?: string;
  wasOffline: boolean;
  metadata: Record<string, unknown>;
  triggeredAt: string;
  cancelledAt?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SOSAccessInfo {
  success: boolean;
  authenticated: boolean;
  isGuest?: boolean;
  hasEmergencyContacts?: boolean;
  contactCount?: number;
  user?: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
  message: string;
  guestAccess?: boolean;
}

export interface GuestContact {
  name: string;
  phoneNumber: string;
  relationship: "family" | "friend" | "partner" | "colleague" | "other";
}

export interface TriggerSOSPayload {
  location?: {
    address: string;
  };
  customNote?: string;
  wasOffline?: boolean;
  metadata?: Record<string, unknown>;
  guestSessionId?: string;
  guestContacts?: GuestContact[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  error?: string;
  authenticated?: boolean;
  isGuest?: boolean;
  hasEmergencyContacts?: boolean;
  redirectTo?: string;
}

export interface GuestSession {
  sessionId: string;
  expiresAt: string;
}

// 1. CHECK SOS ACCESS
export const checkSOSAccess = async (): Promise<ApiResponse<SOSAccessInfo>> => {
  try {
    const response = await apiClient.get<ApiResponse<SOSAccessInfo>>(
      "/api/sos/check-access"
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "Failed to check SOS access",
      error: axiosError.response?.data?.error || "Unknown error",
    };
  }
};

// 2. QUICK TRIGGER SOS
export const triggerQuickSOS = async (
  payload: TriggerSOSPayload
): Promise<ApiResponse<SOSAlert>> => {
  try {
    const response = await apiClient.post<ApiResponse<SOSAlert>>(
      "/api/sos/quick-trigger",
      payload
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "Failed to trigger SOS alert",
      errors: axiosError.response?.data?.errors,
      error: axiosError.response?.data?.error || "Unknown error",
      redirectTo: axiosError.response?.data?.redirectTo,
    };
  }
};

// 3. TRIGGER SOS
export const triggerSOS = async (
  payload: Omit<TriggerSOSPayload, "guestSessionId" | "guestContacts">
): Promise<ApiResponse<SOSAlert>> => {
  try {
    const response = await apiClient.post<ApiResponse<SOSAlert>>(
      "/api/sos/trigger",
      payload
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "Failed to trigger SOS alert",
      errors: axiosError.response?.data?.errors,
      error: axiosError.response?.data?.error || "Unknown error",
    };
  }
};

// 4. CANCEL SOS ALERT
export const cancelSOSAlert = async (
  sosId: string
): Promise<ApiResponse<SOSAlert>> => {
  try {
    const response = await apiClient.post<ApiResponse<SOSAlert>>(
      `/api/sos/${sosId}/cancel`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "Failed to cancel SOS alert",
      error: axiosError.response?.data?.error || "Unknown error",
    };
  }
};

// 8. GET CURRENT USER TYPE
export const getCurrentUserType = (): "authenticated" | "guest" | "none" => {
  const token = localStorage.getItem("token");
  const guestSessionId = localStorage.getItem("guestSessionId");
  const accessType = localStorage.getItem("accessType");

  if (token) {
    return "authenticated";
  } else if (guestSessionId && accessType === "guest") {
    return "guest";
  }

  return "none";
};

// 9. VALIDATE PHONE NUMBER
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  if (!phoneNumber || typeof phoneNumber !== "string") {
    return false;
  }

  const sanitized = phoneNumber.trim();
  const phoneRegex = /^\+?\d{10,15}$/;
  return phoneRegex.test(sanitized);
};
