import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '../components/AmbientBackground';
import { HomeCopy } from '../constants/homeCopy';
import { HomeFeedItem } from '../data/homeFeed';
import { AiSearchRun, Palette } from '../types';

function getReadableChipTextColor(backgroundHex: string) {
  const hex = backgroundHex.trim().replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return '#102247';

  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  return luminance > 0.58 ? '#102247' : '#F5F1E8';
}

type SearchScreenProps = {
  copy: HomeCopy;
  palette: Palette;
  isArabic: boolean;
  aiConfigured: boolean;
  latestAiSearch: AiSearchRun | null;
  items: HomeFeedItem[];
  currentUserId: string | null;
  mode?: 'browse' | 'assistant';
  onBack: () => void;
  onRunAiSearch: (query: string) => Promise<AiSearchRun>;
  onOpenItem: (item: HomeFeedItem) => void;
  onContactItem: (item: HomeFeedItem) => void;
};

export function SearchScreen({
  copy,
  palette,
  isArabic,
  aiConfigured,
  latestAiSearch,
  items,
  currentUserId,
  mode = 'browse',
  onBack,
  onRunAiSearch,
  onOpenItem,
  onContactItem,
}: SearchScreenProps) {
  const [query, setQuery] = useState(latestAiSearch?.query ?? '');
  const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [category, setCategory] = useState<'all' | HomeFeedItem['category']>('all');
  const [isRunningAiSearch, setIsRunningAiSearch] = useState(false);
  const activeCategoryTextColor = getReadableChipTextColor(palette.textPrimary);

  const isAssistantMode = mode === 'assistant';

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesType = filter === 'all' || item.type === filter;
      const matchesCategory = category === 'all' || item.category === category;
      const searchTarget = `${item.title} ${item.description} ${item.location} ${item.contactName}`.toLowerCase();
      const matchesQuery = !query.trim() || searchTarget.includes(query.trim().toLowerCase());
      return matchesType && matchesCategory && matchesQuery;
    });
  }, [category, filter, items, query]);

  const getCategoryIcon = (item: HomeFeedItem) => {
    if (item.category === 'electronics') return 'phone-portrait-outline';
    if (item.category === 'bags') return 'briefcase-outline';
    if (item.category === 'documents') return 'card-outline';
    if (item.category === 'accessories') return 'key-outline';
    return 'help-circle-outline';
  };

  const likelyMatches = latestAiSearch?.matches.filter((match) => match.grouping === 'likely') ?? [];
  const possibleMatches = latestAiSearch?.matches.filter((match) => match.grouping === 'possible') ?? [];

  const handleRunAiSearch = async () => {
    if (!query.trim() || isRunningAiSearch) {
      return;
    }

    try {
      setIsRunningAiSearch(true);
      await onRunAiSearch(query.trim());
    } finally {
      setIsRunningAiSearch(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <AmbientBackground primary={palette.accent} secondary={palette.accentSoft} tertiary={palette.danger} />

      <View style={[styles.topBar, { backgroundColor: palette.topBar, borderBottomColor: palette.border }]}>
        <View style={[styles.topBarRow, isArabic && styles.rowReverse]}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name={isArabic ? 'chevron-forward' : 'chevron-back'} size={24} color={palette.textPrimary} />
          </Pressable>
          <View style={styles.headerTextWrap}>
            <Text style={[styles.topBarTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>
              {isAssistantMode ? copy.aiHubTitle : copy.searchScreenTitle}
            </Text>
            <Text style={[styles.topBarSubtitle, { color: palette.textSecondary }, isArabic && styles.textRight]}>
              {isAssistantMode ? copy.aiSearchSubtitle : copy.searchScreenSubtitle}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.searchWrap,
            isAssistantMode && styles.aiSearchWrap,
            { backgroundColor: palette.card, borderColor: palette.border },
          ]}
        >
          <Ionicons
            name={isAssistantMode ? 'sparkles-outline' : 'search-outline'}
            size={20}
            color={isAssistantMode ? palette.accent : palette.textSecondary}
          />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={isAssistantMode ? copy.aiSearchTitle : copy.searchPlaceholder}
            placeholderTextColor={palette.textSecondary}
            style={[styles.searchInput, { color: palette.textPrimary, textAlign: isArabic ? 'right' : 'left' }]}
            autoFocus={isAssistantMode}
            multiline={isAssistantMode}
          />
        </View>

        <View style={[styles.aiCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={[styles.aiHeader, isArabic && styles.rowReverse]}>
            <View style={[styles.aiIconWrap, { backgroundColor: palette.cardMuted }]}>
              <Ionicons name="sparkles-outline" size={18} color={palette.accent} />
            </View>
            <View style={styles.aiCopy}>
              <Text style={[styles.aiTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>{copy.aiSearchTitle}</Text>
              <Text style={[styles.aiSubtitle, { color: palette.textSecondary }, isArabic && styles.textRight]}>
                {aiConfigured ? copy.aiSearchSubtitle : copy.aiSearchEmpty}
              </Text>
            </View>
          </View>
          <Pressable
            style={[styles.aiButton, { backgroundColor: palette.accent, opacity: query.trim() ? 1 : 0.45 }]}
            onPress={handleRunAiSearch}
            disabled={!query.trim() || isRunningAiSearch}
          >
            <Text style={styles.aiButtonText}>
              {isRunningAiSearch ? (isArabic ? 'جارٍ البحث...' : 'Searching...') : copy.aiSearchAction}
            </Text>
          </Pressable>
        </View>

        {!isAssistantMode ? (
          <>
            <View style={[styles.filterRow, isArabic && styles.rowReverse]}>
              {([
                ['all', copy.all],
                ['lost', copy.lost],
                ['found', copy.found],
              ] as const).map(([key, label]) => {
                const active = filter === key;
                return (
                  <Pressable
                    key={key}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: active ? palette.accent : palette.card,
                        borderColor: active ? palette.accent : palette.border,
                      },
                    ]}
                    onPress={() => setFilter(key)}
                  >
                    <Text style={[styles.filterChipText, { color: active ? '#102247' : palette.textPrimary }]}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
              {([
                ['all', copy.all],
                ['electronics', copy.electronics],
                ['bags', copy.bags],
                ['documents', copy.documents],
                ['accessories', copy.accessories],
                ['other', copy.other],
              ] as const).map(([key, label]) => {
                const active = category === key;
                return (
                  <Pressable
                    key={key}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: active ? palette.textPrimary : palette.card,
                        borderColor: active ? palette.textPrimary : palette.border,
                      },
                    ]}
                    onPress={() => setCategory(key)}
                  >
                    <Text style={[styles.categoryText, { color: active ? activeCategoryTextColor : palette.textPrimary }]}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </>
        ) : null}

        {latestAiSearch ? (
          <View style={styles.aiResultsWrap}>
            {likelyMatches.length > 0 ? (
              <>
                <Text style={[styles.aiSectionTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>
                  {copy.aiSearchLikely}
                </Text>
                {likelyMatches.map((match) => (
                  <View
                    key={`likely-${match.item.id}`}
                    style={[styles.aiMatchCard, { backgroundColor: '#F3FBEA', borderColor: '#B9DB94' }]}
                  >
                    <View style={[styles.aiMatchHeader, isArabic && styles.rowReverse]}>
                      <Text style={[styles.aiMatchTitle, { color: '#33591B' }, isArabic && styles.textRight]}>{match.item.title}</Text>
                      <View style={styles.scoreBadge}>
                        <Text style={styles.scoreBadgeText}>{Math.round(match.score * 100)}%</Text>
                      </View>
                    </View>
                    <Text style={[styles.aiMatchMeta, { color: '#33591B' }, isArabic && styles.textRight]}>
                      {match.item.contactName} · {match.item.location}
                    </Text>
                    <Text style={[styles.aiReasonLabel, { color: '#33591B' }, isArabic && styles.textRight]}>
                      {copy.aiSearchReasonLabel}
                    </Text>
                    <Text style={[styles.aiReasonText, { color: '#33591B' }, isArabic && styles.textRight]}>{match.reason}</Text>
                    <View style={[styles.aiActionsRow, isArabic && styles.rowReverse]}>
                      <Pressable
                        style={[styles.aiSecondaryButton, { borderColor: '#B9DB94' }]}
                        onPress={() => onOpenItem(match.item)}
                      >
                        <Text style={[styles.aiSecondaryButtonText, { color: '#33591B' }]}>{copy.viewDetails}</Text>
                      </Pressable>
                      <Pressable
                        style={[
                          styles.aiPrimaryButton,
                          { backgroundColor: '#D8EDC2', opacity: currentUserId && match.item.userId === currentUserId ? 0.45 : 1 },
                        ]}
                        onPress={() => onContactItem(match.item)}
                        disabled={Boolean(currentUserId && match.item.userId === currentUserId)}
                      >
                        <Text style={styles.aiPrimaryButtonText}>{copy.contact}</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </>
            ) : null}

            {possibleMatches.length > 0 ? (
              <>
                <Text style={[styles.aiSectionTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>
                  {copy.aiSearchPossible}
                </Text>
                {possibleMatches.map((match) => (
                  <View
                    key={`possible-${match.item.id}`}
                    style={[styles.aiMatchCard, { backgroundColor: palette.card, borderColor: palette.border }]}
                  >
                    <View style={[styles.aiMatchHeader, isArabic && styles.rowReverse]}>
                      <Text style={[styles.aiMatchTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>{match.item.title}</Text>
                      <View style={[styles.scoreBadge, { backgroundColor: palette.surfaceAlt }]}>
                        <Text style={[styles.scoreBadgeText, { color: palette.textPrimary }]}>{Math.round(match.score * 100)}%</Text>
                      </View>
                    </View>
                    <Text style={[styles.aiMatchMeta, { color: palette.textSecondary }, isArabic && styles.textRight]}>
                      {match.item.contactName} · {match.item.location}
                    </Text>
                    <Text style={[styles.aiReasonLabel, { color: palette.textPrimary }, isArabic && styles.textRight]}>
                      {copy.aiSearchReasonLabel}
                    </Text>
                    <Text style={[styles.aiReasonText, { color: palette.textSecondary }, isArabic && styles.textRight]}>{match.reason}</Text>
                    <View style={[styles.aiActionsRow, isArabic && styles.rowReverse]}>
                      <Pressable
                        style={[styles.aiSecondaryButton, { borderColor: palette.border }]}
                        onPress={() => onOpenItem(match.item)}
                      >
                        <Text style={[styles.aiSecondaryButtonText, { color: palette.textPrimary }]}>{copy.viewDetails}</Text>
                      </Pressable>
                      <Pressable
                        style={[
                          styles.aiPrimaryButton,
                          { backgroundColor: palette.accent, opacity: currentUserId && match.item.userId === currentUserId ? 0.45 : 1 },
                        ]}
                        onPress={() => onContactItem(match.item)}
                        disabled={Boolean(currentUserId && match.item.userId === currentUserId)}
                      >
                        <Text style={styles.aiPrimaryButtonText}>{copy.contact}</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </>
            ) : null}

            {likelyMatches.length === 0 && possibleMatches.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
                <Ionicons name="sparkles-outline" size={26} color={palette.textSecondary} />
                <Text style={[styles.emptyTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>
                  {copy.aiSearchLikely}
                </Text>
                <Text style={[styles.emptyDescription, { color: palette.textSecondary }, isArabic && styles.textRight]}>
                  {copy.aiSearchEmpty}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {!isAssistantMode && filteredItems.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <Ionicons name="search-outline" size={26} color={palette.textSecondary} />
            <Text style={[styles.emptyTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>
              {copy.emptyTitle}
            </Text>
            <Text style={[styles.emptyDescription, { color: palette.textSecondary }, isArabic && styles.textRight]}>
              {copy.emptyDescription}
            </Text>
          </View>
        ) : null}

        {!isAssistantMode
          ? filteredItems.map((item) => {
              const isLost = item.type === 'lost';
              return (
                <Pressable
                  key={item.id}
                  style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}
                  onPress={() => onOpenItem(item)}
                >
                  <View style={[styles.cardHeader, isArabic && styles.rowReverse]}>
                    <View
                      style={[
                        styles.typeBadge,
                        { backgroundColor: isLost ? '#F8DCDD' : '#E9F5D8' },
                      ]}
                    >
                      <Text style={[styles.typeBadgeText, { color: isLost ? '#A44B54' : '#4B6B20' }]}>
                        {isLost ? copy.lost : copy.found}
                      </Text>
                    </View>
                    <Text style={[styles.dateText, { color: palette.textSecondary }]}>{item.time}</Text>
                  </View>

                  {isLost ? (
                    <View style={[styles.imagePlaceholder, { backgroundColor: '#FCECEE' }]}>
                      <Ionicons name={getCategoryIcon(item)} size={28} color="#D95C63" />
                      <Text style={styles.imageLabel}>{copy.imageLabel}</Text>
                    </View>
                  ) : null}

                  <Text style={[styles.cardTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>
                    {item.title}
                  </Text>

                  <View style={[styles.metaRow, isArabic && styles.rowReverse]}>
                    <View style={[styles.metaItem, isArabic && styles.rowReverse]}>
                      <Ionicons name="location-outline" size={16} color={palette.textSecondary} />
                      <Text style={[styles.metaText, { color: palette.textSecondary }]}>{item.location}</Text>
                    </View>
                    <View style={[styles.metaItem, isArabic && styles.rowReverse]}>
                      <Ionicons name="calendar-outline" size={16} color={palette.textSecondary} />
                      <Text style={[styles.metaText, { color: palette.textSecondary }]}>{item.time}</Text>
                    </View>
                  </View>

                  <View style={[styles.cardFooter, isArabic && styles.rowReverse]}>
                    <Text style={[styles.categoryHint, { color: palette.textSecondary }]}>
                      {item.category === 'electronics'
                        ? copy.electronics
                        : item.category === 'bags'
                          ? copy.bags
                          : item.category === 'documents'
                            ? copy.documents
                            : item.category === 'accessories'
                              ? copy.accessories
                              : copy.other}
                    </Text>
                    <Text style={[styles.detailsLink, { color: palette.accentSoft }]}>{copy.viewDetails}</Text>
                  </View>
                </Pressable>
              );
            })
          : null}

        <View style={{ height: 140 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topBar: {
    borderBottomWidth: 1,
    minHeight: 86,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: {
    flex: 1,
  },
  topBarTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  topBarSubtitle: {
    marginTop: 4,
    fontSize: 13,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
    paddingBottom: 120,
  },
  searchWrap: {
    borderWidth: 1,
    borderRadius: 20,
    minHeight: 56,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiSearchWrap: {
    minHeight: 112,
    alignItems: 'flex-start',
    paddingVertical: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  aiCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
    gap: 12,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  aiIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiCopy: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  aiSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
  },
  aiButton: {
    minHeight: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  aiButtonText: {
    color: '#102247',
    fontSize: 14,
    fontWeight: '800',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryRow: {
    gap: 8,
    paddingBottom: 4,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '800',
  },
  categoryChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '700',
  },
  aiResultsWrap: {
    gap: 10,
  },
  aiSectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 4,
  },
  aiMatchCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
    gap: 8,
  },
  aiMatchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  aiMatchTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
  },
  aiMatchMeta: {
    display: 'none',
  },
  aiReasonLabel: {
    display: 'none',
  },
  aiReasonText: {
    display: 'none',
  },
  aiActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  aiPrimaryButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  aiPrimaryButtonText: {
    color: '#102247',
    fontSize: 13,
    fontWeight: '800',
  },
  aiSecondaryButton: {
    minHeight: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  aiSecondaryButtonText: {
    fontSize: 13,
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
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  dateText: {
    fontSize: 12,
  },
  imagePlaceholder: {
    minHeight: 132,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  imageLabel: {
    color: '#A44B54',
    fontSize: 12,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  metaRow: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryHint: {
    fontSize: 12,
  },
  detailsLink: {
    fontSize: 13,
    fontWeight: '800',
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 28,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  emptyDescription: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  textRight: {
    textAlign: 'right',
  },
});
