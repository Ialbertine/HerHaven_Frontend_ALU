import React, { useState, useEffect, useCallback } from 'react';
import { X, Heart, MessageSquare, Send, MoreVertical, Trash2, Eye, EyeOff } from 'lucide-react';
import {
  type Post,
  type Comment,
  likePost,
  getPostComments,
  createComment,
  likeComment,
  deleteComment
} from '@/apis/community';
import { getCurrentUser } from '@/apis/auth';
import { useModal } from '@/contexts/useModal';

interface PostDetailModalProps {
  post: Post;
  onClose: () => void;
  onUpdate: () => void;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({ post, onClose }) => {
  const { showDeleteConfirm } = useModal();
  const currentUser = getCurrentUser();
  
  // Check if current user has already liked this post
  const [liked, setLiked] = useState(() => {
    if (!currentUser?.id) return false;
    return post.likes.includes(currentUser.id);
  });
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [showCommentMenu, setShowCommentMenu] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      const response = await getPostComments(post._id);
      if (response.success) {
        setComments(response.data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  }, [post._id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    const years = Math.floor(days / 365);
    return `${years}y ago`;
  };

  const handleLikePost = async () => {
    try {
      const response = await likePost(post._id);
      if (response.success) {
        setLiked(response.data.liked);
        setLikeCount(response.data.likeCount);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await createComment(post._id, {
        content: commentText,
        isAnonymous,
      });

      if (response.success) {
        setCommentText('');
        setIsAnonymous(false);
        setCommentCount(prev => prev + 1);
        fetchComments();
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const response = await likeComment(commentId);
      if (response.success) {
        // Refresh comments to get updated like state
        fetchComments();
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    showDeleteConfirm(
      'Are you sure you want to delete this comment?',
      async () => {
        try {
          const response = await deleteComment(commentId);
          if (response.success) {
            setCommentCount(prev => Math.max(0, prev - 1));
            fetchComments();
          }
        } catch (error) {
          console.error('Error deleting comment:', error);
        }
        setShowCommentMenu(null);
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Post Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Post Content */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-base shadow-md">
                {post.authorName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">{post.authorName}</h4>
                <p className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</p>
              </div>
            </div>

            <p className="text-gray-600 mb-4 whitespace-pre-wrap">{post.content}</p>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Post Actions */}
            <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
              <button
                onClick={handleLikePost}
                className={`flex items-center gap-2 transition-all ${liked ? 'text-pink-600' : 'text-gray-600 hover:text-pink-600'
                  }`}
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                <span className="font-medium">{likeCount}</span>
              </button>
              <div className="flex items-center gap-2 text-gray-600">
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium">{commentCount}</span>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Comments ({comments.length})
            </h4>

            {/* Add Comment */}
            <div className="mb-6">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-sm shadow-md flex-shrink-0">
                  {currentUser ? currentUser.username?.charAt(0).toUpperCase() || 'U' : 'G'}
                </div>
                <div className="flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={3}
                    maxLength={1000}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <button
                      onClick={() => setIsAnonymous(!isAnonymous)}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 transition-all"
                    >
                      {isAnonymous ? (
                        <><EyeOff className="w-4 h-4" /> Post anonymously</>
                      ) : (
                        <><Eye className="w-4 h-4" /> Post as yourself</>
                      )}
                    </button>
                    <button
                      onClick={handleSubmitComment}
                      disabled={!commentText.trim() || isSubmitting}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSubmitting ? 'Posting...' : 'Comment'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment) => {
                const isCommentOwner = currentUser && comment.author && comment.author._id === currentUser.id;
                const isCommentAdmin = currentUser && ['admin', 'super_admin'].includes(currentUser.role || '');
                const canDeleteComment = isCommentOwner || isCommentAdmin;
                
                // Check if current user has liked this comment
                const hasLikedComment = currentUser?.id ? comment.likes.includes(currentUser.id) : false;

                return (
                  <div key={comment._id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-sm shadow-md flex-shrink-0">
                      {comment.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-800">{comment.authorName}</p>
                          <p className="text-sm text-gray-500">{formatTimeAgo(comment.createdAt)}</p>
                        </div>
                        {canDeleteComment && (
                          <div className="relative">
                            <button
                              onClick={() => setShowCommentMenu(showCommentMenu === comment._id ? null : comment._id)}
                              className="p-1 hover:bg-gray-200 rounded transition-all"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-600" />
                            </button>
                            {showCommentMenu === comment._id && (
                              <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                <button
                                  onClick={() => handleDeleteComment(comment._id)}
                                  className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 text-sm"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text-gray-700 mb-2">{comment.content}</p>
                      <button
                        onClick={() => handleLikeComment(comment._id)}
                        className={`flex items-center gap-1 text-sm transition-all ${
                          hasLikedComment ? 'text-pink-600' : 'text-gray-600 hover:text-pink-600'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${hasLikedComment ? 'fill-current' : ''}`} />
                        <span>{comment.likeCount}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;