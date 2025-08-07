import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Target, Award, Users, TrendingUp, Calendar, Building, Globe, Star } from 'lucide-react';
import ContactForm from '../components/ContactForm';

export default function About() {
  const { t } = useTranslation();

  useEffect(() => {
    // 处理锚点跳转
    if (window.location.hash === '#contact') {
      setTimeout(() => {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, []);

  const timelineEvents = [
    {
      date: '2023年10月',
      title: 'biubiustar考察团队',
      description: '深入了解越南市场环境与场地选址工作',
      icon: <MapPin className="w-5 h-5" />
    },
    {
      date: '2023年11月',
      title: '确认公司场地',
      description: '完成公司办公场地及员工宿舍管理合同的签署，顺利完成公司注册流程，同步启动办公场地装修工程并开展大规模招聘面试筛选超过百名主播人才。',
      icon: <Building className="w-5 h-5" />
    },
    {
      date: '2023年12月',
      title: '试运营',
      description: '正式启用公司G层(大厅)作为舞蹈培训与运营培训场地；部分主播开始进行试播，逐步进入内容测试与打磨阶段。',
      icon: <Users className="w-5 h-5" />
    },
    {
      date: '2024年1月',
      title: 'BIGO平台开始运营',
      description: '第一批主播分批启动直播，正式开启内容输出。1月10日，公司举行开业典礼，除6楼外其余区域装修完成并交付使用。1月12日，公司网络系统调试完毕，直播与运营工作全面启动。同年中国分公司成立开拓抖音后台，成立公会，筹备各部门建立及发展规划。',
      icon: <Star className="w-5 h-5" />
    },
    {
      date: '2024年2月',
      title: 'BIGO平台颁奖',
      description: '成为bigo平台新公会首月，NO.1，首月直播及员工达成100人规模，公司雏形基本完善。同时成功举办首届公司年会，邀请Bigo越南总经理及胡志明市二郡相关领导出席，活动备受好评。',
      icon: <Award className="w-5 h-5" />
    },
    {
      date: '2024年5月',
      title: 'BIGO平台颁奖',
      description: '同年3月，获得bigo最佳新人工会奖。同年5月，获得bigo季度第二，总排名第8名奖励。',
      icon: <Award className="w-5 h-5" />
    },
    {
      date: '2024年6月',
      title: '进军TikTok',
      description: '6月，越南TikTok总经理一行到访公司参观，标志着公司正式启动TikTok业务布局。',
      icon: <Globe className="w-5 h-5" />
    },
    {
      date: '2024年7月',
      title: 'TIKTOK平台获奖',
      description: '荣获TikTok平台新人公会排名第四。',
      icon: <Award className="w-5 h-5" />
    },
    {
      date: '2024年11月',
      title: '抖音平台获奖',
      description: '公司旗下主播获得城市前三，地区前十的荣誉。',
      icon: <Award className="w-5 h-5" />
    },
    {
      date: '2024年12月',
      title: '年度成就',
      description: '公司旗下主播再度获得抖音优秀主播奖，抖音年度嘉年华区域赛事获得省前十。',
      icon: <Award className="w-5 h-5" />
    }
  ];

  const performanceData = [
    { period: '1-6月', revenue: '30万', label: '月均业绩', unit: 'RMB' },
    { period: '7-9月', revenue: '60万', label: '月均业绩翻倍至', unit: 'RMB' },
    { period: '10-12月', revenue: '150万', label: '月均业绩达', unit: 'RMB' }
  ];

  return (
    <div className="min-h-screen">
      {/* 页面头部 */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white py-16 md:py-24">
        <div className="container-responsive">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              关于我们
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Biubiustar成立于花园国度-新加坡，立足新加坡，放眼全球，致力于引领全球文化娱乐产业的发展
            </p>
          </div>
        </div>
      </div>

      {/* 企业概况 */}
      <section className="py-16 md:py-20 bg-white dark:bg-gray-900">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              企业概况
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">发展战略</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    目标实现"中国娱乐行业前十、东南亚前三"的发展战略
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Globe className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">全球布局</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    筹备在中国重庆、中国福建、越南胡志明、泰国曼谷、马来西亚吉隆坡等地设立投资子公司
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8 rounded-2xl">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                作为一家多元化的文化娱乐互联网企业，Biubiustar前期聚焦于网络直播和短视频内容的深度耕耘；中期将拓展至电竞、电商、网红商务服务等领域，涵盖娱乐直播、电商直播、电竞直播等多种内容生态，重点打造直播红人和短视频达人，致力于成为国内领先的网红经纪运营公司。
              </p>
              <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg border-l-4 border-blue-500">
                <p className="text-gray-700 dark:text-gray-300">
                  Biubiustar正倾力打造"数字文化产业创新公园"项目，为更多有梦想、有创造力的年轻人提供实现自我价值的平台。该项目集"吃、穿、住、用、娱、购"于一体，致力于成为越南最大规模、最高产值、最具影响力的国际数字文化人才聚集地和流量高地。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 发展时间轴 */}
      <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              BiuBiuStar发展时间轴
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto"></div>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* 时间轴主线 */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500 hidden md:block"></div>
              
              <div className="space-y-8">
                {timelineEvents.map((event, index) => (
                  <div key={index} className="relative flex items-start gap-6 md:gap-8">
                    {/* 时间轴节点 */}
                    <div className="flex-shrink-0 relative">
                      <div className="w-16 h-16 bg-white dark:bg-gray-700 rounded-full border-4 border-blue-500 flex items-center justify-center shadow-lg">
                        <div className="text-blue-600 dark:text-blue-400">
                          {event.icon}
                        </div>
                      </div>
                      {/* 时间标签 */}
                      <div className="absolute -top-2 left-20 md:left-24 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                        {event.date}
                      </div>
                    </div>
                    
                    {/* 内容卡片 */}
                    <div className="flex-1 bg-white dark:bg-gray-700 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-600 mt-8 md:mt-4">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2024业绩展示 */}
      <section className="py-16 md:py-20 bg-white dark:bg-gray-900">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              2024业绩展示
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {performanceData.map((data, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                  <div className="mb-4">
                    <TrendingUp className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {data.period}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {data.label}
                  </div>
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {data.revenue}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    {data.unit}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-6 py-3 rounded-full">
              <TrendingUp className="w-5 h-5" />
              <span className="font-semibold">业绩持续快速增长，年底较年初增长400%</span>
            </div>
          </div>
        </div>
      </section>

      {/* 联系我们 */}
      <section id="contact" className="py-16 md:py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              联系我们
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              我们期待与您的合作，共同创造数字文化娱乐产业的美好未来
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-700 rounded-2xl shadow-xl overflow-hidden">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}