import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Heart, MessageCircle, Share2, Eye, Hash } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface TrendingPost {
  id: number;
  title: string;
  content: string;
  author: string;
  avatar: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  category: string;
  tags: string[];
  created_at: string;
  trending_score: number;
}

interface TrendingTopic {
  id: number;
  name: string;
  posts_count: number;
  trend_direction: 'up' | 'down' | 'stable';
}

export default function Trending() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<TrendingPost[]>([]);
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [commentingPost, setCommentingPost] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const { user } = useAuth();

  // 模拟数据
  const mockPosts: TrendingPost[] = [
    {
      id: 1,
      title: 'AI技术的最新突破：GPT-4的实际应用案例分析',
      content: '随着人工智能技术的快速发展，GPT-4在各个领域的应用越来越广泛。本文将深入分析几个成功的应用案例，探讨AI技术如何改变我们的工作和生活方式。',
      author: 'AI研究员',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=futuristic%20AI%20technology%20interface%20with%20neural%20networks%20and%20data%20visualization&image_size=landscape_4_3',
      likes: 342,
      comments: 89,
      shares: 156,
      views: 2847,
      category: '科技',
      tags: ['AI', 'GPT-4', '人工智能', '技术'],
      created_at: '2024-01-18T10:30:00Z',
      trending_score: 95
    },
    {
      id: 2,
      title: '2024年最值得尝试的美食趋势',
      content: '从植物基蛋白到发酵食品，2024年的美食界充满了创新和惊喜。让我们一起探索这些令人兴奋的美食趋势，发现新的味觉体验。',
      author: '美食博主',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20trendy%20food%20plating%20colorful%20healthy%20dishes%20restaurant%20setting&image_size=landscape_4_3',
      likes: 278,
      comments: 67,
      shares: 134,
      views: 1923,
      category: '美食',
      tags: ['美食', '趋势', '健康', '创新'],
      created_at: '2024-01-18T14:15:00Z',
      trending_score: 87
    },
    {
      id: 3,
      title: '远程工作的未来：如何打造高效的居家办公环境',
      content: '疫情改变了我们的工作方式，远程工作已成为新常态。本文分享如何创建一个既舒适又高效的居家办公空间，提升工作效率和生活质量。',
      author: '职场达人',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20home%20office%20setup%20with%20plants%20natural%20light%20minimalist%20design&image_size=landscape_4_3',
      likes: 195,
      comments: 43,
      shares: 87,
      views: 1456,
      category: '职场',
      tags: ['远程工作', '办公', '效率', '生活'],
      created_at: '2024-01-18T09:45:00Z',
      trending_score: 76
    }
  ];

  const mockTopics: TrendingTopic[] = [
    { id: 1, name: 'AI技术', posts_count: 156, trend_direction: 'up' },
    { id: 2, name: '美食分享', posts_count: 89, trend_direction: 'up' },
    { id: 3, name: '远程工作', posts_count: 67, trend_direction: 'stable' },
    { id: 4, name: '健康生活', posts_count: 45, trend_direction: 'up' },
    { id: 5, name: '旅行攻略', posts_count: 34, trend_direction: 'down' }
  ];

  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      setPosts(mockPosts);
      setTopics(mockTopics);
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return '刚刚';
    if (diffInHours < 24) return `${diffInHours}小时前`;
    return `${Math.floor(diffInHours / 24)}天前`;
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const handleLike = async (postId: number) => {
    if (!user) {
      toast.error('请先登录后再点赞');
      return;
    }

    try {
      const isLiked = likedPosts.has(postId);
      
      // 更新本地状态
      const newLikedPosts = new Set(likedPosts);
      if (isLiked) {
        newLikedPosts.delete(postId);
      } else {
        newLikedPosts.add(postId);
      }
      setLikedPosts(newLikedPosts);

      // 更新帖子的点赞数
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, likes: post.likes + (isLiked ? -1 : 1) }
            : post
        )
      );

      toast.success(isLiked ? '取消点赞' : '点赞成功');
      
      // TODO: 这里应该调用实际的API
      // await api.toggleLike(postId);
    } catch (error) {
      console.error('点赞失败:', error);
      toast.error('操作失败，请重试');
    }
  };

  const handleComment = async (postId: number) => {
    if (!user) {
      toast.error('请先登录后再评论');
      return;
    }

    if (!commentText.trim()) {
      toast.error('请输入评论内容');
      return;
    }

    try {
      // 更新帖子的评论数
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, comments: post.comments + 1 }
            : post
        )
      );

      setCommentText('');
      setCommentingPost(null);
      toast.success('评论发布成功');
      
      // TODO: 这里应该调用实际的API
      // await api.addComment(postId, commentText);
    } catch (error) {
      console.error('评论失败:', error);
      toast.error('评论失败，请重试');
    }
  };

  const handleShare = async (post: any) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.content,
          url: window.location.href
        });
      } else {
        // 复制到剪贴板
        await navigator.clipboard.writeText(`${post.title} - ${window.location.href}`);
        toast.success('链接已复制到剪贴板');
      }
    } catch (error) {
      console.error('分享失败:', error);
      toast.error('分享失败');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container-responsive">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">加载热门内容中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container-responsive">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            热门内容
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            发现最受欢迎的内容和话题
          </p>
        </div>

        {/* Time Range Filter */}
        <div className="mb-8 flex justify-center">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(['today', 'week', 'month'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {range === 'today' ? '今日' : range === 'week' ? '本周' : '本月'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {posts.map((post, index) => (
                <article key={post.id} className="card card-hover">
                  <div className="flex items-start space-x-4 p-6">
                    {/* Ranking */}
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-500 text-white' :
                        'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {index + 1}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded dark:bg-primary-900/20 dark:text-primary-400">
                          {post.category}
                        </span>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          <span>{post.trending_score}</span>
                        </div>
                      </div>
                      
                      <Link to={`/post/${post.id}`}>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer">
                          {post.title}
                        </h3>
                      </Link>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {post.content}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Link to={`/user/${post.author}`} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                            <img
                              src={post.avatar}
                              alt={post.author}
                              className="w-6 h-6 rounded-full"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                              {post.author}
                            </span>
                          </Link>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimeAgo(post.created_at)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <button
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center space-x-1 hover:text-red-500 transition-colors ${
                              likedPosts.has(post.id) ? 'text-red-500' : ''
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                            <span>{formatNumber(post.likes)}</span>
                          </button>
                          <button
                            onClick={() => setCommentingPost(commentingPost === post.id ? null : post.id)}
                            className="flex items-center space-x-1 hover:text-blue-500 transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>{formatNumber(post.comments)}</span>
                          </button>
                          <button
                            onClick={() => handleShare(post)}
                            className="flex items-center space-x-1 hover:text-green-500 transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{formatNumber(post.views)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {post.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded dark:bg-gray-800 dark:text-gray-400 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Comment Input */}
                      {commentingPost === post.id && (
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex space-x-3">
                            <img
                              src={user?.avatar_url || 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=default%20user%20avatar%20simple%20icon&image_size=square'}
                              alt="Your avatar"
                              className="w-8 h-8 rounded-full"
                            />
                            <div className="flex-1">
                              <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="写下你的评论..."
                                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                rows={3}
                              />
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {commentText.length}/500
                                </span>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => {
                                      setCommentingPost(null);
                                      setCommentText('');
                                    }}
                                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                                  >
                                    取消
                                  </button>
                                  <button
                                    onClick={() => handleComment(post.id)}
                                    disabled={!commentText.trim()}
                                    className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    发布
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Image */}
                    {post.image && (
                      <div className="flex-shrink-0">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Hash className="w-5 h-5 mr-2" />
                  热门话题
                </h3>
                
                <div className="space-y-3">
                  {topics.map((topic, index) => (
                    <div key={topic.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {index + 1}
                        </span>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            #{topic.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {topic.posts_count} 条内容
                          </div>
                        </div>
                      </div>
                      <span className="text-lg">
                        {getTrendIcon(topic.trend_direction)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}