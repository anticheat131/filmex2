import { Tv } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TVShowsHeader = () => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-3 pt-10 mb-8">
      <Tv className="h-8 w-8 text-accent animate-pulse-slow" />
      <h1 className="text-3xl font-bold text-white">{t('TV Shows')}</h1>
    </div>
  );
};

export default TVShowsHeader;
