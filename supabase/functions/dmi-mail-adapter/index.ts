import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

// dmi-mail-adapter v10 (TASK-0098)
// Legacy behavior (v9) is preserved exactly for every request WITHOUT a `mailbox` field:
// email_send / email_draft / email_watch go to the Apps Script bridge (pistiskratos@gmail.com).
// NEW isolated route: action=email_send + mailbox=michael@dominion1st.org -> Gmail API,
// guarded by the durable idempotency ledger public.dmi_outbound_sends (dmi_outbound_* RPCs).
// Any other mailbox value, or a mailbox on any other action, fails closed. Tokens are never logged or returned.

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8" },
});

const ALLOWED = new Set(["health", "validate", "email_send", "email_draft", "email_watch"]);

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

// ---------------- Gmail API route configuration ----------------
const GMAIL_ROUTE_MAILBOX = "michael@dominion1st.org";
const GMAIL_SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";
const GMAIL_PROFILE_URL = "https://gmail.googleapis.com/gmail/v1/users/me/profile";
const SEND_TIMEOUT_MS = 25_000;

// Same client-credential resolution as deployed dmi-gmail-sync (tolerates the swapped ID/secret storage).
const ID_RE = /^\d+-[a-z0-9]+\.apps\.googleusercontent\.com$/;
const SECRET_RE = /^GOCSPX-[A-Za-z0-9_-]+$/;
const RAW_ID = (Deno.env.get("DMI_GOOGLE_CLIENT_ID") ?? "").trim();
const RAW_SECRET = (Deno.env.get("DMI_GOOGLE_CLIENT_SECRET") ?? "").trim();
let CLIENT_ID = "", CLIENT_SECRET = "";
if (ID_RE.test(RAW_ID) && SECRET_RE.test(RAW_SECRET)) { CLIENT_ID = RAW_ID; CLIENT_SECRET = RAW_SECRET; }
else if (ID_RE.test(RAW_SECRET) && SECRET_RE.test(RAW_ID)) { CLIENT_ID = RAW_SECRET; CLIENT_SECRET = RAW_ID; }

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const GMAIL_ROUTE_CONFIGURED = Boolean(CLIENT_ID && CLIENT_SECRET && SUPABASE_URL && SERVICE_KEY);

const serviceClient = () =>
  createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

function hasMailbox(v: unknown): boolean {
  return v !== undefined && v !== null && !(typeof v === "string" && v.trim() === "");
}

