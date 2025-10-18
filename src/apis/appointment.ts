import { AxiosError } from "axios";
import apiClient from "./axiosConfig";

// Type Definitions
export interface BookAppointmentData {
  counselorId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  appointmentDate: string;
  appointmentTime: string;
  duration?: number;
  appointmentType?: string;
  sessionMode?: string;
  reason?: string;
  urgencyLevel?: string;
}

export interface Appointment {
  _id: string;
  user: {
    _id: string;
    username: string;
    email: string;
  };
  counselor: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    specialization: string;
  };
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  appointmentType: string;
  sessionMode: string;
  reason?: string;
  status: string;
  urgencyLevel: string;
  cancelledBy?: string;
  cancellationReason?: string;
  meetingDetails?: {
    meetingId: string;
    meetingUrl: string;
    roomName: string;
    startTime: string;
    duration: number;
  };
  createdAt: string;
}

export interface TimeSlot {
  time: string;
  duration: number;
  available: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// 1. BOOK APPOINTMENT
export const bookAppointment = async (
  data: BookAppointmentData
): Promise<ApiResponse<{ appointment: Appointment }>> => {
  try {
    const response = await apiClient.post<
      ApiResponse<{ appointment: Appointment }>
    >("/api/appointments/book", data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "Failed to book appointment",
    };
  }
};

// 2. GET USER APPOINTMENTS
export const getUserAppointments = async (filters?: {
  status?: string;
  upcoming?: boolean;
}): Promise<ApiResponse<{ appointments: Appointment[]; count: number }>> => {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.upcoming !== undefined)
      params.append("upcoming", String(filters.upcoming));

    const response = await apiClient.get<
      ApiResponse<{ appointments: Appointment[]; count: number }>
    >(`/api/appointments/user?${params.toString()}`);
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

// 3. GET APPOINTMENT DETAILS
export const getAppointmentDetails = async (
  appointmentId: string
): Promise<ApiResponse<{ appointment: Appointment }>> => {
  try {
    const response = await apiClient.get<
      ApiResponse<{ appointment: Appointment }>
    >(`/api/appointments/${appointmentId}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message ||
        "Failed to fetch appointment details",
    };
  }
};

// 4. CANCEL APPOINTMENT
export const cancelAppointment = async (
  appointmentId: string,
  reason?: string
): Promise<ApiResponse> => {
  try {
    const response = await apiClient.put<ApiResponse>(
      `/api/appointments/${appointmentId}/cancel`,
      { reason }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "Failed to cancel appointment",
    };
  }
};

// 5. GET AVAILABLE TIME SLOTS
export const getAvailableTimeSlots = async (
  counselorId: string,
  date: string
): Promise<
  ApiResponse<{
    counselor: {
      id: string;
      name: string;
      username: string;
      specialization: string;
    };
    date: string;
    availableSlots: TimeSlot[];
    totalSlots: number;
  }>
> => {
  try {
    const response = await apiClient.get<
      ApiResponse<{ availableSlots: TimeSlot[] }>
    >(`/api/appointments/counselor/${counselorId}/availability?date=${date}`);
    return response.data as ApiResponse<{
      counselor: {
        id: string;
        name: string;
        username: string;
        specialization: string;
      };
      date: string;
      availableSlots: TimeSlot[];
      totalSlots: number;
    }>;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "Failed to fetch available slots",
    };
  }
};

// 6. CONFIRM APPOINTMENT (Counselor)
export const confirmAppointment = async (
  appointmentId: string
): Promise<ApiResponse<{ appointment: Appointment }>> => {
  try {
    const response = await apiClient.put<
      ApiResponse<{ appointment: Appointment }>
    >(`/api/appointments/${appointmentId}/confirm`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "Failed to confirm appointment",
    };
  }
};

// 7. REJECT APPOINTMENT (Counselor)
export const rejectAppointment = async (
  appointmentId: string,
  reason?: string
): Promise<ApiResponse<{ appointment: Appointment }>> => {
  try {
    const response = await apiClient.put<
      ApiResponse<{ appointment: Appointment }>
    >(`/api/appointments/${appointmentId}/reject`, { reason });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "Failed to reject appointment",
    };
  }
};

// 8. START SESSION (Counselor)
export const startSession = async (
  appointmentId: string
): Promise<
  ApiResponse<{
    appointmentId: string;
    status: string;
    meetingDetails?: { 
      meetingId: string; 
      meetingUrl: string;
      startTime: string;
    };
  }>
> => {
  try {
    const response = await apiClient.put<
      ApiResponse<{
        appointmentId: string;
        status: string;
        meetingDetails?: { 
          meetingId: string; 
          meetingUrl: string;
          startTime: string;
        };
      }>
    >(`/api/appointments/${appointmentId}/start`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to start session",
    };
  }
};

// 9. END SESSION (Counselor)
export const endSession = async (
  appointmentId: string,
  notes?: string
): Promise<ApiResponse<{ appointment: Appointment }>> => {
  try {
    const response = await apiClient.put<
      ApiResponse<{ appointment: Appointment }>
    >(`/api/appointments/${appointmentId}/end`, { notes });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to end session",
    };
  }
};

// 10. DELETE APPOINTMENT 
export const deleteAppointment = async (
  appointmentId: string
): Promise<ApiResponse> => {
  try {
    const response = await apiClient.delete<ApiResponse>(
      `/api/appointments/${appointmentId}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to delete appointment",
    };
  }
};

// 11. GET MEETING DETAILS (For joining session)
export const getMeetingDetails = async (
  appointmentId: string
): Promise<
  ApiResponse<{
    appointment: {
      id: string;
      counselor: {
        name: string;
        specialization: string;
      };
      appointmentDate: string;
      appointmentTime: string;
      duration: number;
    };
    meeting: {
      meetingId: string;
      meetingUrl: string;
      password?: string;
      startTime: string;
    };
  }>
> => {
  try {
    const response = await apiClient.get<
      ApiResponse<{
        appointment: {
          id: string;
          counselor: {
            name: string;
            specialization: string;
          };
          appointmentDate: string;
          appointmentTime: string;
          duration: number;
        };
        meeting: {
          meetingId: string;
          meetingUrl: string;
          password?: string;
          startTime: string;
        };
      }>
    >(`/api/appointments/${appointmentId}/meeting`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "Failed to fetch meeting details",
    };
  }
};
