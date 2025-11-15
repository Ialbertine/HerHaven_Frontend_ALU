import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import {
  getUserById,
  updateUser,
  deleteUser,
  type User,
  type UpdateUserData,
} from "@/apis/admin";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Shield,
  UserCheck,
  Users,
  CheckCircle,
  XCircle,
  Edit,
  Save,
  X,
  Trash,
  AlertCircle,
} from "lucide-react";
import { useModal } from "@/contexts/useModal";

const ViewUser: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { showAlert, showDeleteConfirm } = useModal();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState<UpdateUserData>({
    email: "",
    username: "",
    role: "user",
    isActive: true,
    password: "",
  });

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchUser = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await getUserById(userId);

      if (response.success && response.data?.user) {
        setUser(response.data.user);
        setFormData({
          email: response.data.user.email,
          username: response.data.user.username,
          role: response.data.user.role,
          isActive: response.data.user.isActive,
          password: "",
        });
      } else {
        setError(response.message || "Failed to fetch user");
      }
    } catch (err) {
      setError("An error occurred while fetching user details");
      console.error("Failed to fetch user:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!userId) return;

    try {
      setUpdateLoading(true);
      setError(null);

      // Only include fields that have changed
      const updateData: UpdateUserData = {
        email: formData.email,
        username: formData.username,
        role: formData.role,
        isActive: formData.isActive,
      };

      // Only include password if it's been entered
      if (formData.password && formData.password.trim() !== "") {
        updateData.password = formData.password;
      }

      const response = await updateUser(userId, updateData);

      if (response.success) {
        showAlert(
          response.message || "User updated successfully!",
          "Success",
          "success"
        );
        setIsEditing(false);
        fetchUser(); // Refresh user data
      } else {
        showAlert(
          response.message || "Failed to update user",
          "Error",
          "danger"
        );
      }
    } catch (err) {
      showAlert("An error occurred while updating user", "Error", "danger");
      console.error("Failed to update user:", err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = () => {
    if (!userId || !user) return;

    showDeleteConfirm(
      `Are you sure you want to delete user "${user.email}"? This action cannot be undone.`,
      async () => {
        try {
          setDeleteLoading(true);
          setError(null);

          const response = await deleteUser(userId);

          if (response.success) {
            showAlert(
              response.message || "User deleted successfully",
              "Success",
              "success"
            );
            // Navigate back to user management after successful deletion
            setTimeout(() => {
              navigate("/admin/user-management");
            }, 1500);
          } else {
            showAlert(
              response.message || "Failed to delete user",
              "Error",
              "danger"
            );
          }
        } catch (err) {
          showAlert("An error occurred while deleting user", "Error", "danger");
          console.error("Failed to delete user:", err);
        } finally {
          setDeleteLoading(false);
        }
      }
    );
  };

  const handleCancelEdit = () => {
    if (user) {
      setFormData({
        email: user.email,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        password: "",
      });
    }
    setIsEditing(false);
  };

  const getRoleIcon = (role: string) => {
    const icons = {
      super_admin: Shield,
      counselor: UserCheck,
      user: Users,
    };
    return icons[role as keyof typeof icons] || Users;
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      super_admin: "bg-purple-100 text-purple-700 border-purple-200",
      counselor: "bg-blue-100 text-blue-700 border-blue-200",
      user: "bg-green-100 text-green-700 border-green-200",
    };

    const Icon = getRoleIcon(role);

    return (
      <span
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border ${styles[role as keyof typeof styles]
          }`}
      >
        <Icon className="w-4 h-4" />
        {role === "super_admin"
          ? "Super Admin"
          : role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border bg-green-100 text-green-700 border-green-200">
        <CheckCircle className="w-4 h-4" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border bg-red-100 text-red-700 border-red-200">
        <XCircle className="w-4 h-4" />
        Inactive
      </span>
    );
  };

  if (loading) {
    return (
      <DashboardLayout userType="super_admin" userName="Admin">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading user details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !user) {
    return (
      <DashboardLayout userType="super_admin" userName="Admin">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/admin/user-management")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to User Management
          </button>

          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-700 mb-2">
              Error Loading User
            </h2>
            <p className="text-red-600 mb-4">
              {error || "User not found or an error occurred"}
            </p>
            <button
              onClick={() => navigate("/admin/user-management")}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Return to User Management
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="super_admin" userName="Admin">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/admin/user-management")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to User Management
          </button>

          <div className="flex items-center gap-3">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#9c27b0] to-[#7b2cbf] text-white rounded-lg hover:from-[#7b1fa2] hover:to-[#8e24aa] transition-all shadow-md"
                >
                  <Edit className="w-4 h-4" />
                  Edit User
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Trash className="w-4 h-4" />
                  )}
                  Delete User
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleCancelEdit}
                  disabled={updateLoading}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={updateLoading || !formData.email || !formData.username}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>

        {/* User Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-[#9c27b0] to-[#7b2cbf] px-8 py-12">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center font-bold text-4xl shadow-lg" style={{ color: '#9c27b0' }}>
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-bold mb-2">{user.username}</h1>
                <p className="text-purple-100 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-8">
            {!isEditing ? (
              // View Mode
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Role
                    </label>
                    {getRoleBadge(user.role)}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Account Status
                    </label>
                    {getStatusBadge(user.isActive)}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Created Date
                    </label>
                    {user.createdAt && (
                      <div className="flex items-center gap-2 text-gray-800">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <span className="font-medium">
                          {new Date(user.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Last Updated
                    </label>
                    {user.updatedAt && (
                      <div className="flex items-center gap-2 text-gray-800">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <span className="font-medium">
                          {new Date(user.updatedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    User ID
                  </label>
                  <div className="bg-gray-50 rounded-lg px-4 py-3">
                    <code className="text-sm font-mono text-gray-700">
                      {user._id}
                    </code>
                  </div>
                </div>
              </div>
            ) : (
              // Edit Mode
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      disabled={updateLoading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      disabled={updateLoading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="johndoe"
                    />
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
                          role: e.target.value as
                            | "user"
                            | "counselor"
                            | "super_admin",
                        })
                      }
                      disabled={updateLoading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="user">User</option>
                      <option value="counselor">Counselor</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password (optional)
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      disabled={updateLoading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Leave blank to keep current password"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave blank to keep the current password
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    disabled={updateLoading}
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 disabled:cursor-not-allowed"
                  />
                  <label
                    htmlFor="isActive"
                    className="text-sm font-medium text-gray-700"
                  >
                    Active Account - User can access the platform
                  </label>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">Important Notes:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>
                          Changing the email will affect the user's login
                          credentials
                        </li>
                        <li>
                          Deactivating an account will prevent the user from
                          accessing the platform
                        </li>
                        <li>Password changes are optional during updates</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ViewUser;

