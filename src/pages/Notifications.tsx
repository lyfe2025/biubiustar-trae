import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Settings, Check, X, Heart, MessageCircle, UserPlus, AtSign, Calendar, AlertCircle, Trash2, Filter } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'system' | 'activity' | 'reply';
  title: string;
  content: string;
  user?: {
    id: string;
    username: string;
    avatar: string;
  };
  post?: {
    id: string;
    title: string;
  };
  isRead: boolean;
  createdAt: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  enableLikes: boolean;
  enableComments: boolean;
  enableFollows: boolean;
  enableMentions: boolean;
  enableActivities: boolean;
  enableSystem: boolean;
  frequency: 'immediately' | 'hourly' | 'daily' | 'weekly';
}

type NotificationCategory = 'all' | 'likes' | 'comments' | 'follows' | 'system' | 'mentions' | 'activities';

const Notifications: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    inAppNotifications: true,
    enableLikes: true,
    enableComments: true,
    enableFollows: true,
    enableMentions: true,
    enableActivities: true,
    enableSystem: true,
    frequency: 'immediately'
  });

  // 模拟通知数据
  const { data: notifications, isLoading, error } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 模拟通知数据
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'like',
          title: '新的点赞',
          content: '张三点赞了你的帖子',
          user: {
            id: '1',
            username: '张三',
            avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=friendly%20user%20avatar&image_size=square'
          },
          post: {
            id: '1',
            title: 'React开发最佳实践'
          },
          isRead: false,
          createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          type: 'comment',
          title: '新的评论',
          content: '李四评论了你的帖子："很有用的分享！"',
          user: {
            id: '2',
            username: '李四',
            avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20user%20avatar&image_size=square'
          },
          post: {
            id: '1',
            title: 'React开发最佳实践'
          },
          isRead: false,
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          type: 'follow',
          title: '新的关注者',
          content: '王五关注了你',
          user: {
            id: '3',
            username: '王五',
            avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=creative%20user%20avatar&image_size=square'
          },
          isRead: true,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '4',
          type: 'mention',
          title: '有人提及了你',
          content: '赵六在帖子中提及了你',
          user: {
            id: '4',
            username: '赵六',
            avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=tech%20user%20avatar&image_size=square'
          },
          post: {
            id: '2',
            title: '前端开发讨论'
          },
          isRead: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '5',
          type: 'system',
          title: '系统通知',
          content: '你的帖子已通过审核并发布',
          isRead: false,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '6',
          type: 'activity',
          title: '活动提醒',
          content: '你关注的"前端技术分享会"即将开始',
          isRead: true,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      return mockNotifications;
    },
    enabled: !!user
  });

  // 标记为已读
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // 标记全部为已读
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // 删除通知
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // 保存设置
  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: NotificationSettings) => {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: () => {
      setShowSettings(false);
    }
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment': return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'follow': return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'mention': return <AtSign className="w-5 h-5 text-purple-500" />;
      case 'activity': return <Calendar className="w-5 h-5 text-orange-500" />;
      case 'system': return <AlertCircle className="w-5 h-5 text-gray-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return t('notifications.timeAgo.justNow');
    if (diffInMinutes < 60) return t('notifications.timeAgo.minutesAgo', { count: diffInMinutes });
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return t('notifications.timeAgo.hoursAgo', { count: diffInHours });
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return t('notifications.timeAgo.daysAgo', { count: diffInDays });
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return t('notifications.timeAgo.weeksAgo', { count: diffInWeeks });
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return t('notifications.timeAgo.monthsAgo', { count: diffInMonths });
  };

  const filteredNotifications = notifications?.filter(notification => {
    if (activeCategory === 'all') return true;
    
    switch (activeCategory) {
      case 'likes': return notification.type === 'like';
      case 'comments': return notification.type === 'comment' || notification.type === 'reply';
      case 'follows': return notification.type === 'follow';
      case 'mentions': return notification.type === 'mention';
      case 'activities': return notification.type === 'activity';
      case 'system': return notification.type === 'system';
      default: return true;
    }
  }) || [];

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <Bell className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('auth.loginRequired')}
          </h2>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            {t('auth.loginToViewNotifications')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 标题和操作 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className={`w-8 h-8 ${isDark ? 'text-white' : 'text-gray-900'}`} />
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('notifications.title')}
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-1 text-sm bg-red-500 text-white rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {markAllAsReadMutation.isPending ? t('common.loading') : t('notifications.markAllRead')}
              </button>
            )}
            <button
              onClick={() => setShowSettings(true)}
              className={`p-2 rounded-md transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
              title={t('notifications.settings')}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 分类筛选 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['all', 'likes', 'comments', 'follows', 'mentions', 'activities', 'system'] as NotificationCategory[]).map((category) => {
            const categoryCount = category === 'all' 
              ? notifications?.length || 0
              : filteredNotifications.length;
            
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full transition-colors flex items-center gap-2 ${
                  activeCategory === category
                    ? 'bg-blue-600 text-white'
                    : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t(`notifications.categories.${category}`)}
                {categoryCount > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeCategory === category
                      ? 'bg-white/20'
                      : isDark
                      ? 'bg-gray-600'
                      : 'bg-gray-300'
                  }`}>
                    {categoryCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 通知列表 */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('notifications.loading')}</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{t('notifications.error')}</p>
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['notifications'] })}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {t('common.retry')}
            </button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('notifications.noNotifications')}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-colors ${
                  notification.isRead
                    ? isDark
                      ? 'border-gray-700 bg-gray-800/50'
                      : 'border-gray-200 bg-gray-50'
                    : isDark
                    ? 'border-gray-600 bg-gray-800'
                    : 'border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* 通知图标 */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  {/* 用户头像 */}
                  {notification.user && (
                    <img
                      src={notification.user.avatar}
                      alt={notification.user.username}
                      className="w-10 h-10 rounded-full flex-shrink-0"
                    />
                  )}
                  
                  {/* 通知内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {notification.title}
                        </h3>
                        <p className={`mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {notification.user && (
                            <span className="font-medium">{notification.user.username} </span>
                          )}
                          {t(`notifications.types.${notification.type}`)}
                          {notification.post && (
                            <span className="ml-1">「{notification.post.title}」</span>
                          )}
                        </p>
                        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                      
                      {/* 操作按钮 */}
                      <div className="flex items-center gap-1 ml-2">
                        {!notification.isRead ? (
                          <button
                            onClick={() => markAsReadMutation.mutate(notification.id)}
                            disabled={markAsReadMutation.isPending}
                            className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                            title={t('notifications.markAsRead')}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        ) : (
                          <div className="w-2 h-2 bg-green-500 rounded-full" title={t('notifications.markAsRead')}></div>
                        )}
                        <button
                          onClick={() => deleteNotificationMutation.mutate(notification.id)}
                          disabled={deleteNotificationMutation.isPending}
                          className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400 hover:text-red-400' : 'hover:bg-gray-100 text-gray-600 hover:text-red-600'}`}
                          title={t('notifications.deleteNotification')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 设置面板 */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-md rounded-lg border ${isDark ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'} max-h-[80vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('notifications.settingsPanel.title')}
                  </h2>
                  <button
                    onClick={() => setShowSettings(false)}
                    className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* 通知方式 */}
                  <div>
                    <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {t('notifications.settingsPanel.notificationTypes')}
                    </h3>
                    <div className="space-y-3">
                      {[
                        { key: 'emailNotifications', label: t('notifications.settingsPanel.emailNotifications') },
                        { key: 'pushNotifications', label: t('notifications.settingsPanel.pushNotifications') },
                        { key: 'inAppNotifications', label: t('notifications.settingsPanel.inAppNotifications') }
                      ].map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={settings[key as keyof NotificationSettings] as boolean}
                            onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* 通知类型 */}
                  <div>
                    <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {t('notifications.settingsPanel.notificationTypes')}
                    </h3>
                    <div className="space-y-3">
                      {[
                        { key: 'enableLikes', label: t('notifications.settingsPanel.enableLikes') },
                        { key: 'enableComments', label: t('notifications.settingsPanel.enableComments') },
                        { key: 'enableFollows', label: t('notifications.settingsPanel.enableFollows') },
                        { key: 'enableMentions', label: t('notifications.settingsPanel.enableMentions') },
                        { key: 'enableActivities', label: t('notifications.settingsPanel.enableActivities') },
                        { key: 'enableSystem', label: t('notifications.settingsPanel.enableSystem') }
                      ].map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={settings[key as keyof NotificationSettings] as boolean}
                            onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* 通知频率 */}
                  <div>
                    <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {t('notifications.settingsPanel.frequency')}
                    </h3>
                    <select
                      value={settings.frequency}
                      onChange={(e) => setSettings({ ...settings, frequency: e.target.value as any })}
                      className={`w-full p-2 rounded border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
                    >
                      <option value="immediately">{t('notifications.settingsPanel.immediately')}</option>
                      <option value="hourly">{t('notifications.settingsPanel.hourly')}</option>
                      <option value="daily">{t('notifications.settingsPanel.daily')}</option>
                      <option value="weekly">{t('notifications.settingsPanel.weekly')}</option>
                    </select>
                  </div>
                </div>
                
                {/* 操作按钮 */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowSettings(false)}
                    className={`flex-1 px-4 py-2 rounded border transition-colors ${isDark ? 'border-gray-600 hover:bg-gray-700 text-gray-300' : 'border-gray-300 hover:bg-gray-50 text-gray-700'}`}
                  >
                    {t('notifications.settingsPanel.cancel')}
                  </button>
                  <button
                    onClick={() => saveSettingsMutation.mutate(settings)}
                    disabled={saveSettingsMutation.isPending}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {saveSettingsMutation.isPending ? t('common.loading') : t('notifications.settingsPanel.save')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;