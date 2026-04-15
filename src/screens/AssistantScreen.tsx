import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AmbientBackground } from '../components/AmbientBackground';
import { Palette } from '../types';

type AssistantMessage = {
  id: string;
  sender: 'bot' | 'user';
  text: string;
};

type AssistantScreenProps = {
  t: any;
  palette: Palette;
  isArabic: boolean;
};

export function AssistantScreen({ t, palette, isArabic }: AssistantScreenProps) {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    setMessages([{ id: 'welcome', sender: 'bot', text: t.assistantIntro }]);
  }, [t.assistantIntro]);

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { id: `user-${Date.now()}`, sender: 'user', text: trimmed }]);
    setDraft('');
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { id: `bot-${Date.now()}`, sender: 'bot', text: t.assistantMatch }]);
    }, 900);
  };

  return (
    <View style={styles.screen}>
      <AmbientBackground primary={palette.accent} secondary={palette.accentSoft} tertiary={palette.textPrimary} />

      <View style={[styles.topBar, { backgroundColor: palette.topBar, borderBottomColor: palette.border }]}>
        <View style={[styles.headerRow, isArabic && styles.rowReverse]}>
          <View style={[styles.iconBadge, { backgroundColor: palette.accent }]}>
            <Ionicons name="sparkles-outline" size={20} color="#102247" />
          </View>
          <Text style={[styles.topBarTitle, { color: palette.textPrimary }]}>{t.chatbotTitle}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.messageList} showsVerticalScrollIndicator={false}>
        {messages.map((message) => {
          const mine = message.sender === 'user';
          return (
            <View
              key={message.id}
              style={[
                styles.messageWrap,
                mine ? styles.messageMine : styles.messageOther,
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  {
                    backgroundColor: mine ? palette.accent : palette.card,
                    borderColor: palette.border,
                  },
                ]}
              >
                <Text style={[styles.bubbleText, { color: mine ? '#102247' : palette.textPrimary }, isArabic && styles.textRight]}>
                  {message.text}
                </Text>
              </View>
            </View>
          );
        })}

        {typing && (
          <View style={[styles.messageWrap, styles.messageOther]}>
            <View style={[styles.typingBubble, { backgroundColor: palette.card, borderColor: palette.border }]}>
              <Text style={{ color: palette.textSecondary }}>...</Text>
            </View>
          </View>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      <View style={[styles.composerWrap, { backgroundColor: palette.bg, borderTopColor: palette.border }]}>
        <View style={[styles.inputWrap, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={t.chatbotPlaceholder}
            placeholderTextColor={palette.textSecondary}
            style={[styles.input, { color: palette.textPrimary, textAlign: isArabic ? 'right' : 'left' }]}
            onSubmitEditing={handleSend}
          />
        </View>
        <Pressable
          style={[styles.sendButton, { backgroundColor: palette.accent, opacity: draft.trim() ? 1 : 0.5 }]}
          disabled={!draft.trim()}
          onPress={handleSend}
        >
          <Ionicons name="send-outline" size={20} color="#102247" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topBar: {
    borderBottomWidth: 1,
    justifyContent: 'center',
    minHeight: 72,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 21,
    fontWeight: '800',
  },
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 18,
    gap: 12,
  },
  messageWrap: {
    maxWidth: '84%',
  },
  messageMine: {
    alignSelf: 'flex-start',
  },
  messageOther: {
    alignSelf: 'flex-end',
  },
  bubble: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  textRight: {
    textAlign: 'right',
  },
  typingBubble: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  composerWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWrap: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 50,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
