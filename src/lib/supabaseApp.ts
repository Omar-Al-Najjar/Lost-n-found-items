import * as FileSystem from 'expo-file-system/legacy';
import { toByteArray } from 'base64-js';

import { ChatMessage, ChatPreview, Language, MyReportItem, NotificationItem, SelectedImage, AiFoundAnalysis, FeedPost } from '../types';
import { HomeFeedItem } from '../data/homeFeed';
import { supabase } from '../supabase';

type FeedRow = {
  id: string;
  user_id: string;
  type: 'lost' | 'found';
  status: 'draft' | 'active' | 'resolved' | 'archived' | 'removed';
  title: string | null;
  summary: string | null;
  category: HomeFeedItem['category'];
  city_slug: string;
  region_slug: string | null;
  public_location_label: string | null;
  primary_image_path: string | null;
  posted_at: string;
  user_display_name: string | null;
};

type MyPostRow = {
  id: string;
  type: 'lost' | 'found';
  status: 'draft' | 'active' | 'resolved' | 'archived' | 'removed';
  generated_title: string | null;
  generated_summary: string | null;
  user_description: string;
  category: HomeFeedItem['category'];
  city_slug: string;
  region_slug: string | null;
  public_location_label: string | null;
  primary_image_path: string | null;
  posted_at: string;
  message_count: number;
  last_message_at: string | null;
};

type NotificationRow = {
  id: string;
  title: string;
  body: string;
  type: 'match' | 'message' | 'status' | 'system';
  is_read: boolean;
  related_post_id: string | null;
  created_at: string;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
  avatar_path: string | null;
};

type ConversationRow = {
  conversation_id: string;
  context_post_id: string | null;
  other_user_id: string | null;
  other_display_name: string | null;
  other_last_seen_at: string | null;
  latest_message_body: string | null;
  latest_message_created_at: string | null;
  last_message_at: string | null;
  unread_count: number;
};

type MessageRow = {
  id: string;
  body: string;
  sender_user_id: string;
  created_at: string;
  type: 'text' | 'system' | 'image';
  image_path: string | null;
};

export type AppBootstrapData = {
  posts: HomeFeedItem[];
  reports: MyReportItem[];
  notifications: NotificationItem[];
  chats: ChatPreview[];
};

export type CurrentUserProfile = {
  displayName: string | null;
  avatarPath: string | null;
  avatarUrl: string | null;
};

export type CreatePostInput = {
  userId: string;
  type: 'lost' | 'found';
  title: string;
  description: string;
  location: string;
  category: HomeFeedItem['category'];
  image?: SelectedImage | null;
  aiAnalysis?: AiFoundAnalysis | null;
  existingImageStoragePath?: string | null;
  matchTextEn?: string | null;
  matchKeywordsEn?: string[];
  matchLocationEn?: string | null;
};

export type SaveAnalyzedFoundItemInput = {
  userId: string;
  title: string;
  summary: string;
  description: string;
  location: string;
  category: HomeFeedItem['category'];
  image: SelectedImage;
  existingImageStoragePath?: string | null;
  aiAnalysis: AiFoundAnalysis;
};

const fallbackText = {
  en: {
    unknownUser: 'Community member',
    you: 'You',
    untitled: 'Lost and found item',
    justNow: 'Just now',
    noMessages: 'No messages yet',
    unknownLocation: 'Unknown location',
  },
  ar: {
    unknownUser: 'أحد أفراد المجتمع',
    you: 'أنت',
    untitled: 'عنصر مفقود أو معثور عليه',
    justNow: 'الآن',
    noMessages: 'لا توجد رسائل بعد',
    unknownLocation: 'موقع غير معروف',
  },
} as const;

const IMAGE_MESSAGE_PLACEHOLDER = '[image]';
const ONLINE_THRESHOLD_MINUTES = 2;
const IMAGE_PREVIEW_TEXT = 'Image';
const nonSlugCharsPattern = (() => {
  try {
    return new RegExp('[^\\p{L}\\p{N}]+', 'gu');
  } catch {
    return /[^a-z0-9]+/g;
  }
})();

function assertNoError(error: { message: string } | null) {
  if (error) {
    throw new Error(error.message);
  }
}

