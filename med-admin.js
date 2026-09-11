const MED_ADMIN_MARKER = 'med-admin-console-v1';

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
  section.append(el('p', { className: 'muted' }, 'Create or confirm controlled MED test users, assign case roles, and issue temporary passwords. Privileged credentials remain server-side.'));

  const grid = el('div', { className: 'grid' });
  const email = el('input', { id: 'medAdminEmail', type: 'email', autocomplete: 'off', placeholder: 'participant@example.com' });
  const role = el('select', { id: 'medAdminRole' });
  ['husband','wife','counselor'].forEach(value => {
    const option = el('option', { value }, value[0].toUpperCase() + value.slice(1));
    role.append(option);
  });
  const password = el('input', { id: 'medAdminPassword', type: 'text', autocomplete: 'off', placeholder: 'Temporary password' });
  const caseInput = el('input', { id: 'medAdminCase', type: 'text', value: caseId, readonly: 'readonly' });
  grid.append(field('Email', email), field('MED role', role), field('Temporary password', password), field('Case ID', caseInput));
  section.append(grid);

  const controls = el('div', { className: 'row' });
  controls.style.marginTop = '12px';
  const provision = el('button', { className: 'primary', type: 'button' }, 'Provision / Reset & Assign');
  const refresh = el('button', { className: 'secondary', type: 'button' }, 'Refresh Case Users');
  const status = el('span', { id: 'medAdminStatus', className: 'status' });
  controls.append(provision, refresh, status);
  section.append(controls);

  const tableWrap = el('div', { className: 'tableWrap' });
  const table = el('table');
  table.style.minWidth = '720px';
  table.innerHTML = '<thead><tr><th>Email</th><th>Role</th><th>Email confirmed</th><th>Last sign-in</th><th>User ID</th></tr></thead><tbody id="medAdminUsers"></tbody>';
  tableWrap.append(table);
  section.append(tableWrap);

  const anchor = document.getElementById('counselor');
  (anchor?.parentNode || document.querySelector('.shell') || document.body).append(section);

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
    const temp = password.value;
    if (!address || !temp) {
      status.textContent = 'Email and temporary password are required.';
      return;
    }
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
      status.textContent = `${data.user.email} is ready as ${data.user.role}.`;
      password.value = '';
      await loadUsers();
    } catch (err) {
      status.textContent = err.message;
    } finally {
      provision.disabled = false;
    }
  });

  refresh.addEventListener('click', loadUsers);
  await loadUsers();
  console.info(MED_ADMIN_MARKER);
}
