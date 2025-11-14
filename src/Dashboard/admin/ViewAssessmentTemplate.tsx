import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import {
  ArrowLeft,
  Edit,
  FileText,
  Clock,
  BarChart3,
  CheckCircle,
  XCircle,
  Activity,
  Calendar,
  AlertTriangle,
  Globe,
  TrendingUp,
  Save,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import { useModal } from "@/contexts/useModal";
import {
  getAssessmentTemplateById,
  deleteAssessmentTemplate,
  updateAssessmentTemplate,
  type AssessmentTemplate,
  type AssessmentQuestion,
} from "@/apis/assessment";

const ViewAssessmentTemplate: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { showAlert, showDeleteConfirm } = useModal();
  const [template, setTemplate] = useState<AssessmentTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTemplate, setEditedTemplate] = useState<Partial<AssessmentTemplate> | null>(null);

  const fetchTemplate = useCallback(async () => {
    if (!templateId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await getAssessmentTemplateById(templateId);

      if (response.success && response.data) {
        setTemplate(response.data.template);
        setEditedTemplate(null);
      } else {
        setError(response.message || "Failed to fetch assessment template");
      }
    } catch (err) {
      setError("Failed to fetch assessment template");
      console.error("Failed to fetch template:", err);
    } finally {
      setLoading(false);
    }
  }, [templateId]);

  useEffect(() => {
    if (templateId) {
      fetchTemplate();
    }
  }, [templateId, fetchTemplate]);

  const handleEdit = () => {
    if (!template) return;
    setIsEditing(true);
    setEditedTemplate({
      name: template.name,
      description: template.description,
      estimatedDuration: template.estimatedDuration,
      isActive: template.isActive,
      isPublished: template.isPublished,
      questions: JSON.parse(JSON.stringify(template.questions)),
      scoringRules: JSON.parse(JSON.stringify(template.scoringRules)),
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedTemplate(null);
  };

  // Clean the data before sending to API
  //  these fields category, version, and language are immutable fields and should not be updated
  const cleanTemplateData = (data: Partial<AssessmentTemplate>): Partial<AssessmentTemplate> => {
    const cleaned: Partial<AssessmentTemplate> = {};

    // Only include editable fields
    if (data.name !== undefined) cleaned.name = data.name;
    if (data.description !== undefined) cleaned.description = data.description;
    if (data.estimatedDuration !== undefined) cleaned.estimatedDuration = data.estimatedDuration;
    if (data.isActive !== undefined) cleaned.isActive = data.isActive;
    if (data.isPublished !== undefined) cleaned.isPublished = data.isPublished;

    // Clean questions
    if (data.questions) {
      cleaned.questions = data.questions.map((question) => {
        const cleanedQuestion: AssessmentQuestion = {
          questionId: question.questionId,
          text: question.text,
          type: question.type,
          order: question.order,
        };

        // Add optional fields only if they exist
        if (question.isRequired !== undefined) {
          cleanedQuestion.isRequired = question.isRequired;
        }
        if (question.isCrisisIndicator !== undefined) {
          cleanedQuestion.isCrisisIndicator = question.isCrisisIndicator;
        }
        if (question.crisisThreshold !== undefined) {
          cleanedQuestion.crisisThreshold = question.crisisThreshold;
        }

        // Clean options
        if (question.options && question.options.length > 0) {
          cleanedQuestion.options = question.options.map((option) => ({
            value: option.value,
            label: option.label,
          }));
        }

        return cleanedQuestion;
      });
    }

    // Clean scoring
    if (data.scoringRules) {
      cleaned.scoringRules = {
        maxScore: data.scoringRules.maxScore,
        severityLevels: data.scoringRules.severityLevels.map((level) => {
          const cleanedLevel: {
            name: string;
            range: { min: number; max: number };
            color?: string;
            recommendations?: string[];
          } = {
            name: level.name,
            range: {
              min: level.range.min,
              max: level.range.max,
            },
          };

          if (level.color) {
            cleanedLevel.color = level.color;
          }
          if (level.recommendations && level.recommendations.length > 0) {
            cleanedLevel.recommendations = [...level.recommendations];
          }

          return cleanedLevel;
        }),
      };
    }

    return cleaned;
  };

  const handleSave = async () => {
    if (!template || !editedTemplate || !templateId) return;

    try {
      setActionLoading(true);

      // Clean the data before sending to API
      const cleanedData = cleanTemplateData(editedTemplate);

      const response = await updateAssessmentTemplate(templateId, cleanedData);

      if (response.success && response.data) {
        setIsEditing(false);
        setEditedTemplate(null);
        showAlert(
          response.message || "Assessment template updated successfully",
          "Success",
          "success"
        );

        await fetchTemplate();
      } else {
        showAlert(
          response.message || "Failed to update assessment template",
          "Error",
          "danger"
        );
      }
    } catch (err) {
      showAlert("Failed to update assessment template", "Error", "danger");
      console.error("Failed to update template:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!template) return;

    showDeleteConfirm(
      "Are you sure you want to delete this assessment template? This action cannot be undone.",
      async () => {
        try {
          setActionLoading(true);

          const response = await deleteAssessmentTemplate(template._id);

          if (response.success) {
            showAlert(
              response.message || "Assessment template deleted successfully",
              "Success",
              "success"
            );
            navigate("/admin/assessments");
          } else {
            showAlert(
              response.message || "Failed to delete assessment template",
              "Error",
              "danger"
            );
          }
        } catch (err) {
          showAlert("Failed to delete assessment template", "Error", "danger");
          console.error("Failed to delete template:", err);
        } finally {
          setActionLoading(false);
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
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${styles[category] || styles.general
          }`}
      >
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </span>
    );
  };

  const getQuestionTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      "single-choice": "bg-blue-50 text-blue-700 border-blue-200",
      "multiple-choice": "bg-purple-50 text-purple-700 border-purple-200",
      scale: "bg-green-50 text-green-700 border-green-200",
      text: "bg-gray-50 text-gray-700 border-gray-200",
    };

    const labels: Record<string, string> = {
      "single-choice": "Single Choice",
      "multiple-choice": "Multiple Choice",
      scale: "Scale",
      text: "Text",
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${styles[type] || styles.text
          }`}
      >
        {labels[type] || type}
      </span>
    );
  };

  if (loading) {
    return (
      <DashboardLayout userType="super_admin" userName="Admin">
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600 text-lg">
              Loading assessment template...
            </span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !template) {
    return (
      <DashboardLayout userType="super_admin" userName="Admin">
        <div className="space-y-6">
          <button
            onClick={() => navigate("/admin/assessments")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Assessments
          </button>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error || "Assessment template not found"}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="super_admin" userName="Admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => navigate("/admin/assessments")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isEditing}
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              {isEditing && editedTemplate ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editedTemplate.name || ""}
                    onChange={(e) =>
                      setEditedTemplate({ ...editedTemplate, name: e.target.value })
                    }
                    className="text-2xl font-bold text-gray-800 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Assessment Name"
                  />
                  <textarea
                    value={editedTemplate.description || ""}
                    onChange={(e) =>
                      setEditedTemplate({
                        ...editedTemplate,
                        description: e.target.value,
                      })
                    }
                    className="text-gray-600 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    placeholder="Description"
                    rows={2}
                  />
                </div>
              ) : (
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {template.name}
                  </h1>
                  <p className="text-gray-600 mt-1">{template.description}</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleEdit}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Questions</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {isEditing && editedTemplate?.questions
                    ? editedTemplate.questions.length
                    : template.questions.length}
                </p>
              </div>
              <FileText className="w-10 h-10 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Duration</p>
                {isEditing && editedTemplate ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      value={editedTemplate.estimatedDuration || 0}
                      onChange={(e) =>
                        setEditedTemplate({
                          ...editedTemplate,
                          estimatedDuration: parseInt(e.target.value) || 0,
                        })
                      }
                      className="text-2xl font-bold text-gray-800 w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                    <span className="text-sm text-gray-500">min</span>
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-gray-800 mt-1">
                    {template.estimatedDuration}
                    <span className="text-sm text-gray-500 ml-1">min</span>
                  </p>
                )}
              </div>
              <Clock className="w-10 h-10 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Responses</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {template.totalResponses || 0}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Max Score</p>
                {isEditing && editedTemplate?.scoringRules ? (
                  <input
                    type="number"
                    value={editedTemplate.scoringRules.maxScore || 0}
                    onChange={(e) =>
                      setEditedTemplate({
                        ...editedTemplate,
                        scoringRules: {
                          ...editedTemplate.scoringRules!,
                          maxScore: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="text-2xl font-bold text-gray-800 w-24 px-2 py-1 border border-gray-300 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    min="1"
                  />
                ) : (
                  <p className="text-3xl font-bold text-gray-800 mt-1">
                    {template.scoringRules.maxScore}
                  </p>
                )}
              </div>
              <BarChart3 className="w-10 h-10 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Template Details */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Template Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-600">
                Category
                {isEditing && (
                  <span className="ml-2 text-xs text-gray-500">(Cannot be changed)</span>
                )}
              </label>
              <div className="mt-2">{getCategoryBadge(template.category)}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Version
              </label>
              <p className="mt-2 text-gray-800">v{template.version}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Language
              </label>
              <div className="flex items-center gap-2 mt-2">
                <Globe className="w-4 h-4 text-gray-400" />
                <span className="text-gray-800">
                  {template.language.toUpperCase()}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Status
              </label>
              {isEditing && editedTemplate ? (
                <div className="mt-2 space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editedTemplate.isPublished || false}
                      onChange={(e) =>
                        setEditedTemplate({
                          ...editedTemplate,
                          isPublished: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Published</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editedTemplate.isActive || false}
                      onChange={(e) =>
                        setEditedTemplate({
                          ...editedTemplate,
                          isActive: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-2">
                  {template.isPublished ? (
                    template.isActive ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border bg-green-100 text-green-700 border-green-200">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border bg-red-100 text-red-700 border-red-200">
                        <XCircle className="w-3 h-3" />
                        Inactive
                      </span>
                    )
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border bg-gray-100 text-gray-700 border-gray-200">
                      <Clock className="w-3 h-3" />
                      Draft
                    </span>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Created At
              </label>
              <div className="flex items-center gap-2 mt-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-800">
                  {new Date(template.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Last Updated
              </label>
              <div className="flex items-center gap-2 mt-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-800">
                  {new Date(template.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
            {template.lastUsed && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-600">
                  Last Used
                </label>
                <div className="flex items-center gap-2 mt-2">
                  <Activity className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-800">
                    {new Date(template.lastUsed).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Scoring Rules */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Scoring Rules
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">
                Maximum Score
              </label>
              {isEditing && editedTemplate?.scoringRules ? (
                <input
                  type="number"
                  value={editedTemplate.scoringRules.maxScore || 0}
                  onChange={(e) =>
                    setEditedTemplate({
                      ...editedTemplate,
                      scoringRules: {
                        ...editedTemplate.scoringRules!,
                        maxScore: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  className="text-2xl font-bold text-gray-800 w-32 px-3 py-2 border border-gray-300 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                />
              ) : (
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {template.scoringRules.maxScore}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-3 block">
                Severity Levels
              </label>
              <div className="space-y-3">
                {(isEditing && editedTemplate?.scoringRules
                  ? editedTemplate.scoringRules.severityLevels
                  : template.scoringRules.severityLevels
                ).map((level, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-4 bg-gray-50 rounded-lg gap-4"
                  >
                    <div className="flex-1">
                      {isEditing && editedTemplate?.scoringRules ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={level.color || "#6b7280"}
                              onChange={(e) => {
                                const updatedLevels = [
                                  ...editedTemplate.scoringRules!.severityLevels,
                                ];
                                updatedLevels[index] = {
                                  ...updatedLevels[index],
                                  color: e.target.value,
                                };
                                setEditedTemplate({
                                  ...editedTemplate,
                                  scoringRules: {
                                    ...editedTemplate.scoringRules!,
                                    severityLevels: updatedLevels,
                                  },
                                });
                              }}
                              className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={level.name}
                              onChange={(e) => {
                                const updatedLevels = [
                                  ...editedTemplate.scoringRules!.severityLevels,
                                ];
                                updatedLevels[index] = {
                                  ...updatedLevels[index],
                                  name: e.target.value,
                                };
                                setEditedTemplate({
                                  ...editedTemplate,
                                  scoringRules: {
                                    ...editedTemplate.scoringRules!,
                                    severityLevels: updatedLevels,
                                  },
                                });
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                              placeholder="Level Name"
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="text-sm text-gray-600 whitespace-nowrap">
                              Min:
                            </label>
                            <input
                              type="number"
                              value={level.range.min}
                              onChange={(e) => {
                                const updatedLevels = [
                                  ...editedTemplate.scoringRules!.severityLevels,
                                ];
                                updatedLevels[index] = {
                                  ...updatedLevels[index],
                                  range: {
                                    ...updatedLevels[index].range,
                                    min: parseInt(e.target.value) || 0,
                                  },
                                };
                                setEditedTemplate({
                                  ...editedTemplate,
                                  scoringRules: {
                                    ...editedTemplate.scoringRules!,
                                    severityLevels: updatedLevels,
                                  },
                                });
                              }}
                              className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <label className="text-sm text-gray-600 whitespace-nowrap">
                              Max:
                            </label>
                            <input
                              type="number"
                              value={level.range.max}
                              onChange={(e) => {
                                const updatedLevels = [
                                  ...editedTemplate.scoringRules!.severityLevels,
                                ];
                                updatedLevels[index] = {
                                  ...updatedLevels[index],
                                  range: {
                                    ...updatedLevels[index].range,
                                    max: parseInt(e.target.value) || 0,
                                  },
                                };
                                setEditedTemplate({
                                  ...editedTemplate,
                                  scoringRules: {
                                    ...editedTemplate.scoringRules!,
                                    severityLevels: updatedLevels,
                                  },
                                });
                              }}
                              className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-600 block mb-1">
                              Recommendations (one per line):
                            </label>
                            <textarea
                              value={
                                level.recommendations
                                  ? level.recommendations.join("\n")
                                  : ""
                              }
                              onChange={(e) => {
                                const updatedLevels = [
                                  ...editedTemplate.scoringRules!.severityLevels,
                                ];
                                updatedLevels[index] = {
                                  ...updatedLevels[index],
                                  recommendations: e.target.value
                                    .split("\n")
                                    .filter((line) => line.trim() !== ""),
                                };
                                setEditedTemplate({
                                  ...editedTemplate,
                                  scoringRules: {
                                    ...editedTemplate.scoringRules!,
                                    severityLevels: updatedLevels,
                                  },
                                });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm"
                              rows={3}
                              placeholder="Enter recommendations, one per line"
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: level.color || "#6b7280",
                              }}
                            ></span>
                            <span className="font-semibold text-gray-800">
                              {level.name}
                            </span>
                          </div>
                          {level.recommendations &&
                            level.recommendations.length > 0 && (
                              <ul className="mt-2 ml-6 space-y-1">
                                {level.recommendations.map((rec, recIndex) => (
                                  <li
                                    key={recIndex}
                                    className="text-sm text-gray-600"
                                  >
                                    • {rec}
                                  </li>
                                ))}
                              </ul>
                            )}
                        </>
                      )}
                    </div>
                    {!isEditing && (
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-600">
                          Score Range
                        </span>
                        <p className="text-lg font-bold text-gray-800">
                          {level.range.min} - {level.range.max}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Questions (
            {isEditing && editedTemplate?.questions
              ? editedTemplate.questions.length
              : template.questions.length}
            )
          </h2>
          <div className="space-y-4">
            {(isEditing && editedTemplate?.questions
              ? editedTemplate.questions
              : template.questions
            )
              .sort((a, b) => a.order - b.order)
              .map((question, index) => (
                <div
                  key={question.questionId}
                  className="p-5 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {isEditing && editedTemplate?.questions ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="flex items-center justify-center w-7 h-7 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                              {index + 1}
                            </span>
                            <select
                              value={question.type}
                              onChange={(e) => {
                                const updatedQuestions = [
                                  ...editedTemplate.questions!,
                                ];
                                updatedQuestions[index] = {
                                  ...updatedQuestions[index],
                                  type: e.target.value as AssessmentQuestion["type"],
                                };
                                setEditedTemplate({
                                  ...editedTemplate,
                                  questions: updatedQuestions,
                                });
                              }}
                              className="px-2 py-1 border border-gray-300 rounded text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="single-choice">Single Choice</option>
                              <option value="multiple-choice">Multiple Choice</option>
                              <option value="scale">Scale</option>
                              <option value="text">Text</option>
                            </select>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={question.isRequired || false}
                                onChange={(e) => {
                                  const updatedQuestions = [
                                    ...editedTemplate.questions!,
                                  ];
                                  updatedQuestions[index] = {
                                    ...updatedQuestions[index],
                                    isRequired: e.target.checked,
                                  };
                                  setEditedTemplate({
                                    ...editedTemplate,
                                    questions: updatedQuestions,
                                  });
                                }}
                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                              />
                              <span className="text-xs text-red-600 font-medium">
                                Required
                              </span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={question.isCrisisIndicator || false}
                                onChange={(e) => {
                                  const updatedQuestions = [
                                    ...editedTemplate.questions!,
                                  ];
                                  updatedQuestions[index] = {
                                    ...updatedQuestions[index],
                                    isCrisisIndicator: e.target.checked,
                                  };
                                  setEditedTemplate({
                                    ...editedTemplate,
                                    questions: updatedQuestions,
                                  });
                                }}
                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                              />
                              <span className="text-xs text-red-600 font-medium">
                                Crisis Indicator
                              </span>
                            </label>
                          </div>
                          <textarea
                            value={question.text}
                            onChange={(e) => {
                              const updatedQuestions = [
                                ...editedTemplate.questions!,
                              ];
                              updatedQuestions[index] = {
                                ...updatedQuestions[index],
                                text: e.target.value,
                              };
                              setEditedTemplate({
                                ...editedTemplate,
                                questions: updatedQuestions,
                              });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 font-medium resize-none"
                            rows={2}
                            placeholder="Question text"
                          />
                          {(question.type === "single-choice" ||
                            question.type === "multiple-choice" ||
                            question.type === "scale") && (
                              <div className="ml-10 space-y-2">
                                <label className="text-sm font-medium text-gray-600 block">
                                  Options:
                                </label>
                                {question.options?.map((option, optIndex) => (
                                  <div
                                    key={optIndex}
                                    className="flex items-center gap-3"
                                  >
                                    <input
                                      type="number"
                                      value={option.value}
                                      onChange={(e) => {
                                        const updatedQuestions = [
                                          ...editedTemplate.questions!,
                                        ];
                                        if (!updatedQuestions[index].options) {
                                          updatedQuestions[index].options = [];
                                        }
                                        updatedQuestions[index].options![optIndex] =
                                        {
                                          ...option,
                                          value: parseInt(e.target.value) || 0,
                                        };
                                        setEditedTemplate({
                                          ...editedTemplate,
                                          questions: updatedQuestions,
                                        });
                                      }}
                                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                      placeholder="Value"
                                    />
                                    <input
                                      type="text"
                                      value={option.label}
                                      onChange={(e) => {
                                        const updatedQuestions = [
                                          ...editedTemplate.questions!,
                                        ];
                                        if (!updatedQuestions[index].options) {
                                          updatedQuestions[index].options = [];
                                        }
                                        updatedQuestions[index].options![optIndex] =
                                        {
                                          ...option,
                                          label: e.target.value,
                                        };
                                        setEditedTemplate({
                                          ...editedTemplate,
                                          questions: updatedQuestions,
                                        });
                                      }}
                                      className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                      placeholder="Option label"
                                    />
                                    <button
                                      onClick={() => {
                                        const updatedQuestions = [
                                          ...editedTemplate.questions!,
                                        ];
                                        updatedQuestions[index].options =
                                          updatedQuestions[index].options?.filter(
                                            (_, i) => i !== optIndex
                                          );
                                        setEditedTemplate({
                                          ...editedTemplate,
                                          questions: updatedQuestions,
                                        });
                                      }}
                                      className="p-1 text-red-600 hover:text-red-800"
                                      type="button"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  onClick={() => {
                                    const updatedQuestions = [
                                      ...editedTemplate.questions!,
                                    ];
                                    if (!updatedQuestions[index].options) {
                                      updatedQuestions[index].options = [];
                                    }
                                    updatedQuestions[index].options!.push({
                                      value: (updatedQuestions[index].options?.length || 0) + 1,
                                      label: "",
                                    });
                                    setEditedTemplate({
                                      ...editedTemplate,
                                      questions: updatedQuestions,
                                    });
                                  }}
                                  className="ml-0 flex items-center gap-1 px-3 py-1 text-sm text-purple-600 hover:text-purple-800 border border-purple-300 rounded hover:bg-purple-50"
                                  type="button"
                                >
                                  <Plus className="w-4 h-4" />
                                  Add Option
                                </button>
                              </div>
                            )}
                          {question.isCrisisIndicator && (
                            <div className="ml-10 mt-2">
                              <label className="text-sm font-medium text-red-600 block mb-1">
                                Crisis Threshold:
                              </label>
                              <input
                                type="number"
                                value={question.crisisThreshold || 0}
                                onChange={(e) => {
                                  const updatedQuestions = [
                                    ...editedTemplate.questions!,
                                  ];
                                  updatedQuestions[index] = {
                                    ...updatedQuestions[index],
                                    crisisThreshold: parseInt(e.target.value) || 0,
                                  };
                                  setEditedTemplate({
                                    ...editedTemplate,
                                    questions: updatedQuestions,
                                  });
                                }}
                                className="w-24 px-2 py-1 border border-red-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Threshold"
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="flex items-center justify-center w-7 h-7 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                              {index + 1}
                            </span>
                            {getQuestionTypeBadge(question.type)}
                            {question.isRequired && (
                              <span className="text-xs text-red-600 font-medium">
                                * Required
                              </span>
                            )}
                            {question.isCrisisIndicator && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded text-xs font-medium">
                                <AlertTriangle className="w-3 h-3" />
                                Crisis Indicator
                              </span>
                            )}
                          </div>
                          <p className="text-gray-800 font-medium mb-3">
                            {question.text}
                          </p>
                          {question.options && question.options.length > 0 && (
                            <div className="ml-10 space-y-2">
                              {question.options.map((option, optIndex) => (
                                <div
                                  key={optIndex}
                                  className="flex items-center gap-3 text-sm text-gray-600"
                                >
                                  <span className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center text-xs">
                                    {option.value}
                                  </span>
                                  <span>{option.label}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {question.isCrisisIndicator &&
                            question.crisisThreshold !== undefined && (
                              <div className="ml-10 mt-2 text-sm text-red-600">
                                <AlertTriangle className="w-4 h-4 inline mr-1" />
                                Crisis Threshold: ≥ {question.crisisThreshold}
                              </div>
                            )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ViewAssessmentTemplate;

