import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const registryPath = path.join(root, 'config', 'dome-routes.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const failures = [];

function existsForRoute(route) {
  const clean = route.replace(/^\//, '').split(/[?#]/)[0];
  if (!clean) return true;
  const direct = path.join(root, clean);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return true;
  if (fs.existsSync(direct) && fs.statSync(direct).isDirectory()) {
    return fs.existsSync(path.join(direct, 'index.html'));
  }
  return false;
}

for (const [name, route] of Object.entries(registry.canonical)) {
  if (!existsForRoute(route)) failures.push(`Canonical route missing target: ${name} -> ${route}`);
}

for (const rel of registry.currentUserSurfaces) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    failures.push(`Current-user surface missing: ${rel}`);
    continue;
  }
  const text = fs.readFileSync(abs, 'utf8');
  const allowed = new Set(registry.allowedLegacyReferences?.[rel] || []);
  for (const [legacy, reason] of Object.entries(registry.forbiddenCurrentUserRoutes)) {
    if (allowed.has(legacy)) continue;
    if (text.includes(legacy)) failures.push(`${rel}: stale route "${legacy}". ${reason}`);
  }
}

if (failures.length) {
  console.error('\nDOME LINK INTEGRITY: FAILED\n');
  failures.forEach((f, i) => console.error(`${i + 1}. ${f}`));
  process.exit(1);
}

console.log('DOME LINK INTEGRITY: PASSED');
console.log(`Validated ${Object.keys(registry.canonical).length} canonical routes across ${registry.currentUserSurfaces.length} current-user surfaces.`);
