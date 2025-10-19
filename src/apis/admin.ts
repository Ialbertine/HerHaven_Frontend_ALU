import { AxiosError } from "axios";
import apiClient from "./axiosConfig";

// Type Definitions
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
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
}

interface BackendApiResponse {
  success: boolean;
  message?: string;
  data?: {
    stats: AdminStats;
  };
}

export type AdminStatsResponse = ApiResponse<AdminStats>;

// Get Admin Statistics
export const getAdminStats = async (): Promise<AdminStatsResponse> => {
  try {
    const response = await apiClient.get<BackendApiResponse>("/api/admin/stats");
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
      };
      
      return {
        success: true,
        message: responseData.message || "Statistics retrieved successfully",
        data: normalizedStats
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
      },
    };
  } catch (error) {
    console.error('Error in getAdminStats:', error);
    const axiosError = error as AxiosError<BackendApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || axiosError.message || "Failed to fetch admin statistics",
      data: {
        totalUsers: 0,
        activeCounselors: 0,
        totalAppointments: 0,
        pendingCounselors: 0,
        totalPosts: 0,
        latestUsers: 0,
        monthlyGrowth: 0,
      },
    };
  }
};
