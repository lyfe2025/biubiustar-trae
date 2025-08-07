import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Send, User, Building, Phone, Mail, MessageSquare, ChevronDown, Check } from 'lucide-react';

interface ContactFormProps {
  isModal?: boolean;
  onClose?: () => void;
  className?: string;
}

const ContactForm: React.FC<ContactFormProps> = ({ isModal = false, onClose, className = '' }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    category: '',
    name: '',
    company: '',
    phone: '',
    email: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const cooperationCategories = [
    { value: 'live-commerce', label: '直播电商' },
    { value: 'short-video', label: '短视频' },
    { value: 'business-cooperation', label: '商务合作' },
    { value: 'influencer-cooperation', label: '达人合作' },
    { value: 'technical-consultation', label: '技术咨询' },
    { value: 'product-inquiry', label: '产品询价' },
    { value: 'media-cooperation', label: '媒体合作' },
    { value: 'other', label: '其他咨询' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategorySelect = (value: string) => {
    setFormData(prev => ({
      ...prev,
      category: value
    }));
    setShowCategoryDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 这里添加实际的提交逻辑
      // await submitContactForm(formData);
      
      // 模拟提交延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitted(true);
      
      // 3秒后关闭或重置
      setTimeout(() => {
        if (isModal && onClose) {
          onClose();
        } else {
          setSubmitted(false);
          setFormData({
            category: '',
            name: '',
            company: '',
            phone: '',
            email: '',
            description: ''
          });
        }
      }, 3000);
    } catch (error) {
      console.error('提交失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = cooperationCategories.find(cat => cat.value === formData.category);

  const formContent = (
    <div className={`${isModal ? 'p-8' : 'p-8'} ${className}`}>
      {isModal && (
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              联系我们
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">我们期待与您的合作</p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-200 hover:scale-110"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
      )}

      {!isModal && (
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            联系我们
          </h2>
          <p className="text-gray-600 dark:text-gray-400">我们期待与您的合作，共同创造数字文化娱乐产业的美好未来</p>
        </div>
      )}

      {submitted ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            提交成功！
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            我们已收到您的合作需求，会尽快与您联系。
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 合作类目选择 */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              合作类目 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="w-full px-5 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-left text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 flex items-center justify-between hover:border-blue-300 shadow-sm group"
              >
                <span className={selectedCategory ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'}>
                  {selectedCategory ? selectedCategory.label : '请选择合作类目'}
                </span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-all duration-200 group-hover:text-blue-500 ${showCategoryDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showCategoryDropdown && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                  {cooperationCategories.map((category) => (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => handleCategorySelect(category.value)}
                      className="w-full px-5 py-4 text-left hover:bg-blue-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white transition-all duration-200 font-medium hover:text-blue-600 first:rounded-t-xl last:rounded-b-xl"
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 姓名 */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              姓名 <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full pl-12 pr-5 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-blue-300 shadow-sm font-medium"
                placeholder="请输入您的姓名"
              />
            </div>
          </div>

          {/* 公司名称 */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              公司名称
            </label>
            <div className="relative group">
              <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className="w-full pl-12 pr-5 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-blue-300 shadow-sm font-medium"
                placeholder="请输入公司名称"
              />
            </div>
          </div>

          {/* 联系电话 */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              联系电话 <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full pl-12 pr-5 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-blue-300 shadow-sm font-medium"
                placeholder="请输入联系电话"
              />
            </div>
          </div>

          {/* 邮箱地址 */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              邮箱地址 <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full pl-12 pr-5 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-blue-300 shadow-sm font-medium"
                placeholder="请输入邮箱地址"
              />
            </div>
          </div>

          {/* 合作描述 */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              合作描述 <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={5}
                className="w-full pl-12 pr-5 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-blue-300 shadow-sm resize-none font-medium"
                placeholder="请详细描述您的合作需求，包括预期目标、合作方式等"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 ml-1">
              请尽量详细描述您的需求，这有助于我们更好地为您服务
            </p>
          </div>

          {/* 提交按钮 */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !formData.category || !formData.name || !formData.phone || !formData.email || !formData.description}
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 hover:from-blue-700 hover:via-purple-700 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-5 px-8 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl disabled:scale-100 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-3 text-lg shadow-xl"
            >
              {isSubmitting ? (
                <>
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  提交中...
                </>
              ) : (
                <>
                  <Send className="w-6 h-6" />
                  提交合作需求
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-300">
          {formContent}
        </div>
      </div>
    );
  }

  return formContent;
};

export default ContactForm;