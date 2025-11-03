import apiClient from "./axiosConfig";
import type {
  EmergencyContact,
  CreateEmergencyContactRequest,
  UpdateEmergencyContactRequest,
  SOSAlert,
  TriggerSOSRequest,
  QuickTriggerSOSRequest,
  SOSApiResponse,
  EmergencyContactsResponse,
  SOSAccessCheck,
  GuestSession,
} from "@/types/sos";

// Helper type for error handling
type ApiError = {
  response?: {
    data?: {
      message?: string;
      alert?: SOSAlert;
    };
  };
};

// Get all emergency contacts for the authenticated user
export const getEmergencyContacts = async (): Promise<
  SOSApiResponse<EmergencyContactsResponse>
> => {
  try {
    const response = await apiClient.get("/api/emergency-contacts");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const err = error as ApiError;
    return {
      success: false,
      error:
        err.response?.data?.message || "Failed to fetch emergency contacts",
    };
  }
};

// Get only active emergency contacts with consent given
export const getActiveEmergencyContacts = async (): Promise<
  SOSApiResponse<EmergencyContactsResponse>
> => {
  try {
    const response = await apiClient.get("/api/emergency-contacts/active");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error:
        (error as ApiError).response?.data?.message ||
        "Failed to fetch active emergency contacts",
    };
  }
};

// Get a single emergency contact by ID
export const getEmergencyContactById = async (
  id: string
): Promise<SOSApiResponse<EmergencyContact>> => {
  try {
    const response = await apiClient.get(`/api/emergency-contacts/${id}`);
    return {
      success: true,
      data: response.data.contact,
    };
  } catch (error) {
    return {
      success: false,
      error:
        (error as ApiError).response?.data?.message ||
        "Failed to fetch emergency contact",
    };
  }
};

// Create a new emergency contact
export const createEmergencyContact = async (
  contactData: CreateEmergencyContactRequest
): Promise<SOSApiResponse<EmergencyContact>> => {
  try {
    const response = await apiClient.post(
      "/api/emergency-contacts",
      contactData
    );
    return {
      success: true,
      data: response.data.contact,
      message:
        response.data.message || "Emergency contact created successfully",
    };
  } catch (error) {
    return {
      success: false,
      error:
        (error as ApiError).response?.data?.message ||
        "Failed to create emergency contact",
    };
  }
};

// Update an existing emergency contact
export const updateEmergencyContact = async (
  id: string,
  updates: UpdateEmergencyContactRequest
): Promise<SOSApiResponse<EmergencyContact>> => {
  try {
    const response = await apiClient.put(
      `/api/emergency-contacts/${id}`,
      updates
    );
    return {
      success: true,
      data: response.data.contact,
      message:
        response.data.message || "Emergency contact updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      error:
        (error as ApiError).response?.data?.message ||
        "Failed to update emergency contact",
    };
  }
};

// Delete an emergency contact
export const deleteEmergencyContact = async (
  id: string
): Promise<SOSApiResponse<void>> => {
  try {
    const response = await apiClient.delete(`/api/emergency-contacts/${id}`);
    return {
      success: true,
      message:
        response.data.message || "Emergency contact deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      error:
        (error as ApiError).response?.data?.message ||
        "Failed to delete emergency contact",
    };
  }
};

// toggle consent status for an emergency contact
export const toggleContactConsent = async (
  id: string
): Promise<SOSApiResponse<EmergencyContact>> => {
  try {
    const response = await apiClient.post(
      `/api/emergency-contacts/${id}/consent`
    );
    return {
      success: true,
      data: response.data.contact,
      message: response.data.message || "Consent status updated",
    };
  } catch (error) {
    return {
      success: false,
      error:
        (error as ApiError).response?.data?.message ||
        "Failed to update consent status",
    };
  }
};

// check if user can trigger SOS

export const checkSOSAccess = async (): Promise<
  SOSApiResponse<SOSAccessCheck>
> => {
  try {
    const response = await apiClient.get("/api/sos/check-access");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error:
        (error as ApiError).response?.data?.message ||
        "Failed to check SOS access",
    };
  }
};

// Trigger SOS alert
export const triggerSOS = async (
  data: TriggerSOSRequest
): Promise<SOSApiResponse<SOSAlert>> => {
  try {
    const payload: TriggerSOSRequest = { ...data };

    if (typeof window !== "undefined") {
      const hasToken = !!localStorage.getItem("token");
      const storedGuestId = localStorage.getItem("guestSessionId");
      const storedAccessType = localStorage.getItem("accessType");

      if (
        !payload.guestSessionId &&
        !hasToken &&
        storedAccessType === "guest" &&
        storedGuestId
      ) {
        payload.guestSessionId = storedGuestId;
      }
    }

    const response = await apiClient.post("/api/sos/trigger", payload);
    return {
      success: true,
      data: response.data.alert,
      message: response.data.message || "SOS alert sent successfully",
    };
  } catch (error) {
    return {
      success: false,
      error:
        (error as ApiError).response?.data?.message ||
        "Failed to trigger SOS alert",
      data: (error as ApiError).response?.data?.alert,
    };
  }
};

