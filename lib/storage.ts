import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Submission } from './types';

// In-memory fallback array for local testing if Supabase env vars are not set
let fallbackSubmissions: Submission[] = [
  {
    id: 'demo-1',
    studio_id: 'default',
    client_name: 'Ananya & Rahul',
    event_date: '2026-11-25',
    status: 'pending',
    is_downloaded: false,
    created_at: new Date().toISOString(),
    songs: [
      {
        ritualName: 'Bride Entry 👰',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        notes: 'Start from 0:15 sec',
      },
      {
        ritualName: 'Groom Entry 🤵',
        url: 'https://youtu.be/3JZ_D3ELwOQ',
        notes: '',
      },
      {
        ritualName: 'Haldi 🌼',
        url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
        notes: 'High energy mix',
      },
    ],
  },
];

export async function getSubmissions(studioId?: string): Promise<Submission[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from('song_submissions')
        .select('*');

      if (studioId && studioId.trim().length > 0) {
        query = query.eq('studio_id', studioId.trim());
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase fetch error:', error);
        return filterFallbackByStudio(studioId);
      }
      return data as Submission[];
    } catch (err) {
      console.error('Error contacting Supabase:', err);
      return filterFallbackByStudio(studioId);
    }
  }
  return filterFallbackByStudio(studioId);
}

function filterFallbackByStudio(studioId?: string): Submission[] {
  if (!studioId || studioId.trim().length === 0) {
    return fallbackSubmissions;
  }
  const cleanId = studioId.trim();
  return fallbackSubmissions.filter(
    (s) => s.studio_id === cleanId || (!s.studio_id && cleanId === 'default')
  );
}

export async function createSubmission(
  payload: Omit<Submission, 'id' | 'created_at' | 'status' | 'is_downloaded'>
): Promise<Submission> {
  const newSubmissionData = {
    studio_id: payload.studio_id || 'default',
    client_name: payload.client_name,
    event_date: payload.event_date,
    phone: payload.phone || '',
    general_notes: payload.general_notes || '',
    songs: payload.songs,
    status: 'pending' as const,
    is_downloaded: false,
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('song_submissions')
      .insert([newSubmissionData])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw new Error(error.message);
    }
    return data as Submission;
  }

  // Fallback storage
  const created: Submission = {
    ...newSubmissionData,
    id: `local-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  fallbackSubmissions.unshift(created);
  return created;
}

export async function updateSubmissionStatus(
  id: string,
  status: Submission['status'],
  is_downloaded: boolean
): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('song_submissions')
      .update({ status, is_downloaded, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Supabase update error:', error);
      return false;
    }
    return true;
  }

  // Fallback update
  const item = fallbackSubmissions.find((s) => s.id === id);
  if (item) {
    item.status = status;
    item.is_downloaded = is_downloaded;
    item.updated_at = new Date().toISOString();
    return true;
  }
  return false;
}

import { CustomRitual, BENGALI_RITUAL_GROUPS } from './types';

const defaultFallbackRituals: CustomRitual[] = BENGALI_RITUAL_GROUPS.flatMap((group) =>
  group.rituals.map((r) => ({
    id: r.id,
    name: r.name,
    englishTag: r.englishTag,
    category: r.category,
  }))
);

const fallbackTemplates = new Map<string, CustomRitual[]>();

export async function getStudioTemplate(studioId: string = 'trpworld'): Promise<CustomRitual[]> {
  const cleanStudioId = studioId.trim().toLowerCase() || 'default';

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('studio_templates')
        .select('*')
        .eq('studio_id', cleanStudioId)
        .single();

      if (!error && data && Array.isArray(data.rituals)) {
        return data.rituals as CustomRitual[];
      }
    } catch (err) {
      console.error('Error fetching studio template:', err);
    }
  }

  if (fallbackTemplates.has(cleanStudioId)) {
    return fallbackTemplates.get(cleanStudioId)!;
  }

  return defaultFallbackRituals;
}

export async function saveStudioTemplate(
  studioId: string,
  rituals: CustomRitual[]
): Promise<CustomRitual[]> {
  const cleanStudioId = studioId.trim().toLowerCase() || 'default';

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('studio_templates')
        .upsert({ studio_id: cleanStudioId, rituals, updated_at: new Date().toISOString() })
        .select()
        .single();

      if (!error && data && Array.isArray(data.rituals)) {
        return data.rituals as CustomRitual[];
      }
    } catch (err) {
      console.error('Error saving studio template to Supabase:', err);
    }
  }

  fallbackTemplates.set(cleanStudioId, rituals);
  return rituals;
}
