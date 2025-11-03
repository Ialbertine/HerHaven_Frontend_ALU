import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertTriangle, Loader2, CheckCircle, Phone, Home } from "lucide-react";
import {
  triggerSOS,
  getCurrentLocation,
  getDeviceInfo,
  getFallbackLocation,
  saveFallbackLocation,
  createGuestSession,
} from "@/apis/sos";
import toast from "react-hot-toast";

const EmergencySOSPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isTriggering, setIsTriggering] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [showManualTrigger, setShowManualTrigger] = useState(false);

  const autoTrigger = searchParams.get("trigger") === "true";

  useEffect(() => {
    if (autoTrigger) {
      // Auto-trigger with countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSOSTrigger();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setShowManualTrigger(true);
    }
  }, [autoTrigger]);

  const handleSOSTrigger = async () => {
    setIsTriggering(true);
    setError(null);

    try {
      // Check if user is authenticated
      const token = localStorage.getItem("token");
      let guestSessionId = localStorage.getItem("guestSessionId");
      let accessType = localStorage.getItem("accessType");

      // If not authenticated and no guest session, create one
      if (!token && (!guestSessionId || accessType !== "guest")) {
        toast.loading("Setting up emergency session...");
        const guestResponse = await createGuestSession();
        toast.dismiss();

        if (!guestResponse.success) {
          throw new Error("Failed to create emergency session");
        }

        // Refresh values so the SOS payload is accurate
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
            latitude: -1.9441, // Kigali default
            longitude: 30.0619,
            accuracy: 0,
          };
          toast.error("Location unavailable, using default location");
        }
      }

      // Get device info
      const deviceInfo = getDeviceInfo();

      // Prepare SOS request
      const sosRequest = {
        location: locationData,
        fallbackLocation,
        customNote: "Emergency SOS triggered from HerHaven PWA shortcut",
        metadata: {
          userAgent: deviceInfo.userAgent,
          deviceInfo: deviceInfo.deviceInfo,
          browserName: deviceInfo.browserName,
          osName: deviceInfo.osName,
        },
        wasOffline: !navigator.onLine,
        guestSessionId:
          !token && accessType === "guest"
            ? guestSessionId || undefined
            : undefined,
      };

      // Trigger SOS (axiosConfig will handle authentication automatically)
      const response = await triggerSOS(sosRequest);

      if (response.success) {
        setAlertSent(true);
        toast.success(response.message || "SOS alert sent successfully!");
      } else {
        setError(response.error || "Failed to send SOS alert");
        toast.error(response.error || "Failed to send SOS alert");
      }
    } catch (error) {
      console.error("Error triggering SOS:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while sending SOS alert";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsTriggering(false);
    }
  };

  const handleCancelCountdown = () => {
    setCountdown(0);
    setShowManualTrigger(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Countdown Screen */}
        {countdown > 0 && !showManualTrigger && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center space-y-6 animate-in fade-in zoom-in">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Emergency SOS
              </h1>
              <p className="text-gray-600">
                Alert will be sent in {countdown} second
                {countdown !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="#fee2e2"
                  strokeWidth="8"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (countdown / 5)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl font-bold text-red-600">
                  {countdown}
                </span>
              </div>
            </div>

            <button
              onClick={handleCancelCountdown}
              className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Manual Trigger Screen */}
        {showManualTrigger && !isTriggering && !alertSent && !error && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center space-y-6 animate-in fade-in zoom-in">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Emergency SOS
              </h1>
              <p className="text-gray-600">
                Press the button below to send an emergency alert to your
                contacts
              </p>
            </div>

            <button
              onClick={handleSOSTrigger}
              className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold text-lg rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg"
            >
              Send Emergency Alert
            </button>

            <button
              onClick={() => navigate("/")}
              className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Go to Home
            </button>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-left">
              <p className="text-sm text-orange-800">
                <strong>What happens:</strong>
                <br />• Your emergency contacts will be notified
                <br />• They'll receive your location
                <br />• Help will be on the way
              </p>
            </div>
          </div>
        )}

        {/* Triggering Screen */}
        {isTriggering && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center space-y-6 animate-in fade-in zoom-in">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Sending Alert...
              </h1>
              <p className="text-gray-600">
                Please wait while we notify your emergency contacts
              </p>
            </div>
          </div>
        )}

        {/* Success Screen */}
        {alertSent && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center space-y-6 animate-in fade-in zoom-in">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Alert Sent Successfully!
              </h1>
              <p className="text-gray-600">
                Your emergency contacts have been notified
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
              <p className="text-sm text-green-800">
                <strong>What happens next:</strong>
                <br />• Your contacts received SMS/Email alerts
                <br />• They can see your location
                <br />• Help is on the way
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => navigate("/")}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Go to Home
              </button>

              <a
                href="tel:112"
                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Call Emergency Services (112)
              </a>
            </div>
          </div>
        )}

        {/* Error Screen */}
        {error && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center space-y-6 animate-in fade-in zoom-in">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Alert Failed
              </h1>
              <p className="text-gray-600">{error}</p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
              <p className="text-sm text-red-800">
                <strong>Alternative options:</strong>
                <br />• Call emergency services: 112
                <br />• Isange One Stop Center: 3029
                <br />• Rwanda Investigation Bureau: 3212
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleSOSTrigger}
                className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg transition-all"
              >
                Try Again
              </button>

              <a
                href="tel:112"
                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Call Emergency Services (112)
              </a>

              <button
                onClick={() => navigate("/")}
                className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Go to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencySOSPage;
