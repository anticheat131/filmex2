import { useTranslation } from 'react-i18next';

const Trending = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('Trending')}</h1>
      {/* ...existing code... */}
    </div>
  );
};

export default Trending;