import { AxiosError } from "axios";
import apiClient from "./axiosConfig";

// Type Definitions
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface User {
  _id: string;
  email: string;
  username: string;
  role: "user" | "counselor" | "super_admin";
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UsersListResponse {
  users: User[];
  count: number;
}

export interface UserFilters {
  role?: "user" | "counselor" | "super_admin";
  isActive?: boolean;
  search?: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  username: string;
  role?: "user" | "counselor" | "super_admin";
  isActive?: boolean;
}

export interface UpdateUserData {
  email?: string;
  password?: string;
  username?: string;
  role?: "user" | "counselor" | "super_admin";
  isActive?: boolean;
}

export interface AdminStats {
  totalUsers?: number;
  totalCounselors?: number;
  verifiedCounselors?: number;
  activeCounselors?: number;
  pendingCounselors?: number;
  rejectedCounselors?: number;
  verificationRate?: string;
  specializationStats?: Array<{
    _id: string;
    count: number;
  }>;
  recentActivity?: {
    userRegistrations?: number;
    counselorApplications?: number;
  };
  totalAppointments?: number;
  totalPosts?: number;
  latestUsers?: number;
  monthlyGrowth?: number;
  growthTrends?: Array<{
    month: string;
    users: number;
    counselors: number;
    sessions: number;
  }>;
  activityData?: Array<{
    month: string;
    appointments: number;
    newUsers: number;
    activeCounselors: number;
  }>;
}

interface BackendApiResponse {
  success: boolean;
  message?: string;
  data?: {
    stats: AdminStats;
  };
}

export type AdminStatsResponse = ApiResponse<AdminStats>;

// Analytics Summary Types
export interface AnalyticsSummary {
  period: string;
  users: {
    total: number;
    new: number;
    active: number;
    monthlyData: Array<{
      _id: string;
      count: number;
    }>;
  };
  counselors: {
    total: number;
    new: number;
    approved: number;
    pending: number;
    monthlyData: Array<{
      _id: string;
      count: number;
    }>;
  };
  appointments: {
    total: number;
    new: number;
    completed: number;
    upcoming: number;
    completionRate: string;
    monthlyData: Array<{
      _id: string;
      total: number;
      completed: number;
    }>;
  };
}

export type AnalyticsSummaryResponse = ApiResponse<AnalyticsSummary>;

// Get Admin Statistics
export const getAdminStats = async (): Promise<AdminStatsResponse> => {
  try {
    const response = await apiClient.get<BackendApiResponse>(
      "/api/admin/stats"
    );
    const responseData = response.data;

    if (responseData && responseData.success && responseData.data?.stats) {
      const stats = responseData.data.stats;

      // Map the backend fields to our expected structure
      const normalizedStats: AdminStats = {
        totalUsers: stats.totalUsers,
        activeCounselors: stats.verifiedCounselors,
        totalCounselors: stats.totalCounselors,
        verifiedCounselors: stats.verifiedCounselors,
        pendingCounselors: stats.pendingCounselors,
        rejectedCounselors: stats.rejectedCounselors,
        verificationRate: stats.verificationRate,
        specializationStats: stats.specializationStats,
        recentActivity: stats.recentActivity,
        growthTrends: stats.growthTrends,
        activityData: stats.activityData,
      };

      return {
        success: true,
        message: responseData.message || "Statistics retrieved successfully",
        data: normalizedStats,
      };
    }

    return {
      success: false,
      message: responseData?.message || "Invalid response format",
      data: {
        totalUsers: 0,
        activeCounselors: 0,
        totalAppointments: 0,
        pendingCounselors: 0,
        totalPosts: 0,
        latestUsers: 0,
        monthlyGrowth: 0,
        growthTrends: [],
        activityData: [],
      },
    };
  } catch (error) {
    console.error("Error in getAdminStats:", error);
    const axiosError = error as AxiosError<BackendApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to fetch admin statistics",
      data: {
        totalUsers: 0,
        activeCounselors: 0,
        totalAppointments: 0,
        pendingCounselors: 0,
        totalPosts: 0,
        latestUsers: 0,
        monthlyGrowth: 0,
        growthTrends: [],
        activityData: [],
      },
    };
  }
};

// Get 3-Month Analytics Summary
export const getAnalyticsSummary =
  async (): Promise<AnalyticsSummaryResponse> => {
    try {
      const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: AnalyticsSummary;
      }>("/api/admin/analytics/summary");

      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Error in getAnalyticsSummary:", error);
      const axiosError = error as AxiosError<{
        success: boolean;
        message: string;
      }>;
      return {
        success: false,
        message:
          axiosError.response?.data?.message ||
          axiosError.message ||
          "Failed to fetch analytics summary",
      };
    }
  };

// Get all users with optional filtering
export const getAllUsers = async (
  filters?: UserFilters
): Promise<ApiResponse<UsersListResponse>> => {
  try {
    const params = new URLSearchParams();

    if (filters?.role) {
      params.append("role", filters.role);
    }
    if (typeof filters?.isActive !== "undefined") {
      params.append("isActive", String(filters.isActive));
    }
    if (filters?.search) {
      params.append("search", filters.search);
    }

    const queryString = params.toString();
    const url = `/api/admin/users${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: UsersListResponse;
    }>(url);

    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    const axiosError = error as AxiosError<{
      success: boolean;
      message: string;
    }>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to fetch users",
      data: { users: [], count: 0 },
    };
  }
};

// Get single user by ID
export const getUserById = async (
  userId: string
): Promise<ApiResponse<{ user: User }>> => {
  try {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: { user: User };
    }>(`/api/admin/users/${userId}`);

    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error in getUserById:", error);
    const axiosError = error as AxiosError<{
      success: boolean;
      message: string;
    }>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to fetch user",
    };
  }
};

// Create new user
export const createUser = async (
  userData: CreateUserData
): Promise<ApiResponse<{ user: User }>> => {
  try {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: { user: User };
    }>("/api/admin/users", userData);

    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error in createUser:", error);
    const axiosError = error as AxiosError<{
      success: boolean;
      message: string;
    }>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to create user",
    };
  }
};

// Update existing user
export const updateUser = async (
  userId: string,
  userData: UpdateUserData
): Promise<ApiResponse<{ user: User }>> => {
  try {
    const response = await apiClient.put<{
      success: boolean;
      message: string;
      data: { user: User };
    }>(`/api/admin/users/${userId}`, userData);

    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error in updateUser:", error);
    const axiosError = error as AxiosError<{
      success: boolean;
      message: string;
    }>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to update user",
    };
  }
};

// Delete user
export const deleteUser = async (userId: string): Promise<ApiResponse> => {
  try {
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
    }>(`/api/admin/users/${userId}`);

    return {
      success: response.data.success,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error in deleteUser:", error);
    const axiosError = error as AxiosError<{
      success: boolean;
      message: string;
    }>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to delete user",
    };
  }
};