// ---------------- address handling ----------------
const EMAIL_RE = /^[^\s@<>()",;:\\]+@[^\s@<>()",;:\\]+\.[^\s@<>()",;:\\]+$/;

function splitOutside(v: string): string[] {
  const parts: string[] = [];
  let cur = "", q = false, a = 0;
  for (const ch of v) {
    if (ch === '"') q = !q;
    else if (!q && ch === "<") a++;
    else if (!q && ch === ">") a = Math.max(0, a - 1);
    if (ch === "," && !q && a === 0) { parts.push(cur); cur = ""; } else cur += ch;
  }
  parts.push(cur);
  return parts.map((p) => p.trim()).filter(Boolean);
}

// Returns normalized address list, or null if any entry is invalid. Accepts string or string[].
function parseAddressField(v: unknown): string[] | null {
  if (v === undefined || v === null || v === "") return [];
  const items = Array.isArray(v) ? v : [v];
  const out: string[] = [];
  for (const it of items) {
    if (typeof it !== "string") return null;
    if (/[\r\n]/.test(it)) return null;
    for (const p of splitOutside(it)) {
      const m = p.match(/^(.*?)<([^<>]+)>$/);
      const addr = (m ? m[2] : p).trim();
      if (!EMAIL_RE.test(addr)) return null;
      out.push(p);
    }
  }
  return out;
}

// ---------------- MIME helpers ----------------
const enc = new TextEncoder();

function bytesToB64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}
const b64 = (s: string) => bytesToB64(enc.encode(s));
const b64url = (s: string) => b64(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const wrap76 = (s: string) => (s.match(/.{1,76}/g) ?? [""]).join("\r\n");

// RFC 2047 encoded-words, split on code-point boundaries so multibyte characters are never cut.
function encodeHeaderValue(s: string): string {
  if (/^[\x20-\x7e]*$/.test(s)) return s;
  const words: string[] = [];
  let chunk = "";
  for (const ch of s) {
    if (enc.encode(chunk + ch).length > 45) { words.push(`=?UTF-8?B?${b64(chunk)}?=`); chunk = ""; }
    chunk += ch;
  }
  if (chunk) words.push(`=?UTF-8?B?${b64(chunk)}?=`);
  return words.join("\r\n ");
}

function formatAddress(p: string): string {
  const m = p.match(/^(.*?)<([^<>]+)>$/);
  if (!m) return p.trim();
  const name = m[1].trim().replace(/^"|"$/g, "");
  const addr = m[2].trim();
  if (!name) return `<${addr}>`;
  if (/^[\x20-\x7e]*$/.test(name)) return `"${name.replace(/["\\]/g, "\\$&")}" <${addr}>`;
  return `${encodeHeaderValue(name)} <${addr}>`;
}

function htmlToText(h: string): string {
  return h.replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ").replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/[ \t]+/g, " ").replace(/\n\s*\n\s*\n+/g, "\n\n").trim();
}

const safeHeaderToken = (s: string) => s.replace(/[^\x21-\x7e]/g, "").slice(0, 200);

function buildMime(f: { to: string[]; cc: string[]; bcc: string[]; subject: string; body: string | null; html: string | null; idempotencyKey: string; taskNumber: string }): string {
  // No From header: Gmail sets the authenticated mailbox (michael@dominion1st.org) as sender.
  const h: string[] = [];
  h.push(`To: ${f.to.map(formatAddress).join(", ")}`);
  if (f.cc.length) h.push(`Cc: ${f.cc.map(formatAddress).join(", ")}`);
  if (f.bcc.length) h.push(`Bcc: ${f.bcc.map(formatAddress).join(", ")}`);
  h.push(`Subject: ${encodeHeaderValue(f.subject)}`);
  h.push("MIME-Version: 1.0");
  h.push(`X-DMI-Task-Number: ${safeHeaderToken(f.taskNumber)}`);
  h.push(`X-DMI-Idempotency-Key: ${safeHeaderToken(f.idempotencyKey)}`);
  const text = f.body ?? (f.html ? htmlToText(f.html) : "");
  if (f.html) {
    const boundary = "dmi_" + crypto.randomUUID().replace(/-/g, "");
    h.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
    return [
      ...h, "",
      `--${boundary}`,
      'Content-Type: text/plain; charset="UTF-8"',
      "Content-Transfer-Encoding: base64", "",
      wrap76(b64(text)),
      `--${boundary}`,
      'Content-Type: text/html; charset="UTF-8"',
      "Content-Transfer-Encoding: base64", "",
      wrap76(b64(f.html)),
      `--${boundary}--`, "",
    ].join("\r\n");
  }
  h.push('Content-Type: text/plain; charset="UTF-8"');
  h.push("Content-Transfer-Encoding: base64");
  return [...h, "", wrap76(b64(text)), ""].join("\r\n");
}

async function sha256Hex(s: string): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", enc.encode(s));
  return Array.from(new Uint8Array(d), (b) => b.toString(16).padStart(2, "0")).join("");
}

// ---------------- OAuth (same pattern as dmi-gmail-sync) ----------------
type TokenResult = { ok: true; access: string; scope: string } | { ok: false; error: string; google_error?: string };

async function getAccessToken(sb: ReturnType<typeof serviceClient>): Promise<TokenResult> {
  const { data: refresh, error: rtErr } = await sb.rpc("dmi_get_google_refresh_token", { p_email: GMAIL_ROUTE_MAILBOX });
  if (rtErr || !refresh) return { ok: false, error: "mailbox_not_authorized" };
  let tr: Response;
  try {
    tr = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, refresh_token: String(refresh), grant_type: "refresh_token" }),
    });
  } catch {
    return { ok: false, error: "token_refresh_network_failure" };
  }
  if (!tr.ok) {
    let e = ""; try { e = String((await tr.json()).error ?? ""); } catch { /* ignore */ }
    return { ok: false, error: "token_refresh_failed", google_error: e.replace(/[^a-z_]/gi, "") };
  }
  const t = await tr.json();
  return { ok: true, access: String(t.access_token ?? ""), scope: String(t.scope ?? "") };
}

