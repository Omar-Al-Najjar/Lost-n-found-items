import React, { useEffect, useMemo, useState } from 'react';
import { Alert, LogBox, StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BottomNav } from './src/components/BottomNav';
import { getAccountCopy } from './src/constants/accountCopy';
import { getAuthCopy } from './src/constants/authCopy';
import { getConversationsCopy } from './src/constants/conversationsCopy';
import { getCreatePostCopy } from './src/constants/createPostCopy';
import { getHomeCopy } from './src/constants/homeCopy';
import { HomeFeedItem } from './src/data/homeFeed';
import { getTranslations } from './src/i18n';
import {
  createPost,
  deleteConversationForCurrentUser,
  fetchMessages,
  findOrCreateConversationForPost,
  loadCurrentUserProfile,
  loadConversationPreviews,
  loadAppData,
  markConversationRead,
  markAllNotificationsRead,
  markNotificationRead,
  sendMessage,
  sendImageMessage,
  touchMyPresence,
  upsertCurrentUserProfile,
  updatePostStatus,
} from './src/lib/supabaseApp';
import {
  analyzeFoundItemWithAi,
  isAiAssistantConfigured,
  normalizeFoundPostWithAi,
  searchPotentialFoundMatches,
} from './src/lib/aiAssistant';
import { AddPostScreen } from './src/screens/AddPostScreen';
import { ChatbotScreen } from './src/screens/ChatbotScreenV2';
import { ConversationsScreen } from './src/screens/ConversationsScreen';
import { DirectMessageScreen } from './src/screens/DirectMessageScreen';
import { FoundItemReviewScreen } from './src/screens/FoundItemReviewScreen';
import { HomeFeedScreen } from './src/screens/HomeFeedScreen';
import { ItemDetailsScreen } from './src/screens/ItemDetailsScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { MyReportsScreen } from './src/screens/MyReportsScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { ReportFoundItemScreen } from './src/screens/ReportFoundItemScreen';
import { ReportLostItemScreen } from './src/screens/ReportLostItemScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { SignupScreen } from './src/screens/SignupScreen';
import { SplashScreen } from './src/screens/SplashScreen';
import { supabase } from './src/supabase';
import { darkPalette, lightPalette } from './src/theme';
import {
  AiFoundAnalysisDraft,
  AiSearchRun,
  AuthCredentials,
  ChatMessage,
  ChatPreview,
  FeedPost,
  Language,
  MyReportItem,
  NotificationItem,
  RouteKey,
  SelectedImage,
  TabKey,
  ThemeMode,
} from './src/types';

type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
type AuthStackScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;

if (__DEV__) {
  LogBox.ignoreLogs([
    'props.log.getAvailableStack().some is not a function',
    'An error was thrown when attempting to render log messages via LogBox',
  ]);
}

