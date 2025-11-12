import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getAllContactMessages, type ContactMessage } from "@/apis/contact";
import {
  Mail,
  Phone,
  CheckCircle,
  MessageSquare,
  Filter,
  Search,
  RefreshCw,
  User,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Archive,
  AlertCircle,
} from "lucide-react";

interface ContactFilters {
  status: string;
}

interface ContactStats {
  total: number;
  new: number;
  resolved: number;
  archived: number;
}

const ContactManagement: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState<ContactStats>({
    total: 0,
    new: 0,
    resolved: 0,
    archived: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<ContactFilters>({
    status: "all",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "new", label: "New" },
    { value: "resolved", label: "Resolved" },
    { value: "archived", label: "Archived" },
  ];

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: {
        status?: "new" | "resolved" | "archived";
        search?: string;
        page?: number;
        limit?: number;
        sortField?: string;
        sortOrder?: "asc" | "desc";
      } = {
        page: currentPage,
        limit: 20,
        sortField: "createdAt",
        sortOrder: "desc",
      };

      if (filters.status !== "all") {
        params.status = filters.status as "new" | "resolved" | "archived";
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await getAllContactMessages(params);

      if (response.success && response.data) {
        setMessages(response.data.messages);
        setTotalPages(response.data.pagination.pages);
        setTotalItems(response.data.pagination.total);

        // Calculate stats from all messages
        const allStats = response.data.messages.reduce(
          (acc, msg) => {
            acc.total++;
            if (msg.status === "new") acc.new++;
            if (msg.status === "resolved") acc.resolved++;
            if (msg.status === "archived") acc.archived++;
            return acc;
          },
          {
            total: 0,
            new: 0,
            resolved: 0,
            archived: 0,
          }
        );

        setStats(allStats);
      } else {
        setError(response.message || "Failed to load contact messages");
      }
    } catch (err) {
      setError("An error occurred while loading contact messages");
      console.error("Error loading contact messages:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm, currentPage]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters, searchTerm]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <AlertCircle className="w-4 h-4" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4" />;
      case "archived":
        return <Archive className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DashboardLayout userType="super_admin" userName="Admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Contact Messages
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Manage and respond to user inquiries
            </p>
          </div>
          <button
            onClick={() => loadMessages()}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors w-full sm:w-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Total Messages
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">New</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.new}</p>
              </div>
              <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  {stats.resolved}
                </p>
              </div>
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Archived</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-600">
                  {stats.archived}
                </p>
              </div>
              <Archive className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone, or message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""
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
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => {
                      setFilters((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }));
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Messages List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {messages.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No contact messages found matching your criteria.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {messages.map((message) => (
                    <div
                      key={message._id}
                      className="p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col gap-4">
                        <div className="flex-1">
                          {/* Header with Name and Status */}
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="font-semibold text-sm sm:text-base text-gray-900">
                                {message.firstName} {message.lastName}
                              </span>
                            </div>
                            <div
                              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                message.status
                              )}`}
                            >
                              {getStatusIcon(message.status)}
                              <span className="capitalize">
                                {message.status.replace("-", " ")}
                              </span>
                            </div>
                          </div>

                          {/* Contact Information */}
                          <div className="space-y-2 mb-3">
                            <div className="flex items-center gap-2">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <a
                                href={`mailto:${message.email}`}
                                className="text-xs sm:text-sm text-blue-600 hover:underline"
                              >
                                {message.email}
                              </a>
                            </div>
                            {message.phoneNumber && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-3 h-3 text-gray-400" />
                                <a
                                  href={`tel:${message.phoneNumber}`}
                                  className="text-xs sm:text-sm text-gray-600 hover:text-gray-900"
                                >
                                  {message.phoneNumber}
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Message Content */}
                          <div className="mb-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {message.message}
                            </p>
                          </div>

                          {/* Timestamp */}
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>
                              Received: {formatDate(message.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {messages.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} messages
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-2 text-sm rounded-lg transition-colors ${currentPage === pageNum
                              ? 'bg-purple-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ContactManagement;
