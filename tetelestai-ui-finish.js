// Presentation layer for the RAC-first TETELESTAI interface.
// Core RAC data, filtering, sorting, status, and record rendering remain native in tetelestai-closed-loop.js.
const css = `
.dims-grid-menu{min-width:290px!important;max-width:380px!important;padding:10px!important}
.dims-grid-menu .menu-label{display:block;padding:7px 10px 5px!important;text-align:left!important;color:#667085;font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.06em}
.dims-grid-menu button{display:block;width:100%;padding:9px 10px!important;text-align:left!important;border:0;background:transparent;border-radius:7px!important;cursor:pointer}
.dims-grid-menu button:hover{background:#eef5ff}
.dims-grid-menu .filter-option{display:grid!important;grid-template-columns:18px minmax(0,1fr)!important;align-items:start!important;gap:10px!important;padding:8px 10px!important;margin:1px 0!important;border-radius:7px;cursor:pointer}
.dims-grid-menu .filter-option:hover{background:#eef5ff}
.dims-grid-menu .filter-option input{margin:2px 0 0!important;width:16px!important;height:16px!important;justify-self:start!important}
.dims-grid-menu .filter-option span{display:block!important;text-align:left!important;line-height:1.3!important;overflow-wrap:anywhere!important}
.dims-grid-menu .menu-divider{height:1px;background:#d9deea;margin:8px 0!important}

/* RAC-first table: remove the visible execution Rank column. RAC is the primary visible ordering control. */
.dims-grid th:first-child,.dims-grid td:first-child{display:none!important}
.dims-grid th{background:#0F52BA!important;color:#fff!important}
.rac-main{font-weight:900;color:#0c1475;white-space:nowrap;cursor:help;text-decoration:underline dotted;text-underline-offset:3px}
.rac-main small{display:block;font-weight:700;color:#667085;margin-top:2px;text-decoration:none}
.rac-na{color:#8b94a7}
.badge{white-space:nowrap!important}

/* View: horizontal record rows on desktop; stacked rows on mobile. */
.detail-grid{display:block!important}
.detail-field,.detail-field.full{display:grid!important;grid-template-columns:minmax(170px,26%) minmax(0,1fr)!important;gap:16px!important;align-items:start!important;width:100%!important;border:0!important;border-bottom:1px solid var(--line)!important;border-radius:0!important;padding:10px 4px!important;margin:0!important}
.detail-field dt{font-weight:800!important;color:#0c1475!important;font-size:.72rem!important}
.detail-field dd{margin:0!important;min-width:0!important}
.detail-field[data-ui-hidden="true"]{display:none!important}

.rac-help-popover{position:fixed;z-index:11000;width:min(420px,calc(100vw - 24px));background:#fff;color:#172033;border:2px solid #0F52BA;border-radius:12px;box-shadow:0 18px 46px rgba(11,23,51,.28);padding:14px 16px;line-height:1.4}
.rac-help-popover h3{margin:0 0 8px;color:#0c1475;font-size:1rem}
.rac-help-popover p{margin:6px 0;font-size:.8rem}
.rac-help-popover .rac-help-code{font-size:1.05rem;font-weight:900;color:#0F52BA}
.rac-help-popover .rac-help-close{position:absolute;top:7px;right:9px;border:0;background:transparent;color:#0c1475;font-size:1.15rem;cursor:pointer}
.rac-help-popover .rac-help-note{color:#667085;font-size:.72rem}

@media(min-width:901px){
  .dims-grid th:nth-child(2),.dims-grid td:nth-child(2){width:9%!important}
  .dims-grid th:nth-child(3),.dims-grid td:nth-child(3){width:23%!important}
  .dims-grid th:nth-child(4),.dims-grid td:nth-child(4){width:10%!important}
  .dims-grid th:nth-child(5),.dims-grid td:nth-child(5){width:10%!important}
  .dims-grid th:nth-child(6),.dims-grid td:nth-child(6){width:10%!important}
  .dims-grid th:nth-child(7),.dims-grid td:nth-child(7){width:10%!important}
  .dims-grid th:nth-child(8),.dims-grid td:nth-child(8){width:10%!important}
  .dims-grid th:nth-child(9),.dims-grid td:nth-child(9){width:9%!important}
  .dims-grid th:nth-child(10),.dims-grid td:nth-child(10){width:6%!important}
  .dims-grid th:nth-child(11),.dims-grid td:nth-child(11){width:3%!important}
}
@media(max-width:900px){
  .dims-grid-menu{left:12px!important;right:12px!important;width:auto!important;max-width:none!important}
  .detail-field,.detail-field.full{grid-template-columns:1fr!important;gap:3px!important;padding:10px 2px!important}
}
`;
const style = document.createElement('style');
style.textContent = css;
document.head.appendChild(style);

