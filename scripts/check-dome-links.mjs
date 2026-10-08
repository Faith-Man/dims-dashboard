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
  const source = fs.readFileSync(file, 'utf8');
  // Legacy routes may remain available as explicitly labeled archive content.
  // Only active <nav> links are current-user navigation and must be canonical.
  const navigation = file.endsWith('dome-global-nav.js')
    ? source
    : [...source.matchAll(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi)].map(match => match[0]).join('\n');
  for (const legacy of forbidden) {
    const relativeLegacy = legacy.replace(/^\//,'');
    const patterns = [
      'href="' + legacy + '"',
      "href='" + legacy + "'",
      'href="' + relativeLegacy + '"',
      "href='" + relativeLegacy + "'"
    ];
    if (patterns.some(pattern => navigation.includes(pattern))) {
      failures.push(path.relative(root,file) + ' exposes legacy current-navigation route: ' + legacy);
    }
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
