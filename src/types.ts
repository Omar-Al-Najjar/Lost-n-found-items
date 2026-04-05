export type Language = 'en' | 'ar';
export type ThemeMode = 'system' | 'light' | 'dark';
export type TabKey = 'home' | 'posts' | 'create' | 'chat' | 'profile';

export type Palette = {
  bg: string;
  topBar: string;
  card: string;
  cardMuted: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  accent: string;
  accentSoft: string;
  accentStrong: string;
  navIcon: string;
  tabBar: string;
  toggleTrack: string;
};

export type ChatPreview = {
  id: string;
  name: string;
  message: string;
  time: string;
  avatarInitial: string;
  avatarColor: string;
  unread: boolean;
};

export type ChatMessage = {
  id: string;
  text: string;
  time: string;
  mine: boolean;
};
