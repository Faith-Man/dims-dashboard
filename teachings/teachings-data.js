import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://tfbfkitdenxgcxkxhydw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmYmZraXRkZW54Z2N4a3hoeWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MjY3NDcsImV4cCI6MjA3MjIwMjc0N30.8EtOV90zyP2bn3ZrP35vOwnZkRo4nc72uD1xa964hC4';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function fetchTeachingsWithFallback() {
  try {
    const { data, error } = await supabase
      .from('teachings')
      .select('id, title, slug, scripture, tags, content_md, status, published_at, created_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });
    if (error) throw error;

    return (data ?? []).map(r => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      scriptures: r.scripture,
      tags: r.tags || [],
      content_md: r.content_md || '',
      published: r.status === 'published',
      created_at: r.created_at
    }));
  } catch (e) {
    console.error('[teachings] Supabase error → returning empty list', e);
    return [];
  }
}
