// TASK-0102 test-branch reconciliation.
// The earlier horizontal bar prototype is retired. Load the governed circular RAC presentation instead.
(() => {
  if (document.querySelector('script[data-tetelestai-circular-rac]')) return;
  const script = document.createElement('script');
  script.src = 'tetelestai-visual-reconciliation.js?v=1';
  script.defer = true;
  script.dataset.tetelestaiCircularRac = '1';
  document.head.appendChild(script);
})();