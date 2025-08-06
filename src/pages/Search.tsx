import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search as SearchIcon, Filter, X, Clock, TrendingUp, ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';

interface SearchResult {
  id: string;
  type: 'post' | 'user' | 'activity';
  title: string;
  content?: string;
  author?: string;
  avatar?: string;
  createdAt: string;
  likes?: number;
  comments?: number;
}

interface SearchFilters {
  type: 'all' | 'post' | 'user' | 'activity';
  sortBy: 'relevance' | 'newest' | 'oldest' | 'mostLiked';
  dateRange: 'anyTime' | 'pastDay' | 'pastWeek' | 'pastMonth' | 'pastYear';
  category: string;
}

const Search: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'post' | 'user' | 'activity'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    type: 'all',
    sortBy: 'relevance',
    dateRange: 'anyTime',
    category: 'all'
  });

  // 模拟搜索历史
  useEffect(() => {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // 模拟热门搜索
  const popularSearches = [
    'React开发',
    '前端技术',
    'TypeScript',
    '用户体验',
    '设计模式'
  ];

  // 模拟搜索结果
  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['search', query, filters],
    queryFn: async () => {
      if (!query.trim()) return [];
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 模拟搜索结果
      const mockResults: SearchResult[] = [
        {
          id: '1',
          type: 'post',
          title: `关于${query}的讨论`,
          content: `这是一个关于${query}的详细讨论，包含了很多有用的信息...`,
          author: '技术达人',
          avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20tech%20expert&image_size=square',
          createdAt: '2024-01-15T10:30:00Z',
          likes: 42,
          comments: 15
        },
        {
          id: '2',
          type: 'user',
          title: `${query}专家`,
          content: `专注于${query}领域的资深开发者`,
          avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=developer%20avatar%20expert&image_size=square',
          createdAt: '2024-01-10T15:20:00Z'
        },
        {
          id: '3',
          type: 'activity',
          title: `${query}技术分享会`,
          content: `线上技术分享活动，主题：${query}最佳实践`,
          createdAt: '2024-01-20T09:00:00Z'
        }
      ];
      
      return mockResults.filter(result => {
        if (filters.type !== 'all' && result.type !== filters.type) return false;
        return true;
      });
    },
    enabled: !!query.trim()
  });

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setQuery(searchQuery);
    
    // 更新搜索历史
    const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const filteredResults = searchResults?.filter(result => {
    if (activeTab !== 'all' && result.type !== activeTab) return false;
    return true;
  }) || [];

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'post': return '📝';
      case 'user': return '👤';
      case 'activity': return '🎯';
      default: return '📄';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 搜索标题 */}
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('search.title')}
          </h1>
        </div>

        {/* 搜索框 */}
        <div className="relative mb-6">
          <div className={`relative rounded-lg border-2 ${isDark ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'} focus-within:border-blue-500 transition-colors`}>
            <SearchIcon className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
              placeholder={t('search.placeholder')}
              className={`w-full pl-12 pr-20 py-4 text-lg rounded-lg border-none outline-none ${isDark ? 'bg-gray-800 text-white placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500'}`}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-md transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                title={t('search.filters')}
              >
                <Filter className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleSearch(query)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {t('search.title')}
              </button>
            </div>
          </div>
        </div>

        {/* 高级筛选 */}
        {showFilters && (
          <div className={`mb-6 p-4 rounded-lg border ${isDark ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('search.sortBy')}
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({...filters, sortBy: e.target.value as any})}
                  className={`w-full p-2 rounded border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
                >
                  <option value="relevance">{t('search.relevance')}</option>
                  <option value="newest">{t('search.newest')}</option>
                  <option value="oldest">{t('search.oldest')}</option>
                  <option value="mostLiked">{t('search.mostLiked')}</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('search.dateRange')}
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({...filters, dateRange: e.target.value as any})}
                  className={`w-full p-2 rounded border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
                >
                  <option value="anyTime">{t('search.anyTime')}</option>
                  <option value="pastDay">{t('search.pastDay')}</option>
                  <option value="pastWeek">{t('search.pastWeek')}</option>
                  <option value="pastMonth">{t('search.pastMonth')}</option>
                  <option value="pastYear">{t('search.pastYear')}</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('search.category')}
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className={`w-full p-2 rounded border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
                >
                  <option value="all">{t('search.allCategories')}</option>
                  <option value="tech">{t('categories.tech')}</option>
                  <option value="design">{t('categories.design')}</option>
                  <option value="business">{t('categories.business')}</option>
                  <option value="lifestyle">{t('categories.lifestyle')}</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setShowFilters(false)}
                  className={`w-full p-2 rounded border transition-colors ${isDark ? 'border-gray-600 hover:bg-gray-700 text-gray-300' : 'border-gray-300 hover:bg-gray-50 text-gray-700'}`}
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 搜索建议和历史 */}
        {!query && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* 搜索历史 */}
            {searchHistory.length > 0 && (
              <div className={`p-4 rounded-lg border ${isDark ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <Clock className="w-4 h-4" />
                    {t('search.recentSearches')}
                  </h3>
                  <button
                    onClick={clearHistory}
                    className={`text-sm ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'}`}
                  >
                    {t('search.clearHistory')}
                  </button>
                </div>
                <div className="space-y-2">
                  {searchHistory.slice(0, 5).map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(item)}
                      className={`block w-full text-left p-2 rounded transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 热门搜索 */}
            <div className={`p-4 rounded-lg border ${isDark ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'}`}>
              <h3 className={`font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <TrendingUp className="w-4 h-4" />
                {t('search.popularSearches')}
              </h3>
              <div className="space-y-2">
                {popularSearches.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(item)}
                    className={`block w-full text-left p-2 rounded transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 搜索结果 */}
        {query && (
          <div>
            {/* 结果标签 */}
            <div className="flex flex-wrap gap-2 mb-6">
              {['all', 'post', 'user', 'activity'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white'
                      : isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t(`search.${tab === 'all' ? 'allResults' : tab === 'post' ? 'posts' : tab === 'user' ? 'users' : 'activities'}`)}
                </button>
              ))}
            </div>

            {/* 结果统计 */}
            {searchResults && (
              <div className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('search.searchResultsFor')} "{query}" - {t('search.resultsCount', { count: filteredResults.length })}
              </div>
            )}

            {/* 加载状态 */}
            {isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('search.searching')}</p>
              </div>
            )}

            {/* 错误状态 */}
            {error && (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">{t('search.searchError')}</p>
                <button
                  onClick={() => handleSearch(query)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {t('common.retry')}
                </button>
              </div>
            )}

            {/* 搜索结果列表 */}
            {searchResults && !isLoading && (
              <div className="space-y-4">
                {filteredResults.length === 0 ? (
                  <div className="text-center py-8">
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('search.noResults')}</p>
                  </div>
                ) : (
                  filteredResults.map((result) => (
                    <div
                      key={result.id}
                      className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                        isDark
                          ? 'border-gray-600 bg-gray-800 hover:bg-gray-700'
                          : 'border-gray-300 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{getResultIcon(result.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {result.title}
                            </h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              result.type === 'post'
                                ? isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                                : result.type === 'user'
                                ? isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                                : isDark ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {t(`search.${result.type === 'post' ? 'posts' : result.type === 'user' ? 'users' : 'activities'}`)}
                            </span>
                          </div>
                          {result.content && (
                            <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                              {result.content}
                            </p>
                          )}
                          <div className={`flex items-center gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {result.author && (
                              <span>👤 {result.author}</span>
                            )}
                            <span>📅 {formatDate(result.createdAt)}</span>
                            {result.likes !== undefined && (
                              <span>❤️ {result.likes}</span>
                            )}
                            {result.comments !== undefined && (
                              <span>💬 {result.comments}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;