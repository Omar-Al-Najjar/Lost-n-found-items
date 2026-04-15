import { Ionicons } from '@expo/vector-icons';
import React, { startTransition, useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AmbientBackground } from '../components/AmbientBackground';
import { ChatMessageBubble } from '../components/ChatMessageBubble';
import { TypingIndicator } from '../components/TypingIndicator';
import { getAssistantChatCopy, getAssistantMockReply } from '../data/assistantReplies';
import { Palette } from '../types';

type ChatbotScreenProps = {
  t: any;
  palette: Palette;
  isArabic: boolean;
};

type ChatbotMessage = {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
};

export function ChatbotScreen({ t, palette, isArabic }: ChatbotScreenProps) {
  const isDark = palette.bg === '#070706';
  const language = isArabic ? 'ar' : 'en';
  const chatCopy = getAssistantChatCopy(language);
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const listRef = useRef<FlatList<ChatbotMessage>>(null);
  const pendingReplies = useRef(0);
  const replyCount = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: chatCopy.welcomeMessage,
        time: formatTime(isArabic),
      },
    ]);
    setTyping(false);
    pendingReplies.current = 0;
    replyCount.current = 0;

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [chatCopy.welcomeMessage, isArabic]);

  const scrollToLatest = (animated: boolean) => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated });
    });
  };

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: trimmed,
        time: formatTime(isArabic),
      },
    ]);
    setDraft('');
    scrollToLatest(true);

    pendingReplies.current += 1;
    setTyping(true);

    const timer = setTimeout(() => {
      const replyText = getAssistantMockReply(language, trimmed, replyCount.current);
      replyCount.current += 1;
      pendingReplies.current = Math.max(0, pendingReplies.current - 1);

      startTransition(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: replyText,
            time: formatTime(isArabic),
          },
        ]);
        setTyping(pendingReplies.current > 0);
      });

      scrollToLatest(true);
      timersRef.current = timersRef.current.filter((currentTimer) => currentTimer !== timer);
    }, 420 + replyCount.current * 40);

    timersRef.current.push(timer);
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 18 : 0}
    >
      <AmbientBackground primary={palette.accent} secondary={palette.accentSoft} tertiary={palette.textPrimary} />

      <View style={[styles.topBar, { backgroundColor: palette.topBar, borderBottomColor: palette.border }]}>
        <View style={[styles.headerRow, isArabic && styles.rowReverse]}>
          <View style={styles.headerCopy}>
            <Text style={[styles.topBarTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>
              {t.chatbotTitle}
            </Text>
            <Text style={[styles.topBarSubtitle, { color: palette.textSecondary }, isArabic && styles.textRight]}>
              {chatCopy.subtitle}
            </Text>
          </View>
          <View style={[styles.iconBadge, { backgroundColor: palette.accent }]}>
            <Ionicons name="sparkles-outline" size={20} color={isDark ? palette.bg : palette.textPrimary} />
          </View>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollToLatest(true)}
        ListHeaderComponent={
          <View style={[styles.introCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <Ionicons name="chatbubble-ellipses-outline" size={22} color={palette.accent} />
            <View style={styles.introCopy}>
              <Text style={[styles.introTitle, { color: palette.textPrimary }, isArabic && styles.textRight]}>
                {t.chatbotTitle}
              </Text>
              <Text style={[styles.introText, { color: palette.textSecondary }, isArabic && styles.textRight]}>
                {t.chatbotPlaceholder}
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <ChatMessageBubble
            text={item.text}
            sender={item.sender}
            palette={palette}
            isArabic={isArabic}
            isDark={isDark}
            timestamp={item.time}
          />
        )}
        ListFooterComponent={
          <>
            {typing ? <TypingIndicator palette={palette} label={chatCopy.typingLabel} isArabic={isArabic} /> : null}
            <View style={styles.listFooterSpace} />
          </>
        }
      />

      <View style={[styles.composerWrap, { backgroundColor: palette.bg, borderTopColor: palette.border }]}>
        <View style={[styles.inputWrap, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={t.chatbotPlaceholder}
            placeholderTextColor={palette.textSecondary}
            style={[styles.input, { color: palette.textPrimary, textAlign: isArabic ? 'right' : 'left' }]}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            blurOnSubmit={false}
            multiline
            maxLength={240}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={chatCopy.sendLabel}
          style={({ pressed }) => [
            styles.sendButton,
            {
              backgroundColor: palette.accent,
              opacity: draft.trim() ? 1 : 0.45,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            },
          ]}
          disabled={!draft.trim()}
          onPress={handleSend}
        >
          <Ionicons name="send-outline" size={20} color={isDark ? palette.bg : palette.textPrimary} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function formatTime(isArabic: boolean) {
  return new Date().toLocaleTimeString(isArabic ? 'ar-SA' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
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
    paddingVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  headerCopy: {
    flex: 1,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  topBarSubtitle: {
    marginTop: 4,
    fontSize: 13,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  introCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  introCopy: {
    flex: 1,
  },
  introTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  introText: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 20,
  },
  composerWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
  },
  inputWrap: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    minHeight: 54,
    maxHeight: 120,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    lineHeight: 22,
    paddingTop: 14,
    paddingBottom: 14,
  },
  sendButton: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listFooterSpace: {
    height: 18,
  },
  textRight: {
    textAlign: 'right',
  },
});
