import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, Filter, Search, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

interface Activity {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  max_participants: number;
  current_participants: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  category: string;
  organizer: string;
  image?: string;
}

export default function Activities() {
  const { t } = useTranslation();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [participatedActivities, setParticipatedActivities] = useState<Set<number>>(new Set());
  const [joiningActivity, setJoiningActivity] = useState<number | null>(null);
  const { user } = useAuth();

  // 模拟数据
  const mockActivities: Activity[] = [
    {
      id: 1,
      title: '周末户外徒步活动',
      description: '一起探索城市周边的美丽山景，享受大自然的清新空气。适合所有体能水平的朋友参与。',
      start_date: '2024-01-20T09:00:00Z',
      end_date: '2024-01-20T17:00:00Z',
      location: '香山公园',
      max_participants: 20,
      current_participants: 12,
      status: 'upcoming',
      category: '户外运动',
      organizer: '户外达人',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20mountain%20hiking%20trail%20with%20people%20walking%20in%20nature%20sunny%20day&image_size=landscape_4_3'
    },
    {
      id: 2,
      title: '技术分享沙龙',
      description: '本期主题：前端开发最新趋势。邀请行业专家分享经验，现场互动交流。',
      start_date: '2024-01-18T19:00:00Z',
      end_date: '2024-01-18T21:00:00Z',
      location: '创业咖啡厅',
      max_participants: 50,
      current_participants: 35,
      status: 'ongoing',
      category: '技术交流',
      organizer: '技术社区',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20tech%20meetup%20presentation%20room%20with%20people%20discussing%20technology&image_size=landscape_4_3'
    },
    {
      id: 3,
      title: '美食制作工作坊',
      description: '学习制作传统中式点心，专业师傅现场指导，包含所有材料和工具。',
      start_date: '2024-01-15T14:00:00Z',
      end_date: '2024-01-15T17:00:00Z',
      location: '烹饪学院',
      max_participants: 15,
      current_participants: 15,
      status: 'completed',
      category: '美食制作',
      organizer: '美食达人',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cooking%20workshop%20people%20making%20traditional%20chinese%20pastries%20kitchen%20setting&image_size=landscape_4_3'
    }
  ];

  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      setActivities(mockActivities);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredActivities = activities.filter(activity => {
    const matchesFilter = filter === 'all' || activity.status === filter;
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'ongoing': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return '即将开始';
      case 'ongoing': return '进行中';
      case 'completed': return '已结束';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleJoinActivity = async (activityId: number) => {
    if (!user) {
      toast.error('请先登录后再参与活动');
      return;
    }

    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;

    if (activity.status === 'completed') {
      toast.error('活动已结束，无法参与');
      return;
    }

    if (activity.current_participants >= activity.max_participants) {
      toast.error('活动已满员，无法参与');
      return;
    }

    if (participatedActivities.has(activityId)) {
      toast.error('您已经参与了这个活动');
      return;
    }

    setJoiningActivity(activityId);

    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 更新参与状态
      setParticipatedActivities(prev => new Set([...prev, activityId]));
      
      // 更新活动参与人数
      setActivities(prevActivities => 
        prevActivities.map(activity => 
          activity.id === activityId 
            ? { ...activity, current_participants: activity.current_participants + 1 }
            : activity
        )
      );

      toast.success('成功参与活动！');
      
      // TODO: 这里应该调用实际的API
      // await api.joinActivity(activityId);
    } catch (error) {
      console.error('参与活动失败:', error);
      toast.error('参与活动失败，请重试');
    } finally {
      setJoiningActivity(null);
    }
  };

  const handleLeaveActivity = async (activityId: number) => {
    if (!user) return;

    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;

    if (activity.status === 'completed') {
      toast.error('活动已结束，无法取消参与');
      return;
    }

    setJoiningActivity(activityId);

    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 更新参与状态
      setParticipatedActivities(prev => {
        const newSet = new Set(prev);
        newSet.delete(activityId);
        return newSet;
      });
      
      // 更新活动参与人数
      setActivities(prevActivities => 
        prevActivities.map(activity => 
          activity.id === activityId 
            ? { ...activity, current_participants: Math.max(0, activity.current_participants - 1) }
            : activity
        )
      );

      toast.success('已取消参与活动');
      
      // TODO: 这里应该调用实际的API
      // await api.leaveActivity(activityId);
    } catch (error) {
      console.error('取消参与失败:', error);
      toast.error('取消参与失败，请重试');
    } finally {
      setJoiningActivity(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container-responsive">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">加载活动中...</p>
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
            活动中心
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            参与社区活动，与更多朋友互动
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2">
            {(['all', 'upcoming', 'ongoing', 'completed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {status === 'all' ? '全部' : getStatusText(status)}
              </button>
            ))}
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="搜索活动..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((activity) => (
            <div key={activity.id} className="card card-hover">
              {activity.image && (
                <div className="relative">
                  <img
                    src={activity.image}
                    alt={activity.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(activity.status)}`}>
                      {getStatusText(activity.status)}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-black/50 text-white text-sm font-medium rounded-full">
                      {activity.category}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {activity.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {activity.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{formatDate(activity.start_date)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{activity.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{activity.current_participants}/{activity.max_participants} 人参与</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    组织者：{activity.organizer}
                  </span>
                  
                  {participatedActivities.has(activity.id) ? (
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center px-3 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-lg dark:bg-green-900/20 dark:text-green-400">
                        <Check className="w-4 h-4 mr-1" />
                        已参与
                      </span>
                      <button
                        onClick={() => handleLeaveActivity(activity.id)}
                        disabled={joiningActivity === activity.id || activity.status === 'completed'}
                        className="px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 disabled:opacity-50"
                      >
                        {joiningActivity === activity.id ? '处理中...' : '取消参与'}
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleJoinActivity(activity.id)}
                      disabled={joiningActivity === activity.id || activity.status === 'completed' || activity.current_participants >= activity.max_participants}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                        activity.status === 'completed'
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-800'
                          : activity.current_participants >= activity.max_participants
                          ? 'bg-yellow-100 text-yellow-800 cursor-not-allowed dark:bg-yellow-900/20 dark:text-yellow-400'
                          : 'bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50'
                      }`}
                    >
                      {joiningActivity === activity.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>加入中...</span>
                        </>
                      ) : (
                        <span>
                          {activity.status === 'completed' ? '已结束' :
                           activity.current_participants >= activity.max_participants ? '已满员' : '参与活动'}
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              暂无活动
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? '没有找到匹配的活动' : '当前没有符合条件的活动'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}