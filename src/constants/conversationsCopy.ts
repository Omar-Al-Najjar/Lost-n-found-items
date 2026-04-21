import { Language } from '../types';

export type ConversationsCopy = {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  all: string;
  unread: string;
  recent: string;
  emptyTitle: string;
  emptyDescription: string;
  onlineNow: string;
  deleteChat: string;
  deleteChatTitle: string;
  deleteChatBody: string;
  deleteAction: string;
  cancelAction: string;
};

const conversationsCopy: Record<Language, ConversationsCopy> = {
  en: {
    title: 'Messages',
    subtitle: 'Stay close to every report and reply quickly.',
    searchPlaceholder: 'Search by person or message...',
    all: 'All',
    unread: 'Unread',
    recent: 'Recent',
    emptyTitle: 'No matching conversations',
    emptyDescription: 'Try another search or switch to all chats.',
    onlineNow: 'Online now',
    deleteChat: 'Delete',
    deleteChatTitle: 'Delete chat?',
    deleteChatBody: 'This will remove this chat from your account.',
    deleteAction: 'Delete',
    cancelAction: 'Cancel',
  },
  ar: {
    title: '\u0627\u0644\u0631\u0633\u0627\u0626\u0644',
    subtitle: '\u0627\u0628\u0642\u064e \u0642\u0631\u064a\u0628\u064b\u0627 \u0645\u0646 \u0643\u0644 \u0628\u0644\u0627\u063a \u0648\u0631\u062f \u0628\u0633\u0631\u0639\u0629.',
    searchPlaceholder: '\u0627\u0628\u062d\u062b \u0628\u0627\u0633\u0645 \u0627\u0644\u0634\u062e\u0635 \u0623\u0648 \u0627\u0644\u0631\u0633\u0627\u0644\u0629...',
    all: '\u0627\u0644\u0643\u0644',
    unread: '\u063a\u064a\u0631 \u0645\u0642\u0631\u0648\u0621',
    recent: '\u0627\u0644\u0623\u062d\u062f\u062b',
    emptyTitle: '\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u062d\u0627\u062f\u062b\u0627\u062a \u0645\u0637\u0627\u0628\u0642\u0629',
    emptyDescription: '\u062c\u0631\u0628 \u0628\u062d\u062b\u064b\u0627 \u0622\u062e\u0631 \u0623\u0648 \u0627\u0639\u0631\u0636 \u0643\u0644 \u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0627\u062a.',
    onlineNow: '\u0645\u062a\u0635\u0644 \u0627\u0644\u0622\u0646',
    deleteChat: '\u062d\u0630\u0641',
    deleteChatTitle: '\u062d\u0630\u0641 \u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0629\u061f',
    deleteChatBody: '\u0633\u064a\u062a\u0645 \u062d\u0630\u0641 \u0647\u0630\u0647 \u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0629 \u0645\u0646 \u062d\u0633\u0627\u0628\u0643.',
    deleteAction: '\u062d\u0630\u0641',
    cancelAction: '\u0625\u0644\u063a\u0627\u0621',
  },
};

export function getConversationsCopy(language: Language) {
  return conversationsCopy[language];
}
