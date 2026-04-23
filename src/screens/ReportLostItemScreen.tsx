import React from 'react';

import { ReportItemForm } from '../components/ReportItemForm';
import { CreatePostCopy } from '../constants/createPostCopy';
import { FeedPost, Palette } from '../types';

type ReportLostItemScreenProps = {
  copy: CreatePostCopy;
  palette: Palette;
  isArabic: boolean;
  isSubmitting?: boolean;
  onBack: () => void;
  onSubmitPost: (post: FeedPost) => void;
};

export function ReportLostItemScreen(props: ReportLostItemScreenProps) {
  return <ReportItemForm {...props} variant="lost" isSubmitting={props.isSubmitting} />;
}
