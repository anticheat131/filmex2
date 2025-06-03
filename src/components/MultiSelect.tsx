import * as React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

type Option = {
  label: string;
  value: string;
};

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export default function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select...',
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn('w-[200px] justify-between', className)}
        >
          {selected.length === 0 ? placeholder : `${selected.length} selected`}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 bg-background text-white border-white/10">
        <Command>
          <CommandList>
            <CommandGroup>
              {options.map(option => (
                <CommandItem
                  key={option.value}
                  onSelect={() => toggleOption(option.value)}
                  className="cursor-pointer"
                >
                  <div
                    className={cn(
                      'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                      selected.includes(option.value)
                        ? 'bg-primary text-white'
                        : 'opacity-50'
                    )}
                  >
                    {selected.includes(option.value) && <Check className="h-4 w-4" />}
                  </div>
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
