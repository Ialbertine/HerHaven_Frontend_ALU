import React, { useState, useEffect } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';

interface EmbeddedMeetingProps {
  meetingUrl: string;
  meetingId: string;
  onMeetingEnd: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const EmbeddedMeeting: React.FC<EmbeddedMeetingProps> = ({
  meetingUrl,
  meetingId,
  onMeetingEnd,
  isFullscreen = false,
  onToggleFullscreen
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Set loading to false after iframe loads
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg ${isFullscreen ? 'fixed inset-0 z-50' : 'w-full h-96'}`}>
      {/* Meeting Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="font-medium">Live Session</span>
          <span className="text-sm opacity-80">ID: {meetingId}</span>
        </div>

        <div className="flex items-center gap-2">
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={onMeetingEnd}
            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
            title="End Meeting"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Meeting Container */}
      <div className={`relative ${isFullscreen ? 'h-[calc(100vh-80px)]' : 'h-80'}`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading meeting...</p>
            </div>
          </div>
        )}

        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Meeting Failed to Load</h3>
              <p className="text-gray-600 mb-4">There was an issue connecting to the meeting.</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => window.open(meetingUrl, '_blank')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Open in New Tab
                </button>
                <button
                  onClick={() => {
                    setHasError(false);
                    setIsLoading(true);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        <iframe
          src={meetingUrl}
          className="w-full h-full border-0"
          allow="camera; microphone; fullscreen; display-capture"
          allowFullScreen
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          title={`Meeting ${meetingId}`}
        />
      </div>

      {/* Meeting Controls (Optional) */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Connected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open(meetingUrl, '_blank')}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Open in New Tab
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmbeddedMeeting;
