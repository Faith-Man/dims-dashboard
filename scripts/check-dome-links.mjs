import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const registry = JSON.parse(fs.readFileSync(path.join(root, 'config', 'dome-routes.json'), 'utf8'));
const failures = [];

function routeTarget(route) {
  const clean = route.replace(/^\//, '').split(/[?#]/)[0];
  const direct = path.join(root, clean);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  if (fs.existsSync(direct) && fs.statSync(direct).isDirectory()) {
    const index = path.join(direct, 'index.html');
    if (fs.existsSync(index)) return index;
  }
  return null;
}

const current = [...(registry.primary || []), ...(registry.enterprise || [])];
for (const item of current) if (!routeTarget(item.path)) failures.push(`Missing canonical target: ${item.key} -> ${item.path}`);

const forbidden = Object.keys(registry.legacyAliases || {});
const governedSurfaces = current.map(item => routeTarget(item.path)).filter(Boolean);
const extraSurfaces = ['dome-global-nav.js'];
for (const file of [...new Set([...governedSurfaces, ...extraSurfaces.map(f=>path.join(root,f))])]) {
  const text = fs.readFileSync(file, 'utf8');
  for (const legacy of forbidden) {
    const relativeLegacy = legacy.replace(/^\//,'');
    if (text.includes(`href=\"${legacy}\"`) || text.includes(`href='${legacy}'`) || text.includes(`href=\"${relativeLegacy}\"`) || text.includes(`href='${relativeLegacy}'`)) failures.push(`${path.relative(root,file)} exposes legacy current-user route: ${legacy}`);
  }
}

const nav = fs.readFileSync(path.join(root, 'dome-global-nav.js'), 'utf8');
if (!nav.includes('config/dome-routes.json')) failures.push('Global navigation does not consume config/dome-routes.json');

if (failures.length) {
  console.error('DOME LINK INTEGRITY: FAILED');
  failures.forEach((failure, i) => console.error(`${i + 1}. ${failure}`));
  process.exit(1);
}
console.log('DOME LINK INTEGRITY: PASSED');
console.log(`Validated ${current.length} governed navigation destinations and scanned ${governedSurfaces.length} current surfaces against route registry v${registry.version}.`);
