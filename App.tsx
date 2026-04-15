import React, { useEffect, useMemo, useState } from 'react';
import { Alert, StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BottomNav } from './src/components/BottomNav';
import { getAccountCopy } from './src/constants/accountCopy';
import { getAuthCopy } from './src/constants/authCopy';
import { getConversationsCopy } from './src/constants/conversationsCopy';
import { getCreatePostCopy } from './src/constants/createPostCopy';
import { getHomeCopy } from './src/constants/homeCopy';
import { getConversations } from './src/data/conversations';
import { getHomeFeed, HomeFeedItem } from './src/data/homeFeed';
import { getMyReports } from './src/data/myReports';
import { getNotifications } from './src/data/notifications';
import { getTranslations } from './src/i18n';
import { AddPostScreen } from './src/screens/AddPostScreen';
import { ChatbotScreen } from './src/screens/ChatbotScreenV2';
import { ConversationsScreen } from './src/screens/ConversationsScreen';
import { DirectMessageScreen } from './src/screens/DirectMessageScreen';
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
import { darkPalette, lightPalette } from './src/theme';
import {
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

export default function App() {
  const systemColorScheme = useColorScheme();

  const [language, setLanguage] = useState<Language>('ar');
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [route, setRoute] = useState<RouteKey>('splash');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<ChatPreview | null>(null);
  const [selectedItem, setSelectedItem] = useState<HomeFeedItem | null>(null);
  const [highlightedReportId, setHighlightedReportId] = useState<string | null>(null);

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
  const [posts, setPosts] = useState<HomeFeedItem[]>([...getHomeFeed(language)]);
  const [chats, setChats] = useState<ChatPreview[]>([...getConversations(language)]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([...getNotifications(language)]);
  const [reports, setReports] = useState<MyReportItem[]>([...getMyReports(language)]);

  useEffect(() => {
    setDarkEnabled(isDark);
  }, [isDark]);

  useEffect(() => {
    setPosts([...getHomeFeed(language)]);
    setChats([...getConversations(language)]);
    setNotifications([...getNotifications(language)]);
    setReports([...getMyReports(language)]);
    setHighlightedReportId(null);
  }, [language]);

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

  const toggleTheme = () => {
    setThemeMode((current) => {
      if (current === 'system') return isDark ? 'light' : 'dark';
      return current === 'dark' ? 'light' : 'dark';
    });
  };

  const openConversation = (chat: ChatPreview) => {
    setSelectedConversation(chat);
    setRoute('directMessage');
  };

  const openConversationFromPost = (post: HomeFeedItem) => {
    const preview: ChatPreview = {
      id: post.id,
      name: post.contactName,
      message: post.description,
      time: post.time,
      avatarInitial: post.contactName.charAt(0),
      avatarColor: post.type === 'lost' ? '#ef8c8f' : '#9fd63a',
      unread: false,
    };

    openConversation(preview);
  };

  const openItemDetails = (item: HomeFeedItem) => {
    setSelectedItem(item);
    setRoute('itemDetails');
  };

  const openConversationFromReport = (report: MyReportItem) => {
    const preview: ChatPreview = {
      id: report.id,
      name: report.contactName,
      message: report.description,
      time: report.lastUpdate,
      avatarInitial: report.contactName.charAt(0),
      avatarColor: report.type === 'lost' ? '#ef8c8f' : '#9fd63a',
      unread: false,
    };

    openConversation(preview);
  };

  const onSubmitPost = (post: FeedPost) => {
    setPosts((prev) => [
      {
        ...post,
        category: post.category,
        time: language === 'ar' ? 'الآن' : 'Just now',
      },
      ...prev,
    ]);
    setReports((prev) => [
      {
        id: post.id,
        type: post.type,
        title: post.title,
        description: post.description,
        location: post.location,
        time: language === 'ar' ? '\u0627\u0644\u0622\u0646' : 'Just now',
        status: 'open',
        contactName: post.contactName,
        views: 0,
        messages: 0,
        lastUpdate: language === 'ar' ? '\u0627\u0644\u0622\u0646' : 'Just now',
      },
      ...prev,
    ]);
    setRoute('homeFeed');
    Alert.alert(t.appName, t.postSuccess);
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
  };

  const handleOpenReportFromNotification = (reportId: string, notificationId: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === notificationId ? { ...item, unread: false } : item))
    );
    setHighlightedReportId(reportId);
    setRoute('myReports');
  };

  const handleToggleReportStatus = (reportId: string) => {
    setReports((prev) =>
      prev.map((report) => {
        if (report.id !== reportId) return report;
        return {
          ...report,
          status: report.status === 'resolved' ? 'open' : 'resolved',
        };
      })
    );
  };

  const unreadNotificationsCount = notifications.filter((item) => item.unread).length;

  const renderCoreScreen = () => {
    switch (route) {
      case 'homeFeed':
        return (
          <HomeFeedScreen
            copy={homeCopy}
            palette={palette}
            isArabic={isArabic}
            posts={posts}
            onOpenSearch={() => setRoute('search')}
            onOpenConversation={openConversationFromPost}
          />
        );
      case 'chatbot':
        return <ChatbotScreen t={t} palette={palette} isArabic={isArabic} />;
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
            onBack={() => {
              setSelectedConversation(null);
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
            onLogout={() => {
              setIsAuthenticated(false);
              setSelectedConversation(null);
              setSelectedItem(null);
              setHighlightedReportId(null);
              setRoute('login');
            }}
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
            onBack={() => setRoute('homeFeed')}
            onOpenItem={openItemDetails}
          />
        );
      case 'itemDetails':
        return selectedItem ? (
          <ItemDetailsScreen
            copy={homeCopy}
            palette={palette}
            isArabic={isArabic}
            item={selectedItem}
            onBack={() => setRoute('search')}
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
    route === 'reportLost' || route === 'reportFound'
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
          {!isAuthenticated ? (
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
                  {({ navigation }) => (
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
                  {({ navigation }) => (
                    <LoginScreen
                      copy={authCopy}
                      palette={palette}
                      isArabic={isArabic}
                      isDark={isDark}
                      onToggleTheme={toggleTheme}
                      onSubmit={() => {
                        setIsAuthenticated(true);
                        setRoute('homeFeed');
                      }}
                      onSwitchToSignup={() => {
                        navigation.navigate('Signup');
                      }}
                    />
                  )}
                </AuthStack.Screen>
                <AuthStack.Screen name="Signup">
                  {({ navigation }) => (
                    <SignupScreen
                      copy={authCopy}
                      palette={palette}
                      isArabic={isArabic}
                      isDark={isDark}
                      onToggleTheme={toggleTheme}
                      onSubmit={() => {
                        setIsAuthenticated(true);
                        setRoute('homeFeed');
                      }}
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
