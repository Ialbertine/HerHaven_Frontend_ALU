import { AxiosError } from "axios";
import apiClient from "./axiosConfig";

// ==================== TYPE DEFINITIONS ====================

// Template Types
export interface AssessmentQuestion {
  questionId: string;
  text: string;
  type: "single-choice" | "multiple-choice" | "scale" | "text";
  options?: Array<{
    value: number;
    label: string;
  }>;
  isCrisisIndicator?: boolean;
  crisisThreshold?: number;
  isRequired?: boolean;
  order: number;
}

export interface SeverityLevel {
  name: string;
  range: {
    min: number;
    max: number;
  };
  color?: string;
  recommendations?: string[];
}

export interface ScoringRules {
  maxScore: number;
  severityLevels: SeverityLevel[];
}

export interface AssessmentTemplate {
  _id: string;
  name: string;
  category: "depression" | "anxiety" | "ptsd" | "safety" | "wellness" | "general";
  description: string;
  version: string;
  questions: AssessmentQuestion[];
  scoringRules: ScoringRules;
  isActive: boolean;
  isPublished: boolean;
  estimatedDuration: number;
  language: string;
  totalResponses?: number;
  lastUsed?: string;
  createdAt: string;
  updatedAt: string;
}

// Response Types
export interface AssessmentResponseItem {
  questionId: string;
  answer: string | number | (string | number)[];
  score?: number;
}

export interface CrisisIndicator {
  questionId: string;
  questionText: string;
  answer: string | number | (string | number)[];
}

export interface Recommendation {
  type: "resource" | "action" | "appointment";
  title: string;
  description: string;
  link?: string;
  priority: "low" | "medium" | "high";
}

export interface SharedWithCounselor {
  counselor: string;
  sharedAt: string;
  viewedAt?: string;
}

export interface FollowUpAction {
  action: "counselor_notified" | "appointment_suggested";
  performedAt: string;
  details?: Record<string, unknown>;
}

export interface AssessmentResponse {
  _id: string;
  user?: string;
  sessionId?: string;
  template: string | AssessmentTemplate;
  templateSnapshot: {
    name: string;
    version: string;
    category: string;
  };
  responses: AssessmentResponseItem[];
  totalScore: number;
  severityLevel: string;
  isCrisis: boolean;
  crisisIndicators?: CrisisIndicator[];
  status: "in-progress" | "completed" | "abandoned";
  completedAt?: string;
  startedAt: string;
  durationInSeconds?: number;
  isAnonymous: boolean;
  shareWithCounselor: boolean;
  sharedWith?: SharedWithCounselor[];
  userNotes?: string;
  counselorNotes?: string;
  recommendations?: Recommendation[];
  followUpActions?: FollowUpAction[];
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Analytics Types
export interface ScoreHistoryItem {
  date: string;
  score: number;
  severity: string;
  category: string;
}

export interface AssessmentAnalytics {
  totalAssessments: number;
  recentAssessments: AssessmentResponse[];
  trends: {
    overall: "improving" | "stable" | "worsening";
    scoreHistory: ScoreHistoryItem[];
    severityDistribution: Record<string, number>;
    averageScore: number;
  } | null;
}

export interface RetakeInfo {
  shouldRetake: boolean;
  reason: string;
  lastAssessmentDate?: string;
  daysSinceLastAssessment?: number;
  recommendedInterval?: number;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// get all public assessment templates
export const getPublicTemplates = async (params?: {
  category?: "depression" | "anxiety" | "ptsd" | "safety" | "wellness" | "general";
}): Promise<ApiResponse<{ templates: AssessmentTemplate[]; count: number }>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append("category", params.category);

