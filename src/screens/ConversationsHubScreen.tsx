import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '../components/AmbientBackground';
import { ConversationsCopy } from '../constants/conversationsCopy';
import { ChatPreview, Palette } from '../types';

type ConversationsHubScreenProps = {
  copy: ConversationsCopy;
  palette: Palette;
  isArabic: boolean;
  chats: ChatPreview[];
  onOpenConversation: (chat: ChatPreview) => void;
};

export function ConversationsHubScreen({
  copy,
  palette,
  isArabic,
  chats,
  onOpenConversation,
}: ConversationsHubScreenProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredChats = useMemo(() => {
    return chats.filter((chat) => {
      const matchesFilter = filter === 'all' || chat.unread;
      const searchTarget = `${chat.name} ${chat.message}`.toLowerCase();
      const matchesQuery = !query.trim() || searchTarget.includes(query.trim().toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [chats, filter, query]);

  const unreadCount = chats.filter((chat) => chat.unread).length;

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <AmbientBackground primary={palette.accent} secondary={palette.accentSoft} tertiary={palette.danger} />

      <View style={[styles.topBar, { backgroundColor: palette.topBar, borderBottomColor: palette.border }]}>
        <Text style={[styles.topBarTitle, { color: palette.textPrimary }]}>{copy.title}</Text>
        <Text style={[styles.topBarSubtitle, { color: palette.textSecondary }]}>{copy.subtitle}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={[styles.summaryCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={styles.summaryLeft}>
            <Text style={[styles.summaryNumber, { color: palette.textPrimary }]}>{chats.length}</Text>
            <Text style={[styles.summaryLabel, { color: palette.textSecondary }]}>{copy.recent}</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: palette.border }]} />
          <View style={styles.summaryRight}>
            <Text style={[styles.summaryNumber, { color: palette.textPrimary }]}>{unreadCount}</Text>
            <Text style={[styles.summaryLabel, { color: palette.textSecondary }]}>{copy.unread}</Text>
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

        <View style={[styles.filterRow, isArabic && styles.rowReverse]}>
          {([
            ['all', copy.all],
            ['unread', copy.unread],
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
                <Text style={[styles.filterText, { color: active ? palette.accentStrong : palette.textPrimary }]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {filteredChats.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <Ionicons name="chatbubbles-outline" size={26} color={palette.textSecondary} />
            <Text style={[styles.emptyTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>
              {copy.emptyTitle}
            </Text>
            <Text style={[styles.emptyDescription, { color: palette.textSecondary }, isArabic && styles.textRight]}>
              {copy.emptyDescription}
            </Text>
          </View>
        ) : (
          filteredChats.map((chat) => (
            <Pressable
              key={chat.id}
              style={[styles.chatCard, { backgroundColor: palette.card, borderColor: palette.border }]}
              onPress={() => onOpenConversation(chat)}
            >
              <View style={[styles.avatar, { backgroundColor: chat.avatarColor }]}>
                <Text style={styles.avatarText}>{chat.avatarInitial}</Text>
              </View>

              <View style={styles.mainBlock}>
                <View style={[styles.nameRow, isArabic && styles.rowReverse]}>
                  <Text style={[styles.name, { color: palette.textPrimary }, isArabic && styles.textRight]} numberOfLines={1}>
                    {chat.name}
                  </Text>
                  {chat.unread && <View style={styles.unreadPill}><Text style={styles.unreadPillText}>{copy.unread}</Text></View>}
                </View>
                <Text style={[styles.message, { color: palette.textSecondary }, isArabic && styles.textRight]} numberOfLines={2}>
                  {chat.message}
                </Text>
                <View style={[styles.metaRow, isArabic && styles.rowReverse]}>
                  <Text style={[styles.metaText, { color: palette.textSecondary }]}>{chat.time}</Text>
                  <View style={styles.onlineBadge}>
                    <View style={[styles.onlineDot, { backgroundColor: '#6FAE3C' }]} />
                    <Text style={[styles.onlineText, { color: palette.textSecondary }]}>{copy.onlineNow}</Text>
                  </View>
                </View>
              </View>

              <Ionicons
                name={isArabic ? 'chevron-back' : 'chevron-forward'}
                size={20}
                color={palette.navIcon}
              />
            </Pressable>
          ))
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
    minHeight: 88,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
    borderRadius: 22,
    minHeight: 92,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryLeft: {
    flex: 1,
    alignItems: 'center',
  },
  summaryRight: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 40,
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: '800',
  },
  summaryLabel: {
    marginTop: 4,
    fontSize: 13,
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
  filterChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '800',
  },
  chatCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  mainBlock: {
    flex: 1,
    gap: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
  },
  unreadPill: {
    backgroundColor: '#D95C63',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  unreadPillText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  metaText: {
    fontSize: 12,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  onlineText: {
    fontSize: 12,
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
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  textRight: {
    textAlign: 'right',
  },
});
