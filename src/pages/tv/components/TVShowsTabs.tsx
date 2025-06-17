import { TabsContent, TabsList, TabsTrigger, Tabs } from '@/components/ui/tabs';
import TabContent from './TabContent';
import { useTranslation } from 'react-i18next';

interface TVShowsTabsProps {
  activeTab: 'popular' | 'top_rated' | 'trending';
  onTabChange: (value: string) => void;
  viewMode: 'grid' | 'list';
  sortBy: 'default' | 'name' | 'first_air_date' | 'rating';
  genreFilters: string[];
  yearFilter: string;
  platformFilters: string[];
}

const TVShowsTabs = ({ 
  activeTab, 
  onTabChange, 
  viewMode, 
  sortBy, 
  genreFilters, 
  yearFilter, 
  platformFilters 
}: TVShowsTabsProps) => {
  const { t } = useTranslation();
  return (
    <Tabs defaultValue={activeTab} onValueChange={onTabChange}>
      <TabsList className="mb-4 md:mb-6">
        <TabsTrigger value="popular" className="data-[state=active]:bg-accent/20">{t('Popular')}</TabsTrigger>
        <TabsTrigger value="top_rated" className="data-[state=active]:bg-accent/20">{t('Top Rated')}</TabsTrigger>
        <TabsTrigger value="trending" className="data-[state=active]:bg-accent/20">{t('Trending')}</TabsTrigger>
      </TabsList>
      
      <TabsContent value="popular" className="focus-visible:outline-none animate-fade-in">
        <TabContent 
          type="popular" 
          viewMode={viewMode} 
          sortBy={sortBy}
          genreFilters={genreFilters}
          yearFilter={yearFilter}
          platformFilters={platformFilters}
        />
      </TabsContent>
      
      <TabsContent value="top_rated" className="focus-visible:outline-none animate-fade-in">
        <TabContent 
          type="top_rated" 
          viewMode={viewMode}
          sortBy={sortBy}
          genreFilters={genreFilters}
          yearFilter={yearFilter}
          platformFilters={platformFilters}
        />
      </TabsContent>
      
      <TabsContent value="trending" className="focus-visible:outline-none animate-fade-in">
        <TabContent 
          type="trending" 
          viewMode={viewMode}
          sortBy={sortBy}
          genreFilters={genreFilters}
          yearFilter={yearFilter}
          platformFilters={platformFilters}
        />
      </TabsContent>
    </Tabs>
  );
};

export default TVShowsTabs;
