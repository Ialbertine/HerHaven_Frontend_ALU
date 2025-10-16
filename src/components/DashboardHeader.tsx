import React from "react";
import { Bell, Menu } from "lucide-react";

interface DashboardHeaderProps {
  userName: string;
  onMenuToggle: () => void;
  userType?: "user" | "counselor" | "super_admin";
  notificationCount?: number;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userName,
  onMenuToggle,
  userType = "user",
}) => {
  const roleLabel =
    userType === "super_admin"
      ? "Administrator"
      : userType === "counselor"
      ? "Counselor"
      : "User";
  return (
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
        <div className="relative">
          <button
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all"
            aria-label="Notifications"
          >
            <Bell className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
