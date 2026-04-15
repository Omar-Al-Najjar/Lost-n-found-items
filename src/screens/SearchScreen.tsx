import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '../components/AmbientBackground';
import { HomeCopy } from '../constants/homeCopy';
import { HomeFeedItem } from '../data/homeFeed';
import { Palette } from '../types';

type SearchScreenProps = {
  copy: HomeCopy;
  palette: Palette;
  isArabic: boolean;
  items: HomeFeedItem[];
  onBack: () => void;
  onOpenItem: (item: HomeFeedItem) => void;
};

export function SearchScreen({ copy, palette, isArabic, items, onBack, onOpenItem }: SearchScreenProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [category, setCategory] = useState<'all' | HomeFeedItem['category']>('all');

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
    return 'key-outline';
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
              {copy.searchScreenTitle}
            </Text>
            <Text style={[styles.topBarSubtitle, { color: palette.textSecondary }, isArabic && styles.textRight]}>
              {copy.searchScreenSubtitle}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={[styles.searchWrap, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Ionicons name="search-outline" size={20} color={palette.textSecondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={copy.searchPlaceholder}
            placeholderTextColor={palette.textSecondary}
            style={[styles.searchInput, { color: palette.textPrimary, textAlign: isArabic ? 'right' : 'left' }]}
          />
        </View>

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
                <Text style={[styles.categoryText, { color: active ? palette.accentStrong : palette.textPrimary }]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {filteredItems.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <Ionicons name="search-outline" size={26} color={palette.textSecondary} />
            <Text style={[styles.emptyTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>
              {copy.emptyTitle}
            </Text>
            <Text style={[styles.emptyDescription, { color: palette.textSecondary }, isArabic && styles.textRight]}>
              {copy.emptyDescription}
            </Text>
          </View>
        ) : (
          filteredItems.map((item) => {
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

                {isLost && (
                  <View style={[styles.imagePlaceholder, { backgroundColor: '#FCECEE' }]}>
                    <Ionicons name={getCategoryIcon(item)} size={28} color="#D95C63" />
                    <Text style={styles.imageLabel}>{copy.imageLabel}</Text>
                  </View>
                )}

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
                          : copy.accessories}
                  </Text>
                  <Text style={[styles.detailsLink, { color: palette.accentSoft }]}>{copy.viewDetails}</Text>
                </View>
              </Pressable>
            );
          })
        )}

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
  searchInput: {
    flex: 1,
    fontSize: 15,
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
