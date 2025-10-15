import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Calendar,
  MessageCircle,
  Users,
  Settings,
  LogOut,
  X,
  Heart,
  Activity,
  BookOpen,
  Home,
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
  userType: "user" | "counselor" | "admin";
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onLogout?: () => void;
}

const menuConfig: Record<"user" | "counselor" | "admin", MenuItem[]> = {
  user: [
    {
      id: "dashboard",
      icon: Home,
      label: "Dashboard",
      path: "/user/dashboard",
    },
    {
      id: "consultations",
      icon: Calendar,
      label: "Consultations",
      path: "/user/therapy",
    },
    {
      id: "appointments",
      icon: MessageCircle,
      label: "Support",
      path: "/user/appointment",
    },
    {
      id: "resources",
      icon: BookOpen,
      label: "Resources",
      path: "/user/resources",
    },
    {
      id: "community",
      icon: Users,
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
      id: "overview",
      icon: Activity,
      label: "Overview",
      path: "/counselor/overview",
    },
    {
      id: "clients",
      icon: Users,
      label: "My Clients",
      path: "/counselor/clients",
    },
    {
      id: "schedule",
      icon: Calendar,
      label: "Schedule",
      path: "/counselor/schedule",
    },
    {
      id: "sessions",
      icon: MessageCircle,
      label: "Sessions",
      path: "/counselor/sessions",
    },
  ],
  admin: [
    {
      id: "dashboard",
      icon: Home,
      label: "Dashboard",
      path: "/admin/dashboard",
    },
    { id: "users", icon: Users, label: "Users", path: "/admin/users" },
    {
      id: "counselors",
      icon: Heart,
      label: "Counselors",
      path: "/admin/therapy-management",
    },
    {
      id: "analytics",
      icon: BarChart3,
      label: "Analytics",
      path: "/admin/analytics",
    },
   {
      id: "content",
      icon: Users,
      label: "Content",
      path: "/admin/content",
   }
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
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
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
          <Link
            to={`/${userType}/settings`}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </Link>
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
