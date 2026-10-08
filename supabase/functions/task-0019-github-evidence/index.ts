// TASK-0019 isolated Supabase Edge Function. Fail-closed until secrets are configured.
// GitHub sends POST requests with x-hub-signature-256, x-github-event, x-github-delivery.
import { createClient } from 'npm:@supabase/supabase-js@2';
const json=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json'}});
const encoder=new TextEncoder();
const hex=(bytes:Uint8Array)=>Array.from(bytes).map(x=>x.toString(16).padStart(2,'0')).join('');
const equal=(a:string,b:string)=>{if(a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);return d===0;};
Deno.serve(async(req)=>{
 if(req.method!=='POST')return json({error:'POST required'},405);
 const secret=Deno.env.get('TASK_0019_GITHUB_WEBHOOK_SECRET');
 const url=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
 if(!secret||secret.length<24||!url||!key)return json({error:'Receiver not configured'},503);
 const size=Number(req.headers.get('content-length')||0);
 if(size>1048576)return json({error:'Payload too large'},413);
 let raw:Uint8Array;
 try{const buffer=await req.arrayBuffer();if(buffer.byteLength>1048576)return json({error:'Payload too large'},413);raw=new Uint8Array(buffer);}catch{return json({error:'Invalid payload'},400);}
 const signature=req.headers.get('x-hub-signature-256')||'';
 if(!/^sha256=[a-f0-9]{64}$/.test(signature))return json({error:'Unauthorized'},401);
 const cryptoKey=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const digest=hex(new Uint8Array(await crypto.subtle.sign('HMAC',cryptoKey,raw)));
 if(!equal(signature,'sha256='+digest))return json({error:'Unauthorized'},401);
 const event=req.headers.get('x-github-event')||'';
 const delivery=req.headers.get('x-github-delivery')||'';
 if(!/^[A-Za-z0-9-]{1,180}$/.test(delivery))return json({error:'Invalid delivery ID'},400);
 if(!['push','pull_request'].includes(event))return json({ignored:true},200);
 let payload:any;try{payload=JSON.parse(new TextDecoder().decode(raw));}catch{return json({error:'Invalid JSON'},400);}
 if(payload?.repository?.full_name!=='Faith-Man/dims-dashboard')return json({ignored:true},200);
 const messages=event==='push'?(payload.commits||[]).map((c:any)=>c.message||''):[payload.pull_request?.title||'',payload.pull_request?.body||''];
 const matches=[...new Set(messages.join(' ').match(/TASK-\d{4,}/g)||[])].slice(0,100);
 const row={provider:'github',event_id:delivery,reference:String(payload?.repository?.html_url||'').slice(0,2048),description:(event+' evidence').slice(0,4000),task_numbers:matches,disposition:matches.length===1?'pending_review':'needs_manual_matching',review_state:'unreviewed',verified_closed:false};
 const client=createClient(url,key,{auth:{persistSession:false}});
 const {data,error}=await client.from('sync_evidence_inbox').upsert(row,{onConflict:'provider,event_id',ignoreDuplicates:true}).select('provider,event_id,review_state,verified_closed').maybeSingle();
 if(error)return json({error:'Storage failed'},503);
 let stored=data;
 if(!stored){const result=await client.from('sync_evidence_inbox').select('provider,event_id,review_state,verified_closed').eq('provider','github').eq('event_id',delivery).maybeSingle();if(result.error)return json({error:'Read-back failed'},503);stored=result.data;}
 if(!stored||stored.provider!=='github'||stored.event_id!==delivery||stored.review_state!=='unreviewed'||stored.verified_closed!==false)return json({error:'Verification failed'},503);
 return json({accepted:Boolean(data),duplicate:!data,review_state:'unreviewed'},data?202:200);
});
