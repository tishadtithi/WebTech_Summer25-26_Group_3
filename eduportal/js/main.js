
const DB = {
  USERS: 'eduportal_users',
  COURSES: 'eduportal_courses',
  ENROLLMENTS: 'eduportal_enrollments',
  SESSION: 'eduportal_session'
};


function seedIfEmpty() {
  if (!localStorage.getItem(DB.USERS)) {
    const users = [
      { id: 'u-admin', name: 'System Admin', email: 'admin@eduportal.com', password: 'admin123', role: 'admin' },
      { id: 'u-inst1', name: 'Dr. Farah Islam', email: 'farah@eduportal.com', password: 'pass123', role: 'instructor' },
      { id: 'u-stu1', name: 'Tithi', email: 'tithi@eduportal.com', password: 'pass123', role: 'student' }
    ];
    localStorage.setItem(DB.USERS, JSON.stringify(users));
  }

  if (!localStorage.getItem(DB.COURSES)) {
    const courses = [
      {
        id: 'c-1',
        title: 'Introduction to Web Technologies',
        code: 'CSC3215',
        instructorId: 'u-inst1',
        instructorName: 'Dr. Farah Islam',
        category: 'Computer Science',
        description: 'HTML, CSS, JavaScript, and PHP fundamentals for building dynamic websites.',
        materials: 'https://example.com/wt-slides'
      },
      {
        id: 'c-2',
        title: 'Database Fundamentals',
        code: 'CSC2213',
        instructorId: 'u-inst1',
        instructorName: 'Dr. Farah Islam',
        category: 'Computer Science',
        description: 'Relational database design, SQL, and normalization basics.',
        materials: 'https://example.com/db-slides'
      }
    ];
    localStorage.setItem(DB.COURSES, JSON.stringify(courses));
  }

  if (!localStorage.getItem(DB.ENROLLMENTS)) {
    const enrollments = [
      { id: 'e-1', studentId: 'u-stu1', courseId: 'c-1', progress: 40 }
    ];
    localStorage.setItem(DB.ENROLLMENTS, JSON.stringify(enrollments));
  }
}
seedIfEmpty();


const store = {
  get(key) { return JSON.parse(localStorage.getItem(key) || '[]'); },
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)); },
  uid(prefix) { return prefix + '-' + Math.random().toString(36).slice(2, 9); }
};


const session = {
  get() {
    const raw = sessionStorage.getItem(DB.SESSION);
    return raw ? JSON.parse(raw) : null;
  },
  set(user) {
    sessionStorage.setItem(DB.SESSION, JSON.stringify({ id: user.id, name: user.name, email: user.email, role: user.role }));
  },
  clear() { sessionStorage.removeItem(DB.SESSION); },
  requireRole(role) {
    const s = session.get();
    if (!s || s.role !== role) {
      window.location.href = 'index.html';
    }
    return s;
  }
};


function findUserByEmail(email) {
  return store.get(DB.USERS).find(u => u.email.toLowerCase() === email.toLowerCase());
}

function registerUser({ name, email, password, role }) {
  const users = store.get(DB.USERS);
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, message: 'An account with this email already exists.' };
  }
  const user = { id: store.uid('u'), name, email, password, role };
  users.push(user);
  store.set(DB.USERS, users);
  return { ok: true, user };
}

function loginUser(email, password) {
  const user = findUserByEmail(email);
  if (!user || user.password !== password) {
    return { ok: false, message: 'Incorrect email or password.' };
  }
  session.set(user);
  return { ok: true, user };
}

function logout() {
  session.clear();
  window.location.href = 'index.html';
}


function showToast(message, type = 'default') {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = 'toast show' + (type === 'success' ? ' toast-success' : type === 'danger' ? ' toast-danger' : '');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function initials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('');
}

function renderUserChip(elId) {
  const s = session.get();
  const el = document.getElementById(elId);
  if (!el || !s) return;
  el.innerHTML = `
    <div class="avatar">${initials(s.name)}</div>
    <div>
      <div style="font-weight:600; font-size:0.85rem;">${s.name}</div>
      <div style="font-size:0.72rem; color:var(--text-muted); text-transform:capitalize;">${s.role}</div>
    </div>
  `;
}


function validateField(fieldEl, condition, message) {
  const wrapper = fieldEl.closest('.field');
  const errorEl = wrapper.querySelector('.field-error');
  if (!condition) {
    wrapper.classList.add('invalid');
    if (errorEl) errorEl.textContent = message;
    return false;
  }
  wrapper.classList.remove('invalid');
  return true;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
