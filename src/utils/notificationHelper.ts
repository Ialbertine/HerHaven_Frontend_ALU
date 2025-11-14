/**
 * Notification Helper Utilities
 * 
 * This file contains helper functions for managing assessment-related notifications
 */

import { getUnreadNotificationCount } from '@/apis/notification';

/**
 * Refresh notification count after assessment submission
 * This should be called after an assessment is successfully submitted
 * to ensure the notification badge updates immediately
 */
export const refreshNotificationCount = async (): Promise<number> => {
  try {
    const response = await getUnreadNotificationCount();
    if (response.success && response.data) {
      return response.data.unreadCount;
    }
    return 0;
  } catch (error) {
    console.error('Failed to refresh notification count:', error);
    return 0;
  }
};

/**
 * Custom event for notifying components about new notifications
 */
export const NOTIFICATION_EVENT = 'herhaven:notification-update';

/**
 * Dispatch notification update event
 * This will trigger notification bell to update across the app
 */
export const dispatchNotificationUpdate = (unreadCount?: number) => {
  window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT, { 
    detail: { unreadCount } 
  }));
};

/**
 * Listen for notification updates
 * Use this in components that need to respond to notification changes
 */
export const addNotificationListener = (callback: (unreadCount: number) => void) => {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent;
    callback(customEvent.detail?.unreadCount || 0);
  };
  
  window.addEventListener(NOTIFICATION_EVENT, handler);
  
  // Return cleanup function
  return () => window.removeEventListener(NOTIFICATION_EVENT, handler);
};

/**
 * Get notification display text for assessment types
 */
export const getAssessmentNotificationText = (type: string, isCrisis: boolean) => {
  if (isCrisis) {
    return {
      title: "We're Here for You",
      message: "Your assessment indicates you may need immediate support. Please review your results and consider reaching out for help.",
      priority: 'high' as const
    };
  }

  switch (type) {
    case 'assessment_completed':
      return {
        title: "Assessment Complete",
        message: "Your mental health assessment has been completed. View your results and personalized recommendations.",
        priority: 'medium' as const
      };
    case 'assessment_shared':
      return {
        title: "Assessment Shared",
        message: "Your assessment has been shared with your counselor.",
        priority: 'medium' as const
      };
    case 'assessment_crisis_shared':
      return {
        title: "Urgent: Assessment Shared",
        message: "Your counselor has been notified about your assessment results and will reach out shortly.",
        priority: 'high' as const
      };
    default:
      return {
        title: "New Notification",
        message: "You have a new notification about your assessment.",
        priority: 'medium' as const
      };
  }
};

/**
 * Show a browser notification (if permissions granted)
 */
export const showBrowserNotification = async (title: string, body: string, isCrisis = false) => {
  // Check if notifications are supported
  if (!('Notification' in window)) {
    return;
  }

  // Request permission if not already granted
  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }

  // Show notification if permission granted
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: '/logo.png', // Update with your logo path
      badge: '/logo.png',
      tag: 'assessment-notification',
      requireInteraction: isCrisis, // Keep crisis notifications on screen
    });

    // Auto-close after 5 seconds (except for crisis)
    if (!isCrisis) {
      setTimeout(() => notification.close(), 5000);
    }
  }
};

export default {
  refreshNotificationCount,
  dispatchNotificationUpdate,
  addNotificationListener,
  getAssessmentNotificationText,
  showBrowserNotification,
};