    const response = await apiClient.get<ApiResponse<{ templates: AssessmentTemplate[]; count: number }>>(
      `/api/assessments/public/templates${queryParams.toString() ? "?" + queryParams.toString() : ""}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to retrieve public templates",
    };
  }
};

// get single public template to begin assessment
export const getPublicTemplateToBegin = async (
  templateId: string
): Promise<ApiResponse<{ template: AssessmentTemplate }>> => {
  try {
    const response = await apiClient.get<ApiResponse<{ template: AssessmentTemplate }>>(
      `/api/assessments/public/templates/${templateId}/begin`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to retrieve template",
    };
  }
};

// submit public assessment
export const submitPublicAssessment = async (data: {
  templateId: string;
  responses: Array<{
    questionId: string;
    answer: string | number | (string | number)[];
  }>;
  isAnonymous?: boolean;
  shareWithCounselor?: boolean;
  counselorId?: string;
  userNotes?: string;
}): Promise<ApiResponse<{
  assessment: {
    id: string;
    sessionId?: string;
    totalScore: number;
    severityLevel: string;
    isCrisis: boolean;
    recommendations: Recommendation[];
    completedAt: string;
  };
}>> => {
  try {
    const response = await apiClient.post<ApiResponse<{
      assessment: {
        id: string;
        sessionId?: string;
        totalScore: number;
        severityLevel: string;
        isCrisis: boolean;
        recommendations: Recommendation[];
        completedAt: string;
      };
    }>>(
      "/api/assessments/public/submit",
      data
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to submit public assessment",
      error: axiosError.response?.data?.error || "Unknown error",
    };
  }
};


// create a new assessment template
export const createAssessmentTemplate = async (
  templateData: Omit<AssessmentTemplate, "_id" | "createdAt" | "updatedAt" | "totalResponses" | "lastUsed">
): Promise<ApiResponse<{ template: AssessmentTemplate }>> => {
  try {
    const response = await apiClient.post<ApiResponse<{ template: AssessmentTemplate }>>(
      "/api/assessments/templates",
      templateData
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to create assessment template",
      error: axiosError.response?.data?.error || "Unknown error",
    };
  }
};

// get all assessment templates
export const getAssessmentTemplates = async (params?: {
  category?: "depression" | "anxiety" | "ptsd" | "safety" | "wellness" | "general";
  isActive?: boolean;
  isPublished?: boolean;
}): Promise<ApiResponse<{ templates: AssessmentTemplate[]; count: number }>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append("category", params.category);
    if (params?.isActive !== undefined) queryParams.append("isActive", String(params.isActive));
    if (params?.isPublished !== undefined) queryParams.append("isPublished", String(params.isPublished));

    const response = await apiClient.get<ApiResponse<{ templates: AssessmentTemplate[]; count: number }>>(
      `/api/assessments/templates${queryParams.toString() ? "?" + queryParams.toString() : ""}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to retrieve assessment templates",
    };
  }
};

