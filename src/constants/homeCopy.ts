import { Language } from '../types';

export type HomeCopy = {
  appName: string;
  subtitle: string;
  searchPlaceholder: string;
  searchScreenTitle: string;
  searchScreenSubtitle: string;
  searchCta: string;
  sectionTitle: string;
  all: string;
  lost: string;
  found: string;
  electronics: string;
  bags: string;
  documents: string;
  accessories: string;
  contact: string;
  viewDetails: string;
  locationLabel: string;
  dateLabel: string;
  typeLabel: string;
  statusLabel: string;
  statusOpen: string;
  statusUnderReview: string;
  statusMatched: string;
  detailsTitle: string;
  imageLabel: string;
  recent: string;
  emptyTitle: string;
  emptyDescription: string;
};

const homeCopy: Record<Language, HomeCopy> = {
  en: {
    appName: 'Lost & Found',
    subtitle: 'Find reports faster with clean filters and search.',
    searchPlaceholder: 'Search by item, place, or person...',
    searchScreenTitle: 'Search',
    searchScreenSubtitle: 'Browse reports with focused filters and clear results.',
    searchCta: 'Open search',
    sectionTitle: 'Recent reports',
    all: 'All',
    lost: 'Lost',
    found: 'Found',
    electronics: 'Electronics',
    bags: 'Bags',
    documents: 'Documents',
    accessories: 'Accessories',
    contact: 'Contact owner',
    viewDetails: 'View details',
    locationLabel: 'Location',
    dateLabel: 'Date',
    typeLabel: 'Type',
    statusLabel: 'Status',
    statusOpen: 'Open',
    statusUnderReview: 'Under review',
    statusMatched: 'Matched',
    detailsTitle: 'Item details',
    imageLabel: 'Image preview',
    recent: 'Recent',
    emptyTitle: 'No matching reports',
    emptyDescription: 'Try another search word or switch your filters.',
  },
  ar: {
    appName: '\u0627\u0644\u0645\u0641\u0642\u0648\u062f\u0627\u062a \u0648\u0627\u0644\u0645\u0648\u062c\u0648\u062f\u0627\u062a',
    subtitle: '\u0627\u0628\u062d\u062b \u0628\u0633\u0631\u0639\u0629 \u0628\u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0627\u0644\u0628\u062d\u062b \u0648\u0627\u0644\u0641\u0644\u0627\u062a\u0631 \u0627\u0644\u0648\u0627\u0636\u062d\u0629.',
    searchPlaceholder: '\u0627\u0628\u062d\u062b \u0628\u0627\u0633\u0645 \u0627\u0644\u0639\u0646\u0635\u0631 \u0623\u0648 \u0627\u0644\u0645\u0643\u0627\u0646 \u0623\u0648 \u0627\u0644\u0634\u062e\u0635...',
    searchScreenTitle: '\u0627\u0644\u0628\u062d\u062b',
    searchScreenSubtitle: '\u062a\u0635\u0641\u062d \u0627\u0644\u0628\u0644\u0627\u063a\u0627\u062a \u0628\u0641\u0644\u0627\u062a\u0631 \u0648\u0627\u0636\u062d\u0629 \u0648\u0646\u062a\u0627\u0626\u062c \u0633\u0647\u0644\u0629.',
    searchCta: '\u0641\u062a\u062d \u0627\u0644\u0628\u062d\u062b',
    sectionTitle: '\u0623\u062d\u062f\u062b \u0627\u0644\u0628\u0644\u0627\u063a\u0627\u062a',
    all: '\u0627\u0644\u0643\u0644',
    lost: '\u0645\u0641\u0642\u0648\u062f',
    found: '\u0645\u0639\u062b\u0648\u0631 \u0639\u0644\u064a\u0647',
    electronics: '\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a\u0627\u062a',
    bags: '\u062d\u0642\u0627\u0626\u0628',
    documents: '\u0648\u062b\u0627\u0626\u0642',
    accessories: '\u0645\u0644\u062d\u0642\u0627\u062a',
    contact: '\u062a\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u0635\u0627\u062d\u0628',
    viewDetails: '\u0639\u0631\u0636 \u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644',
    locationLabel: '\u0627\u0644\u0645\u0648\u0642\u0639',
    dateLabel: '\u0627\u0644\u062a\u0627\u0631\u064a\u062e',
    typeLabel: '\u0627\u0644\u0646\u0648\u0639',
    statusLabel: '\u0627\u0644\u062d\u0627\u0644\u0629',
    statusOpen: '\u0645\u0641\u062a\u0648\u062d',
    statusUnderReview: '\u0642\u064a\u062f \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629',
    statusMatched: '\u062a\u0645 \u0631\u0635\u062f \u0645\u0637\u0627\u0628\u0642\u0629',
    detailsTitle: '\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0639\u0646\u0635\u0631',
    imageLabel: '\u0645\u0639\u0627\u064a\u0646\u0629 \u0627\u0644\u0635\u0648\u0631\u0629',
    recent: '\u062d\u062f\u064a\u062b',
    emptyTitle: '\u0644\u0627 \u062a\u0648\u062c\u062f \u0628\u0644\u0627\u063a\u0627\u062a \u0645\u0637\u0627\u0628\u0642\u0629',
    emptyDescription: '\u062c\u0631\u0628 \u0643\u0644\u0645\u0629 \u0628\u062d\u062b \u0623\u062e\u0631\u0649 \u0623\u0648 \u063a\u064a\u0631 \u0627\u0644\u0641\u0644\u0627\u062a\u0631.',
  },
};

export function getHomeCopy(language: Language) {
  return homeCopy[language];
}