function slugify(value: string) {
  const slug = value
    .trim()
    .normalize('NFKC')
    .toLowerCase()
    .replace(nonSlugCharsPattern, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'unknown';
}

function formatRelativeDate(value: string | null, language: Language) {
  if (!value) {
    return fallbackText[language].justNow;
  }

  const diffMinutes = Math.round((new Date(value).getTime() - Date.now()) / 60000);
  const absMinutes = Math.abs(diffMinutes);
  const RelativeTimeFormatCtor =
    typeof Intl !== 'undefined' && 'RelativeTimeFormat' in Intl ? Intl.RelativeTimeFormat : null;

  if (!RelativeTimeFormatCtor) {
    if (absMinutes < 1) return fallbackText[language].justNow;
    if (absMinutes < 60) {
      return language === 'ar'
        ? `قبل ${absMinutes} دقيقة`
        : `${absMinutes} minute${absMinutes === 1 ? '' : 's'} ago`;
    }

    const absHours = Math.round(absMinutes / 60);
    if (absHours < 24) {
      return language === 'ar'
        ? `قبل ${absHours} ساعة`
        : `${absHours} hour${absHours === 1 ? '' : 's'} ago`;
    }

    const absDays = Math.round(absHours / 24);
    return language === 'ar'
      ? `قبل ${absDays} يوم`
      : `${absDays} day${absDays === 1 ? '' : 's'} ago`;
  }

  const rtf = new RelativeTimeFormatCtor(language === 'ar' ? 'ar' : 'en', {
    numeric: 'auto',
  });

  if (absMinutes < 1) return fallbackText[language].justNow;
  if (absMinutes < 60) return rtf.format(diffMinutes, 'minute');

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour');

  const diffDays = Math.round(diffHours / 24);
  return rtf.format(diffDays, 'day');
}

function isUserOnline(lastSeenAt: string | null) {
  if (!lastSeenAt) return false;
  const lastSeen = new Date(lastSeenAt).getTime();
  if (Number.isNaN(lastSeen)) return false;
  return Date.now() - lastSeen <= ONLINE_THRESHOLD_MINUTES * 60 * 1000;
}

function buildAvatarColor(seed: string) {
  const colors = ['#D95C63', '#6FAE3C', '#4A7FE6', '#D49728', '#8E63D9'];
  const hash = seed.split('').reduce((total, char) => total + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

function generateUuid() {
  const cryptoObject = globalThis.crypto as { randomUUID?: () => string } | undefined;
  if (cryptoObject?.randomUUID) {
    return cryptoObject.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function mapFeedStatus(status: FeedRow['status']): HomeFeedItem['status'] {
  if (status === 'resolved') return 'matched';
  if (status === 'draft' || status === 'archived') return 'underReview';
  return 'open';
}

function createSafeFileName(image: SelectedImage, postId: string) {
  const originalName = image.fileName?.trim();
  const extensionFromMime = image.mimeType?.split('/')[1]?.toLowerCase();
  const extensionFromName = originalName?.includes('.') ? originalName.split('.').pop()?.toLowerCase() : null;
  const extension = extensionFromName || extensionFromMime || 'jpg';
  const baseName = originalName
    ? originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    : `post-${postId}`;

  return `${baseName || `post-${postId}`}.${extension}`;
}

function createDraftFileName(image: SelectedImage) {
  const originalName = image.fileName?.trim();
  const extensionFromMime = image.mimeType?.split('/')[1]?.toLowerCase();
  const extensionFromName = originalName?.includes('.') ? originalName.split('.').pop()?.toLowerCase() : null;
  const extension = extensionFromName || extensionFromMime || 'jpg';
  const baseName = originalName
    ? originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    : 'draft-image';

  return `${baseName || 'draft-image'}-${generateUuid()}.${extension}`;
}

function createMessageImageFileName(image: SelectedImage) {
  const originalName = image.fileName?.trim();
  const extensionFromMime = image.mimeType?.split('/')[1]?.toLowerCase();
  const extensionFromName = originalName?.includes('.') ? originalName.split('.').pop()?.toLowerCase() : null;
  const extension = extensionFromName || extensionFromMime || 'jpg';
  const baseName = originalName
    ? originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    : 'chat-image';

  return `${baseName || 'chat-image'}-${generateUuid()}.${extension}`;
}

function createAvatarFileName(image: SelectedImage) {
  const originalName = image.fileName?.trim();
  const extensionFromMime = image.mimeType?.split('/')[1]?.toLowerCase();
  const extensionFromName = originalName?.includes('.') ? originalName.split('.').pop()?.toLowerCase() : null;
  const extension = extensionFromName || extensionFromMime || 'jpg';
  return `avatar-${generateUuid()}.${extension}`;
}

async function uploadPostImage(postId: string, userId: string, image: SelectedImage) {
  const fileName = createSafeFileName(image, postId);
  const storagePath = `${userId}/${postId}/${fileName}`;
  const arrayBuffer = await readImageArrayBuffer(image.uri);

  const uploadResult = await supabase.storage.from('post-images').upload(storagePath, new Uint8Array(arrayBuffer), {
    contentType: image.mimeType ?? 'image/jpeg',
    upsert: false,
  });

  assertNoError(uploadResult.error);

  const postImageResult = await supabase.from('post_images').insert({
    id: generateUuid(),
    post_id: postId,
    user_id: userId,
    storage_path: storagePath,
    image_role: 'primary',
    position: 0,
    width: image.width ?? null,
    height: image.height ?? null,
    mime_type: image.mimeType ?? null,
    file_size_bytes: image.fileSize ?? null,
  });

  assertNoError(postImageResult.error);
  return storagePath;
}

async function attachExistingPostImage(postId: string, userId: string, storagePath: string, image?: SelectedImage | null) {
  const postImageResult = await supabase.from('post_images').insert({
    id: generateUuid(),
    post_id: postId,
    user_id: userId,
    storage_path: storagePath,
    image_role: 'primary',
    position: 0,
    width: image?.width ?? null,
    height: image?.height ?? null,
    mime_type: image?.mimeType ?? null,
    file_size_bytes: image?.fileSize ?? null,
  });

  assertNoError(postImageResult.error);
  return storagePath;
}

export async function uploadDraftPostImage(userId: string, image: SelectedImage) {
  const fileName = createDraftFileName(image);
  const storagePath = `${userId}/drafts/${fileName}`;
  const arrayBuffer = await readImageArrayBuffer(image.uri);

  const uploadResult = await supabase.storage.from('post-images').upload(storagePath, new Uint8Array(arrayBuffer), {
    contentType: image.mimeType ?? 'image/jpeg',
    upsert: false,
  });

  assertNoError(uploadResult.error);

  const signedUrlResult = await supabase.storage.from('post-images').createSignedUrl(storagePath, 60 * 60);
  assertNoError(signedUrlResult.error);

  if (!signedUrlResult.data?.signedUrl) {
    throw new Error('Failed to create a signed URL for the draft image.');
  }

  return {
    storagePath,
    signedUrl: signedUrlResult.data.signedUrl,
  };
}

async function readImageArrayBuffer(uri: string) {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const bytes = toByteArray(base64);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

async function buildSignedImageUrlMap(paths: Array<string | null | undefined>, bucket = 'post-images') {
  const uniquePaths = [...new Set(paths.filter((path): path is string => Boolean(path)))];
  const signedPairs = await Promise.all(
    uniquePaths.map(async (path) => {
      const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60);
      if (error || !data?.signedUrl) {
        return [path, undefined] as const;
      }

      return [path, data.signedUrl] as const;
    })
  );

  return new Map<string, string>(signedPairs.filter((pair): pair is readonly [string, string] => Boolean(pair[1])));
}

async function buildSignedImageUrl(path: string | null | undefined, bucket: string) {
  if (!path) return null;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60);
  if (error || !data?.signedUrl) {
    return null;
  }
  return data.signedUrl;
}

function mapReportStatus(status: MyPostRow['status']): MyReportItem['status'] {
  if (status === 'resolved') return 'resolved';
  if (status === 'draft' || status === 'archived') return 'matching';
  return 'open';
}

function mapFeedRow(row: FeedRow, language: Language): HomeFeedItem {
  const contactName = row.user_display_name || fallbackText[language].unknownUser;
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title || fallbackText[language].untitled,
    description: row.summary || fallbackText[language].untitled,
    location: row.public_location_label || row.city_slug || row.region_slug || fallbackText[language].unknownLocation,
    time: formatRelativeDate(row.posted_at, language),
    contactName,
    category: row.category,
    status: mapFeedStatus(row.status),
    image: row.primary_image_path ?? undefined,
  };
}

function mapReportRow(row: MyPostRow, language: Language): MyReportItem {
  return {
    id: row.id,
    type: row.type,
    title: row.generated_title || fallbackText[language].untitled,
    description: row.generated_summary || row.user_description,
    image: row.primary_image_path ?? undefined,
    location: row.public_location_label || row.city_slug || row.region_slug || fallbackText[language].unknownLocation,
    time: formatRelativeDate(row.posted_at, language),
    status: mapReportStatus(row.status),
    contactName: fallbackText[language].you,
    views: 0,
    messages: row.message_count ?? 0,
    lastUpdate: formatRelativeDate(row.last_message_at || row.posted_at, language),
  };
}

function mapNotificationRow(row: NotificationRow, language: Language): NotificationItem {
  return {
    id: row.id,
    category: row.type === 'system' ? 'status' : row.type,
    title: row.title,
    body: row.body,
    time: formatRelativeDate(row.created_at, language),
    unread: !row.is_read,
    relatedPostId: row.related_post_id || '',
  };
}

function mapConversationRow(row: ConversationRow, language: Language): ChatPreview {
  const name = row.other_display_name || fallbackText[language].unknownUser;
  const online = isUserOnline(row.other_last_seen_at);
  const latestPreview =
    row.latest_message_body?.trim() === IMAGE_MESSAGE_PLACEHOLDER
      ? IMAGE_PREVIEW_TEXT
      : row.latest_message_body || fallbackText[language].noMessages;
  return {
    id: row.conversation_id,
    contextPostId: row.context_post_id,
    otherUserId: row.other_user_id,
    name,
    message: latestPreview,
    time: formatRelativeDate(row.latest_message_created_at || row.last_message_at, language),
    avatarInitial: name.charAt(0).toUpperCase(),
    avatarColor: buildAvatarColor(name),
    unread: (row.unread_count ?? 0) > 0,
    isOtherUserOnline: online,
    otherUserLastSeenLabel: row.other_last_seen_at ? formatRelativeDate(row.other_last_seen_at, language) : null,
  };
}

export async function loadAppData(language: Language): Promise<AppBootstrapData> {
  const [feedResult, reportsResult, notificationsResult, conversationsResult] = await Promise.all([
    supabase.from('public_feed_view').select('*').order('posted_at', { ascending: false }),
    supabase.from('my_posts_view').select('*').order('posted_at', { ascending: false }),
    supabase.from('notifications').select('*').order('created_at', { ascending: false }),
    supabase.from('conversation_list_view').select('*').order('last_message_at', { ascending: false }),
  ]);

  assertNoError(feedResult.error);
  assertNoError(reportsResult.error);
  assertNoError(notificationsResult.error);
  assertNoError(conversationsResult.error);

  const imageUrlMap = await buildSignedImageUrlMap([
    ...((feedResult.data ?? []) as FeedRow[]).map((row) => row.primary_image_path),
    ...((reportsResult.data ?? []) as MyPostRow[]).map((row) => row.primary_image_path),
  ]);

  return {
    posts: (feedResult.data ?? []).map((row) => {
      const mapped = mapFeedRow(row as FeedRow, language);
      return {
        ...mapped,
        image: mapped.image ? imageUrlMap.get(mapped.image) ?? mapped.image : undefined,
      };
    }),
    reports: (reportsResult.data ?? []).map((row) => {
      const mapped = mapReportRow(row as MyPostRow, language);
      return {
        ...mapped,
        image: mapped.image ? imageUrlMap.get(mapped.image) ?? mapped.image : undefined,
      };
    }),
    notifications: (notificationsResult.data ?? []).map((row) => mapNotificationRow(row as NotificationRow, language)),
    chats: (conversationsResult.data ?? []).map((row) => mapConversationRow(row as ConversationRow, language)),
  };
}

export async function loadConversationPreviews(language: Language): Promise<ChatPreview[]> {
  const result = await supabase.from('conversation_list_view').select('*').order('last_message_at', { ascending: false });
  assertNoError(result.error);
  return (result.data ?? []).map((row) => mapConversationRow(row as ConversationRow, language));
}

export async function touchMyPresence() {
  const { error } = await supabase.rpc('touch_my_presence');
  assertNoError(error);
}

export async function markConversationRead(conversationId: string, currentUserId?: string | null) {
  const rpcResult = await supabase.rpc('mark_conversation_read', {
    target_conversation_id: conversationId,
  });

  if (!rpcResult.error) return;

  const normalizedMessage = rpcResult.error.message.toLowerCase();
  const missingRpc = normalizedMessage.includes('mark_conversation_read') && normalizedMessage.includes('does not exist');
  if (!missingRpc) {
    assertNoError(rpcResult.error);
    return;
  }

  let userId = currentUserId ?? null;
  if (!userId) {
    const authResult = await supabase.auth.getUser();
    assertNoError(authResult.error);
    userId = authResult.data.user?.id ?? null;
  }

  if (!userId) return;

  const { error } = await supabase
    .from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId);
  assertNoError(error);
}

export async function deleteConversationForCurrentUser(conversationId: string) {
  const rpcResult = await supabase.rpc('leave_conversation', {
    target_conversation_id: conversationId,
  });

  if (!rpcResult.error) return;

  const normalizedMessage = rpcResult.error.message.toLowerCase();
  const missingRpc = normalizedMessage.includes('leave_conversation') && normalizedMessage.includes('does not exist');
  if (missingRpc) {
    throw new Error('Chat delete is not enabled in the database yet. Run the latest Supabase migration first.');
  }

  assertNoError(rpcResult.error);
}

async function uploadAvatarImage(userId: string, image: SelectedImage) {
  const fileName = createAvatarFileName(image);
  const storagePath = `${userId}/${fileName}`;
  const arrayBuffer = await readImageArrayBuffer(image.uri);

  const uploadResult = await supabase.storage.from('avatars').upload(storagePath, new Uint8Array(arrayBuffer), {
    contentType: image.mimeType ?? 'image/jpeg',
    upsert: false,
  });
  assertNoError(uploadResult.error);
  return storagePath;
}

export async function loadCurrentUserProfile(userId: string): Promise<CurrentUserProfile> {
  const profileResult = await supabase
    .from('profiles')
    .select('id, display_name, avatar_path')
    .eq('id', userId)
    .maybeSingle();
  assertNoError(profileResult.error);

  const profile = (profileResult.data as ProfileRow | null) ?? null;
  const avatarPath = profile?.avatar_path ?? null;
  const avatarUrl = await buildSignedImageUrl(avatarPath, 'avatars');
  return {
    displayName: profile?.display_name ?? null,
    avatarPath,
    avatarUrl,
  };
}

export async function upsertCurrentUserProfile(input: {
  userId: string;
  displayName?: string | null;
  avatarImage?: SelectedImage | null;
}): Promise<CurrentUserProfile> {
  const displayName = input.displayName?.trim() ?? '';
  const profileResult = await supabase
    .from('profiles')
    .select('id, display_name, avatar_path')
    .eq('id', input.userId)
    .maybeSingle();
  assertNoError(profileResult.error);

  const existing = (profileResult.data as ProfileRow | null) ?? null;
  const currentAvatarPath = existing?.avatar_path ?? null;
  let nextAvatarPath = currentAvatarPath;

  if (input.avatarImage) {
    nextAvatarPath = await uploadAvatarImage(input.userId, input.avatarImage);
  }

  const resolvedDisplayName = displayName || existing?.display_name || 'User';
  if (existing) {
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: resolvedDisplayName,
        avatar_path: nextAvatarPath,
      })
      .eq('id', input.userId);
    assertNoError(error);
  } else {
    const { error } = await supabase.from('profiles').insert({
      id: input.userId,
      display_name: resolvedDisplayName,
      avatar_path: nextAvatarPath,
    });
    assertNoError(error);
  }

  if (input.avatarImage && currentAvatarPath && currentAvatarPath !== nextAvatarPath) {
    await supabase.storage.from('avatars').remove([currentAvatarPath]);
  }

  const avatarUrl = await buildSignedImageUrl(nextAvatarPath, 'avatars');
  return {
    displayName: resolvedDisplayName,
    avatarPath: nextAvatarPath,
    avatarUrl,
  };
}

