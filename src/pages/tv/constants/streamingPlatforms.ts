import { Play, Monitor, Download, Film, Sparkles, Badge, Apple, Crown } from 'lucide-react';

export interface StreamingPlatform {
  id: string;
  name: string;
  icon?: React.ElementType;
  color?: string;
}

export const STREAMING_PLATFORMS: StreamingPlatform[] = [
  { id: 'netflix', name: 'Netflix', icon: Play, color: 'text-red-600' },
  { id: 'prime', name: 'Amazon Prime Video', icon: Monitor, color: 'text-blue-500' },
  { id: 'hulu', name: 'Hulu', icon: Download, color: 'text-green-500' },
  { id: 'paramount', name: 'Paramount+', icon: Film, color: 'text-blue-700' },
  { id: 'disney', name: 'Disney+', icon: Sparkles, color: 'text-blue-400' },
  { id: 'hbo', name: 'HBO Max', icon: Badge, color: 'text-purple-600' },
  { id: 'apple', name: 'Apple TV+', icon: Apple, color: 'text-gray-400' },
  { id: 'peacock', name: 'Peacock', icon: Crown, color: 'text-yellow-300' },
];
