import React from 'react';
import { AlertTriangle, Phone, MessageSquare, ExternalLink } from 'lucide-react';
import { getCrisisResources, type CrisisResource } from '@/utils/assessmentHelper';

interface CrisisAlertProps {
  onClose?: () => void;
  showClose?: boolean;
}

export const CrisisAlert: React.FC<CrisisAlertProps> = ({
  onClose,
  showClose = false
}) => {
  const resources = getCrisisResources();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 p-6 rounded-t-2xl">
          <div className="flex items-center gap-3 text-white">
            <AlertTriangle className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Immediate Support Available</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <p className="text-red-800 font-semibold mb-2">
              Your responses indicate you may be experiencing a crisis.
            </p>
            <p className="text-red-700">
              Your safety is our priority. Please reach out to one of these resources immediately.
            </p>
          </div>

          {/* Crisis Resources */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800">24/7 Crisis Support</h3>

            {resources.map((resource: CrisisResource, index: number) => (
              <div
                key={index}
                className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {index === 1 ? (
                      <MessageSquare className="w-5 h-5 text-purple-600" />
                    ) : (
                      <Phone className="w-5 h-5 text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 mb-1">{resource.name}</h4>
                    <p className="text-2xl font-bold text-purple-600 mb-1">
                      {resource.phone}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">{resource.description}</p>
                    <span className="inline-block text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      {resource.available}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Support */}
          <div className="bg-purple-50 rounded-xl p-4">
            <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Additional Resources
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Visit your nearest emergency room</li>
              <li>• Call 911 for immediate emergency assistance</li>
              <li>• Contact a trusted friend, family member, or counselor</li>
              <li>• Use our emergency chat feature (button in bottom right)</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="tel:988"
              className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold text-center hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5" />
              Call 988 Now
            </a>
            {showClose && onClose && (
              <button
                onClick={onClose}
                className="flex-1 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
              >
                Continue
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500 text-center">
            You are not alone. Help is available, and people care about you.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CrisisAlert;

