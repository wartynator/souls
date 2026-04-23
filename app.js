/* ============================================================
   Souls — minimalistic contacts + devices
   Two separate stores, linked by contactId
   ============================================================ */

/* ---------- IndexedDB ---------- */
const DB_NAME = 'souls-db';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('contacts')) {
        const s = db.createObjectStore('contacts', { keyPath: 'id' });
        s.createIndex('name', 'name', { unique: false });
      }
      if (!db.objectStoreNames.contains('devices')) {
        const s = db.createObjectStore('devices', { keyPath: 'id' });
        s.createIndex('contactId', 'contactId', { unique: false });
        s.createIndex('name', 'name', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

async function txStore(storeName, mode, fn) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(storeName, mode);
    const s = t.objectStore(storeName);
    const result = fn(s);
    t.oncomplete = () => resolve(result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}

const db = {
  contacts: {
    async all() {
      return txStore('contacts', 'readonly', s => new Promise(r => { s.getAll().onsuccess = e => r(e.target.result || []); }));
    },
    async put(c)    { return txStore('contacts', 'readwrite', s => s.put(c)); },
    async remove(id){ return txStore('contacts', 'readwrite', s => s.delete(id)); },
  },
  devices: {
    async all() {
      return txStore('devices', 'readonly', s => new Promise(r => { s.getAll().onsuccess = e => r(e.target.result || []); }));
    },
    async put(d)    { return txStore('devices', 'readwrite', s => s.put(d)); },
    async remove(id){ return txStore('devices', 'readwrite', s => s.delete(id)); },
    async byContact(contactId) {
      return txStore('devices', 'readonly', s => new Promise(r => {
        const out = [];
        const idx = s.index('contactId');
        const req = idx.openCursor(IDBKeyRange.only(contactId));
        req.onsuccess = e => {
          const cur = e.target.result;
          if (cur) { out.push(cur.value); cur.continue(); } else r(out);
        };
      }));
    },
    async removeByContact(contactId) {
      return txStore('devices', 'readwrite', s => new Promise(r => {
        const idx = s.index('contactId');
        const req = idx.openCursor(IDBKeyRange.only(contactId));
        req.onsuccess = e => {
          const cur = e.target.result;
          if (cur) { cur.delete(); cur.continue(); } else r();
        };
      }));
    },
  },
};

/* ---------- State ---------- */
const state = {
  tab: 'contacts',            // 'contacts' | 'devices'
  query: '',
  contacts: [],
  devices: [],
  detailContactId: null,      // which contact's detail view is open
  pendingConfirm: null,       // { kind, id, label }
};

/* ---------- DOM ---------- */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const els = {
  // Shell
  tabs:             $$('.tab'),
  panelContacts:    $('#panel-contacts'),
  panelDevices:     $('#panel-devices'),
  countContacts:    $('#countContacts'),
  countDevices:     $('#countDevices'),
  searchInput:      $('#searchInput'),
  addBtn:           $('#addBtn'),
  addBtnLabel:      $('#addBtnLabel'),
  contactsList:     $('#contactsList'),
  devicesList:      $('#devicesList'),
  contactsEmpty:    $('#contactsEmpty'),
  devicesEmpty:     $('#devicesEmpty'),
  toast:            $('#toast'),

  // Contact form dialog
  contactDialog:      $('#contactDialog'),
  contactForm:        $('#contactForm'),
  contactDialogTitle: $('#contactDialogTitle'),
  contactId:          $('#contactId'),
  contactName:        $('#contactName'),
  contactPhone:       $('#contactPhone'),
  contactEmail:       $('#contactEmail'),
  contactNotes:       $('#contactNotes'),
  contactDeleteBtn:   $('#contactDeleteBtn'),

  // Contact detail dialog
  contactDetail:       $('#contactDetail'),
  detailName:          $('#detailName'),
  detailPhoneRow:      $('#detailPhoneRow'),
  detailEmailRow:      $('#detailEmailRow'),
  detailNotesRow:      $('#detailNotesRow'),
  detailPhone:         $('#detailPhone'),
  detailEmail:         $('#detailEmail'),
  detailNotes:         $('#detailNotes'),
  detailDevicesList:   $('#detailDevicesList'),
  detailDevicesEmpty:  $('#detailDevicesEmpty'),
  detailEditBtn:       $('#detailEditBtn'),
  detailDeleteBtn:     $('#detailDeleteBtn'),
  addDeviceFromContactBtn: $('#addDeviceFromContactBtn'),

  // Device form dialog
  deviceDialog:      $('#deviceDialog'),
  deviceForm:        $('#deviceForm'),
  deviceDialogTitle: $('#deviceDialogTitle'),
  deviceId:          $('#deviceId'),
  deviceName:        $('#deviceName'),
  deviceOwner:       $('#deviceOwner'),
  deviceNotes:       $('#deviceNotes'),
  deviceDeleteBtn:   $('#deviceDeleteBtn'),

  // Confirm dialog
  confirmDialog: $('#confirmDialog'),
  confirmTitle:  $('#confirmTitle'),
  confirmText:   $('#confirmText'),
  confirmOk:     $('#confirmOk'),
  confirmCancel: $('#confirmCancel'),
};

/* ---------- Utilities ---------- */
const uid = () =>
  (crypto.randomUUID ? crypto.randomUUID()
    : 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36));

function escapeHtml(str = '') {
  return String(str).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function firstLetter(name = '') {
  const c = (name.trim()[0] || '#').toUpperCase();
  return /[A-Z]/.test(c) ? c : '#';
}

function toast(msg, ms = 2000) {
  els.toast.textContent = msg;
  els.toast.classList.add('is-show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => els.toast.classList.remove('is-show'), ms);
}

function sortByName(arr) {
  return [...arr].sort((a, b) =>
    (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' })
  );
}

function contactById(id) {
  return state.contacts.find(c => c.id === id);
}

/* ---------- Rendering: tabs ---------- */
function setTab(tab) {
  state.tab = tab;
  els.tabs.forEach(t => t.classList.toggle('is-active', t.dataset.tab === tab));
  els.panelContacts.classList.toggle('is-active', tab === 'contacts');
  els.panelDevices.classList.toggle('is-active', tab === 'devices');
  els.addBtnLabel.textContent = tab === 'contacts' ? 'Add contact' : 'Add device';
  els.searchInput.placeholder = tab === 'contacts' ? 'Search contacts' : 'Search devices';
  render();
}

/* ---------- Rendering: contacts list ---------- */
function renderContacts() {
  const q = state.query.trim().toLowerCase();
  let list = state.contacts;

  if (q) {
    list = list.filter(c => {
      const hay = [c.name, c.phone, c.email, c.notes].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(q);
    });
  }
  list = sortByName(list);

  els.contactsList.innerHTML = '';
  els.contactsEmpty.hidden = list.length > 0 || q !== '';

  if (list.length === 0 && q) {
    els.contactsList.innerHTML = `
      <div class="empty" style="padding:60px 20px;">
        <p class="empty__title">No matches</p>
        <p class="empty__text">Nothing found for &ldquo;${escapeHtml(state.query)}&rdquo;.</p>
      </div>`;
    return;
  }

  // Group by first letter
  let lastLetter = null;
  const frag = document.createDocumentFragment();

  list.forEach(c => {
    const letter = firstLetter(c.name);
    if (letter !== lastLetter) {
      lastLetter = letter;
      const hdr = document.createElement('div');
      hdr.className = 'list__letter';
      hdr.textContent = letter;
      frag.appendChild(hdr);
    }

    const row = document.createElement('div');
    row.className = 'row';
    row.dataset.id = c.id;

    const deviceCount = state.devices.filter(d => d.contactId === c.id).length;
    const sub = c.phone || c.email || '';

    row.innerHTML = `
      <div class="row__avatar">${escapeHtml(initials(c.name))}</div>
      <div class="row__main">
        <p class="row__name">${escapeHtml(c.name || 'Unnamed')}</p>
        ${sub ? `<p class="row__sub">${escapeHtml(sub)}</p>` : ''}
      </div>
      <div class="row__meta">${deviceCount} ${deviceCount === 1 ? 'device' : 'devices'}</div>
      <svg class="row__chev" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m9 6 6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    row.addEventListener('click', () => openContactDetail(c.id));
    frag.appendChild(row);
  });

  els.contactsList.appendChild(frag);
}

/* ---------- Rendering: devices list ---------- */
function renderDevices() {
  const q = state.query.trim().toLowerCase();
  let list = state.devices;

  if (q) {
    list = list.filter(d => {
      const owner = contactById(d.contactId);
      const hay = [d.name, d.notes, owner?.name, owner?.phone, owner?.email].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(q);
    });
  }
  list = sortByName(list);

  els.devicesList.innerHTML = '';
  els.devicesEmpty.hidden = list.length > 0 || q !== '';

  if (list.length === 0 && q) {
    els.devicesList.innerHTML = `
      <div class="empty" style="padding:60px 20px;">
        <p class="empty__title">No matches</p>
        <p class="empty__text">Nothing found for &ldquo;${escapeHtml(state.query)}&rdquo;.</p>
      </div>`;
    return;
  }

  const frag = document.createDocumentFragment();

  list.forEach(d => {
    const owner = contactById(d.contactId);
    const row = document.createElement('div');
    row.className = 'row';
    row.dataset.id = d.id;

    row.innerHTML = `
      <div class="row__avatar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="4" y="5" width="16" height="12" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
          <path d="M9 20h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M12 17v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="row__main">
        <p class="row__name">${escapeHtml(d.name || 'Unnamed device')}</p>
        <p class="row__owner">${owner ? `<em>${escapeHtml(owner.name)}</em>` : '<em style="color:var(--ink-faint)">Owner removed</em>'}${d.notes ? ` · ${escapeHtml(d.notes)}` : ''}</p>
      </div>
      <svg class="row__chev" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m9 6 6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    row.addEventListener('click', () => openDeviceForm(d.id));
    frag.appendChild(row);
  });

  els.devicesList.appendChild(frag);
}

function render() {
  els.countContacts.textContent = state.contacts.length;
  els.countDevices.textContent = state.devices.length;
  if (state.tab === 'contacts') renderContacts();
  else renderDevices();
}

/* ---------- Contact: create / edit ---------- */
function openContactForm(id = null) {
  els.contactForm.reset();
  if (id) {
    const c = contactById(id);
    if (!c) return;
    els.contactDialogTitle.textContent = 'Edit contact';
    els.contactId.value = c.id;
    els.contactName.value  = c.name  || '';
    els.contactPhone.value = c.phone || '';
    els.contactEmail.value = c.email || '';
    els.contactNotes.value = c.notes || '';
    els.contactDeleteBtn.hidden = false;
  } else {
    els.contactDialogTitle.textContent = 'New contact';
    els.contactId.value = '';
    els.contactDeleteBtn.hidden = true;
  }
  els.contactDialog.showModal();
  setTimeout(() => els.contactName.focus(), 50);
}

async function saveContact(e) {
  e.preventDefault();
  const id = els.contactId.value || uid();
  const existing = contactById(id);
  const contact = {
    id,
    name:  els.contactName.value.trim(),
    phone: els.contactPhone.value.trim(),
    email: els.contactEmail.value.trim(),
    notes: els.contactNotes.value.trim(),
    createdAt: existing?.createdAt || Date.now(),
    updatedAt: Date.now(),
  };
  if (!contact.name) {
    els.contactName.focus();
    toast('Name is required');
    return;
  }

  await db.contacts.put(contact);
  if (existing) Object.assign(existing, contact);
  else state.contacts.push(contact);

  els.contactDialog.close();
  toast(existing ? 'Contact updated' : 'Contact added');

  // If the detail view for this contact is open, refresh it
  if (state.detailContactId === contact.id) {
    populateContactDetail(contact.id);
  }
  render();
}

/* ---------- Contact: detail view (shows linked devices) ---------- */
function openContactDetail(id) {
  state.detailContactId = id;
  populateContactDetail(id);
  els.contactDetail.showModal();
}

function populateContactDetail(id) {
  const c = contactById(id);
  if (!c) { els.contactDetail.close(); return; }

  els.detailName.textContent = c.name || 'Unnamed';

  // Phone
  if (c.phone) {
    els.detailPhoneRow.style.display = '';
    els.detailPhone.textContent = c.phone;
    els.detailPhone.href = `tel:${c.phone.replace(/\s+/g, '')}`;
  } else {
    els.detailPhoneRow.style.display = 'none';
  }

  // Email
  if (c.email) {
    els.detailEmailRow.style.display = '';
    els.detailEmail.textContent = c.email;
    els.detailEmail.href = `mailto:${c.email}`;
  } else {
    els.detailEmailRow.style.display = 'none';
  }

  // Notes
  if (c.notes) {
    els.detailNotesRow.style.display = '';
    els.detailNotes.textContent = c.notes;
  } else {
    els.detailNotesRow.style.display = 'none';
  }

  // Devices for this contact
  const linked = sortByName(state.devices.filter(d => d.contactId === id));
  els.detailDevicesList.innerHTML = '';
  els.detailDevicesEmpty.hidden = linked.length > 0;

  linked.forEach(d => {
    const item = document.createElement('div');
    item.className = 'device-item';
    item.innerHTML = `
      <div class="device-item__icon">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="4" y="5" width="16" height="12" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
          <path d="M9 20h6M12 17v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="device-item__body">
        <p class="device-item__name">${escapeHtml(d.name)}</p>
        ${d.notes ? `<p class="device-item__notes">${escapeHtml(d.notes)}</p>` : ''}
      </div>
    `;
    item.addEventListener('click', () => {
      els.contactDetail.close();
      openDeviceForm(d.id);
    });
    els.detailDevicesList.appendChild(item);
  });
}

function closeContactDetail() {
  state.detailContactId = null;
  els.contactDetail.close();
}

/* ---------- Device: create / edit ---------- */
function openDeviceForm(id = null, presetOwnerId = null) {
  if (state.contacts.length === 0) {
    toast('Add a contact first');
    return;
  }

  // Populate owner select
  els.deviceOwner.innerHTML = '';
  sortByName(state.contacts).forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.name;
    els.deviceOwner.appendChild(opt);
  });

  els.deviceForm.reset();

  if (id) {
    const d = state.devices.find(x => x.id === id);
    if (!d) return;
    els.deviceDialogTitle.textContent = 'Edit device';
    els.deviceId.value = d.id;
    els.deviceName.value  = d.name  || '';
    els.deviceOwner.value = d.contactId || '';
    els.deviceNotes.value = d.notes || '';
    els.deviceDeleteBtn.hidden = false;
  } else {
    els.deviceDialogTitle.textContent = 'New device';
    els.deviceId.value = '';
    if (presetOwnerId) els.deviceOwner.value = presetOwnerId;
    els.deviceDeleteBtn.hidden = true;
  }

  els.deviceDialog.showModal();
  setTimeout(() => els.deviceName.focus(), 50);
}

async function saveDevice(e) {
  e.preventDefault();
  const id = els.deviceId.value || uid();
  const existing = state.devices.find(d => d.id === id);
  const device = {
    id,
    name:      els.deviceName.value.trim(),
    contactId: els.deviceOwner.value,
    notes:     els.deviceNotes.value.trim(),
    createdAt: existing?.createdAt || Date.now(),
    updatedAt: Date.now(),
  };
  if (!device.name) {
    els.deviceName.focus();
    toast('Device name is required');
    return;
  }
  if (!device.contactId) {
    els.deviceOwner.focus();
    toast('Owner is required');
    return;
  }

  await db.devices.put(device);
  if (existing) Object.assign(existing, device);
  else state.devices.push(device);

  els.deviceDialog.close();
  toast(existing ? 'Device updated' : 'Device added');

  // Refresh contact detail if it's open
  if (state.detailContactId) populateContactDetail(state.detailContactId);
  render();
}

/* ---------- Delete flows ---------- */
function askDeleteContact(id) {
  const c = contactById(id);
  if (!c) return;
  const linkedCount = state.devices.filter(d => d.contactId === id).length;
  state.pendingConfirm = { kind: 'contact', id };
  els.confirmTitle.textContent = `Delete ${c.name}?`;
  els.confirmText.textContent = linkedCount > 0
    ? `This will also remove ${linkedCount} linked ${linkedCount === 1 ? 'device' : 'devices'}. This cannot be undone.`
    : 'This cannot be undone.';
  els.confirmDialog.showModal();
}

function askDeleteDevice(id) {
  const d = state.devices.find(x => x.id === id);
  if (!d) return;
  state.pendingConfirm = { kind: 'device', id };
  els.confirmTitle.textContent = `Delete ${d.name}?`;
  els.confirmText.textContent = 'This cannot be undone.';
  els.confirmDialog.showModal();
}

async function confirmDeletion() {
  const p = state.pendingConfirm;
  if (!p) return;

  if (p.kind === 'contact') {
    await db.devices.removeByContact(p.id);
    await db.contacts.remove(p.id);
    state.devices  = state.devices.filter(d => d.contactId !== p.id);
    state.contacts = state.contacts.filter(c => c.id !== p.id);
    toast('Contact deleted');
    // Close related dialogs
    if (state.detailContactId === p.id) closeContactDetail();
    if (els.contactDialog.open) els.contactDialog.close();
  } else if (p.kind === 'device') {
    await db.devices.remove(p.id);
    state.devices = state.devices.filter(d => d.id !== p.id);
    toast('Device deleted');
    if (els.deviceDialog.open) els.deviceDialog.close();
    // Refresh contact detail if open
    if (state.detailContactId) populateContactDetail(state.detailContactId);
  }

  state.pendingConfirm = null;
  els.confirmDialog.close();
  render();
}

/* ---------- Event wiring ---------- */
function wire() {
  // Tabs
  els.tabs.forEach(t => t.addEventListener('click', () => {
    setTab(t.dataset.tab);
    els.searchInput.value = '';
    state.query = '';
  }));

  // Search
  els.searchInput.addEventListener('input', e => {
    state.query = e.target.value;
    render();
  });

  // Add button (contextual)
  els.addBtn.addEventListener('click', () => {
    if (state.tab === 'contacts') openContactForm();
    else openDeviceForm();
  });

  // Contact form
  els.contactForm.addEventListener('submit', saveContact);
  $$('[data-close-contact]').forEach(b => b.addEventListener('click', () => els.contactDialog.close()));
  els.contactDeleteBtn.addEventListener('click', () => {
    const id = els.contactId.value;
    if (id) askDeleteContact(id);
  });

  // Contact detail
  $$('[data-close-detail]').forEach(b => b.addEventListener('click', closeContactDetail));
  els.detailEditBtn.addEventListener('click', () => {
    const id = state.detailContactId;
    closeContactDetail();
    if (id) openContactForm(id);
  });
  els.detailDeleteBtn.addEventListener('click', () => {
    if (state.detailContactId) askDeleteContact(state.detailContactId);
  });
  els.addDeviceFromContactBtn.addEventListener('click', () => {
    const id = state.detailContactId;
    closeContactDetail();
    if (id) openDeviceForm(null, id);
  });

  // Device form
  els.deviceForm.addEventListener('submit', saveDevice);
  $$('[data-close-device]').forEach(b => b.addEventListener('click', () => els.deviceDialog.close()));
  els.deviceDeleteBtn.addEventListener('click', () => {
    const id = els.deviceId.value;
    if (id) askDeleteDevice(id);
  });

  // Confirm dialog
  els.confirmCancel.addEventListener('click', () => {
    state.pendingConfirm = null;
    els.confirmDialog.close();
  });
  els.confirmOk.addEventListener('click', confirmDeletion);

  // Click-outside-to-close for all dialogs
  [els.contactDialog, els.contactDetail, els.deviceDialog, els.confirmDialog].forEach(d => {
    d.addEventListener('click', e => {
      if (e.target !== d) return; // clicks on children bubble up; only the backdrop hits the dialog itself
      const r = d.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right &&
                     e.clientY >= r.top  && e.clientY <= r.bottom;
      if (!inside) d.close();
    });
  });

  // Keyboard
  document.addEventListener('keydown', e => {
    // Only trigger '/' to focus search when nothing is open
    if (e.key === '/' &&
        document.activeElement !== els.searchInput &&
        !els.contactDialog.open && !els.deviceDialog.open &&
        !els.contactDetail.open && !els.confirmDialog.open) {
      e.preventDefault();
      els.searchInput.focus();
    }
  });
}

/* ---------- Bootstrap ---------- */
async function init() {
  wire();

  try {
    const [contacts, devices] = await Promise.all([db.contacts.all(), db.devices.all()]);
    state.contacts = contacts;
    state.devices = devices;
  } catch (err) {
    console.error('DB load error', err);
    toast('Could not load data');
  }

  setTab('contacts');
}

init();
