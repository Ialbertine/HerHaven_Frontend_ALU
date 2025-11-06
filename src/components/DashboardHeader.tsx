import React, { useState, useEffect } from "react";
import { Bell, Menu } from "lucide-react";
import NotificationPanel from "./NotificationPanel";
import LanguageSwitcher from "./LanguageSwitcher";
import { getUnreadNotificationCount } from "@/apis/notification";

interface DashboardHeaderProps {
  userName: string;
  onMenuToggle: () => void;
  userType?: "user" | "counselor" | "super_admin" | "guest";
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userName,
  onMenuToggle,
  userType = "user",
}) => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  useEffect(() => {
    // Skip notification loading for guests
    if (userType !== "guest") {
      loadUnreadCount();

      const interval = setInterval(() => {
        loadUnreadCount();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [userType]);

  const loadUnreadCount = async () => {
    try {
      const response = await getUnreadNotificationCount();
      if (response.success && response.data) {
        setNotificationCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  };

  const handleNotificationCountChange = (count: number) => {
    setNotificationCount(count);
  };

  const roleLabel =
    userType === "super_admin"
      ? "Administrator"
      : userType === "counselor"
      ? "Counselor"
      : userType === "guest"
      ? "Guest"
      : "User";

  return (
    <>
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition-all"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{userName}</h1>
            <p className="text-gray-600 text-sm">
              {roleLabel}, we're glad you're here.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Hide notifications for guests */}
          {userType !== "guest" && (
            <div className="relative">
              <button
                onClick={() =>
                  setIsNotificationPanelOpen(!isNotificationPanelOpen)
                }
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all relative"
                aria-label="Notifications"
              >
                <Bell className="w-6 h-6" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </button>

              <NotificationPanel
                isOpen={isNotificationPanelOpen}
                onClose={() => setIsNotificationPanelOpen(false)}
                onNotificationCountChange={handleNotificationCountChange}
              />
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default DashboardHeader;