let racPopover = null;

function closeRacHelp() {
  racPopover?.remove();
  racPopover = null;
}

function racHelpHtml(codeText) {
  return `<button class="rac-help-close" type="button" aria-label="Close RAC explanation">×</button>
    <h3>Risk Assessment Code (RAC)</h3>
    <div class="rac-help-code">${codeText || 'Not assessed'}</div>
    <p><b>RAC</b> is determined by the intersection of <b>Severity</b> and <b>Probability</b>. Lower RAC numbers receive higher primary risk priority.</p>
    <p><b>Equal RACs:</b> DIMS uses the <b>EPI — Execution Priority Index</b> to explain which item should execute first. EPI uses <b>Impact</b> and <b>Estimated Resolution Effort (ERE)</b>, with ERE based on estimated AI Time (AIT) + Human Interaction Time (HIT). The exact EPI numerical formula remains under validation as DIMS accumulates actual history.</p>
    <p><b>Safety Hazard mode:</b> a genuine safety-hazard record may use <b>APN — Abatement Priority Number</b> instead of EPI when the adopted safety methodology applies.</p>
    <p class="rac-help-note">Use the RAC column menu to sort RAC 1→5 or 5→1 and to filter by RAC.</p>`;
}

function openRacHelp(target) {
  closeRacHelp();
  const cell = target.closest('td[data-label="RAC"]');
  if (!cell) return;
  const codeText = cell.querySelector('.rac-main')?.childNodes?.[0]?.textContent?.trim() || cell.textContent.trim();
  const pop = document.createElement('div');
  pop.className = 'rac-help-popover';
  pop.setAttribute('role', 'dialog');
  pop.setAttribute('aria-label', 'RAC explanation');
  pop.innerHTML = racHelpHtml(codeText);
  document.body.appendChild(pop);
  const rect = cell.getBoundingClientRect();
  const left = Math.max(12, Math.min(rect.left, innerWidth - pop.offsetWidth - 12));
  let top = rect.bottom + 8;
  if (top + pop.offsetHeight > innerHeight - 12) top = Math.max(12, rect.top - pop.offsetHeight - 8);
  pop.style.left = `${left}px`;
  pop.style.top = `${top}px`;
  pop.querySelector('.rac-help-close').onclick = closeRacHelp;
  racPopover = pop;
}

function refineDrawer() {
  const drawer = document.getElementById('drawerContent');
  if (!drawer) return;
  for (const field of drawer.querySelectorAll('.detail-field')) {
    const label = field.querySelector('dt')?.textContent?.trim().toLowerCase();
    if (label === 'execution rank' || label === 'dea rank basis' || label === 'severity' || label === 'probability') {
      field.dataset.uiHidden = 'true';
    }
  }
}

document.addEventListener('click', event => {
  if (event.target.closest('td[data-label="RAC"] .rac-main')) {
    event.stopPropagation();
    openRacHelp(event.target);
    return;
  }
  if (!event.target.closest('.rac-help-popover')) closeRacHelp();
});

document.addEventListener('mouseover', event => {
  const rac = event.target.closest?.('td[data-label="RAC"] .rac-main');
  if (rac && !rac.title) rac.title = 'Click for RAC, EPI/APN, Severity and Probability explanation';
});

const drawer = document.getElementById('drawerContent');
if (drawer) new MutationObserver(refineDrawer).observe(drawer, { childList: true, subtree: true });
refineDrawer();
