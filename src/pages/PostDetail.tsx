import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Heart, MessageCircle, Share2, ArrowLeft, MoreHorizontal, Calendar, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface Author {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  is_verified?: boolean;
}

interface PostData {
  id: string;
  title?: string;
  content: string;
  image_urls?: string[];
  category?: string;
  tags?: string[];
  created_at: string;
  updated_at?: string;
  author: Author;
  isLiked: boolean;
  likeCount: number;
  commentCount: number;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author: Author;
}

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [post, setPost] = useState<PostData | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likingPost, setLikingPost] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPost();
      fetchComments();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts/${id}`, {
        headers: {
          'Authorization': user ? `Bearer ${user.id}` : '',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPost(data.data.post);
      } else {
        setError(data.message || '获取帖子失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts/${id}/comments`);
      const data = await response.json();
      
      if (data.success) {
        setComments(data.data.comments || []);
      }
    } catch (err) {
      console.error('获取评论失败:', err);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('请先登录');
      return;
    }

    if (!post || likingPost) return;

    try {
      setLikingPost(true);
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.id}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setPost(prev => prev ? {
          ...prev,
          isLiked: !prev.isLiked,
          likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1
        } : null);
        toast.success(post.isLiked ? '取消点赞' : '点赞成功');
      } else {
        toast.error(data.message || '操作失败');
      }
    } catch (err) {
      toast.error('网络错误，请稍后重试');
    } finally {
      setLikingPost(false);
    }
  };

  const handleComment = async () => {
    if (!user) {
      toast.error('请先登录');
      return;
    }

    if (!commentText.trim() || submittingComment) return;

    try {
      setSubmittingComment(true);
      const response = await fetch(`/api/posts/${id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.id}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: commentText.trim() }),
      });

      const data = await response.json();
      
      if (data.success) {
        setCommentText('');
        fetchComments(); // 重新获取评论列表
        setPost(prev => prev ? {
          ...prev,
          commentCount: prev.commentCount + 1
        } : null);
        toast.success('评论成功');
      } else {
        toast.error(data.message || '评论失败');
      }
    } catch (err) {
      toast.error('网络错误，请稍后重试');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title || '精彩内容分享',
          text: post.content.substring(0, 100) + '...',
          url: window.location.href,
        });
      } catch (err) {
        // 用户取消分享或不支持
      }
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href);
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

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || '帖子不存在'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            {t('common.back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container-responsive py-6">
        {/* 返回按钮 */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t('common.back')}</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主要内容 */}
          <div className="lg:col-span-2">
            <article className="card">
              {/* 作者信息 */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <Link
                  to={`/user/${post.author.username}`}
                  className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                >
                  <img
                    src={post.author.avatar_url || `https://ui-avatars.com/api/?name=${post.author.display_name || post.author.username}&background=6366f1&color=fff`}
                    alt={post.author.display_name || post.author.username}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {post.author.display_name || post.author.username}
                      </h3>
                      {post.author.is_verified && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      @{post.author.username}
                    </p>
                  </div>
                </Link>
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <MoreHorizontal className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              {/* 帖子内容 */}
              <div className="p-6">
                {post.title && (
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {post.title}
                  </h1>
                )}
                
                <div className="prose prose-lg dark:prose-invert max-w-none mb-6">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                </div>

                {/* 图片 */}
                {post.image_urls && post.image_urls.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {post.image_urls.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`图片 ${index + 1}`}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}

                {/* 标签 */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-sm rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* 互动按钮 */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={handleLike}
                      disabled={likingPost}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        post.isLiked
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                      <span>{post.likeCount}</span>
                    </button>
                    
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <MessageCircle className="w-5 h-5" />
                      <span>{post.commentCount}</span>
                    </div>
                    
                    <button
                      onClick={handleShare}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                      <span>分享</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>

            {/* 评论区 */}
            <div className="card mt-6">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  评论 ({post.commentCount})
                </h2>

                {/* 发表评论 */}
                {user ? (
                  <div className="mb-6">
                    <div className="flex space-x-3">
                      <img
                        src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.display_name || user.username}&background=6366f1&color=fff`}
                        alt={user.display_name || user.username}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="写下你的评论..."
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          rows={3}
                        />
                        <div className="flex justify-end mt-3">
                          <button
                            onClick={handleComment}
                            disabled={!commentText.trim() || submittingComment}
                            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {submittingComment ? '发布中...' : '发布评论'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {t('auth.pleaseLogin')}
                    </p>
                    <Link
                      to="/login"
                      className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      {t('auth.loginTitle')}
                    </Link>
                  </div>
                )}

                {/* 评论列表 */}
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <Link to={`/user/${comment.author.username}`}>
                        <img
                          src={comment.author.avatar_url || `https://ui-avatars.com/api/?name=${comment.author.display_name || comment.author.username}&background=6366f1&color=fff`}
                          alt={comment.author.display_name || comment.author.username}
                          className="w-10 h-10 rounded-full"
                        />
                      </Link>
                      <div className="flex-1">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Link
                              to={`/user/${comment.author.username}`}
                              className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                            >
                              {comment.author.display_name || comment.author.username}
                            </Link>
                            {comment.author.is_verified && (
                              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {comments.length === 0 && (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">
                        还没有评论，来发表第一条评论吧！
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 侧边栏 */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                相关推荐
              </h3>
              <div className="space-y-4">
                {/* 这里可以添加相关帖子推荐 */}
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  暂无相关推荐
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}