import { AxiosError } from "axios";
import apiClient from "./axiosConfig";

// Type Definitions
export interface User {
  id: string;
  username?: string;
  email: string;
  role?: string;
  [key: string]: unknown;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    token?: string;
    user?: User;
    sessionId?: string;
  };
}

// 1. REGISTER
export const register = async (
  username: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>(
      "/api/auth/register",
      {
        username,
        email,
        password,
      }
    );

    if (response.data.success && response.data.data?.token) {
      localStorage.setItem("token", response.data.data.token);
      if (response.data.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
      }
    }

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<AuthResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Registration failed",
    };
  }
};

// 2. LOGIN
export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>(
      "/api/auth/login",
      {
        email,
        password,
      }
    );

    if (response.data.success && response.data.data?.token) {
      localStorage.setItem("token", response.data.data.token);
      if (response.data.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
      }
    }

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<AuthResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Login failed",
    };
  }
};

// 3. CONTINUE AS GUEST
export const continueAsGuest = async (): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>(
      "/api/auth/guest",
      {
        userAgent: navigator.userAgent,
        ipAddress: "0.0.0.0",
      }
    );

    if (response.data.success && response.data.data?.sessionId) {
      localStorage.setItem("guestSessionId", response.data.data.sessionId);
      localStorage.setItem("accessType", "guest");
    }

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<AuthResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Guest access failed",
    };
  }
};

// 4. VALIDATE GUEST SESSION
export const validateGuestSession = async (
  sessionId: string
): Promise<boolean> => {
  try {
    const response = await apiClient.post<AuthResponse>(
      "/api/auth/validate-guest",
      {
        sessionId,
      }
    );
    return response.data.success;
  } catch {
    return false;
  }
};

// 5. LOGOUT
export const logout = (): { success: boolean; message: string } => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("userRole");
  localStorage.removeItem("guestSessionId");
  localStorage.removeItem("accessType");
  return { success: true, message: "Logged out successfully" };
};

// 6. CHECK IF USER IS AUTHENTICATED
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("token");
  return !!token;
};

// 7. GET CURRENT USER
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem("user");
  return userStr ? (JSON.parse(userStr) as User) : null;
};

// 8. GET AUTH TOKEN
export const getAuthToken = (): string | null => {
  return localStorage.getItem("token");
};

// 9. COUNSELOR REGISTRATION
export interface CounselorRegistrationData {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  licenseNumber: string;
  specialization: string;
  experience: number;
  bio: string;
}

export interface CounselorRegistrationResponse {
  success: boolean;
  message?: string;
  data?: {
    counselor: {
      id: string;
      email: string;
      username: string;
      specialization: string;
      verificationStatus: string;
      submittedAt: string;
    };
  };
}

export const registerCounselor = async (
  data: CounselorRegistrationData
): Promise<CounselorRegistrationResponse> => {
  try {
    const response = await apiClient.post<CounselorRegistrationResponse>(
      "/api/counselor/register",
      data
    );

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<CounselorRegistrationResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Counselor registration failed",
    };
  }
};