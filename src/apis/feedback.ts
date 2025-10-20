import { AxiosError } from "axios";
import apiClient from "./axiosConfig";

// Type Definitions
export interface Feedback {
  _id: string;
  id: string;
  user?: {
    _id: string;
    username: string;
    email: string;
  };
  fullName: string;
  email?: string;
  message: string;
  rating?: number;
  status: "pending" | "reviewed" | "published" | "archived";
  isPublic: boolean;
  isAnonymous: boolean;
  adminNotes?: string;
  reviewedBy?: {
    _id: string;
    username: string;
    email: string;
  };
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackStats {
  total: number;
  pending: number;
  published: number;
  anonymous: number;
  authenticated: number;
  averageRating: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// 1. CREATE FEEDBACK (Public - Authenticated or Unauthenticated)
export const createFeedback = async (data: {
  fullName: string;
  email?: string;
  message: string;
  rating?: number;
}): Promise<ApiResponse<{ feedback: Feedback }>> => {
  try {
    const response = await apiClient.post<ApiResponse<{ feedback: Feedback }>>(
      "/api/feedback/create",
      data
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "Failed to submit feedback",
      error: axiosError.response?.data?.error || "Unknown error",
    };
  }
};

// 2. GET PUBLIC FEEDBACK (Public)
export const getPublicFeedback = async (params?: {
  limit?: number;
  skip?: number;
}): Promise<ApiResponse<{ feedback: Feedback[]; count: number }>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.skip) queryParams.append("skip", String(params.skip));

    const response = await apiClient.get<
      ApiResponse<{ feedback: Feedback[]; count: number }>
    >(
      `/api/feedback/all${
        queryParams.toString() ? "?" + queryParams.toString() : ""
      }`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "Failed to fetch public feedback",
    };
  }
};

// 2.1. GET PUBLISHED TESTIMONIALS (Public)
export const getPublishedTestimonials = async (params?: {
  limit?: number;
  skip?: number;
}): Promise<ApiResponse<{ feedback: Feedback[]; count: number }>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.skip) queryParams.append("skip", String(params.skip));
    // Add filter for published and public feedback
    queryParams.append("status", "published");

    const response = await apiClient.get<
      ApiResponse<{ feedback: Feedback[]; count: number }>
    >(
      `/api/feedback/all${
        queryParams.toString() ? "?" + queryParams.toString() : ""
      }`
    );
    
    const apiResponse = response.data;
    
    // Since the API is already filtering by status=published and returning the correct data,
    // we trust the server-side filtering and return the data as-is
    
    return apiResponse;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "Failed to fetch published testimonials",
    };
  }
};

// 3. GET ALL FEEDBACK (Admin Only)
export const getAllFeedback = async (filters?: {
  status?: string;
  isAnonymous?: boolean;
  limit?: number;
  skip?: number;
}): Promise<
  ApiResponse<{ feedback: Feedback[]; count: number; total: number }>
> => {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.isAnonymous !== undefined)
      params.append("isAnonymous", String(filters.isAnonymous));
    if (filters?.limit) params.append("limit", String(filters.limit));
    if (filters?.skip) params.append("skip", String(filters.skip));

    const response = await apiClient.get<
      ApiResponse<{ feedback: Feedback[]; count: number; total: number }>
    >(
      `/api/feedback/all-feedback${
        params.toString() ? "?" + params.toString() : ""
      }`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "Failed to fetch all feedback",
    };
  }
};

// 4. GET FEEDBACK BY ID (Admin Only)
export const getFeedbackById = async (
  feedbackId: string
): Promise<ApiResponse<{ feedback: Feedback }>> => {
  try {
    const response = await apiClient.get<ApiResponse<{ feedback: Feedback }>>(
      `/api/feedback/${feedbackId}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "Failed to fetch feedback details",
    };
  }
};

// 5. PUBLISH FEEDBACK (Admin Only)
export const publishFeedback = async (
  feedbackId: string
): Promise<ApiResponse<{ feedback: Feedback }>> => {
  try {
    const response = await apiClient.patch<
      ApiResponse<{ feedback: Feedback }>
    >(`/api/feedback/${feedbackId}/publish`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "Failed to publish feedback",
    };
  }
};

// 6. UNPUBLISH FEEDBACK (Admin Only)
export const unpublishFeedback = async (
  feedbackId: string
): Promise<ApiResponse<{ feedback: Feedback }>> => {
  try {
    const response = await apiClient.patch<
      ApiResponse<{ feedback: Feedback }>
    >(`/api/feedback/${feedbackId}/unpublish`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "Failed to unpublish feedback",
    };
  }
};

// 7. DELETE FEEDBACK (Admin Only)
export const deleteFeedback = async (
  feedbackId: string
): Promise<ApiResponse> => {
  try {
    const response = await apiClient.delete<ApiResponse>(
      `/api/feedback/${feedbackId}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "Failed to delete feedback",
    };
  }
};

// 8. GET FEEDBACK STATISTICS (Admin Only)
export const getFeedbackStats = async (): Promise<
  ApiResponse<{ stats: FeedbackStats }>
> => {
  try {
    const response = await apiClient.get<
      ApiResponse<{ stats: FeedbackStats }>
    >("/api/feedback/stats");
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message ||
        "Failed to fetch feedback statistics",
    };
  }
};