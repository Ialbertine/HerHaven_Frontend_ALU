import React from 'react';
import { type AssessmentQuestion } from '@/apis/assessment';

interface QuestionRendererProps {
  question: AssessmentQuestion;
  answer: string | number | (string | number)[] | undefined;
  onAnswerChange: (answer: string | number | (string | number)[]) => void;
  className?: string;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  answer,
  onAnswerChange,
  className = '',
}) => {
  const handleSingleChoice = (value: string | number) => {
    onAnswerChange(value);
  };

  const handleMultipleChoice = (value: string | number) => {
    const currentAnswers = Array.isArray(answer) ? answer : [];
    const newAnswers = currentAnswers.includes(value)
      ? currentAnswers.filter((a) => a !== value)
      : [...currentAnswers, value];
    onAnswerChange(newAnswers);
  };

  const handleScaleChange = (value: number) => {
    onAnswerChange(value);
  };

  const handleTextChange = (value: string) => {
    onAnswerChange(value);
  };

  const renderSingleChoice = () => (
    <div className="space-y-3">
      {question.options?.map((option, index) => {
        const isSelected = answer === option.value;
        return (
          <label
            key={index}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:border-purple-300 hover:bg-purple-50 ${isSelected
              ? 'border-purple-500 bg-purple-50 shadow-md'
              : 'border-gray-200 bg-white'
              }`}
          >
            <input
              type="radio"
              name={question.questionId}
              value={option.value}
              checked={isSelected}
              onChange={() => handleSingleChoice(option.value)}
              className="w-5 h-5 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
            />
            <span className={`text-base ${isSelected ? 'font-semibold text-gray-800' : 'text-gray-700'}`}>
              {option.label}
            </span>
          </label>
        );
      })}
    </div>
  );

  const renderMultipleChoice = () => (
    <div className="space-y-3">
      {question.options?.map((option, index) => {
        const isSelected = Array.isArray(answer) && answer.includes(option.value);
        return (
          <label
            key={index}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:border-purple-300 hover:bg-purple-50 ${isSelected
              ? 'border-purple-500 bg-purple-50 shadow-md'
              : 'border-gray-200 bg-white'
              }`}
          >
            <input
              type="checkbox"
              value={option.value}
              checked={isSelected}
              onChange={() => handleMultipleChoice(option.value)}
              className="w-5 h-5 text-purple-500 rounded focus:ring-purple-500 focus:ring-offset-0"
            />
            <span className={`text-base ${isSelected ? 'font-semibold text-gray-800' : 'text-gray-700'}`}>
              {option.label}
            </span>
          </label>
        );
      })}
    </div>
  );

  const renderScale = () => {
    const scaleValue = typeof answer === 'number' ? answer : 5;
    const maxValue = question.options?.length ? question.options[question.options.length - 1].value : 10;

    return (
      <div className="space-y-4">
        {/* Slider */}
        <div className="px-2">
          <input
            type="range"
            min={question.options?.[0]?.value || 0}
            max={maxValue}
            value={scaleValue}
            onChange={(e) => handleScaleChange(Number(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
            style={{
              background: `linear-gradient(to right, rgb(168, 85, 247) 0%, rgb(168, 85, 247) ${(scaleValue / (maxValue as number)) * 100}%, rgb(229, 231, 235) ${(scaleValue / (maxValue as number)) * 100}%, rgb(229, 231, 235) 100%)`,
            }}
          />
        </div>

        {/* Scale labels */}
        <div className="flex justify-between text-sm text-gray-600 px-2">
          {question.options?.map((option, index) => (
            <span key={index} className="text-center">
              {option.label}
            </span>
          ))}
        </div>

        {/* Current value display */}
        <div className="text-center">
          <span className="inline-block px-6 py-2 bg-purple-100 text-purple-700 rounded-full font-bold text-lg">
            {scaleValue}
          </span>
        </div>
      </div>
    );
  };

  const renderText = () => (
    <textarea
      value={typeof answer === 'string' ? answer : ''}
      onChange={(e) => handleTextChange(e.target.value)}
      placeholder="Type your answer here..."
      rows={4}
      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 resize-none text-gray-700 transition-all duration-200"
    />
  );

  return (
    <div className={`${className}`}>
      {/* Question text */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2 leading-relaxed">
          {question.text}
          {question.isRequired && <span className="text-red-500 ml-1">*</span>}
        </h3>
        {question.type === 'multiple-choice' && (
          <p className="text-sm text-gray-500">Select all that apply</p>
        )}
      </div>

      {/* Answer options */}
      {question.type === 'single-choice' && renderSingleChoice()}
      {question.type === 'multiple-choice' && renderMultipleChoice()}
      {question.type === 'scale' && renderScale()}
      {question.type === 'text' && renderText()}

      {/* Crisis indicator warning */}
      {question.isCrisisIndicator && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            ⚠️ This question helps us identify if you need immediate support
          </p>
        </div>
      )}
    </div>
  );
};

export default QuestionRenderer;

