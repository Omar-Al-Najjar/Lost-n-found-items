import { Language } from '../types';

type HomeFeedItemBase = {
  id: string;
  userId?: string;
  title: string;
  description: string;
  image?: string;
  location: string;
  time: string;
  contactName: string;
  category: 'electronics' | 'bags' | 'documents' | 'accessories' | 'other';
  status?: 'open' | 'underReview' | 'matched';
};

export type HomeFeedItem =
  | (HomeFeedItemBase & {
      type: 'lost';
    })
  | (HomeFeedItemBase & {
      type: 'found';
    });

const feedData: Record<Language, HomeFeedItem[]> = {
  en: [
    {
      id: 'p1',
      type: 'lost',
      title: 'Black leather wallet',
      description: 'Lost near the main university gate. It contains ID cards and bank cards.',
      location: 'University Gate',
      time: '2 hours ago',
      contactName: 'Ahmed Mohammad',
      category: 'documents',
      status: 'matched',
      image: 'wallet-placeholder',
    },
    {
      id: 'p2',
      type: 'found',
      title: 'Toyota car keys',
      description: 'Found in the City Mall parking area with a silver star keychain.',
      location: 'City Mall',
      time: '5 hours ago',
      contactName: 'Sara Ali',
      category: 'accessories',
      status: 'underReview',
    },
    {
      id: 'p3',
      type: 'lost',
      title: 'iPhone 14 Pro',
      description: 'Blue phone with a transparent case and university sticker on the back.',
      location: 'Business School',
      time: 'Yesterday',
      contactName: 'Khaled Ahmad',
      category: 'electronics',
      status: 'open',
      image: 'phone-placeholder',
    },
    {
      id: 'p4',
      type: 'found',
      title: 'Grey backpack',
      description: 'Medium size backpack with notebooks and a water bottle inside.',
      location: 'Library Entrance',
      time: '1 day ago',
      contactName: 'Nour Hani',
      category: 'bags',
      status: 'open',
    },
  ],
  ar: [
    {
      id: 'p1',
      type: 'lost',
      title: '\u0645\u062d\u0641\u0638\u0629 \u062c\u0644\u062f\u064a\u0629 \u0633\u0648\u062f\u0627\u0621',
      description: '\u0641\u064f\u0642\u062f\u062a \u0642\u0631\u0628 \u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u062c\u0627\u0645\u0639\u0629 \u0648\u0628\u062f\u0627\u062e\u0644\u0647\u0627 \u0628\u0637\u0627\u0642\u0627\u062a \u0634\u062e\u0635\u064a\u0629 \u0648\u0628\u0646\u0643\u064a\u0629.',
      location: '\u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u062c\u0627\u0645\u0639\u0629',
      time: '\u0642\u0628\u0644 \u0633\u0627\u0639\u062a\u064a\u0646',
      contactName: '\u0623\u062d\u0645\u062f \u0645\u062d\u0645\u062f',
      category: 'documents',
      status: 'matched',
      image: 'wallet-placeholder',
    },
    {
      id: 'p2',
      type: 'found',
      title: '\u0645\u0641\u0627\u062a\u064a\u062d \u0633\u064a\u0627\u0631\u0629 \u062a\u0648\u064a\u0648\u062a\u0627',
      description: '\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u064a\u0647\u0627 \u0641\u064a \u0645\u0648\u0642\u0641 \u0633\u064a\u062a\u064a \u0645\u0648\u0644 \u0645\u0639 \u0645\u064a\u062f\u0627\u0644\u064a\u0629 \u0639\u0644\u0649 \u0634\u0643\u0644 \u0646\u062c\u0645\u0629.',
      location: '\u0633\u064a\u062a\u064a \u0645\u0648\u0644',
      time: '\u0642\u0628\u0644 5 \u0633\u0627\u0639\u0627\u062a',
      contactName: '\u0633\u0627\u0631\u0629 \u0639\u0644\u064a',
      category: 'accessories',
      status: 'underReview',
    },
    {
      id: 'p3',
      type: 'lost',
      title: '\u0622\u064a\u0641\u0648\u0646 14 \u0628\u0631\u0648',
      description: '\u0647\u0627\u062a\u0641 \u0623\u0632\u0631\u0642 \u0645\u0639 \u063a\u0637\u0627\u0621 \u0634\u0641\u0627\u0641 \u0648\u0645\u0644\u0635\u0642 \u062c\u0627\u0645\u0639\u064a \u0641\u064a \u0627\u0644\u062e\u0644\u0641.',
      location: '\u0643\u0644\u064a\u0629 \u0627\u0644\u0625\u062f\u0627\u0631\u0629',
      time: '\u0623\u0645\u0633',
      contactName: '\u062e\u0627\u0644\u062f \u0623\u062d\u0645\u062f',
      category: 'electronics',
      status: 'open',
      image: 'phone-placeholder',
    },
    {
      id: 'p4',
      type: 'found',
      title: '\u062d\u0642\u064a\u0628\u0629 \u0638\u0647\u0631 \u0631\u0645\u0627\u062f\u064a\u0629',
      description: '\u062d\u0642\u064a\u0628\u0629 \u0645\u062a\u0648\u0633\u0637\u0629 \u0628\u062f\u0627\u062e\u0644\u0647\u0627 \u062f\u0641\u0627\u062a\u0631 \u0648\u0632\u062c\u0627\u062c\u0629 \u0645\u064a\u0627\u0647.',
      location: '\u0645\u062f\u062e\u0644 \u0627\u0644\u0645\u0643\u062a\u0628\u0629',
      time: '\u0642\u0628\u0644 \u064a\u0648\u0645',
      contactName: '\u0646\u0648\u0631 \u0647\u0627\u0646\u064a',
      category: 'bags',
      status: 'open',
    },
  ],
};

export function getHomeFeed(language: Language) {
  return feedData[language];
}
