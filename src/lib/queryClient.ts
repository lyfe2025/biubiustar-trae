import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分钟
      gcTime: 1000 * 60 * 10, // 10分钟
      retry: (failureCount, error: any) => {
        // 对于4xx错误不重试
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // 最多重试2次
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// 查询键工厂
export const queryKeys = {
  // 用户相关
  users: {
    all: ['users'] as const,
    profile: (id: string) => ['users', 'profile', id] as const,
    posts: (id: string) => ['users', 'posts', id] as const,
    followers: (id: string) => ['users', 'followers', id] as const,
    following: (id: string) => ['users', 'following', id] as const,
  },
  // 帖子相关
  posts: {
    all: ['posts'] as const,
    lists: () => ['posts', 'list'] as const,
    list: (filters: Record<string, any>) => ['posts', 'list', filters] as const,
    details: () => ['posts', 'detail'] as const,
    detail: (id: string) => ['posts', 'detail', id] as const,
    comments: (id: string) => ['posts', 'comments', id] as const,
    hot: () => ['posts', 'hot'] as const,
    trending: () => ['posts', 'trending'] as const,
    latest: () => ['posts', 'latest'] as const,
  },
  // 评论相关
  comments: {
    all: ['comments'] as const,
    byPost: (postId: string) => ['comments', 'post', postId] as const,
    replies: (commentId: string) => ['comments', 'replies', commentId] as const,
  },
  // 活动相关
  activities: {
    all: ['activities'] as const,
    list: (filters: Record<string, any>) => ['activities', 'list', filters] as const,
    detail: (id: string) => ['activities', 'detail', id] as const,
  },
  // 搜索相关
  search: {
    posts: (query: string) => ['search', 'posts', query] as const,
    users: (query: string) => ['search', 'users', query] as const,
  },
} as const;