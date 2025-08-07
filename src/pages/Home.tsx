import { useTranslation } from 'react-i18next';
import { Heart, MessageCircle, Share2, TrendingUp, Users, Star, Calendar, MapPin, Play, ArrowRight, UserPlus, HandHeart } from 'lucide-react';
import { Link } from 'react-router-dom';
export default function Home() {
  const { t } = useTranslation();

  // 热门内容数据
  const trendingPosts = [
    {
      id: 1,
      title: 'BiuBiuStar年度成就回顾',
      content: '2024年是BiuBiuStar飞速发展的一年，从月均30万到150万的业绩增长，见证了我们团队的努力与成长。',
      author: 'BiuBiuStar官方',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=300&fit=crop',
      likes: 2468,
      comments: 186,
      views: 15420,
      category: '公司动态',
      type: 'featured'
    },
    {
      id: 2,
      title: 'TikTok直播技巧分享',
      content: '分享最新的TikTok直播技巧和运营策略，帮助主播们提升直播效果和粉丝互动。',
      author: '直播导师小李',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
      image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=300&fit=crop',
      likes: 892,
      comments: 127,
      views: 5420,
      category: '技巧分享',
      type: 'video'
    },
    {
      id: 3,
      title: '越南直播市场分析报告',
      content: '深度分析越南直播电商市场的现状与趋势，为想要进入这个市场的伙伴提供参考。',
      author: '市场分析师',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=300&fit=crop',
      likes: 567,
      comments: 89,
      views: 3256,
      category: '市场分析',
      type: 'article'
    },
  ];

  // 活动推荐数据
  const recommendedActivities = [
    {
      id: 1,
      title: '2025新年主播招募大会',
      description: '诚邀有梦想的年轻人加入BiuBiuStar大家庭，一起在直播行业创造属于自己的精彩人生。',
      date: '2025-01-15',
      time: '14:00-18:00',
      location: '胡志明市BiuBiuStar总部',
      participants: 0,
      maxParticipants: 100,
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop',
      category: '招募活动'
    },
    {
      id: 2,
      title: '直播技能提升训练营',
      description: '为期一周的直播技能强化训练，包括表演技巧、镜头感培养、观众互动等专业课程。',
      date: '2025-01-20',
      time: '09:00-17:00',
      location: '线上+线下',
      participants: 28,
      maxParticipants: 50,
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop',
      category: '技能培训'
    }
  ];

  const stats = [
    { icon: Users, label: '全球主播', value: '500+', desc: '活跃主播数量' },
    { icon: Star, label: '平台荣誉', value: '20+', desc: '获得平台奖项' },
    { icon: TrendingUp, label: '月均业绩', value: '150万', desc: 'RMB月营收' },
  ];

  return (
    <div className="min-h-screen">
      {/* 首屏展示 */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="relative z-10 container-responsive text-center text-white">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
              BiuBiuStar
              <span className="block text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent mt-4">
                全球文化娱乐领航者
              </span>
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl mb-12 text-blue-100 leading-relaxed max-w-4xl mx-auto">
              立足新加坡，放眼全球，致力于引领全球文化娱乐产业的发展
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link 
                to="/trending"
                className="px-10 py-4 bg-white text-blue-600 font-bold text-lg rounded-full hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                探索热门内容
              </Link>
              <Link
                to="/about"
                className="px-10 py-4 border-3 border-white text-white font-bold text-lg rounded-full hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105"
              >
                了解我们的故事
              </Link>
            </div>
          </div>
        </div>
        
        {/* 向下滚动指示器 */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* 统计数据展示 */}
      <section className="py-16 md:py-20 bg-white dark:bg-gray-900 -mt-20 relative z-10">
        <div className="container-responsive">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                      {stat.value}
                    </h3>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {stat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 热门内容区 */}
      <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              热门内容
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              发现社区中最受欢迎的精彩内容和最新动态
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {trendingPosts.map((post) => (
              <article key={post.id} className="bg-white dark:bg-gray-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
                <div className="relative">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-full">
                      {post.category}
                    </span>
                  </div>
                  {post.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <Link to={`/post/${post.id}`}>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {post.content}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={post.avatar}
                        alt={post.author}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {post.author}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Heart className="w-4 h-4" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comments}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center">
            <Link 
              to="/trending"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              查看更多热门内容
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 活动推荐区 */}
      <section className="py-16 md:py-20 bg-white dark:bg-gray-900">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              活动推荐
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              参与我们的精彩活动，与志同道合的伙伴一起成长
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {recommendedActivities.map((activity) => (
              <div key={activity.id} className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="relative">
                  <img
                    src={activity.image}
                    alt={activity.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-blue-500 text-white text-sm font-medium rounded-full">
                      {activity.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {activity.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {activity.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{activity.date} {activity.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>{activity.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>{activity.participants}/{activity.maxParticipants} 人参与</span>
                    </div>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105">
                    了解详情
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link 
              to="/activities"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
            >
              查看更多活动
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 加入我们的社区 */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white">
        <div className="container-responsive text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            加入我们的社区
          </h2>
          <p className="text-lg md:text-xl mb-12 max-w-3xl mx-auto text-blue-100 leading-relaxed">
            与志同道合的朋友分享你的想法，发现更多有趣的内容，一起创造美好的社交体验。
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-10 py-4 bg-white text-blue-600 font-bold text-lg rounded-full hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              <UserPlus className="w-6 h-6" />
              立即注册
            </Link>
            <Link
              to="/about#contact"
              className="inline-flex items-center gap-2 px-10 py-4 bg-white text-blue-600 font-bold text-lg rounded-full hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              <HandHeart className="w-6 h-6" />
              联系我们
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}