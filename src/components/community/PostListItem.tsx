import React, { useState } from 'react';
import { Heart, MessageSquare, MoreVertical, Trash2, Clock, Tag as TagIcon, CheckCircle } from 'lucide-react';
import { type Post, likePost, deletePost } from '@/apis/community';
import { getCurrentUser } from '@/apis/auth';
import { useModal } from '@/contexts/useModal';

interface PostListItemProps {
  post: Post;
  onClick: () => void;
  onUpdate: () => void;
}

const PostListItem: React.FC<PostListItemProps> = ({ post, onClick, onUpdate }) => {
  const { showDeleteConfirm } = useModal();
  const currentUser = getCurrentUser();
  
  // Check if current user has already liked this post
  const [liked, setLiked] = useState(() => {
    if (!currentUser?.id) return false;
    return post.likes.includes(currentUser.id);
  });
  
  const [showMenu, setShowMenu] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [isLiking, setIsLiking] = useState(false);

  const isOwner = currentUser && post.author && post.author._id === currentUser.id;
  const isAdmin = currentUser && ['admin', 'super_admin'].includes(currentUser.role || '');
  const canModify = isOwner || isAdmin;

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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiking) return;

    setIsLiking(true);
    try {
      const response = await likePost(post._id);
      if (response.success) {
        setLiked(response.data.liked);
        setLikeCount(response.data.likeCount);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    showDeleteConfirm(
      'Are you sure you want to delete this post?',
      async () => {
        try {
          const response = await deletePost(post._id);
          if (response.success) {
            onUpdate();
          }
        } catch (error) {
          console.error('Error deleting post:', error);
        }
        setShowMenu(false);
      }
    );
  };

  const truncateContent = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all cursor-pointer mb-4"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-base shadow-md">
            {post.authorName.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header with author and menu */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-gray-900">{post.authorName}</h3>
              {post.isAnonymous && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  <CheckCircle className="w-3 h-3" />
                  Anonymous
                </span>
              )}
            </div>
            
            {canModify && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Post Title */}
          <h4 className="text-xl font-semibold text-gray-800 mb-2">
            {post.title}
          </h4>

          {/* Post metadata */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>{formatDate(post.createdAt)}</span>
            </div>
            <span className="text-gray-400">•</span>
            <span>{formatTimeAgo(post.createdAt)}</span>
            {post.tags && post.tags.length > 0 && (
              <>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-1.5">
                  <TagIcon className="w-4 h-4 text-purple-600" />
                  <span>{post.tags.length} tag{post.tags.length !== 1 ? 's' : ''}</span>
                </div>
              </>
            )}
          </div>

          {/* Content preview */}
          <p className="text-gray-600 mb-3 line-clamp-2">
            {truncateContent(post.content)}
          </p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-semibold text-gray-700">Topics:</span>
              <div className="flex flex-wrap gap-2">
                {post.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
                {post.tags.length > 3 && (
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                    +{post.tags.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-6 pt-3 border-t border-gray-100">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-2 transition-all ${
                liked
                  ? 'text-pink-600'
                  : 'text-gray-600 hover:text-pink-600'
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
              <span className="font-medium text-sm">{likeCount} likes</span>
            </button>

            <div className="flex items-center gap-2 text-gray-600">
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium text-sm">{post.commentCount} comments</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostListItem;

