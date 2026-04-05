import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ChatPreview, Palette } from '../types';

type ConversationsScreenProps = {
  t: any;
  palette: Palette;
  isArabic: boolean;
  onOpenConversation: (chat: ChatPreview) => void;
};

type RowItemProps = {
  chat: ChatPreview;
  index: number;
  total: number;
  palette: Palette;
  isArabic: boolean;
  onOpenConversation: (chat: ChatPreview) => void;
  dotPulse: Animated.Value;
};

function RowItem({ chat, index, total, palette, isArabic, onOpenConversation, dotPulse }: RowItemProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(-20)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 250,
        delay: index * 80,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, opacity, translateX]);

  return (
    <Animated.View
      style={[
        index < total - 1 && styles.rowDivider,
        { borderBottomColor: palette.border, opacity, transform: [{ translateX }, { scale }] },
      ]}
    >
      <Pressable
        style={styles.row}
        onPress={() => onOpenConversation(chat)}
        onPressIn={() => {
          Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, tension: 280, friction: 16 }).start();
        }}
        onPressOut={() => {
          Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 280, friction: 16 }).start();
        }}
      >
        <View style={[styles.avatar, { backgroundColor: chat.avatarColor }]}>
          <Text style={styles.avatarText}>{chat.avatarInitial}</Text>
        </View>

        <View style={styles.mainBlock}>
          <Text style={[styles.name, { color: palette.textPrimary }, isArabic && styles.textRight]} numberOfLines={1}>
            {chat.name}
          </Text>
          <Text style={[styles.message, { color: palette.textSecondary }, isArabic && styles.textRight]} numberOfLines={1}>
            {chat.message}
          </Text>
        </View>

        <View style={styles.sideBlock}>
          <Text style={[styles.time, { color: palette.textSecondary }]}>{chat.time}</Text>
          <View style={styles.arrowWrap}>
            {chat.unread && (
              <Animated.View
                style={[
                  styles.unreadDot,
                  { backgroundColor: palette.accent, opacity: dotPulse, transform: [{ scale: dotPulse }] },
                ]}
              />
            )}
            <Ionicons name="chevron-forward" size={22} color={palette.navIcon} />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function ConversationsScreen({ t, palette, isArabic, onOpenConversation }: ConversationsScreenProps) {
  const headerY = useRef(new Animated.Value(-70)).current;
  const dotPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(headerY, {
      toValue: 0,
      tension: 190,
      friction: 22,
      useNativeDriver: true,
    }).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(dotPulse, { toValue: 1.25, duration: 700, useNativeDriver: true }),
        Animated.timing(dotPulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [dotPulse, headerY]);

  return (
    <>
      <Animated.View
        style={[
          styles.topBar,
          { backgroundColor: palette.topBar, borderBottomColor: palette.border, transform: [{ translateY: headerY }] },
        ]}
      >
        <Text style={[styles.topBarTitle, { color: palette.textPrimary }]}>{t.conversations}</Text>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {t.chats.map((chat: ChatPreview, index: number) => (
          <RowItem
            key={chat.id}
            chat={chat}
            index={index}
            total={t.chats.length}
            palette={palette}
            isArabic={isArabic}
            onOpenConversation={onOpenConversation}
            dotPulse={dotPulse}
          />
        ))}

        <View style={{ height: 140 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  topBar: {
    borderBottomWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 62,
  },
  topBarTitle: {
    fontSize: 23,
    fontWeight: '700',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  row: {
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  rowDivider: {
    borderBottomWidth: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '700',
  },
  mainBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 38 / 2,
    fontWeight: '700',
    marginBottom: 4,
  },
  message: {
    fontSize: 32 / 2,
    fontWeight: '500',
  },
  sideBlock: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 95,
  },
  time: {
    fontSize: 28 / 2,
    marginBottom: 8,
  },
  arrowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  textRight: {
    textAlign: 'right',
  },
});
