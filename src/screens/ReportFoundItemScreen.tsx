import React from 'react';

import { ReportItemForm } from '../components/ReportItemForm';
import { CreatePostCopy } from '../constants/createPostCopy';
import { FeedPost, Palette } from '../types';

type ReportFoundItemScreenProps = {
  copy: CreatePostCopy;
  palette: Palette;
  isArabic: boolean;
  onBack: () => void;
  onAnalyzePost: (post: FeedPost) => void;
};

export function ReportFoundItemScreen(props: ReportFoundItemScreenProps) {
  return <ReportItemForm {...props} variant="found" requireImage submitLabel={props.copy.analyzeFound} onSubmitPost={props.onAnalyzePost} />;
}
