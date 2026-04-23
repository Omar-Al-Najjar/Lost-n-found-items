import React from 'react';

import { ReportItemForm } from '../components/ReportItemForm';
import { CreatePostCopy } from '../constants/createPostCopy';
import { FeedPost, Palette } from '../types';

type ReportFoundItemScreenProps = {
  copy: CreatePostCopy;
  palette: Palette;
  isArabic: boolean;
  isSubmitting?: boolean;
  onBack: () => void;
  onSubmitPost: (post: FeedPost) => void;
};

export function ReportFoundItemScreen(props: ReportFoundItemScreenProps) {
  return <ReportItemForm {...props} variant="found" allowImageUpload={false} isSubmitting={props.isSubmitting} />;
}
