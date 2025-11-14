import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle, Info, ExternalLink, Calendar, BookOpen } from 'lucide-react';
import { type Recommendation } from '@/apis/assessment';

interface RecommendationCardProps {
  recommendation: Recommendation;
  className?: string;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  className = ''
}) => {
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          icon: AlertCircle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700',
          badgeBg: 'bg-red-100',
          badgeText: 'text-red-700',
          label: 'HIGH PRIORITY',
        };
      case 'medium':
        return {
          icon: CheckCircle,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          textColor: 'text-amber-700',
          badgeBg: 'bg-amber-100',
          badgeText: 'text-amber-700',
          label: 'RECOMMENDED',
        };
      case 'low':
      default:
        return {
          icon: Info,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-700',
          badgeBg: 'bg-blue-100',
          badgeText: 'text-blue-700',
          label: 'SUGGESTED',
        };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return Calendar;
      case 'resource':
        return BookOpen;
      case 'action':
      default:
        return CheckCircle;
    }
  };

  const config = getPriorityConfig(recommendation.priority);
  const Icon = config.icon;
  const TypeIcon = getTypeIcon(recommendation.type);

  return (
    <div
      className={`${config.bgColor} ${config.borderColor} border-2 rounded-xl p-5 ${className} transition-all duration-200 hover:shadow-md`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 ${config.badgeBg} rounded-lg flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${config.badgeText}`} />
          </div>
          <span className={`text-xs font-bold ${config.badgeText}`}>
            {config.label}
          </span>
        </div>
        <div className={`w-6 h-6 ${config.badgeBg} rounded-full flex items-center justify-center`}>
          <TypeIcon className={`w-4 h-4 ${config.badgeText}`} />
        </div>
      </div>

      {/* Content */}
      <h4 className="font-bold text-gray-800 mb-2 text-lg">
        {recommendation.title}
      </h4>
      <p className={`text-sm ${config.textColor} mb-4 leading-relaxed`}>
        {recommendation.description}
      </p>

      {/* Action Button */}
      {recommendation.link && (
        <>
          {recommendation.link.startsWith('http') ? (
            <a
              href={recommendation.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-4 py-2 ${config.badgeBg} ${config.badgeText} rounded-lg font-semibold text-sm hover:shadow-md transition-all duration-200`}
            >
              Learn More
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <Link
              to={recommendation.link}
              className={`inline-flex items-center gap-2 px-4 py-2 ${config.badgeBg} ${config.badgeText} rounded-lg font-semibold text-sm hover:shadow-md transition-all duration-200`}
            >
              {recommendation.type === 'appointment' ? 'Schedule Now' : 'View Resource'}
              <ExternalLink className="w-4 h-4" />
            </Link>
          )}
        </>
      )}
    </div>
  );
};

export default RecommendationCard;

