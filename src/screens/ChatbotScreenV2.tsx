import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '../components/AmbientBackground';
import { HomeCopy } from '../constants/homeCopy';
import { HomeFeedItem } from '../data/homeFeed';
import { useProfilePageMotion } from '../hooks/useProfilePageMotion';
import { AiMatchCandidate, AiSearchRun, Palette } from '../types';

type ChatbotScreenProps = {
  copy: HomeCopy;
  palette: Palette;
  isArabic: boolean;
  aiConfigured: boolean;
  recentSearches: AiSearchRun[];
  likelyMatches: AiMatchCandidate[];
  onOpenFoundFlow: () => void;
  onOpenSearch: () => void;
  onOpenMatch: (item: HomeFeedItem) => void;
};

export function ChatbotScreen({
  copy,
  palette,
  isArabic,
  aiConfigured,
  recentSearches,
  likelyMatches,
  onOpenFoundFlow,
  onOpenSearch,
  onOpenMatch,
}: ChatbotScreenProps) {
  const { headerAnimatedStyle, getItemAnimatedStyle } = useProfilePageMotion();

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <AmbientBackground primary={palette.accent} secondary={palette.accentSoft} tertiary={palette.textPrimary} />

      <Animated.View
        style={[styles.topBar, { backgroundColor: palette.topBar, borderBottomColor: palette.border }, headerAnimatedStyle]}
      >
        <View style={[styles.headerRow, isArabic && styles.rowReverse]}>
          <View style={styles.headerCopy}>
            <Text style={[styles.topBarTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>{copy.aiHubTitle}</Text>
            <Text style={[styles.topBarSubtitle, { color: palette.textSecondary }, isArabic && styles.textRight]}>
              {copy.aiHubSubtitle}
            </Text>
          </View>
          <View style={[styles.iconBadge, { backgroundColor: palette.accent }]}>
            <Ionicons name="sparkles-outline" size={20} color={palette.textPrimary} />
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={getItemAnimatedStyle(0)}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={[styles.actionRow, isArabic && styles.rowReverse]}>
            <Pressable style={[styles.actionButton, { backgroundColor: palette.accent }]} onPress={onOpenFoundFlow}>
              <Text style={styles.actionButtonText}>{copy.aiHubPrimaryAction}</Text>
            </Pressable>
            <Pressable style={[styles.actionButton, styles.secondaryButton, { borderColor: palette.border }]} onPress={onOpenSearch}>
              <Text style={[styles.secondaryButtonText, { color: palette.textPrimary }]}>{copy.aiHubSecondaryAction}</Text>
            </Pressable>
          </View>
        </View>

        {likelyMatches.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>{copy.aiHubLikelyMatches}</Text>
            {likelyMatches.map((match) => (
              <Pressable
                key={`hub-match-${match.item.id}`}
                style={[styles.matchCard, { backgroundColor: '#F3FBEA', borderColor: '#B9DB94' }]}
                onPress={() => onOpenMatch(match.item)}
              >
                <View style={[styles.matchHeader, isArabic && styles.rowReverse]}>
                  <Text style={[styles.matchTitle, { color: '#33591B' }, isArabic && styles.textRight]}>{match.item.title}</Text>
                  <View style={styles.scoreBadge}>
                    <Text style={styles.scoreBadgeText}>{Math.round(match.score * 100)}%</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        ) : null}

        {recentSearches.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>{copy.aiHubRecentSearches}</Text>
            {recentSearches.slice(0, 4).map((search) => (
              <Pressable
                key={search.id}
                style={[styles.searchCard, { backgroundColor: palette.card, borderColor: palette.border }]}
                onPress={onOpenSearch}
              >
                <Text style={[styles.searchQuery, { color: palette.textPrimary }, isArabic && styles.textRight]}>{search.query}</Text>
                <Text style={[styles.searchMeta, { color: palette.textSecondary }, isArabic && styles.textRight]}>
                  {search.matches.length} | {search.createdAtLabel}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {recentSearches.length === 0 && likelyMatches.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <Ionicons name="sparkles-outline" size={26} color={palette.textSecondary} />
            <Text style={[styles.emptyTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>{copy.aiHubTitle}</Text>
            <Text style={[styles.emptyText, { color: palette.textSecondary }, isArabic && styles.textRight]}>
              {aiConfigured ? copy.aiHubEmpty : copy.aiSearchEmpty}
            </Text>
          </View>
        ) : null}

        <View style={{ height: 140 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topBar: {
    borderBottomWidth: 1,
    justifyContent: 'center',
    minHeight: 84,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  headerCopy: {
    flex: 1,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  topBarSubtitle: {
    marginTop: 4,
    fontSize: 13,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 14,
    paddingBottom: 120,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  actionButtonText: {
    color: '#102247',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  matchCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
    gap: 8,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  matchTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
  },
  scoreBadge: {
    minWidth: 56,
    borderRadius: 999,
    backgroundColor: '#D8EDC2',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  scoreBadgeText: {
    color: '#33591B',
    fontSize: 12,
    fontWeight: '800',
  },
  searchCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  searchQuery: {
    fontSize: 15,
    fontWeight: '700',
  },
  searchMeta: {
    fontSize: 12,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  textRight: {
    textAlign: 'right',
  },
});
