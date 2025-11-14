import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  Settings,
  LogOut,
  X,
  Heart,
  Activity,
  BookOpen,
  Home,
  MessageSquare,
  ShieldAlert,
  Mail,
  FileText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { logout } from "@/apis/auth";

export interface MenuItem {
  id: string;
  icon: LucideIcon;
  label: string;
  path: string;
}

interface SidebarProps {
  userType: "user" | "counselor" | "super_admin" | "guest";
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onLogout?: () => void;
}

const menuConfig: Record<
  "user" | "counselor" | "super_admin" | "guest",
  MenuItem[]
> = {
  user: [
    {
      id: "dashboard",
      icon: Home,
      label: "Dashboard",
      path: "/user/dashboard",
    },
    {
      id: "consultations",
      icon: Users,
      label: "Consultations",
      path: "/user/therapy",
    },
    {
      id: "appointments",
      icon: Calendar,
      label: "Appointments",
      path: "/user/appointment",
    },
    {
      id: "assessments",
      icon: FileText,
      label: "Assessments",
      path: "/user/assessments",
    },
    {
      id: "emergency",
      icon: ShieldAlert,
      label: "SOS Contacts",
      path: "/user/emergency-contacts",
    },
    {
      id: "resources",
      icon: BookOpen,
      label: "Resources",
      path: "/user/resources",
    },
    {
      id: "community",
      icon: MessageSquare,
      label: "Community",
      path: "/user/community",
    },
  ],
  guest: [
    {
      id: "dashboard",
      icon: Home,
      label: "Dashboard",
      path: "/user/dashboard",
    },
    {
      id: "resources",
      icon: BookOpen,
      label: "Resources",
      path: "/user/resources",
    },
    {
      id: "community",
      icon: MessageSquare,
      label: "Community",
      path: "/user/community",
    },
  ],
  counselor: [
    {
      id: "dashboard",
      icon: Home,
      label: "Dashboard",
      path: "/counselor/dashboard",
    },
    {
      id: "Profile",
      icon: Activity,
      label: "Profile",
      path: "/counselor/profile",
    },
    {
      id: "schedule",
      icon: Calendar,
      label: "Schedule",
      path: "/counselor/schedule",
    },
    {
      id: "appointments",
      icon: Calendar,
      label: "Appointments",
      path: "/counselor/appointments",
    },
    {
      id: "assessments",
      icon: FileText,
      label: "Assessments",
      path: "/counselor/assessments",
    },
    {
      id: "community",
      icon: MessageSquare,
      label: "Community",
      path: "/counselor/community",
    },
  ],
  super_admin: [
    {
      id: "dashboard",
      icon: Home,
      label: "Dashboard",
      path: "/admin/dashboard",
    },
    {
      id: "counselors",
      icon: Heart,
      label: "Counselors",
      path: "/admin/therapy-management",
    },
    {
      id: "users",
      icon: Users,
      label: "Users",
      path: "/admin/user-management",
    },
    {
      id: "assessments",
      icon: FileText,
      label: "Assessments",
      path: "/admin/assessments",
    },
    {
      id: "feedback",
      icon: BookOpen,
      label: "Feedbacks",
      path: "/admin/feedbacks",
    },
    {
      id: "contacts",
      icon: Mail,
      label: "Contacts",
      path: "/admin/contacts",
    },
    {
      id: "community",
      icon: MessageSquare,
      label: "Community",
      path: "/admin/community",
    },
  ],
};

const Sidebar: React.FC<SidebarProps> = ({
  userType,
  isMobileOpen,
  onCloseMobile,
  onLogout,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const menuItems = menuConfig[userType];

  const isActivePath = (path: string) => {
    // Special handling for assessments - make it active for both /user/assessments and /user/assessment-history
    if (path === '/user/assessments') {
      return location.pathname === '/user/assessments' || location.pathname === '/user/assessment-history';
    }
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 bg-opacity-50 z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 h-full bg-white shadow-lg z-50 transition-transform duration-300
        w-64 flex flex-col
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className="w-10 h-10">
              <img src="/herhaven.svg" alt="HerHaven Logo" />
            </div>
            <span className="text-2xl font-bold text-black">HerHaven</span>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-gray-600 hover:text-gray-800"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);

            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={onCloseMobile}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          {userType !== "guest" && (
            <Link
              to={`/${
                userType === "super_admin" ? "admin" : userType
              }/settings`}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </Link>
          )}
          <button
            onClick={() => {
              try {
                logout();
                if (onLogout) onLogout();
                navigate("/login");
              } catch {
                navigate("/login");
              }
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
