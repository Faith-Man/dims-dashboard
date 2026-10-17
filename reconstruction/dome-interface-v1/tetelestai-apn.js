import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const sbApn = createClient(
  'https://sdquzhsylqpbhrmqjqgk.supabase.co',
  'sb_publishable_volaz6N52Pc4rdh8a4dfEw_MjJ73How'
);

// AFI 91-202 APN severity/probability multiplier matrix.
// APN = RAC (CEI); CEI = Cost / (Multiplier × Exposure).
const APN_MULTIPLIER = {
  I:   { A: 188, B: 63, C: 21, D: 7 },
  II:  { A: 63,  B: 21, C: 7,  D: 2 },
  III: { A: 21,  B: 7,  C: 2,  D: 1 },
  IV:  { A: 7,   B: 2,  C: 1,  D: 0.26 }
};

const css = `
.apn-panel{margin:14px 0 4px;border:2px solid #0F52BA;border-radius:12px;background:#f8fbff;padding:14px}
.apn-panel h3{margin:0 0 4px;color:#0c1475;font-size:1rem}
.apn-panel p{margin:5px 0;color:#526079;font-size:.76rem;line-height:1.45}
.apn-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:12px}
.apn-field label{display:block;color:#0c1475;font-size:.7rem;font-weight:800;margin-bottom:4px;text-transform:uppercase;letter-spacing:.03em}
.apn-field input{width:100%;box-sizing:border-box;border:1px solid #b9c6dc;border-radius:8px;padding:9px;background:#fff;color:#172033}
.apn-result{margin-top:12px;padding:12px;border-radius:10px;background:#fff;border:1px solid #cbd8ec}
.apn-result strong{color:#0c1475}
.apn-code{font-size:1.2rem;font-weight:900;color:#0F52BA;margin-bottom:5px}
.apn-equation{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.76rem;color:#344054;overflow-wrap:anywhere}
.apn-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.apn-actions button{border:1px solid #0F52BA;background:#fff;color:#0c1475;border-radius:8px;padding:7px 11px;font-weight:800;cursor:pointer}
.apn-actions button.primary{background:#0F52BA;color:#fff}
.apn-warning{margin-top:8px;padding:8px 10px;border-radius:8px;background:#fff6df;color:#704d00;font-size:.75rem}
@media(max-width:700px){.apn-grid{grid-template-columns:1fr}}
`;
const style = document.createElement('style');
style.textContent = css;
document.head.appendChild(style);

const fmtNumber = value => {
  if (!Number.isFinite(value)) return '—';
  if (Math.abs(value - Math.round(value)) < 0.000001) return String(Math.round(value));
  return value.toFixed(value < 1 ? 3 : 2).replace(/0+$/,'').replace(/\.$/,'');
};

function drawerContext() {
  const drawer = document.getElementById('drawerContent');
  if (!drawer) return null;
  const kindText = document.getElementById('drawerKind')?.textContent?.toLowerCase() || '';
  const kind = kindText.includes('project') ? 'project' : kindText.includes('task') ? 'task' : null;
  const numberField = [...drawer.querySelectorAll('.detail-field')].find(field =>
    field.querySelector('dt')?.textContent?.trim().toLowerCase() === 'permanent number'
  );
  const number = numberField?.querySelector('dd')?.textContent?.trim();
  const method = drawer.querySelector('.priority-method-state')?.textContent?.trim() || '';
  if (!kind || !number || number === '—') return null;
  return { drawer, kind, number, apnMode: method.startsWith('APN') };
}

async function fetchRecord(context) {
  const table = context.kind === 'project' ? 'projects' : 'tasks';
  const numberColumn = context.kind === 'project' ? 'project_number' : 'task_number';
  const { data, error } = await sbApn
    .from(table)
    .select(`id,${numberColumn},priority_method,system_rac,risk_severity,risk_probability,apn_cost,apn_exposure`)
    .eq(numberColumn, context.number)
    .single();
  if (error) return null;
  return data;
}

function calculate(record, cost, exposure) {
  const severity = String(record.risk_severity || '').toUpperCase();
  const probability = String(record.risk_probability || '').toUpperCase();
  const multiplier = APN_MULTIPLIER[severity]?.[probability];
  const rac = Number(record.system_rac);
  if (!rac || !multiplier) return { error: 'APN requires an assessed RAC using safety Severity I–IV and Probability A–D.' };
  if (!Number.isFinite(cost) || cost < 0) return { error: 'Enter a valid total abatement project cost.' };
  if (!Number.isFinite(exposure) || exposure <= 0) return { error: 'Enter the average number of personnel exposed daily.' };
  const effectiveness = multiplier * exposure;
  const cei = cost / effectiveness;
  return { rac, severity, probability, multiplier, cost, exposure, effectiveness, cei, apn: `${rac} (${fmtNumber(cei)})` };
}

