import { AxiosError } from "axios";
import apiClient from "./axiosConfig";

// Type Definitions
export interface EmergencyContact {
  _id: string;
  userId: string;
  name: string;
  relationship: "family" | "friend" | "partner" | "colleague" | "other";
  phoneNumber: string;
  notes?: string;
  consentGiven: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  error?: string;
}

// 1. GET ALL EMERGENCY CONTACTS
export const getEmergencyContacts = async (): Promise<
  ApiResponse<EmergencyContact[]>
> => {
  try {
    const response = await apiClient.get<ApiResponse<EmergencyContact[]>>(
      "/api/emergency-contacts"
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message ||
        "Failed to fetch emergency contacts",
      error: axiosError.response?.data?.error || "Unknown error",
    };
  }
};

// 2. GET SINGLE EMERGENCY CONTACT
export const getEmergencyContact = async (
  contactId: string
): Promise<ApiResponse<EmergencyContact>> => {
  try {
    const response = await apiClient.get<ApiResponse<EmergencyContact>>(
      `/api/emergency-contacts/${contactId}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message ||
        "Failed to fetch emergency contact",
      error: axiosError.response?.data?.error || "Unknown error",
    };
  }
};

// 3. CREATE EMERGENCY CONTACT
export const createEmergencyContact = async (data: {
  name: string;
  relationship: "family" | "friend" | "partner" | "colleague" | "other";
  phoneNumber: string;
  notes?: string;
}): Promise<ApiResponse<EmergencyContact>> => {
  try {
    const response = await apiClient.post<ApiResponse<EmergencyContact>>(
      "/api/emergency-contacts",
      data
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message ||
        "Failed to create emergency contact",
      errors: axiosError.response?.data?.errors,
      error: axiosError.response?.data?.error || "Unknown error",
    };
  }
};

// 4. UPDATE EMERGENCY CONTACT
export const updateEmergencyContact = async (
  contactId: string,
  data: {
    name?: string;
    relationship?: "family" | "friend" | "partner" | "colleague" | "other";
    phoneNumber?: string;
    notes?: string;
  }
): Promise<ApiResponse<EmergencyContact>> => {
  try {
    const response = await apiClient.put<ApiResponse<EmergencyContact>>(
      `/api/emergency-contacts/${contactId}`,
      data
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message ||
        "Failed to update emergency contact",
      errors: axiosError.response?.data?.errors,
      error: axiosError.response?.data?.error || "Unknown error",
    };
  }
};

// 5. DELETE EMERGENCY CONTACT
export const deleteEmergencyContact = async (
  contactId: string
): Promise<ApiResponse> => {
  try {
    const response = await apiClient.delete<ApiResponse>(
      `/api/emergency-contacts/${contactId}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message ||
        "Failed to delete emergency contact",
      error: axiosError.response?.data?.error || "Unknown error",
    };
  }
};