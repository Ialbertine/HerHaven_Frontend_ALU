import React from 'react';
import { getSeverityInfo } from '@/utils/assessmentHelper';
import type { AssessmentTemplate } from '@/apis/assessment';

interface ScoreVisualizationProps {
  score: number;
  maxScore: number;
  severityLevel?: string | null;
  template?: AssessmentTemplate | null;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export const ScoreVisualization: React.FC<ScoreVisualizationProps> = ({
  score,
  maxScore,
  severityLevel,
  template,
  className = '',
  size = 'medium',
}) => {
  const severityInfo = getSeverityInfo(severityLevel, template || undefined);
  const percentage = (score / maxScore) * 100;

  const sizeConfig = {
    small: {
      container: 'w-24 h-24',
      text: 'text-lg',
      labelText: 'text-xs',
      strokeWidth: 6,
    },
    medium: {
      container: 'w-40 h-40',
      text: 'text-3xl',
      labelText: 'text-sm',
      strokeWidth: 8,
    },
    large: {
      container: 'w-56 h-56',
      text: 'text-5xl',
      labelText: 'text-base',
      strokeWidth: 10,
    },
  };

  const config = sizeConfig[size];
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Circular Progress */}
      <div className={`${config.container} relative`}>
        <svg className="transform -rotate-90 w-full h-full">
          {/* Background circle */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={config.strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke={severityInfo.color}
            strokeWidth={config.strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.1))',
            }}
          />
        </svg>

        {/* Score in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${config.text} font-bold`} style={{ color: severityInfo.color }}>
            {score}
          </span>
          <span className={`${config.labelText} text-gray-500 font-medium`}>
            of {maxScore}
          </span>
        </div>
      </div>

      {/* Severity badge */}
      <div
        className="mt-4 px-6 py-2 rounded-full font-bold text-center shadow-sm"
        style={{
          backgroundColor: severityInfo.bgColor,
          color: severityInfo.color
        }}
      >
        <span className="text-lg mr-2">{severityInfo.icon}</span>
        <span>{severityInfo.label}</span>
      </div>

      {/* Progress bar alternative for small screens */}
      <div className="w-full mt-4 md:hidden">
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-1000 ease-out rounded-full"
            style={{
              width: `${percentage}%`,
              backgroundColor: severityInfo.color,
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>0</span>
          <span className="font-semibold" style={{ color: severityInfo.color }}>
            {score}
          </span>
          <span>{maxScore}</span>
        </div>
      </div>
    </div>
  );
};

export default ScoreVisualization;

