import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
// Resolve Google OAuth credentials by shape so a swapped ID/secret pair in the
// Edge secrets still works. Values are never logged or returned.
const ID_RE=/^\d+-[a-z0-9]+\.apps\.googleusercontent\.com$/;
const SECRET_RE=/^GOCSPX-[A-Za-z0-9_-]+$/;
const RAW_ID=(Deno.env.get("DMI_GOOGLE_CLIENT_ID")??"").trim();
const RAW_SECRET=(Deno.env.get("DMI_GOOGLE_CLIENT_SECRET")??"").trim();
let CLIENT_ID="",CLIENT_SECRET="",CRED_STATE="unresolved";
if(ID_RE.test(RAW_ID)&&SECRET_RE.test(RAW_SECRET)){CLIENT_ID=RAW_ID;CLIENT_SECRET=RAW_SECRET;CRED_STATE="ok";}
else if(ID_RE.test(RAW_SECRET)&&SECRET_RE.test(RAW_ID)){CLIENT_ID=RAW_SECRET;CLIENT_SECRET=RAW_ID;CRED_STATE="swapped";}
const SUPABASE_URL=Deno.env.get("SUPABASE_URL")??"";
const SERVICE_KEY=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")??"";
const REDIRECT_URI="https://sdquzhsylqpbhrmqjqgk.supabase.co/functions/v1/dmi-gmail-oauth/callback";
// TASK-0098 scope minimization: gmail.modify removed (no deployed DMI code uses it).
// gmail.readonly = sync (profile/history/messages); gmail.send = dmi-mail-adapter; userinfo.email + openid = mailbox check.
const SCOPES=["https://www.googleapis.com/auth/gmail.readonly","https://www.googleapis.com/auth/gmail.send","https://www.googleapis.com/auth/userinfo.email","openid"].join(" ");
const REQUIRED=["https://www.googleapis.com/auth/gmail.readonly","https://www.googleapis.com/auth/gmail.send"];
function page(m:string,s=200){return new Response(`<!doctype html><meta name="viewport" content="width=device-width"><body style="font-family:system-ui;background:#071426;color:white;padding:32px;max-width:760px;margin:auto"><h1>DMI™ Gmail Authorization</h1><p>${m}</p></body>`,{status:s,headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store"}})}
Deno.serve(async(req)=>{
 const u=new URL(req.url);
 if(!SUPABASE_URL||!SERVICE_KEY)return page("DMI authorization is not fully configured.",500);
 if(CRED_STATE==="unresolved")return page("DMI Google OAuth credentials are not in the expected format (Client ID ending .apps.googleusercontent.com and a GOCSPX- client secret). Update DMI_GOOGLE_CLIENT_ID / DMI_GOOGLE_CLIENT_SECRET.",500);
 if(u.pathname.endsWith("/callback")){
  if(u.searchParams.get("error"))return page("Google authorization was not completed.",400);
  const c=u.searchParams.get("code"); if(!c)return page("Missing Google authorization code.",400);
  const tr=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({code:c,client_id:CLIENT_ID,client_secret:CLIENT_SECRET,redirect_uri:REDIRECT_URI,grant_type:"authorization_code"})});
  if(!tr.ok){let e="";try{e=String((await tr.json()).error??"")}catch{}return page(`Google token exchange failed${e?` (${e.replace(/[^a-z_]/gi,"")})`:""}. DMI remains pending.`,502);}
  const t=await tr.json(); if(!t.refresh_token)return page("Google did not return an offline refresh credential. DMI remains pending.",409);
  // Refuse a grant that is missing a scope DMI needs, so a partial consent never replaces the working credential.
  const granted=String(t.scope??"").split(/\s+/);
  const missing=REQUIRED.filter(s=>!granted.includes(s));
  if(missing.length)return page(`Google did not grant all required permissions (${missing.map(s=>s.split("/").pop()).join(", ")}). Nothing was changed; please authorize again and allow every permission.`,409);
  const ur=await fetch("https://www.googleapis.com/oauth2/v2/userinfo",{headers:{authorization:`Bearer ${t.access_token}`}});
  if(!ur.ok)return page("Could not verify the authorized Google mailbox.",502);
  const ui=await ur.json(); const email=String(ui.email??"").toLowerCase();
  if(email!=="michael@dominion1st.org")return page("Wrong Google account authorized. Please authorize michael@dominion1st.org.",403);
  const sb=createClient(SUPABASE_URL,SERVICE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
  const {error}=await sb.rpc("dmi_store_google_refresh_token",{p_email:email,p_refresh_token:t.refresh_token});
  if(error)return page("Authorization succeeded at Google, but DMI could not securely store the connection. DMI remains pending.",500);
  const extra=granted.includes("https://www.googleapis.com/auth/gmail.modify")?" Note: Google still reports gmail.modify on this grant; remove DMI's access in your Google Account and authorize once more to drop it.":"";
  return page("DMI authorization succeeded for michael@dominion1st.org. The refresh credential is encrypted in Supabase Vault. You may close this page and report: Authorized."+extra);
 }
 const a=new URL("https://accounts.google.com/o/oauth2/v2/auth");
 // include_granted_scopes=false: do not fold previously granted scopes (e.g. gmail.modify) into the new grant.
 a.search=new URLSearchParams({client_id:CLIENT_ID,redirect_uri:REDIRECT_URI,response_type:"code",scope:SCOPES,access_type:"offline",prompt:"consent",include_granted_scopes:"false",login_hint:"michael@dominion1st.org"}).toString();
 return Response.redirect(a.toString(),302);
});