export async function createPost(input: CreatePostInput) {
  const postId = generateUuid();
  const shouldPublishToFeed = input.type === 'lost';
  const matchKeywords = (input.matchKeywordsEn ?? []).map((value) => String(value || '').trim()).filter((value) => Boolean(value));
  const hasMatchNormalization =
    Boolean((input.matchTextEn || '').trim()) || Boolean((input.matchLocationEn || '').trim()) || matchKeywords.length > 0;

  const { error } = await supabase.from('posts').insert({
    id: postId,
    user_id: input.userId,
    type: input.type,
    status: 'active',
    country_code: 'JO',
    city_slug: slugify(input.location),
    public_location_label: input.location,
    user_description: input.description,
    generated_title: input.aiAnalysis?.title || input.title,
    generated_summary: input.aiAnalysis?.summary || input.description,
    category: input.aiAnalysis?.category || input.category,
    subcategory: input.aiAnalysis?.itemType || null,
    brand: input.aiAnalysis?.brand && input.aiAnalysis.brand !== 'Unknown' ? input.aiAnalysis.brand : null,
    primary_color:
      input.aiAnalysis?.primaryColor && input.aiAnalysis.primaryColor !== 'Unknown' ? input.aiAnalysis.primaryColor : null,
    material: input.aiAnalysis?.material && input.aiAnalysis.material !== 'Unknown' ? input.aiAnalysis.material : null,
    notable_features: input.aiAnalysis?.distinctiveFeatures ?? [],
    search_keywords: input.aiAnalysis?.searchKeywords ?? [],
    match_text_en: (input.matchTextEn || '').trim() || null,
    match_keywords_en: matchKeywords,
    match_location_en: (input.matchLocationEn || '').trim() || null,
    match_norm_updated_at: hasMatchNormalization ? new Date().toISOString() : null,
    // Found-item AI pool should remain hidden from public feed; lost reports stay public.
    is_public: shouldPublishToFeed,
    is_removed: false,
  });

  assertNoError(error);

  if (input.existingImageStoragePath) {
    await attachExistingPostImage(postId, input.userId, input.existingImageStoragePath, input.image);
  } else if (input.image) {
    await uploadPostImage(postId, input.userId, input.image);
  }
}

