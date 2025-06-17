import { createContext } from 'react';

export interface UserPreferences {
  id?: string;
  user_id: string;
  preferred_source?: string;
  subtitle_language?: string;
  audio_language?: string;  created_at?: string;
  updated_at?: string;
  isWatchHistoryEnabled: boolean;
  isContinueWatchingEnabled?: boolean; // Add this line
  accentColor?: string;
  isNotificationsEnabled: boolean; // Control feature notifications
}

export interface UserPreferencesContextType {
  userPreferences: UserPreferences | null;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;  isLoading: boolean;
  toggleWatchHistory: () => Promise<void>;
  toggleContinueWatching: () => Promise<void>; // Add this line
  setAccentColor: (color: string) => Promise<void>;
  toggleNotifications: () => Promise<void>; // Toggle feature notifications
}

export const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);
