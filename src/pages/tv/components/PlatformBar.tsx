import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { STREAMING_PLATFORMS } from '../constants/streamingPlatforms';

interface PlatformBarProps {
  platformFilters: string[];
  setPlatformFilters: (platforms: string[]) => void;
}

const PlatformBar = ({ platformFilters, setPlatformFilters }: PlatformBarProps) => {
  return (
    <div
      className="mb-4 flex justify-center"
      style={{ position: 'relative', zIndex: 2 }}
    >
      <div
        className="glass border border-white/10 shadow-lg px-2.5 py-2.5 rounded-2xl flex items-center w-full max-w-full overflow-x-auto"
        style={{ minWidth: 0, maxWidth: '100%', margin: '0 auto' }}
      >
        <ToggleGroup
          type="multiple"
          value={platformFilters}
          onValueChange={setPlatformFilters}
          className="flex space-x-1.5 w-full justify-center"
        >
          {STREAMING_PLATFORMS.map(platform => (
            <ToggleGroupItem
              key={platform.id}
              value={platform.id}
              variant="outline"
              className="flex items-center gap-1.5 border-white/10 data-[state=on]:bg-accent/20 data-[state=on]:border-accent px-2.5 py-1.5 rounded-lg transition-all duration-150 min-w-0"
            >
              {platform.icon && (
                <platform.icon className={`h-4 w-4 ${platform.color}`} />
              )}
              {!platform.icon && (
                <div className={`h-3.5 w-3.5 rounded-full ${platform.color}`} />
              )}
              <span className="hidden sm:inline font-medium text-white/90 text-xs">{platform.name}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
};

export default PlatformBar;
