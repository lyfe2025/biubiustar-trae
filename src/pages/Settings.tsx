import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import {
  Settings as SettingsIcon,
  Globe,
  Sun,
  Moon,
  Monitor,
  Bell,
  Shield,
  Database,
  User,
  Lock,
  History,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Check
} from 'lucide-react';

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ReactNode;
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  comments: boolean;
  likes: boolean;
  follows: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  showEmail: boolean;
  showActivity: boolean;
}

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('general');
  const [loading, setLoading] = useState(false);

  // 通知设置状态
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    push: true,
    comments: true,
    likes: false,
    follows: true
  });

  // 隐私设置状态
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showEmail: false,
    showActivity: true
  });

  const sections: SettingsSection[] = [
    {
      id: 'general',
      title: t('settings.general'),
      icon: <SettingsIcon className="w-5 h-5" />
    },
    {
      id: 'appearance',
      title: t('settings.appearance'),
      icon: <Sun className="w-5 h-5" />
    },
    {
      id: 'notifications',
      title: t('settings.notifications'),
      icon: <Bell className="w-5 h-5" />
    },
    {
      id: 'privacy',
      title: t('settings.privacy'),
      icon: <Shield className="w-5 h-5" />
    },
    {
      id: 'security',
      title: t('settings.security'),
      icon: <Lock className="w-5 h-5" />
    },
    {
      id: 'data',
      title: t('settings.data'),
      icon: <Database className="w-5 h-5" />
    }
  ];

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    toast.success(t('settings.settingsSaved'));
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    if (newTheme === 'system') {
      // 检测系统主题偏好
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setTheme(systemTheme);
    } else {
      setTheme(newTheme);
    }
    toast.success(t('settings.settingsSaved'));
  };

  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast.success(t('settings.settingsSaved'));
  };

  const handlePrivacyChange = (key: keyof PrivacySettings, value: any) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
    toast.success(t('settings.settingsSaved'));
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      // 模拟数据导出
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(t('settings.dataDownload'));
    } catch (error) {
      toast.error(t('settings.settingsError'));
    } finally {
      setLoading(false);
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('settings.language')}
        </h3>
        <div className="space-y-2">
          {[
            { code: 'zh', name: '中文' },
            { code: 'en', name: 'English' },
            { code: 'ja', name: '日本語' },
            { code: 'ko', name: '한국어' }
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                i18n.language === lang.code
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Globe className="w-4 h-4 text-gray-500" />
                <span className="text-gray-900 dark:text-white">{lang.name}</span>
              </div>
              {i18n.language === lang.code && (
                <Check className="w-4 h-4 text-blue-500" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('settings.theme')}
        </h3>
        <div className="space-y-2">
          {[
            { value: 'light', label: t('settings.lightMode'), icon: <Sun className="w-4 h-4" /> },
            { value: 'dark', label: t('settings.darkMode'), icon: <Moon className="w-4 h-4" /> },
            { value: 'system', label: t('settings.systemMode'), icon: <Monitor className="w-4 h-4" /> }
          ].map((themeOption) => (
            <button
              key={themeOption.value}
              onClick={() => handleThemeChange(themeOption.value as any)}
              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                theme === themeOption.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                {themeOption.icon}
                <span className="text-gray-900 dark:text-white">{themeOption.label}</span>
              </div>
              {theme === themeOption.value && (
                <Check className="w-4 h-4 text-blue-500" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('settings.notifications')}
        </h3>
        <div className="space-y-4">
          {[
            { key: 'email', label: t('settings.emailNotifications') },
            { key: 'push', label: t('settings.pushNotifications') },
            { key: 'comments', label: t('settings.commentNotifications') },
            { key: 'likes', label: t('settings.likeNotifications') },
            { key: 'follows', label: t('settings.followNotifications') }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <span className="text-gray-900 dark:text-white">{item.label}</span>
              <button
                onClick={() => handleNotificationChange(item.key as keyof NotificationSettings, !notifications[item.key as keyof NotificationSettings])}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications[item.key as keyof NotificationSettings]
                    ? 'bg-blue-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications[item.key as keyof NotificationSettings]
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('settings.profileVisibility')}
        </h3>
        <div className="space-y-2">
          {[
            { value: 'public', label: t('settings.publicProfile') },
            { value: 'private', label: t('settings.privateProfile') },
            { value: 'friends', label: t('settings.friendsOnly') }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handlePrivacyChange('profileVisibility', option.value)}
              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                privacy.profileVisibility === option.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <span className="text-gray-900 dark:text-white">{option.label}</span>
              {privacy.profileVisibility === option.value && (
                <Check className="w-4 h-4 text-blue-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
          <span className="text-gray-900 dark:text-white">显示邮箱地址</span>
          <button
            onClick={() => handlePrivacyChange('showEmail', !privacy.showEmail)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              privacy.showEmail ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                privacy.showEmail ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
          <span className="text-gray-900 dark:text-white">显示活动状态</span>
          <button
            onClick={() => handlePrivacyChange('showActivity', !privacy.showActivity)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              privacy.showActivity ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                privacy.showActivity ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <button className="w-full flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <div className="flex items-center space-x-3">
            <Lock className="w-5 h-5 text-gray-500" />
            <span className="text-gray-900 dark:text-white">{t('settings.changePassword')}</span>
          </div>
          <span className="text-gray-400">&gt;</span>
        </button>

        <button className="w-full flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-gray-500" />
            <span className="text-gray-900 dark:text-white">{t('settings.twoFactorAuth')}</span>
          </div>
          <span className="text-gray-400">&gt;</span>
        </button>

        <button className="w-full flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <div className="flex items-center space-x-3">
            <History className="w-5 h-5 text-gray-500" />
            <span className="text-gray-900 dark:text-white">{t('settings.loginHistory')}</span>
          </div>
          <span className="text-gray-400">&gt;</span>
        </button>
      </div>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <button
          onClick={handleExportData}
          disabled={loading}
          className="w-full flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <div className="flex items-center space-x-3">
            <Download className="w-5 h-5 text-gray-500" />
            <span className="text-gray-900 dark:text-white">{t('settings.exportData')}</span>
          </div>
          {loading ? (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="text-gray-400">&gt;</span>
          )}
        </button>

        <button className="w-full flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400">
          <div className="flex items-center space-x-3">
            <Trash2 className="w-5 h-5" />
            <span>{t('settings.deleteAccount')}</span>
          </div>
          <span>&gt;</span>
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'privacy':
        return renderPrivacySettings();
      case 'security':
        return renderSecuritySettings();
      case 'data':
        return renderDataSettings();
      default:
        return renderGeneralSettings();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('auth.pleaseLogin')}
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('settings.title')}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 侧边栏 */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <nav className="p-4 space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {section.icon}
                    <span className="font-medium">{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* 主内容区 */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;