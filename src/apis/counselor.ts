import { AxiosError } from "axios";
import apiClient from "./axiosConfig";

// Type Definitions
export interface AvailabilitySlot {
  startTime: string;
  endTime: string;
}

export interface DayAvailability {
  day: string;
  slots: AvailabilitySlot[];
}

export interface Counselor {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profilePicture?: string;
  specialization: string;
  experience: number;
  bio: string;
  licenseNumber: string;
  isVerified: boolean;
  verificationStatus: string;
  averageRating: number;
  totalSessions: number;
  isAvailable: boolean;
  availability?: DayAvailability[];
}

export interface AppointmentStats {
  total: number;
  completed: number;
  pending: number;
  breakdown: Array<{ _id: string; count: number }>;
}

export interface Appointment {
  _id: string;
  id: string;
  user: {
    username: string;
    email: string;
  };
  counselor: string;
  date: string;
  time: string;
  status: string;
  type?: string;
  reason?: string;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// 1. GET COUNSELOR PROFILE
export const getCounselorProfile = async (): Promise<
  ApiResponse<{ counselor: Counselor }>
> => {
  try {
    const response = await apiClient.get<ApiResponse<{ counselor: Counselor }>>(
      "/api/counselor/profile"
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to fetch profile",
    };
  }
};

// 2. UPDATE COUNSELOR PROFILE
export const updateCounselorProfile = async (data: {
  username?: string;
  phoneNumber?: string;
  profilePicture?: string;
}): Promise<ApiResponse<{ counselor: Counselor }>> => {
  try {
    const response = await apiClient.patch<
      ApiResponse<{ counselor: Counselor }>
    >("/api/counselor/update-profile", data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to update profile",
    };
  }
};

// 3. UPDATE COUNSELOR AVAILABILITY
export const updateCounselorAvailability = async (
  availability: DayAvailability[]
): Promise<ApiResponse<{ availability: DayAvailability[] }>> => {
  try {
    const response = await apiClient.put<
      ApiResponse<{ availability: DayAvailability[] }>
    >("/api/counselor/availability", { availability });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "Failed to update availability",
      error: axiosError.response?.data?.error || "Unknown error",
    };
  }
};

// 4. GET PENDING APPOINTMENTS
export const getPendingAppointments = async (): Promise<
  ApiResponse<{ appointments: Appointment[]; count: number }>
> => {
  try {
    const response = await apiClient.get<
      ApiResponse<{ appointments: Appointment[]; count: number }>
    >("/api/counselor/pending-appointments");
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "Failed to fetch appointments",
    };
  }
};

// 4B. GET ALL COUNSELOR APPOINTMENTS (ALL STATUSES)
export const getAllCounselorAppointments = async (filters?: {
  status?: string;
}): Promise<ApiResponse<{ appointments: Appointment[]; count: number }>> => {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);

    const response = await apiClient.get<
      ApiResponse<{ appointments: Appointment[]; count: number }>
    >(
      `/api/counselor/appointments${
        params.toString() ? "?" + params.toString() : ""
      }`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "Failed to fetch appointments",
    };
  }
};

// 5. GET APPOINTMENT STATISTICS
export const getAppointmentStats = async (): Promise<
  ApiResponse<{ stats: AppointmentStats }>
> => {
  try {
    const response = await apiClient.get<
      ApiResponse<{ stats: AppointmentStats }>
    >("/api/counselor/appointment-stats");
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "Failed to fetch statistics",
    };
  }
};

// 6. GET ALL COUNSELORS (Public)
export const getAllCounselors = async (filters?: {
  specialization?: string;
  isAvailable?: boolean;
}): Promise<ApiResponse<{ counselors: Counselor[]; count: number }>> => {
  try {
    const params = new URLSearchParams();
    if (filters?.specialization)
      params.append("specialization", filters.specialization);
    if (filters?.isAvailable !== undefined)
      params.append("isAvailable", String(filters.isAvailable));

    const response = await apiClient.get<
      ApiResponse<{ counselors: Counselor[]; count: number }>
    >(`/api/counselor/allcounselors?${params.toString()}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "Failed to fetch counselors",
    };
  }
};

// 7. GET COUNSELOR BY ID (Public)
export const getCounselorById = async (
  counselorId: string
): Promise<ApiResponse<{ counselor: Counselor }>> => {
  try {
    const response = await apiClient.get<ApiResponse<{ counselor: Counselor }>>(
      `/api/counselor/${counselorId}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message ||
        "Failed to fetch counselor details",
    };
  }
};

// 8. GET SPECIALIZATIONS (Public)
export const getSpecializations = async (): Promise<
  ApiResponse<{ specializations: string[] }>
> => {
  try {
    const response = await apiClient.get<
      ApiResponse<{ specializations: string[] }>
    >("/api/counselor/specializations/list");
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "Failed to fetch specializations",
    };
  }
};
