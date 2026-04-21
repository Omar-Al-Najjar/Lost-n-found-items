import { AiFoundAnalysis, AiSearchRun, Language, SelectedImage } from '../types';
import { supabase } from '../supabase';
import { uploadDraftPostImage } from './supabaseApp';

const aiApiBaseUrl = process.env.EXPO_PUBLIC_AI_API_BASE_URL;

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Missing authenticated Supabase session.');
  }

  return session.access_token;
}

async function callAiApi<T>(path: string, payload: Record<string, unknown>): Promise<T> {
  if (!aiApiBaseUrl) {
    throw new Error('Missing EXPO_PUBLIC_AI_API_BASE_URL.');
  }

  const token = await getAccessToken();
  const response = await fetch(`${aiApiBaseUrl.replace(/\/+$/, '')}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();
  let parsedBody: (T & { detail?: string }) | null = null;

  if (responseText) {
    try {
      parsedBody = JSON.parse(responseText) as T & { detail?: string };
    } catch {
      parsedBody = null;
    }
  }

  if (!response.ok) {
    throw new Error(parsedBody?.detail || responseText || 'AI request failed.');
  }

  if (!parsedBody) {
    throw new Error(responseText || 'AI API returned an invalid response.');
  }

  return parsedBody as T;
}

export function isAiAssistantConfigured() {
  return Boolean(aiApiBaseUrl);
}

export async function analyzeFoundItemWithAi(input: {
  image: SelectedImage;
  description: string;
  locationFound: string;
  language: Language;
}): Promise<{ analysis: AiFoundAnalysis; draftImageStoragePath: string }> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const userId = session?.user?.id;
  if (!userId) {
    throw new Error('Missing authenticated user.');
  }

  const draftUpload = await uploadDraftPostImage(userId, input.image);
  const analysis = await callAiApi<AiFoundAnalysis>('/api/found/analyze', {
    draftImageSignedUrl: draftUpload.signedUrl,
    draftImageStoragePath: draftUpload.storagePath,
    userDescription: input.description,
    locationFound: input.locationFound,
    language: input.language,
  });

  return {
    analysis: {
      title: normalizeWhitespace(analysis.title || 'Found item'),
      summary: normalizeWhitespace(analysis.summary || input.description),
      itemType: normalizeWhitespace(analysis.itemType || 'Unknown'),
      category: analysis.category || 'other',
      brand: normalizeWhitespace(analysis.brand || 'Unknown'),
      primaryColor: normalizeWhitespace(analysis.primaryColor || 'Unknown'),
      material: normalizeWhitespace(analysis.material || 'Unknown'),
      distinctiveFeatures: Array.isArray(analysis.distinctiveFeatures) ? analysis.distinctiveFeatures : [],
      searchKeywords: Array.isArray(analysis.searchKeywords) ? analysis.searchKeywords : [],
      confidence: analysis.confidence || 'low',
      reviewHint: normalizeWhitespace(analysis.reviewHint || 'Review these details before publishing.'),
    },
    draftImageStoragePath: draftUpload.storagePath,
  };
}

export async function searchPotentialFoundMatches(query: string, language: Language): Promise<AiSearchRun> {
  const result = await callAiApi<AiSearchRun>('/api/lost/search', {
    query,
    topK: 5,
    language,
  });

  return {
    id: result.id || `run-${Date.now()}`,
    query: normalizeWhitespace(result.query || query),
    createdAtLabel: normalizeWhitespace(result.createdAtLabel || (language === 'ar' ? 'الآن' : 'Just now')),
    matches: Array.isArray(result.matches) ? result.matches : [],
  };
}
