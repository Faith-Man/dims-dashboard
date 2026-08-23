// TETELESTAI browser recovery loader.
// Activates only if the canonical module leaves Projects/Tasks in Loading state.
const SUPABASE_URL='https://sdquzhsylqpbhrmqjqgk.supabase.co';
const SUPABASE_KEY='sb_publishable_volaz6N52Pc4rdh8a4dfEw_MjJ73How';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=v=>v?new Date(`${String(v).slice(0,10)}T12:00:00`).toLocaleDateString():'—';
const rac=r=>r.system_rac?(r.risk_severity&&r.risk_probability?`${r.system_rac} (${r.risk_severity}, ${r.risk_probability})`:String(r.system_rac)):'—';
const status=r=>String(r.status||'Open').replaceAll('_',' ').replace(/\b\w/g,m=>m.toUpperCase());
const owner=r=>({dominion1st_di:'🚀 Dominion1st DI',pastor_michael:'👑 Pastor H. Michael Daniels',shared:'🤝 Shared',external:'↗ External'})[r.action_owner]||r.action_owner||'—';
async function table(name){
  const res=await fetch(`${SUPABASE_URL}/rest/v1/${name}?select=*`,{headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`},cache:'no-store'});
  if(!res.ok)throw new Error(`${name} ${res.status}: ${await res.text()}`);
  return res.json();
}
function render(container,rows,kind){
  const numberKey=kind==='project'?'project_number':'task_number';
  const ordered=[...rows].sort((a,b)=>(Number(a.system_rac)||99)-(Number(b.system_rac)||99)||String(a[numberKey]||'').localeCompare(String(b[numberKey]||''),undefined,{numeric:true}));
  const cols=['Date','Number','Project/Task','RAC','Priority','Status','Owner','Follow-Up','Progress','View'];
  container.innerHTML=`<div class="dims-grid-wrap"><table class="dims-grid"><thead><tr>${cols.map(c=>`<th>${c}</th>`).join('')}</tr></thead><tbody>${ordered.map(r=>`<tr tabindex="0" data-recovery-row="1"><td data-label="Date Entered">${fmt(r.created_at)}</td><td data-label="Number"><span class="permanent-number">${esc(r[numberKey]||'—')}</span></td><td data-label="Project/Task"><button class="title-button" type="button">${esc(r.title||'Untitled')}</button><span class="next-preview">${esc(r.next_action||'No next action recorded')}</span></td><td data-label="RAC"><span class="rac-main">${esc(rac(r))}<small></small></span></td><td data-label="Priority">${esc(r.priority||'medium')}</td><td data-label="Status">${esc(status(r))}</td><td data-label="Owner">${esc(owner(r))}</td><td data-label="Follow-Up">${fmt(r.next_follow_up_date||r.target_date)}</td><td data-label="Progress">${Math.max(0,Math.min(100,Number(r.percent_complete)||0))}%</td><td data-label="View"><button class="view-button" type="button" disabled title="Canonical detail module is recovering">View</button></td></tr>`).join('')}</tbody></table></div>`;
}
async function recover(){
  const p=document.getElementById('projectsList'),t=document.getElementById('tasksList');
  if(!p||!t)return;
  const stillLoading=/Loading/i.test(p.textContent)||/Loading/i.test(t.textContent);
  if(!stillLoading)return;
  try{
    const [projects,tasks]=await Promise.all([table('projects'),table('tasks')]);
    render(p,projects,'project');render(t,tasks,'task');
    const pc=document.getElementById('projCount'),tc=document.getElementById('taskCount');if(pc)pc.textContent=`(${projects.length})`;if(tc)tc.textContent=`(${tasks.length})`;
    const summary=document.getElementById('accountabilitySummary');if(summary)summary.innerHTML='<div class="identity-note">Recovery mode active — operational records loaded directly from Supabase while canonical client initialization is repaired.</div>';
    document.documentElement.dataset.tetelestaiRecovery='active';
    window.dispatchEvent(new CustomEvent('tetelestai:recovered',{detail:{projects:projects.length,tasks:tasks.length}}));
  }catch(error){
    const msg=`TETELESTAI load error: ${error.message}`;p.textContent=msg;t.textContent=msg;console.error(msg,error);
  }
}
setTimeout(recover,1800);
