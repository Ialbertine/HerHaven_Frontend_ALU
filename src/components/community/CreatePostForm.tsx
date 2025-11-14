import React, { useState } from 'react';
import { X, Tag, Eye, EyeOff, MessageCircle } from 'lucide-react';
import { createPost, type CreatePostData } from '@/apis/community';

interface CreatePostFormProps {
  onSuccess: () => void;
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({ onSuccess }) => {
  const userRole = localStorage.getItem('userRole');
  const isGuest = userRole === 'guest';

  const [formData, setFormData] = useState<CreatePostData>({
    title: '',
    content: '',
    tags: [],
    isAnonymous: isGuest,
  });
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const suggestedTags = [
    'Mental Health',
    'Anxiety',
    'Depression',
    'Self Care',
    'Relationships',
    'Stress Management',
    'Support',
    'Wellness'
  ];

  const handleAddTag = (tag: string) => {
    if (tag && !formData.tags?.includes(tag) && (formData.tags?.length || 0) < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      tags: [],
      isAnonymous: isGuest,
    });
    setTagInput('');
    setError('');
  };

  const handleSubmit = async () => {
    setError('');

    if (!formData.content.trim()) {
      setError('Please enter content');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createPost(formData);
      if (response.success) {
        resetForm();
        onSuccess();
      } else {
        setError(response.message || 'Failed to create post');
      }
    } catch {
      setError('An error occurred while creating the post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border-2 border-purple-100 mb-8">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <MessageCircle className="w-6 h-6 text-[#9027b0]" />
          <h3 className="text-xl font-bold text-[#9027b0]">
            Share Your Story
          </h3>
        </div>

        {/* Form Content */}
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Anonymous Toggle */}
          {isGuest ? (
            // Guest users - Always anonymous with info banner
            <div className="flex items-center gap-3 p-4 rounded-lg border bg-green-50 border-green-200">
              <EyeOff className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-800">
                  Posting as Anonymous Guest
                </p>
                <p className="text-sm text-gray-600">
                  As a guest, your identity will remain hidden
                </p>
              </div>
            </div>
          ) : (
            // Authenticated users (user, admin, counselor) - Can toggle anonymous posting
            <div className="flex items-center justify-between p-4 rounded-lg border bg-purple-50 border-purple-200">
              <div className="flex items-center gap-3">
                {formData.isAnonymous ? (
                  <EyeOff className="w-5 h-5 text-purple-600" />
                ) : (
                  <Eye className="w-5 h-5 text-purple-600" />
                )}
                <div>
                  <p className="font-semibold text-gray-800">
                    {formData.isAnonymous ? 'Posting Anonymously' : 'Posting as Yourself'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formData.isAnonymous
                      ? 'Your identity will be hidden'
                      : 'Your name will be visible to others'
                    }
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isAnonymous: !prev.isAnonymous }))}
                className={`relative w-14 h-7 rounded-full transition-all ${formData.isAnonymous ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${formData.isAnonymous ? 'translate-x-8' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Give your post a title (optional)..."
              maxLength={200}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.title.length}/200 characters
            </p>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Share your thoughts, experiences, or questions..."
              rows={6}
              maxLength={5000}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none"
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.content.length}/5000 characters
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tags (Optional)
            </label>
            <div className="flex gap-2 mb-3">
              <div className="flex-1 relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag(tagInput);
                    }
                  }}
                  placeholder="Add a tag..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                />
              </div>
              <button
                type="button"
                onClick={() => handleAddTag(tagInput)}
                className="px-4 py-2 bg-gradient-to-r from-[#9027b0] to-[#9c27b0] text-white rounded-lg hover:from-[#7b1fa2] hover:to-[#8e24aa] transition-all"
              >
                Add
              </button>
            </div>

            {/* Selected Tags */}
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-purple-900"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Suggested Tags */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Suggested tags:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedTags
                  .filter(tag => !formData.tags?.includes(tag))
                  .map((tag, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleAddTag(tag)}
                      disabled={(formData.tags?.length || 0) >= 5}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {tag}
                    </button>
                  ))}
              </div>
              {(formData.tags?.length || 0) >= 5 && (
                <p className="text-sm text-amber-600 mt-2">
                  Maximum 5 tags allowed
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-gradient-to-r from-[#9027b0] to-[#9c27b0] text-white rounded-lg hover:from-[#7b1fa2] hover:to-[#8e24aa] transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Posting...' : 'Share Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostForm;