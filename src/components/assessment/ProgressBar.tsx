import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  className = ''
}) => {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className={`w-full ${className}`}>
      {/* Progress text */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Question {current} of {total}
        </span>
        <span className="text-sm font-semibold text-purple-600">
          {percentage}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        >
          <div className="h-full w-full bg-gradient-to-r from-transparent to-white opacity-30 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;

