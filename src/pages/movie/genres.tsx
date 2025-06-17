import React from 'react';
import { useTranslation } from 'react-i18next';

export default function MovieGenres() {
  const { t } = useTranslation();

  return <div className="page-container">{t('Movie Genres')} (mapple.tv style placeholder)</div>;
}