export async function saveAnalyzedFoundItem(input: SaveAnalyzedFoundItemInput) {
  const imageStoragePath =
    (input.existingImageStoragePath || '').trim() ||
    (await uploadDraftPostImage(input.userId, input.image)).storagePath;

  const insertResult = await supabase.from('analyzed_items').insert({
    user_id: input.userId,
    status: 'analyzed',
    title: input.aiAnalysis?.title || input.title,
    summary: input.aiAnalysis?.summary || input.summary || input.description,
    user_description: input.description,
    public_location_label: input.location,
    category: input.aiAnalysis?.category || input.category,
    subcategory: input.aiAnalysis?.itemType || null,
    brand: input.aiAnalysis?.brand && input.aiAnalysis.brand !== 'Unknown' ? input.aiAnalysis.brand : null,
    primary_color:
      input.aiAnalysis?.primaryColor && input.aiAnalysis.primaryColor !== 'Unknown' ? input.aiAnalysis.primaryColor : null,
    material: input.aiAnalysis?.material && input.aiAnalysis.material !== 'Unknown' ? input.aiAnalysis.material : null,
    notable_features: input.aiAnalysis?.distinctiveFeatures ?? [],
    search_keywords: input.aiAnalysis?.searchKeywords ?? [],
    confidence: input.aiAnalysis?.confidence || 'low',
    review_hint: input.aiAnalysis?.reviewHint || null,
    image_storage_path: imageStoragePath,
    raw_ai_analysis: input.aiAnalysis ?? {},
  });

  if (insertResult.error) {
    const normalized = String(insertResult.error.message || '').toLowerCase();
    if (normalized.includes('analyzed_items') && normalized.includes('does not exist')) {
      throw new Error('Analyzed-item storage is not enabled yet. Run the latest Supabase migration.');
    }
    assertNoError(insertResult.error);
  }
}

