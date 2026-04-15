import { Language, ChatPreview } from '../types';

const conversations: Record<Language, ChatPreview[]> = {
  en: [
    {
      id: 'c1',
      name: 'Ahmed Mohammad',
      message: 'I can meet you near the university gate after 5 PM.',
      time: '5 min ago',
      avatarInitial: 'A',
      avatarColor: '#D95C63',
      unread: true,
    },
    {
      id: 'c2',
      name: 'Sara Ali',
      message: 'The keychain is silver with a small star on it.',
      time: '28 min ago',
      avatarInitial: 'S',
      avatarColor: '#6FAE3C',
      unread: true,
    },
    {
      id: 'c3',
      name: 'Khaled Ahmad',
      message: 'Please confirm the phone wallpaper so I know it is yours.',
      time: 'Yesterday',
      avatarInitial: 'K',
      avatarColor: '#4A7FE6',
      unread: false,
    },
  ],
  ar: [
    {
      id: 'c1',
      name: '\u0623\u062d\u0645\u062f \u0645\u062d\u0645\u062f',
      message: '\u064a\u0645\u0643\u0646\u0646\u064a \u0645\u0642\u0627\u0628\u0644\u062a\u0643 \u0642\u0631\u0628 \u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u062c\u0627\u0645\u0639\u0629 \u0628\u0639\u062f \u0627\u0644\u0633\u0627\u0639\u0629 5.',
      time: '\u0642\u0628\u0644 5 \u062f\u0642\u0627\u0626\u0642',
      avatarInitial: '\u0623',
      avatarColor: '#D95C63',
      unread: true,
    },
    {
      id: 'c2',
      name: '\u0633\u0627\u0631\u0629 \u0639\u0644\u064a',
      message: '\u0627\u0644\u0645\u064a\u062f\u0627\u0644\u064a\u0629 \u0641\u0636\u064a\u0629 \u0648\u0639\u0644\u064a\u0647\u0627 \u0634\u0643\u0644 \u0646\u062c\u0645\u0629 \u0635\u063a\u064a\u0631\u0629.',
      time: '\u0642\u0628\u0644 28 \u062f\u0642\u064a\u0642\u0629',
      avatarInitial: '\u0633',
      avatarColor: '#6FAE3C',
      unread: true,
    },
    {
      id: 'c3',
      name: '\u062e\u0627\u0644\u062f \u0623\u062d\u0645\u062f',
      message: '\u0645\u0646 \u0641\u0636\u0644\u0643 \u0623\u0643\u062f \u062e\u0644\u0641\u064a\u0629 \u0627\u0644\u0647\u0627\u062a\u0641 \u062d\u062a\u0649 \u0623\u062a\u0623\u0643\u062f \u0623\u0646\u0647 \u0644\u0643.',
      time: '\u0623\u0645\u0633',
      avatarInitial: '\u062e',
      avatarColor: '#4A7FE6',
      unread: false,
    },
  ],
};

export function getConversations(language: Language) {
  return conversations[language];
}
