import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import UserModal from "./UserModal";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  type User,
  type UserFilters,
  type CreateUserData,
  type UpdateUserData,
} from "@/apis/admin";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Mail,
  Calendar,
  Eye,
  Edit,
  Trash,
  Shield,
  UserCheck,
  CheckCircle,
  XCircle,
  ChevronDown,
} from "lucide-react";
import { useModal } from "@/contexts/useModal";

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const { showAlert, showDeleteConfirm } = useModal();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<UserFilters>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAllUsers(filters);

      if (response.success && response.data) {
        console.log("Fetched users:", response.data.users);
        console.log(
          "User roles:",
          response.data.users.map((u) => ({
            username: u.username,
            role: u.role,
          }))
        );
        setUsers(response.data.users);
      } else {
        setError(response.message || "Failed to fetch users");
      }
    } catch (err) {
      setError("Failed to fetch users");
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, searchTerm, filters]);

  const handleCreateUser = async (data: CreateUserData | UpdateUserData) => {
    try {
      setModalLoading(true);
      setError(null);

      // Convert super_admin to admin for backend compatibility
      const backendData = {
        ...data,
        role: data.role === "super_admin" ? "admin" : data.role,
      } as CreateUserData;

      const response = await createUser(backendData);

      if (response.success) {
        showAlert(
          response.message || "User created successfully!",
          "Success",
          "success"
        );
        setIsModalOpen(false);
        fetchUsers();
      } else {
        showAlert(
          response.message || "Failed to create user",
          "Error",
          "danger"
        );
      }
    } catch (err) {
      showAlert("Failed to create user", "Error", "danger");
      console.error("Failed to create user:", err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateUser = async (data: CreateUserData | UpdateUserData) => {
    if (!selectedUser) return;

    try {
      setModalLoading(true);
      setError(null);

      const response = await updateUser(
        selectedUser._id,
        data as UpdateUserData
      );

      if (response.success) {
        showAlert(
          response.message || "User updated successfully!",
          "Success",
          "success"
        );
        setIsModalOpen(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        showAlert(
          response.message || "Failed to update user",
          "Error",
          "danger"
        );
      }
    } catch (err) {
      showAlert("Failed to update user", "Error", "danger");
      console.error("Failed to update user:", err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (userId: string, userEmail: string) => {
    showDeleteConfirm(
      `Are you sure you want to delete user "${userEmail}"? This action cannot be undone.`,
      async () => {
        try {
          setActionLoading(userId);
          setError(null);

          const response = await deleteUser(userId);

          if (response.success) {
            showAlert(
              response.message || "User deleted successfully",
              "Success",
              "success"
            );
            fetchUsers();
          } else {
            showAlert(
              response.message || "Failed to delete user",
              "Error",
              "danger"
            );
          }
        } catch (err) {
          showAlert("Failed to delete user", "Error", "danger");
          console.error("Failed to delete user:", err);
        } finally {
          setActionLoading(null);
        }
      }
    );
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleView = (userId: string) => {
    navigate(`/admin/users/${userId}`);
  };

  const openCreateModal = () => {
    setSelectedUser(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      super_admin: "bg-purple-100 text-purple-700 border-purple-200",
      counselor: "bg-blue-100 text-blue-700 border-blue-200",
      user: "bg-green-100 text-green-700 border-green-200",
    };

    const icons = {
      super_admin: Shield,
      counselor: UserCheck,
      user: Users,
    };

    const Icon = icons[role as keyof typeof icons];

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
          styles[role as keyof typeof styles]
        }`}
      >
        <Icon className="w-3 h-3" />
        {role === "super_admin"
          ? "Super Admin"
          : role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border bg-green-100 text-green-700 border-green-200">
        <CheckCircle className="w-3 h-3" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border bg-red-100 text-red-700 border-red-200">
        <XCircle className="w-3 h-3" />
        Inactive
      </span>
    );
  };

  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
  };

  return (
    <DashboardLayout userType="super_admin" userName="Admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              User Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and monitor all users on the platform
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#9c27b0] to-[#7b2cbf] text-white rounded-xl hover:from-[#7b1fa2] hover:to-[#8e24aa] transition-all shadow-lg hover:shadow-xl"
          >
            <UserPlus className="w-5 h-5" />
            Create User
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="flex gap-4 max-w-2xl">
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-purple-500 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Users</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {stats.total}
                </p>
              </div>
              <Users className="w-10 h-10 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-green-500 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Active</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {stats.active}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by email or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={filters.role || "all"}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFilters((prev) => ({
                        ...prev,
                        role:
                          value === "all"
                            ? undefined
                            : (value as "user" | "counselor" | "super_admin"),
                      }));
                      fetchUsers();
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Roles</option>
                    <option value="user">User</option>
                    <option value="counselor">Counselor</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={
                      filters.isActive === undefined
                        ? "all"
                        : filters.isActive
                        ? "active"
                        : "inactive"
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      setFilters((prev) => ({
                        ...prev,
                        isActive:
                          value === "all" ? undefined : value === "active",
                      }));
                      fetchUsers();
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                        Loading users...
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-base flex-shrink-0" style={{ background: 'linear-gradient(to right, #9c27b0, #7b2cbf)' }}>
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 text-base">
                              {user.username}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                      <td className="px-6 py-4">
                        {getStatusBadge(user.isActive)}
                      </td>
                      <td className="px-6 py-4">
                        {user.createdAt && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {actionLoading === user._id ? (
                            <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <button
                                onClick={() => handleView(user._id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View"
                              >
                                <Eye className="w-5 h-5" />
                              </button>

                              <button
                                onClick={() => handleEdit(user)}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-5 h-5" />
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(user._id, user.email)
                                }
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={modalMode === "create" ? handleCreateUser : handleUpdateUser}
        isLoading={modalLoading}
        user={selectedUser}
        mode={modalMode}
      />
    </DashboardLayout>
  );
};

export default UserManagement;