export async function updatePostStatus(postId: string, nextStatus: 'active' | 'resolved') {
  const updates: { status: 'active' | 'resolved'; handed_to_owner: boolean } =
    nextStatus === 'resolved'
      ? { status: 'resolved', handed_to_owner: true }
      : { status: 'active', handed_to_owner: false };

  const { error } = await supabase.from('posts').update(updates).eq('id', postId);
  assertNoError(error);
}

export async function markAllNotificationsRead(notificationIds: string[]) {
  if (notificationIds.length === 0) return;
  const { error } = await supabase.from('notifications').update({ is_read: true }).in('id', notificationIds);
  assertNoError(error);
}

export async function markNotificationRead(notificationId: string) {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
  assertNoError(error);
}

export async function fetchMessages(conversationId: string, currentUserId: string, language: Language): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('id, body, sender_user_id, created_at, type, image_path')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  assertNoError(error);

  const imageUrlMap = await buildSignedImageUrlMap(
    ((data ?? []) as MessageRow[]).map((row) => row.image_path),
    'message-images'
  );

  return (data ?? []).map((row) => {
    const message = row as MessageRow;
    const imageUrl = message.image_path ? imageUrlMap.get(message.image_path) ?? undefined : undefined;
    return {
      id: message.id,
      text: message.body,
      time: formatRelativeDate(message.created_at, language),
      mine: message.sender_user_id === currentUserId,
      image: imageUrl,
    };
  });
}

