import { Language } from '../types';

export type CreatePostCopy = {
  title: string;
  subtitle: string;
  chooseTypeTitle: string;
  chooseTypeSubtitle: string;
  lostTitle: string;
  foundTitle: string;
  lostRouteDescription: string;
  foundRouteDescription: string;
  titleField: string;
  titlePlaceholder: string;
  categoryField: string;
  dateField: string;
  descriptionField: string;
  descriptionPlaceholder: string;
  locationField: string;
  locationPlaceholder: string;
  datePlaceholder: string;
  categoryPlaceholder: string;
  electronics: string;
  bags: string;
  documents: string;
  accessories: string;
  imageAllowed: string;
  imageAdded: string;
  imageHint: string;
  imageRequiredHint: string;
  imageMissingError: string;
  noImageTitle: string;
  noImageDescription: string;
  aiHint: string;
  submitLost: string;
  submitFound: string;
  backToCreate: string;
};

const createPostCopy: Record<Language, CreatePostCopy> = {
  en: {
    title: 'Create report',
    subtitle: 'Post a clear report so the right person notices it quickly.',
    chooseTypeTitle: 'What would you like to report?',
    chooseTypeSubtitle: 'Choose the report type and continue with the right form.',
    lostTitle: 'Lost item',
    foundTitle: 'Found item',
    lostRouteDescription: 'Use this when you lost something. A photo field will be shown in the form.',
    foundRouteDescription: 'Use this when you found something. The form stays text-only by design.',
    titleField: 'Title',
    titlePlaceholder: 'Example: Black leather wallet',
    categoryField: 'Category',
    dateField: 'Date',
    descriptionField: 'Description',
    descriptionPlaceholder: 'Describe color, brand, special marks, and where it was seen last.',
    locationField: 'Location',
    locationPlaceholder: 'Where was it lost or found?',
    datePlaceholder: 'When did it happen?',
    categoryPlaceholder: 'Choose the closest category',
    electronics: 'Electronics',
    bags: 'Bags',
    documents: 'Documents',
    accessories: 'Accessories',
    imageAllowed: 'Add image',
    imageAdded: 'Image attached',
    imageHint: 'Photos are allowed only for lost item reports.',
    imageRequiredHint: 'Add a photo placeholder before publishing this lost-item report.',
    imageMissingError: 'Image placeholder is required for lost reports.',
    noImageTitle: 'Images are disabled here',
    noImageDescription: 'Found-item reports stay text-only so only the real owner can verify the item details.',
    aiHint: 'Write the strongest identifying details first so matching is faster.',
    submitLost: 'Publish lost report',
    submitFound: 'Publish found report',
    backToCreate: 'Back to report types',
  },
  ar: {
    title: '\u0625\u0646\u0634\u0627\u0621 \u0628\u0644\u0627\u063a',
    subtitle: '\u0627\u0643\u062a\u0628 \u0628\u0644\u0627\u063a\u064b\u0627 \u0648\u0627\u0636\u062d\u064b\u0627 \u0644\u064a\u0635\u0644 \u0644\u0644\u0634\u062e\u0635 \u0627\u0644\u0635\u062d\u064a\u062d \u0628\u0633\u0631\u0639\u0629.',
    chooseTypeTitle: '\u0645\u0627 \u0646\u0648\u0639 \u0627\u0644\u0628\u0644\u0627\u063a \u0627\u0644\u0630\u064a \u062a\u0631\u064a\u062f \u0625\u0631\u0633\u0627\u0644\u0647\u061f',
    chooseTypeSubtitle: '\u0627\u062e\u062a\u0631 \u0646\u0648\u0639 \u0627\u0644\u0628\u0644\u0627\u063a \u0644\u0644\u0627\u0646\u062a\u0642\u0627\u0644 \u0625\u0644\u0649 \u0627\u0644\u0646\u0645\u0648\u0630\u062c \u0627\u0644\u0645\u0646\u0627\u0633\u0628.',
    lostTitle: '\u0639\u0646\u0635\u0631 \u0645\u0641\u0642\u0648\u062f',
    foundTitle: '\u0639\u0646\u0635\u0631 \u0645\u0639\u062b\u0648\u0631 \u0639\u0644\u064a\u0647',
    lostRouteDescription: '\u0627\u0633\u062a\u062e\u062f\u0645 \u0647\u0630\u0627 \u0627\u0644\u062e\u064a\u0627\u0631 \u0625\u0630\u0627 \u0641\u0642\u062f\u062a \u063a\u0631\u0636\u064b\u0627. \u0633\u064a\u0638\u0647\u0631 \u062d\u0642\u0644 \u0644\u0644\u0635\u0648\u0631\u0629 \u062f\u0627\u062e\u0644 \u0627\u0644\u0646\u0645\u0648\u0630\u062c.',
    foundRouteDescription: '\u0627\u0633\u062a\u062e\u062f\u0645 \u0647\u0630\u0627 \u0627\u0644\u062e\u064a\u0627\u0631 \u0625\u0630\u0627 \u0639\u062b\u0631\u062a \u0639\u0644\u0649 \u063a\u0631\u0636. \u0627\u0644\u0646\u0645\u0648\u0630\u062c \u0647\u0646\u0627 \u0646\u0635\u064a \u0641\u0642\u0637 \u0628\u0627\u0644\u062a\u0635\u0645\u064a\u0645.',
    titleField: '\u0627\u0644\u0639\u0646\u0648\u0627\u0646',
    titlePlaceholder: '\u0645\u062b\u0627\u0644: \u0645\u062d\u0641\u0638\u0629 \u062c\u0644\u062f\u064a\u0629 \u0633\u0648\u062f\u0627\u0621',
    categoryField: '\u0627\u0644\u062a\u0635\u0646\u064a\u0641',
    dateField: '\u0627\u0644\u062a\u0627\u0631\u064a\u062e',
    descriptionField: '\u0627\u0644\u0648\u0635\u0641',
    descriptionPlaceholder: '\u0627\u0643\u062a\u0628 \u0627\u0644\u0644\u0648\u0646 \u0648\u0627\u0644\u0645\u0627\u0631\u0643\u0629 \u0648\u0623\u064a \u0639\u0644\u0627\u0645\u0627\u062a \u0645\u0645\u064a\u0632\u0629 \u0648\u0622\u062e\u0631 \u0645\u0643\u0627\u0646 \u0638\u0647\u0631 \u0641\u064a\u0647.',
    locationField: '\u0627\u0644\u0645\u0648\u0642\u0639',
    locationPlaceholder: '\u0623\u064a\u0646 \u0641\u064f\u0642\u062f \u0623\u0648 \u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u064a\u0647\u061f',
    datePlaceholder: '\u0645\u062a\u0649 \u062d\u062f\u062b \u0630\u0644\u0643\u061f',
    categoryPlaceholder: '\u0627\u062e\u062a\u0631 \u0627\u0644\u062a\u0635\u0646\u064a\u0641 \u0627\u0644\u0623\u0642\u0631\u0628',
    electronics: '\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a\u0627\u062a',
    bags: '\u062d\u0642\u0627\u0626\u0628',
    documents: '\u0648\u062b\u0627\u0626\u0642',
    accessories: '\u0625\u0643\u0633\u0633\u0648\u0627\u0631\u0627\u062a',
    imageAllowed: '\u0625\u0636\u0627\u0641\u0629 \u0635\u0648\u0631\u0629',
    imageAdded: '\u062a\u0645 \u0625\u0631\u0641\u0627\u0642 \u0635\u0648\u0631\u0629',
    imageHint: '\u0627\u0644\u0635\u0648\u0631 \u0645\u0633\u0645\u0648\u062d\u0629 \u0641\u0642\u0637 \u0641\u064a \u0628\u0644\u0627\u063a\u0627\u062a \u0627\u0644\u0645\u0641\u0642\u0648\u062f\u0627\u062a.',
    imageRequiredHint: '\u0623\u0636\u0641 \u0645\u0643\u0627\u0646 \u0635\u0648\u0631\u0629 \u0642\u0628\u0644 \u0646\u0634\u0631 \u0628\u0644\u0627\u063a \u0627\u0644\u0645\u0641\u0642\u0648\u062f.',
    imageMissingError: '\u062d\u0642\u0644 \u0627\u0644\u0635\u0648\u0631\u0629 \u0645\u0637\u0644\u0648\u0628 \u0641\u064a \u0628\u0644\u0627\u063a\u0627\u062a \u0627\u0644\u0645\u0641\u0642\u0648\u062f.',
    noImageTitle: '\u0627\u0644\u0635\u0648\u0631 \u063a\u064a\u0631 \u0645\u062a\u0627\u062d\u0629 \u0647\u0646\u0627',
    noImageDescription: '\u0628\u0644\u0627\u063a\u0627\u062a \u0627\u0644\u0645\u0639\u062b\u0648\u0631 \u0639\u0644\u064a\u0647 \u062a\u0628\u0642\u0649 \u0628\u062f\u0648\u0646 \u0635\u0648\u0631 \u0644\u064a\u062a\u0645\u0643\u0646 \u0635\u0627\u062d\u0628 \u0627\u0644\u063a\u0631\u0636 \u0645\u0646 \u0625\u062b\u0628\u0627\u062a \u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644.',
    aiHint: '\u0627\u0628\u062f\u0623 \u0628\u0623\u0642\u0648\u0649 \u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0645\u0645\u064a\u0632\u0629 \u062d\u062a\u0649 \u062a\u0635\u0628\u062d \u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0629 \u0623\u0633\u0631\u0639.',
    submitLost: '\u0646\u0634\u0631 \u0628\u0644\u0627\u063a \u0645\u0641\u0642\u0648\u062f',
    submitFound: '\u0646\u0634\u0631 \u0628\u0644\u0627\u063a \u0645\u0639\u062b\u0648\u0631 \u0639\u0644\u064a\u0647',
    backToCreate: '\u0627\u0644\u0639\u0648\u062f\u0629 \u0644\u0623\u0646\u0648\u0627\u0639 \u0627\u0644\u0628\u0644\u0627\u063a',
  },
};

export function getCreatePostCopy(language: Language) {
  return createPostCopy[language];
}
