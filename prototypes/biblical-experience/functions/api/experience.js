/**
 * Dominion1st Dynamic Biblical Experience — generation adapter
 * Prototype server contract. Keep AI credentials server-side.
 *
 * POST /api/experience
 * body: { subject, mode, day, duration }
 *
 * Provider hookup is intentionally isolated in generateWithProvider().
 */
const SYSTEM_RULES = `You generate Scripture-centered Dominion1st biblical experiences.
Use KJV Scripture only. Never invent or paraphrase a Bible quotation while labeling it KJV.
Keep biblical context intact. Distinguish Scripture from application.
Return JSON only matching the requested schema.
The experience sequence is IT IS WRITTEN → SEE → DOMINION1st MINDSET → DOMINION1st DECLARATION → DOiT.
Visual direction may be cinematic and imaginative, but must not alter the biblical text or claim invented details are Scripture.`;

function normalizeSubject(value){
  return String(value||'').trim().replace(/[^a-zA-Z0-9 '&-]/g,'').slice(0,60).toUpperCase();
}
function schema(subject){
 return {
  subject,scenePrompt:"string",subtitle:"string",
  scripture:{text:"full KJV verse text",ref:"Book chapter:verse KJV",thought:"biblically grounded explanation"},
  see:{lead:"string",overline:"string",title:"string",body:"string"},
  mindset:{lead:"string",body:"string"},
  declaration:["first-person declaration"],
  doit:{lead:"string",body:"specific practical action"}
 };
}
async function generateWithProvider(input,env){
 // Provider-neutral boundary. Configure the approved server-side AI provider here.
 // Never expose env credentials to the browser.
 if(!env || !env.AI_GENERATOR) return null;
 return env.AI_GENERATOR({system:SYSTEM_RULES,input,schema:schema(input.subject)});
}
export async function onRequestPost({request,env}){
 try{
  const body=await request.json(),subject=normalizeSubject(body.subject);
  if(!subject) return Response.json({error:'A biblical focus subject is required.'},{status:400});
  const input={subject,mode:['theme','journey','countdown'].includes(body.mode)?body.mode:'theme',day:Math.max(1,Number(body.day)||1),duration:Math.max(1,Math.min(365,Number(body.duration)||1))};
  const generated=await generateWithProvider(input,env);
  if(!generated) return Response.json({status:'adapter_ready',subject,message:'Live AI provider is not connected on this preview environment.',schema:schema(subject)},{status:503});
  return Response.json({status:'generated',experience:generated});
 }catch(e){return Response.json({error:'Experience generation failed.'},{status:500});}
}