export async function sendMessage(conversationId: string, senderUserId: string, body: string) {
  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_user_id: senderUserId,
    body,
    type: 'text',
  });

  assertNoError(error);
}

export async function sendImageMessage(
  conversationId: string,
  senderUserId: string,
  image: SelectedImage,
  caption = IMAGE_MESSAGE_PLACEHOLDER
) {
  const messageId = generateUuid();
  const fileName = createMessageImageFileName(image);
  const storagePath = `${senderUserId}/${conversationId}/${fileName}`;
  const arrayBuffer = await readImageArrayBuffer(image.uri);

  const uploadResult = await supabase.storage.from('message-images').upload(storagePath, new Uint8Array(arrayBuffer), {
    contentType: image.mimeType ?? 'image/jpeg',
    upsert: false,
  });
  assertNoError(uploadResult.error);

  const body = caption.trim() || IMAGE_MESSAGE_PLACEHOLDER;
  const insertResult = await supabase.from('messages').insert({
    id: messageId,
    conversation_id: conversationId,
    sender_user_id: senderUserId,
    type: 'image',
    body,
    image_path: storagePath,
    image_mime_type: image.mimeType ?? null,
    image_width: image.width ?? null,
    image_height: image.height ?? null,
  });
  assertNoError(insertResult.error);
}

