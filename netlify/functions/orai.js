export async function handler(event, context) {
  try {
    if (event.httpMethod !== 'POST') { return json({ ok:true, message:'Use POST with {mode,...}'}); }
    const body = JSON.parse(event.body || '{}');
    const mode = body.mode || 'dims_brief';
    const userInput = body.input || '';
    const teachings = body.teachings || [];

    const systemDims = `You are OrEl embedded in DIMS. Use Optimized DIMS Style: concise, Dominion1st blue voice, italics for scripture. Sections: Now Word, World Intel (3), Bridge Intel (3), Personal Intel (3), Divine Directives (2–4 imperatives), 2 scripture lines.`;
    const systemProphesy = `You are OrEl (Prophetic Flow). Generate a Now Word + Confession with 1–2 scripture lines (italicized with refs).`;
    const systemDoctrine = `You are OrEl (Doctrine Draft). Create a Markdown doctrine: Title; Status line; ## Core Points (3–6); ## Scriptures (italicized quotes with refs); **Declaration:** one sentence in italics.`;

    const sys = mode==='prophesy_flow'?systemProphesy : mode==='doctrine_draft'?systemDoctrine : systemDims;
    const prompt = [{role:'system',content:sys},{role:'user',content:userInput||'Generate today’s brief succinctly.'}];
    if(Array.isArray(teachings)&&teachings.length){ prompt.push({role:'system',content:'Context titles: '+teachings.map(t=>t.title).join('; ')}); }

    const apiKey = process.env.OPENAI_API_KEY || '';
    if(!apiKey){ return json({ ok:true, offline:true, data: offline(mode) }); }

    const resp = await fetch('https://api.openai.com/v1/chat/completions',{
      method:'POST',
      headers:{'Authorization':'Bearer '+apiKey,'Content-Type':'application/json'},
      body: JSON.stringify({ model:'gpt-4o-mini', messages: prompt, temperature: mode==='prophesy_flow'?0.9:0.5, max_tokens: 700 })
    });
    if(!resp.ok){ return json({ ok:false, error:'Upstream error', detail: await resp.text() }, 500); }
    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content || '(no content)';
    return json({ ok:true, data: content });
  } catch(e){ return json({ ok:false, error:e.message }, 500); }
}
function json(obj,status=200){ return { statusCode:status, headers:{'Content-Type':'application/json'}, body: JSON.stringify(obj)}; }
function offline(mode){
  if(mode==='prophesy_flow') return 'Now Word: "Rise and build; provision meets obedience."\n\n*"Be strong and courageous..."* (Joshua 1:9)\n*"Write the vision; make it plain."* (Habakkuk 2:2)\n\n**Confession:** *I advance by His word today.*';
  if(mode==='doctrine_draft') return 'Created in His Image\nStatus: 🟢 Open · Priority: 👑 High\n\n## Core Points\n1. Identity precedes assignment.\n2. Image → authority and stewardship.\n3. Dominion flows from alignment.\n\n## Scriptures\n*"Let us make mankind in our image..."* (Gen 1:26-28)\n*"Put on the new self..."* (Col 3:10)\n\n**Declaration:** *I reflect His image and move in wise dominion.*';
  return '🕊️ Prophetic Word — Today\nNow Word: "Occupy the gates; supply is already in motion."\n\n🌍 World Intel\n• Talks stall in Eastern Europe; energy routes shift.\n• Markets wobble on tech policy; liquidity rotates.\n• Tropics active; readiness matters.\n\n🌉 Bridge Intel\n• Faith–AI funds emphasize privacy and ethics.\n• Civic–church drills quicken disaster response.\n• Governance tools bring order to chaos.\n\n💠 Personal Intel\n• Clarity in finances; crypto/tax path opens.\n• Prophetic Systems momentum.\n• Branding/design progress.';
}
