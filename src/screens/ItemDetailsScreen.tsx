import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '../components/AmbientBackground';
import { HomeCopy } from '../constants/homeCopy';
import { HomeFeedItem } from '../data/homeFeed';
import { Palette } from '../types';

type ItemDetailsScreenProps = {
  copy: HomeCopy;
  palette: Palette;
  isArabic: boolean;
  item: HomeFeedItem;
  currentUserId: string | null;
  onBack: () => void;
  onOpenChat: (item: HomeFeedItem) => void;
};

export function ItemDetailsScreen({
  copy,
  palette,
  isArabic,
  item,
  currentUserId,
  onBack,
  onOpenChat,
}: ItemDetailsScreenProps) {
  const isLost = item.type === 'lost';
  const isOwnPost = Boolean(currentUserId && item.userId === currentUserId);

  const getStatusLabel = () => {
    if (item.status === 'open') return copy.statusOpen;
    if (item.status === 'underReview') return copy.statusUnderReview;
    if (item.status === 'matched') return copy.statusMatched;
    return copy.statusOpen;
  };

  const getCategoryIcon = () => {
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
          <Text style={[styles.topBarTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>
            {copy.detailsTitle}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.heroPhoto} resizeMode="cover" />
        ) : isLost ? (
          <View style={[styles.heroImage, { backgroundColor: '#FCECEE', borderColor: '#F3A5AC' }]}>
            <Ionicons name={getCategoryIcon()} size={42} color="#D95C63" />
            <Text style={styles.heroImageLabel}>{copy.imageLabel}</Text>
          </View>
        ) : null}

        <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={[styles.badgeRow, isArabic && styles.rowReverse]}>
            <View style={[styles.typeBadge, { backgroundColor: isLost ? '#F8DCDD' : '#E9F5D8' }]}>
              <Text style={[styles.typeBadgeText, { color: isLost ? '#A44B54' : '#4B6B20' }]}>
                {isLost ? copy.lost : copy.found}
              </Text>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: palette.cardMuted }]}>
              <Text style={[styles.statusBadgeText, { color: palette.textPrimary }]}>{getStatusLabel()}</Text>
            </View>
          </View>

          <Text style={[styles.title, { color: palette.textPrimary }, isArabic && styles.textRight]}>{item.title}</Text>
          <Text style={[styles.description, { color: palette.textSecondary }, isArabic && styles.textRight]}>
            {item.description}
          </Text>

          <View style={[styles.infoCard, { backgroundColor: palette.surfaceAlt, borderColor: palette.border }]}>
            <View style={[styles.infoRow, isArabic && styles.rowReverse]}>
              <Text style={[styles.infoLabel, { color: palette.textSecondary }]}>{copy.locationLabel}</Text>
              <Text style={[styles.infoValue, { color: palette.textPrimary }]}>{item.location}</Text>
            </View>
            <View style={[styles.infoRow, isArabic && styles.rowReverse]}>
              <Text style={[styles.infoLabel, { color: palette.textSecondary }]}>{copy.dateLabel}</Text>
              <Text style={[styles.infoValue, { color: palette.textPrimary }]}>{item.time}</Text>
            </View>
            <View style={[styles.infoRow, isArabic && styles.rowReverse]}>
              <Text style={[styles.infoLabel, { color: palette.textSecondary }]}>{copy.typeLabel}</Text>
              <Text style={[styles.infoValue, { color: palette.textPrimary }]}>{isLost ? copy.lost : copy.found}</Text>
            </View>
            <View style={[styles.infoRow, isArabic && styles.rowReverse]}>
              <Text style={[styles.infoLabel, { color: palette.textSecondary }]}>{copy.statusLabel}</Text>
              <Text style={[styles.infoValue, { color: palette.textPrimary }]}>{getStatusLabel()}</Text>
            </View>
          </View>

          <Pressable
            style={[styles.contactButton, { backgroundColor: palette.accent, opacity: isOwnPost ? 0.45 : 1 }]}
            onPress={() => onOpenChat(item)}
            disabled={isOwnPost}
          >
            <Text style={styles.contactButtonText}>{copy.contact}</Text>
          </Pressable>
        </View>

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
    minHeight: 84,
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
  topBarTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
    paddingBottom: 120,
  },
  heroImage: {
    minHeight: 220,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  heroPhoto: {
    width: '100%',
    height: 240,
    borderRadius: 28,
  },
  heroImageLabel: {
    color: '#A44B54',
    fontSize: 13,
    fontWeight: '800',
  },
  card: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 18,
    gap: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  badgeRow: {
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
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  infoLabel: {
    fontSize: 13,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
  contactButton: {
    height: 50,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactButtonText: {
    color: '#102247',
    fontSize: 15,
    fontWeight: '800',
  },
  textRight: {
    textAlign: 'right',
  },
});
