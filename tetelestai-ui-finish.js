// Presentation-only finishing layer. Core RAC, status, filters, and ranking are rendered natively in tetelestai-closed-loop.js.
const css = `
.dims-grid-menu{min-width:290px!important;max-width:380px!important;padding:10px!important}
.dims-grid-menu .menu-label{display:block;padding:7px 10px 5px!important;text-align:left!important;color:#667085;font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.06em}
.dims-grid-menu button{display:block;width:100%;padding:9px 10px!important;text-align:left!important;border:0;background:transparent;border-radius:7px!important;cursor:pointer}
.dims-grid-menu button:hover{background:#f0efff}
.dims-grid-menu .filter-option{display:grid!important;grid-template-columns:18px minmax(0,1fr)!important;align-items:start!important;gap:10px!important;padding:8px 10px!important;margin:1px 0!important;border-radius:7px;cursor:pointer}
.dims-grid-menu .filter-option:hover{background:#f0efff}
.dims-grid-menu .filter-option input{margin:2px 0 0!important;width:16px!important;height:16px!important;justify-self:start!important}
.dims-grid-menu .filter-option span{display:block!important;text-align:left!important;line-height:1.3!important;overflow-wrap:anywhere!important}
.dims-grid-menu .menu-divider{height:1px;background:#d9deea;margin:8px 0!important}
.rac-main{font-weight:900;color:#0c1475;white-space:nowrap}
.rac-main small{display:block;font-weight:700;color:#667085;margin-top:2px}
.rac-na{color:#8b94a7}
@media(min-width:901px){
  .dims-grid th:nth-child(1),.dims-grid td:nth-child(1){width:6%!important}
  .dims-grid th:nth-child(2),.dims-grid td:nth-child(2){width:8%!important}
  .dims-grid th:nth-child(3),.dims-grid td:nth-child(3){width:19%!important}
  .dims-grid th:nth-child(4),.dims-grid td:nth-child(4){width:9%!important}
  .dims-grid th:nth-child(5),.dims-grid td:nth-child(5){width:9%!important}
  .dims-grid th:nth-child(6),.dims-grid td:nth-child(6){width:8%!important}
  .dims-grid th:nth-child(7),.dims-grid td:nth-child(7){width:9%!important}
  .dims-grid th:nth-child(8),.dims-grid td:nth-child(8){width:9%!important}
  .dims-grid th:nth-child(9),.dims-grid td:nth-child(9){width:9%!important}
  .dims-grid th:nth-child(10),.dims-grid td:nth-child(10){width:9%!important}
  .dims-grid th:nth-child(11),.dims-grid td:nth-child(11){width:5%!important}
}
@media(max-width:900px){
  .dims-grid-menu{left:12px!important;right:12px!important;width:auto!important;max-width:none!important}
}
`;
const style = document.createElement('style');
style.textContent = css;
document.head.appendChild(style);
