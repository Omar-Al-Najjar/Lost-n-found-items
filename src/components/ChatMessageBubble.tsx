import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { Palette } from '../types';

type ChatMessageBubbleProps = {
  text: string;
  sender: 'bot' | 'user';
  palette: Palette;
  isArabic: boolean;
  isDark: boolean;
  timestamp?: string;
};

export function ChatMessageBubble({
  text,
  sender,
  palette,
  isArabic,
  isDark,
  timestamp,
}: ChatMessageBubbleProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;
  const scale = useRef(new Animated.Value(0.98)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale, translateY]);

  const isUser = sender === 'user';
  const accentInk = isDark ? palette.bg : palette.textPrimary;
  const alignToRight = isArabic ? isUser : !isUser;

  return (
    <Animated.View
      style={[
        styles.wrap,
        alignToRight ? styles.alignRight : styles.alignLeft,
        {
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isUser ? palette.accent : palette.card,
            borderColor: isUser ? 'transparent' : palette.border,
          },
        ]}
      >
        <Text
          style={[
            styles.text,
            { color: isUser ? accentInk : palette.textPrimary, textAlign: isArabic ? 'right' : 'left' },
          ]}
        >
          {text}
        </Text>
      </View>

      {timestamp ? (
        <Text
          style={[
            styles.time,
            {
              color: palette.textSecondary,
              textAlign: alignToRight ? 'right' : 'left',
            },
          ]}
        >
          {timestamp}
        </Text>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    maxWidth: '84%',
    marginBottom: 14,
  },
  alignLeft: {
    alignSelf: 'flex-start',
  },
  alignRight: {
    alignSelf: 'flex-end',
  },
  bubble: {
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 13,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
  },
  time: {
    marginTop: 6,
    fontSize: 11,
    paddingHorizontal: 4,
  },
});
