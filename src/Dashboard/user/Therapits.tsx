import { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  MapPin,
  Award,
  X,
  Video,
  Phone,
  Clock,
  Users,
  User,
  Heart,
} from "lucide-react";
import {
  getAllCounselors,
  getSpecializations,
  type Counselor,
} from "@/apis/counselor";
import {
  bookAppointment,
  getAvailableTimeSlots,
  type TimeSlot,
} from "@/apis/appointment";
import { getCurrentUser } from "@/apis/auth";
import DashboardLayout from "@/components/DashboardLayout";
import { useModal } from "@/contexts/useModal";

interface CounselorAvatarProps {
  counselor: Counselor;
  sizeClass?: string;
  textClass?: string;
}

const CounselorAvatar = ({
  counselor,
  sizeClass = "w-16 h-16",
  textClass = "text-xl",
}: CounselorAvatarProps) => {
  const [imageError, setImageError] = useState(false);
  const initials =
    `${counselor.firstName?.charAt(0) ?? ""}${counselor.lastName?.charAt(0) ?? ""
      }`.toUpperCase() ||
    counselor.username?.slice(0, 2)?.toUpperCase() ||
    "HH";

  const shouldShowImage = counselor.profilePicture && !imageError;

  if (shouldShowImage) {
    return (
      <img
        src={counselor.profilePicture}
        alt={`${counselor.firstName} ${counselor.lastName}`}
        className={`${sizeClass} rounded-full object-cover border-2 border-purple-100`}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white ${textClass} font-bold uppercase`}
    >
      {initials}
    </div>
  );
};

const Therapits = () => {
  const { showAlert } = useModal();
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpec, setSelectedSpec] = useState("all");
  const [showAvailable, setShowAvailable] = useState(false);
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(
    null
  );
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    date: "",
    time: "",
    sessionMode: "video",
    reason: "",
    urgencyLevel: "medium",
    duration: 60,
    appointmentType: "individual",
  });
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const user = getCurrentUser();
      if (user) {
        setUserName(user.username || "User");
      }

      const [counselorsRes, specsRes] = await Promise.all([
        getAllCounselors({}),
        getSpecializations(),
      ]);

      if (counselorsRes.success && counselorsRes.data) {
        setCounselors(counselorsRes.data.counselors);
      }

      if (specsRes.success && specsRes.data) {
        setSpecializations(specsRes.data.specializations);
      }
    } catch (error) {
      console.error("Error loading counselors:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async (counselorId: string, date: string) => {
    try {
      setSlotsLoading(true);
      setAvailableSlots([]); // Clear previous slots

      console.log(
        `Fetching available slots for counselor ID: ${counselorId} on date: ${date}`
      );

      const response = await getAvailableTimeSlots(counselorId, date);
      if (response.success && response.data) {
        const slots = response.data.availableSlots || [];
        console.log(`Found ${slots.length} available slots:`, slots);
        setAvailableSlots(slots);
      } else {
        console.error("Failed to load slots:", response.message);
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error("Error loading slots:", error);
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleDateChange = (date: string) => {
    setBookingData({ ...bookingData, date, time: "" });
    if (selectedCounselor && date) {
      loadAvailableSlots(selectedCounselor._id, date);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedCounselor) return;

    // Validate required fields
    if (!bookingData.firstName.trim()) {
      showAlert("Please enter your first name", "Validation Error", "warning");
      return;
    }
    if (!bookingData.lastName.trim()) {
      showAlert("Please enter your last name", "Validation Error", "warning");
      return;
    }
    if (!bookingData.phoneNumber.trim()) {
      showAlert("Please enter your phone number", "Validation Error", "warning");
      return;
    }

    try {
      setBookingLoading(true);
      const response = await bookAppointment({
        counselorId: selectedCounselor._id,
        firstName: bookingData.firstName,
        lastName: bookingData.lastName,
        phoneNumber: bookingData.phoneNumber,
        appointmentDate: bookingData.date,
        appointmentTime: bookingData.time,
        sessionMode: bookingData.sessionMode,
        reason: bookingData.reason,
        urgencyLevel: bookingData.urgencyLevel,
        duration: bookingData.duration,
        appointmentType: bookingData.appointmentType,
      });

      if (response.success) {
        showAlert(
          "Appointment booked successfully! Waiting for counselor confirmation.",
          "Success",
          "success"
        );
        setShowBookingModal(false);
        setBookingData({
          firstName: "",
          lastName: "",
          phoneNumber: "",
          date: "",
          time: "",
          sessionMode: "video",
          reason: "",
          urgencyLevel: "medium",
          duration: 60,
          appointmentType: "individual",
        });
      } else {
        showAlert(response.message || "Failed to book appointment", "Error", "danger");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      showAlert("Failed to book appointment", "Error", "danger");
    } finally {
      setBookingLoading(false);
    }
  };

  const openBookingModal = (counselor: Counselor) => {
    console.log("Opening booking modal for counselor:", {
      id: counselor._id,
      name: `${counselor.firstName} ${counselor.lastName}`,
      specialization: counselor.specialization,
    });
    setSelectedCounselor(counselor);
    setShowBookingModal(true);
    setBookingData({
      firstName: "",
      lastName: "",
      phoneNumber: "",
      date: "",
      time: "",
      sessionMode: "video",
      reason: "",
      urgencyLevel: "medium",
      duration: 60,
      appointmentType: "individual",
    });
    setAvailableSlots([]);
  };

  const filteredCounselors = counselors.filter((counselor) => {
    const matchesSearch =
      counselor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      counselor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      counselor.specialization.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpec =
      selectedSpec === "all" || counselor.specialization === selectedSpec;
    const matchesAvailable = !showAvailable || counselor.isAvailable;

    return matchesSearch && matchesSpec && matchesAvailable;
  });

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  return (
    <DashboardLayout userType="user" userName={userName}>
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <>
          <div className="space-y-6 min-h-screen">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Find Your Counselor
              </h1>
              <p className="text-gray-600 mt-1">
                Browse verified counselors and book a session
              </p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <select
                  value={selectedSpec}
                  onChange={(e) => setSelectedSpec(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Specializations</option>
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>

                <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <input
                    type="checkbox"
                    checked={showAvailable}
                    onChange={(e) => setShowAvailable(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Available Now
                  </span>
                </label>
              </div>
            </div>

            {/* Counselors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCounselors.map((counselor) => (
                <div
                  key={counselor._id}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all flex flex-col h-full"
                >
                  {/* Profile Image - Centered */}
                  <div className="flex justify-center mb-4">
                    <CounselorAvatar counselor={counselor} sizeClass="w-20 h-20" textClass="text-2xl" />
                  </div>

                  {/* Name - Centered */}
                  <div className="flex flex-col items-center mb-3">
                    <h3 className="font-semibold text-gray-800 text-center mb-1">
                      {counselor.firstName} {counselor.lastName}
                    </h3>
                    {counselor.isAvailable && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Available
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Award className="w-4 h-4 text-purple-600" />
                      <span>{counselor.specialization}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span>{counselor.experience} years experience</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-purple-600" />
                      <span>{counselor.totalSessions} sessions completed</span>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">
                    {counselor.bio}
                  </p>

                  {/* Button */}
                  <button
                    onClick={() => openBookingModal(counselor)}
                    className="w-full bg-gradient-to-r from-[#9027b0] to-[#9c27b0] text-white py-2 rounded-lg hover:from-[#7b1fa2] hover:to-[#8e24aa] transition-all font-medium mt-auto"
                  >
                    Book Appointment
                  </button>
                </div>
              ))}
            </div>

            {filteredCounselors.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No counselors found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or filters
                </p>
              </div>
            )}

            {/* Booking Modal */}
            {showBookingModal && selectedCounselor && (
              <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={() => setShowBookingModal(false)}
              >
                <div
                  className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                      Book Appointment
                    </h2>
                    <button
                      onClick={() => setShowBookingModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                      <CounselorAvatar
                        counselor={selectedCounselor}
                        sizeClass="w-12 h-12"
                        textClass="text-lg"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {selectedCounselor.firstName}{" "}
                          {selectedCounselor.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedCounselor.specialization}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Booking with</p>
                        <p className="text-sm font-medium text-purple-600">
                          {selectedCounselor.experience} years exp
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Personal Information */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-purple-900 mb-3">
                        Your Information
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name *
                          </label>
                          <input
                            type="text"
                            value={bookingData.firstName}
                            onChange={(e) =>
                              setBookingData({
                                ...bookingData,
                                firstName: e.target.value,
                              })
                            }
                            placeholder="Enter first name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            value={bookingData.lastName}
                            onChange={(e) =>
                              setBookingData({
                                ...bookingData,
                                lastName: e.target.value,
                              })
                            }
                            placeholder="Enter last name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={bookingData.phoneNumber}
                          onChange={(e) =>
                            setBookingData({
                              ...bookingData,
                              phoneNumber: e.target.value,
                            })
                          }
                          placeholder="Enter phone number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Date *{" "}
                        <span className="text-gray-500 font-normal text-xs">
                          (Check {selectedCounselor.firstName}'s availability)
                        </span>
                      </label>
                      <input
                        type="date"
                        min={getTodayDate()}
                        value={bookingData.date}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    {bookingData.date && slotsLoading && (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                          <p className="text-sm text-gray-500">
                            Loading available time slots...
                          </p>
                        </div>
                      </div>
                    )}

                    {bookingData.date &&
                      !slotsLoading &&
                      availableSlots.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Available Time Slots for{" "}
                            {selectedCounselor.firstName} *
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {availableSlots.map((slot, index) => (
                              <button
                                key={`${slot.time}-${index}`}
                                onClick={() =>
                                  setBookingData({
                                    ...bookingData,
                                    time: slot.time,
                                  })
                                }
                                className={`px-4 py-2 rounded-lg border-2 transition-all ${bookingData.time === slot.time
                                  ? "border-purple-600 bg-purple-50 text-purple-700 font-semibold"
                                  : "border-gray-200 hover:border-purple-300"
                                  }`}
                              >
                                {slot.time}
                              </button>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            {availableSlots.length} slot
                            {availableSlots.length !== 1 ? "s" : ""} available
                            for selected date
                          </p>
                        </div>
                      )}

                    {bookingData.date &&
                      !slotsLoading &&
                      availableSlots.length === 0 && (
                        <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-600">
                            No available slots for this date
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {selectedCounselor.firstName} doesn't have
                            availability on this date. Please try another date.
                          </p>
                        </div>
                      )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session Mode *
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() =>
                            setBookingData({
                              ...bookingData,
                              sessionMode: "video",
                            })
                          }
                          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${bookingData.sessionMode === "video"
                            ? "border-purple-600 bg-purple-50 text-purple-700"
                            : "border-gray-200 hover:border-purple-300"
                            }`}
                        >
                          <Video className="w-5 h-5" />
                          Video Call
                        </button>
                        <button
                          onClick={() =>
                            setBookingData({
                              ...bookingData,
                              sessionMode: "phone",
                            })
                          }
                          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${bookingData.sessionMode === "phone"
                            ? "border-purple-600 bg-purple-50 text-purple-700"
                            : "border-gray-200 hover:border-purple-300"
                            }`}
                        >
                          <Phone className="w-5 h-5" />
                          Phone Call
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Appointment Type *
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          onClick={() =>
                            setBookingData({
                              ...bookingData,
                              appointmentType: "individual",
                            })
                          }
                          className={`flex flex-col items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${bookingData.appointmentType === "individual"
                            ? "border-purple-600 bg-purple-50 text-purple-700"
                            : "border-gray-200 hover:border-purple-300"
                            }`}
                        >
                          <User className="w-5 h-5" />
                          <span className="text-sm font-medium">
                            Individual
                          </span>
                        </button>
                        <button
                          onClick={() =>
                            setBookingData({
                              ...bookingData,
                              appointmentType: "couple",
                            })
                          }
                          className={`flex flex-col items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${bookingData.appointmentType === "couple"
                            ? "border-purple-600 bg-purple-50 text-purple-700"
                            : "border-gray-200 hover:border-purple-300"
                            }`}
                        >
                          <Heart className="w-5 h-5" />
                          <span className="text-sm font-medium">Couple</span>
                        </button>
                        <button
                          onClick={() =>
                            setBookingData({
                              ...bookingData,
                              appointmentType: "group",
                            })
                          }
                          className={`flex flex-col items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${bookingData.appointmentType === "group"
                            ? "border-purple-600 bg-purple-50 text-purple-700"
                            : "border-gray-200 hover:border-purple-300"
                            }`}
                        >
                          <Users className="w-5 h-5" />
                          <span className="text-sm font-medium">Group</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session Duration *{" "}
                        <span className="text-gray-500 font-normal text-xs">
                          (Max 3 hours)
                        </span>
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                          value={bookingData.duration}
                          onChange={(e) =>
                            setBookingData({
                              ...bookingData,
                              duration: parseInt(e.target.value),
                            })
                          }
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                        >
                          <option value={30}>30 minutes</option>
                          <option value={60}>1 hour (60 minutes)</option>
                          <option value={90}>1.5 hours (90 minutes)</option>
                          <option value={120}>2 hours (120 minutes)</option>
                          <option value={150}>2.5 hours (150 minutes)</option>
                          <option value={180}>3 hours (180 minutes)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for Session (Optional)
                      </label>
                      <textarea
                        value={bookingData.reason}
                        onChange={(e) =>
                          setBookingData({
                            ...bookingData,
                            reason: e.target.value,
                          })
                        }
                        placeholder="Share what you'd like to discuss..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Urgency Level
                      </label>
                      <select
                        value={bookingData.urgencyLevel}
                        onChange={(e) =>
                          setBookingData({
                            ...bookingData,
                            urgencyLevel: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="low">Low - General Support</option>
                        <option value="medium">
                          Medium - Need Support Soon
                        </option>
                        <option value="high">
                          High - Urgent Support Needed
                        </option>
                      </select>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => setShowBookingModal(false)}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleBookAppointment}
                        disabled={
                          !bookingData.firstName ||
                          !bookingData.lastName ||
                          !bookingData.phoneNumber ||
                          !bookingData.date ||
                          !bookingData.time ||
                          bookingLoading
                        }
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-[#9027b0] to-[#9c27b0] text-white rounded-lg hover:from-[#7b1fa2] hover:to-[#8e24aa] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {bookingLoading ? "Booking..." : "Book Appointment"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default Therapits;
