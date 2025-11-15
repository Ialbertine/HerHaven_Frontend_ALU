import {
  getPublicTemplates,
  submitAssessment,
  submitAnonymousAssessment,
  getAssessmentBySession,
  type AssessmentTemplate,
} from '../apis/assessment';

// Check if user is authenticated
export const isUserAuthenticated = (): boolean => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return !!token;
};

export const getPublicAssessmentTemplates = async (category?: string) => {
  return await getPublicTemplates({
    category: category as 'depression' | 'anxiety' | 'ptsd' | 'safety' | 'wellness' | 'general' | undefined,
  });
};

export const smartSubmitAssessment = async (data: {
  templateId: string;
  responses: Array<{
    questionId: string;
    answer: string | number | (string | number)[];
  }>;
  shareWithCounselor?: boolean;
  counselorId?: string;
  userNotes?: string;
}) => {
  const isAuthenticated = isUserAuthenticated();

  if (isAuthenticated) {
    return await submitAssessment(data);
  } else {
    return await submitAnonymousAssessment({
      templateId: data.templateId,
      responses: data.responses,
      userNotes: data.userNotes,
    });
  }
};

// Save session ID to localStorage for anonymous users so they can retrieve their results later
export const saveAnonymousSessionId = (sessionId: string): void => {
  const existingSessions = getAnonymousSessionIds();
  existingSessions.push({
    sessionId,
    timestamp: new Date().toISOString(),
  });
  
  const recentSessions = existingSessions.slice(-5);
  localStorage.setItem('anonymousAssessments', JSON.stringify(recentSessions));
};

