// teachings-data.js
// Fetch teachings from Supabase first, fallback to teachings.json

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// 1) Your Supabase values
const SUPABASE_URL = 'https://tfbfkitdenxgcxkxhydw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmYmZraXRkZW54Z2N4a3hoeWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MjY3NDcsImV4cCI6MjA3MjIwMjc0N30.8EtOV90zyP2bn3ZrP35vOwnZkRo4nc72uD1xa964hC4';

// 2) Create client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 3) Fetch from Supabase
async function fetchFromSupabase() {
  const { data, error } = await supabase
    .from('teachings')
    .select('id, title, slug, scripture, tags, content_md, status, published_at, created_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('[teachings] Supabase error:', error.message);
    throw error;
  }
  return data ?? [];
}

// 4) Fallback to JSON
async function fetchFromJson() {
  try {
    const res = await fetch('/teachings/teachings.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`JSON fetch failed: ${res.status}`);
    return res.json();
  } catch (err) {
    console.error('[teachings] JSON error:', err.message);
    return [];
  }
}

// 5) Exported function with fallback
export async function fetchTeachingsWithFallback() {
  try {
    const data = await fetchFromSupabase();
    if (Array.isArray(data) && data.length) {
      console.info('[teachings] Loaded from Supabase:', data.length);
      return data;
    }
    console.warn('[teachings] Supabase returned empty, falling back to JSON.');
    return await fetchFromJson();
  } catch (e) {
    console.error('[teachings] Error fetching from Supabase, fallback to JSON.');
    return await fetchFromJson();
  }
}
