import React from 'react';
import { useTranslation } from 'react-i18next';

export default function MovieNowPlaying() {
  const { t } = useTranslation();

  return (
    <div className="page-container">
      <h1>{t('Now Playing Movies')}</h1>
      {/* (mapple.tv style placeholder) */}
    </div>
  );
}
