import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AlertTriangle, Shield, CheckCircle, XCircle } from "lucide-react";
import {
  triggerQuickSOS,
  triggerSOS,
  getCurrentUserType,
  type GuestContact,
} from "@/apis/sos";
import { getEmergencyContacts } from "@/apis/emergency";

const EmergencySOS: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"idle" | "triggering" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [userType, setUserType] = useState<"authenticated" | "guest" | "none">("none");
  const [hasContacts, setHasContacts] = useState(false);

  const getLocation = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
              );
              const data = await response.json();
              resolve(data.display_name || `${latitude}, ${longitude}`);
            } catch {
              resolve(`${latitude}, ${longitude}`);
            }
          },
          () => {
            resolve("Location unavailable");
          }
        );
      } else {
        resolve("Location unavailable");
      }
    });
  }, []);

  const handleTriggerSOS = useCallback(async (guestContacts?: GuestContact[]) => {
    setStatus("triggering");
    setMessage("Sending SOS alert to your emergency contacts...");

    try {
      const location = await getLocation();

      const payload = {
        location: location ? { address: location } : undefined,
        customNote: "Emergency SOS triggered via HerHaven PWA shortcut",
        wasOffline: !navigator.onLine,
        metadata: {
          triggeredFrom: "PWA-Shortcut",
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        },
      };

      let response;

      // Use different endpoints based on user type
      if (userType === "authenticated" && hasContacts) {
        response = await triggerSOS(payload);
      } else {
        const guestPayload = {
          ...payload,
          guestSessionId: userType === "guest" ? localStorage.getItem("guestSessionId") || undefined : undefined,
          guestContacts,
        };
        response = await triggerQuickSOS(guestPayload);
      }

      if (response.success) {
        setStatus("success");
        setMessage("SOS alert has been sent successfully to your emergency contacts!");
        setTimeout(() => {
          navigate(-1); // Go back to previous page
        }, 3000);
      } else {
        setStatus("error");
        setMessage(response.message || "Failed to send SOS alert. Please try again.");
      }
    } catch (error) {
      console.error("SOS Trigger Error:", error);
      setStatus("error");
      setMessage("An error occurred while sending the SOS alert.");
    }
  }, [userType, hasContacts, navigate, getLocation]);

  useEffect(() => {
    const autoTrigger = searchParams.get("trigger");
    const initSOS = async () => {
      const type = getCurrentUserType();
      setUserType(type);

      if (type === "authenticated") {
        const response = await getEmergencyContacts();
        if (response.success && response.data) {
          setHasContacts(response.data.length > 0);

          // Auto-trigger if parameter is present and user has contacts
          if (autoTrigger === "true" && response.data.length > 0) {
            await handleTriggerSOS();
          }
        }
      }
    };

    initSOS();
  }, [searchParams, handleTriggerSOS]);

  const handleGoToContacts = () => {
    navigate("/user/emergency-contacts");
  };

  const handleManualTrigger = () => {
    handleTriggerSOS();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full mb-4 shadow-lg">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Emergency SOS</h1>
          <p className="text-gray-600">Quick access to emergency alert system</p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {status === "idle" && (
            <>
              {userType === "authenticated" && hasContacts ? (
                <div className="text-center space-y-6">
                  <Shield className="w-16 h-16 text-purple-600 mx-auto" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      Emergency Alert Ready
                    </h2>
                    <p className="text-gray-600">
                      Click the button below to send an SOS alert to all your registered
                      emergency contacts immediately.
                    </p>
                  </div>
                  <button
                    onClick={handleManualTrigger}
                    className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold text-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Send SOS Alert Now
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-6">
                  <AlertTriangle className="w-16 h-16 text-amber-600 mx-auto" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      Setup Required
                    </h2>
                    <p className="text-gray-600">
                      You need to add emergency contacts before you can use the SOS feature.
                    </p>
                  </div>
                  <button
                    onClick={handleGoToContacts}
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg"
                  >
                    Add Emergency Contacts
                  </button>
                </div>
              )}
            </>
          )}

          {status === "triggering" && (
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Sending Alert...
                </h2>
                <p className="text-gray-600">{message}</p>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="text-center space-y-6">
              <CheckCircle className="w-20 h-20 text-green-600 mx-auto animate-bounce" />
              <div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">
                  Alert Sent Successfully!
                </h2>
                <p className="text-gray-600">{message}</p>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="w-full py-4 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Go Back
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="text-center space-y-6">
              <XCircle className="w-20 h-20 text-red-600 mx-auto" />
              <div>
                <h2 className="text-2xl font-bold text-red-600 mb-2">
                  Alert Failed
                </h2>
                <p className="text-gray-600">{message}</p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={handleManualTrigger}
                  className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="w-full py-4 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencySOS;

