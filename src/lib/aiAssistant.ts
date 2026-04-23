import { AiFoundAnalysis, AiSearchRun, Language, SelectedImage } from '../types';
import { supabase } from '../supabase';
import { uploadDraftPostImage } from './supabaseApp';

const aiApiBaseUrl = (process.env.EXPO_PUBLIC_AI_API_BASE_URL || '').trim();
const AI_API_TIMEOUT_MS = 180000;
const AI_API_RETRY_DELAYS_MS = [450, 900];

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getHostName(value: string) {
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return '';
  }
}

function isPrivateDevHost(hostname: string) {
  if (!hostname) return false;
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '10.0.2.2') {
    return true;
  }
  if (hostname.startsWith('192.168.') || hostname.startsWith('10.')) {
    return true;
  }
  return /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
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
  const base = aiApiBaseUrl.replace(/\/+$/, '');
  const endpoints = [path];
  const host = getHostName(base);
  if (path.startsWith('/api/') && isPrivateDevHost(host)) {
    endpoints.push(path.replace('/api/', '/'));
  }
  const uniqueEndpoints = Array.from(new Set(endpoints));

  let response: Response | null = null;
  const networkErrorLines: string[] = [];
  const maxAttempts = AI_API_RETRY_DELAYS_MS.length + 1;

  for (const endpoint of uniqueEndpoints) {
    const requestUrl = `${base}${endpoint}`;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        response = await fetchWithTimeout(
          requestUrl,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          },
          AI_API_TIMEOUT_MS
        );
        break;
      } catch (error) {
        const isTimeoutError = error instanceof Error && error.name === 'AbortError';
        const message = isTimeoutError
          ? `Request timed out after ${Math.round(AI_API_TIMEOUT_MS / 1000)}s.`
          : error instanceof Error && error.message
            ? error.message
            : 'Network request failed.';
        networkErrorLines.push(`${requestUrl} [attempt ${attempt}/${maxAttempts}] ${message}`);
        if (attempt < maxAttempts) {
          await wait(AI_API_RETRY_DELAYS_MS[attempt - 1] ?? AI_API_RETRY_DELAYS_MS[AI_API_RETRY_DELAYS_MS.length - 1]);
        }
      }
    }
    if (response) {
      break;
    }
  }

  if (!response) {
    const requestUrl = `${base}${path}`;
    const compactError = networkErrorLines.slice(-2).join(' | ');
    throw new Error(
      `AI network error (${requestUrl}): ${
        compactError || 'Network request failed. Check internet connection and try again.'
      }`
    );
  }

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

export async function checkAiApiHealth(): Promise<{ ok: boolean; url: string; detail?: string }> {
  if (!aiApiBaseUrl) {
    return { ok: false, url: '', detail: 'Missing EXPO_PUBLIC_AI_API_BASE_URL.' };
  }

  const base = aiApiBaseUrl.replace(/\/+$/, '');
  const urls = [`${base}/api/health`, `${base}/health`];
  let lastDetail = 'Health endpoint returned non-OK status.';
  let lastUrl = urls[0];
  for (const url of urls) {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      lastUrl = url;
      try {
        const response = await fetchWithTimeout(url, { method: 'GET' }, 8000);
        if (response.ok) {
          return { ok: true, url };
        }
        lastDetail = `Health endpoint responded with status ${response.status}.`;
      } catch (error) {
        const isTimeoutError = error instanceof Error && error.name === 'AbortError';
        lastDetail = isTimeoutError
          ? 'Health check timed out.'
          : error instanceof Error
            ? error.message
            : 'Network request failed.';
      }
      if (attempt < 2) {
        await wait(250);
      }
    }
  }
  return { ok: false, url: lastUrl, detail: lastDetail };
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
  const rawDebug = (result as unknown as { debug?: any }).debug;

  return {
    id: result.id || `run-${Date.now()}`,
    query: normalizeWhitespace(result.query || query),
    createdAtLabel: normalizeWhitespace(result.createdAtLabel || (language === 'ar' ? '\u0627\u0644\u0622\u0646' : 'Just now')),
    matches: Array.isArray(result.matches) ? result.matches : [],
    debug: rawDebug
      ? {
          normalizedQuery: normalizeWhitespace(String(rawDebug.normalized_query || '')),
          searchInputs: Array.isArray(rawDebug.search_inputs)
            ? rawDebug.search_inputs.map((value: unknown) => normalizeWhitespace(String(value || ''))).filter(Boolean)
            : [],
          retrievedCandidateCount: Number(rawDebug.retrieved_candidate_count || 0),
          rankedCandidateCount: Number(rawDebug.ranked_candidate_count || 0),
          topScores: Array.isArray(rawDebug.top_scores)
            ? rawDebug.top_scores.map((value: unknown) => Number(value || 0))
            : [],
          perQuery: Array.isArray(rawDebug.per_query)
            ? rawDebug.per_query.map((entry: any) => ({
                query: normalizeWhitespace(String(entry?.query || '')),
                stage: (entry?.stage || {}) as Record<string, unknown>,
              }))
            : [],
        }
      : undefined,
  };
}


export async function normalizeFoundPostWithAi(input: {
  title: string;
  summary: string;
  description: string;
  locationFound: string;
  category: string;
  itemType: string;
  primaryColor: string;
  material: string;
  brand: string;
  distinctiveFeatures: string[];
  searchKeywords: string[];
}): Promise<{ matchTextEn: string; matchKeywordsEn: string[]; matchLocationEn: string }> {
  const response = await callAiApi<{
    matchTextEn?: string;
    matchKeywordsEn?: string[];
    matchLocationEn?: string;
  }>('/api/found/normalize', input);

  return {
    matchTextEn: normalizeWhitespace(response.matchTextEn || ''),
    matchKeywordsEn: Array.isArray(response.matchKeywordsEn)
      ? response.matchKeywordsEn
          .map((value) => normalizeWhitespace(String(value || '')))
          .filter((value) => Boolean(value))
      : [],
    matchLocationEn: normalizeWhitespace(response.matchLocationEn || ''),
  };
}
