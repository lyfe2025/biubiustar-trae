import { useTranslation } from 'react-i18next';

export default function Contact() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen py-8">
      <div className="container-responsive">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            联系合作
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            与我们取得联系，探索合作机会
          </p>
          <div className="mt-8 p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">
              联系合作页面正在开发中...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}