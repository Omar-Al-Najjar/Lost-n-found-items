import React, { useEffect, useMemo, useState } from 'react';
import { Alert, StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
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
  fetchMessages,
  findOrCreateConversationForPost,
  loadAppData,
  markAllNotificationsRead,
  markNotificationRead,
  sendMessage,
  updatePostStatus,
} from './src/lib/supabaseApp';
import { analyzeFoundItemWithAi, isAiAssistantConfigured, searchPotentialFoundMatches } from './src/lib/aiAssistant';
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
  AiHubFoundInsight,
  AiSearchRun,
  AuthCredentials,
  ChatMessage,
  ChatPreview,
  FeedPost,
  Language,
  MyReportItem,
  NotificationItem,
  RouteKey,
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
  }, [t.appName]);

  useEffect(() => {
    if (!isAuthenticated) {
      setPosts([]);
      setChats([]);
      setNotifications([]);
      setReports([]);
      setSelectedConversationMessages([]);
      setCurrentUserEmail('');
      setCurrentUserDisplayName('');
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
    setSelectedConversation(chat);
    setSelectedConversationMessages([]);
    setRoute('directMessage');

    if (!currentUserId) return;

    try {
      const messages = await fetchMessages(chat.id, currentUserId, language);
      setSelectedConversationMessages(messages);
    } catch (error) {
      Alert.alert(t.appName, getErrorMessage(error, 'Failed to load messages.'));
    }
  };

  const openConversationFromPost = async (post: HomeFeedItem) => {
    if (!currentUserId) {
      Alert.alert(t.appName, isArabic ? 'يرجى تسجيل الدخول أولاً.' : 'Please sign in first.');
      return;
    }

    if (post.userId === currentUserId) {
      Alert.alert(
        t.appName,
        isArabic ? 'لا يمكنك مراسلة نفسك على بلاغك.' : 'You cannot message yourself about your own post.'
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
        isArabic ? 'لا توجد محادثة مرتبطة بهذا البلاغ بعد.' : 'There is no conversation for this report yet.'
      );
      return;
    }

    await openConversation(existingChat);
  };

  const onSubmitPost = async (post: FeedPost) => {
    if (!currentUserId) {
      Alert.alert(t.appName, isArabic ? 'يرجى تسجيل الدخول أولاً.' : 'Please sign in first.');
      return;
    }

    try {
      await createPost({
        userId: currentUserId,
        type: post.type,
        title: post.title,
        description: post.description,
        location: post.location,
        category: post.category,
        image: post.image ?? null,
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
      Alert.alert(t.appName, isArabic ? 'يرجى تسجيل الدخول أولاً.' : 'Please sign in first.');
      return;
    }

    try {
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
    setAiSearchHistory((current) => [run, ...current.filter((entry) => entry.id !== run.id)].slice(0, 6));
    return run;
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
      const messages = await fetchMessages(selectedConversation.id, currentUserId, language);
      setSelectedConversationMessages(messages);
      await refreshAppData();
    } catch (error) {
      Alert.alert(t.appName, getErrorMessage(error, 'Failed to send the message.'));
    } finally {
      setIsSendingMessage(false);
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

  const handleSignup = async ({ email, password }: AuthCredentials) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });

      if (error) {
        Alert.alert(t.appName, getErrorMessage(error, 'Signup failed.'));
        return;
      }

      Alert.alert(
        t.appName,
        isArabic
          ? 'تم إنشاء الحساب. إذا كان تأكيد البريد مفعلًا في Supabase، افحص بريدك ثم سجّل الدخول.'
          : 'Your account was created. If email confirmation is enabled in Supabase, check your inbox and then sign in.'
      );
    } catch (error) {
      Alert.alert(t.appName, getErrorMessage(error, 'Signup failed.'));
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
  };

  const unreadNotificationsCount = notifications.filter((item) => item.unread).length;
  const aiConfigured = isAiAssistantConfigured();
  const aiHubFoundInsights: AiHubFoundInsight[] = reports
    .filter((report) => report.type === 'found')
    .slice(0, 3)
    .map((report) => ({
      id: report.id,
      title: report.title,
      summary: report.description,
      confidence: report.status === 'resolved' ? 'high' : report.status === 'matching' ? 'medium' : 'low',
      time: report.time,
      image: report.image,
    }));
  const latestAiMatches = aiSearchHistory[0]?.matches.slice(0, 3) ?? [];

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
            recentFoundInsights={aiHubFoundInsights}
            recentSearches={aiSearchHistory}
            likelyMatches={latestAiMatches}
            onOpenFoundFlow={() => setRoute('reportFound')}
            onOpenSearch={() => {
              setSearchBackRoute('chatbot');
              setSearchMode('assistant');
              setRoute('search');
            }}
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
            darkEnabled={darkEnabled}
            setDarkEnabled={setDarkEnabled}
            setThemeMode={setThemeMode}
            language={language}
            setLanguage={setLanguage}
            activeChatsCount={chats.length}
            myReportsCount={reports.length}
            unreadNotificationsCount={unreadNotificationsCount}
            onOpenNotifications={() => setRoute('notifications')}
            onOpenMyReports={() => {
              setHighlightedReportId(null);
              setRoute('myReports');
            }}
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
            latestAiSearch={aiSearchHistory[0] ?? null}
            mode={searchMode}
            onBack={() => setRoute(searchBackRoute)}
            onRunAiSearch={handleRunAiSearch}
            onOpenItem={(item) => openItemDetails(item, 'search')}
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
            onAnalyzePost={handleAnalyzeFoundPost}
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
                      isDark={isDark}
                      onToggleTheme={toggleTheme}
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
                      isDark={isDark}
                      onToggleTheme={toggleTheme}
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
