import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '../components/AmbientBackground';
import { HomeCopy } from '../constants/homeCopy';
import { HomeFeedItem } from '../data/homeFeed';
import { Palette } from '../types';

type HomeFeedScreenProps = {
  copy: HomeCopy;
  palette: Palette;
  isArabic: boolean;
  posts: HomeFeedItem[];
  onOpenSearch: () => void;
  onOpenConversation: (post: HomeFeedItem) => void;
};

export function HomeFeedScreen({ copy, palette, isArabic, posts, onOpenSearch, onOpenConversation }: HomeFeedScreenProps) {
  const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [category, setCategory] = useState<'all' | HomeFeedItem['category']>('all');
  const [query, setQuery] = useState('');

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesType = filter === 'all' || post.type === filter;
      const matchesCategory = category === 'all' || post.category === category;
      const searchTarget = `${post.title} ${post.description} ${post.location} ${post.contactName}`.toLowerCase();
      const matchesQuery = !query.trim() || searchTarget.includes(query.trim().toLowerCase());
      return matchesType && matchesCategory && matchesQuery;
    });
  }, [category, filter, posts, query]);

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <AmbientBackground primary={palette.accent} secondary={palette.accentSoft} tertiary={palette.danger} />

      <View style={[styles.topBar, { backgroundColor: palette.topBar, borderBottomColor: palette.border }]}>
        <View style={[styles.topBarRow, isArabic && styles.rowReverse]}>
          <View style={styles.topBarTextWrap}>
            <Text style={[styles.topBarTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>{copy.appName}</Text>
            <Text style={[styles.topBarSubtitle, { color: palette.textSecondary }, isArabic && styles.textRight]}>{copy.subtitle}</Text>
          </View>

          <Pressable
            style={[styles.searchButton, { backgroundColor: palette.card, borderColor: palette.border }]}
            onPress={onOpenSearch}
          >
            <Ionicons name="search-outline" size={20} color={palette.textPrimary} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={[styles.summaryStrip, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: palette.textPrimary }]}>{posts.length}</Text>
            <Text style={[styles.summaryLabel, { color: palette.textSecondary }]}>{copy.sectionTitle}</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: palette.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: palette.accent }]}>
              {posts.filter((post) => post.type === 'lost').length}
            </Text>
            <Text style={[styles.summaryLabel, { color: palette.textSecondary }]}>{copy.lost}</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: palette.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: palette.textPrimary }]}>
              {posts.filter((post) => post.type === 'found').length}
            </Text>
            <Text style={[styles.summaryLabel, { color: palette.textSecondary }]}>{copy.found}</Text>
          </View>
        </View>

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

        <Text style={[styles.heading, { color: palette.textPrimary }, isArabic && styles.textRight]}>{copy.sectionTitle}</Text>
        <Text style={[styles.headingHint, { color: palette.textSecondary }, isArabic && styles.textRight]}>
          {isArabic
            ? 'تصفح أحدث البلاغات وتواصل بسرعة مع أصحابها.'
            : 'Browse the latest community reports and reach out quickly.'}
        </Text>

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
                <Text style={[styles.filterChipText, { color: active ? '#102247' : palette.textPrimary }]}>{label}</Text>
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

        {filteredPosts.length === 0 ? (
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
          filteredPosts.map((post) => {
            const isLost = post.type === 'lost';
            const cardBackground = isLost ? '#FFF1F2' : '#F3FBEA';
            const cardBorder = isLost ? '#F3A5AC' : '#B9DB94';
            const cardText = isLost ? '#7A1F26' : '#33591B';
            const buttonColor = isLost ? '#D95C63' : '#6FAE3C';
            return (
              <View key={post.id} style={[styles.card, { backgroundColor: cardBackground, borderColor: cardBorder }]}>
                <View style={[styles.cardGlow, { backgroundColor: isLost ? '#D95C63' : '#6FAE3C' }]} />

                <View style={[styles.badgeRow, isArabic && styles.rowReverse]}>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: isLost ? '#FAD2D5' : '#D8EDC2',
                      },
                    ]}
                  >
                    <Text style={[styles.badgeText, { color: cardText }]}>{isLost ? copy.lost : copy.found}</Text>
                  </View>
                  <Text style={[styles.time, { color: cardText }]}>{post.time}</Text>
                </View>

                <View style={[styles.imagePlaceholder, { backgroundColor: isLost ? '#FAD2D5' : '#DDEFCB' }]}>
                  <Ionicons
                    name={
                      post.category === 'electronics'
                        ? 'phone-portrait-outline'
                        : post.category === 'bags'
                          ? 'briefcase-outline'
                          : post.category === 'documents'
                            ? 'card-outline'
                            : 'key-outline'
                    }
                    size={28}
                    color={isLost ? '#D95C63' : '#6FAE3C'}
                  />
                  <Text style={[styles.imageLabel, { color: cardText }]}>{copy.recent}</Text>
                </View>

                <Text style={[styles.cardTitle, { color: cardText }, isArabic && styles.textRight]}>{post.title}</Text>
                <Text style={[styles.cardText, { color: cardText }, isArabic && styles.textRight]}>{post.description}</Text>

                <View style={[styles.metaRow, isArabic && styles.rowReverse]}>
                  <View style={[styles.metaItem, isArabic && styles.rowReverse]}>
                    <Ionicons name="location-outline" size={16} color={cardText} />
                    <Text style={[styles.metaText, { color: cardText }]}>{post.location}</Text>
                  </View>
                  <View style={[styles.metaItem, isArabic && styles.rowReverse]}>
                    <Ionicons name="person-outline" size={16} color={cardText} />
                    <Text style={[styles.metaText, { color: cardText }]}>{post.contactName}</Text>
                  </View>
                </View>

                <Pressable style={[styles.ctaButton, { backgroundColor: buttonColor }]} onPress={() => onOpenConversation(post)}>
                  <Text style={styles.ctaText}>{copy.contact}</Text>
                </Pressable>
              </View>
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
    justifyContent: 'center',
    minHeight: 84,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  topBarTextWrap: {
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
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 3,
  },
  summaryStrip: {
    borderWidth: 1,
    borderRadius: 24,
    minHeight: 88,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 36,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  summaryLabel: {
    marginTop: 4,
    fontSize: 11,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  heading: {
    fontSize: 21,
    fontWeight: '700',
    marginBottom: 2,
  },
  headingHint: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  categoryRow: {
    gap: 8,
    paddingBottom: 6,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '700',
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
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
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
  cardGlow: {
    position: 'absolute',
    top: -28,
    right: -22,
    width: 96,
    height: 96,
    borderRadius: 999,
    opacity: 0.09,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  time: {
    fontSize: 12,
  },
  imagePlaceholder: {
    borderRadius: 20,
    minHeight: 104,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  imageLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  cardText: {
    fontSize: 15,
    lineHeight: 22,
  },
  metaRow: {
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
  },
  ctaButton: {
    marginTop: 2,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  textRight: {
    textAlign: 'right',
  },
});
