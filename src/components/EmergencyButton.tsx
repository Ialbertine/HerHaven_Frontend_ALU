import React, { useState, useRef, useEffect } from "react";
import {
  AlertTriangle,
  MapPin,
  X,
  Phone,
  PhoneCall,
  AlertCircle,
} from "lucide-react";
import {
  triggerQuickSOS,
  triggerSOS,
  getCurrentUserType,
  validatePhoneNumber,
  type GuestContact,
} from "@/apis/sos";
import { getEmergencyContacts } from "@/apis/emergency";
import { continueAsGuest } from "@/apis/auth";
import { useModal } from "@/contexts/useModal";

interface GuestFormData {
  phoneNumber: string;
}

interface HardcodedEmergencyContact {
  name: string;
  number: string;
  type: "crisis";
}

const UnifiedEmergencyButton: React.FC = () => {
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [location, setLocation] = useState<string>("");
  const [userType, setUserType] = useState<"authenticated" | "guest" | "none">(
    "none"
  );
  const [hasContacts, setHasContacts] = useState(false);

  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const startTimeRef = useRef<number>(0);
  const isEnsuringGuestRef = useRef(false);
  const { showAlert } = useModal();

  const [guestContacts, setGuestContacts] = useState<GuestFormData[]>([
    { phoneNumber: "" },
  ]);

  // Hardcoded emergency call numbers
  const hardcodedEmergencyContacts: HardcodedEmergencyContact[] = [
    {
      name: "Isange One Stop Center (GBV)",
      number: "3029",
      type: "crisis",
    },
    {
      name: "Rwanda Investigation Bureau (RIB)",
      number: "3212",
      type: "crisis",
    },
    {
      name: "Emergency Services",
      number: "112",
      type: "crisis",
    },
  ];

  const sanitizePhoneInput = (value: string): string => {
    const trimmed = value.trim();
    const hasPlusPrefix = trimmed.startsWith("+");
    const digitsOnly = trimmed.replace(/\D/g, "");
    const limitedDigits = digitsOnly.slice(0, 15);

    if (!limitedDigits) {
      return hasPlusPrefix ? "+" : "";
    }

    return hasPlusPrefix ? `+${limitedDigits}` : limitedDigits;
  };

  const ensureGuestSession = async (): Promise<string | null> => {
    const existingSessionId = localStorage.getItem("guestSessionId");
    if (existingSessionId) {
      return existingSessionId;
    }

    if (isEnsuringGuestRef.current) {
      return localStorage.getItem("guestSessionId");
    }

    try {
      isEnsuringGuestRef.current = true;
      const response = await continueAsGuest();

      if (response.success && response.data?.sessionId) {
        return response.data.sessionId;
      }

      showAlert(
        response.message || "Unable to prepare guest mode. Please try again.",
        "Guest Access Failed",
        "danger"
      );
      return null;
    } catch (error) {
      console.error("Guest session initialization error:", error);
      showAlert(
        "Unable to prepare guest mode. Please try again or contact support.",
        "Guest Access Failed",
        "danger"
      );
      return null;
    } finally {
      isEnsuringGuestRef.current = false;
    }
  };

  const activateGuestMode = async (): Promise<boolean> => {
    const sessionId = await ensureGuestSession();
    if (!sessionId) {
      return false;
    }

    return true;
  };

  // Function to check and refresh emergency contacts
  const checkEmergencyContacts = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      console.log("=== Checking Emergency Contacts ===");
      console.log("Has token:", !!token);
      console.log(
        "Token (first 20 chars):",
        token ? token.substring(0, 20) + "..." : "null"
      );
      console.log("User in localStorage:", user ? JSON.parse(user) : "null");

      const response = await getEmergencyContacts();
      console.log("Emergency contacts response:", response);

      if (response.success && response.data) {
        const hasAnyContacts = response.data.length > 0;
        setHasContacts(hasAnyContacts);
        console.log(
          "Has contacts:",
          hasAnyContacts,
          "Count:",
          response.data.length
        );

        if (hasAnyContacts) {
          return true;
        } else {
          await ensureGuestSession();
          return false;
        }
      } else {
        console.error("Failed to fetch contacts:", response.message);
        await ensureGuestSession();
        return false;
      }
    } catch (error) {
      console.error("Error checking emergency contacts:", error);
      await ensureGuestSession();
      return false;
    }
  };

  // Check user type and emergency contacts on mount
  useEffect(() => {
    const checkUserStatus = async () => {
      const type = getCurrentUserType();
      setUserType(type);
      console.log("User type:", type);

      if (type === "authenticated") {
        await checkEmergencyContacts();
      } else {
        await ensureGuestSession();
      }
    };

    checkUserStatus();
    requestLocation();
  }, []);

  const requestLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            setLocation(data.display_name || `${latitude}, ${longitude}`);
          } catch {
            setLocation(`${latitude}, ${longitude}`);
          }
        },
        () => {
          setLocation("Location unavailable");
        }
      );
    }
  };

  const handleHoldStart = () => {
    setIsHolding(true);
    startTimeRef.current = Date.now();
    setHoldProgress(0);

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min((elapsed / 3000) * 100, 100);
      setHoldProgress(progress);
    }, 16);

    // Trigger SOS after 3 seconds
    holdTimerRef.current = setTimeout(() => {
      handleEmergencyAction();
    }, 3000);
  };

  const handleHoldEnd = () => {
    setIsHolding(false);
    setHoldProgress(0);

    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const handleEmergencyAction = async () => {
    handleHoldEnd();

    // For authenticated users with contacts, trigger SOS immediately
    if (userType === "authenticated") {
      console.log(
        "Authenticated user - refreshing contacts before emergency action..."
      );
      const hasContactsNow = await checkEmergencyContacts();

      if (hasContactsNow) {
        console.log("Contacts found! Triggering SOS with saved contacts...");
        await triggerSOSAlertForAuthenticatedUser();
        return;
      }
    }

    // For guests or authenticated users without contacts, show modal
    const guestReady = await activateGuestMode();
    if (!guestReady) {
      return;
    }

    setShowModal(true);
  };

  // Trigger SOS for authenticated users with registered contacts
  const triggerSOSAlertForAuthenticatedUser = async () => {
    setIsTriggering(true);

    try {
      console.log("=== Triggering SOS Alert for Authenticated User ===");
      console.log("User Type:", userType);
      console.log("Has Contacts:", hasContacts);
      console.log(
        "Token:",
        localStorage.getItem("token") ? "Present" : "Missing"
      );

      const payload = {
        location: location ? { address: location } : undefined,
        customNote: "Emergency SOS Alert triggered via HerHaven",
        wasOffline: !navigator.onLine,
        metadata: {
          triggeredFrom: "EmergencyButton",
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          userType: "authenticated",
        },
      };

      console.log("SOS Payload:", JSON.stringify(payload, null, 2));
      console.log("Sending authenticated SOS request to /api/sos/trigger...");

      const response = await triggerSOS(payload);
      console.log("SOS Response:", response);

      if (response.success) {
        showAlert(
          "SOS alert has been sent to your emergency contacts successfully!",
          "SOS Alert Sent",
          "success"
        );
      } else {
        showAlert(
          response.message || "Failed to send SOS alert. Please try again.",
          "SOS Alert Failed",
          "danger"
        );
      }
    } catch (error) {
      console.error("SOS Trigger Error:", error);
      showAlert(
        "An error occurred while sending the SOS alert. Please try again or call emergency services.",
        "Error",
        "danger"
      );
    } finally {
      setIsTriggering(false);
    }
  };

  // Trigger SOS for guest users with custom contacts
  const triggerSOSAlert = async (guestContactsData?: GuestContact[]) => {
    setIsTriggering(true);

    try {
      console.log("=== Triggering SOS Alert for Guest User ===");
      console.log("Guest Contacts Data:", guestContactsData);

      console.log("Using guest session...");
      const sessionId = await ensureGuestSession();
      if (!sessionId) {
        console.error("Failed to get guest session");
        return;
      }
      const guestSessionId = sessionId;
      console.log("Guest Session ID:", guestSessionId);

      const payload = {
        location: location ? { address: location } : undefined,
        customNote: "Emergency SOS Alert triggered via HerHaven",
        wasOffline: !navigator.onLine,
        metadata: {
          triggeredFrom: "EmergencyButton",
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          userType: "guest",
        },
        guestSessionId,
        guestContacts: guestContactsData,
      };

      console.log("SOS Payload:", JSON.stringify(payload, null, 2));
      console.log("Sending SOS request...");

      const response = await triggerQuickSOS(payload);
      console.log("SOS Response:", response);

      if (response.success) {
        showAlert(
          "SOS alert has been sent to your emergency contacts successfully!",
          "SOS Alert Sent",
          "success"
        );
        setShowModal(false);
        setGuestContacts([{ phoneNumber: "" }]);
      } else {
        showAlert(
          response.message || "Failed to send SOS alert. Please try again.",
          "SOS Alert Failed",
          "danger"
        );
      }
    } catch (error) {
      console.error("SOS Trigger Error:", error);
      showAlert(
        "An error occurred while sending the SOS alert. Please try again or call emergency services.",
        "Error",
        "danger"
      );
    } finally {
      setIsTriggering(false);
    }
  };

  const handleGuestSubmit = async () => {
    // Validate guest contacts
    const validContacts = guestContacts.filter((contact) =>
      contact.phoneNumber.trim()
    );

    if (validContacts.length === 0) {
      showAlert(
        "Please add at least one emergency contact.",
        "Validation Error",
        "warning"
      );
      return;
    }

    // Validate phone numbers
    const invalidPhone = validContacts.find(
      (contact) => !validatePhoneNumber(contact.phoneNumber)
    );

    if (invalidPhone) {
      showAlert(
        "Please enter valid phone numbers.",
        "Invalid Phone Number",
        "warning"
      );
      return;
    }

    const formattedContacts: GuestContact[] = validContacts.map(
      (contact, index) => ({
        name: `Emergency Contact ${index + 1}`,
        phoneNumber: contact.phoneNumber,
        relationship: "other",
      })
    );

    await triggerSOSAlert(formattedContacts);
  };

  const addGuestContact = () => {
    if (guestContacts.length < 3) {
      setGuestContacts([...guestContacts, { phoneNumber: "" }]);
    }
  };

  const removeGuestContact = (index: number) => {
    if (guestContacts.length > 1) {
      setGuestContacts(guestContacts.filter((_, i) => i !== index));
    }
  };

  const updateGuestContact = (index: number, value: string) => {
    const updated = [...guestContacts];
    updated[index] = { ...updated[index], phoneNumber: value };
    setGuestContacts(updated);
  };

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <>
      {/* Unified Emergency Button */}
      <button
        onMouseDown={handleHoldStart}
        onMouseUp={handleHoldEnd}
        onMouseLeave={handleHoldEnd}
        onTouchStart={handleHoldStart}
        onTouchEnd={handleHoldEnd}
        onTouchCancel={handleHoldEnd}
        className="fixed bottom-8 left-8 w-16 h-16 rounded-full shadow-2xl transform transition-all duration-200 ease-out focus:outline-none z-50 group"
        style={{
          background: isHolding
            ? `conic-gradient(#ef4444 ${holdProgress}%, #dc2626 ${holdProgress}%)`
            : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
          transform: isHolding ? "scale(1.1)" : "scale(1)",
        }}
        aria-label="Emergency - Hold for 3 seconds"
        title="Hold for 3 seconds to trigger emergency"
      >
        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity" />

        {/* Inner circle */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center">
          <AlertTriangle
            className={`w-7 h-7 text-white transition-transform duration-200 ${
              isHolding ? "animate-pulse scale-110" : ""
            }`}
          />
        </div>

        {/* Ripple effect when holding */}
        {isHolding && (
          <>
            <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping opacity-75" />
            <div className="absolute inset-0 rounded-full border-2 border-red-300 animate-pulse" />
          </>
        )}
      </button>

      {/* Progress indicator text */}
      {isHolding && (
        <div className="fixed bottom-24 left-8 bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-semibold z-50 animate-fade-in">
          Hold to trigger emergency...{" "}
          {Math.ceil((3000 - (holdProgress / 100) * 3000) / 1000)}s
        </div>
      )}

      {/* Emergency Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-t-2xl p-6 relative">
              <button
                onClick={() => {
                  setShowModal(false);
                  setGuestContacts([{ phoneNumber: "" }]);
                }}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Emergency Assistance
                  </h2>
                  <p className="text-red-100 text-sm">
                    Call emergency services or send SOS alert
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Emergency Call Numbers Section */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-red-600" />
                  Emergency Hotlines (24/7)
                </h3>
                <div className="space-y-2">
                  {hardcodedEmergencyContacts.map((contact, index) => (
                    <button
                      key={index}
                      onClick={() => handleCall(contact.number)}
                      className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-md transition-all border border-gray-100 hover:border-gray-200 group"
                    >
                      <div className="flex-1 text-left">
                        <h4 className="font-semibold text-gray-800">
                          {contact.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {contact.number}
                        </p>
                      </div>
                      <PhoneCall className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">
                    OR
                  </span>
                </div>
              </div>

              {/* SOS Alert Section */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Send SOS Alert to Your Contacts
                </h3>

                {/* Location Info */}
                {location && (
                  <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3 mb-4">
                    <MapPin className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        Your Location
                      </p>
                      <p className="text-sm text-gray-600">{location}</p>
                    </div>
                  </div>
                )}

                {/* Guest Contacts Form */}
                <div className="space-y-4">
                  {guestContacts.map((contact, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-xl p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-800">
                          Contact {index + 1}
                        </h4>
                        {guestContacts.length > 1 && (
                          <button
                            onClick={() => removeGuestContact(index)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            value={contact.phoneNumber}
                            onChange={(e) => {
                              const sanitizedValue = sanitizePhoneInput(
                                e.target.value
                              );
                              updateGuestContact(index, sanitizedValue);
                            }}
                            maxLength={16}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="+2507xxxxxxxx"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {guestContacts.length < 3 && (
                    <button
                      onClick={addGuestContact}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-red-400 hover:text-red-600 transition-all font-medium"
                    >
                      + Add Another Contact (up to 3)
                    </button>
                  )}
                </div>
              </div>

              {/* Info message */}
              <div className="bg-red-50 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-semibold text-red-700 mb-1">
                    Important Information
                  </p>
                  <p>
                    Your emergency contacts will receive an SMS with your
                    location and a message that you need help. Make sure the
                    phone numbers are correct and can receive SMS messages.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setGuestContacts([{ phoneNumber: "" }]);
                  }}
                  disabled={isTriggering}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGuestSubmit}
                  disabled={isTriggering}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {isTriggering ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending SOS...
                    </span>
                  ) : (
                    "Send SOS Alert"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UnifiedEmergencyButton;
