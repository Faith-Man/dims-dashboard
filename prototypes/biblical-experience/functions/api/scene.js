/**
 * POST /api/scene
 * body: { subject, scriptureRef, scenePrompt }
 * Returns { status:"generated", imageUrl, alt } when an approved server-side image provider is connected.
 */
function clean(v,n=1200){return String(v||'').trim().slice(0,n)}
async function generateScene(input,env){
 if(!env || !env.IMAGE_GENERATOR) return null;
 return env.IMAGE_GENERATOR({
  prompt:`Create a cinematic immersive biblical environment for a Scripture-centered experience.
Subject: ${input.subject}
Scripture reference: ${input.scriptureRef}
Creative direction: ${input.scenePrompt}
No readable text in the image. Do not depict invented details as canonical Scripture. Favor environment, light, atmosphere, depth, and visual symbolism. Leave useful negative space for HTML content.`
 });
}
export async function onRequestPost({request,env}){
 try{
  const b=await request.json(),input={subject:clean(b.subject,60),scriptureRef:clean(b.scriptureRef,100),scenePrompt:clean(b.scenePrompt)};
  if(!input.subject||!input.scenePrompt)return Response.json({error:'Subject and scene prompt are required.'},{status:400});
  const out=await generateScene(input,env);
  if(!out)return Response.json({status:'adapter_ready',message:'Dynamic image provider is not connected on this preview environment.'},{status:503});
  return Response.json({status:'generated',imageUrl:out.imageUrl,alt:out.alt||('Cinematic biblical environment for '+input.subject)});
 }catch(e){return Response.json({error:'Scene generation failed.'},{status:500});}
}