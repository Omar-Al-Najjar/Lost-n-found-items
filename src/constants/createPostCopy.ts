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
  other: string;
  imageAllowed: string;
  imageAdded: string;
  imageHint: string;
  imageRequiredHint: string;
  imageMissingError: string;
  noImageTitle: string;
  noImageDescription: string;
  aiHint: string;
  analyzeFound: string;
  analyzeFoundLoading: string;
  foundImageRequiredTitle: string;
  foundImageRequiredDescription: string;
  reviewTitle: string;
  reviewSubtitle: string;
  aiSuggestedTitle: string;
  aiSuggestedSummary: string;
  aiSuggestedBrand: string;
  aiSuggestedColor: string;
  aiSuggestedMaterial: string;
  aiSuggestedFeatures: string;
  publishReviewedFound: string;
  publishReviewedFoundLoading: string;
  submitLost: string;
  submitLostLoading: string;
  submitFound: string;
  submitFoundLoading: string;
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
    lostRouteDescription: 'Use this when you lost something. You can describe the item and search for likely finders.',
    foundRouteDescription: 'Use this when you found something. This posting form is text-only and does not upload photos.',
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
    other: 'Other',
    imageAllowed: 'Add image',
    imageAdded: 'Image attached',
    imageHint: 'Photos are optional, but adding one can help identify the item faster.',
    imageRequiredHint: 'Adding a photo helps matching quality, but you can still publish without one.',
    imageMissingError: 'Image selection failed. Please try again.',
    noImageTitle: 'Photo selection issue',
    noImageDescription: 'If photo selection fails, you can continue posting without an image.',
    aiHint: 'Write the strongest identifying details first so matching is faster.',
    analyzeFound: 'Analyze this item',
    analyzeFoundLoading: 'Analyzing...',
    foundImageRequiredTitle: 'Photo required',
    foundImageRequiredDescription: 'Upload a clear photo so the assistant can analyze the item before publishing.',
    reviewTitle: 'Review AI suggestions',
    reviewSubtitle: 'Edit anything you want before publishing the found-item report.',
    aiSuggestedTitle: 'Suggested title',
    aiSuggestedSummary: 'Suggested summary',
    aiSuggestedBrand: 'Brand',
    aiSuggestedColor: 'Main color',
    aiSuggestedMaterial: 'Material',
    aiSuggestedFeatures: 'Distinctive features',
    publishReviewedFound: 'Publish reviewed found report',
    publishReviewedFoundLoading: 'Publishing...',
    submitLost: 'Publish lost report',
    submitLostLoading: 'Publishing...',
    submitFound: 'Publish found report',
    submitFoundLoading: 'Publishing...',
    backToCreate: 'Back to report types',
  },
  ar: {
    title: '\u0625\u0646\u0634\u0627\u0621 \u0628\u0644\u0627\u063a',
    subtitle: '\u0627\u0643\u062a\u0628 \u0628\u0644\u0627\u063a\u064b\u0627 \u0648\u0627\u0636\u062d\u064b\u0627 \u0644\u064a\u0635\u0644 \u0644\u0644\u0634\u062e\u0635 \u0627\u0644\u0635\u062d\u064a\u062d \u0628\u0633\u0631\u0639\u0629.',
    chooseTypeTitle: '\u0645\u0627 \u0646\u0648\u0639 \u0627\u0644\u0628\u0644\u0627\u063a \u0627\u0644\u0630\u064a \u062a\u0631\u064a\u062f \u0625\u0631\u0633\u0627\u0644\u0647\u061f',
    chooseTypeSubtitle: '\u0627\u062e\u062a\u0631 \u0646\u0648\u0639 \u0627\u0644\u0628\u0644\u0627\u063a \u0644\u0644\u0627\u0646\u062a\u0642\u0627\u0644 \u0625\u0644\u0649 \u0627\u0644\u0646\u0645\u0648\u0630\u062c \u0627\u0644\u0645\u0646\u0627\u0633\u0628.',
    lostTitle: '\u0639\u0646\u0635\u0631 \u0645\u0641\u0642\u0648\u062f',
    foundTitle: '\u0639\u0646\u0635\u0631 \u0645\u0639\u062b\u0648\u0631 \u0639\u0644\u064a\u0647',
    lostRouteDescription: '\u0627\u0633\u062a\u062e\u062f\u0645 \u0647\u0630\u0627 \u0627\u0644\u062e\u064a\u0627\u0631 \u0625\u0630\u0627 \u0641\u0642\u062f\u062a \u063a\u0631\u0636\u064b\u0627. \u0635\u0641 \u0627\u0644\u0639\u0646\u0635\u0631 \u0648\u0627\u0628\u062d\u062b \u0639\u0646 \u0623\u0642\u0631\u0628 \u0627\u0644\u0623\u0634\u062e\u0627\u0635 \u0627\u0644\u0630\u064a\u0646 \u0642\u062f \u064a\u0643\u0648\u0646\u0648\u0646 \u0648\u062c\u062f\u0648\u0647.',
    foundRouteDescription: '\u0627\u0633\u062a\u062e\u062f\u0645 \u0647\u0630\u0627 \u0627\u0644\u062e\u064a\u0627\u0631 \u0625\u0630\u0627 \u0639\u062b\u0631\u062a \u0639\u0644\u0649 \u063a\u0631\u0636. \u0646\u0645\u0648\u0630\u062c \u0627\u0644\u0646\u0634\u0631 \u0647\u0646\u0627 \u0646\u0635\u064a \u0641\u0642\u0637 \u0648\u0644\u0627 \u064a\u0631\u0641\u0639 \u0635\u0648\u0631\u064b\u0627.',
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
    other: '\u0623\u062e\u0631\u0649',
    imageAllowed: '\u0625\u0636\u0627\u0641\u0629 \u0635\u0648\u0631\u0629',
    imageAdded: '\u062a\u0645 \u0625\u0631\u0641\u0627\u0642 \u0635\u0648\u0631\u0629',
    imageHint: '\u0627\u0644\u0635\u0648\u0631 \u0627\u062e\u062a\u064a\u0627\u0631\u064a\u0629\u060c \u0648\u0625\u0636\u0627\u0641\u062a\u0647\u0627 \u0642\u062f \u062a\u0633\u0627\u0639\u062f \u0641\u064a \u0627\u0644\u062a\u0639\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0639\u0646\u0635\u0631 \u0628\u0633\u0631\u0639\u0629.',
    imageRequiredHint: '\u0625\u0636\u0627\u0641\u0629 \u0635\u0648\u0631\u0629 \u062a\u0633\u0627\u0639\u062f \u0641\u064a \u062a\u062d\u0633\u064a\u0646 \u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0629\u060c \u0644\u0643\u0646 \u064a\u0645\u0643\u0646\u0643 \u0627\u0644\u0646\u0634\u0631 \u0628\u062f\u0648\u0646\u0647\u0627.',
    imageMissingError: '\u0641\u0634\u0644 \u0627\u062e\u062a\u064a\u0627\u0631 \u0627\u0644\u0635\u0648\u0631\u0629. \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.',
    noImageTitle: '\u0645\u0634\u0643\u0644\u0629 \u0641\u064a \u0627\u062e\u062a\u064a\u0627\u0631 \u0627\u0644\u0635\u0648\u0631\u0629',
    noImageDescription: '\u0625\u0630\u0627 \u0641\u0634\u0644 \u0627\u062e\u062a\u064a\u0627\u0631 \u0627\u0644\u0635\u0648\u0631\u0629\u060c \u064a\u0645\u0643\u0646\u0643 \u0645\u062a\u0627\u0628\u0639\u0629 \u0627\u0644\u0646\u0634\u0631 \u0628\u062f\u0648\u0646 \u0635\u0648\u0631\u0629.',
    aiHint: '\u0627\u0628\u062f\u0623 \u0628\u0623\u0642\u0648\u0649 \u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0645\u0645\u064a\u0632\u0629 \u062d\u062a\u0649 \u062a\u0635\u0628\u062d \u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0629 \u0623\u0633\u0631\u0639.',
    analyzeFound: '\u062d\u0644\u0644 \u0647\u0630\u0627 \u0627\u0644\u0639\u0646\u0635\u0631',
    analyzeFoundLoading: '\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u0644\u064a\u0644...',
    foundImageRequiredTitle: '\u0627\u0644\u0635\u0648\u0631\u0629 \u0645\u0637\u0644\u0648\u0628\u0629',
    foundImageRequiredDescription: '\u0627\u0631\u0641\u0639 \u0635\u0648\u0631\u0629 \u0648\u0627\u0636\u062d\u0629 \u062d\u062a\u0649 \u064a\u062d\u0644\u0644 \u0627\u0644\u0645\u0633\u0627\u0639\u062f \u0627\u0644\u0639\u0646\u0635\u0631 \u0642\u0628\u0644 \u0627\u0644\u0646\u0634\u0631.',
    reviewTitle: '\u0631\u0627\u062c\u0639 \u0627\u0642\u062a\u0631\u0627\u062d\u0627\u062a \u0627\u0644\u0645\u0633\u0627\u0639\u062f',
    reviewSubtitle: '\u0639\u062f\u0651\u0644 \u0623\u064a \u062a\u0641\u0635\u064a\u0644 \u0642\u0628\u0644 \u0646\u0634\u0631 \u0628\u0644\u0627\u063a \u0627\u0644\u0639\u0646\u0635\u0631 \u0627\u0644\u0645\u0639\u062b\u0648\u0631 \u0639\u0644\u064a\u0647.',
    aiSuggestedTitle: '\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0645\u0642\u062a\u0631\u062d',
    aiSuggestedSummary: '\u0627\u0644\u0645\u0644\u062e\u0635 \u0627\u0644\u0645\u0642\u062a\u0631\u062d',
    aiSuggestedBrand: '\u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629',
    aiSuggestedColor: '\u0627\u0644\u0644\u0648\u0646 \u0627\u0644\u0631\u0626\u064a\u0633\u064a',
    aiSuggestedMaterial: '\u0627\u0644\u062e\u0627\u0645\u0629',
    aiSuggestedFeatures: '\u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0645\u0645\u064a\u0632\u0629',
    publishReviewedFound: '\u0627\u0646\u0634\u0631 \u0627\u0644\u0628\u0644\u0627\u063a \u0628\u0639\u062f \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629',
    publishReviewedFoundLoading: '\u062c\u0627\u0631\u064d \u0627\u0644\u0646\u0634\u0631...',
    submitLost: '\u0646\u0634\u0631 \u0628\u0644\u0627\u063a \u0645\u0641\u0642\u0648\u062f',
    submitLostLoading: '\u062c\u0627\u0631\u064d \u0627\u0644\u0646\u0634\u0631...',
    submitFound: '\u0646\u0634\u0631 \u0628\u0644\u0627\u063a \u0645\u0639\u062b\u0648\u0631 \u0639\u0644\u064a\u0647',
    submitFoundLoading: '\u062c\u0627\u0631\u064d \u0627\u0644\u0646\u0634\u0631...',
    backToCreate: '\u0627\u0644\u0639\u0648\u062f\u0629 \u0644\u0623\u0646\u0648\u0627\u0639 \u0627\u0644\u0628\u0644\u0627\u063a',
  },
};

export function getCreatePostCopy(language: Language) {
  return createPostCopy[language];
}
