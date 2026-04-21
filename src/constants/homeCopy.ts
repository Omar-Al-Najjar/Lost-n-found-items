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
  other: string;
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
  aiHubTitle: string;
  aiHubSubtitle: string;
  aiHubPrimaryAction: string;
  aiHubSecondaryAction: string;
  aiHubRecentFound: string;
  aiHubRecentSearches: string;
  aiHubLikelyMatches: string;
  aiHubEmpty: string;
  aiSearchTitle: string;
  aiSearchSubtitle: string;
  aiSearchAction: string;
  aiSearchLikely: string;
  aiSearchPossible: string;
  aiSearchReasonLabel: string;
  aiSearchEmpty: string;
  aiSearchUnavailable: string;
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
    other: 'Other',
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
    aiHubTitle: 'Match Assistant',
    aiHubSubtitle: 'Review analyzed found items, recent searches, and possible owner matches.',
    aiHubPrimaryAction: 'Analyze found item',
    aiHubSecondaryAction: 'Search for lost item',
    aiHubRecentFound: 'Recent found-item analyses',
    aiHubRecentSearches: 'Recent lost-item searches',
    aiHubLikelyMatches: 'Likely matches',
    aiHubEmpty: 'No AI activity yet. Start by analyzing a found item or describing what you lost.',
    aiSearchTitle: 'Describe what you lost',
    aiSearchSubtitle: 'The assistant will compare your description with found-item reports and highlight the people most likely to have it.',
    aiSearchAction: 'Find possible matches',
    aiSearchLikely: 'Likely matches',
    aiSearchPossible: 'Other possible matches',
    aiSearchReasonLabel: 'Why this might match',
    aiSearchEmpty: 'No strong matches yet. Try a clearer description or add more distinctive details.',
    aiSearchUnavailable: 'AI search is unavailable right now. Add your API key to enable live matching.',
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
    other: '\u0623\u062e\u0631\u0649',
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
    aiHubTitle: '\u0645\u0633\u0627\u0639\u062f \u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0627\u062a',
    aiHubSubtitle: '\u0631\u0627\u062c\u0639 \u0627\u0644\u0639\u0646\u0627\u0635\u0631 \u0627\u0644\u0645\u062d\u0644\u0644\u0629\u060c \u0648\u0627\u0644\u0628\u062d\u0648\u062b \u0627\u0644\u0623\u062e\u064a\u0631\u0629\u060c \u0648\u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0627\u062a \u0627\u0644\u0645\u062d\u062a\u0645\u0644\u0629.',
    aiHubPrimaryAction: '\u062d\u0644\u0644 \u0639\u0646\u0635\u0631\u064b\u0627 \u0645\u0639\u062b\u0648\u0631\u064b\u0627 \u0639\u0644\u064a\u0647',
    aiHubSecondaryAction: '\u0627\u0628\u062d\u062b \u0639\u0646 \u0639\u0646\u0635\u0631 \u0645\u0641\u0642\u0648\u062f',
    aiHubRecentFound: '\u0622\u062e\u0631 \u0627\u0644\u0639\u0646\u0627\u0635\u0631 \u0627\u0644\u0645\u062d\u0644\u0644\u0629',
    aiHubRecentSearches: '\u0622\u062e\u0631 \u0639\u0645\u0644\u064a\u0627\u062a \u0628\u062d\u062b \u0639\u0646 \u0645\u0641\u0642\u0648\u062f',
    aiHubLikelyMatches: '\u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0627\u062a \u0627\u0644\u0623\u0642\u0631\u0628',
    aiHubEmpty: '\u0644\u0627 \u064a\u0648\u062c\u062f \u0646\u0634\u0627\u0637 \u0630\u0643\u064a \u0628\u0639\u062f. \u0627\u0628\u062f\u0623 \u0628\u062a\u062d\u0644\u064a\u0644 \u0639\u0646\u0635\u0631 \u0645\u0639\u062b\u0648\u0631 \u0639\u0644\u064a\u0647 \u0623\u0648 \u0627\u0643\u062a\u0628 \u0648\u0635\u0641 \u0645\u0627 \u0641\u0642\u062f\u062a\u0647.',
    aiSearchTitle: '\u0635\u0641 \u0645\u0627 \u0641\u0642\u062f\u062a\u0647 \u0628\u0643\u0644\u0645\u0627\u062a\u0643',
    aiSearchSubtitle: '\u0633\u064a\u0642\u0627\u0631\u0646 \u0627\u0644\u0645\u0633\u0627\u0639\u062f \u0648\u0635\u0641\u0643 \u0645\u0639 \u0628\u0644\u0627\u063a\u0627\u062a \u0627\u0644\u0639\u0646\u0627\u0635\u0631 \u0627\u0644\u0645\u0639\u062b\u0648\u0631 \u0639\u0644\u064a\u0647\u0627 \u0648\u064a\u0631\u0634\u062d \u0627\u0644\u0623\u0634\u062e\u0627\u0635 \u0627\u0644\u0623\u0642\u0631\u0628 \u0644\u0627\u0645\u062a\u0644\u0627\u0643\u0647\u0627.',
    aiSearchAction: '\u0627\u0639\u062b\u0631 \u0639\u0644\u0649 \u0645\u0637\u0627\u0628\u0642\u0627\u062a \u0645\u062d\u062a\u0645\u0644\u0629',
    aiSearchLikely: '\u0645\u0637\u0627\u0628\u0642\u0627\u062a \u0631\u0627\u062c\u062d\u0629',
    aiSearchPossible: '\u0645\u0637\u0627\u0628\u0642\u0627\u062a \u0645\u062d\u062a\u0645\u0644\u0629 \u0623\u062e\u0631\u0649',
    aiSearchReasonLabel: '\u0633\u0628\u0628 \u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0629',
    aiSearchEmpty: '\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0637\u0627\u0628\u0642\u0627\u062a \u0642\u0648\u064a\u0629 \u0628\u0639\u062f. \u062c\u0631\u0628 \u0648\u0635\u0641\u064b\u0627 \u0623\u0648\u0636\u062d \u0623\u0648 \u0623\u0636\u0641 \u062a\u0641\u0627\u0635\u064a\u0644 \u0645\u0645\u064a\u0632\u0629.',
    aiSearchUnavailable: '\u0628\u062d\u062b \u0627\u0644\u0645\u0633\u0627\u0639\u062f \u063a\u064a\u0631 \u0645\u062a\u0627\u062d \u062d\u0627\u0644\u064a\u064b\u0627. \u0623\u0636\u0641 \u0645\u0641\u062a\u0627\u062d API \u0644\u062a\u0641\u0639\u064a\u0644 \u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0629 \u0627\u0644\u062d\u064a\u0629.',
  },
};

export function getHomeCopy(language: Language) {
  return homeCopy[language];
}
