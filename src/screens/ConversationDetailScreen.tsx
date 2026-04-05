import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ChatMessage, ChatPreview, Palette } from '../types';

type ConversationDetailScreenProps = {
  t: any;
  palette: Palette;
  isArabic: boolean;
  chat: ChatPreview;
  onBack: () => void;
};

export function ConversationDetailScreen({ t, palette, isArabic, chat, onBack }: ConversationDetailScreenProps) {
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(t.detailMessages);
  const listRef = useRef<ScrollView>(null);

  const headerY = useRef(new Animated.Value(-74)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const composerY = useRef(new Animated.Value(90)).current;
  const composerOpacity = useRef(new Animated.Value(0)).current;
  const onlinePulse = useRef(new Animated.Value(1)).current;
  const sendScale = useRef(new Animated.Value(1)).current;

  const rowOpacity = useRef<Animated.Value[]>([]);
  const rowY = useRef<Animated.Value[]>([]);
  const rowScale = useRef<Animated.Value[]>([]);
  const previousLength = useRef(0);

  useEffect(() => {
    setMessages(t.detailMessages);
  }, [t.detailMessages]);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(headerY, { toValue: 0, tension: 190, friction: 22, useNativeDriver: true }),
      Animated.timing(headerOpacity, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.spring(composerY, { toValue: 0, tension: 190, friction: 22, useNativeDriver: true }),
      Animated.timing(composerOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(onlinePulse, { toValue: 0.55, duration: 900, useNativeDriver: true }),
        Animated.timing(onlinePulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [composerOpacity, composerY, headerOpacity, headerY, onlinePulse]);

  useEffect(() => {
    const start = previousLength.current === 0 ? 0 : previousLength.current;

    for (let i = rowOpacity.current.length; i < messages.length; i += 1) {
      rowOpacity.current[i] = new Animated.Value(0);
      rowY.current[i] = new Animated.Value(16);
      rowScale.current[i] = new Animated.Value(0.95);
    }

    const animations: Animated.CompositeAnimation[] = [];
    for (let i = start; i < messages.length; i += 1) {
      animations.push(
        Animated.parallel([
          Animated.timing(rowOpacity.current[i], { toValue: 1, duration: 240, delay: (i - start) * 70, useNativeDriver: true }),
          Animated.timing(rowY.current[i], {
            toValue: 0,
            duration: 240,
            delay: (i - start) * 70,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(rowScale.current[i], {
            toValue: 1,
            duration: 240,
            delay: (i - start) * 70,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ])
      );
    }

    if (animations.length > 0) {
      Animated.stagger(45, animations).start(() => {
        listRef.current?.scrollToEnd({ animated: true });
      });
    }

    previousLength.current = messages.length;
  }, [messages]);

  const formatTime = () =>
    new Date().toLocaleTimeString(isArabic ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const handleSend = () => {
    const trimmed = messageText.trim();
    if (!trimmed) return;

    Animated.sequence([
      Animated.spring(sendScale, { toValue: 0.9, useNativeDriver: true, tension: 350, friction: 18 }),
      Animated.spring(sendScale, { toValue: 1, useNativeDriver: true, tension: 350, friction: 18 }),
    ]).start();

    setMessages((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        text: trimmed,
        time: formatTime(),
        mine: true,
      },
    ]);
    setMessageText('');
  };

  return (
    <View style={[styles.screen, { backgroundColor: palette.bg }]}>
      <Animated.View
        style={[
          styles.topBar,
          isArabic && styles.rowReverse,
          {
            backgroundColor: palette.topBar,
            borderBottomColor: palette.border,
            opacity: headerOpacity,
            transform: [{ translateY: headerY }],
          },
        ]}
      >
        <Pressable style={styles.backButton} onPress={onBack}>
          <Ionicons name={isArabic ? 'chevron-forward' : 'chevron-back'} size={28} color={palette.textPrimary} />
        </Pressable>

        <View style={[styles.headerCenter, isArabic && styles.headerCenterArabic]}>
          <Text style={[styles.headerName, { color: palette.textPrimary }, isArabic && styles.textRight]} numberOfLines={1}>
            {chat.name}
          </Text>
          <View style={[styles.onlineRow, isArabic && styles.rowReverse]}>
            <Text style={[styles.onlineText, { color: palette.accent }, isArabic && styles.textRight]}>{t.onlineNow}</Text>
            <Animated.View style={[styles.onlineDot, { backgroundColor: palette.accent, opacity: onlinePulse, transform: [{ scale: onlinePulse }] }]} />
          </View>
        </View>

        <View style={[styles.avatar, { backgroundColor: chat.avatarColor }]}>
          <Text style={styles.avatarText}>{chat.avatarInitial}</Text>
        </View>
      </Animated.View>

      <ScrollView ref={listRef} contentContainerStyle={styles.chatContainer} showsVerticalScrollIndicator={false}>
        {messages.map((message, index) => (
          <Animated.View
            key={message.id}
            style={[
              styles.messageWrap,
              message.mine ? styles.messageMine : styles.messageOther,
              {
                opacity: rowOpacity.current[index] ?? 1,
                transform: [{ translateY: rowY.current[index] ?? 0 }, { scale: rowScale.current[index] ?? 1 }],
              },
            ]}
          >
            <View
              style={[
                styles.bubble,
                {
                  backgroundColor: message.mine ? palette.accent : palette.topBar,
                  borderColor: palette.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.bubbleText,
                  {
                    color: message.mine ? '#000000' : palette.textPrimary,
                    textAlign: isArabic ? 'right' : 'left',
                  },
                ]}
              >
                {message.text}
              </Text>
            </View>
            <Text style={[styles.timeText, { color: palette.textSecondary }]}>{message.time}</Text>
          </Animated.View>
        ))}

        <View style={{ height: 120 }} />
      </ScrollView>

      <Animated.View
        style={[
          styles.composerWrap,
          {
            backgroundColor: palette.bg,
            borderTopColor: palette.border,
            opacity: composerOpacity,
            transform: [{ translateY: composerY }],
          },
        ]}
      >
        <Pressable style={[styles.roundButton, { backgroundColor: palette.topBar, borderColor: palette.border }]}>
          <Ionicons name="image-outline" size={24} color={palette.navIcon} />
        </Pressable>

        <View style={[styles.inputWrap, { backgroundColor: palette.topBar, borderColor: palette.border }]}>
          <TextInput
            placeholder={t.messagePlaceholder}
            placeholderTextColor={palette.textSecondary}
            style={[styles.input, { color: palette.textPrimary, textAlign: isArabic ? 'right' : 'left' }]}
            value={messageText}
            onChangeText={setMessageText}
            onSubmitEditing={handleSend}
          />
        </View>

        <Animated.View style={{ transform: [{ scale: sendScale }] }}>
          <Pressable
            style={[styles.roundButton, { backgroundColor: '#c2de7c', opacity: messageText.trim() ? 1 : 0.55 }]}
            onPress={handleSend}
            disabled={!messageText.trim()}
          >
            <Ionicons name="paper-plane-outline" size={26} color={palette.textPrimary} />
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topBar: {
    height: 74,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  backButton: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'flex-end',
  },
  headerCenterArabic: {
    alignItems: 'flex-end',
  },
  headerName: {
    fontSize: 19,
    fontWeight: '700',
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  onlineText: {
    fontSize: 15,
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '700',
  },
  chatContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  messageWrap: {
    marginBottom: 14,
    maxWidth: '78%',
  },
  messageMine: {
    alignSelf: 'flex-end',
  },
  messageOther: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bubbleText: {
    fontSize: 18,
    lineHeight: 26,
  },
  timeText: {
    marginTop: 6,
    fontSize: 13,
  },
  textRight: {
    textAlign: 'right',
  },
  composerWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderTopWidth: 1,
    gap: 8,
  },
  roundButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputWrap: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  input: {
    fontSize: 18,
  },
});
