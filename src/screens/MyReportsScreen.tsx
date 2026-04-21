import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '../components/AmbientBackground';
import { AccountCopy } from '../constants/accountCopy';
import { useProfilePageMotion } from '../hooks/useProfilePageMotion';
import { MyReportItem, Palette, ReportStatus } from '../types';

type MyReportsScreenProps = {
  copy: AccountCopy;
  palette: Palette;
  isArabic: boolean;
  reports: MyReportItem[];
  highlightedReportId: string | null;
  onBack: () => void;
  onOpenChat: (report: MyReportItem) => void;
  onToggleReportStatus: (reportId: string) => void;
};

export function MyReportsScreen({
  copy,
  palette,
  isArabic,
  reports,
  highlightedReportId,
  onBack,
  onOpenChat,
  onToggleReportStatus,
}: MyReportsScreenProps) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ReportStatus>('all');
  const { headerAnimatedStyle, getItemAnimatedStyle } = useProfilePageMotion();

  const activeCount = reports.filter((item) => item.status !== 'resolved').length;
  const resolvedCount = reports.filter((item) => item.status === 'resolved').length;

  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const searchTarget = `${item.title} ${item.description} ${item.location} ${item.contactName}`.toLowerCase();
      const matchesQuery = !query.trim() || searchTarget.includes(query.trim().toLowerCase());
      return matchesType && matchesStatus && matchesQuery;
    });
  }, [query, reports, statusFilter, typeFilter]);

  const getStatusText = (status: ReportStatus) => {
    if (status === 'open') return copy.statusOpen;
    if (status === 'matching') return copy.statusMatching;
    return copy.statusResolved;
  };

  const getStatusStyle = (status: ReportStatus) => {
    if (status === 'open') return { bg: '#E8F3D2', fg: '#47661F' };
    if (status === 'matching') return { bg: '#E6EDF9', fg: '#34598D' };
    return { bg: '#F4E6E6', fg: '#A24D4D' };
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <AmbientBackground primary={palette.accent} secondary={palette.accentSoft} tertiary={palette.textPrimary} />

      <Animated.View
        style={[styles.topBar, { backgroundColor: palette.topBar, borderBottomColor: palette.border }, headerAnimatedStyle]}
      >
        <View style={[styles.topBarRow, isArabic && styles.rowReverse]}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name={isArabic ? 'chevron-forward' : 'chevron-back'} size={24} color={palette.textPrimary} />
          </Pressable>
          <View style={styles.topBarText}>
            <Text style={[styles.topBarTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>
              {copy.myReportsTitle}
            </Text>
            <Text style={[styles.topBarSubtitle, { color: palette.textSecondary }, isArabic && styles.textRight]}>
              {copy.myReportsSubtitle}
            </Text>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={getItemAnimatedStyle(0)}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.summaryCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={styles.summaryBlock}>
            <Text style={[styles.summaryValue, { color: palette.textPrimary }]}>{activeCount}</Text>
            <Text style={[styles.summaryLabel, { color: palette.textSecondary }]}>{copy.activeReports}</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: palette.border }]} />
          <View style={styles.summaryBlock}>
            <Text style={[styles.summaryValue, { color: palette.accent }]}>{resolvedCount}</Text>
            <Text style={[styles.summaryLabel, { color: palette.textSecondary }]}>{copy.resolvedReports}</Text>
          </View>
        </View>

        <View style={[styles.searchWrap, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Ionicons name="search-outline" size={20} color={palette.textSecondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={copy.myReportsSearchPlaceholder}
            placeholderTextColor={palette.textSecondary}
            style={[styles.searchInput, { color: palette.textPrimary, textAlign: isArabic ? 'right' : 'left' }]}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {([
            ['all', copy.myReportsAll],
            ['lost', copy.myReportsLost],
            ['found', copy.myReportsFound],
          ] as const).map(([key, label]) => {
            const active = typeFilter === key;
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
                onPress={() => setTypeFilter(key)}
              >
                <Text style={[styles.filterChipText, { color: active ? '#102247' : palette.textPrimary }]}>{label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {([
            ['all', copy.statusAll],
            ['open', copy.statusOpen],
            ['matching', copy.statusMatching],
            ['resolved', copy.statusResolved],
          ] as const).map(([key, label]) => {
            const active = statusFilter === key;
            return (
              <Pressable
                key={key}
                style={[
                  styles.statusChip,
                  {
                    backgroundColor: active ? palette.textPrimary : palette.card,
                    borderColor: active ? palette.textPrimary : palette.border,
                  },
                ]}
                onPress={() => setStatusFilter(key)}
              >
                <Text style={[styles.statusChipText, { color: active ? palette.accentStrong : palette.textPrimary }]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {filteredReports.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <Ionicons name="folder-open-outline" size={28} color={palette.textSecondary} />
            <Text style={[styles.emptyTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>
              {copy.reportsEmptyTitle}
            </Text>
            <Text style={[styles.emptyDescription, { color: palette.textSecondary }, isArabic && styles.textRight]}>
              {copy.reportsEmptyDescription}
            </Text>
          </View>
        ) : (
          filteredReports.map((report) => {
            const statusStyle = getStatusStyle(report.status);
            const isHighlighted = highlightedReportId === report.id;
            return (
              <View
                key={report.id}
                style={[
                  styles.reportCard,
                  {
                    backgroundColor: palette.card,
                    borderColor: isHighlighted ? palette.accent : palette.border,
                  },
                ]}
              >
                {isHighlighted && (
                  <View style={[styles.highlightBanner, { backgroundColor: palette.accentSoft }]}>
                    <Text style={styles.highlightBannerText}>{copy.highlightedReport}</Text>
                  </View>
                )}

                <View style={[styles.badgeRow, isArabic && styles.rowReverse]}>
                  <View style={[styles.badgeGroup, isArabic && styles.rowReverse]}>
                    <View
                      style={[
                        styles.typeBadge,
                        { backgroundColor: report.type === 'lost' ? '#F8DCDD' : '#E9F5D8' },
                      ]}
                    >
                      <Text style={[styles.typeBadgeText, { color: report.type === 'lost' ? '#A44B54' : '#4B6B20' }]}>
                        {report.type === 'lost' ? copy.myReportsLost : copy.myReportsFound}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: statusStyle.fg }]}>{getStatusText(report.status)}</Text>
                    </View>
                  </View>
                  <Text style={[styles.reportTime, { color: palette.textSecondary }]}>{report.time}</Text>
                </View>

                <Text style={[styles.reportTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>
                  {report.title}
                </Text>
                <Text style={[styles.reportDescription, { color: palette.textSecondary }, isArabic && styles.textRight]}>
                  {report.description}
                </Text>

                <View style={[styles.metaRow, isArabic && styles.rowReverse]}>
                  <View style={[styles.metaItem, isArabic && styles.rowReverse]}>
                    <Ionicons name="location-outline" size={16} color={palette.textSecondary} />
                    <Text style={[styles.metaText, { color: palette.textSecondary }]}>{report.location}</Text>
                  </View>
                  <View style={[styles.metaItem, isArabic && styles.rowReverse]}>
                    <Ionicons name="person-outline" size={16} color={palette.textSecondary} />
                    <Text style={[styles.metaText, { color: palette.textSecondary }]}>{report.contactName}</Text>
                  </View>
                </View>

                <View style={[styles.statsRow, { backgroundColor: palette.surfaceAlt, borderColor: palette.border }]}>
                  <View style={styles.statBlock}>
                    <Text style={[styles.statValue, { color: palette.textPrimary }]}>{report.views}</Text>
                    <Text style={[styles.statLabel, { color: palette.textSecondary }]}>{copy.viewsLabel}</Text>
                  </View>
                  <View style={styles.statBlock}>
                    <Text style={[styles.statValue, { color: palette.textPrimary }]}>{report.messages}</Text>
                    <Text style={[styles.statLabel, { color: palette.textSecondary }]}>{copy.messagesLabel}</Text>
                  </View>
                  <View style={styles.statBlock}>
                    <Text style={[styles.statValue, { color: palette.textPrimary }]}>{report.lastUpdate}</Text>
                    <Text style={[styles.statLabel, { color: palette.textSecondary }]}>{copy.lastUpdateLabel}</Text>
                  </View>
                </View>

                <View style={[styles.actionsRow, isArabic && styles.rowReverse]}>
                  <Pressable
                    style={[styles.secondaryButton, { backgroundColor: palette.cardMuted, borderColor: palette.border }]}
                    onPress={() => onToggleReportStatus(report.id)}
                  >
                    <Text style={[styles.secondaryButtonText, { color: palette.textPrimary }]}>
                      {report.status === 'resolved' ? copy.reopenReport : copy.markResolved}
                    </Text>
                  </Pressable>
                  <Pressable style={[styles.primaryButton, { backgroundColor: palette.accent }]} onPress={() => onOpenChat(report)}>
                    <Text style={styles.primaryButtonText}>{copy.openChat}</Text>
                  </Pressable>
                </View>
              </View>
            );
          })
        )}

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
    gap: 8,
    paddingBottom: 6,
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
  statusChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  statusChipText: {
    fontSize: 13,
    fontWeight: '800',
  },
  reportCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 12,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  highlightBanner: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  highlightBannerText: {
    color: '#F5F1E8',
    fontSize: 11,
    fontWeight: '800',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  badgeGroup: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  typeBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  reportTime: {
    fontSize: 12,
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  reportDescription: {
    fontSize: 14,
    lineHeight: 21,
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
  statsRow: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  statLabel: {
    marginTop: 4,
    fontSize: 11,
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '800',
  },
  primaryButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  primaryButtonText: {
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
