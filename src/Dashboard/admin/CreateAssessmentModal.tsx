import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash,
  GripVertical,
  AlertTriangle,
  Save,
} from "lucide-react";
import { useModal } from "@/contexts/useModal";
import {
  createAssessmentTemplate,
  type AssessmentQuestion,
  type SeverityLevel,
} from "@/apis/assessment";

interface CreateAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateAssessmentModal: React.FC<CreateAssessmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showAlert } = useModal();
  const [loading, setLoading] = useState(false);

  // Basic Info
  const [name, setName] = useState("");
  const [category, setCategory] = useState<
    "depression" | "anxiety" | "ptsd" | "safety" | "wellness" | "general"
  >("wellness");
  const [description, setDescription] = useState("");
  const [version, setVersion] = useState("1.0");
  const [estimatedDuration, setEstimatedDuration] = useState(5);
  const [language, setLanguage] = useState("en");
  const [isActive, setIsActive] = useState(true);
  const [isPublished, setIsPublished] = useState(false);

  // Questions
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([
    {
      questionId: "q1",
      text: "",
      type: "single-choice",
      order: 1,
      isRequired: true,
      isCrisisIndicator: false,
      options: [
        { value: 0, label: "" },
        { value: 1, label: "" },
      ],
    },
  ]);

  // Scoring Rules
  const [maxScore, setMaxScore] = useState(0);
  const [severityLevels, setSeverityLevels] = useState<SeverityLevel[]>([
    {
      name: "Low",
      range: { min: 0, max: 0 },
      color: "#22c55e",
      recommendations: [""],
    },
  ]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddQuestion = () => {
    const newQuestion: AssessmentQuestion = {
      questionId: `q${questions.length + 1}`,
      text: "",
      type: "single-choice",
      order: questions.length + 1,
      isRequired: true,
      isCrisisIndicator: false,
      options: [
        { value: 0, label: "" },
        { value: 1, label: "" },
      ],
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleRemoveQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    // Reorder
    updated.forEach((q, i) => {
      q.order = i + 1;
      q.questionId = `q${i + 1}`;
    });
    setQuestions(updated);
  };

  const handleQuestionChange = (
    index: number,
    field: keyof AssessmentQuestion,
    value: AssessmentQuestion[keyof AssessmentQuestion]
  ) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleAddOption = (questionIndex: number) => {
    const updated = [...questions];
    if (!updated[questionIndex].options) {
      updated[questionIndex].options = [];
    }
    updated[questionIndex].options!.push({
      value: updated[questionIndex].options!.length,
      label: "",
    });
    setQuestions(updated);
  };

  const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].options = updated[questionIndex].options!.filter(
      (_, i) => i !== optionIndex
    );
    // Reorder values
    updated[questionIndex].options!.forEach((opt, i) => {
      opt.value = i;
    });
    setQuestions(updated);
  };

  const handleOptionChange = (
    questionIndex: number,
    optionIndex: number,
    field: "value" | "label",
    value: string | number
  ) => {
    const updated = [...questions];
    if (field === "value") {
      updated[questionIndex].options![optionIndex].value = value as number;
    } else {
      updated[questionIndex].options![optionIndex].label = value as string;
    }
    setQuestions(updated);
  };

  const handleAddSeverityLevel = () => {
    setSeverityLevels([
      ...severityLevels,
      {
        name: "",
        range: { min: 0, max: 0 },
        color: "#6b7280",
        recommendations: [""],
      },
    ]);
  };

  const handleRemoveSeverityLevel = (index: number) => {
    setSeverityLevels(severityLevels.filter((_, i) => i !== index));
  };

  const handleSeverityLevelChange = (
    index: number,
    field: keyof SeverityLevel,
    value: SeverityLevel[keyof SeverityLevel]
  ) => {
    const updated = [...severityLevels];
    updated[index] = { ...updated[index], [field]: value };
    setSeverityLevels(updated);
  };

  const handleAddRecommendation = (levelIndex: number) => {
    const updated = [...severityLevels];
    if (!updated[levelIndex].recommendations) {
      updated[levelIndex].recommendations = [];
    }
    updated[levelIndex].recommendations!.push("");
    setSeverityLevels(updated);
  };

  const handleRemoveRecommendation = (
    levelIndex: number,
    recIndex: number
  ) => {
    const updated = [...severityLevels];
    updated[levelIndex].recommendations = updated[
      levelIndex
    ].recommendations!.filter((_, i) => i !== recIndex);
    setSeverityLevels(updated);
  };

  const handleRecommendationChange = (
    levelIndex: number,
    recIndex: number,
    value: string
  ) => {
    const updated = [...severityLevels];
    updated[levelIndex].recommendations![recIndex] = value;
    setSeverityLevels(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      showAlert("Please enter assessment name", "Validation Error", "danger");
      return;
    }
    if (!description.trim()) {
      showAlert(
        "Please enter assessment description",
        "Validation Error",
        "danger"
      );
      return;
    }
    if (questions.length === 0) {
      showAlert(
        "Please add at least one question",
        "Validation Error",
        "danger"
      );
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        showAlert(
          `Question ${i + 1}: Please enter question text`,
          "Validation Error",
          "danger"
        );
        return;
      }
      if (
        (q.type === "single-choice" || q.type === "multiple-choice" || q.type === "scale") &&
        (!q.options || q.options.length < 2)
      ) {
        showAlert(
          `Question ${i + 1}: Please add at least 2 options`,
          "Validation Error",
          "danger"
        );
        return;
      }
      if (q.options) {
        for (let j = 0; j < q.options.length; j++) {
          if (!q.options[j].label.trim()) {
            showAlert(
              `Question ${i + 1}, Option ${j + 1}: Please enter option label`,
              "Validation Error",
              "danger"
            );
            return;
          }
        }
      }
    }

    if (severityLevels.length === 0) {
      showAlert(
        "Please add at least one severity level",
        "Validation Error",
        "danger"
      );
      return;
    }

    // Validate severity levels
    for (let i = 0; i < severityLevels.length; i++) {
      const level = severityLevels[i];
      if (!level.name.trim()) {
        showAlert(
          `Severity Level ${i + 1}: Please enter level name`,
          "Validation Error",
          "danger"
        );
        return;
      }
    }

    // Validate that severity levels cover the entire score range
    if (maxScore > 0) {
      const sortedLevels = [...severityLevels].sort(
        (a, b) => Number(a.range.min) - Number(b.range.min)
      );

      // Check if first level starts at 0
      if (Number(sortedLevels[0].range.min) !== 0) {
        showAlert(
          "Severity levels must start at 0. The first level's minimum score should be 0.",
          "Validation Error",
          "danger"
        );
        return;
      }

      // Check if last level ends at maxScore
      const lastLevel = sortedLevels[sortedLevels.length - 1];
      const lastMax = Number(lastLevel.range.max);
      const maxScoreNum = Number(maxScore);

      if (lastMax !== maxScoreNum) {
        showAlert(
          `Severity levels must end at ${maxScore}. The last level's maximum score should be ${maxScore}. Currently, the last level ends at ${lastMax}.`,
          "Validation Error",
          "danger"
        );
        return;
      }

      // Check for gaps or overlaps
      for (let i = 0; i < sortedLevels.length - 1; i++) {
        const current = sortedLevels[i];
        const next = sortedLevels[i + 1];
        const currentMax = Number(current.range.max);
        const nextMin = Number(next.range.min);

        if (currentMax + 1 !== nextMin) {
          showAlert(
            `Severity levels must cover the entire range without gaps. Level "${current.name}" ends at ${currentMax}, but the next level starts at ${nextMin}. They should be consecutive (e.g., ${currentMax} and ${currentMax + 1}).`,
            "Validation Error",
            "danger"
          );
          return;
        }
      }
    }

    setLoading(true);

    try {
      const templateData = {
        name,
        category,
        description,
        version,
        estimatedDuration,
        language,
        isActive,
        isPublished,
        questions: questions.map((q) => ({
          ...q,
          options:
            q.type === "text" ? undefined : q.options,
        })),
        scoringRules: {
          maxScore,
          severityLevels: severityLevels.map((level) => ({
            ...level,
            recommendations: level.recommendations?.filter((r) => r.trim()),
          })),
        },
      };

      const response = await createAssessmentTemplate(templateData);

      if (response.success) {
        showAlert(
          response.message || "Assessment template created successfully!",
          "Success",
          "success"
        );
        onSuccess();
        onClose();
      } else {
        showAlert(
          response.message || "Failed to create assessment template",
          "Error",
          "danger"
        );
      }
    } catch (error) {
      console.error("Error creating template:", error);
      showAlert(
        "An error occurred while creating the template",
        "Error",
        "danger"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white rounded-3xl z-10">
        <div className="flex items-center justify-between px-6 py-4 bg-lavender-50 rounded-3xl">
          <h2 className="text-2xl font-bold text-gray-800">
            Create Assessment Template
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 py-4 flex-1 overflow-y-auto">
            {/* Basic Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assessment Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                    placeholder="e.g., Mental Wellness Check"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(
                        e.target.value as
                        | "depression"
                        | "anxiety"
                        | "ptsd"
                        | "safety"
                        | "wellness"
                        | "general"
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  >
                    <option value="depression">Depression</option>
                    <option value="anxiety">Anxiety</option>
                    <option value="ptsd">PTSD</option>
                    <option value="safety">Safety</option>
                    <option value="wellness">Wellness</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                    placeholder="Brief description of the assessment"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Version
                  </label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                    placeholder="1.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={estimatedDuration}
                    onChange={(e) =>
                      setEstimatedDuration(parseInt(e.target.value) || 0)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <input
                    type="text"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                    placeholder="en"
                  />
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Active
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Published
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Questions
                </h3>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Question
                </button>
              </div>
              <div className="space-y-4">
                {questions.map((question, qIndex) => (
                  <div
                    key={qIndex}
                    className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-5 h-5 text-gray-400" />
                        <span className="font-semibold text-gray-700">
                          Question {qIndex + 1}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIndex)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        disabled={questions.length === 1}
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Question Text *
                        </label>
                        <input
                          type="text"
                          value={question.text}
                          onChange={(e) =>
                            handleQuestionChange(qIndex, "text", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                          placeholder="Enter your question"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Question Type
                          </label>
                          <select
                            value={question.type}
                            onChange={(e) =>
                              handleQuestionChange(
                                qIndex,
                                "type",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                          >
                            <option value="single-choice">Single Choice</option>
                            <option value="multiple-choice">
                              Multiple Choice
                            </option>
                            <option value="scale">Scale</option>
                            <option value="text">Text</option>
                          </select>
                        </div>
                        <div className="flex items-end gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={question.isRequired}
                              onChange={(e) =>
                                handleQuestionChange(
                                  qIndex,
                                  "isRequired",
                                  e.target.checked
                                )
                              }
                              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              Required
                            </span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={question.isCrisisIndicator}
                              onChange={(e) =>
                                handleQuestionChange(
                                  qIndex,
                                  "isCrisisIndicator",
                                  e.target.checked
                                )
                              }
                              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                            />
                            <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Crisis
                            </span>
                          </label>
                        </div>
                      </div>

                      {question.isCrisisIndicator && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Crisis Threshold
                          </label>
                          <input
                            type="number"
                            value={question.crisisThreshold || 0}
                            onChange={(e) =>
                              handleQuestionChange(
                                qIndex,
                                "crisisThreshold",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                            min="0"
                          />
                        </div>
                      )}

                      {/* Options for choice/scale questions */}
                      {question.type !== "text" && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-700">
                              Options
                            </label>
                            <button
                              type="button"
                              onClick={() => handleAddOption(qIndex)}
                              className="text-sm text-purple-600 hover:text-purple-700"
                            >
                              + Add Option
                            </button>
                          </div>
                          <div className="space-y-2">
                            {question.options?.map((option, oIndex) => (
                              <div
                                key={oIndex}
                                className="flex items-center gap-2"
                              >
                                <input
                                  type="text"
                                  value={option.value}
                                  onChange={(e) =>
                                    handleOptionChange(
                                      qIndex,
                                      oIndex,
                                      "value",
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  className="w-20 px-2 py-1 border border-gray-300 rounded focus:border-purple-500 focus:outline-none text-sm"
                                  placeholder="Value"
                                />
                                <input
                                  type="text"
                                  value={option.label}
                                  onChange={(e) =>
                                    handleOptionChange(
                                      qIndex,
                                      oIndex,
                                      "label",
                                      e.target.value
                                    )
                                  }
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:border-purple-500 focus:outline-none text-sm"
                                  placeholder="Label"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveOption(qIndex, oIndex)
                                  }
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                  disabled={
                                    question.options?.length === 2
                                  }
                                >
                                  <Trash className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scoring Rules */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Scoring Rules
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Score
                </label>
                <input
                  type="text"
                  value={maxScore || ""}
                  onChange={(e) =>
                    setMaxScore(parseInt(e.target.value) || 0)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="Enter maximum score"
                />
                {maxScore > 0 && (
                  <p className="mt-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <strong>Important:</strong> Your severity levels must cover the entire score range from <strong>0 to {maxScore}</strong> with no gaps.
                    For example, if max score is 8, you could have: Level 1 (0-2), Level 2 (3-5), Level 3 (6-8).
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">
                  Severity Levels
                </label>
                <button
                  type="button"
                  onClick={handleAddSeverityLevel}
                  className="text-sm text-purple-600 hover:text-purple-700"
                >
                  + Add Level
                </button>
              </div>

              <div className="space-y-3">
                {severityLevels.map((level, lIndex) => (
                  <div
                    key={lIndex}
                    className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="font-semibold text-gray-700">
                        Level {lIndex + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSeverityLevel(lIndex)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        disabled={severityLevels.length === 1}
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name *
                        </label>
                        <input
                          type="text"
                          value={level.name}
                          onChange={(e) =>
                            handleSeverityLevelChange(
                              lIndex,
                              "name",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                          placeholder="e.g., Low, Moderate, High"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Color
                        </label>
                        <input
                          type="color"
                          value={level.color || "#6b7280"}
                          onChange={(e) =>
                            handleSeverityLevelChange(
                              lIndex,
                              "color",
                              e.target.value
                            )
                          }
                          className="w-full h-10 px-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Min Score
                        </label>
                        <input
                          type="number"
                          value={level.range.min}
                          onChange={(e) =>
                            handleSeverityLevelChange(lIndex, "range", {
                              ...level.range,
                              min: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max Score
                        </label>
                        <input
                          type="number"
                          value={level.range.max}
                          onChange={(e) =>
                            handleSeverityLevelChange(lIndex, "range", {
                              ...level.range,
                              max: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                          min="0"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">
                          Recommendations
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAddRecommendation(lIndex)}
                          className="text-xs text-purple-600 hover:text-purple-700"
                        >
                          + Add
                        </button>
                      </div>
                      <div className="space-y-2">
                        {level.recommendations?.map((rec, rIndex) => (
                          <div key={rIndex} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={rec}
                              onChange={(e) =>
                                handleRecommendationChange(
                                  lIndex,
                                  rIndex,
                                  e.target.value
                                )
                              }
                              className="flex-1 px-2 py-1 border border-gray-300 rounded focus:border-purple-500 focus:outline-none text-sm"
                              placeholder="Enter recommendation"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveRecommendation(lIndex, rIndex)
                              }
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#9027b0] to-[#9c27b0] text-white rounded-lg hover:from-[#7b1fa2] hover:to-[#8e24aa] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Create Assessment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssessmentModal;

