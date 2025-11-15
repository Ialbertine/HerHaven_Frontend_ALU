import React, { useState, useEffect } from "react";
import {
  type User,
  type CreateUserData,
  type UpdateUserData,
} from "@/apis/admin";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserData | UpdateUserData) => void;
  isLoading: boolean;
  user?: User | null;
  mode: "create" | "edit";
}

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  user,
  mode,
}) => {
  const [formData, setFormData] = useState<CreateUserData>({
    email: "",
    password: "",
    username: "",
    role: "user",
    isActive: true,
  });

  useEffect(() => {
    if (mode === "edit" && user) {
      setFormData({
        email: user.email,
        password: "",
        username: user.username,
        role: user.role,
        isActive: user.isActive,
      });
    } else {
      setFormData({
        email: "",
        password: "",
        username: "",
        role: "user",
        isActive: true,
      });
    }
  }, [mode, user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (mode === "create") {
      if (formData.email && formData.password && formData.username) {
        onSubmit(formData);
      }
    } else {
      // For edit mode, password is optional
      const updateData: UpdateUserData = {
        email: formData.email,
        username: formData.username,
        role: formData.role,
        isActive: formData.isActive,
      };
      if (formData.password) {
        updateData.password = formData.password;
      }
      onSubmit(updateData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {mode === "create" ? "Create New User" : "Edit User"}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username *
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="johndoe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password {mode === "edit" && "(leave blank to keep current)"}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter password"
            />
            {mode === "create" && (
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 6 characters with uppercase, lowercase, and
                numbers
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role *
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value as "user" | "counselor" | "super_admin",
                })
              }
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="user">User</option>
              <option value="counselor">Counselor</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              disabled={isLoading}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 disabled:cursor-not-allowed"
            />
            <label
              htmlFor="isActive"
              className="text-sm font-medium text-gray-700"
            >
              Active Account
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                isLoading ||
                !formData.email ||
                !formData.username ||
                (mode === "create" && !formData.password)
              }
              className="flex-1 px-4 py-2 bg-gradient-to-r from-[#9c27b0] to-[#7b2cbf] text-white rounded-lg hover:from-[#7b1fa2] hover:to-[#8e24aa] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? mode === "create"
                  ? "Creating..."
                  : "Updating..."
                : mode === "create"
                ? "Create User"
                : "Update User"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