export async function findOrCreateConversationForPost(post: HomeFeedItem, currentUserId: string, language: Language) {
  if (!post.userId) {
    throw new Error(language === 'ar' ? 'تعذر تحديد صاحب البلاغ.' : 'Could not determine the report owner.');
  }

  const existingResult = await supabase
    .from('conversation_list_view')
    .select('*')
    .eq('context_post_id', post.id)
    .eq('other_user_id', post.userId)
    .maybeSingle();

  assertNoError(existingResult.error);

  if (existingResult.data) {
    return mapConversationRow(existingResult.data as ConversationRow, language);
  }

  const conversationId = generateUuid();
  const conversationResult = await supabase
    .from('conversations')
    .insert({
      id: conversationId,
      context_post_id: post.id,
      created_by: currentUserId,
      status: 'active',
    });

  assertNoError(conversationResult.error);

  const participantsResult = await supabase.from('conversation_participants').insert([
    { conversation_id: conversationId, user_id: currentUserId, role: 'owner' },
    { conversation_id: conversationId, user_id: post.userId, role: 'member' },
  ]);

  assertNoError(participantsResult.error);

  return {
    id: conversationId,
    contextPostId: post.id,
    otherUserId: post.userId,
    name: post.contactName,
    message: post.description,
    time: fallbackText[language].justNow,
    avatarInitial: post.contactName.charAt(0).toUpperCase(),
    avatarColor: buildAvatarColor(post.contactName),
    unread: false,
  };
}
