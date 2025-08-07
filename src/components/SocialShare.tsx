import React, { useState } from 'react';
import { 
  Share2, 
  Facebook, 
  Twitter, 
  MessageCircle, 
  Linkedin, 
  Copy, 
  Check,
  ExternalLink
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  shareToFacebook,
  shareToTwitter,
  shareToWhatsApp,
  shareToLinkedIn,
  copyToClipboard,
  shareWithWebAPI,
  generateShareText,
  type ShareConfig
} from '../utils/shareUtils';
import { toast } from 'sonner';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
  hashtags?: string[];
  className?: string;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'horizontal' | 'vertical' | 'dropdown';
}

const SocialShare: React.FC<SocialShareProps> = ({
  url,
  title,
  description,
  image,
  hashtags = ['BiuBiuStar'],
  className = '',
  showLabels = false,
  size = 'md',
  variant = 'horizontal'
}) => {
  const { t } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isSharing, setIsSharing] = useState<string | null>(null);

  const shareConfig: ShareConfig = {
    url,
    title,
    text: description,
    image
  };

  const shareText = generateShareText(title, description, hashtags);

  // 分享处理函数
  const handleShare = async (platform: string) => {
    setIsSharing(platform);
    let success = false;
    let message = '';

    try {
      switch (platform) {
        case 'native':
          success = await shareWithWebAPI(shareConfig);
          if (!success) {
            // 如果原生分享不可用，回退到复制链接
            success = await copyToClipboard(url);
            message = success ? t('share.copySuccess') : t('share.copyFailed');
          } else {
            message = t('share.shareSuccess');
          }
          break;
          
        case 'facebook':
          success = await shareToFacebook({
            url,
            quote: shareText,
            hashtag: hashtags[0] ? `#${hashtags[0]}` : undefined
          });
          message = success ? t('share.facebookSuccess') : t('share.facebookFailed');
          break;
          
        case 'twitter':
          success = shareToTwitter({
            url,
            text: title,
            hashtags,
            via: 'biubiustar'
          });
          message = success ? t('share.twitterSuccess') : t('share.twitterFailed');
          break;
          
        case 'whatsapp':
          success = shareToWhatsApp(shareConfig);
          message = success ? t('share.whatsappSuccess') : t('share.whatsappFailed');
          break;
          
        case 'linkedin':
          success = shareToLinkedIn(shareConfig);
          message = success ? t('share.linkedinSuccess') : t('share.linkedinFailed');
          break;
          
        case 'copy':
          success = await copyToClipboard(url);
          if (success) {
            setCopiedUrl(true);
            setTimeout(() => setCopiedUrl(false), 2000);
          }
          message = success ? t('share.copySuccess') : t('share.copyFailed');
          break;
          
        default:
          message = t('share.unsupported');
      }

      if (success) {
        toast.success(message);
      } else {
        toast.error(message);
      }
    } catch (error) {
      console.error(`${platform} 分享失败:`, error);
      toast.error(t('share.error'));
    } finally {
      setIsSharing(null);
      if (variant === 'dropdown') {
        setIsDropdownOpen(false);
      }
    }
  };

  // 图标大小配置
  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  const iconSize = iconSizes[size];

  // 按钮样式配置
  const buttonBaseClass = `
    inline-flex items-center justify-center rounded-lg transition-all duration-200
    hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
    ${size === 'sm' ? 'p-2' : size === 'md' ? 'p-2.5' : 'p-3'}
    ${showLabels ? 'gap-2' : ''}
  `;

  // 分享按钮配置
  const shareButtons = [
    {
      key: 'facebook',
      icon: Facebook,
      label: t('share.facebook'),
      className: 'bg-blue-600 hover:bg-blue-700 text-white',
      show: true
    },
    {
      key: 'twitter',
      icon: Twitter,
      label: t('share.twitter'),
      className: 'bg-sky-500 hover:bg-sky-600 text-white',
      show: true
    },
    {
      key: 'whatsapp',
      icon: MessageCircle,
      label: t('share.whatsapp'),
      className: 'bg-green-500 hover:bg-green-600 text-white',
      show: true
    },
    {
      key: 'linkedin',
      icon: Linkedin,
      label: t('share.linkedin'),
      className: 'bg-blue-700 hover:bg-blue-800 text-white',
      show: true
    },
    {
      key: 'copy',
      icon: copiedUrl ? Check : Copy,
      label: copiedUrl ? t('share.copied') : t('share.copyLink'),
      className: copiedUrl 
        ? 'bg-green-500 hover:bg-green-600 text-white' 
        : 'bg-gray-600 hover:bg-gray-700 text-white',
      show: true
    }
  ];

  // 渲染分享按钮
  const renderShareButton = (button: typeof shareButtons[0]) => {
    const Icon = button.icon;
    const isLoading = isSharing === button.key;
    
    return (
      <button
        key={button.key}
        onClick={() => handleShare(button.key)}
        disabled={isLoading}
        className={`${buttonBaseClass} ${button.className}`}
        title={button.label}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full border-2 border-white border-t-transparent" 
               style={{ width: iconSize, height: iconSize }} />
        ) : (
          <Icon size={iconSize} />
        )}
        {showLabels && (
          <span className={`${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}`}>
            {button.label}
          </span>
        )}
      </button>
    );
  };

  // 下拉菜单变体
  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`${buttonBaseClass} bg-purple-600 hover:bg-purple-700 text-white`}
          title={t('share.share')}
        >
          <Share2 size={iconSize} />
          {showLabels && (
            <span className={`${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}`}>
              {t('share.share')}
            </span>
          )}
        </button>
        
        {isDropdownOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsDropdownOpen(false)}
            />
            <div className="absolute right-0 top-full mt-2 z-20 bg-white rounded-lg shadow-lg border border-gray-200 p-2 min-w-48">
              <div className="space-y-1">
                {shareButtons.filter(btn => btn.show).map(button => (
                  <div key={button.key} className="w-full">
                    {renderShareButton(button)}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // 水平或垂直布局
  const containerClass = variant === 'vertical' 
    ? 'flex flex-col space-y-2' 
    : 'flex flex-wrap gap-2';

  return (
    <div className={`${containerClass} ${className}`}>
      {/* 原生分享按钮（移动端优先） */}
      <button
        onClick={() => handleShare('native')}
        className={`${buttonBaseClass} bg-purple-600 hover:bg-purple-700 text-white`}
        title={t('share.share')}
      >
        {isSharing === 'native' ? (
          <div className="animate-spin rounded-full border-2 border-white border-t-transparent" 
               style={{ width: iconSize, height: iconSize }} />
        ) : (
          <Share2 size={iconSize} />
        )}
        {showLabels && (
          <span className={`${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}`}>
            {t('share.share')}
          </span>
        )}
      </button>
      
      {/* 社交媒体分享按钮 */}
      {shareButtons.filter(btn => btn.show).map(renderShareButton)}
    </div>
  );
};

export default SocialShare;