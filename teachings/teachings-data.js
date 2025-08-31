// teachings-data.js
// Uses Supabase if available; falls back to /teachings/teachings.json

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// 1) Your values
const SUPABASE_URL = 'https://tfbfkitdenxgcxkxhydw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmYmZraXRkZW54Z2N4a3hoeWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MjY3NDcsImV4cCI6MjA3MjIwMjc0N30.8EtOV90zyP2bn3ZrP35vOwnZkRo4nc72uD1xa964hC4';


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
