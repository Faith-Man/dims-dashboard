import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

// TASK-0218 — DI² Google Drive (read everything) + Google Docs (create/edit) for the owner's Gmail account.
// GET  /di2-google/connect   → Google consent (owner clicks through himself)
// GET  /di2-google/callback  → stores the refresh credential encrypted in Supabase Vault
// POST /di2-google           → {action:'status'|'search'|'read'|'create_doc'|'replace_doc'|'append_doc', ...}
//                              requires the caller's DOME session AND the DIMS administrator role.
// Secrets are never logged or returned. Writes happen only when DI² sends them after the owner presses Save.
const ID_RE = /^\d+-[a-z0-9]+\.apps\.googleusercontent\.com$/;
const SECRET_RE = /^GOCSPX-[A-Za-z0-9_-]+$/;
const RAW_ID = (Deno.env.get("DMI_GOOGLE_CLIENT_ID") ?? "").trim();
const RAW_SECRET = (Deno.env.get("DMI_GOOGLE_CLIENT_SECRET") ?? "").trim();
let CLIENT_ID = "", CLIENT_SECRET = "";
if (ID_RE.test(RAW_ID) && SECRET_RE.test(RAW_SECRET)) { CLIENT_ID = RAW_ID; CLIENT_SECRET = RAW_SECRET; }
else if (ID_RE.test(RAW_SECRET) && SECRET_RE.test(RAW_ID)) { CLIENT_ID = RAW_SECRET; CLIENT_SECRET = RAW_ID; }
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const REDIRECT_URI = "https://sdquzhsylqpbhrmqjqgk.supabase.co/functions/v1/di2-google/callback";
const SCOPES = [
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/documents",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/userinfo.email",
  "openid",
].join(" ");
const REQUIRED = ["https://www.googleapis.com/auth/drive.readonly", "https://www.googleapis.com/auth/documents"];
const GDOC = "application/vnd.google-apps.document";
const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "authorization, content-type, apikey", "access-control-allow-methods": "GET, POST, OPTIONS" };

