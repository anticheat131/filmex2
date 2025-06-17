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

import { AnimatePresence } from "framer-motion";
import { useTranslation } from 'react-i18next';

const PrivacyPolicy = () => {
  const { t } = useTranslation();
  return (
    <AnimatePresence mode="wait">
      <div className="container mx-auto p-4 prose prose-invert max-w-4xl">
        <h1 className="text-3xl font-bold mb-4">{t('Privacy Policy')}</h1>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold text-yellow-500 mb-2">{t('Educational Demonstration Notice')}</h2>
          <p className="text-white/80">
            {t('This application is an educational demonstration that uses third-party APIs. We prioritize your privacy while demonstrating frontend development concepts.')}
          </p>
        </div>

        <h2 className="text-2xl font-semibold mb-3">{t('1. Information Collection')}</h2>
        <p className="mb-4">
          {t('We collect minimal information necessary for the educational demonstration:')}
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>{t('Basic account information (if you choose to create an account)')}</li>
          <li>{t('Watch history and preferences (stored locally)')}</li>
          <li>{t('Usage analytics for demonstration purposes')}</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-3">{t('2. Use of Information')}</h2>
        <p className="mb-4">
          {t('The information collected is used solely to:')}
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>{t('Demonstrate user authentication features')}</li>
          <li>{t('Showcase personalization capabilities')}</li>
          <li>{t('Improve the educational demonstration')}</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-3">{t('3. Third-Party Services')}</h2>
        <p className="mb-4">
          {t('Our demonstration interfaces with third-party APIs. We do not control and are not responsible for their privacy practices. Users should review the privacy policies of these services.')}
        </p>

        <h2 className="text-2xl font-semibold mb-3">{t('4. Data Storage')}</h2>
        <p className="mb-4">
          {t('Most user preferences and watch history are stored locally in your browser. Any server-side data may be deleted at any time as this is a demonstration project.')}
        </p>

        <h2 className="text-2xl font-semibold mb-3">{t('5. Data Security')}</h2>
        <p className="mb-4">
          {t('While we implement reasonable security measures, this is an educational demonstration and should not be used for sensitive information.')}
        </p>

        <h2 className="text-2xl font-semibold mb-3">{t('6. Your Rights')}</h2>
        <p className="mb-4">
          {t('You can:')}
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>{t('Access your stored information')}</li>
          <li>{t('Delete your account and associated data')}</li>
          <li>{t('Clear local storage and cookies')}</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-3">{t('7. Children\'s Privacy')}</h2>
        <p className="mb-4">
          {t('This educational demonstration is not intended for children under 13. We do not knowingly collect information from children under 13.')}
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

export default PrivacyPolicy;