// ---------------- Gmail route: validate (no reservation, no send) ----------------
async function gmailValidate(taskNumber: string, idempotencyKey: string): Promise<Response> {
  const base = { action: "validate", task_number: taskNumber, idempotency_key: idempotencyKey, transport: "gmail_api", mailbox: GMAIL_ROUTE_MAILBOX };
  if (!GMAIL_ROUTE_CONFIGURED) return json({ ok: false, valid: false, gmail_route_ready: false, error: "gmail_route_not_configured", ...base }, 409);
  const sb = serviceClient();
  const { data: mb } = await sb.from("dmi_mailboxes").select("email_address,outbound_enabled").eq("email_address", GMAIL_ROUTE_MAILBOX).maybeSingle();
  if (!mb || !mb.outbound_enabled) return json({ ok: false, valid: false, gmail_route_ready: false, error: "mailbox_not_registered_or_outbound_disabled", ...base }, 409);
  const tok = await getAccessToken(sb);
  if (!tok.ok) return json({ ok: false, valid: false, gmail_route_ready: false, error: tok.error, google_error: tok.google_error, ...base }, 502);
  let authenticated = "";
  try {
    const p = await fetch(GMAIL_PROFILE_URL, { headers: { authorization: `Bearer ${tok.access}` } });
    if (p.ok) authenticated = String((await p.json()).emailAddress ?? "").toLowerCase();
  } catch { /* reported below */ }
  const hasSend = tok.scope.split(/\s+/).includes("https://www.googleapis.com/auth/gmail.send");
  const ready = authenticated === GMAIL_ROUTE_MAILBOX && hasSend;
  return json({ ok: ready, valid: ready, gmail_route_ready: ready, authenticated_mailbox: authenticated || null, gmail_send_scope: hasSend, ...base }, ready ? 200 : 409);
}

