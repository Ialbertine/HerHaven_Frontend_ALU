import React, { useState } from "react";
import { Phone, X, PhoneCall, AlertCircle } from "lucide-react";

interface EmergencyContact {
  name: string;
  number: string;
  type: "crisis";
}

const EmergencyCallButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const emergencyContacts: EmergencyContact[] = [
    {
      name: "Isange One Stop Center(GBV)",
      number: "3029",
      type: "crisis",
    },
    {
      name: "Rwanda Investigation Bureau(RIB)",
      number: "3212",
      type: "crisis",
    },
    {
      name: "Emergency Services",
      number: "112",
      type: "crisis",
    },
  ];

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <>
      {/* Emergency Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 left-8 w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-lg hover:shadow-2xl hover:from-red-600 hover:to-red-700 transform transition duration-200 ease-out hover:scale-105 flex items-center justify-center group z-50 focus:outline-none active:scale-95"
        aria-label="Emergency Call"
      >
        <Phone className="w-5 h-5 text-white" />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-[#9c27b0] to-[#7b2cbf] rounded-t-2xl p-6 relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-[#9c27b0]/25 to-[#7b2cbf]/25 rounded-full flex items-center justify-center hover:from-[#9c27b0]/35 hover:to-[#7b2cbf]/35 transition-all"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#9c27b0]/25 to-[#7b2cbf]/25 rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Emergency Call Options
                  </h2>
                  <p className="text-red-100 text-sm">Help is available 24/7</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
              {emergencyContacts.map((contact, index) => {
                return (
                  <button
                    key={index}
                    onClick={() => handleCall(contact.number)}
                    className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-md transition-all border border-gray-100 hover:border-gray-200 group"
                  >
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-gray-800">
                        {contact.name}
                      </h3>
                      <p className="text-sm text-gray-600">{contact.number}</p>
                    </div>
                    <PhoneCall className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                  </button>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-b-2xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  If you're experiencing a medical emergency, please call 912
                  immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmergencyCallButton;
