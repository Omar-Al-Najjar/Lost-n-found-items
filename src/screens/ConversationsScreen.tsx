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
  const translateX = useRef(new Animated.Value(isArabic ? 22 : -22)).current;
  const badgeScale = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const hoverShift = useRef(new Animated.Value(0)).current;
  const avatarScale = useRef(new Animated.Value(1)).current;
  const avatarRotate = useRef(new Animated.Value(0)).current;
  const arrowShift = useRef(new Animated.Value(0)).current;
  const shimmerOpacity = useRef(new Animated.Value(0)).current;
  const shimmerX = useRef(new Animated.Value(isArabic ? 120 : -120)).current;

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

  useEffect(() => {
    if (!chat.unread) return;

    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(badgeScale, { toValue: 1.12, duration: 650, useNativeDriver: true }),
        Animated.timing(badgeScale, { toValue: 1, duration: 650, useNativeDriver: true }),
      ])
    );

    bounce.start();
    return () => bounce.stop();
  }, [badgeScale, chat.unread]);

  const hoverDirection = isArabic ? -1 : 1;
  const avatarRotateDeg = avatarRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${4 * hoverDirection}deg`],
  });

  const animateHoverIn = () => {
    shimmerX.setValue(-120 * hoverDirection);
    Animated.parallel([
      Animated.spring(scale, { toValue: 1.02, useNativeDriver: true, tension: 240, friction: 16 }),
      Animated.spring(hoverShift, { toValue: 5 * hoverDirection, useNativeDriver: true, tension: 240, friction: 16 }),
      Animated.spring(avatarScale, { toValue: 1.1, useNativeDriver: true, tension: 240, friction: 16 }),
      Animated.timing(avatarRotate, { toValue: 1, duration: 180, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(arrowShift, { toValue: 3 * hoverDirection, useNativeDriver: true, tension: 240, friction: 16 }),
      Animated.timing(shimmerOpacity, { toValue: 0.12, duration: 160, useNativeDriver: true }),
      Animated.timing(shimmerX, {
        toValue: 180 * hoverDirection,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateHoverOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 240, friction: 16 }),
      Animated.spring(hoverShift, { toValue: 0, useNativeDriver: true, tension: 240, friction: 16 }),
      Animated.spring(avatarScale, { toValue: 1, useNativeDriver: true, tension: 240, friction: 16 }),
      Animated.timing(avatarRotate, { toValue: 0, duration: 160, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(arrowShift, { toValue: 0, useNativeDriver: true, tension: 240, friction: 16 }),
      Animated.timing(shimmerOpacity, { toValue: 0, duration: 160, useNativeDriver: true }),
    ]).start();
  };

  return (
    <Animated.View
      style={[
        index < total - 1 && styles.rowDivider,
        { borderBottomColor: palette.border, opacity, transform: [{ translateX }, { translateX: hoverShift }, { scale }] },
      ]}
    >
      <Pressable
        style={styles.row}
        onPress={() => onOpenConversation(chat)}
        onHoverIn={animateHoverIn}
        onHoverOut={animateHoverOut}
        onPressIn={() => {
          Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, tension: 280, friction: 16 }).start();
        }}
        onPressOut={() => {
          Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 280, friction: 16 }).start();
        }}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.hoverSheen,
            {
              backgroundColor: palette.accent,
              opacity: shimmerOpacity,
              transform: [{ translateX: shimmerX }],
            },
          ]}
        />

        <Animated.View style={{ transform: [{ scale: avatarScale }, { rotate: avatarRotateDeg }] }}>
          <View style={[styles.avatar, { backgroundColor: chat.avatarColor }]}>
            <Text style={styles.avatarText}>{chat.avatarInitial}</Text>
          </View>
        </Animated.View>

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
                  {
                    backgroundColor: palette.accent,
                    opacity: dotPulse,
                    transform: [{ scale: dotPulse }, { scale: badgeScale }],
                  },
                ]}
              />
            )}
            <Animated.View style={{ transform: [{ translateX: arrowShift }] }}>
              <Ionicons name="chevron-forward" size={22} color={palette.navIcon} />
            </Animated.View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function ConversationsScreen({ t, palette, isArabic, onOpenConversation }: ConversationsScreenProps) {
  const headerY = useRef(new Animated.Value(-70)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const dotPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(headerY, {
        toValue: 0,
        tension: 190,
        friction: 22,
        useNativeDriver: true,
      }),
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(dotPulse, { toValue: 1.25, duration: 700, useNativeDriver: true }),
        Animated.timing(dotPulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [dotPulse, headerOpacity, headerY]);

  return (
    <>
      <Animated.View
        style={[
          styles.topBar,
          {
            backgroundColor: palette.topBar,
            borderBottomColor: palette.border,
            opacity: headerOpacity,
            transform: [{ translateY: headerY }],
          },
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
    overflow: 'hidden',
    position: 'relative',
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
  hoverSheen: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 120,
    borderRadius: 24,
  },
  textRight: {
    textAlign: 'right',
  },
});
