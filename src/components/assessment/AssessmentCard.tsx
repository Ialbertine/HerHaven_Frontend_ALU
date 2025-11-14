import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, CheckCircle } from 'lucide-react';
import { type AssessmentTemplate } from '@/apis/assessment';
import { getCategoryInfo } from '@/utils/assessmentHelper';

interface AssessmentCardProps {
  template: AssessmentTemplate;
  showStats?: boolean;
}

export const AssessmentCard: React.FC<AssessmentCardProps> = ({
  template,
  showStats = true
}) => {
  const categoryInfo = getCategoryInfo(template.category);

  return (
    <div className="bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-gray-100 flex flex-col h-full">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          {categoryInfo.icon && (
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
              style={{ backgroundColor: `${categoryInfo.color}20` }}
            >
              {categoryInfo.icon}
            </div>
          )}
          <h3 className="text-lg font-bold text-gray-800 line-clamp-2">
            {template.name}
          </h3>
        </div>
        <span
          className="text-xs font-medium px-2 py-1 rounded-full inline-block"
          style={{
            backgroundColor: `${categoryInfo.color}20`,
            color: categoryInfo.color
          }}
        >
          {categoryInfo.name}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-grow">
        {template.description}
      </p>

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{template.estimatedDuration} min</span>
        </div>
        {template.questions && template.questions.length > 0 && (
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{template.questions.length} questions</span>
          </div>
        )}
        {showStats && template.totalResponses && (
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{template.totalResponses} taken</span>
          </div>
        )}
      </div>

      {/* CTA Button */}
      <Link to={`/assessment/take/${template._id}`}>
        <button className="w-full bg-gradient-to-r from-[#9027b0] to-[#9c27b0] text-white px-4 py-2.5 rounded-lg font-semibold text-sm shadow-md hover:shadow-lg hover:from-[#7b1fa2] hover:to-[#8e24aa] transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2">
          Take Assessment
          <span>→</span>
        </button>
      </Link>
    </div>
  );
};

export default AssessmentCard;

