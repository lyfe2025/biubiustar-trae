import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Heart, MessageCircle, Share2, Calendar, MapPin, Link as LinkIcon, UserPlus, UserMinus, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface UserData {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  is_verified?: boolean;
  created_at: string;
  follower_count: number;
  following_count: number;
  post_count: number;
  isFollowing?: boolean;
}

interface PostData {
  id: string;
  title?: string;
  content: string;
  image_urls?: string[];
  category?: string;
  tags?: string[];
  created_at: string;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
}

export default function UserProfile() {
  const { username } = useParams<{ username: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'likes'>('posts');

  const isOwnProfile = user && userData && user.username === userData.username;

  useEffect(() => {
    if (username) {
      fetchUserData();
      fetchUserPosts();
    }
  }, [username]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${username}`, {
        headers: {
          'Authorization': user ? `Bearer ${user.id}` : '',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUserData(data.data.user);
      } else {
        setError(data.message || '用户不存在');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      setPostsLoading(true);
      const response = await fetch(`/api/posts/user/${username}`, {
        headers: {
          'Authorization': user ? `Bearer ${user.id}` : '',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.data.posts || []);
      }
    } catch (err) {
      console.error('获取用户帖子失败:', err);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      toast.error('请先登录');
      return;
    }

    if (!userData || followLoading) return;

    try {
      setFollowLoading(true);
      const response = await fetch(`/api/users/${userData.id}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.id}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setUserData(prev => prev ? {
          ...prev,
          isFollowing: !prev.isFollowing,
          follower_count: prev.isFollowing ? prev.follower_count - 1 : prev.follower_count + 1
        } : null);
        toast.success(userData.isFollowing ? '取消关注成功' : '关注成功');
      } else {
        toast.error(data.message || '操作失败');
      }
    } catch (err) {
      toast.error('网络错误，请稍后重试');
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePostLike = async (postId: string) => {
    if (!user) {
      toast.error('请先登录');
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.id}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setPosts(prev => prev.map(post => 
          post.id === postId ? {
            ...post,
            isLiked: !post.isLiked,
            likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1
          } : post
        ));
      } else {
        toast.error(data.message || '操作失败');
      }
    } catch (err) {
      toast.error('网络错误，请稍后重试');
    }
  };

  const handleShare = async (post: PostData) => {
    const shareUrl = `${window.location.origin}/post/${post.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title || '精彩内容分享',
          text: post.content.substring(0, 100) + '...',
          url: shareUrl,
        });
      } catch (err) {
        // 用户取消分享或不支持
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('链接已复制到剪贴板');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || '用户不存在'}</p>
          <Link
            to="/"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container-responsive py-6">
        {/* 用户信息卡片 */}
        <div className="card mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
              {/* 头像 */}
              <div className="flex-shrink-0 mb-4 md:mb-0">
                <img
                  src={userData.avatar_url || `https://ui-avatars.com/api/?name=${userData.display_name || userData.username}&background=6366f1&color=fff&size=128`}
                  alt={userData.display_name || userData.username}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto md:mx-0"
                />
              </div>

              {/* 用户信息 */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        {userData.display_name || userData.username}
                      </h1>
                      {userData.is_verified && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">✓</span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mb-3">
                      @{userData.username}
                    </p>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex justify-center md:justify-start space-x-3">
                    {isOwnProfile ? (
                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>编辑资料</span>
                      </Link>
                    ) : (
                      <button
                        onClick={handleFollow}
                        disabled={followLoading}
                        className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                          userData.isFollowing
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                        }`}
                      >
                        {userData.isFollowing ? (
                          <>
                            <UserMinus className="w-4 h-4" />
                            <span>取消关注</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            <span>关注</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* 简介 */}
                {userData.bio && (
                  <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                    {userData.bio}
                  </p>
                )}

                {/* 附加信息 */}
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {userData.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{userData.location}</span>
                    </div>
                  )}
                  {userData.website && (
                    <a
                      href={userData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      <LinkIcon className="w-4 h-4" />
                      <span>{userData.website.replace(/^https?:\/\//, '')}</span>
                    </a>
                  )}
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>加入于 {formatJoinDate(userData.created_at)}</span>
                  </div>
                </div>

                {/* 统计信息 */}
                <div className="flex justify-center md:justify-start space-x-6 text-sm">
                  <div className="text-center md:text-left">
                    <span className="font-bold text-gray-900 dark:text-white">
                      {userData.post_count}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">帖子</span>
                  </div>
                  <div className="text-center md:text-left">
                    <span className="font-bold text-gray-900 dark:text-white">
                      {userData.following_count}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">关注</span>
                  </div>
                  <div className="text-center md:text-left">
                    <span className="font-bold text-gray-900 dark:text-white">
                      {userData.follower_count}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">粉丝</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 标签页 */}
        <div className="card">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'posts'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                帖子 ({userData.post_count})
              </button>
              <button
                onClick={() => setActiveTab('likes')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'likes'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                点赞
              </button>
            </nav>
          </div>

          {/* 内容区域 */}
          <div className="p-6">
            {activeTab === 'posts' && (
              <div>
                {postsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">加载中...</p>
                  </div>
                ) : posts.length > 0 ? (
                  <div className="space-y-6">
                    {posts.map((post) => (
                      <article key={post.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                        <Link to={`/post/${post.id}`} className="block hover:opacity-80 transition-opacity">
                          {post.title && (
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 hover:text-primary-600 dark:hover:text-primary-400">
                              {post.title}
                            </h3>
                          )}
                          <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-3">
                            {post.content}
                          </p>
                        </Link>

                        {/* 图片预览 */}
                        {post.image_urls && post.image_urls.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                            {post.image_urls.slice(0, 3).map((url, index) => (
                              <img
                                key={index}
                                src={url}
                                alt={`图片 ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg"
                              />
                            ))}
                            {post.image_urls.length > 3 && (
                              <div className="w-full h-24 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                <span className="text-gray-500 dark:text-gray-400 text-sm">
                                  +{post.image_urls.length - 3}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 标签 */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {post.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs rounded-full"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* 互动信息 */}
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <span>{formatDate(post.created_at)}</span>
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handlePostLike(post.id);
                              }}
                              className={`flex items-center space-x-1 hover:text-red-500 transition-colors ${
                                post.isLiked ? 'text-red-500' : ''
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                              <span>{post.likeCount}</span>
                            </button>
                            <Link
                              to={`/post/${post.id}`}
                              className="flex items-center space-x-1 hover:text-primary-500 transition-colors"
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span>{post.commentCount}</span>
                            </Link>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleShare(post);
                              }}
                              className="flex items-center space-x-1 hover:text-primary-500 transition-colors"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {isOwnProfile ? '你还没有发布任何帖子' : '该用户还没有发布任何帖子'}
                    </h3>
                    {isOwnProfile && (
                      <Link
                        to="/create"
                        className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        发布第一篇帖子
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'likes' && (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  点赞功能开发中
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  敬请期待
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}