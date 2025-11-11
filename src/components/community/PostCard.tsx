import React, { useState } from 'react';
import { Heart, MessageSquare, MoreVertical, Trash2 } from 'lucide-react';
import { type Post, likePost, deletePost } from '@/apis/community';
import { getCurrentUser } from '@/apis/auth';
import { useModal } from '@/contexts/useModal';

interface PostCardProps {
  post: Post;
  onClick: () => void;
  onUpdate: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onClick, onUpdate }) => {
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

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-sm shadow-md">
            {post.authorName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">{post.authorName}</h4>
            <p className="text-sm text-gray-500">
              {formatTimeAgo(post.createdAt)}
            </p>
          </div>
        </div>

        {canModify && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all"
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

      {/* Title */}
      <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-purple-600 transition-colors">
        {post.title}
      </h3>

      {/* Content */}
      <p className="text-gray-600 mb-4 line-clamp-3">
        {truncateContent(post.content)}
      </p>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm font-medium"
            >
              {tag}
            </span>
          ))}
          {post.tags.length > 3 && (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
              +{post.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center gap-2 transition-all ${liked
            ? 'text-pink-600'
            : 'text-gray-600 hover:text-pink-600'
            }`}
        >
          <Heart
            className={`w-5 h-5 ${liked ? 'fill-current' : ''}`}
          />
          <span className="font-medium">{likeCount}</span>
        </button>

        <div className="flex items-center gap-2 text-gray-600">
          <MessageSquare className="w-5 h-5" />
          <span className="font-medium">{post.commentCount}</span>
        </div>
      </div>
    </div>
  );
};

export default PostCard;