import { AnimatePresence } from "framer-motion";
import { useTranslation } from 'react-i18next';

const ContentRemoval = () => {
  const { t } = useTranslation();
  return (
    <AnimatePresence mode="wait">
      <div className="container mx-auto p-4 prose prose-invert max-w-4xl">
        <h1 className="text-3xl font-bold mb-4">{t('Content Removal')}</h1>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold text-yellow-500 mb-2">{t('Educational Project Notice')}</h2>
          <p className="text-white/80">
            {t('This is an educational demonstration project. We do not host or store any media content. All content removal requests should be directed to the appropriate content owners or hosting services.')}
          </p>
        </div>

        <h2 className="text-2xl font-semibold mb-3">{t('Understanding Our Role')}</h2>
        <p className="mb-4">
          {t('As an educational frontend demonstration:')}
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>{t('We do not host any media content')}</li>
          <li>{t('Content is displayed through third-party APIs')}</li>
          <li>{t('We have no control over the content provided by these services')}</li>
          <li>{t('This project is for educational purposes only')}</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-3">{t('How to Remove Content')}</h2>
        <p className="mb-4">
          {t('If you wish to have content removed:')}
        </p>
        <ol className="list-decimal pl-6 mb-4">
          <li>{t('Identify the specific content in question')}</li>
          <li>{t('Determine which third-party service is hosting the content')}</li>
          <li>{t('Contact the appropriate content host or owner directly')}</li>
          <li>{t('Follow their content removal procedures')}</li>
        </ol>

        <h2 className="text-2xl font-semibold mb-3">{t('Third-Party Services')}</h2>
        <p className="mb-4">
          {t('Content removal requests should be directed to the respective content owners or hosting services. We cannot process content removal requests as we do not host or control any media content.')}
        </p>

        <div className="bg-gray-500/10 border border-gray-500/20 rounded-lg p-4 mb-6">
          <h3 className="text-xl font-semibold mb-2">{t('Important Note')}</h3>
          <p className="text-white/80">
            {t('This application may be discontinued at any time as it exists solely for educational and demonstration purposes. We are not responsible for any content displayed through third-party APIs.')}
          </p>
        </div>

        <h2 className="text-2xl font-semibold mb-3">{t('Contact')}</h2>
        <p className="mb-4">
          {t('For questions about this educational demonstration, contact:')}<br />
          {t('Email')}: demo@example.com ({t('for demonstration purposes only')})
        </p>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-6">
          <p className="text-white/80">
            {t('Last updated: March 26, 2025')}
          </p>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default ContentRemoval;
