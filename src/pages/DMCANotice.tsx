import { useState, useEffect } from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { getPopularMovies, getTopRatedMovies } from '@/utils/api';
import { Media, ensureExtendedMediaArray } from '@/utils/types';
import { trackMediaPreference } from '@/lib/analytics';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MediaGrid from '@/components/MediaGrid';
import { MediaGridSkeleton } from '@/components/MediaSkeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Film, ChevronDown, Grid3X3, List } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';

import { AnimatePresence } from "framer-motion";

const DMCANotice = () => {
  const { t } = useTranslation();
  return (
    <AnimatePresence mode="wait">
      <div className="container mx-auto p-4 prose prose-invert max-w-4xl">
        <h1 className="text-3xl font-bold mb-4">{t('DMCA Notice')}</h1>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold text-yellow-500 mb-2">{t('Important Notice')}</h2>
          <p className="text-white/80">
            {t('This is an educational demonstration project that does not host any content. All content is fetched from third-party APIs. DMCA notices should be directed to the respective content owners or hosting services.')}
          </p>
        </div>

        <h2 className="text-2xl font-semibold mb-3">{t('Our Role')}</h2>
        <p className="mb-4">
          {t('This application is a frontend demonstration that:')}
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>{t('Does not host or store any media content')}</li>
          <li>{t('Uses third-party APIs for educational purposes only')}</li>
          <li>{t('Has no control over the content provided by these APIs')}</li>
          <li>{t('May be discontinued at any time')}</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-3">{t('Third-Party Content')}</h2>
        <p className="mb-4">
          {t('For any copyright concerns:')}
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>{t('Identify the specific content in question')}</li>
          <li>{t('Contact the actual hosting service or content owner')}</li>
          <li>{t('Submit DMCA notices to the appropriate content provider')}</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-3">{t('Contact Information')}</h2>
        <p className="mb-4">
          {t('While we do not host content, if you have questions about our educational demonstration, contact us at:')}<br />
          {t('Email')}: demo@example.com ({t('for demonstration purposes only')})
        </p>

        <div className="bg-gray-500/10 border border-gray-500/20 rounded-lg p-4 mb-6">
          <h3 className="text-xl font-semibold mb-2">{t('Disclaimer')}</h3>
          <p className="text-white/80">
            {t('We are not responsible for any content displayed through third-party APIs. This is purely an educational demonstration of frontend development techniques.')}
          </p>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-6">
          <p className="text-white/80">
            {t('Last updated: March 26, 2025')}
          </p>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default DMCANotice;