function renderResult(panel, record) {
  const cost = Number(panel.querySelector('[data-apn-cost]').value);
  const exposure = Number(panel.querySelector('[data-apn-exposure]').value);
  const result = calculate(record, cost, exposure);
  const target = panel.querySelector('[data-apn-result]');
  if (result.error) {
    target.innerHTML = `<div class="apn-warning">${result.error}</div>`;
    return result;
  }
  target.innerHTML = `
    <div class="apn-code">APN ${result.apn}</div>
    <div><strong>RAC:</strong> ${result.rac} (${result.severity}, ${result.probability})</div>
    <div><strong>Multiplier (M):</strong> ${fmtNumber(result.multiplier)}</div>
    <div><strong>Exposure (E):</strong> ${fmtNumber(result.exposure)} personnel/day</div>
    <div><strong>Cost (C):</strong> $${result.cost.toLocaleString(undefined,{maximumFractionDigits:2})}</div>
    <div><strong>Effectiveness Index:</strong> M × E = ${fmtNumber(result.effectiveness)}</div>
    <div class="apn-equation"><strong>CEI = C ÷ (M × E)</strong> = ${fmtNumber(result.cost)} ÷ (${fmtNumber(result.multiplier)} × ${fmtNumber(result.exposure)}) = ${fmtNumber(result.cei)}</div>
    <p><strong>Priority rule:</strong> compare CEI only among records with the same RAC. Lower CEI = higher relative abatement priority.</p>`;
  return result;
}

async function saveInputs(panel, context, record) {
  const result = renderResult(panel, record);
  if (result.error) return alert(result.error);
  const { data: { session } } = await sbApn.auth.getSession();
  if (!session) return alert('Please sign in to DOME before saving APN inputs.');
  const button = panel.querySelector('[data-apn-save]');
  button.disabled = true;
  button.textContent = 'Saving…';
  const { data, error } = await sbApn.functions.invoke('tetelestai-control', {
    body: {
      action: 'update_current',
      record_type: context.kind,
      record_id: record.id,
      fields: { apn_cost: result.cost, apn_exposure: result.exposure },
      reason: 'Update APN safety-hazard cost and personnel exposure inputs.'
    }
  });
  button.disabled = false;
  button.textContent = 'Save APN Inputs';
  if (error || data?.error) return alert(data?.error || error?.message || 'APN update failed.');
  alert(`APN ${result.apn} saved from current RAC, cost, and exposure inputs.`);
}

async function injectApnPanel() {
  const context = drawerContext();
  const existing = document.querySelector('#drawerContent .apn-panel');
  if (!context?.apnMode) {
    existing?.remove();
    return;
  }
  if (existing) return;
  const record = await fetchRecord(context);
  if (!record || record.priority_method !== 'apn') return;
  const priorityRow = context.drawer.querySelector('.priority-method-row');
  if (!priorityRow) return;

  const panel = document.createElement('section');
  panel.className = 'apn-panel';
  panel.innerHTML = `
    <h3>APN — Abatement Priority Number</h3>
    <p>Safety-hazard mode uses the adopted APN method: <strong>APN = RAC (CEI)</strong>, where <strong>CEI = Cost ÷ (Severity/Probability Multiplier × Exposure)</strong>.</p>
    <div class="apn-grid">
      <div class="apn-field"><label>Abatement Cost (C)</label><input data-apn-cost type="number" min="0" step="0.01" value="${record.apn_cost ?? ''}" placeholder="Estimated total cost"></div>
      <div class="apn-field"><label>Daily Personnel Exposure (E)</label><input data-apn-exposure type="number" min="0.01" step="0.01" value="${record.apn_exposure ?? ''}" placeholder="Average personnel exposed daily"></div>
    </div>
    <div class="apn-result" data-apn-result></div>
    <div class="apn-actions"><button type="button" data-apn-calc>Calculate APN</button><button type="button" class="primary" data-apn-save>Save APN Inputs</button></div>
    <p>Multiplier is derived automatically from the same Severity and Probability used for the RAC. The multiplier matrix is I: 188/63/21/7; II: 63/21/7/2; III: 21/7/2/1; IV: 7/2/1/0.26 for probabilities A/B/C/D.</p>`;
  priorityRow.insertAdjacentElement('afterend', panel);
  panel.querySelector('[data-apn-calc]').onclick = () => renderResult(panel, record);
  panel.querySelector('[data-apn-save]').onclick = () => saveInputs(panel, context, record);
  panel.querySelectorAll('input').forEach(input => input.addEventListener('input', () => renderResult(panel, record)));
  renderResult(panel, record);
}

const drawer = document.getElementById('drawerContent');
if (drawer) new MutationObserver(() => injectApnPanel()).observe(drawer, { childList: true, subtree: true, characterData: true });
setInterval(injectApnPanel, 1200);
injectApnPanel();
