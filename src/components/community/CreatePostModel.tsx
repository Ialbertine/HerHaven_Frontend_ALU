import React, { useState } from 'react';
import { X, Tag, Eye, EyeOff } from 'lucide-react';
import { createPost, type CreatePostData } from '@/apis/community';

interface CreatePostModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onSuccess }) => {
  // Check if user is a guest
  const isGuest = localStorage.getItem('accessType') === 'guest';

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

  const handleSubmit = async () => {
    setError('');

    if (!formData.title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (!formData.content.trim()) {
      setError('Please enter content');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createPost(formData);
      if (response.success) {
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
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Create New Post
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Anonymous Toggle */}
          <div className={`flex items-center justify-between p-4 rounded-lg ${isGuest ? 'bg-green-50 border border-green-200' : 'bg-purple-50'
            }`}>
            <div className="flex items-center gap-3">
              {formData.isAnonymous ? (
                <EyeOff className={`w-5 h-5 ${isGuest ? 'text-green-600' : 'text-purple-600'}`} />
              ) : (
                <Eye className={`w-5 h-5 ${isGuest ? 'text-green-600' : 'text-purple-600'}`} />
              )}
              <div>
                <p className="font-semibold text-gray-800">
                  {isGuest ? 'Posting as Anonymous Guest' : 'Post Anonymously'}
                </p>
                <p className="text-sm text-gray-600">
                  {isGuest
                    ? 'As a guest, your identity will remain hidden'
                    : 'Your identity will be hidden'
                  }
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => !isGuest && setFormData(prev => ({ ...prev, isAnonymous: !prev.isAnonymous }))}
              disabled={isGuest}
              className={`relative w-14 h-7 rounded-full transition-all ${formData.isAnonymous
                ? (isGuest ? 'bg-green-600' : 'bg-purple-600')
                : 'bg-gray-300'
                } ${isGuest ? 'cursor-not-allowed opacity-75' : ''}`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${formData.isAnonymous ? 'translate-x-8' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Give your post a title..."
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
              rows={8}
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
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
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
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;