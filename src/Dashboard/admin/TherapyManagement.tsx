import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import apiClient from "@/apis/axiosConfig";
import { AxiosError } from "axios";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Award,
  Calendar,
  UserX,
  UserCheck,
  Eye,
  Edit,
  Trash,
} from "lucide-react";
import { useModal } from "@/contexts/useModal";

interface Counselor {
  _id: string;
  email: string;
  username?: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  licenseNumber?: string;
  specialization?: string | string[];
  experience?: number;
  bio?: string;
  verificationStatus: "pending" | "approved" | "rejected" | "invited";
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  invitedAt?: string;
  adminApprovedAt?: string;
  adminApprovedBy?: {
    username: string;
    email: string;
  };
  rejectionReason?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    email: string;
    firstName: string;
    lastName: string;
  }) => void;
  isLoading: boolean;
}

const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (email && firstName && lastName) {
      onSubmit({ email, firstName, lastName });
    }
  };

  return (
    <div className="fixed inset-0  bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Invite Counselor
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="counselor@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="John"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Doe"
            />
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
              disabled={isLoading || !email || !firstName || !lastName}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Sending..." : "Send Invite"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TherapyManagement: React.FC = () => {
  const { showAlert, showConfirm, showDeleteConfirm } = useModal();
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [filteredCounselors, setFilteredCounselors] = useState<Counselor[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCounselors();
  }, []);

  useEffect(() => {
    filterCounselors();
  });

  const fetchCounselors = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<
        ApiResponse<{ counselors: Counselor[]; count: number }>
      >("/api/admin/counselors");

      if (response.data.success && response.data.data) {
        setCounselors(response.data.data.counselors);
      } else {
        setError(response.data.message || "Failed to fetch counselors");
      }
    } catch (err) {
      const axiosError = err as AxiosError<ApiResponse<unknown>>;
      setError(
        axiosError.response?.data?.message || "Failed to fetch counselors"
      );
      console.error("Failed to fetch counselors:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterCounselors = () => {
    let filtered = [...counselors];

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.verificationStatus === statusFilter);
    }

    setFilteredCounselors(filtered);
  };

  const handleInvite = async (data: {
    email: string;
    firstName: string;
    lastName: string;
  }) => {
    try {
      setInviteLoading(true);
      setError(null);

      const response = await apiClient.post<
        ApiResponse<{ counselor: Counselor }>
      >("/api/admin/counselors/invite", data);

      if (response.data.success) {
        showAlert(response.data.message || "Invitation sent successfully!", "Success", "success");
        setIsInviteModalOpen(false);
        fetchCounselors();
      } else {
        showAlert(response.data.message || "Failed to send invitation", "Error", "danger");
      }
    } catch (err) {
      const axiosError = err as AxiosError<ApiResponse<unknown>>;
      const errorMsg =
        axiosError.response?.data?.message || "Failed to send invitation";
      showAlert(errorMsg, "Error", "danger");
      console.error("Failed to invite counselor:", err);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleApprove = async (counselorId: string) => {
    showConfirm(
      "Are you sure you want to approve this counselor?",
      async () => {
        try {
          setActionLoading(counselorId);
          setError(null);

          const response = await apiClient.put<
            ApiResponse<{ counselor: Counselor }>
          >(`/api/admin/counselors/${counselorId}/approve`);

          if (response.data.success) {
            showAlert(response.data.message || "Counselor approved successfully!", "Success", "success");
            fetchCounselors();
          } else {
            showAlert(response.data.message || "Failed to approve counselor", "Error", "danger");
          }
        } catch (err) {
          const axiosError = err as AxiosError<ApiResponse<unknown>>;
          showAlert(
            axiosError.response?.data?.message || "Failed to approve counselor",
            "Error",
            "danger"
          );
          console.error("Failed to approve counselor:", err);
        } finally {
          setActionLoading(null);
        }
      },
      "Approve Counselor",
      "success"
    );
  };

  const handleReject = async (counselorId: string) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (!reason) return;

    try {
      setActionLoading(counselorId);
      setError(null);

      const response = await apiClient.put<
        ApiResponse<{ counselor: Counselor }>
      >(`/api/admin/counselors/${counselorId}/reject`, {
        rejectionReason: reason,
      });

      if (response.data.success) {
        showAlert(response.data.message || "Counselor rejected", "Success", "success");
        fetchCounselors();
      } else {
        showAlert(response.data.message || "Failed to reject counselor", "Error", "danger");
      }
    } catch (err) {
      const axiosError = err as AxiosError<ApiResponse<unknown>>;
      showAlert(axiosError.response?.data?.message || "Failed to reject counselor", "Error", "danger");
      console.error("Failed to reject counselor:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivate = async (counselorId: string) => {
    showConfirm(
      "Are you sure you want to deactivate this counselor?",
      async () => {

        try {
          setActionLoading(counselorId);
          setError(null);

          const response = await apiClient.put<
            ApiResponse<{ counselor: Counselor }>
          >(`/api/admin/counselors/${counselorId}/deactivate`);

          if (response.data.success) {
            showAlert(response.data.message || "Counselor deactivated", "Success", "success");
            fetchCounselors();
          } else {
            showAlert(response.data.message || "Failed to deactivate counselor", "Error", "danger");
          }
        } catch (err) {
          const axiosError = err as AxiosError<ApiResponse<unknown>>;
          showAlert(
            axiosError.response?.data?.message || "Failed to deactivate counselor",
            "Error",
            "danger"
          );
          console.error("Failed to deactivate counselor:", err);
        } finally {
          setActionLoading(null);
        }
      },
      "Deactivate Counselor",
      "warning"
    );
  };

  const handleView = (counselorId: string) => {
    window.open(`/admin/counselors/${counselorId}`, "_blank");
  };

  const handleEdit = (counselorId: string) => {
    // Navigate to edit page (adjust route as needed)
    window.location.href = `/admin/counselors/${counselorId}/edit`;
  };

  const handleDelete = async (counselorId: string) => {
    showDeleteConfirm(
      "Are you sure you want to delete this counselor? This action cannot be undone.",
      async () => {

        try {
          setActionLoading(counselorId);
          setError(null);

          const response = await apiClient.delete<ApiResponse<unknown>>(
            `/api/admin/counselors/${counselorId}`
          );

          if (response.data.success) {
            showAlert(response.data.message || "Counselor deleted", "Success", "success");
            fetchCounselors();
          } else {
            showAlert(response.data.message || "Failed to delete counselor", "Error", "danger");
          }
        } catch (err) {
          const axiosError = err as AxiosError<ApiResponse<unknown>>;
          showAlert(axiosError.response?.data?.message || "Failed to delete counselor", "Error", "danger");
          console.error("Failed to delete counselor:", err);
        } finally {
          setActionLoading(null);
        }
      }
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      approved: "bg-green-100 text-green-700 border-green-200",
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      rejected: "bg-red-100 text-red-700 border-red-200",
      invited: "bg-blue-100 text-blue-700 border-blue-200",
    };

    const icons = {
      approved: CheckCircle,
      pending: Clock,
      rejected: XCircle,
      invited: Mail,
    };

    const Icon = icons[status as keyof typeof icons];

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${styles[status as keyof typeof styles]
          }`}
      >
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };


  const normalizeSpecialization = (
    spec: string | string[] | undefined
  ): string[] => {
    if (!spec) return [];
    if (Array.isArray(spec))
      return spec.filter(Boolean).map((s) => String(s).trim());
    // spec is a string
    return spec
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const stats = {
    total: counselors.length,
    approved: counselors.filter((c) => c.verificationStatus === "approved")
      .length,
    pending: counselors.filter((c) => c.verificationStatus === "pending")
      .length,
    invited: counselors.filter((c) => c.verificationStatus === "invited")
      .length,
  };

  return (
    <DashboardLayout
      userType="super_admin"
      userName="Admin"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Counselor Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and monitor all counselors on the platform
            </p>
          </div>
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#9c27b0] to-[#7b2cbf] text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
          >
            <UserPlus className="w-5 h-5" />
            Invite Counselor
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Total Counselors
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {stats.total}
                </p>
              </div>
              <Users className="w-10 h-10 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Approved</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {stats.approved}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Pending</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {stats.pending}
                </p>
              </div>
              <Clock className="w-10 h-10 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Invited</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {stats.invited}
                </p>
              </div>
              <Mail className="w-10 h-10 text-blue-500" />
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
                placeholder="Search by name, email, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="invited">Invited</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Counselor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Specialization
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date
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
                      colSpan={7}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                        Loading counselors...
                      </div>
                    </td>
                  </tr>
                ) : filteredCounselors.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No counselors found
                    </td>
                  </tr>
                ) : (
                  filteredCounselors.map((counselor) => (
                    <tr
                      key={counselor._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-[#9c27b0] to-[#7b2cbf] rounded-full flex items-center justify-center text-white font-semibold text-base flex-shrink-0">
                            {counselor.firstName?.charAt(0)}
                            {counselor.lastName?.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 text-base whitespace-nowrap">
                              {counselor.firstName} {counselor.lastName}
                            </p>
                            <p className="text-sm text-gray-500 whitespace-nowrap">
                              @{counselor.username || "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            {counselor.email}
                          </div>
                          {counselor.phoneNumber && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4" />
                              {counselor.phoneNumber}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        {(() => {
                          const specs = normalizeSpecialization(
                            counselor.specialization
                          );

                          return specs.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {specs
                                .slice(0, 2)
                                .map((spec: string, i: number) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                                  >
                                    {spec}
                                  </span>
                                ))}
                              {specs.length > 2 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                  +{specs.length - 2}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">
                              Not specified
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {counselor.experience
                              ? `${counselor.experience} years`
                              : "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(counselor.verificationStatus)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(counselor.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {actionLoading === counselor._id ? (
                            <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              {counselor.verificationStatus === "pending" && (
                                <>
                                  <button
                                    onClick={() => handleApprove(counselor._id)}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Approve"
                                  >
                                    <UserCheck className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => handleReject(counselor._id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Reject"
                                  >
                                    <UserX className="w-5 h-5" />
                                  </button>
                                </>
                              )}
                              {counselor.verificationStatus === "approved" &&
                                counselor.isActive && (
                                  <button
                                    onClick={() =>
                                      handleDeactivate(counselor._id)
                                    }
                                    className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                    title="Deactivate"
                                  >
                                    <UserX className="w-5 h-5" />
                                  </button>
                                )}
                              <button
                                onClick={() => handleView(counselor._id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View"
                              >
                                <Eye className="w-5 h-5" />
                              </button>

                              <button
                                onClick={() => handleEdit(counselor._id)}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-5 h-5" />
                              </button>

                              <button
                                onClick={() => handleDelete(counselor._id)}
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

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSubmit={handleInvite}
        isLoading={inviteLoading}
      />
    </DashboardLayout>
  );
};

export default TherapyManagement;
