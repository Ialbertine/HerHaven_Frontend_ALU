import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, TrendingUp, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAllPosts, type Post } from '@/apis/community';
import PostListItem from '@/components/community/PostListItem';
import CreatePostForm from '@/components/community/CreatePostForm';
import PostDetailModal from '@/components/community/PostDetailsModel';
import { getCurrentUser } from '@/apis/auth';
import DashboardLayout from '@/components/DashboardLayout';

const Community: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const currentUser = getCurrentUser();

  // Determine user type properly
  const getUserType = (): "user" | "counselor" | "super_admin" | "guest" => {
    const userRole = localStorage.getItem("userRole");
    if (userRole === "guest") return "guest";
    if (userRole === "super_admin") return "super_admin";
    if (userRole === "counselor") return "counselor";
    return "user";
  };

  const popularTags = [
    'Mental Health',
    'Anxiety',
    'Depression',
    'Self Care',
    'Relationships',
    'Stress Management',
    'Support',
    'Wellness'
  ];

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const tagsQuery = selectedTags.length > 0 ? selectedTags.join(',') : undefined;
      const response = await getAllPosts(page, 10, tagsQuery);

      if (response.success) {
        setPosts(response.data);
        setTotalPages(response.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [page, selectedTags]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
    setPage(1);
  };

  const handlePostCreated = () => {
    setPage(1);
    fetchPosts();
  };

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
  };

  const handlePostUpdated = () => {
    fetchPosts();
  };

  // Filter posts based on search term
  const normalizedSearch = searchTerm.toLowerCase();
  const filteredPosts: Post[] = posts.filter((post: Post) =>
    post.content.toLowerCase().includes(normalizedSearch) ||
    post.tags.some(tag => tag.toLowerCase().includes(normalizedSearch))
  );

  return (
    <DashboardLayout userType={getUserType()} userName={currentUser?.username || "Guest"}>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-2">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-gray-800">
                Community
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Share experiences, find support, and connect with others
              </p>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                />
              </div>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 transition-all ${filterOpen
                  ? 'border-purple-500 bg-purple-50 text-purple-600'
                  : 'border-gray-200 text-gray-600 hover:border-purple-300'
                  }`}
              >
                <Filter className="w-5 h-5" />
                <span className="font-medium">Filter</span>
              </button>
            </div>

            {/* Tags Filter */}
            {filterOpen && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-800">Popular Topics</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedTags.includes(tag)
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Create Post Section */}
          <div className="mb-8">
            <CreatePostForm onSuccess={handlePostCreated} />
          </div>

          {/* Community Posts Section Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Community Posts</h2>
            <p className="text-gray-600 mt-1">Browse and engage with posts from the community</p>
          </div>

          {/* Posts List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded w-1/4 mb-3"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPosts.length > 0 ? (
            <>
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <PostListItem
                    key={post._id}
                    post={post}
                    onClick={() => handlePostClick(post)}
                    onUpdate={handlePostUpdated}
                  />
                ))}
              </div>

              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg border-2 border-gray-200 text-gray-700 font-medium hover:bg-purple-50 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                      // Show first page, last page, current page, and pages around current
                      const showPage =
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= page - 1 && pageNum <= page + 1);

                      const showEllipsis =
                        (pageNum === 2 && page > 3) ||
                        (pageNum === totalPages - 1 && page < totalPages - 2);

                      if (!showPage && !showEllipsis) return null;

                      if (showEllipsis) {
                        return (
                          <span
                            key={pageNum}
                            className="px-3 py-2 text-gray-500"
                          >
                            ...
                          </span>
                        );
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`min-w-[40px] h-10 rounded-lg font-medium transition-all ${page === pageNum
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg border-2 border-gray-200 text-gray-700 font-medium hover:bg-purple-50 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 transition-all"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No posts found
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || selectedTags.length > 0
                  ? 'Try adjusting your filters'
                  : 'Be the first to share your story'}
              </p>
            </div>
          )}
        </div>

        {/* Post Detail Modal */}
        {selectedPost && (
          <PostDetailModal
            post={selectedPost}
            onClose={() => setSelectedPost(null)}
            onUpdate={handlePostUpdated}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Community;