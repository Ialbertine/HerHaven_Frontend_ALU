import React from "react";
import DashboardLayout from "@/components/DashboardLayout";

const TherapistLanding: React.FC = () => {

  return (
    <DashboardLayout userType="counselor" userName="-" notificationCount={8}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <p className="text-gray-600">
            Here's what's happening with your practice today.
          </p>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default TherapistLanding;
