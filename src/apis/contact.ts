import { AxiosError } from "axios";
import apiClient from "./axiosConfig";

// Type Definitions
export interface ContactMessage {
  _id: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  message: string;
  status: "new" | "in-progress" | "resolved" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessageResponse {
  contactMessage: {
    id: string;
    firstName: string;
    lastName: string;
    message: string;
    createdAt: string;
  };
}

export interface ContactMessagesListResponse {
  messages: ContactMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// 1. CREATE CONTACT MESSAGE (Public)
export const createContactMessage = async (data: {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  message: string;
}): Promise<ApiResponse<ContactMessageResponse>> => {
  try {
    const response = await apiClient.post<ApiResponse<ContactMessageResponse>>(
      "/api/contact/messages",
      data
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message ||
        "Failed to submit contact message",
      error: axiosError.response?.data?.error || "Unknown error",
    };
  }
};

// 2. GET ALL CONTACT MESSAGES (Admin Only)
export const getAllContactMessages = async (params?: {
  status?: "new" | "in-progress" | "resolved" | "archived";
  search?: string;
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}): Promise<ApiResponse<ContactMessagesListResponse>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.sortField) queryParams.append("sortField", params.sortField);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const response = await apiClient.get<
      ApiResponse<ContactMessagesListResponse>
    >(
      `/api/contact/messages${
        queryParams.toString() ? "?" + queryParams.toString() : ""
      }`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message ||
        "Failed to retrieve contact messages",
    };
  }
};

// 3. GET CONTACT MESSAGE BY ID (Admin Only)
export const getContactMessageById = async (
  messageId: string
): Promise<ApiResponse<{ contactMessage: ContactMessage }>> => {
  try {
    const response = await apiClient.get<
      ApiResponse<{ contactMessage: ContactMessage }>
    >(`/api/contact/messages/${messageId}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message ||
        "Failed to retrieve contact message",
    };
  }
};
