import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '../components/AmbientBackground';
import { AccountCopy } from '../constants/accountCopy';
import { NotificationItem, Palette } from '../types';

type NotificationsScreenProps = {
  copy: AccountCopy;
  palette: Palette;
  isArabic: boolean;
  notifications: NotificationItem[];
  onBack: () => void;
  onMarkAllRead: () => void;
  onOpenReport: (reportId: string, notificationId: string) => void;
};

export function NotificationsScreen({
  copy,
  palette,
  isArabic,
  notifications,
  onBack,
  onMarkAllRead,
  onOpenReport,
}: NotificationsScreenProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'match' | 'status'>('all');

  const unreadCount = notifications.filter((item) => item.unread).length;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (filter === 'all') return true;
      if (filter === 'unread') return item.unread;
      return item.category === filter;
    });
  }, [filter, notifications]);

  const getCategoryIcon = (item: NotificationItem) => {
    if (item.category === 'match') return 'git-compare-outline';
    if (item.category === 'message') return 'chatbubble-ellipses-outline';
    return 'refresh-circle-outline';
  };

  const getCategoryColor = (item: NotificationItem) => {
    if (item.category === 'match') return { bg: '#EAF5D6', fg: '#4B6B20' };
    if (item.category === 'message') return { bg: '#E7EEFB', fg: '#31558F' };
    return { bg: '#F9E7E7', fg: '#A54848' };
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <AmbientBackground primary={palette.accent} secondary={palette.accentSoft} tertiary={palette.danger} />

      <View style={[styles.topBar, { backgroundColor: palette.topBar, borderBottomColor: palette.border }]}>
        <View style={[styles.topBarRow, isArabic && styles.rowReverse]}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name={isArabic ? 'chevron-forward' : 'chevron-back'} size={24} color={palette.textPrimary} />
          </Pressable>
          <View style={styles.topBarText}>
            <Text style={[styles.topBarTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>
              {copy.notificationsTitle}
            </Text>
            <Text style={[styles.topBarSubtitle, { color: palette.textSecondary }, isArabic && styles.textRight]}>
              {copy.notificationsSubtitle}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={[styles.summaryCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={styles.summaryBlock}>
            <Text style={[styles.summaryValue, { color: palette.textPrimary }]}>{notifications.length}</Text>
            <Text style={[styles.summaryLabel, { color: palette.textSecondary }]}>{copy.notificationsTitle}</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: palette.border }]} />
          <View style={styles.summaryBlock}>
            <Text style={[styles.summaryValue, { color: palette.accent }]}>{unreadCount}</Text>
            <Text style={[styles.summaryLabel, { color: palette.textSecondary }]}>{copy.notificationUnread}</Text>
          </View>
        </View>

        <View style={styles.actionsBlock}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {([
              ['all', copy.notificationAll],
              ['unread', copy.notificationUnread],
              ['match', copy.notificationMatches],
              ['status', copy.notificationUpdates],
            ] as const).map(([key, label]) => {
              const active = filter === key;
              return (
                <Pressable
                  key={key}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: active ? palette.textPrimary : palette.card,
                      borderColor: active ? palette.textPrimary : palette.border,
                    },
                  ]}
                  onPress={() => setFilter(key)}
                >
                  <Text style={[styles.filterChipText, { color: active ? palette.accentStrong : palette.textPrimary }]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable
            style={[styles.markAllButton, { backgroundColor: palette.cardMuted, borderColor: palette.border }]}
            onPress={onMarkAllRead}
          >
            <Text style={[styles.markAllText, { color: palette.textPrimary }]}>{copy.markAllRead}</Text>
          </Pressable>
        </View>

        {filteredNotifications.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <Ionicons name="notifications-off-outline" size={28} color={palette.textSecondary} />
            <Text style={[styles.emptyTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>
              {copy.notificationEmptyTitle}
            </Text>
            <Text style={[styles.emptyDescription, { color: palette.textSecondary }, isArabic && styles.textRight]}>
              {copy.notificationEmptyDescription}
            </Text>
          </View>
        ) : (
          filteredNotifications.map((item) => {
            const categoryStyle = getCategoryColor(item);
            return (
              <View
                key={item.id}
                style={[
                  styles.notificationCard,
                  {
                    backgroundColor: palette.card,
                    borderColor: item.unread ? palette.accent : palette.border,
                  },
                ]}
              >
                <View style={[styles.cardTopRow, isArabic && styles.rowReverse]}>
                  <View style={[styles.iconBadge, { backgroundColor: categoryStyle.bg }]}>
                    <Ionicons name={getCategoryIcon(item)} size={20} color={categoryStyle.fg} />
                  </View>
                  <View style={styles.cardMain}>
                    <View style={[styles.cardTitleRow, isArabic && styles.rowReverse]}>
                      <Text style={[styles.cardTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>
                        {item.title}
                      </Text>
                      <View
                        style={[
                          styles.readBadge,
                          { backgroundColor: item.unread ? palette.accent : palette.cardMuted },
                        ]}
                      >
                        <Text style={[styles.readBadgeText, { color: item.unread ? '#102247' : palette.textPrimary }]}>
                          {item.unread ? copy.notificationUnreadStatus : copy.notificationRead}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.cardBody, { color: palette.textSecondary }, isArabic && styles.textRight]}>
                      {item.body}
                    </Text>
                  </View>
                </View>

                <View style={[styles.cardFooter, isArabic && styles.rowReverse]}>
                  <Text style={[styles.timeText, { color: palette.textSecondary }]}>{item.time}</Text>
                  <Pressable
                    style={[styles.openButton, { backgroundColor: palette.accent }]}
                    onPress={() => onOpenReport(item.relatedReportId, item.id)}
                  >
                    <Text style={styles.openButtonText}>{copy.notificationOpenReport}</Text>
                  </Pressable>
                </View>
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
  topBarText: {
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
  summaryCard: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryBlock: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  summaryLabel: {
    marginTop: 4,
    fontSize: 13,
  },
  summaryDivider: {
    width: 1,
    height: 40,
  },
  actionsBlock: {
    gap: 10,
  },
  filterRow: {
    gap: 8,
    paddingRight: 6,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '800',
  },
  markAllButton: {
    alignSelf: 'flex-start',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  notificationCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  cardTopRow: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMain: {
    flex: 1,
    gap: 8,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    alignItems: 'flex-start',
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
  },
  readBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  readBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 21,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  timeText: {
    fontSize: 12,
  },
  openButton: {
    minHeight: 42,
    borderRadius: 14,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openButtonText: {
    color: '#102247',
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