// get single assessment template by ID
export const getAssessmentTemplateById = async (
  templateId: string
): Promise<ApiResponse<{ template: AssessmentTemplate }>> => {
  try {
    const response = await apiClient.get<ApiResponse<{ template: AssessmentTemplate }>>(
      `/api/assessments/templates/${templateId}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to retrieve assessment template",
    };
  }
};

// update assessment template (admin only)
export const updateAssessmentTemplate = async (
  templateId: string,
  updates: Partial<Omit<AssessmentTemplate, "_id" | "createdAt" | "updatedAt">>
): Promise<ApiResponse<{ template: AssessmentTemplate }>> => {
  try {
    const response = await apiClient.put<ApiResponse<{ template: AssessmentTemplate }>>(
      `/api/assessments/templates/${templateId}`,
      updates
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to update assessment template",
      error: axiosError.response?.data?.error || "Unknown error",
    };
  }
};

// delete assessment template (admin only)
export const deleteAssessmentTemplate = async (
  templateId: string
): Promise<ApiResponse<void>> => {
  try {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/api/assessments/templates/${templateId}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to delete assessment template",
    };
  }
};


// submit assessment response (authenticated users)
export const submitAssessment = async (data: {
  templateId: string;
  responses: Array<{
    questionId: string;
    answer: string | number | (string | number)[];
  }>;
  isAnonymous?: boolean;
  shareWithCounselor?: boolean;
  counselorId?: string;
  userNotes?: string;
}): Promise<ApiResponse<{
  assessment: {
    id: string;
    sessionId?: string;
    totalScore: number;
    severityLevel: string;
    isCrisis: boolean;
    recommendations: Recommendation[];
    completedAt: string;
  };
}>> => {
  try {
    const response = await apiClient.post<ApiResponse<{
      assessment: {
        id: string;
        sessionId?: string;
        totalScore: number;
        severityLevel: string;
        isCrisis: boolean;
        recommendations: Recommendation[];
        completedAt: string;
      };
    }>>(
      "/api/assessments/submit",
      data
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to submit assessment",
      error: axiosError.response?.data?.error || "Unknown error",
    };
  }
};

// submit anonymous assessment
export const submitAnonymousAssessment = async (data: {
  templateId: string;
  responses: Array<{
    questionId: string;
    answer: string | number | (string | number)[];
  }>;
  userNotes?: string;
}): Promise<ApiResponse<{
  assessment: {
    id: string;
    sessionId: string;
    totalScore: number;
    severityLevel: string;
    isCrisis: boolean;
    recommendations: Recommendation[];
    completedAt: string;
  };
}>> => {
  try {
    const response = await apiClient.post<ApiResponse<{
      assessment: {
        id: string;
        sessionId: string;
        totalScore: number;
        severityLevel: string;
        isCrisis: boolean;
        recommendations: Recommendation[];
        completedAt: string;
      };
    }>>(
      "/api/assessments/anonymous/submit",
      data
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to submit anonymous assessment",
      error: axiosError.response?.data?.error || "Unknown error",
    };
  }
};

// get user's assessment history
export const getMyAssessments = async (params?: {
  category?: "depression" | "anxiety" | "ptsd" | "safety" | "wellness" | "general";
  status?: "in-progress" | "completed" | "abandoned";
  limit?: number;
  page?: number;
}): Promise<ApiResponse<{
  assessments: AssessmentResponse[];
  pagination: PaginationData;
}>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append("category", params.category);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.page) queryParams.append("page", String(params.page));

    const response = await apiClient.get<ApiResponse<{
      assessments: AssessmentResponse[];
      pagination: PaginationData;
    }>>(
      `/api/assessments/my-assessments${queryParams.toString() ? "?" + queryParams.toString() : ""}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to retrieve assessments",
    };
  }
};

//Get specific assessment by ID 
export const getAssessmentById = async (
  assessmentId: string
): Promise<ApiResponse<{ assessment: AssessmentResponse }>> => {
  try {
    // Fetch user's assessments and find the one with matching ID
    const response = await getMyAssessments({ limit: 1000 });
    
    if (response.success && response.data) {
      const assessment = response.data.assessments.find(
        (a: AssessmentResponse) => a._id === assessmentId
      );
      
      if (assessment) {
        return {
          success: true,
          message: "Assessment retrieved successfully",
          data: { assessment },
        };
      } else {
        return {
          success: false,
          message: "Assessment not found",
        };
      }
    }
    
    return {
      success: false,
      message: response.message || "Failed to retrieve assessment",
    };
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to retrieve assessment",
    };
  }
};

