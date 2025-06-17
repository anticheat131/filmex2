import { useState, useEffect } from 'react';
import ContentRow from '@/components/ContentRow';
import { Media } from '@/utils/types';
import {
  getBollywoodMovies,
  getActionMovies,
  getDramaMovies,
  getNetflixContent,
  getHuluContent,
  getPrimeContent,
  getParamountContent,
  getDisneyContent,
  getHotstarContent,
  getAppleTVContent,
  getJioCinemaContent,
  getSonyLivContent
} from '@/utils/api';
import { useTranslation } from 'react-i18next';

// Helper to assign quality
const applyQuality = (items: Media[]) =>
  items.map(item => {
    let quality = 'HD';
    if (!item.backdrop_path) {
      quality = 'CAM';
    }
    return {
      ...item,
      quality,
    };
  });

const SecondaryContent = () => {
  const { t } = useTranslation();
  const [bollywoodMovies, setBollywoodMovies] = useState<Media[]>([]);
  const [actionMovies, setActionMovies] = useState<Media[]>([]);
  const [dramaMovies, setDramaMovies] = useState<Media[]>([]);
  const [netflixContent, setNetflixContent] = useState<Media[]>([]);
  const [huluContent, setHuluContent] = useState<Media[]>([]);
  const [primeContent, setPrimeContent] = useState<Media[]>([]);
  const [paramountContent, setParamountContent] = useState<Media[]>([]);
  const [disneyContent, setDisneyContent] = useState<Media[]>([]);
  const [hotstarContent, setHotstarContent] = useState<Media[]>([]);
  const [appleTVContent, setAppleTVContent] = useState<Media[]>([]);
  const [jioCinemaContent, setJioCinemaContent] = useState<Media[]>([]);
  const [sonyLivContent, setSonyLivContent] = useState<Media[]>([]);

  useEffect(() => {
    const fetchGenreContent = async () => {
      try {
        const [bollywood, action, drama] = await Promise.all([
          getBollywoodMovies(),
          getActionMovies(),
          getDramaMovies()
        ]);
        setBollywoodMovies(applyQuality(bollywood));
        setActionMovies(applyQuality(action));
        setDramaMovies(applyQuality(drama));
      } catch (error) {
        console.error('Error fetching genre content:', error);
      }
    };

    const fetchPlatformContent = async () => {
      try {
        const [netflix, hulu, prime] = await Promise.all([
          getNetflixContent(),
          getHuluContent(),
          getPrimeContent()
        ]);
        setNetflixContent(applyQuality(netflix));
        setHuluContent(applyQuality(hulu));
        setPrimeContent(applyQuality(prime));

        const [paramount, disney, hotstar] = await Promise.all([
          getParamountContent(),
          getDisneyContent(),
          getHotstarContent()
        ]);
        setParamountContent(applyQuality(paramount));
        setDisneyContent(applyQuality(disney));
        setHotstarContent(applyQuality(hotstar));

        const [appleTV, jioCinema, sonyLiv] = await Promise.all([
          getAppleTVContent(),
          getJioCinemaContent(),
          getSonyLivContent()
        ]);
        setAppleTVContent(applyQuality(appleTV));
        setJioCinemaContent(applyQuality(jioCinema));
        setSonyLivContent(applyQuality(sonyLiv));
      } catch (error) {
        console.error('Error fetching platform content:', error);
      }
    };

    fetchGenreContent();
    fetchPlatformContent();
  }, []);

  return (
    <>
      {/* Genre-based content */}
      {bollywoodMovies.length > 0 && <ContentRow title={t('Bollywood')} media={bollywoodMovies} />}
      {actionMovies.length > 0 && <ContentRow title={t('Action')} media={actionMovies} />}
      {dramaMovies.length > 0 && <ContentRow title={t('Drama')} media={dramaMovies} />}

      {/* Platform-specific content */}
      {netflixContent.length > 0 && <ContentRow title={t('Netflix')} media={netflixContent} />}
      {huluContent.length > 0 && <ContentRow title={t('Hulu')} media={huluContent} />}
      {primeContent.length > 0 && <ContentRow title={t('Prime Video')} media={primeContent} />}
      {paramountContent.length > 0 && <ContentRow title={t('Paramount+')} media={paramountContent} />}
      {disneyContent.length > 0 && <ContentRow title={t('Disney+')} media={disneyContent} />}
      {hotstarContent.length > 0 && <ContentRow title={t('Hotstar')} media={hotstarContent} />}
      {appleTVContent.length > 0 && <ContentRow title={t('Apple TV+')} media={appleTVContent} />}
      {jioCinemaContent.length > 0 && <ContentRow title={t('JioCinema')} media={jioCinemaContent} />}
      {sonyLivContent.length > 0 && <ContentRow title={t('Sony Liv')} media={sonyLivContent} />}
    </>
  );
};

export default SecondaryContent;
