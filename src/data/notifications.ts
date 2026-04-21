import { Language, NotificationItem } from '../types';

const notificationsData: Record<Language, NotificationItem[]> = {
  en: [
    {
      id: 'n1',
      category: 'match',
      title: 'Possible match found for your wallet report',
      body: 'A black wallet was reported near the university gate. Review the details to confirm.',
      time: '8 min ago',
      unread: true,
      relatedPostId: 'mr1',
    },
    {
      id: 'n2',
      category: 'message',
      title: 'Sara Ali replied to your found keys report',
      body: 'She asked whether the silver star keychain is still attached.',
      time: '42 min ago',
      unread: true,
      relatedPostId: 'mr2',
    },
    {
      id: 'n3',
      category: 'status',
      title: 'Your backpack report is gaining views',
      body: 'More people near the library have viewed your report in the last day.',
      time: 'Yesterday',
      unread: false,
      relatedPostId: 'mr3',
    },
  ],
  ar: [
    {
      id: 'n1',
      category: 'match',
      title: '\u062a\u0645 \u0631\u0635\u062f \u0645\u0637\u0627\u0628\u0642\u0629 \u0645\u062d\u062a\u0645\u0644\u0629 \u0644\u0628\u0644\u0627\u063a \u0627\u0644\u0645\u062d\u0641\u0638\u0629',
      body: '\u062a\u0645 \u0627\u0644\u0625\u0628\u0644\u0627\u063a \u0639\u0646 \u0645\u062d\u0641\u0638\u0629 \u0633\u0648\u062f\u0627\u0621 \u0642\u0631\u0628 \u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u062c\u0627\u0645\u0639\u0629. \u0631\u0627\u062c\u0639 \u0627\u0644\u0628\u0644\u0627\u063a \u0644\u0644\u062a\u0623\u0643\u062f.',
      time: '\u0642\u0628\u0644 8 \u062f\u0642\u0627\u0626\u0642',
      unread: true,
      relatedPostId: 'mr1',
    },
    {
      id: 'n2',
      category: 'message',
      title: '\u0633\u0627\u0631\u0629 \u0639\u0644\u064a \u0631\u062f\u062a \u0639\u0644\u0649 \u0628\u0644\u0627\u063a \u0627\u0644\u0645\u0641\u0627\u062a\u064a\u062d',
      body: '\u0633\u0623\u0644\u062a \u0639\u0645\u0627 \u0625\u0630\u0627 \u0643\u0627\u0646\u062a \u0627\u0644\u0645\u064a\u062f\u0627\u0644\u064a\u0629 \u0627\u0644\u0641\u0636\u064a\u0629 \u0645\u0627 \u0632\u0627\u0644\u062a \u0645\u0639 \u0627\u0644\u0645\u0641\u0627\u062a\u064a\u062d.',
      time: '\u0642\u0628\u0644 42 \u062f\u0642\u064a\u0642\u0629',
      unread: true,
      relatedPostId: 'mr2',
    },
    {
      id: 'n3',
      category: 'status',
      title: '\u0628\u0644\u0627\u063a \u062d\u0642\u064a\u0628\u062a\u0643 \u064a\u062d\u0635\u0644 \u0639\u0644\u0649 \u0645\u0634\u0627\u0647\u062f\u0627\u062a \u0623\u0643\u062b\u0631',
      body: '\u0634\u0627\u0647\u062f \u0627\u0644\u0645\u0632\u064a\u062f \u0645\u0646 \u0627\u0644\u0623\u0634\u062e\u0627\u0635 \u0642\u0631\u0628 \u0627\u0644\u0645\u0643\u062a\u0628\u0629 \u0628\u0644\u0627\u063a\u0643 \u062e\u0644\u0627\u0644 \u0627\u0644\u064a\u0648\u0645 \u0627\u0644\u0645\u0627\u0636\u064a.',
      time: '\u0623\u0645\u0633',
      unread: false,
      relatedPostId: 'mr3',
    },
  ],
};

export function getNotifications(language: Language) {
  return notificationsData[language];
}
