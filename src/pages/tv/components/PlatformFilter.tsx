import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuCheckboxItem, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { STREAMING_PLATFORMS } from '../constants/streamingPlatforms';
import { useTranslation } from 'react-i18next';

interface PlatformFilterProps {
  platformFilters: string[];
  togglePlatformFilter: (platformId: string) => void;
  clearPlatformFilters: () => void;
  togglePlatformBar: () => void;
  showPlatformBar: boolean;
}

const PlatformFilter = ({ 
  platformFilters, 
  togglePlatformFilter, 
  clearPlatformFilters,
  togglePlatformBar,
  showPlatformBar
}: PlatformFilterProps) => {
  const { t } = useTranslation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-white/10 text-white hover:bg-white/10 relative"
        >
          <Filter className="h-4 w-4 mr-2" />
          {t('Platforms')}
          {platformFilters.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-accent text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {platformFilters.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-background border-white/10 text-white">
        <DropdownMenuLabel>{t('Streaming Platforms')}</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        {STREAMING_PLATFORMS.map(platform => (
          <DropdownMenuCheckboxItem
            key={platform.id}
            checked={platformFilters.includes(platform.id)}
            onCheckedChange={() => togglePlatformFilter(platform.id)}
            className="cursor-pointer"
          >
            <div className="flex items-center">
              {platform.icon && (
                <platform.icon className={`h-4 w-4 ${platform.color}`} />
              )}
              {!platform.icon && (
                <div className={`h-3 w-3 rounded-full ${platform.color}`} />
              )}
              {t(platform.name)}
            </div>
          </DropdownMenuCheckboxItem>
        ))}
        {platformFilters.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-white/10" />
            <div className="px-2 py-1.5">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={clearPlatformFilters}
              >
                {t('Clear Platforms')}
              </Button>
            </div>
          </>
        )}
        <DropdownMenuSeparator className="bg-white/10" />
        <div className="px-2 py-1.5">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={togglePlatformBar}
          >
            {showPlatformBar ? t('Hide Platform Bar') : t('Show Platform Bar')}
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PlatformFilter;
