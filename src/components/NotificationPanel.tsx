import { useState, useEffect, useRef, useCallback } from "react";
import {
  Bell,
  BellRing,
  Calendar,
  CalendarPlus,
  CheckCircle,
  XCircle,
  Video,
  CheckSquare,
  CreditCard,
  AlertCircle,
  UserCheck,
  UserX,
  CalendarX,
  X
} from "lucide-react";
import {
  getUserNotifications,
  markNotificationAsRead,
  formatNotificationTime,
  type Notification
} from "@/apis/notification";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationCountChange?: (count: number) => void;
}

const NotificationPanel = ({ isOpen, onClose, onNotificationCountChange }: NotificationPanelProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getUserNotifications({ limit: 50 });
      if (response.success && response.data) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
        onNotificationCountChange?.(response.data.unreadCount);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [onNotificationCountChange]);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, loadNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.readAt) {
      try {
        const response = await markNotificationAsRead(notification._id);
        if (response.success) {
          setNotifications(prev =>
            prev.map(n =>
              n._id === notification._id
                ? { ...n, status: 'read' as const, readAt: response.data?.readAt }
                : n
            )
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
          onNotificationCountChange?.(Math.max(0, unreadCount - 1));
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
  };

  const getIcon = (type: Notification['type']) => {
    const iconClass = "w-5 h-5";
    const icons = {
      appointment_booked: <CalendarPlus className={iconClass} />,
      appointment_confirmed: <CheckCircle className={iconClass} />,
      appointment_rejected: <XCircle className={iconClass} />,
      appointment_cancelled: <CalendarX className={iconClass} />,
      appointment_reminder_24h: <Bell className={iconClass} />,
      appointment_reminder_1h: <BellRing className={iconClass} />,
      session_starting: <Video className={iconClass} />,
      session_completed: <CheckSquare className={iconClass} />,
      payment_success: <CreditCard className={iconClass} />,
      payment_failed: <AlertCircle className={iconClass} />,
      counselor_approved: <UserCheck className={iconClass} />,
      counselor_rejected: <UserX className={iconClass} />
    };
    return icons[type] || <Bell className={iconClass} />;
  };

  const getColorClasses = (type: Notification['type']) => {
    const colorMap: Record<Notification['type'], { bg: string; text: string; border: string }> = {
      appointment_booked: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
      appointment_confirmed: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
      appointment_rejected: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
      appointment_cancelled: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
      appointment_reminder_24h: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
      appointment_reminder_1h: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
      session_starting: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
      session_completed: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
      payment_success: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
      payment_failed: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
      counselor_approved: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
      counselor_rejected: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' }
    };
    return colorMap[type] || { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:relative lg:inset-auto">
      <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

      <div
        ref={panelRef}
        className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl lg:absolute lg:right-0 lg:top-2 lg:h-auto lg:max-h-[600px] lg:rounded-xl overflow-hidden animate-in slide-in-from-right lg:slide-in-from-top"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 sticky top-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">Notifications</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded-lg transition-colors"
              aria-label="Close notifications"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {unreadCount > 0 && (
            <div className="mt-2">
              <span className="text-purple-100 text-sm">
                {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
              </span>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-[calc(100vh-100px)] lg:max-h-[500px]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2 font-medium">No notifications yet</p>
              <p className="text-sm text-gray-400">
                We'll notify you when something important happens
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => {
                const colors = getColorClasses(notification.type);
                const isUnread = !notification.readAt;

                return (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-all ${isUnread ? 'bg-purple-50 border-l-4 border-purple-600' : ''
                      }`}
                  >
                    <div className="flex gap-3">
                      <div className={`${colors.bg} ${colors.text} p-2.5 rounded-lg h-fit border ${colors.border}`}>
                        {getIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className={`font-semibold text-gray-800 text-sm ${isUnread ? 'font-bold' : ''}`}>
                            {notification.title}
                          </h3>
                          {isUnread && (
                            <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0 mt-1.5"></div>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>

                        {notification.appointment && (
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2 bg-gray-50 px-2 py-1 rounded">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {new Date(notification.appointment.appointmentDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })} at {notification.appointment.appointmentTime}
                            </span>
                          </div>
                        )}

                        {notification.counselor && (
                          <div className="text-xs text-gray-500 mb-2">
                            <span className="font-medium">{notification.counselor.firstName} {notification.counselor.lastName}</span>
                            {notification.counselor.specialization && (
                              <span> • {notification.counselor.specialization}</span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">
                            {formatNotificationTime(notification.createdAt)}
                          </span>

                          {notification.priority === 'urgent' && (
                            <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-medium">
                              Urgent
                            </span>
                          )}
                          {notification.priority === 'high' && (
                            <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs font-medium">
                              High
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;