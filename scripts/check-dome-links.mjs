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
for (const item of current) {
  if (!routeTarget(item.path)) failures.push(`Missing canonical target: ${item.key} -> ${item.path}`);
}

const forbidden = new Set(Object.keys(registry.legacyAliases || {}));
const nav = fs.readFileSync(path.join(root, 'dome-global-nav.js'), 'utf8');
for (const legacy of forbidden) {
  if (nav.includes(`'${legacy}'`) || nav.includes(`\"${legacy}\"`)) {
    failures.push(`Global navigation embeds legacy route instead of registry: ${legacy}`);
  }
}

if (!nav.includes('config/dome-routes.json')) {
  failures.push('Global navigation does not consume config/dome-routes.json');
}

if (failures.length) {
  console.error('DOME LINK INTEGRITY: FAILED');
  failures.forEach((failure, i) => console.error(`${i + 1}. ${failure}`));
  process.exit(1);
}

console.log('DOME LINK INTEGRITY: PASSED');
console.log(`Validated ${current.length} governed navigation destinations from route registry v${registry.version}.`);
