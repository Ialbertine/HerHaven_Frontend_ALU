import React, { useState, useRef, useEffect } from "react";
import { AlertTriangle, Loader2, CheckCircle, XCircle } from "lucide-react";
import {
  triggerSOS,
  getCurrentLocation,
  getFallbackLocation,
  saveFallbackLocation,
  createGuestSession,
} from "@/apis/sos";
import { queueOfflineSOS } from "@/utils/offlineSOSQueue";
import toast from "react-hot-toast";

const HOLD_DURATION = 3000; // 3 seconds hold to trigger

interface SOSButtonProps {
  className?: string;
}

const SOSButton: React.FC<SOSButtonProps> = ({ className = "" }) => {
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isTriggering, setIsTriggering] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [alertSent, setAlertSent] = useState(false);

  const holdTimerRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (progressIntervalRef.current)
        clearInterval(progressIntervalRef.current);
    };
  }, []);

  const startHold = () => {
    setIsHolding(true);
    setHoldProgress(0);
    startTimeRef.current = Date.now();

    // Update progress every 50ms
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setHoldProgress(progress);
    }, 50);

    // Trigger SOS after hold duration
    holdTimerRef.current = setTimeout(() => {
      handleSOSTrigger();
    }, HOLD_DURATION);
  };

  const cancelHold = () => {
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

  const handleSOSTrigger = async () => {
    cancelHold();
    setIsTriggering(true);

    try {
      const isOffline = !navigator.onLine;
      const token = localStorage.getItem("token");
      let guestSessionId = localStorage.getItem("guestSessionId");
      let accessType = localStorage.getItem("accessType");

      // Ensure authentication before proceeding (only if online)
      if (!isOffline && !token && (!guestSessionId || accessType !== "guest")) {
        toast.loading("Setting up emergency access...");
        const guestResponse = await createGuestSession();
        toast.dismiss();

        if (!guestResponse.success) {
          toast.error("Unable to set up emergency access. Please try again.");
          setIsTriggering(false);
          return;
        }

        // Refresh session data so the trigger request can include it
        guestSessionId = localStorage.getItem("guestSessionId");
        accessType = localStorage.getItem("accessType");
      }

      // Get current location
      let locationData;
      let fallbackLocation;

      try {
        const position = await getCurrentLocation();
        locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        // Save as fallback for future
        saveFallbackLocation(locationData.latitude, locationData.longitude);
      } catch (locationError) {
        console.error("Failed to get current location:", locationError);

        // Try to use fallback location
        const savedLocation = getFallbackLocation();
        if (savedLocation) {
          fallbackLocation = savedLocation;
          locationData = {
            latitude: savedLocation.latitude || 0,
            longitude: savedLocation.longitude || 0,
            accuracy: 0,
          };
          toast.error("Using last known location");
        } else {
          // Use default location if no fallback available
          locationData = {
            latitude: -1.9441,
            longitude: 30.0619,
            accuracy: 0,
          };
          toast.error("Location unavailable, using default location");
        }
      }

      // Prepare simplified SOS alert request (only location and alert data)
      const sosRequest = {
        location: locationData,
        fallbackLocation,
        customNote: "Emergency SOS alert triggered from HerHaven app",
        wasOffline: isOffline,
        guestSessionId:
          !token && accessType === "guest"
            ? guestSessionId || undefined
            : undefined,
      };

      // If offline, queue the request
      if (isOffline) {
        queueOfflineSOS(sosRequest);
        toast.success(
          "You're offline. SOS alert queued and will be sent when back online."
        );
        setAlertSent(true);
        setShowConfirmation(true);

        setTimeout(() => {
          setShowConfirmation(false);
          setAlertSent(false);
        }, 5000);

        setIsTriggering(false);
        return;
      }

      // Trigger SOS alert (online)
      const response = await triggerSOS(sosRequest);

      if (response.success) {
        setAlertSent(true);
        setShowConfirmation(true);
        toast.success(response.message || "SOS alert sent successfully!");

        // Auto-hide confirmation after 5 seconds
        setTimeout(() => {
          setShowConfirmation(false);
          setAlertSent(false);
        }, 5000);
      } else {
        toast.error(response.error || "Failed to send SOS alert");
        setShowConfirmation(true);

        setTimeout(() => {
          setShowConfirmation(false);
        }, 5000);
      }
    } catch (error) {
      console.error("Error triggering SOS:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while sending SOS alert";
      toast.error(errorMessage);
      setShowConfirmation(true);

      setTimeout(() => {
        setShowConfirmation(false);
      }, 5000);
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <>
      {/* SOS Button */}
      <button
        onMouseDown={startHold}
        onMouseUp={cancelHold}
        onMouseLeave={cancelHold}
        onTouchStart={startHold}
        onTouchEnd={cancelHold}
        disabled={isTriggering}
        className={`fixed bottom-24 left-8 w-16 h-16 rounded-full shadow-lg hover:shadow-2xl transform transition duration-200 ease-out flex items-center justify-center z-50 focus:outline-none ${
          isHolding
            ? "bg-gradient-to-br from-orange-500 to-red-600 scale-110"
            : "bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:scale-105"
        } ${
          isTriggering ? "opacity-50 cursor-not-allowed" : "active:scale-95"
        } ${className}`}
        aria-label="Emergency SOS - Hold for 3 seconds"
        title="Hold for 3 seconds to trigger emergency SOS"
      >
        {/* Progress ring */}
        {isHolding && (
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="white"
              strokeWidth="4"
              strokeOpacity="0.3"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="white"
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${
                2 * Math.PI * 45 * (1 - holdProgress / 100)
              }`}
              strokeLinecap="round"
              className="transition-all duration-50"
            />
          </svg>
        )}

        {/* Icon */}
        {isTriggering ? (
          <Loader2 className="w-7 h-7 text-white animate-spin" />
        ) : (
          <AlertTriangle className="w-7 h-7 text-white" />
        )}
      </button>

      {/* Hold instruction tooltip */}
      {isHolding && (
        <div className="fixed bottom-44 left-8 bg-black/80 text-white px-4 py-2 rounded-lg text-sm z-50 animate-pulse">
          Hold to trigger SOS...
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div
              className={`${
                alertSent
                  ? "bg-gradient-to-r from-green-500 to-green-600"
                  : "bg-gradient-to-r from-red-500 to-red-600"
              } rounded-t-2xl p-6`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  {alertSent ? (
                    <CheckCircle className="w-7 h-7 text-white" />
                  ) : (
                    <XCircle className="w-7 h-7 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {alertSent ? "SOS Alert Sent!" : "SOS Alert Failed"}
                  </h2>
                  <p className="text-white/90 text-sm">
                    {alertSent
                      ? "Emergency contacts notified"
                      : "Unable to send alert"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {alertSent ? (
                <p className="text-gray-700 text-center">
                  Your emergency alert has been sent successfully and your
                  emergency contacts have been notified with your location.
                </p>
              ) : (
                <p className="text-gray-700 text-center">
                  Unable to send your SOS alert. Please check your connection
                  and try again.
                </p>
              )}

              <button
                onClick={() => {
                  setShowConfirmation(false);
                  setAlertSent(false);
                }}
                className={`mt-4 w-full py-3 rounded-lg font-semibold transition-colors ${
                  alertSent
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SOSButton;
