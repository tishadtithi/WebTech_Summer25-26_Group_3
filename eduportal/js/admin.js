const currentUser = session.requireRole('admin');
renderUserChip('userChip');
document.getElementById('welcomeText').textContent = `Welcome back, ${currentUser.name.split(' ')[0]}. Here's what's happening across EduPortal.`;

function renderStats() {
  const users = store.get(DB.USERS);
  const courses = store.get(DB.COURSES);
  const enrollments = store.get(DB.ENROLLMENTS);

  document.getElementById('statInstructors').textContent = users.filter(u => u.role === 'instructor').length;
  document.getElementById('statStudents').textContent = users.filter(u => u.role === 'student').length;
  document.getElementById('statCourses').textContent = courses.length;
  document.getElementById('statEnrollments').textContent = enrollments.length;
}

function renderInstructors() {
  const instructors = store.get(DB.USERS).filter(u => u.role === 'instructor');
  const courses = store.get(DB.COURSES);
  const wrap = document.getElementById('instructorTableWrap');

  if (!instructors.length) {
    wrap.innerHTML = `<div class="empty-state"><div class="icon">🧑‍🏫</div><p>No instructors yet.</p></div>`;
    return;
  }

  const rows = instructors.map(ins => {
    const courseCount = courses.filter(c => c.instructorId === ins.id).length;
    return `
      <tr>
        <td>${ins.name}</td>
        <td>${ins.email}</td>
        <td>${courseCount} course${courseCount === 1 ? '' : 's'}</td>
        <td><button class="btn btn-danger btn-sm" onclick="removeUser('${ins.id}')">Remove</button></td>
      </tr>`;
  }).join('');

  wrap.innerHTML = `
    <table>
      <thead><tr><th>Name</th><th>Email</th><th>Courses</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function renderCourses() {
  const courses = store.get(DB.COURSES);
  const enrollments = store.get(DB.ENROLLMENTS);
  const wrap = document.getElementById('courseTableWrap');

  if (!courses.length) {
    wrap.innerHTML = `<div class="empty-state"><div class="icon">🗂️</div><p>No courses have been published yet.</p></div>`;
    return;
  }

  const rows = courses.map(c => {
    const enrolled = enrollments.filter(e => e.courseId === c.id).length;
    return `
      <tr>
        <td>${c.title}</td>
        <td>${c.code}</td>
        <td>${c.instructorName}</td>
        <td><span class="badge badge-blue">${c.category}</span></td>
        <td>${enrolled}</td>
      </tr>`;
  }).join('');

  wrap.innerHTML = `
    <table>
      <thead><tr><th>Title</th><th>Code</th><th>Instructor</th><th>Category</th><th>Enrolled</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function renderStudents() {
  const students = store.get(DB.USERS).filter(u => u.role === 'student');
  const enrollments = store.get(DB.ENROLLMENTS);
  const wrap = document.getElementById('studentTableWrap');

  if (!students.length) {
    wrap.innerHTML = `<div class="empty-state"><div class="icon">🎓</div><p>No students yet.</p></div>`;
    return;
  }

  const rows = students.map(s => {
    const count = enrollments.filter(e => e.studentId === s.id).length;
    return `
      <tr>
        <td>${s.name}</td>
        <td>${s.email}</td>
        <td>${count} course${count === 1 ? '' : 's'}</td>
        <td><button class="btn btn-danger btn-sm" onclick="removeUser('${s.id}')">Remove</button></td>
      </tr>`;
  }).join('');

  wrap.innerHTML = `
    <table>
      <thead><tr><th>Name</th><th>Email</th><th>Enrolled in</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function removeUser(userId) {
  if (!confirm('Remove this user? This cannot be undone.')) return;
  store.set(DB.USERS, store.get(DB.USERS).filter(u => u.id !== userId));
  store.set(DB.COURSES, store.get(DB.COURSES).filter(c => c.instructorId !== userId));
  store.set(DB.ENROLLMENTS, store.get(DB.ENROLLMENTS).filter(e => e.studentId !== userId));
  showToast('User removed.', 'success');
  refreshAll();
}

function refreshAll() {
  renderStats();
  renderInstructors();
  renderCourses();
  renderStudents();
}
refreshAll();
