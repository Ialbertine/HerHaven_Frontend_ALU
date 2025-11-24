import React, { useState, useEffect, useCallback } from "react";
import { Calendar, Clock, Plus, Edit2, Save, Trash2 } from "lucide-react";
import {
  getCounselorProfile,
  updateCounselorAvailability,
  type DayAvailability,
} from "@/apis/counselor";
import { getCurrentUser } from "@/apis/auth";
import DashboardLayout from "@/components/DashboardLayout";
import { useModal } from "@/contexts/useModal";

// Types
interface TimeSlot {
  start: string;
  end: string;
}

interface Availability {
  [key: string]: TimeSlot[];
}

type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

const daysOfWeek: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const Schedule: React.FC = () => {
  const { showAlert } = useModal();
  const [availability, setAvailability] = useState<Availability>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedAvailability, setEditedAvailability] = useState<Availability>(
    {}
  );
  const [userName, setUserName] = useState("");
  const [saving, setSaving] = useState(false);

  const loadAvailability = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);

      // Get current user for username
      const user = getCurrentUser();
      if (user) {
        setUserName(user.username || "Counselor");
      }

      // Fetch counselor profile to get availability
      const response = await getCounselorProfile();
      if (response.success && response.data?.counselor) {
        const backendAvailability = response.data.counselor.availability;

        // Transform backend format to frontend format
        const initializedAvailability: Availability = {};
        daysOfWeek.forEach((day) => {
          initializedAvailability[day] = [];
        });

        if (backendAvailability && Array.isArray(backendAvailability)) {
          backendAvailability.forEach((daySchedule: DayAvailability) => {
            if (daySchedule.day && daySchedule.slots) {
              initializedAvailability[daySchedule.day] = daySchedule.slots.map(
                (slot) => ({
                  start: slot.startTime,
                  end: slot.endTime,
                })
              );
            }
          });
        }

        setAvailability(initializedAvailability);
        setEditedAvailability(
          JSON.parse(JSON.stringify(initializedAvailability))
        );
      } else {
        const emptyAvailability: Availability = {};
        daysOfWeek.forEach((day) => {
          emptyAvailability[day] = [];
        });
        setAvailability(emptyAvailability);
        setEditedAvailability(emptyAvailability);
      }
    } catch (error) {
      console.error("Error loading availability:", error);
      showAlert("Failed to load availability. Please try again.", "Error", "danger");
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    void loadAvailability();
  }, [loadAvailability]);

  const handleSaveAvailability = async (): Promise<void> => {
    try {
      setSaving(true);

      // Transform frontend format to backend format
      // Frontend: { Monday: [{ start: "09:00", end: "12:00" }] }
      // Backend: [{ day: "Monday", slots: [{ startTime: "09:00", endTime: "12:00" }] }]
      const availabilityArray = Object.keys(editedAvailability)
        .filter(
          (day) => editedAvailability[day] && editedAvailability[day].length > 0
        )
        .map((day) => ({
          day: day,
          slots: editedAvailability[day].map((slot) => ({
            startTime: slot.start,
            endTime: slot.end,
          })),
        }));

      // Call the API to update availability
      const response = await updateCounselorAvailability(availabilityArray);

      if (response.success) {
        setAvailability(editedAvailability);
        setIsEditing(false);
        showAlert("Availability updated successfully!", "Success", "success");
      } else {
        showAlert(
          response.message || "Failed to update availability. Please try again.",
          "Error",
          "danger"
        );
      }
    } catch (error) {
      console.error("Error saving availability:", error);
      showAlert("Failed to update availability. Please try again.", "Error", "danger");
    } finally {
      setSaving(false);
    }
  };

  const addTimeSlot = (day: DayOfWeek): void => {
    const updated = { ...editedAvailability };
    if (!updated[day]) updated[day] = [];
    updated[day].push({ start: "09:00", end: "10:00" });
    setEditedAvailability(updated);
  };

  const removeTimeSlot = (day: DayOfWeek, index: number): void => {
    const updated = { ...editedAvailability };
    if (updated[day]) {
      updated[day].splice(index, 1);
      setEditedAvailability(updated);
    }
  };

  const updateTimeSlot = (
    day: DayOfWeek,
    index: number,
    field: keyof TimeSlot,
    value: string
  ): void => {
    const updated = { ...editedAvailability };
    if (updated[day] && updated[day][index]) {
      updated[day][index][field] = value;
      setEditedAvailability(updated);
    }
  };

  const handleCancelEdit = (): void => {
    setEditedAvailability(JSON.parse(JSON.stringify(availability)));
    setIsEditing(false);
  };

  const currentAvailability: Availability = isEditing
    ? editedAvailability
    : availability;

  return (
    <DashboardLayout
      userType="counselor"
      userName={userName}
    >
      <div className="space-y-6 min-h-screen">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">My Schedule</h1>
                <p className="text-gray-600 mt-1">Manage your availability</p>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveAvailability}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Schedule
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="space-y-6">
                {daysOfWeek.map((day) => (
                  <div
                    key={day}
                    className="border-b border-gray-100 pb-6 last:border-b-0"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <h3 className="font-semibold text-gray-800">{day}</h3>
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => addTimeSlot(day)}
                          className="flex items-center gap-1 text-purple-600 hover:text-purple-700 text-sm font-medium"
                        >
                          <Plus className="w-4 h-4" />
                          Add Slot
                        </button>
                      )}
                    </div>

                    {currentAvailability[day]?.length > 0 ? (
                      <div className="space-y-3">
                        {currentAvailability[day].map((slot, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {isEditing ? (
                              <>
                                <input
                                  type="time"
                                  value={slot.start}
                                  onChange={(e) =>
                                    updateTimeSlot(
                                      day,
                                      index,
                                      "start",
                                      e.target.value
                                    )
                                  }
                                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                                <span className="text-gray-500">to</span>
                                <input
                                  type="time"
                                  value={slot.end}
                                  onChange={(e) =>
                                    updateTimeSlot(
                                      day,
                                      index,
                                      "end",
                                      e.target.value
                                    )
                                  }
                                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                                <button
                                  onClick={() => removeTimeSlot(day, index)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="px-3 py-2 bg-purple-50 text-purple-700 rounded-lg font-medium">
                                  {slot.start}
                                </span>
                                <span className="text-gray-500">to</span>
                                <span className="px-3 py-2 bg-purple-50 text-purple-700 rounded-lg font-medium">
                                  {slot.end}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-400 text-sm">
                          No availability set for this day
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
              <h3 className="font-semibold text-gray-800 mb-2">Schedule Tips</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Set consistent hours to help clients plan appointments</li>
                <li>• Include buffer time between sessions for notes and breaks</li>
                <li>• Update your availability regularly to avoid conflicts</li>
                <li>• Consider time zones if offering remote sessions</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Schedule;
