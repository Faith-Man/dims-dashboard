const MED_ADMIN_MARKER = 'med-admin-console-v2-auto-temp-password';

function el(tag, attrs = {}, text = '') {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'className') node.className = value;
    else if (key === 'type') node.type = value;
    else node.setAttribute(key, value);
  });
  if (text) node.textContent = text;
  return node;
}

async function api(session, payload) {
  const response = await fetch('/api/med/admin', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${session.access_token}`
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `MED administrator request failed (${response.status})`);
  return data;
}

function field(labelText, input) {
  const wrap = el('div');
  wrap.append(el('label', {}, labelText), input);
  return wrap;
}

function randomIndex(max) {
  const limit = Math.floor(256 / max) * max;
  const bytes = new Uint8Array(1);
  do crypto.getRandomValues(bytes); while (bytes[0] >= limit);
  return bytes[0] % max;
}

function generateTemporaryPassword(length = 18) {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%*-_+=';
  const all = upper + lower + digits + symbols;
  const chars = [
    upper[randomIndex(upper.length)],
    lower[randomIndex(lower.length)],
    digits[randomIndex(digits.length)],
    symbols[randomIndex(symbols.length)]
  ];
  while (chars.length < length) chars.push(all[randomIndex(all.length)]);
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = randomIndex(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

export async function installMedAdminConsole(sb) {
  if (document.getElementById('medAdminConsole')) return;
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return;
  const { data: isAdmin, error } = await sb.rpc('med_is_admin');
  if (error || !isAdmin) return;

  const caseId = new URLSearchParams(location.search).get('case');
  if (!caseId) return;

  const section = el('section', { id: 'medAdminConsole', className: 'workspace card' });
  const heading = el('div', { className: 'row between' });
  const title = el('div');
  title.append(el('div', { className: 'sub' }, 'DIMS Administrator'), el('h2', {}, 'MED™ User Administration'));
  heading.append(title);
  section.append(heading);
  section.append(el('p', { className: 'muted' }, 'Create or confirm controlled MED test users, assign case roles, and automatically issue strong temporary passwords. Privileged credentials remain server-side.'));

  const grid = el('div', { className: 'grid' });
  const email = el('input', { id: 'medAdminEmail', type: 'email', autocomplete: 'off', placeholder: 'participant@example.com' });
  const role = el('select', { id: 'medAdminRole' });
  ['husband','wife','counselor'].forEach(value => {
    const option = el('option', { value }, value[0].toUpperCase() + value.slice(1));
    role.append(option);
  });
  const password = el('input', { id: 'medAdminPassword', type: 'text', autocomplete: 'off', readonly: 'readonly', placeholder: 'Generated automatically' });
  const caseInput = el('input', { id: 'medAdminCase', type: 'text', value: caseId, readonly: 'readonly' });
  grid.append(field('Email', email), field('MED role', role), field('Temporary password — generated automatically', password), field('Case ID', caseInput));
  section.append(grid);

  const passwordControls = el('div', { className: 'row' });
  passwordControls.style.marginTop = '8px';
  const generate = el('button', { className: 'secondary', type: 'button' }, 'Generate New Temporary Password');
  const copy = el('button', { className: 'secondary', type: 'button' }, 'Copy Temporary Password');
  passwordControls.append(generate, copy);
  section.append(passwordControls);

  const controls = el('div', { className: 'row' });
  controls.style.marginTop = '12px';
  const provision = el('button', { className: 'primary', type: 'button' }, 'Provision / Reset & Assign');
  const refresh = el('button', { className: 'secondary', type: 'button' }, 'Refresh Case Users');
  const status = el('span', { id: 'medAdminStatus', className: 'status' });
  controls.append(provision, refresh, status);
  section.append(controls);

  const issued = el('div', { id: 'medAdminIssuedPassword', className: 'status' });
  issued.style.marginTop = '10px';
  section.append(issued);

  const tableWrap = el('div', { className: 'tableWrap' });
  const table = el('table');
  table.style.minWidth = '720px';
  table.innerHTML = '<thead><tr><th>Email</th><th>Role</th><th>Email confirmed</th><th>Last sign-in</th><th>User ID</th></tr></thead><tbody id="medAdminUsers"></tbody>';
  tableWrap.append(table);
  section.append(tableWrap);

  const anchor = document.getElementById('counselor');
  (anchor?.parentNode || document.querySelector('.shell') || document.body).append(section);

  function rotatePassword() {
    password.value = generateTemporaryPassword();
    issued.textContent = '';
    return password.value;
  }

  generate.addEventListener('click', () => {
    rotatePassword();
    status.textContent = 'New temporary password generated locally with the browser cryptographic random generator.';
  });

  copy.addEventListener('click', async () => {
    if (!password.value) rotatePassword();
    try {
      await navigator.clipboard.writeText(password.value);
      status.textContent = 'Temporary password copied.';
    } catch {
      password.select();
      status.textContent = 'Copy was blocked by the browser. The temporary password is selected for manual copy.';
    }
  });

  async function loadUsers() {
    status.textContent = 'Loading…';
    try {
      const data = await api(session, { action: 'list_case_users', case_id: caseId });
      const tbody = document.getElementById('medAdminUsers');
      tbody.innerHTML = (data.users || []).map(user => `<tr><td>${user.email || ''}</td><td>${user.role || ''}</td><td>${user.email_confirmed ? 'Yes' : 'No'}</td><td>${user.last_sign_in_at || 'Never'}</td><td>${user.id || ''}</td></tr>`).join('') || '<tr><td colspan="5">No participants assigned.</td></tr>';
      status.textContent = `${(data.users || []).length} case participant(s) loaded.`;
    } catch (err) {
      status.textContent = err.message;
    }
  }

  provision.addEventListener('click', async () => {
    const address = email.value.trim().toLowerCase();
    if (!address) {
      status.textContent = 'Email is required.';
      return;
    }
    const temp = password.value || rotatePassword();
    provision.disabled = true;
    status.textContent = 'Provisioning…';
    try {
      const data = await api(session, {
        action: 'provision_user',
        case_id: caseId,
        email: address,
        role: role.value,
        temporary_password: temp,
        confirm_email: true
      });
      issued.textContent = `Temporary password for ${data.user.email}: ${temp} — copy it now; MED does not retain a plaintext copy.`;
      status.textContent = `${data.user.email} is ready as ${data.user.role}.`;
      await loadUsers();
    } catch (err) {
      status.textContent = err.message;
    } finally {
      provision.disabled = false;
    }
  });

  refresh.addEventListener('click', loadUsers);
  rotatePassword();
  await loadUsers();
  console.info(MED_ADMIN_MARKER);
}
