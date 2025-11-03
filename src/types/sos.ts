// Emergency Contact Types
export interface EmergencyContact {
  _id?: string;
  userId?: string;
  name: string;
  email: string;
  phoneNumber?: string;
  relationship: string;
  priority?: number;
  consentGiven: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEmergencyContactRequest {
  name: string;
  email: string;
  phoneNumber?: string;
  relationship: string;
  priority?: number;
  consentGiven?: boolean;
}

export interface UpdateEmergencyContactRequest
  extends Partial<CreateEmergencyContactRequest> {
  isActive?: boolean;
}

// Location Types
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
}

export interface FallbackLocation {
  latitude?: number;
  longitude?: number;
  lastUpdated?: string;
}

// Guest Contact Types
export interface GuestContact {
  name: string;
  email: string;
  phoneNumber?: string;
  relationship?: string;
}

// SOS Alert Types
export interface SOSAlert {
  _id?: string;
  userId?: string;
  guestSessionId?: string;
  location: LocationData;
  fallbackLocation?: FallbackLocation;
  customNote?: string;
  status: "pending" | "sent" | "failed" | "cancelled" | "resolved";
  contactsNotified?: string[];
  failedContacts?: Array<{
    contactId?: string;
    email: string;
    error: string;
  }>;
  metadata?: {
    userAgent?: string;
    deviceInfo?: string;
    phoneNumber?: string;
    browserName?: string;
    osName?: string;
  };
  wasOffline?: boolean;
  triggeredAt: string;
  resolvedAt?: string;
  cancelledAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TriggerSOSRequest {
  location: LocationData;
  fallbackLocation?: FallbackLocation;
  customNote?: string;
  metadata?: {
    userAgent?: string;
    deviceInfo?: string;
    phoneNumber?: string;
    browserName?: string;
    osName?: string;
  };
  wasOffline?: boolean;
  guestSessionId?: string;
}

export interface QuickTriggerSOSRequest extends TriggerSOSRequest {
  guestSessionId?: string;
  guestContacts?: GuestContact[];
}

// API Response Types
export interface SOSApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface EmergencyContactsResponse {
  contacts: EmergencyContact[];
  total: number;
}

export interface SOSAccessCheck {
  canTriggerSOS: boolean;
  hasContacts: boolean;
  activeContactsCount: number;
  message?: string;
}

export interface ActiveSOSResponse {
  alert: SOSAlert | null;
  hasActiveAlert: boolean;
}

export interface SOSHistoryResponse {
  alerts: SOSAlert[];
  total: number;
  page: number;
  limit: number;
}

// Guest Session Types
export interface GuestSession {
  guestSessionId: string;
  expiresAt?: string;
  createdAt?: string;
  [key: string]: unknown;
}

// Offline SOS Queue Types
export interface OfflineSOSData {
  id: string;
  request: TriggerSOSRequest;
  timestamp: number;
  retryCount: number;
  status: "pending" | "syncing" | "synced" | "failed";
}

// Component State Types
export interface SOSButtonState {
  isHolding: boolean;
  holdProgress: number;
  isTriggering: boolean;
  isConfirming: boolean;
}

export interface EmergencyContactFormData {
  name: string;
  email: string;
  phoneNumber: string;
  relationship: string;
  priority: number;
  consentGiven: boolean;
}

