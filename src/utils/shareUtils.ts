// 社交媒体分享工具函数

// Facebook分享配置
export interface FacebookShareConfig {
  url: string;
  quote?: string;
  hashtag?: string;
}

// Twitter分享配置
export interface TwitterShareConfig {
  url: string;
  text?: string;
  hashtags?: string[];
  via?: string;
}

// 通用分享配置
export interface ShareConfig {
  url: string;
  title: string;
  text?: string;
  image?: string;
}

// 初始化Facebook SDK
export const initFacebookSDK = (): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.FB) {
      resolve();
      return;
    }

    window.fbAsyncInit = function() {
      window.FB.init({
        appId: process.env.REACT_APP_FACEBOOK_APP_ID || 'YOUR_APP_ID',
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });
      resolve();
    };
  });
};

// Facebook分享
export const shareToFacebook = async (config: FacebookShareConfig): Promise<boolean> => {
  try {
    await initFacebookSDK();
    
    if (window.FB && window.FB.ui) {
      return new Promise((resolve) => {
        window.FB.ui({
          method: 'share',
          href: config.url,
          quote: config.quote,
          hashtag: config.hashtag
        }, (response: any) => {
          resolve(!!response && !response.error_message);
        });
      });
    } else {
      // 回退到Facebook分享URL
      const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(config.url)}`;
      window.open(shareUrl, '_blank', 'width=600,height=400');
      return true;
    }
  } catch (error) {
    console.error('Facebook分享失败:', error);
    return false;
  }
};

// Twitter分享
export const shareToTwitter = (config: TwitterShareConfig): boolean => {
  try {
    const params = new URLSearchParams();
    params.append('url', config.url);
    
    if (config.text) {
      params.append('text', config.text);
    }
    
    if (config.hashtags && config.hashtags.length > 0) {
      params.append('hashtags', config.hashtags.join(','));
    }
    
    if (config.via) {
      params.append('via', config.via);
    }
    
    const shareUrl = `https://twitter.com/intent/tweet?${params.toString()}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
    return true;
  } catch (error) {
    console.error('Twitter分享失败:', error);
    return false;
  }
};

// WhatsApp分享
export const shareToWhatsApp = (config: ShareConfig): boolean => {
  try {
    const text = `${config.title}\n${config.text || ''}\n${config.url}`;
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
    return true;
  } catch (error) {
    console.error('WhatsApp分享失败:', error);
    return false;
  }
};

// LinkedIn分享
export const shareToLinkedIn = (config: ShareConfig): boolean => {
  try {
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(config.url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
    return true;
  } catch (error) {
    console.error('LinkedIn分享失败:', error);
    return false;
  }
};

// 复制链接到剪贴板
export const copyToClipboard = async (url: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url);
      return true;
    } else {
      // 回退方案
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      textArea.remove();
      return result;
    }
  } catch (error) {
    console.error('复制链接失败:', error);
    return false;
  }
};

// Web Share API（原生分享）
export const shareWithWebAPI = async (config: ShareConfig): Promise<boolean> => {
  try {
    if (navigator.share) {
      await navigator.share({
        title: config.title,
        text: config.text,
        url: config.url
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Web Share API分享失败:', error);
    return false;
  }
};

// 生成分享文本
export const generateShareText = (title: string, description?: string, hashtags?: string[]): string => {
  let text = title;
  if (description) {
    text += `\n${description}`;
  }
  if (hashtags && hashtags.length > 0) {
    text += `\n${hashtags.map(tag => `#${tag}`).join(' ')}`;
  }
  return text;
};

// 类型声明
declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}