export const getAnonymousSessionIds = (): Array<{ sessionId: string; timestamp: string }> => {
  const stored = localStorage.getItem('anonymousAssessments');
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const retrieveAnonymousAssessment = async (sessionId: string) => {
  return await getAssessmentBySession(sessionId);
};

export const clearAnonymousSessionIds = (): void => {
  localStorage.removeItem('anonymousAssessments');
};

export const getCategoryInfo = (category: string): {
  name: string;
  icon: string;
  color: string;
  description: string;
} => {
  const categories: Record<string, { name: string; icon: string; color: string; description: string }> = {
    depression: {
      name: 'Depression',
      icon: '',
      color: '#4A5568',
      description: 'Assess your mood and emotional well-being',
    },
    anxiety: {
      name: 'Anxiety',
      icon: '',
      color: '#ED8936',
      description: 'Evaluate anxiety levels and stress responses',
    },
    ptsd: {
      name: 'PTSD',
      icon: '',
      color: '#9F7AEA',
      description: 'Screen for post-traumatic stress symptoms',
    },
    safety: {
      name: 'Safety',
      icon: '',
      color: '#E53E3E',
      description: 'Assess immediate safety and crisis needs',
    },
    wellness: {
      name: 'Wellness',
      icon: '',
      color: '#38B2AC',
      description: 'Evaluate overall mental wellness',
    },
    general: {
      name: 'General',
      icon: '',
      color: '#4299E1',
      description: 'General mental health screening',
    },
  };

  return categories[category] || categories.general;
};

export const getSeverityInfo = (
  severityLevel: string | undefined | null,
  template?: { scoringRules?: { severityLevels?: Array<{ name: string; color?: string; range: { min: number; max: number } }> } } | null
): {
  color: string;
  bgColor: string;
  label: string;
  icon: string;
} => {
  const defaultSeverity = {
    color: '#6B7280',
    bgColor: '#F9FAFB',
    label: 'Unknown',
    icon: '?',
  };

  if (!severityLevel || typeof severityLevel !== 'string') {
    return defaultSeverity;
  }

  if (template?.scoringRules?.severityLevels && template.scoringRules.severityLevels.length > 0) {
    const templateSeverity = template.scoringRules.severityLevels.find(
      level => level.name.toLowerCase().trim() === severityLevel.toLowerCase().trim()
    );

    if (templateSeverity) {
      const templateColor = templateSeverity.color || '#6B7280';
      const hexToRgba = (hex: string, alpha: number) => {
        try {
          let cleanHex = hex.replace('#', '').trim();
          if (cleanHex.length === 3) {
            cleanHex = cleanHex.split('').map(char => char + char).join('');
          }
          if (cleanHex.length !== 6) {
            return `rgba(107, 114, 128, ${alpha})`;
          }
          const r = parseInt(cleanHex.slice(0, 2), 16);
          const g = parseInt(cleanHex.slice(2, 4), 16);
          const b = parseInt(cleanHex.slice(4, 6), 16);
          if (isNaN(r) || isNaN(g) || isNaN(b)) {
            return `rgba(107, 114, 128, ${alpha})`;
          }
          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } catch {
          return `rgba(107, 114, 128, ${alpha})`;
        }
      };
      const bgColor = hexToRgba(templateColor, 0.1);
      
      return {
        color: templateColor,
        bgColor: bgColor,
        label: templateSeverity.name,
        icon: '•',
      };
    }
  }

  const normalizedLevel = severityLevel.toLowerCase().replace(/\s+/g, '-');
  
  const severityMap: Record<string, { color: string; bgColor: string; label: string; icon: string }> = {
    'doing-well': {
      color: '#22C55E',
      bgColor: '#F0FDF4',
      label: 'Doing Well',
      icon: '✓',
    },
    'some-challenges': {
      color: '#EAB308',
      bgColor: '#FEFCE8',
      label: 'Some Challenges',
      icon: '~',
    },
    'significant-challenges': {
      color: '#F97316',
      bgColor: '#FFF7ED',
      label: 'Significant Challenges',
      icon: '!',
    },
    'very-difficult-time': {
      color: '#EF4444',
      bgColor: '#FEF2F2',
      label: 'Very Difficult Time',
      icon: '!!',
    },
    'intense-struggle': {
      color: '#991B1B',
      bgColor: '#FEE2E2',
      label: 'Intense Struggle',
      icon: '!!!',
    },
    'feeling-calm': {
      color: '#22C55E',
      bgColor: '#F0FDF4',
      label: 'Feeling Calm',
      icon: '✓',
    },
    'some-worry': {
      color: '#EAB308',
      bgColor: '#FEFCE8',
      label: 'Some Worry',
      icon: '~',
    },
    'notable-worry': {
      color: '#F97316',
      bgColor: '#FFF7ED',
      label: 'Notable Worry',
      icon: '!',
    },
    'overwhelming-feelings': {
      color: '#EF4444',
      bgColor: '#FEF2F2',
      label: 'Overwhelming Feelings',
      icon: '!!!',
    },
    'need-extra-care': {
      color: '#EF4444',
      bgColor: '#FEF2F2',
      label: 'Need Extra Care',
      icon: '!!',
    },
    'getting-by': {
      color: '#EAB308',
      bgColor: '#FEFCE8',
      label: 'Getting By',
      icon: '~',
    },
    'managing-well': {
      color: '#22C55E',
      bgColor: '#F0FDF4',
      label: 'Managing Well',
      icon: '✓',
    },
    'some-difficulties': {
      color: '#EAB308',
      bgColor: '#FEFCE8',
      label: 'Some Difficulties',
      icon: '~',
    },
    'significant-impact': {
      color: '#EF4444',
      bgColor: '#FEF2F2',
      label: 'Significant Impact',
      icon: '!!!',
    },
  };

  return severityMap[normalizedLevel] || defaultSeverity;
};

export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds} seconds`;
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (remainingSeconds === 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  
  return `${minutes}m ${remainingSeconds}s`;
};

export const calculateCompletionPercentage = (
  answeredQuestions: number,
  totalQuestions: number
): number => {
  if (totalQuestions === 0) return 0;
  return Math.round((answeredQuestions / totalQuestions) * 100);
};

export const validateResponses = (
  template: AssessmentTemplate,
  responses: Array<{ questionId: string; answer: string | number | (string | number)[] }>
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const requiredQuestions = template.questions.filter(q => q.isRequired);
  
  requiredQuestions.forEach(question => {
    const response = responses.find(r => r.questionId === question.questionId);
    
    if (!response || response.answer === undefined || response.answer === null || response.answer === '') {
      errors.push(`Question "${question.text}" is required`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const sortTemplates = (
  templates: AssessmentTemplate[],
  sortBy: 'category' | 'name' | 'recent' = 'category'
): AssessmentTemplate[] => {
  const sorted = [...templates];
  
  switch (sortBy) {
    case 'category':
      return sorted.sort((a, b) => {
        if (a.category === b.category) {
          return a.name.localeCompare(b.name);
        }
        return a.category.localeCompare(b.category);
      });
    
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    
    case 'recent':
      return sorted.sort((a, b) => {
        const dateA = a.lastUsed ? new Date(a.lastUsed).getTime() : 0;
        const dateB = b.lastUsed ? new Date(b.lastUsed).getTime() : 0;
        return dateB - dateA;
      });
    
    default:
      return sorted;
  }
};

export const groupTemplatesByCategory = (
  templates: AssessmentTemplate[]
): Record<string, AssessmentTemplate[]> => {
  return templates.reduce((acc, template) => {
    const category = template.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {} as Record<string, AssessmentTemplate[]>);
};

export const isCrisisResult = (severityLevel: string | undefined | null, isCrisis: boolean): boolean => {
  if (isCrisis) return true;
  if (!severityLevel || typeof severityLevel !== 'string') return false;
  return severityLevel.toLowerCase() === 'severe';
};

export interface CrisisResource {
  name: string;
  phone: string;
  description: string;
  available: string;
}

export const getCrisisResources = (): CrisisResource[] => {
  return [
    {
      name: '988 Suicide & Crisis Lifeline',
      phone: '988',
      description: 'Free and confidential support for people in distress, 24/7',
      available: 'Available 24/7',
    },
    {
      name: 'Crisis Text Line',
      phone: 'Text HOME to 741741',
      description: 'Free, 24/7 crisis support via text message',
      available: 'Available 24/7',
    },
    {
      name: 'SAMHSA National Helpline',
      phone: '1-800-662-4357',
      description: 'Treatment referral and information service',
      available: 'Available 24/7',
    },
  ];
};

export const formatAssessmentDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};