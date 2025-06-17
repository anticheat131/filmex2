import { Filter, Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MultiSelect from '@/components/MultiSelect';
import { STREAMING_PLATFORMS } from '../constants/streamingPlatforms';
import PlatformFilter from './PlatformFilter';
import PlatformBar from './PlatformBar';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const TVShowsFilters = ({
  sortBy,
  onSortChange,
  genreFilters,
  onGenreFiltersChange,
  platformFilters,
  setPlatformFilters,
  viewMode,
  toggleViewMode,
  showPlatformBar,
  togglePlatformBar,
  yearFilter,
  onYearChange,
}: TVShowsFiltersProps) => {
  const { t } = useTranslation();

  // TV genre options (should match TMDB genre IDs)
  const genreOptions = [
    { value: '10759', label: t('Action & Adventure') },
    { value: '16', label: t('Animation') },
    { value: '35', label: t('Comedy') },
    { value: '80', label: t('Crime') },
    { value: '99', label: t('Documentary') },
    { value: '18', label: t('Drama') },
    { value: '10751', label: t('Family') },
    { value: '10762', label: t('Kids') },
    { value: '9648', label: t('Mystery') },
    { value: '10763', label: t('News') },
    { value: '10764', label: t('Reality') },
    { value: '10765', label: t('Sci-Fi & Fantasy') },
    { value: '10766', label: t('Soap') },
    { value: '10767', label: t('Talk') },
    { value: '10768', label: t('War & Politics') },
    { value: '37', label: t('Western') },
  ];

  // Generate year options (e.g. 2025-1950)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 76 }, (_, i) => {
    const year = currentYear - i;
    return { value: year.toString(), label: year.toString() };
  });

  const clearPlatformFilters = () => {
    setPlatformFilters([]);
  };

  const togglePlatformFilter = (platformId: string) => {
    // Fix the type error by properly handling the state update
    if (platformFilters.includes(platformId)) {
      // Remove platform from filters
      setPlatformFilters(platformFilters.filter(id => id !== platformId));
    } else {
      // Add platform to filters
      setPlatformFilters([...platformFilters, platformId]);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-4 pt-6">
          <Select 
            value={sortBy} 
            onValueChange={onSortChange}
          >
            <SelectTrigger className="w-[180px] border-white/10 text-white bg-transparent">
              <SelectValue placeholder={t('Sort By')} />
            </SelectTrigger>
            <SelectContent className="bg-background border-white/10 text-white">
              <SelectItem value="default">{t('Default')}</SelectItem>
              <SelectItem value="name">{t('Name')}</SelectItem>
              <SelectItem value="first_air_date">{t('First Air Date')}</SelectItem>
              <SelectItem value="rating">{t('Rating')}</SelectItem>
            </SelectContent>
          </Select>

          {/* Multi-genre filter */}
          <MultiSelect
            options={genreOptions}
            selected={genreFilters}
            onChange={onGenreFiltersChange}
            placeholder={t('Filter by Genre(s)')}
            className="min-w-[180px]"
          />

          {/* Year filter */}
          <Select value={yearFilter} onValueChange={onYearChange}>
            <SelectTrigger className="w-[120px] border-white/10 text-white bg-transparent">
              <SelectValue placeholder={t('Year')} />
            </SelectTrigger>
            <SelectContent className="bg-background border-white/10 text-white max-h-60 overflow-y-auto">
              <SelectItem value="all">{t('All Years')}</SelectItem>
              {yearOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <PlatformFilter 
            platformFilters={platformFilters}
            togglePlatformFilter={togglePlatformFilter}
            clearPlatformFilters={clearPlatformFilters}
            togglePlatformBar={togglePlatformBar}
            showPlatformBar={showPlatformBar}
          />

          <Button
            variant="outline"
            size="sm"
            className="border-white/10 text-white hover:bg-white/10 group"
            onClick={toggleViewMode}
          >
            {viewMode === 'grid' ? (
              <>
                <List className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                {t('List View')}
              </>
            ) : (
              <>
                <Grid3X3 className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                {t('Grid View')}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Platform Quick Filter Bar */}
      {showPlatformBar && (
        <PlatformBar 
          platformFilters={platformFilters}
          setPlatformFilters={setPlatformFilters}
        />
      )}
      
      {/* Platform Filter Summary */}
      {platformFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center text-sm text-white/70 mb-4">
          <span>{t('Showing on:')}</span>
          {platformFilters.map(platformId => {
            const platform = STREAMING_PLATFORMS.find(p => p.id === platformId);
            return platform ? (
              <div key={platformId} className="px-2 py-1 rounded-full bg-accent/20 text-xs flex items-center gap-1">
                {platform.icon && (
                  <platform.icon className={`h-3 w-3 ${platform.color}`} />
                )}
                {t(platform.name)}
                <button onClick={() => togglePlatformFilter(platformId)} className="ml-1 text-white/60 hover:text-white">
                  ×
                </button>
              </div>
            ) : null;
          })}
          {platformFilters.length > 1 && (
            <button 
              onClick={clearPlatformFilters}
              className="text-xs underline text-accent hover:text-accent/80"
            >
              {t('Clear all')}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TVShowsFilters;
