import { AxiosError } from "axios";
import apiClient from "./axiosConfig";

// Type Definitions
export interface Post {
  _id: string;
  content: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: string;
  } | null;
  authorType: "authenticated" | "guest";
  authorName: string;
  tags: string[];
  isAnonymous: boolean;
  likes: string[];
  likeCount: number;
  commentCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: string;
  } | null;
  authorType: "authenticated" | "guest";
  authorName: string;
  post: string;
  parentComment: string | null;
  isAnonymous: boolean;
  likes: string[];
  likeCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationInfo {
  current: number;
  pages: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PostsResponse {
  success: boolean;
  message?: string;
  data: Post[];
  pagination: PaginationInfo;
}

export interface SinglePostResponse {
  success: boolean;
  message?: string;
  data: Post;
}

export interface CommentsResponse {
  success: boolean;
  message?: string;
  data: Comment[];
  pagination: PaginationInfo;
}

export interface LikeResponse {
  success: boolean;
  message?: string;
  data: {
    liked: boolean;
    likeCount: number;
  };
}

export interface CreatePostData {
  content: string;
  tags?: string[];
  isAnonymous?: boolean;
}

export interface UpdatePostData {
  content?: string;
  tags?: string[];
  isAnonymous?: boolean;
}

export interface CreateCommentData {
  content: string;
  parentComment?: string;
  isAnonymous?: boolean;
}

export interface UpdateCommentData {
  content?: string;
  isAnonymous?: boolean;
}

// POSTS API

// 1. Create Post
export const createPost = async (
  data: CreatePostData
): Promise<SinglePostResponse> => {
  try {
    const response = await apiClient.post<SinglePostResponse>(
      "/api/community/posts",
      data
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<SinglePostResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to create post",
      data: {} as Post,
    };
  }
};

// 2. Get All Posts
export const getAllPosts = async (
  page: number = 1,
  limit: number = 10,
  tags?: string,
  author?: string
): Promise<PostsResponse> => {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (tags) params.append("tags", tags);
    if (author) params.append("author", author);

    const response = await apiClient.get<PostsResponse>(
      `/api/community/all-posts?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<PostsResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to fetch posts",
      data: [],
      pagination: {
        current: 1,
        pages: 0,
        total: 0,
        hasNext: false,
        hasPrev: false,
      },
    };
  }
};

// 3. Get Single Post
export const getSinglePost = async (
  postId: string
): Promise<SinglePostResponse> => {
  try {
    const response = await apiClient.get<SinglePostResponse>(
      `/api/community/posts/${postId}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<SinglePostResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to fetch post",
      data: {} as Post,
    };
  }
};

// 4. Update Post
export const updatePost = async (
  postId: string,
  data: UpdatePostData
): Promise<SinglePostResponse> => {
  try {
    const response = await apiClient.put<SinglePostResponse>(
      `/api/community/posts/${postId}`,
      data
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<SinglePostResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to update post",
      data: {} as Post,
    };
  }
};

// 5. Delete Post
export const deletePost = async (
  postId: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/api/community/posts/${postId}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ success: boolean; message: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to delete post",
    };
  }
};

// 6. Like/Unlike Post
export const likePost = async (postId: string): Promise<LikeResponse> => {
  try {
    const response = await apiClient.post<LikeResponse>(
      `/api/community/posts/${postId}/like`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<LikeResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to like post",
      data: { liked: false, likeCount: 0 },
    };
  }
};

// COMMENTS API

// 7. Create Comment
export const createComment = async (
  postId: string,
  data: CreateCommentData
): Promise<{ success: boolean; message?: string; data: Comment }> => {
  try {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: Comment;
    }>(`/api/community/posts/${postId}/comments`, data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{
      success: boolean;
      message: string;
      data: Comment;
    }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to create comment",
      data: {} as Comment,
    };
  }
};

// 8. Get Post Comments
export const getPostComments = async (
  postId: string,
  page: number = 1,
  limit: number = 20
): Promise<CommentsResponse> => {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const response = await apiClient.get<CommentsResponse>(
      `/api/community/posts/${postId}/all-comments?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<CommentsResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to fetch comments",
      data: [],
      pagination: {
        current: 1,
        pages: 0,
        total: 0,
        hasNext: false,
        hasPrev: false,
      },
    };
  }
};

// 9. Update Comment
export const updateComment = async (
  commentId: string,
  data: UpdateCommentData
): Promise<{ success: boolean; message?: string; data: Comment }> => {
  try {
    const response = await apiClient.put<{
      success: boolean;
      message: string;
      data: Comment;
    }>(`/api/community/comments/${commentId}`, data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{
      success: boolean;
      message: string;
      data: Comment;
    }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to update comment",
      data: {} as Comment,
    };
  }
};

// 10. Delete Comment
export const deleteComment = async (
  commentId: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/api/community/comments/${commentId}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ success: boolean; message: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to delete comment",
    };
  }
};

// 11. Like/Unlike Comment
export const likeComment = async (commentId: string): Promise<LikeResponse> => {
  try {
    const response = await apiClient.post<LikeResponse>(
      `/api/community/comments/${commentId}/like`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<LikeResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to like comment",
      data: { liked: false, likeCount: 0 },
    };
  }
};

// ADMIN API

// 12. Get All Posts (Admin)
export const getAllPostsAdmin = async (
  page: number = 1,
  limit: number = 20,
  status?: "active" | "inactive",
  author?: string
): Promise<PostsResponse> => {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (status) params.append("status", status);
    if (author) params.append("author", author);

    const response = await apiClient.get<PostsResponse>(
      `/api/community/admin/posts?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<PostsResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "Failed to fetch admin posts",
      data: [],
      pagination: {
        current: 1,
        pages: 0,
        total: 0,
        hasNext: false,
        hasPrev: false,
      },
    };
  }
};

// 13. Restore Post (Admin)
export const restorePost = async (
  postId: string
): Promise<SinglePostResponse> => {
  try {
    const response = await apiClient.patch<SinglePostResponse>(
      `/api/community/admin/posts/${postId}/restore`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<SinglePostResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to restore post",
      data: {} as Post,
    };
  }
};