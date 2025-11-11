import React from "react";
import { useSearchParams } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import UnifiedEmergencyButton from "@/components/EmergencyButton";

const EmergencySOS: React.FC = () => {
  const [searchParams] = useSearchParams();
  const shouldAutoTrigger = searchParams.get("trigger") === "true";

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

        {/* Info Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="text-center space-y-6">
            <div className="bg-red-50 rounded-xl p-6">
              {shouldAutoTrigger ? (
                <p className="text-gray-700">
                  <strong className="text-red-600">Emergency SOS is being triggered...</strong>
                  <br />
                  <span className="text-sm">
                    {" "}Your alert is being processed. If you have saved contacts, the SOS will be sent automatically.
                    Otherwise, you'll be prompted to enter emergency contact details.
                  </span>
                </p>
              ) : (
                <>
                  <p className="text-gray-700 mb-4">
                    <strong className="text-red-600">Hold the emergency button below for 3 seconds</strong> to trigger an SOS alert.
                  </p>
                  <ul className="text-left text-sm text-gray-600 space-y-2">
                    <li>✓ <strong>Authenticated users with contacts:</strong> SOS sent immediately to your saved contacts</li>
                    <li>✓ <strong>Users without contacts:</strong> Enter emergency contact numbers on the spot</li>
                    <li>✓ <strong>Guest users:</strong> Provide contact numbers to receive the alert</li>
                  </ul>
                </>
              )}
            </div>

            {!shouldAutoTrigger && (
              <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
                <AlertTriangle className="w-4 h-4" />
                <p>The button is positioned at the bottom-left corner</p>
              </div>
            )}
          </div>
        </div>

        {/* Render the Emergency Button with autoTrigger prop */}
        <UnifiedEmergencyButton autoTrigger={shouldAutoTrigger} />
      </div>
    </div>
  );
};

export default EmergencySOS;