//Get assessment by session ID (for anonymous users)
export const getAssessmentBySession = async (
  sessionId: string
): Promise<ApiResponse<{
  assessment: {
    id: string;
    sessionId: string;
    totalScore: number;
    severityLevel: string;
    isCrisis: boolean;
    recommendations: Recommendation[];
    completedAt: string;
    template: AssessmentTemplate;
  };
}>> => {
  try {
    const response = await apiClient.get<ApiResponse<{
      assessment: {
        id: string;
        sessionId: string;
        totalScore: number;
        severityLevel: string;
        isCrisis: boolean;
        recommendations: Recommendation[];
        completedAt: string;
        template: AssessmentTemplate;
      };
    }>>(
      `/api/assessments/public/session/${sessionId}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to retrieve assessment",
    };
  }
};

// Get assessment recommendations
export const getAssessmentRecommendations = async (
  assessmentId: string
): Promise<ApiResponse<{
  recommendations: Recommendation[];
  severityLevel: string;
  isCrisis: boolean;
}>> => {
  try {
    const response = await apiClient.get<ApiResponse<{
      recommendations: Recommendation[];
      severityLevel: string;
      isCrisis: boolean;
    }>>(
      `/api/assessments/results/${assessmentId}/recommendations`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to retrieve recommendations",
    };
  }
};


// Get user's assessment analytics and trends
export const getAssessmentAnalytics = async (
  templateId?: string
): Promise<ApiResponse<AssessmentAnalytics>> => {
  try {
    const queryParams = templateId ? `?templateId=${templateId}` : "";
    const response = await apiClient.get<ApiResponse<AssessmentAnalytics>>(
      `/api/assessments/analytics/me${queryParams}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to retrieve analytics",
    };
  }
};


// Check if user should retake assessment
export const checkRetakeAssessment = async (
  templateId: string
): Promise<ApiResponse<RetakeInfo>> => {
  try {
    const response = await apiClient.get<ApiResponse<RetakeInfo>>(
      `/api/assessments/retake/${templateId}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to check retake status",
    };
  }
};

// Share assessment with counselor
export const shareAssessmentWithCounselor = async (
  assessmentId: string,
  counselorId: string
): Promise<ApiResponse<{
  assessmentId: string;
  sharedWith: string;
}>> => {
  try {
    const response = await apiClient.post<ApiResponse<{
      assessmentId: string;
      sharedWith: string;
    }>>(
      `/api/assessments/results/${assessmentId}/share`,
      { counselorId }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to share assessment",
      error: axiosError.response?.data?.error || "Unknown error",
    };
  }
};


// Get assessments shared with counselor (Counselor only)
export const getSharedAssessments = async (params?: {
  status?: "in-progress" | "completed" | "abandoned";
  unviewed?: boolean;
}): Promise<ApiResponse<{
  assessments: AssessmentResponse[];
  count: number;
}>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.unviewed !== undefined) queryParams.append("unviewed", String(params.unviewed));

    const response = await apiClient.get<ApiResponse<{
      assessments: AssessmentResponse[];
      count: number;
    }>>(
      `/api/assessments/shared/with-me${queryParams.toString() ? "?" + queryParams.toString() : ""}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to retrieve shared assessments",
    };
  }
};

// Add counselor notes to assessment (Counselor only)
export const addCounselorNotes = async (
  assessmentId: string,
  notes: string
): Promise<ApiResponse<{
  assessmentId: string;
  counselorNotes: string;
}>> => {
  try {
    const response = await apiClient.post<ApiResponse<{
      assessmentId: string;
      counselorNotes: string;
    }>>(
      `/api/assessments/results/${assessmentId}/counselor-notes`,
      { notes }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to add notes",
    };
  }
};


// Update user notes on assessment
export const updateAssessmentUserNotes = async (
  assessmentId: string,
  notes: string
): Promise<ApiResponse<{
  assessmentId: string;
  userNotes: string;
}>> => {
  try {
    const response = await apiClient.put<ApiResponse<{
      assessmentId: string;
      userNotes: string;
    }>>(
      `/api/assessments/results/${assessmentId}/notes`,
      { notes }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to update notes",
    };
  }
};

// Delete assessment (Soft delete)
export const deleteAssessment = async (
  assessmentId: string
): Promise<ApiResponse<void>> => {
  try {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/api/assessments/results/${assessmentId}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to delete assessment",
    };
  }
};