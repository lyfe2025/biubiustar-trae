import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 导入语言资源
import en from './locales/en.json';
import zh from './locales/zh.json';
import zhTw from './locales/zh-tw.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import vi from './locales/vi.json';

const resources = {
  vi: {
    translation: vi,
  },
  en: {
    translation: en,
  },
  zh: {
    translation: zh,
  },
  'zh-tw': {
    translation: zhTw,
  },
  ja: {
    translation: ja,
  },
  ko: {
    translation: ko,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'vi',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React已经默认转义
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;