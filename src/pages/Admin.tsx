import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Users,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  Shield,
  ShieldCheck,
  TrendingUp,
  MessageSquare,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Search,
  Filter,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  History,
  Mail,
  Phone,
  Building,
  User,
  FileCheck
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  totalEvents: number;
  totalComments: number;
  activeUsers: number;
  newUsersToday: number;
  postsToday: number;
  eventsToday: number;
}

interface User {
  id: string;
  username: string;
  display_name: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  is_verified: boolean;
  created_at: string;
  follower_count: number;
  following_count: number;
  post_count: number;
}

interface Tab {
  id: string;
  label: string;
  icon: any;
  badge?: number;
}

interface Post {
  id: string;
  content: string;
  author: {
    username: string;
    display_name: string;
  };
  created_at: string;
  like_count: number;
  comment_count: number;
  share_count: number;
  status: 'pending' | 'published' | 'rejected';
  reviewed_at?: string;
  reviewed_by?: {
    username: string;
    display_name: string;
  };
  rejection_reason?: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  organizer: {
    username: string;
    display_name: string;
  };
  start_time: string;
  end_time: string;
  location: string;
  status: 'draft' | 'published' | 'cancelled';
  participant_count: number;
}

interface ContactForm {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  cooperation_type: string;
  description: string;
  status: 'unprocessed' | 'processing' | 'completed';
  admin_notes?: string;
  processed_by?: {
    username: string;
    display_name: string;
  };
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

type TabType = 'dashboard' | 'users' | 'posts' | 'moderation' | 'events' | 'contact' | 'settings';

const Admin: React.FC = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // 获取Supabase access token
    const getAccessToken = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        setAccessToken(session.access_token);
      }
    };
    getAccessToken();
  }, []);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [moderationStats, setModerationStats] = useState<any>(null);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [contactForms, setContactForms] = useState<ContactForm[]>([]);
  const [contactStats, setContactStats] = useState<any>(null);
  const [filterContactStatus, setFilterContactStatus] = useState<string>('all');

  // 显示加载状态
  if (authLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container-responsive">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              正在验证管理员权限...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 权限检查
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return <Navigate to="/login" replace />;
  }

  // 获取统计数据
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
      toast.error(t('admin.fetchStatsError'));
    }
  };

  // 获取用户列表
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data);
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
      toast.error(t('admin.fetchUsersError'));
    } finally {
      setLoading(false);
    }
  };

  // 获取帖子列表
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/posts', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPosts(data.data);
      }
    } catch (error) {
      console.error('获取帖子列表失败:', error);
      toast.error(t('admin.fetchPostsError'));
    } finally {
      setLoading(false);
    }
  };

  // 获取活动列表
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/events', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEvents(data.data);
      }
    } catch (error) {
      console.error('获取活动列表失败:', error);
      toast.error(t('admin.fetchEventsError'));
    } finally {
      setLoading(false);
    }
  };

  // 更新用户信息
  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        toast.success(t('admin.updateUserSuccess'));
        fetchUsers();
      } else {
        toast.error(t('admin.updateUserError'));
      }
    } catch (error) {
      console.error('更新用户失败:', error);
      toast.error(t('admin.updateUserError'));
    }
  };

  // 删除帖子
  const deletePost = async (postId: string) => {
    if (!confirm(t('admin.confirmDeletePost'))) return;
    
    try {
      const response = await fetch(`/api/admin/posts/${postId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
      });
      
      if (response.ok) {
        toast.success(t('admin.deletePostSuccess'));
        fetchPosts();
      } else {
        toast.error(t('admin.deletePostError'));
      }
    } catch (error) {
      console.error('删除帖子失败:', error);
      toast.error(t('admin.deletePostError'));
    }
  };

  // 删除活动
  const deleteEvent = async (eventId: string) => {
    if (!confirm(t('admin.confirmDeleteEvent'))) return;
    
    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
      });
      
      if (response.ok) {
        toast.success(t('admin.deleteEventSuccess'));
        fetchEvents();
      } else {
        toast.error(t('admin.deleteEventError'));
      }
    } catch (error) {
      console.error('删除活动失败:', error);
      toast.error(t('admin.deleteEventError'));
    }
  };

  // 获取待审核帖子
  const fetchPendingPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/posts/pending', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPendingPosts(data.data);
      }
    } catch (error) {
      console.error('获取待审核帖子失败:', error);
      toast.error('获取待审核帖子失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取审核统计
  const fetchModerationStats = async () => {
    try {
      const response = await fetch('/api/admin/posts/moderation-stats', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setModerationStats(data.data);
      }
    } catch (error) {
      console.error('获取审核统计失败:', error);
    }
  };

  // 获取联系表单列表
  const fetchContactForms = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('contact_forms')
        .select(`
          *,
          processed_by:users!contact_forms_processed_by_fkey(
            username,
            display_name
          )
        `)
        .order('created_at', { ascending: false });

      if (filterContactStatus !== 'all') {
        query = query.eq('status', filterContactStatus);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      setContactForms(data || []);
    } catch (error) {
      console.error('Error fetching contact forms:', error);
      toast.error('获取联系表单失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取联系表单统计
  const fetchContactStats = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_forms')
        .select('status');
      
      if (error) throw error;
      
      const stats = {
        total: data?.length || 0,
        unprocessed: data?.filter(item => item.status === 'unprocessed').length || 0,
        processing: data?.filter(item => item.status === 'processing').length || 0,
        completed: data?.filter(item => item.status === 'completed').length || 0
      };
      
      setContactStats(stats);
    } catch (error) {
      console.error('Error fetching contact stats:', error);
      toast.error('获取联系表单统计失败');
    }
  };

  // 审核通过
  const approvePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/admin/posts/${postId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        toast.success('帖子审核通过');
        fetchPendingPosts();
        fetchModerationStats();
      } else {
        toast.error('审核操作失败');
      }
    } catch (error) {
      console.error('审核通过失败:', error);
      toast.error('审核操作失败');
    }
  };

  // 审核拒绝
  const rejectPost = async (postId: string, reason: string) => {
    try {
      const response = await fetch(`/api/admin/posts/${postId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      
      if (response.ok) {
        toast.success('帖子已拒绝');
        fetchPendingPosts();
        fetchModerationStats();
      } else {
        toast.error('审核操作失败');
      }
    } catch (error) {
      console.error('审核拒绝失败:', error);
      toast.error('审核操作失败');
    }
  };

  // 批量审核
  const batchModerate = async (action: 'approve' | 'reject', reason?: string) => {
    if (selectedPosts.length === 0) {
      toast.error('请选择要审核的帖子');
      return;
    }

    try {
      const response = await fetch('/api/admin/posts/batch-moderate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          postIds: selectedPosts,
          action,
          reason
        })
      });
      
      if (response.ok) {
        toast.success(`批量${action === 'approve' ? '通过' : '拒绝'}成功`);
        setSelectedPosts([]);
        fetchPendingPosts();
        fetchModerationStats();
      } else {
        toast.error('批量审核失败');
      }
    } catch (error) {
      console.error('批量审核失败:', error);
      toast.error('批量审核失败');
    }
  };

  // 更新联系表单状态
  const updateContactFormStatus = async (formId: string, status: 'unprocessed' | 'processing' | 'completed', notes?: string) => {
    try {
      const updateData: any = {
        status,
        processed_by: user?.id,
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (notes !== undefined) {
        updateData.admin_notes = notes;
      }

      const { error } = await supabase
        .from('contact_forms')
        .update(updateData)
        .eq('id', formId);

      if (error) throw error;

      toast.success('联系表单状态更新成功');
      fetchContactForms();
      fetchContactStats();
    } catch (error) {
      console.error('Error updating contact form status:', error);
      toast.error('更新联系表单状态失败');
    }
  };

  useEffect(() => {
    fetchStats();
    fetchModerationStats();
  }, []);

  useEffect(() => {
    switch (activeTab) {
      case 'users':
        fetchUsers();
        break;
      case 'posts':
        fetchPosts();
        break;
      case 'events':
        fetchEvents();
        break;
      case 'moderation':
        fetchPendingPosts();
        fetchModerationStats();
        break;
      case 'contact':
        fetchContactForms();
        fetchContactStats();
        break;
    }
  }, [activeTab, searchTerm, filterRole, filterContactStatus]);

  // 过滤用户
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const tabs = [
    { id: 'dashboard', label: t('admin.dashboard'), icon: BarChart3 },
    { id: 'users', label: t('admin.users'), icon: Users },
    { id: 'posts', label: t('admin.posts'), icon: FileText },
    { id: 'moderation', label: t('moderation.pending'), icon: Clock, badge: moderationStats?.pending || 0 },
    { id: 'events', label: t('admin.events'), icon: Calendar },
    { id: 'contact', label: t('admin.contact'), icon: Mail },
    { id: 'settings', label: t('admin.settings'), icon: Settings },
  ];}]}

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('admin.title')}
            </h1>
          </div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t('admin.subtitle')}
          </p>
        </div>

        {/* 标签页导航 */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm relative ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                    {tab.badge && tab.badge > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {activeTab === 'dashboard' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* 统计卡片 */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {t('admin.totalUsers')}
                      </p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {stats?.totalUsers || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">
                        {t('admin.totalPosts')}
                      </p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {stats?.totalPosts || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        {t('admin.totalEvents')}
                      </p>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        {stats?.totalEvents || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg">
                  <div className="flex items-center">
                    <MessageSquare className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                        {t('admin.totalComments')}
                      </p>
                      <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                        {stats?.totalComments || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 今日数据 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('admin.newUsersToday')}
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {stats?.newUsersToday || 0}
                      </p>
                    </div>
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('admin.postsToday')}
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {stats?.postsToday || 0}
                      </p>
                    </div>
                    <TrendingUp className="h-6 w-6 text-blue-500" />
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('admin.eventsToday')}
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {stats?.eventsToday || 0}
                      </p>
                    </div>
                    <TrendingUp className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="p-6">
              {/* 搜索和过滤 */}
              <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('admin.searchUsers')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="all">{t('admin.allRoles')}</option>
                    <option value="user">{t('admin.user')}</option>
                    <option value="admin">{t('admin.admin')}</option>
                    <option value="super_admin">{t('admin.superAdmin')}</option>
                  </select>
                  <button
                    onClick={fetchUsers}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    {t('common.refresh')}
                  </button>
                </div>
              </div>

              {/* 用户列表 */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('admin.user')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('admin.role')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('admin.stats')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('admin.joinDate')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('admin.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {user.display_name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.display_name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                @{user.username}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'super_admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                            user.role === 'admin' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                            'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          }`}>
                            {t(`admin.${user.role}`)}
                          </span>
                          {user.is_verified && (
                            <UserCheck className="inline ml-2 h-4 w-4 text-blue-500" />
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div>{user.post_count} {t('admin.posts')}</div>
                          <div>{user.follower_count} {t('admin.followers')}</div>
                          <div>{user.following_count} {t('admin.following')}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => updateUser(user.id, { is_verified: !user.is_verified })}
                              className={`p-1 rounded ${
                                user.is_verified
                                  ? 'text-red-600 hover:text-red-900'
                                  : 'text-green-600 hover:text-green-900'
                              }`}
                              title={user.is_verified ? t('admin.unverify') : t('admin.verify')}
                            >
                              {user.is_verified ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </button>
                            {user.role !== 'super_admin' && user.id !== user.id && (
                              <button
                                onClick={() => {
                                  const newRole = user.role === 'admin' ? 'user' : 'admin';
                                  updateUser(user.id, { role: newRole });
                                }}
                                className="p-1 text-blue-600 hover:text-blue-900"
                                title={user.role === 'admin' ? t('admin.demoteToUser') : t('admin.promoteToAdmin')}
                              >
                                <Shield className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'posts' && (
            <div className="p-6">
              <div className="mb-6 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t('admin.postManagement')}
                </h3>
                <button
                  onClick={fetchPosts}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  {t('common.refresh')}
                </button>
              </div>

              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {post.author.display_name}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            @{post.author.username}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">·</span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-900 dark:text-white mb-3">
                          {post.content}
                        </p>
                        <div className="flex space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>{post.like_count} {t('admin.likes')}</span>
                          <span>{post.comment_count} {t('admin.comments')}</span>
                          <span>{post.share_count} {t('admin.shares')}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => deletePost(post.id)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          title={t('admin.deletePost')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="p-6">
              <div className="mb-6 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t('admin.eventManagement')}
                </h3>
                <button
                  onClick={fetchEvents}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  {t('common.refresh')}
                </button>
              </div>

              <div className="grid gap-4">
                {events.map((event) => (
                  <div key={event.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {event.title}
                          </h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            event.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                            event.status === 'draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                            'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {t(`admin.${event.status}`)}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          {event.description}
                        </p>
                        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                          <div>主办方: {event.organizer.display_name} (@{event.organizer.username})</div>
                          <div>时间: {new Date(event.start_time).toLocaleString()} - {new Date(event.end_time).toLocaleString()}</div>
                          <div>地点: {event.location}</div>
                          <div>参与人数: {event.participant_count}</div>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => deleteEvent(event.id)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          title={t('admin.deleteEvent')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'moderation' && (
            <div className="p-6">
              {/* 审核统计 */}
              {moderationStats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="h-6 w-6 text-yellow-600" />
                      <div className="ml-3">
                        <p className="text-sm text-yellow-600 dark:text-yellow-400">{t('moderation.status.pending')}</p>
                        <p className="text-xl font-bold text-yellow-900 dark:text-yellow-100">
                          {moderationStats.pending}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <div className="ml-3">
                        <p className="text-sm text-green-600 dark:text-green-400">{t('moderation.status.approved')}</p>
                        <p className="text-xl font-bold text-green-900 dark:text-green-100">
                          {moderationStats.approved}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <div className="flex items-center">
                      <XCircle className="h-6 w-6 text-red-600" />
                      <div className="ml-3">
                        <p className="text-sm text-red-600 dark:text-red-400">{t('moderation.status.rejected')}</p>
                        <p className="text-xl font-bold text-red-900 dark:text-red-100">
                          {moderationStats.rejected}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="flex items-center">
                      <History className="h-6 w-6 text-blue-600" />
                      <div className="ml-3">
                        <p className="text-sm text-blue-600 dark:text-blue-400">{t('moderation.stats.todayReviewed')}</p>
                        <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                          {moderationStats.todayReviewed}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 批量操作 */}
              {selectedPosts.length > 0 && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      {t('moderation.batchActions.selected', { count: selectedPosts.length })}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => batchModerate('approve')}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        {t('moderation.batchActions.approve')}
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt(t('moderation.rejectionReason.prompt'));
                          if (reason) batchModerate('reject', reason);
                        }}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        {t('moderation.batchActions.reject')}
                      </button>
                      <button
                        onClick={() => setSelectedPosts([])}
                        className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                      >
                        {t('moderation.batchActions.cancel')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 待审核帖子列表 */}
              <div className="space-y-4">
                {pendingPosts.map((post) => (
                  <div key={post.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedPosts.includes(post.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPosts([...selectedPosts, post.id]);
                          } else {
                            setSelectedPosts(selectedPosts.filter(id => id !== post.id));
                          }
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {post.author.display_name}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            @{post.author.username}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">·</span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {new Date(post.created_at).toLocaleString()}
                          </span>
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 text-xs rounded-full">
                            {t('moderation.status.pending')}
                          </span>
                        </div>
                        <p className="text-gray-900 dark:text-white mb-3">
                          {post.content}
                        </p>
                        <div className="flex space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>{post.like_count} {t('posts.likes')}</span>
                          <span>{post.comment_count} {t('posts.comments')}</span>
                          <span>{post.share_count} {t('posts.shares')}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => approvePost(post.id)}
                          className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                          title={t('moderation.actions.approve')}
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt(t('moderation.rejectionReason.prompt'));
                            if (reason) rejectPost(post.id, reason);
                          }}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          title={t('moderation.actions.reject')}
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                        <button
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                          title={t('moderation.actions.viewDetails')}
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {pendingPosts.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">{t('moderation.noPendingPosts')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="p-6">
              {/* 联系表单统计 */}
              {contactStats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Mail className="h-6 w-6 text-blue-600" />
                      <div className="ml-3">
                        <p className="text-sm text-blue-600 dark:text-blue-400">总表单数</p>
                        <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                          {contactStats.total}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="h-6 w-6 text-yellow-600" />
                      <div className="ml-3">
                        <p className="text-sm text-yellow-600 dark:text-yellow-400">待处理</p>
                        <p className="text-xl font-bold text-yellow-900 dark:text-yellow-100">
                          {contactStats.unprocessed}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="h-6 w-6 text-orange-600" />
                      <div className="ml-3">
                        <p className="text-sm text-orange-600 dark:text-orange-400">处理中</p>
                        <p className="text-xl font-bold text-orange-900 dark:text-orange-100">
                          {contactStats.processing}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <div className="ml-3">
                        <p className="text-sm text-green-600 dark:text-green-400">已完成</p>
                        <p className="text-xl font-bold text-green-900 dark:text-green-100">
                          {contactStats.completed}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 筛选器 */}
              <div className="mb-6 flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select
                    value={filterContactStatus}
                    onChange={(e) => setFilterContactStatus(e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">所有状态</option>
                    <option value="unprocessed">待处理</option>
                    <option value="processing">处理中</option>
                    <option value="completed">已完成</option>
                  </select>
                </div>
                <button
                  onClick={() => {
                    fetchContactForms();
                    fetchContactStats();
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>刷新</span>
                </button>
              </div>

              {/* 联系表单列表 */}
              <div className="space-y-4">
                {contactForms.map((form) => (
                  <div key={form.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-gray-900 dark:text-white">
                              {form.name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {form.email}
                            </span>
                          </div>
                          {form.company && (
                            <div className="flex items-center space-x-2">
                              <Building className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-600 dark:text-gray-400">
                                {form.company}
                              </span>
                            </div>
                          )}
                          {form.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-600 dark:text-gray-400">
                                {form.phone}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                          <span>合作类型: {form.cooperation_type}</span>
                          <span>·</span>
                          <span>提交时间: {new Date(form.created_at).toLocaleString()}</span>
                        </div>
                        <div className="mb-4">
                          <p className="text-gray-900 dark:text-white">
                            {form.description}
                          </p>
                        </div>
                        {form.admin_notes && (
                          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">管理员备注:</p>
                            <p className="text-gray-900 dark:text-white">{form.admin_notes}</p>
                          </div>
                        )}
                        {form.processed_by && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            处理人: {form.processed_by.display_name} · 
                            处理时间: {form.processed_at ? new Date(form.processed_at).toLocaleString() : ''}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 text-xs rounded-full ${
                          form.status === 'unprocessed' 
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : form.status === 'processing'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        }`}>
                          {form.status === 'unprocessed' ? '待处理' : 
                           form.status === 'processing' ? '处理中' : '已完成'}
                        </span>
                        <div className="flex space-x-2">
                          {form.status !== 'processing' && (
                            <button
                              onClick={() => updateContactFormStatus(form.id, 'processing')}
                              className="p-2 text-orange-600 hover:text-orange-900 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded"
                              title="标记为处理中"
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </button>
                          )}
                          {form.status !== 'completed' && (
                            <button
                              onClick={() => {
                                const notes = prompt('请输入处理备注（可选）:');
                                updateContactFormStatus(form.id, 'completed', notes || undefined);
                              }}
                              className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                              title="标记为已完成"
                            >
                              <FileCheck className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              const notes = prompt('请输入备注:', form.admin_notes || '');
                              if (notes !== null) {
                                updateContactFormStatus(form.id, form.status, notes);
                              }
                            }}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                            title="编辑备注"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {contactForms.length === 0 && (
                  <div className="text-center py-8">
                    <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">暂无联系表单</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                {t('admin.systemSettings')}
              </h3>
              <div className="space-y-6">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Settings className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        {t('admin.systemSettingsNote')}
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                        <p>{t('admin.systemSettingsDescription')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;