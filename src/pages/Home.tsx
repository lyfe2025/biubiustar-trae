import { useTranslation } from 'react-i18next';
import { Heart, MessageCircle, Share2, TrendingUp, Users, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const { t } = useTranslation();

  // 模拟数据
  const featuredPosts = [
    {
      id: 1,
      title: '探索未来科技的无限可能',
      content: '人工智能正在改变我们的生活方式，从智能家居到自动驾驶，科技的进步让我们的生活变得更加便利和高效。',
      author: '科技探索者',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=300&fit=crop',
      likes: 128,
      comments: 24,
      views: 1520,
      category: '科技',
    },
    {
      id: 2,
      title: '美食之旅：寻找城市中的隐藏美味',
      content: '在繁忙的都市生活中，总有一些小店默默地为我们提供着最地道的美食。今天就让我们一起探索这些隐藏的美味吧！',
      author: '美食达人',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=300&fit=crop',
      likes: 89,
      comments: 15,
      views: 892,
      category: '美食',
    },
    {
      id: 3,
      title: '旅行日记：漫步在樱花盛开的季节',
      content: '春天是最美的季节，樱花盛开的时候，整个世界都变得粉嫩而浪漫。这次的日本之行让我深深感受到了春天的魅力。',
      author: '旅行摄影师',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      image: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=600&h=300&fit=crop',
      likes: 256,
      comments: 42,
      views: 2341,
      category: '旅行',
    },
  ];

  const stats = [
    { icon: Users, label: '活跃用户', value: '10K+' },
    { icon: Star, label: '精选内容', value: '500+' },
    { icon: TrendingUp, label: '日均浏览', value: '50K+' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-purple text-white py-20">
        <div className="container-responsive text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            {t('home.welcome')}
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 animate-slide-up">
            {t('home.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <button className="px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
              开始探索
            </button>
            <button className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary-600 transition-colors">
              了解更多
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container-responsive">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full mb-4">
                    <Icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {stat.value}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Content */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container-responsive">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.featured')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              发现社区中最受欢迎的精彩内容
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPosts.map((post) => (
              <article key={post.id} className="card card-hover">
                <div className="relative">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-primary-600 text-white text-sm font-medium rounded-full">
                      {post.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <Link to={`/post/${post.id}`}>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {post.content}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Link to={`/user/${post.author}`} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                        <img
                          src={post.avatar}
                          alt={post.author}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                          {post.author}
                        </span>
                      </Link>
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
                      <div className="flex items-center space-x-1">
                        <Share2 className="w-4 h-4" />
                        <span>{post.views}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors">
              查看更多内容
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container-responsive text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            加入我们的社区
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            与志同道合的朋友分享你的想法，发现更多有趣的内容，一起创造美好的社交体验。
          </p>
          <button className="px-8 py-3 gradient-purple text-white font-semibold rounded-lg hover:opacity-90 transition-opacity">
            立即注册
          </button>
        </div>
      </section>
    </div>
  );
}