// ---------------- Gmail route: email_send ----------------
async function gmailSend(body: Record<string, unknown>, taskNumber: string, idempotencyKey: string): Promise<Response> {
  const base = { action: "email_send", task_number: taskNumber, idempotency_key: idempotencyKey, transport: "gmail_api", mailbox: GMAIL_ROUTE_MAILBOX };
  if (!GMAIL_ROUTE_CONFIGURED) {
    return json({ ok: false, duplicate: false, error: "Gmail API route is not configured; nothing sent", ...base }, 409);
  }

  // Validate payload BEFORE reserving, so a malformed request never consumes an idempotency key.
  const to = parseAddressField(body.to);
  const cc = parseAddressField(body.cc);
  const bcc = parseAddressField(body.bcc);
  if (!to || !cc || !bcc) return json({ ok: false, duplicate: false, error: "Invalid recipient address in to/cc/bcc; nothing sent", ...base }, 400);
  if (to.length === 0) return json({ ok: false, duplicate: false, error: "At least one 'to' recipient is required; nothing sent", ...base }, 400);
  if (typeof body.subject !== "string" || /[\r\n]/.test(body.subject)) {
    return json({ ok: false, duplicate: false, error: "subject must be a single-line string; nothing sent", ...base }, 400);
  }
  const subject = body.subject;
  const text = typeof body.body === "string" ? body.body : null;
  const html = typeof body.html_body === "string" && body.html_body !== "" ? body.html_body : null;
  if (!text && !html) return json({ ok: false, duplicate: false, error: "body or html_body is required; nothing sent", ...base }, 400);

  // Canonical payload hash: JSON with alphabetically ordered keys.
  const payloadHash = await sha256Hex(JSON.stringify({
    bcc, body: text, cc, html_body: html, mailbox: GMAIL_ROUTE_MAILBOX, subject, to,
  }));

  const sb = serviceClient();
  const { data: res, error: resErr } = await sb.rpc("dmi_outbound_reserve", {
    p_idempotency_key: idempotencyKey,
    p_task_number: taskNumber,
    p_mailbox: GMAIL_ROUTE_MAILBOX,
    p_payload_hash: payloadHash,
    p_recipients: { to, cc, bcc },
    p_subject: subject,
  });
  if (resErr || !res) return json({ ok: false, duplicate: false, error: "Idempotency reservation failed; nothing sent", ...base }, 500);

  const r = res as Record<string, any>;
  switch (r.decision) {
    case "duplicate":
      return json({
        ok: true, duplicate: true, ...base, upstream_status: 200,
        result: { ...(r.result ?? {}), status: "sent", provider_message_id: r.provider_message_id ?? null, provider_thread_id: r.provider_thread_id ?? null, sent_at: r.sent_at ?? null },
      }, 200);
    case "invalid":     return json({ ok: false, duplicate: false, decision: r.decision, error: r.error, ...base }, 400);
    case "conflict":
    case "in_progress":
    case "in_doubt":    return json({ ok: false, duplicate: false, decision: r.decision, error: r.error, send_id: r.send_id ?? null, ...base }, 409);
    case "rejected":    return json({ ok: false, duplicate: false, decision: r.decision, error: r.error ?? "Send rejected", send_id: r.send_id ?? null, ...base }, 422);
    case "send":        break;
    default:            return json({ ok: false, duplicate: false, error: "Unexpected reservation decision; nothing sent", ...base }, 500);
  }

  const sendId = String(r.send_id);
  const attempt = Number(r.attempt ?? 1);
  const fail = async (outcome: "retryable" | "permanent" | "in_doubt", error: string, result?: unknown) => {
    await sb.rpc("dmi_outbound_fail", { p_send_id: sendId, p_outcome: outcome, p_error: error, p_result: result ?? null });
  };

  // Token refresh failures happen before any Gmail submission: safe to retry later.
  const tok = await getAccessToken(sb);
  if (!tok.ok) {
    const err = tok.google_error ? `${tok.error}:${tok.google_error}` : tok.error;
    await fail("retryable", err);
    return json({ ok: false, duplicate: false, error: `${err}; nothing sent`, send_id: sendId, attempt, ...base }, 502);
  }

  let raw: string;
  try {
    raw = b64url(buildMime({ to, cc, bcc, subject, body: text, html, idempotencyKey, taskNumber }));
  } catch {
    await fail("permanent", "mime_build_failed");
    return json({ ok: false, duplicate: false, error: "MIME build failed; nothing sent", send_id: sendId, attempt, ...base }, 422);
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), SEND_TIMEOUT_MS);
  let resp: Response;
  try {
    resp = await fetch(GMAIL_SEND_URL, {
      method: "POST",
      headers: { authorization: `Bearer ${tok.access}`, "content-type": "application/json" },
      body: JSON.stringify({ raw }),
      signal: ctrl.signal,
    });
  } catch (e) {
    clearTimeout(timer);
    // The request may have reached Gmail: outcome unknown. Never auto-retry.
    const why = (e as Error)?.name === "AbortError" ? "gmail_send_timeout" : "gmail_send_network_failure";
    await fail("in_doubt", why);
    return json({ ok: false, duplicate: false, error: `${why}: outcome unknown; check Sent mail before releasing`, send_id: sendId, attempt, ...base }, 502);
  }
  clearTimeout(timer);

  let gb: any = null;
  try { gb = await resp.json(); } catch { /* non-JSON */ }

  if (resp.ok && gb?.id) {
    const sentAt = new Date().toISOString();
    const result = { status: "sent", provider_message_id: String(gb.id), provider_thread_id: gb.threadId ? String(gb.threadId) : null, label_ids: gb.labelIds ?? [], sent_at: sentAt, attempt };
    const { error: cErr } = await sb.rpc("dmi_outbound_complete", {
      p_send_id: sendId, p_provider_message_id: result.provider_message_id, p_provider_thread_id: result.provider_thread_id, p_result: result,
    });
    return json({
      ok: true, duplicate: false, ...base, upstream_status: resp.status, result,
      ...(cErr ? { ledger_warning: "Sent, but ledger completion failed; the key will surface as in_doubt rather than resend" } : {}),
    }, 200);
  }

  const reason = String(gb?.error?.errors?.[0]?.reason ?? gb?.error?.status ?? "").replace(/[^A-Za-z_]/g, "");
  const s = resp.status;
  let outcome: "retryable" | "permanent" | "in_doubt";
  if (resp.ok) outcome = "in_doubt";                          // 2xx without a message id
  else if (s === 429 || s === 503 || s === 401 || s === 403) outcome = "retryable";
  else if (s >= 500) outcome = "in_doubt";
  else outcome = "permanent";                                 // 400/404/413 and other 4xx
  const err = `gmail_send_${s}${reason ? ":" + reason : ""}`;
  await fail(outcome, err, { upstream_status: s, reason });
  return json({
    ok: false, duplicate: false, error: outcome === "in_doubt" ? `${err}: outcome unknown; check Sent mail before releasing` : err,
    outcome, send_id: sendId, attempt, upstream_status: s, ...base,
  }, outcome === "permanent" ? 422 : 502);
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ ok: false, error: "POST required" }, 405);

  const configuredInternalToken = Deno.env.get("DMI_BRIDGE_TOKEN") ?? "";
  const suppliedInternalToken = req.headers.get("x-dmi-internal-token") ?? "";
  if (!configuredInternalToken || !suppliedInternalToken || !timingSafeEqual(configuredInternalToken, suppliedInternalToken)) {
    return json({ ok: false, error: "Unauthorized DMI internal request" }, 401);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON" }, 400);
  }

  const action = String(body.action ?? "health");
  if (!ALLOWED.has(action)) return json({ ok: false, error: "Unsupported DMI action" }, 400);

  const bridgeUrl = Deno.env.get("DMI_APPS_SCRIPT_URL") ?? "";
  const bridgeToken = Deno.env.get("DMI_BRIDGE_TOKEN") ?? "";
  const configured = Boolean(bridgeUrl && bridgeToken);

  if (action === "health") {
    return json({
      ok: true,
      service: "Dominion Intelligence Mail System",
      identifier: "DMI",
      system_account: "pistiskratos@gmail.com",
      mode: configured ? "configured" : "fail_closed",
      live_mail_enabled: configured,
      bridge_configured: configured,
      supported_actions: ["email_send", "email_draft", "email_watch"],
      adapter_version: "v10",
      gmail_route: {
        mailbox: GMAIL_ROUTE_MAILBOX,
        transport: "gmail_api",
        actions: ["email_send"],
        configured: GMAIL_ROUTE_CONFIGURED,
        selector: "mailbox",
      },
    });
  }

  const idempotencyKey = typeof body.idempotency_key === "string" ? body.idempotency_key.trim() : "";
  const taskNumber = typeof body.task_number === "string" ? body.task_number.trim() : "";
  if (!idempotencyKey || !taskNumber) {
    return json({ ok: false, error: "task_number and idempotency_key are required" }, 400);
  }

  // Mailbox routing (new). Absent mailbox => legacy path below, unchanged.
  if (hasMailbox(body.mailbox)) {
    const mailbox = typeof body.mailbox === "string" ? body.mailbox.trim().toLowerCase() : "";
    if (action !== "email_send" && action !== "validate") {
      return json({ ok: false, error: "mailbox routing is supported only for email_send; nothing performed", action, task_number: taskNumber, idempotency_key: idempotencyKey }, 400);
    }
    if (mailbox !== GMAIL_ROUTE_MAILBOX) {
      return json({ ok: false, error: "Unsupported mailbox; nothing performed", action, task_number: taskNumber, idempotency_key: idempotencyKey }, 400);
    }
    return action === "validate" ? gmailValidate(taskNumber, idempotencyKey) : gmailSend(body, taskNumber, idempotencyKey);
  }

  // ---------------- Legacy Apps Script path (v9, unchanged) ----------------
  if (action === "validate") {
    return json({ ok: true, valid: true, bridge_configured: configured, live_mail_enabled: configured, task_number: taskNumber, idempotency_key: idempotencyKey });
  }

  if (!configured) {
    return json({
      ok: false,
      skipped: true,
      live_mail_enabled: false,
      bridge_configured: false,
      action,
      task_number: taskNumber,
      idempotency_key: idempotencyKey,
      reason: "DMI Apps Script bridge URL/token are not configured in protected Edge Function secrets. No email action was performed."
    }, 409);
  }

  const upstreamPayload = { ...body, bridge_token: bridgeToken };
  let upstream: Response;
  try {
    upstream = await fetch(bridgeUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(upstreamPayload),
      redirect: "follow",
    });
  } catch (err) {
    return json({ ok: false, error: `DMI bridge network failure: ${String(err)}`, task_number: taskNumber, idempotency_key: idempotencyKey }, 502);
  }

  const text = await upstream.text();
  let upstreamBody: unknown = text;
  try { upstreamBody = JSON.parse(text); } catch { /* preserve text */ }

  return json({
    ok: upstream.ok && Boolean((upstreamBody as any)?.ok ?? true),
    action,
    task_number: taskNumber,
    idempotency_key: idempotencyKey,
    upstream_status: upstream.status,
    result: upstreamBody
  }, upstream.ok ? 200 : 502);
});