const service = () => createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
function page(m: string, s = 200) {
  return new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><body style="font-family:system-ui;background:#071426;color:white;padding:32px;max-width:760px;margin:auto"><h1>DI² — Google Drive &amp; Docs</h1><p>${m}</p></body>`, { status: s, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}
function json(d: unknown, s = 200) { return new Response(JSON.stringify(d), { status: s, headers: { ...CORS, "content-type": "application/json", "cache-control": "no-store" } }); }

let cached: { token: string; exp: number } | null = null;
async function accessToken(): Promise<string> {
  if (cached && cached.exp > Date.now() + 60_000) return cached.token;
  const { data: refresh, error } = await service().rpc("di2_get_google_refresh_token");
  if (error || !refresh) throw new Error("not_connected");
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, refresh_token: String(refresh), grant_type: "refresh_token" }) });
  if (!r.ok) throw new Error(`google_token_${r.status}`);
  const t = await r.json();
  cached = { token: t.access_token, exp: Date.now() + (Number(t.expires_in) || 3000) * 1000 };
  return cached.token;
}
async function g(url: string, init: RequestInit = {}) {
  const tok = await accessToken();
  const r = await fetch(url, { ...init, headers: { ...(init.headers || {}), authorization: `Bearer ${tok}` } });
  if (!r.ok) { let msg = ""; try { msg = (await r.json())?.error?.message ?? ""; } catch { /* */ } throw new Error(`google_${r.status}${msg ? `: ${msg.slice(0, 160)}` : ""}`); }
  return r;
}
const FIELDS = "id,name,mimeType,modifiedTime,webViewLink,size,owners(displayName),parents";
const q = (s: string) => s.replace(/\\/g, "\\\\").replace(/'/g, "\\'");

async function authorize(req: Request) {
  // Verify the caller's DOME session server-side and require the DIMS administrator role
  // (same rule as med_is_admin: app_metadata.dims_role = 'administrator').
  const bearer = req.headers.get("authorization") ?? "";
  if (!/^Bearer\s+\S+$/i.test(bearer)) return false;
  const { data, error } = await service().auth.getUser(bearer.replace(/^Bearer\s+/i, ""));
  if (error || !data?.user) return false;
  return (data.user.app_metadata as Record<string, unknown> | undefined)?.dims_role === "administrator";
}

async function readFile(id: string, max: number) {
  const meta = await (await g(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?fields=${FIELDS}&supportsAllDrives=true`)).json();
  const mt = String(meta.mimeType);
  let text = "", how = "";
  const exportAs = mt === GDOC ? "text/markdown" : mt === "application/vnd.google-apps.spreadsheet" ? "text/csv" : mt === "application/vnd.google-apps.presentation" ? "text/plain" : "";
  if (exportAs) {
    try { text = await (await g(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}/export?mimeType=${encodeURIComponent(exportAs)}`)).text(); how = `exported as ${exportAs}`; }
    catch (e) { if (mt === GDOC) { text = await (await g(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}/export?mimeType=text/plain`)).text(); how = "exported as text/plain"; } else throw e; }
  } else if (/^text\/|json|xml|javascript|csv|markdown/.test(mt) && Number(meta.size || 0) < 5_000_000) {
    text = await (await g(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?alt=media`)).text(); how = "file text";
  } else {
    how = `contents not readable as text (${mt}); name and details only`;
  }
  return { file: meta, how, truncated: text.length > max, text: text.slice(0, max) };
}

async function docEnd(id: string) {
  const d = await (await g(`https://docs.googleapis.com/v1/documents/${encodeURIComponent(id)}?fields=body(content(endIndex)),title`)).json();
  const c = d?.body?.content ?? [];
  return { end: Number(c[c.length - 1]?.endIndex ?? 2), title: d.title };
}

Deno.serve(async (req) => {
  const u = new URL(req.url);
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (!SUPABASE_URL || !SERVICE_KEY || !CLIENT_ID) return page("DI² Google connection is not configured.", 500);

  if (u.pathname.endsWith("/connect")) {
    const a = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    a.search = new URLSearchParams({ client_id: CLIENT_ID, redirect_uri: REDIRECT_URI, response_type: "code", scope: SCOPES, access_type: "offline", prompt: "consent", include_granted_scopes: "false" }).toString();
    return Response.redirect(a.toString(), 302);
  }
  if (u.pathname.endsWith("/callback")) {
    if (u.searchParams.get("error")) return page("Google authorization was not completed. Nothing was changed.", 400);
    const code = u.searchParams.get("code"); if (!code) return page("Missing Google authorization code.", 400);
    const tr = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: CLIENT_ID, client_secret: CLIENT_SECRET, redirect_uri: REDIRECT_URI, grant_type: "authorization_code" }) });
    if (!tr.ok) { let e = ""; try { e = String((await tr.json()).error ?? ""); } catch { /* */ } return page(`Google token exchange failed${e ? ` (${e.replace(/[^a-z_]/gi, "")})` : ""}. Nothing was changed.`, 502); }
    const t = await tr.json(); if (!t.refresh_token) return page("Google did not return an offline credential. Please try again.", 409);
    const granted = String(t.scope ?? "").split(/\s+/);
    const missing = REQUIRED.filter((s) => !granted.includes(s));
    if (missing.length) return page(`Google did not grant every permission (${missing.map((s) => s.split("/").pop()).join(", ")}). Nothing was changed; please try again and tick every box.`, 409);
    const ur = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", { headers: { authorization: `Bearer ${t.access_token}` } });
    if (!ur.ok) return page("Could not verify which Google account was authorized.", 502);
    const email = String((await ur.json()).email ?? "").toLowerCase();
    const { error } = await service().rpc("di2_store_google_refresh_token", { p_email: email, p_refresh_token: t.refresh_token });
    if (error) return page(/unexpected Google account/.test(error.message) ? "That is not the Google account that owns your Drive. Please sign in with your Gmail account and try again. Nothing was changed." : "Google approved, but DI² could not store the connection securely. Nothing was changed.", 403);
    cached = null;
    return page("Connected. DI² can now read your Google Drive and create or edit Google Docs (always after you press Save). You can close this page.");
  }

  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!(await authorize(req))) return json({ error: "DIMS administrator session required" }, 401);
  let b: Record<string, unknown>; try { b = await req.json(); } catch { return json({ error: "Invalid body" }, 400); }
  try {
    switch (b.action) {
      case "status": { await accessToken(); return json({ connected: true }); }
      case "search": {
        const words = String(b.query ?? "").split(/\s+/).map((w) => w.replace(/[^\p{L}\p{N}'-]/gu, "")).filter((w) => w.length > 1).slice(0, 6);
        const mode = b.mode === "name" ? "name" : "fullText";
        const clauses = words.map((w) => `${mode} contains '${q(w)}'`);
        const filter = [...clauses, "trashed = false"].join(" and ");
        const limit = Math.min(Math.max(Number(b.limit) || 10, 1), 25);
        const r = await (await g(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(filter)}&pageSize=${limit}&fields=files(${FIELDS})&orderBy=${mode === "name" ? "modifiedTime desc" : ""}&supportsAllDrives=true&includeItemsFromAllDrives=true`.replace("&orderBy=&", "&"))).json();
        return json({ files: r.files ?? [] });
      }
      case "read": {
        const id = String(b.file_id ?? ""); if (!/^[A-Za-z0-9_-]{10,}$/.test(id)) return json({ error: "Invalid file id" }, 400);
        return json(await readFile(id, Math.min(Number(b.max_chars) || 30000, 100000)));
      }
      case "create_doc": {
        const title = String(b.title ?? "").trim().slice(0, 200); const text = String(b.markdown ?? "");
        if (!title || !text.trim() || text.length > 200000) return json({ error: "Title and content required" }, 400);
        const meta: Record<string, unknown> = { name: title, mimeType: GDOC };
        if (typeof b.folder_id === "string" && /^[A-Za-z0-9_-]{10,}$/.test(b.folder_id)) meta.parents = [b.folder_id];
        const boundary = "di2" + crypto.randomUUID();
        const body = `--${boundary}\r\ncontent-type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${boundary}\r\ncontent-type: text/markdown; charset=UTF-8\r\n\r\n${text}\r\n--${boundary}--`;
        const f = await (await g(`https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=${FIELDS}&supportsAllDrives=true`, { method: "POST", headers: { "content-type": `multipart/related; boundary=${boundary}` }, body })).json();
        console.log(JSON.stringify({ event: "di2_google_create_doc", id: f.id }));
        return json({ created: true, file: f });
      }
      case "replace_doc":
      case "append_doc": {
        const id = String(b.file_id ?? ""); const text = String(b.text ?? "");
        if (!/^[A-Za-z0-9_-]{10,}$/.test(id) || !text.trim() || text.length > 200000) return json({ error: "File id and text required" }, 400);
        const meta = await (await g(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?fields=${FIELDS}&supportsAllDrives=true`)).json();
        if (meta.mimeType !== GDOC) return json({ error: "DI² only edits Google Docs" }, 400);
        const { end } = await docEnd(id);
        const requests: unknown[] = [];
        if (b.action === "replace_doc" && end > 2) requests.push({ deleteContentRange: { range: { startIndex: 1, endIndex: end - 1 } } });
        requests.push({ insertText: { location: { index: b.action === "replace_doc" ? 1 : Math.max(1, end - 1) }, text: b.action === "append_doc" ? `\n${text}` : text } });
        await g(`https://docs.googleapis.com/v1/documents/${encodeURIComponent(id)}:batchUpdate`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ requests }) });
        console.log(JSON.stringify({ event: `di2_google_${b.action}`, id }));
        return json({ updated: true, file: meta });
      }
      default: return json({ error: "Unknown action" }, 400);
    }
  } catch (e) {
    const m = String((e as Error)?.message ?? e);
    if (m === "not_connected") return json({ error: "Google Drive is not connected yet", connected: false }, 409);
    console.error(JSON.stringify({ event: "di2_google_error", error: m.slice(0, 200) }));
    return json({ error: m.slice(0, 200) }, 502);
  }
});