// Quick trigger SOS
export const quickTriggerSOS = async (
  data: QuickTriggerSOSRequest
): Promise<SOSApiResponse<SOSAlert>> => {
  try {
    const payload: QuickTriggerSOSRequest = { ...data };

    if (typeof window !== "undefined") {
      const hasToken = !!localStorage.getItem("token");
      const storedGuestId = localStorage.getItem("guestSessionId");
      const storedAccessType = localStorage.getItem("accessType");

      if (
        !payload.guestSessionId &&
        !hasToken &&
        storedAccessType === "guest" &&
        storedGuestId
      ) {
        payload.guestSessionId = storedGuestId;
      }
    }

    const response = await apiClient.post("/api/sos/quick-trigger", payload);
    return {
      success: true,
      data: response.data.alert,
      message: response.data.message || "SOS alert sent successfully",
    };
  } catch (error) {
    return {
      success: false,
      error:
        (error as ApiError).response?.data?.message ||
        "Failed to trigger SOS alert",
      data: (error as ApiError).response?.data?.alert,
    };
  }
};

// cancel an SOS alert
export const cancelSOSAlert = async (
  alertId: string
): Promise<SOSApiResponse<SOSAlert>> => {
  try {
    const response = await apiClient.post(`/api/sos/${alertId}/cancel`);
    return {
      success: true,
      data: response.data.alert,
      message: response.data.message || "SOS alert cancelled successfully",
    };
  } catch (error) {
    return {
      success: false,
      error:
        (error as ApiError).response?.data?.message ||
        "Failed to cancel SOS alert",
    };
  }
};

// Create a guest session for anonymous SOS access

export const createGuestSession = async (): Promise<
  SOSApiResponse<GuestSession>
> => {
  try {
    const response = await apiClient.post("/api/auth/guest", {
      userAgent: navigator.userAgent,
      ipAddress: "0.0.0.0",
    });

    const rawPayload =
      ((response.data?.data ?? response.data) as Record<string, unknown>) || {};

    const sessionId =
      (rawPayload["guestSessionId"] as string | undefined) ||
      (rawPayload["sessionId"] as string | undefined);

    if (!sessionId) {
      throw new Error("Guest session ID not returned by the server");
    }

    const sessionPayload: GuestSession = {
      guestSessionId: sessionId,
      expiresAt: rawPayload["expiresAt"] as string | undefined,
      createdAt: rawPayload["createdAt"] as string | undefined,
    };

    localStorage.setItem("guestSessionId", sessionId);
    localStorage.setItem("accessType", "guest");

    return {
      success: true,
      data: sessionPayload,
      message: response.data?.message,
    };
  } catch (error) {
    console.error("Failed to create guest session", error);
    return {
      success: false,
      error:
        (error as ApiError).response?.data?.message ||
        (error instanceof Error
          ? error.message
          : "Failed to create guest session"),
    };
  }
};

// Get current location using browser geolocation API
export const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};

// Get device and browser information for metadata
export const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;

  // Detect browser
  let browserName = "Unknown";
  if (userAgent.indexOf("Firefox") > -1) {
    browserName = "Firefox";
  } else if (userAgent.indexOf("Chrome") > -1) {
    browserName = "Chrome";
  } else if (userAgent.indexOf("Safari") > -1) {
    browserName = "Safari";
  } else if (userAgent.indexOf("Edge") > -1) {
    browserName = "Edge";
  }

  // Detect OS
  let osName = "Unknown";
  if (userAgent.indexOf("Win") > -1) osName = "Windows";
  if (userAgent.indexOf("Mac") > -1) osName = "MacOS";
  if (userAgent.indexOf("Linux") > -1) osName = "Linux";
  if (userAgent.indexOf("Android") > -1) osName = "Android";
  if (userAgent.indexOf("iOS") > -1) osName = "iOS";

  return {
    userAgent,
    browserName,
    osName,
    deviceInfo: `${browserName} on ${osName}`,
  };
};

// Check if user is online
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// fallback location
export const getFallbackLocation = () => {
  try {
    const stored = localStorage.getItem("lastKnownLocation");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error reading fallback location:", error);
  }
  return null;
};

// Save location as fallback for future use
export const saveFallbackLocation = (latitude: number, longitude: number) => {
  try {
    const fallback = {
      latitude,
      longitude,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem("lastKnownLocation", JSON.stringify(fallback));
  } catch (error) {
    console.error("Error saving fallback location:", error);
  }
};

// Validate phone number format (international format)
export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ""));
};

// Validate email format
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
