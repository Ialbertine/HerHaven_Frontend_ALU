import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import apiClient from "@/apis/axiosConfig";
import { AxiosError } from "axios";
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Eye,
  Edit,
  Trash,
  BarChart3,
  Activity,
  TrendingUp,
} from "lucide-react";
import { useModal } from "@/contexts/useModal";
import type { AssessmentTemplate } from "@/apis/assessment";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

const AssessmentManagement: React.FC = () => {
  const navigate = useNavigate();
  const { showAlert, showConfirm, showDeleteConfirm } = useModal();
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<AssessmentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  const filterTemplates = useCallback(() => {
    let filtered = [...templates];

    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((t) => t.category === categoryFilter);
    }

    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        filtered = filtered.filter((t) => t.isActive && t.isPublished);
      } else if (statusFilter === "inactive") {
        filtered = filtered.filter((t) => !t.isActive);
      } else if (statusFilter === "draft") {
        filtered = filtered.filter((t) => !t.isPublished);
      }
    }

    setFilteredTemplates(filtered);
  }, [templates, searchTerm, categoryFilter, statusFilter]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [filterTemplates]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<
        ApiResponse<{ templates: AssessmentTemplate[]; count: number }>
      >("/api/assessments/templates");

      if (response.data.success && response.data.data) {
        setTemplates(response.data.data.templates);
      } else {
        setError(response.data.message || "Failed to fetch assessment templates");
      }
    } catch (err) {
      const axiosError = err as AxiosError<ApiResponse<unknown>>;
      setError(
        axiosError.response?.data?.message || "Failed to fetch assessment templates"
      );
      console.error("Failed to fetch templates:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (templateId: string, currentStatus: boolean) => {
    const action = currentStatus ? "deactivate" : "activate";
    showConfirm(
      `Are you sure you want to ${action} this assessment template?`,
      async () => {
        try {
          setActionLoading(templateId);
          setError(null);

          const response = await apiClient.patch<
            ApiResponse<{ template: AssessmentTemplate }>
          >(`/api/assessments/templates/${templateId}`, {
            isActive: !currentStatus,
          });

          if (response.data.success) {
            showAlert(
              response.data.message || `Assessment ${action}d successfully!`,
              "Success",
              "success"
            );
            fetchTemplates();
          } else {
            showAlert(
              response.data.message || `Failed to ${action} assessment`,
              "Error",
              "danger"
            );
          }
        } catch (err) {
          const axiosError = err as AxiosError<ApiResponse<unknown>>;
          showAlert(
            axiosError.response?.data?.message || `Failed to ${action} assessment`,
            "Error",
            "danger"
          );
          console.error(`Failed to ${action} template:`, err);
        } finally {
          setActionLoading(null);
        }
      },
      `${action.charAt(0).toUpperCase() + action.slice(1)} Assessment`,
      currentStatus ? "warning" : "success"
    );
  };

  const handleTogglePublish = async (templateId: string, currentStatus: boolean) => {
    const action = currentStatus ? "unpublish" : "publish";
    showConfirm(
      `Are you sure you want to ${action} this assessment template?`,
      async () => {
        try {
          setActionLoading(templateId);
          setError(null);

          const response = await apiClient.patch<
            ApiResponse<{ template: AssessmentTemplate }>
          >(`/api/assessments/templates/${templateId}`, {
            isPublished: !currentStatus,
          });

          if (response.data.success) {
            showAlert(
              response.data.message || `Assessment ${action}ed successfully!`,
              "Success",
              "success"
            );
            fetchTemplates();
          } else {
            showAlert(
              response.data.message || `Failed to ${action} assessment`,
              "Error",
              "danger"
            );
          }
        } catch (err) {
          const axiosError = err as AxiosError<ApiResponse<unknown>>;
          showAlert(
            axiosError.response?.data?.message || `Failed to ${action} assessment`,
            "Error",
            "danger"
          );
          console.error(`Failed to ${action} template:`, err);
        } finally {
          setActionLoading(null);
        }
      },
      `${action.charAt(0).toUpperCase() + action.slice(1)} Assessment`,
      "warning"
    );
  };

  const handleView = (templateId: string) => {
    window.open(`/admin/assessments/${templateId}`, "_blank");
  };

  const handleEdit = (templateId: string) => {
    navigate(`/admin/assessments/${templateId}/edit`);
  };

  const handleDelete = async (templateId: string) => {
    showDeleteConfirm(
      "Are you sure you want to delete this assessment template? This action cannot be undone.",
      async () => {
        try {
          setActionLoading(templateId);
          setError(null);

          const response = await apiClient.delete<ApiResponse<unknown>>(
            `/api/assessments/templates/${templateId}`
          );

          if (response.data.success) {
            showAlert(
              response.data.message || "Assessment template deleted",
              "Success",
              "success"
            );
            fetchTemplates();
          } else {
            showAlert(
              response.data.message || "Failed to delete assessment template",
              "Error",
              "danger"
            );
          }
        } catch (err) {
          const axiosError = err as AxiosError<ApiResponse<unknown>>;
          showAlert(
            axiosError.response?.data?.message || "Failed to delete assessment template",
            "Error",
            "danger"
          );
          console.error("Failed to delete template:", err);
        } finally {
          setActionLoading(null);
        }
      }
    );
  };

  const getCategoryBadge = (category: string) => {
    const styles: Record<string, string> = {
      depression: "bg-blue-100 text-blue-700 border-blue-200",
      anxiety: "bg-yellow-100 text-yellow-700 border-yellow-200",
      ptsd: "bg-red-100 text-red-700 border-red-200",
      safety: "bg-orange-100 text-orange-700 border-orange-200",
      wellness: "bg-green-100 text-green-700 border-green-200",
      general: "bg-gray-100 text-gray-700 border-gray-200",
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
          styles[category] || styles.general
        }`}
      >
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </span>
    );
  };

  const getStatusBadge = (template: AssessmentTemplate) => {
    if (!template.isPublished) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border bg-gray-100 text-gray-700 border-gray-200">
          <Clock className="w-3 h-3" />
          Draft
        </span>
      );
    }
    if (!template.isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border bg-red-100 text-red-700 border-red-200">
          <XCircle className="w-3 h-3" />
          Inactive
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border bg-green-100 text-green-700 border-green-200">
        <CheckCircle className="w-3 h-3" />
        Active
      </span>
    );
  };

  const stats = {
    total: templates.length,
    active: templates.filter((t) => t.isActive && t.isPublished).length,
    draft: templates.filter((t) => !t.isPublished).length,
    totalResponses: templates.reduce((sum, t) => sum + (t.totalResponses || 0), 0),
  };

  return (
    <DashboardLayout userType="super_admin" userName="Admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Assessment Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and monitor all mental health assessment templates
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/assessments/create")}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#9c27b0] to-[#7b2cbf] text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Create Assessment
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
                  Total Templates
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {stats.total}
                </p>
              </div>
              <FileText className="w-10 h-10 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-green-500">
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
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Drafts</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {stats.draft}
                </p>
              </div>
              <Clock className="w-10 h-10 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Responses</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {stats.totalResponses}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-500" />
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
                placeholder="Search assessments by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Categories</option>
                <option value="depression">Depression</option>
                <option value="anxiety">Anxiety</option>
                <option value="ptsd">PTSD</option>
                <option value="safety">Safety</option>
                <option value="wellness">Wellness</option>
                <option value="general">General</option>
              </select>
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
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
                    Assessment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Questions
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Responses
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Last Used
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
                      colSpan={8}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                        Loading assessment templates...
                      </div>
                    </td>
                  </tr>
                ) : filteredTemplates.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No assessment templates found
                    </td>
                  </tr>
                ) : (
                  filteredTemplates.map((template) => (
                    <tr
                      key={template._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-800 text-base">
                            {template.name}
                          </p>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                            {template.description}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            v{template.version}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getCategoryBadge(template.category)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {template.questions.length}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          ~{template.estimatedDuration} min
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {template.totalResponses || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(template)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {template.lastUsed
                            ? new Date(template.lastUsed).toLocaleDateString()
                            : "Never"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {actionLoading === template._id ? (
                            <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              {template.isPublished && (
                                <button
                                  onClick={() =>
                                    handleToggleActive(
                                      template._id,
                                      template.isActive
                                    )
                                  }
                                  className={`p-2 rounded-lg transition-colors ${
                                    template.isActive
                                      ? "text-orange-600 hover:bg-orange-50"
                                      : "text-green-600 hover:bg-green-50"
                                  }`}
                                  title={
                                    template.isActive ? "Deactivate" : "Activate"
                                  }
                                >
                                  {template.isActive ? (
                                    <XCircle className="w-5 h-5" />
                                  ) : (
                                    <CheckCircle className="w-5 h-5" />
                                  )}
                                </button>
                              )}
                              <button
                                onClick={() =>
                                  handleTogglePublish(
                                    template._id,
                                    template.isPublished
                                  )
                                }
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title={
                                  template.isPublished ? "Unpublish" : "Publish"
                                }
                              >
                                <Clock className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleView(template._id)}
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title="View"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleEdit(template._id)}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(template._id)}
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
    </DashboardLayout>
  );
};

export default AssessmentManagement;

