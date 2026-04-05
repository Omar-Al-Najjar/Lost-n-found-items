import React, { useMemo, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { BottomNav } from './src/components/BottomNav';
import { getTranslations } from './src/i18n';
import { ConversationDetailScreen } from './src/screens/ConversationDetailScreen';
import { ConversationsScreen } from './src/screens/ConversationsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { darkPalette, lightPalette } from './src/theme';
import { ChatPreview, Language, TabKey, ThemeMode } from './src/types';

export default function App() {
  const systemColorScheme = useColorScheme();

  const [language, setLanguage] = useState<Language>('en');
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [activeTab, setActiveTab] = useState<TabKey>('chat');
  const [selectedConversation, setSelectedConversation] = useState<ChatPreview | null>(null);

  const isArabic = language === 'ar';
  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');
  const palette = isDark ? darkPalette : lightPalette;
  const t = getTranslations(language);
  const [darkEnabled, setDarkEnabled] = useState(isDark);

  const tabs = useMemo(
    () => [
      { key: 'home' as const, icon: 'home-outline' as const },
      { key: 'posts' as const, icon: 'briefcase-outline' as const },
      { key: 'create' as const, icon: 'add' as const, isCenter: true },
      { key: 'chat' as const, icon: 'chatbubble' as const },
      { key: 'profile' as const, icon: 'person-outline' as const },
    ],
    []
  );

  const renderMainContent = () => {
    if (activeTab === 'chat') {
      if (selectedConversation) {
        return (
          <ConversationDetailScreen
            t={t}
            palette={palette}
            isArabic={isArabic}
            chat={selectedConversation}
            onBack={() => setSelectedConversation(null)}
          />
        );
      }

      return (
        <ConversationsScreen
          t={t}
          palette={palette}
          isArabic={isArabic}
          onOpenConversation={setSelectedConversation}
        />
      );
    }

    if (activeTab === 'profile') {
      return (
        <ProfileScreen
          t={t}
          palette={palette}
          isArabic={isArabic}
          darkEnabled={darkEnabled}
          setDarkEnabled={setDarkEnabled}
          setThemeMode={setThemeMode}
          language={language}
          setLanguage={setLanguage}
        />
      );
    }

    return (
      <View style={styles.placeholderWrap}>
        <Text style={[styles.placeholderTitle, { color: palette.textPrimary }]}>
          {t.tabs[activeTab]}
        </Text>
        <Text style={[styles.placeholderSubtitle, { color: palette.textSecondary }]}>
          Screen coming next.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={palette.bg} />
      <View style={[styles.screen, { backgroundColor: palette.bg }]}>
        {renderMainContent()}

        {!selectedConversation && (
          <BottomNav
            palette={palette}
            tabs={tabs}
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              if (tab !== 'chat') {
                setSelectedConversation(null);
              }
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  placeholderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  placeholderTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  placeholderSubtitle: {
    fontSize: 16,
  },
});
