export type Language = 'en' | 'ar';
export type ThemeMode = 'system' | 'light' | 'dark';
export type TabKey = 'homeFeed' | 'chatbot' | 'addPost' | 'conversations' | 'profile';
export type RouteKey =
  | 'splash'
  | 'login'
  | 'signup'
  | 'homeFeed'
  | 'chatbot'
  | 'addPost'
  | 'conversations'
  | 'directMessage'
  | 'search'
  | 'itemDetails'
  | 'reportLost'
  | 'reportFound'
  | 'profile'
  | 'notifications'
  | 'myReports';

export type Palette = {
  bg: string;
  topBar: string;
  card: string;
  cardMuted: string;
  surfaceAlt: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  accent: string;
  accentSoft: string;
  accentStrong: string;
  danger: string;
  dangerSoft: string;
  navIcon: string;
  tabBar: string;
  toggleTrack: string;
};

export type FeedPost = {
  id: string;
  type: 'lost' | 'found';
  title: string;
  description: string;
  location: string;
  category: 'electronics' | 'bags' | 'documents' | 'accessories';
  time: string;
  contactName: string;
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

export type NotificationCategory = 'match' | 'message' | 'status';

export type NotificationItem = {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  relatedReportId: string;
};

export type ReportStatus = 'open' | 'matching' | 'resolved';

export type MyReportItem = {
  id: string;
  type: 'lost' | 'found';
  title: string;
  description: string;
  location: string;
  time: string;
  status: ReportStatus;
  contactName: string;
  views: number;
  messages: number;
  lastUpdate: string;
};
