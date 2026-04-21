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
  | 'foundAiReview'
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
  image?: SelectedImage | null;
};

export type AiConfidence = 'high' | 'medium' | 'low';

export type AiFoundAnalysis = {
  title: string;
  summary: string;
  itemType: string;
  category: FeedPost['category'];
  brand: string;
  primaryColor: string;
  material: string;
  distinctiveFeatures: string[];
  searchKeywords: string[];
  confidence: AiConfidence;
  reviewHint: string;
};

export type AiFoundAnalysisDraft = {
  image: SelectedImage;
  draftImageStoragePath: string;
  description: string;
  location: string;
  category: FeedPost['category'];
  analysis: AiFoundAnalysis;
};

export type AiMatchCandidate = {
  item: import('./data/homeFeed').HomeFeedItem;
  score: number;
  confidence: AiConfidence;
  reason: string;
  grouping: 'likely' | 'possible';
};

export type AiSearchRun = {
  id: string;
  query: string;
  createdAtLabel: string;
  matches: AiMatchCandidate[];
};

export type AiHubFoundInsight = {
  id: string;
  title: string;
  summary: string;
  confidence: AiConfidence;
  time: string;
  image?: string;
};

export type SelectedImage = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
  width?: number | null;
  height?: number | null;
  fileSize?: number | null;
};

export type AuthCredentials = {
  email: string;
  password: string;
};

export type ChatPreview = {
  id: string;
  contextPostId?: string | null;
  otherUserId?: string | null;
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
  relatedPostId: string;
};

export type ReportStatus = 'open' | 'matching' | 'resolved';

export type MyReportItem = {
  id: string;
  type: 'lost' | 'found';
  title: string;
  description: string;
  image?: string;
  location: string;
  time: string;
  status: ReportStatus;
  contactName: string;
  views: number;
  messages: number;
  lastUpdate: string;
};
