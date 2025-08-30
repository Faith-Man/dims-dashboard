// teachings-data.js
// Uses Supabase if available; falls back to /teachings/teachings.json

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// 1) Your values
const SUPABASE_URL = 'https://cshwadyqijqbbdwcmwp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzaHdhZHlxamxqcWJiZHdjbXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1ODI0NzMsImV4cCI6MjA3MjE1ODQ3M30.lQgxrTwghh5xm9ei6mw9pJf58nmaJoWKy-JYr77OK8M';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fetchFromSupabase() {
  const { data, error } = await supabase
    .from('teachings')
    .select('id, title, slug, scripture, tags, content, published, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

async function fetchFromJson() {
  const res = await fetch('/teachings/teachings.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error(`JSON fetch failed: ${res.status}`);
  return res.json();
}

// Call this from your page
export async function fetchTeachingsWithFallback() {
  try {
    const data = await fetchFromSupabase();
    if (Array.isArray(data) && data.length) {
      console.info('[teachings] Loaded from Supabase');
      return data;
    }
    console.warn('[teachings] Supabase returned empty; falling back to JSON');
    return await fetchFromJson();
  } catch (e) {
    console.error('[teachings] Error fetching from Supabase, falling back to JSON:', e);
    return await fetchFromJson();
  }
}