export default function App() {
  const systemColorScheme = useColorScheme();

  const [language, setLanguage] = useState<Language>('ar');
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [route, setRoute] = useState<RouteKey>('splash');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [currentUserDisplayName, setCurrentUserDisplayName] = useState('');
  const [currentUserAvatarUrl, setCurrentUserAvatarUrl] = useState<string | null>(null);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<ChatPreview | null>(null);
  const [selectedConversationMessages, setSelectedConversationMessages] = useState<ChatMessage[]>([]);
  const [selectedItem, setSelectedItem] = useState<HomeFeedItem | null>(null);
  const [itemDetailsBackRoute, setItemDetailsBackRoute] = useState<RouteKey>('search');
  const [searchBackRoute, setSearchBackRoute] = useState<RouteKey>('homeFeed');
  const [searchMode, setSearchMode] = useState<'browse' | 'assistant'>('browse');
  const [highlightedReportId, setHighlightedReportId] = useState<string | null>(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [pendingFoundDraft, setPendingFoundDraft] = useState<AiFoundAnalysisDraft | null>(null);
  const [aiSearchHistory, setAiSearchHistory] = useState<AiSearchRun[]>([]);
  const [activeAiSearch, setActiveAiSearch] = useState<AiSearchRun | null>(null);

  const isArabic = language === 'ar';
  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');
  const palette = isDark ? darkPalette : lightPalette;
  const t = getTranslations(language);
  const authCopy = getAuthCopy(language);
  const createPostCopy = getCreatePostCopy(language);
  const conversationsCopy = getConversationsCopy(language);
  const homeCopy = getHomeCopy(language);
  const accountCopy = getAccountCopy(language);

  const [darkEnabled, setDarkEnabled] = useState(isDark);
  const [posts, setPosts] = useState<HomeFeedItem[]>([]);
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [reports, setReports] = useState<MyReportItem[]>([]);

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (typeof error === 'object' && error !== null && 'message' in error) {
      const message = (error as { message?: unknown }).message;
      if (typeof message === 'string' && message.trim()) {
        return message;
      }
    }

    if (typeof error === 'string' && error.trim()) {
      return error;
    }

    return fallback;
  };

  const applySessionIdentity = (session: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']) => {
    const email = session?.user.email ?? '';
    const metadataName =
      typeof session?.user.user_metadata?.display_name === 'string'
        ? session.user.user_metadata.display_name
        : typeof session?.user.user_metadata?.full_name === 'string'
          ? session.user.user_metadata.full_name
          : '';
    const fallbackName = email ? email.split('@')[0] : '';

    setCurrentUserEmail(email);
    if (!session) {
      setCurrentUserAvatarUrl(null);
    }
    setCurrentUserDisplayName(metadataName || fallbackName || (isArabic ? 'المستخدم' : 'User'));
  };

  useEffect(() => {
    setDarkEnabled(isDark);
  }, [isDark]);

  useEffect(() => {
    setHighlightedReportId(null);
  }, [language]);

  useEffect(() => {
    let isMounted = true;

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!isMounted) return;
        setIsAuthenticated(Boolean(session));
        setCurrentUserId(session?.user.id ?? null);
        applySessionIdentity(session);
        setRoute(session ? 'homeFeed' : 'login');
        setAuthReady(true);
      })
      .catch((error) => {
        if (!isMounted) return;
        Alert.alert(t.appName, getErrorMessage(error, 'Failed to restore your session.'));
        setAuthReady(true);
        setRoute('login');
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setIsAuthenticated(Boolean(session));
      setCurrentUserId(session?.user.id ?? null);
      applySessionIdentity(session);
      setRoute(session ? 'homeFeed' : 'login');
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setPosts([]);
      setChats([]);
      setNotifications([]);
      setReports([]);
      setSelectedConversationMessages([]);
      setCurrentUserEmail('');
      setCurrentUserDisplayName('');
      setCurrentUserAvatarUrl(null);
      return;
    }

    let isMounted = true;

    loadAppData(language)
      .then((data) => {
        if (!isMounted) return;
        setPosts(data.posts);
        setChats(data.chats);
        setNotifications(data.notifications);
        setReports(data.reports);
      })
      .catch((error) => {
        Alert.alert(t.appName, getErrorMessage(error, 'Failed to load app data.'));
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, language, t.appName]);

  useEffect(() => {
    if (!isAuthenticated || !currentUserId) return;

    let isMounted = true;
    loadCurrentUserProfile(currentUserId)
      .then((profile) => {
        if (!isMounted) return;
        if (profile.displayName?.trim()) {
          setCurrentUserDisplayName(profile.displayName);
        }
        setCurrentUserAvatarUrl(profile.avatarUrl);
      })
      .catch(() => {
        if (!isMounted) return;
        setCurrentUserAvatarUrl(null);
      });

    return () => {
      isMounted = false;
    };
  }, [currentUserId, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const pingPresence = async () => {
      try {
        await touchMyPresence();
      } catch {
        // Presence pings are best-effort; no user interruption needed.
      }
    };

    pingPresence();
    const intervalId = setInterval(pingPresence, 20 * 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (route !== 'conversations' && route !== 'directMessage') return;

    let isMounted = true;
    const syncConversations = async () => {
      try {
        const [, nextChats] = await Promise.all([touchMyPresence(), loadConversationPreviews(language)]);
        if (!isMounted) return;
        setChats(nextChats);
        setSelectedConversation((current) => {
          if (!current) return current;
          const updated = nextChats.find((chat) => chat.id === current.id);
          if (!updated) return current;
          if (route === 'directMessage') {
            return { ...updated, unread: false };
          }
          return updated;
        });
      } catch {
        // Conversation presence refresh is best-effort.
      }
    };

    syncConversations();
    const intervalId = setInterval(syncConversations, 15 * 1000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [isAuthenticated, language, route]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (route !== 'directMessage') return;
    if (!selectedConversation || !currentUserId) return;

    let isMounted = true;
    const activeConversationId = selectedConversation.id;

    const syncActiveConversation = async () => {
      try {
        await Promise.all([touchMyPresence(), markConversationRead(activeConversationId, currentUserId)]);
        const [messages, nextChats] = await Promise.all([
          fetchMessages(activeConversationId, currentUserId, language),
          loadConversationPreviews(language),
        ]);
        if (!isMounted) return;
        setSelectedConversationMessages(messages);
        setChats(nextChats);
        setSelectedConversation((current) => {
          if (!current || current.id !== activeConversationId) return current;
          const updated = nextChats.find((chat) => chat.id === activeConversationId);
          return updated ? { ...updated, unread: false } : { ...current, unread: false };
        });
      } catch {
        // Active chat refresh is best-effort.
      }
    };

    syncActiveConversation();
    const intervalId = setInterval(syncActiveConversation, 8 * 1000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [currentUserId, isAuthenticated, language, route, selectedConversation?.id]);

  const tabs = useMemo(
    () => [
      { key: 'homeFeed' as const, icon: 'home-outline' as const },
      { key: 'chatbot' as const, icon: 'sparkles-outline' as const },
      { key: 'addPost' as const, icon: 'add' as const, isCenter: true },
      { key: 'conversations' as const, icon: 'chatbubble-ellipses-outline' as const },
      { key: 'profile' as const, icon: 'person-outline' as const },
    ],
    []
  );

  const refreshAppData = async () => {
    if (!isAuthenticated) return;
    const data = await loadAppData(language);
    setPosts(data.posts);
    setChats(data.chats);
    setNotifications(data.notifications);
    setReports(data.reports);
  };

  const toggleTheme = () => {
    setThemeMode((current) => {
      if (current === 'system') return isDark ? 'light' : 'dark';
      return current === 'dark' ? 'light' : 'dark';
    });
  };

  const openConversation = async (chat: ChatPreview) => {
    setSelectedConversation({ ...chat, unread: false });
    setChats((current) => current.map((entry) => (entry.id === chat.id ? { ...entry, unread: false } : entry)));
    setSelectedConversationMessages([]);
    setRoute('directMessage');

    if (!currentUserId) return;

    try {
      await Promise.all([touchMyPresence(), markConversationRead(chat.id, currentUserId)]);
      const [messages, nextChats] = await Promise.all([
        fetchMessages(chat.id, currentUserId, language),
        loadConversationPreviews(language),
      ]);
      setSelectedConversationMessages(messages);
      setChats(nextChats);
      setSelectedConversation((current) => {
        if (!current || current.id !== chat.id) return current;
        const updated = nextChats.find((entry) => entry.id === chat.id);
        return updated ? { ...updated, unread: false } : { ...current, unread: false };
      });
    } catch (error) {
      Alert.alert(t.appName, getErrorMessage(error, 'Failed to load messages.'));
    }
  };

  const openConversationFromPost = async (post: HomeFeedItem) => {
    if (!currentUserId) {
      Alert.alert(t.appName, isArabic ? '???? ????? ?????? ?????.' : 'Please sign in first.');
      return;
    }

    if (post.userId === currentUserId) {
      Alert.alert(
        t.appName,
        isArabic ? '?? ????? ?????? ???? ??? ?????.' : 'You cannot message yourself about your own post.'
      );
      return;
    }

    try {
      const preview = await findOrCreateConversationForPost(post, currentUserId, language);
      await refreshAppData();
      await openConversation(preview);
    } catch (error) {
      Alert.alert(t.appName, getErrorMessage(error, 'Failed to open the conversation.'));
    }
  };

  const openItemDetails = (item: HomeFeedItem, backRoute: RouteKey = 'search') => {
    setSelectedItem(item);
    setItemDetailsBackRoute(backRoute);
    setRoute('itemDetails');
  };

  const openConversationFromReport = async (report: MyReportItem) => {
    const existingChat = chats.find((chat) => chat.contextPostId === report.id);

    if (!existingChat) {
      Alert.alert(
        t.appName,
        isArabic ? '?? ???? ?????? ?????? ???? ?????? ???.' : 'There is no conversation for this report yet.'
      );
      return;
    }

    await openConversation(existingChat);
  };

  const onSubmitPost = async (post: FeedPost) => {
    if (!currentUserId) {
      Alert.alert(t.appName, isArabic ? '???? ????? ?????? ?????.' : 'Please sign in first.');
      return;
    }

    try {
      let matchTextEn: string | null = null;
      let matchKeywordsEn: string[] = [];
      let matchLocationEn: string | null = null;

      if (post.type === 'found' && aiConfigured) {
        try {
          const normalized = await normalizeFoundPostWithAi({
            title: post.title,
            summary: post.description,
            description: post.description,
            locationFound: post.location,
            category: post.category,
            itemType: post.title,
            primaryColor: '',
            material: '',
            brand: '',
            distinctiveFeatures: [],
            searchKeywords: [],
          });
          matchTextEn = normalized.matchTextEn || null;
          matchKeywordsEn = normalized.matchKeywordsEn || [];
          matchLocationEn = normalized.matchLocationEn || null;
        } catch (normalizationError) {
          console.warn('Found-post normalization failed, continuing without normalization fields.', normalizationError);
        }
      }

      await createPost({
        userId: currentUserId,
        type: post.type,
        title: post.title,
        description: post.description,
        location: post.location,
        category: post.category,
        image: post.image ?? null,
        matchTextEn,
        matchKeywordsEn,
        matchLocationEn,
      });
      await refreshAppData();
      setRoute('homeFeed');
      Alert.alert(t.appName, t.postSuccess);
    } catch (error) {
      Alert.alert(t.appName, getErrorMessage(error, 'Failed to create the report.'));
    }
  };

  const handleAnalyzeFoundPost = async (post: FeedPost) => {
    if (!post.image) {
      Alert.alert(createPostCopy.foundImageRequiredTitle, createPostCopy.foundImageRequiredDescription);
      return;
    }

    try {
      const analysis = await analyzeFoundItemWithAi({
        image: post.image,
        description: post.description,
        locationFound: post.location,
        language,
      });

      setPendingFoundDraft({
        image: post.image,
        draftImageStoragePath: analysis.draftImageStoragePath,
        description: post.description,
        location: post.location,
        category: post.category,
        analysis: analysis.analysis,
      });
      setRoute('foundAiReview');
    } catch (error) {
      Alert.alert(t.appName, getErrorMessage(error, 'Failed to analyze the item.'));
    }
  };

  const handlePublishReviewedFoundPost = async (payload: {
    title: string;
    description: string;
    category: FeedPost['category'];
    aiDraft: AiFoundAnalysisDraft;
  }) => {
    if (!currentUserId) {
      Alert.alert(t.appName, isArabic ? '???? ????? ?????? ?????.' : 'Please sign in first.');
      return;
    }

    try {
      let matchTextEn: string | null = null;
      let matchKeywordsEn: string[] = [];
      let matchLocationEn: string | null = null;

      if (aiConfigured) {
        try {
          const normalized = await normalizeFoundPostWithAi({
            title: payload.title,
            summary: payload.aiDraft.analysis.summary || payload.description,
            description: payload.description,
            locationFound: payload.aiDraft.location,
            category: payload.category,
            itemType: payload.aiDraft.analysis.itemType || '',
            primaryColor: payload.aiDraft.analysis.primaryColor || '',
            material: payload.aiDraft.analysis.material || '',
            brand: payload.aiDraft.analysis.brand || '',
            distinctiveFeatures: payload.aiDraft.analysis.distinctiveFeatures || [],
            searchKeywords: payload.aiDraft.analysis.searchKeywords || [],
          });
          matchTextEn = normalized.matchTextEn || null;
          matchKeywordsEn = normalized.matchKeywordsEn || [];
          matchLocationEn = normalized.matchLocationEn || null;
        } catch (normalizationError) {
          console.warn('AI-reviewed found post normalization failed, continuing without normalization fields.', normalizationError);
        }
      }

      await createPost({
        userId: currentUserId,
        type: 'found',
        title: payload.title,
        description: payload.description,
        location: payload.aiDraft.location,
        category: payload.category,
        image: payload.aiDraft.image,
        aiAnalysis: payload.aiDraft.analysis,
        existingImageStoragePath: payload.aiDraft.draftImageStoragePath,
        matchTextEn,
        matchKeywordsEn,
        matchLocationEn,
      });
      setPendingFoundDraft(null);
      await refreshAppData();
      setRoute('chatbot');
      Alert.alert(t.appName, t.postSuccess);
    } catch (error) {
      Alert.alert(t.appName, getErrorMessage(error, 'Failed to create the report.'));
    }
  };

  const handleRunAiSearch = async (query: string) => {
    const run = await searchPotentialFoundMatches(query, language);
    setActiveAiSearch(run);
    setAiSearchHistory((current) => [run, ...current.filter((entry) => entry.id !== run.id)].slice(0, 6));
    return run;
  };

  const handleOpenAiSearchRun = (run: AiSearchRun) => {
    setActiveAiSearch(run);
    setAiSearchHistory((current) => [run, ...current.filter((entry) => entry.id !== run.id)].slice(0, 6));
    setSearchBackRoute('chatbot');
    setSearchMode('assistant');
    setRoute('search');
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await markAllNotificationsRead(
        notifications.filter((item) => item.unread).map((item) => item.id)
      );
      await refreshAppData();
    } catch (error) {
      Alert.alert(t.appName, getErrorMessage(error, 'Failed to update notifications.'));
    }
  };

  const handleOpenReportFromNotification = async (postId: string, notificationId: string) => {
    try {
      await markNotificationRead(notificationId);
      await refreshAppData();
    } catch (error) {
      Alert.alert(t.appName, getErrorMessage(error, 'Failed to update the notification.'));
    }

    setHighlightedReportId(postId);
    setRoute('myReports');
  };

  const handleToggleReportStatus = async (reportId: string) => {
    const report = reports.find((item) => item.id === reportId);
    if (!report) return;

    try {
      await updatePostStatus(reportId, report.status === 'resolved' ? 'active' : 'resolved');
      await refreshAppData();
    } catch (error) {
      Alert.alert(t.appName, getErrorMessage(error, 'Failed to update the report.'));
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!selectedConversation || !currentUserId) return;

    try {
      setIsSendingMessage(true);
      await sendMessage(selectedConversation.id, currentUserId, text);
      await markConversationRead(selectedConversation.id, currentUserId);
      const [messages, nextChats] = await Promise.all([
        fetchMessages(selectedConversation.id, currentUserId, language),
        loadConversationPreviews(language),
      ]);
      setSelectedConversationMessages(messages);
      setChats(nextChats);
    } catch (error) {
      Alert.alert(t.appName, getErrorMessage(error, 'Failed to send the message.'));
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleSendImage = async (image: SelectedImage) => {
    if (!selectedConversation || !currentUserId) return;

    try {
      setIsSendingMessage(true);
      await sendImageMessage(selectedConversation.id, currentUserId, image);
      await markConversationRead(selectedConversation.id, currentUserId);
      const [messages, nextChats] = await Promise.all([
        fetchMessages(selectedConversation.id, currentUserId, language),
        loadConversationPreviews(language),
      ]);
      setSelectedConversationMessages(messages);
      setChats(nextChats);
    } catch (error) {
      Alert.alert(t.appName, getErrorMessage(error, 'Failed to send the image.'));
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleDeleteConversation = async (chat: ChatPreview) => {
    try {
      await deleteConversationForCurrentUser(chat.id);
      const nextChats = await loadConversationPreviews(language);
      setChats(nextChats);
      if (selectedConversation?.id === chat.id) {
        setSelectedConversation(null);
        setSelectedConversationMessages([]);
      }
    } catch (error) {
      Alert.alert(t.appName, getErrorMessage(error, 'Failed to delete the conversation.'));
    }
  };

  const handleLogin = async ({ email, password }: AuthCredentials) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        Alert.alert(t.appName, getErrorMessage(error, 'Login failed.'));
      }
    } catch (error) {
      Alert.alert(t.appName, getErrorMessage(error, 'Login failed.'));
    }
  };

  const handleSignup = async ({ email, password, displayName, avatarImage }: AuthCredentials) => {
    try {
      const trimmedName = displayName?.trim() ?? '';
      const fallbackName = email.split('@')[0] || (isArabic ? '????????' : 'User');
      const resolvedDisplayName = trimmedName || fallbackName;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: resolvedDisplayName,
          },
        },
      });

      if (error) {
        Alert.alert(t.appName, getErrorMessage(error, 'Signup failed.'));
        return;
      }

      if (data.user?.id && data.session) {
        try {
          const profile = await upsertCurrentUserProfile({
            userId: data.user.id,
            displayName: resolvedDisplayName,
            avatarImage: avatarImage ?? null,
          });
          setCurrentUserDisplayName(profile.displayName || resolvedDisplayName);
          setCurrentUserAvatarUrl(profile.avatarUrl);
        } catch (profileError) {
          Alert.alert(
            t.appName,
            getErrorMessage(
              profileError,
              isArabic
                ? '?? ????? ?????? ??? ???? ??? ?????? ????? ?????? ???????.'
                : 'Account created, but profile details were not fully saved.'
            )
          );
        }
      }
    } catch (error) {
      Alert.alert(t.appName, getErrorMessage(error, 'Signup failed.'));
    }
  };

  const handleEditAvatar = async () => {
    if (!currentUserId || isUpdatingAvatar) return;

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          t.appName,
          isArabic
            ? 'يرجى السماح بالوصول للصور لتحديث صورة الملف الشخصي.'
            : 'Allow photo access to update your profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.9,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      setIsUpdatingAvatar(true);
      const profile = await upsertCurrentUserProfile({
        userId: currentUserId,
        avatarImage: {
          uri: asset.uri,
          fileName: asset.fileName ?? null,
          mimeType: asset.mimeType ?? null,
          width: asset.width ?? null,
          height: asset.height ?? null,
          fileSize: asset.fileSize ?? null,
        },
      });
      setCurrentUserAvatarUrl(profile.avatarUrl);
      if (profile.displayName?.trim()) {
        setCurrentUserDisplayName(profile.displayName);
      }
    } catch (error) {
      Alert.alert(t.appName, getErrorMessage(error, 'Failed to update profile photo.'));
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSelectedConversation(null);
    setSelectedConversationMessages([]);
    setSelectedItem(null);
    setHighlightedReportId(null);
    setPendingFoundDraft(null);
    setAiSearchHistory([]);
    setActiveAiSearch(null);
    setCurrentUserAvatarUrl(null);
    setIsUpdatingAvatar(false);
  };

  const aiConfigured = isAiAssistantConfigured();
  const visibleAiSearch = activeAiSearch ?? aiSearchHistory[0] ?? null;
  const latestAiMatches = visibleAiSearch?.matches.slice(0, 3) ?? [];

  const renderCoreScreen = () => {
    switch (route) {
      case 'homeFeed':
        return (
          <HomeFeedScreen
            copy={homeCopy}
            palette={palette}
            isArabic={isArabic}
            posts={posts}
            currentUserId={currentUserId}
            onOpenSearch={() => {
              setSearchBackRoute('homeFeed');
              setSearchMode('browse');
              setRoute('search');
            }}
            onOpenConversation={openConversationFromPost}
          />
        );
      case 'chatbot':
        return (
          <ChatbotScreen
            copy={homeCopy}
            palette={palette}
            isArabic={isArabic}
            aiConfigured={aiConfigured}
            recentSearches={aiSearchHistory}
            likelyMatches={latestAiMatches}
            onOpenFoundFlow={() => setRoute('reportFound')}
            onOpenSearch={() => {
              setSearchBackRoute('chatbot');
              setSearchMode('assistant');
              setRoute('search');
            }}
            onOpenSearchRun={handleOpenAiSearchRun}
            onOpenMatch={(item) => openItemDetails(item, 'chatbot')}
          />
        );
      case 'addPost':
        return (
          <AddPostScreen
            copy={createPostCopy}
            palette={palette}
            isArabic={isArabic}
            onOpenLost={() => setRoute('reportLost')}
            onOpenFound={() => setRoute('reportFound')}
          />
        );
      case 'conversations':
        return (
          <ConversationsScreen
            copy={conversationsCopy}
            palette={palette}
            isArabic={isArabic}
            chats={chats}
            onOpenConversation={openConversation}
            onDeleteConversation={handleDeleteConversation}
          />
        );
      case 'directMessage':
        return selectedConversation ? (
          <DirectMessageScreen
            t={t}
            palette={palette}
            isArabic={isArabic}
            chat={selectedConversation}
            messages={selectedConversationMessages}
            isSending={isSendingMessage}
            onSendMessage={handleSendMessage}
            onSendImage={handleSendImage}
            onBack={() => {
              setSelectedConversation(null);
              setSelectedConversationMessages([]);
              setRoute('conversations');
            }}
          />
        ) : null;
      case 'profile':
        return (
          <ProfileScreen
            t={t}
            copy={accountCopy}
            palette={palette}
            isArabic={isArabic}
            userDisplayName={currentUserDisplayName || (isArabic ? 'المستخدم' : 'User')}
            userEmail={currentUserEmail}
            userAvatarUrl={currentUserAvatarUrl}
            darkEnabled={darkEnabled}
            setDarkEnabled={setDarkEnabled}
            setThemeMode={setThemeMode}
            language={language}
            setLanguage={setLanguage}
            activeChatsCount={chats.length}
            myReportsCount={reports.length}
            onOpenMyReports={() => {
              setHighlightedReportId(null);
              setRoute('myReports');
            }}
            isUpdatingAvatar={isUpdatingAvatar}
            onEditAvatar={handleEditAvatar}
            onLogout={handleLogout}
          />
        );
      default:
        return null;
    }
  };

  const renderAuxiliaryScreen = () => {
    switch (route) {
      case 'search':
        return (
          <SearchScreen
            copy={homeCopy}
            palette={palette}
            isArabic={isArabic}
            items={posts}
            aiConfigured={aiConfigured}
            latestAiSearch={visibleAiSearch}
            currentUserId={currentUserId}
            mode={searchMode}
            onBack={() => setRoute(searchBackRoute)}
            onRunAiSearch={handleRunAiSearch}
            onOpenItem={(item) => openItemDetails(item, 'search')}
            onContactItem={openConversationFromPost}
          />
        );
      case 'itemDetails':
        return selectedItem ? (
          <ItemDetailsScreen
            copy={homeCopy}
            palette={palette}
            isArabic={isArabic}
            item={selectedItem}
            currentUserId={currentUserId}
            onBack={() => setRoute(itemDetailsBackRoute)}
            onOpenChat={openConversationFromPost}
          />
        ) : null;
      case 'reportLost':
        return (
          <ReportLostItemScreen
            copy={createPostCopy}
            palette={palette}
            isArabic={isArabic}
            onBack={() => setRoute('addPost')}
            onSubmitPost={onSubmitPost}
          />
        );
      case 'reportFound':
        return (
          <ReportFoundItemScreen
            copy={createPostCopy}
            palette={palette}
            isArabic={isArabic}
            onBack={() => setRoute('addPost')}
            onSubmitPost={onSubmitPost}
          />
        );
      case 'foundAiReview':
        return pendingFoundDraft ? (
          <FoundItemReviewScreen
            copy={createPostCopy}
            palette={palette}
            isArabic={isArabic}
            draft={pendingFoundDraft}
            onBack={() => setRoute('reportFound')}
            onPublish={handlePublishReviewedFoundPost}
          />
        ) : null;
      case 'notifications':
        return (
          <NotificationsScreen
            copy={accountCopy}
            palette={palette}
            isArabic={isArabic}
            notifications={notifications}
            onBack={() => setRoute('profile')}
            onMarkAllRead={handleMarkAllNotificationsRead}
            onOpenReport={handleOpenReportFromNotification}
          />
        );
      case 'myReports':
        return (
          <MyReportsScreen
            copy={accountCopy}
            palette={palette}
            isArabic={isArabic}
            reports={reports}
            highlightedReportId={highlightedReportId}
            onBack={() => {
              setHighlightedReportId(null);
              setRoute('profile');
            }}
            onOpenChat={openConversationFromReport}
            onToggleReportStatus={handleToggleReportStatus}
          />
        );
      default:
        return null;
    }
  };

  const renderAuthedScreen = () => renderCoreScreen() ?? renderAuxiliaryScreen();

  const activeTab: TabKey =
    route === 'reportLost' || route === 'reportFound' || route === 'foundAiReview'
      ? 'addPost'
      : route === 'homeFeed' ||
          route === 'chatbot' ||
          route === 'addPost' ||
          route === 'conversations' ||
          route === 'profile'
        ? route
        : 'profile';

  return (
    <GestureHandlerRootView style={styles.safeArea}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={palette.bg} />
        <View style={[styles.screen, { backgroundColor: palette.bg }]}>
          {!authReady ? (
            <SplashScreen
              copy={authCopy}
              palette={palette}
              isDark={isDark}
              onDone={() => undefined}
              onToggleTheme={toggleTheme}
              setThemeMode={setThemeMode}
            />
          ) : !isAuthenticated ? (
            <NavigationContainer>
              <AuthStack.Navigator
                id="auth-stack"
                initialRouteName="Splash"
                screenOptions={{
                  headerShown: false,
                  animation: 'fade',
                  contentStyle: { backgroundColor: palette.bg },
                }}
              >
                <AuthStack.Screen name="Splash">
                  {({ navigation }: AuthStackScreenProps<'Splash'>) => (
                    <SplashScreen
                      copy={authCopy}
                      palette={palette}
                      isDark={isDark}
                      onDone={() => navigation.replace('Login')}
                      onToggleTheme={toggleTheme}
                      setThemeMode={setThemeMode}
                    />
                  )}
                </AuthStack.Screen>
                <AuthStack.Screen name="Login">
                  {({ navigation }: AuthStackScreenProps<'Login'>) => (
                    <LoginScreen
                      copy={authCopy}
                      palette={palette}
                      isArabic={isArabic}
                      onSubmit={handleLogin}
                      onSwitchToSignup={() => {
                        navigation.navigate('Signup');
                      }}
                    />
                  )}
                </AuthStack.Screen>
                <AuthStack.Screen name="Signup">
                  {({ navigation }: AuthStackScreenProps<'Signup'>) => (
                    <SignupScreen
                      copy={authCopy}
                      palette={palette}
                      isArabic={isArabic}
                      onSubmit={handleSignup}
                      onSwitchToLogin={() => {
                        navigation.goBack();
                      }}
                    />
                  )}
                </AuthStack.Screen>
              </AuthStack.Navigator>
            </NavigationContainer>
          ) : (
            <>
              {renderAuthedScreen()}

              {route !== 'directMessage' && (
                <BottomNav
                  palette={palette}
                  tabs={tabs}
                  activeTab={activeTab}
                  onSelectTab={(tab) => {
                    setRoute(tab);
                    setSelectedItem(null);
                    setHighlightedReportId(null);
                    setSelectedConversation(null);
                    setSelectedConversationMessages([]);
                    if (tab !== 'addPost') {
                      setPendingFoundDraft(null);
                    }
                  }}
                />
              )}
            </>
          )}
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
});


