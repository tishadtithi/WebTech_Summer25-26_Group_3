const s = session.get();
if (!s) window.location.href = 'index.html';

const dashboardByRole = {
  admin: 'admin-dashboard.html',
  instructor: 'instructor-dashboard.html',
  student: 'student-dashboard.html'
};

document.getElementById('sideRole').textContent = s.role + ' menu';
document.getElementById('sideNav').innerHTML = `
  <a href="${dashboardByRole[s.role]}">
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
    Dashboard
  </a>
  <a href="profile.html" class="active">
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>
    My Profile
  </a>
`;

renderUserChip('userChip');

function loadUser() {
  return store.get(DB.USERS).find(u => u.id === s.id);
}

function renderCard() {
  const user = loadUser();
  document.getElementById('bigAvatar').textContent = initials(user.name);
  document.getElementById('cardName').textContent = user.name;
  document.getElementById('cardRole').textContent = user.role;
  document.getElementById('cardEmail').textContent = user.email;
  document.getElementById('fullName').value = user.name;
  document.getElementById('emailField').value = user.email;
}
renderCard();

/* ---------- edit name / email ---------- */
document.getElementById('editForm').addEventListener('submit', function (e) {
  e.preventDefault();
  document.getElementById('editSuccess').classList.remove('show');

  const nameEl = document.getElementById('fullName');
  const emailEl = document.getElementById('emailField');

  const nameOk = validateField(nameEl, nameEl.value.trim().length >= 2, 'Please enter your full name.');
  const emailOk = validateField(emailEl, isValidEmail(emailEl.value.trim()), 'Please enter a valid email address.');
  if (!nameOk || !emailOk) return;

  const users = store.get(DB.USERS);
  const user = users.find(u => u.id === s.id);
  user.name = nameEl.value.trim();
  user.email = emailEl.value.trim();
  store.set(DB.USERS, users);
  session.set(user);

  document.getElementById('editSuccess').classList.add('show');
  renderCard();
  renderUserChip('userChip');
  showToast('Profile updated.', 'success');
});

/* ---------- change password ---------- */
document.getElementById('pwForm').addEventListener('submit', function (e) {
  e.preventDefault();
  document.getElementById('pwSuccess').classList.remove('show');
  document.getElementById('pwError').classList.remove('show');

  const currentEl = document.getElementById('currentPw');
  const newEl = document.getElementById('newPw');
  const user = loadUser();

  const currentOk = validateField(currentEl, currentEl.value === user.password, 'Current password is incorrect.');
  const newOk = validateField(newEl, newEl.value.length >= 6, 'New password must be at least 6 characters.');
  if (!currentOk || !newOk) return;

  const users = store.get(DB.USERS);
  const u = users.find(u => u.id === s.id);
  u.password = newEl.value;
  store.set(DB.USERS, users);

  document.getElementById('pwSuccess').classList.add('show');
  document.getElementById('pwForm').reset();
  showToast('Password changed.', 'success');
});

/* ---------- delete account ---------- */
function deleteAccount() {
  if (!confirm('This will permanently delete your account. Continue?')) return;
  store.set(DB.USERS, store.get(DB.USERS).filter(u => u.id !== s.id));
  store.set(DB.COURSES, store.get(DB.COURSES).filter(c => c.instructorId !== s.id));
  store.set(DB.ENROLLMENTS, store.get(DB.ENROLLMENTS).filter(e => e.studentId !== s.id));
  session.clear();
  alert('Your account has been deleted.');
  window.location.href = 'index.html';
}
