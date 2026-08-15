const currentUser = session.requireRole('instructor');
renderUserChip('userChip');
document.getElementById('welcomeText').textContent = `Welcome back, ${currentUser.name.split(' ')[0]}. Manage your courses below.`;

function myCourses() {
  return store.get(DB.COURSES).filter(c => c.instructorId === currentUser.id);
}

function renderStats() {
  const courses = myCourses();
  const enrollments = store.get(DB.ENROLLMENTS);
  const myCourseIds = courses.map(c => c.id);
  const studentCount = enrollments.filter(e => myCourseIds.includes(e.courseId)).length;

  document.getElementById('statCourses').textContent = courses.length;
  document.getElementById('statStudents').textContent = studentCount;
}

function renderCourseList() {
  const courses = myCourses();
  const container = document.getElementById('courseList');

  if (!courses.length) {
    container.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
      <div class="icon">🗂️</div>
      <p>You haven't published any course yet. Click "+ Add course" to create one.</p>
    </div>`;
    return;
  }

  container.innerHTML = courses.map(c => {
    const enrolled = store.get(DB.ENROLLMENTS).filter(e => e.courseId === c.id).length;
    return `
    <div class="course-card">
      <span class="badge badge-blue">${c.category}</span>
      <h3>${c.title}</h3>
      <div class="course-meta"><span>${c.code}</span> · <span>${enrolled} student${enrolled === 1 ? '' : 's'} enrolled</span></div>
      <p class="course-desc">${c.description}</p>
      <div class="course-actions">
        <button class="btn btn-outline btn-sm" onclick="openCourseModal('${c.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteCourse('${c.id}')">Delete</button>
      </div>
    </div>`;
  }).join('');
}

function renderStudentTable() {
  const courses = myCourses();
  const myCourseIds = courses.map(c => c.id);
  const enrollments = store.get(DB.ENROLLMENTS).filter(e => myCourseIds.includes(e.courseId));
  const users = store.get(DB.USERS);
  const wrap = document.getElementById('studentTableWrap');

  if (!enrollments.length) {
    wrap.innerHTML = `<div class="empty-state">
      <div class="icon">🎓</div>
      <p>No students have enrolled in your courses yet.</p>
    </div>`;
    return;
  }

  const rows = enrollments.map(e => {
    const student = users.find(u => u.id === e.studentId);
    const course = courses.find(c => c.id === e.courseId);
    return `
      <tr>
        <td>${student ? student.name : 'Unknown student'}</td>
        <td>${student ? student.email : '—'}</td>
        <td>${course ? course.title : '—'}</td>
        <td><span class="badge ${e.progress >= 100 ? 'badge-green' : 'badge-amber'}">${e.progress}%</span></td>
      </tr>`;
  }).join('');

  wrap.innerHTML = `
    <table>
      <thead><tr><th>Student</th><th>Email</th><th>Course</th><th>Progress</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}


const backdrop = document.getElementById('courseModalBackdrop');

function openCourseModal(courseId) {
  document.getElementById('courseForm').reset();
  document.querySelectorAll('#courseForm .field').forEach(f => f.classList.remove('invalid'));
  document.getElementById('courseId').value = '';
  document.getElementById('modalTitle').textContent = 'Add a new course';

  if (courseId) {
    const c = myCourses().find(c => c.id === courseId);
    if (c) {
      document.getElementById('modalTitle').textContent = 'Edit course';
      document.getElementById('courseId').value = c.id;
      document.getElementById('courseTitle').value = c.title;
      document.getElementById('courseCode').value = c.code;
      document.getElementById('courseCategory').value = c.category;
      document.getElementById('courseDesc').value = c.description;
      document.getElementById('courseMaterials').value = c.materials || '';
    }
  }
  backdrop.classList.add('show');
}

function closeCourseModal() {
  backdrop.classList.remove('show');
}
backdrop.addEventListener('click', e => { if (e.target === backdrop) closeCourseModal(); });

document.getElementById('courseForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const titleEl = document.getElementById('courseTitle');
  const codeEl = document.getElementById('courseCode');
  const catEl = document.getElementById('courseCategory');
  const descEl = document.getElementById('courseDesc');

  const titleOk = validateField(titleEl, titleEl.value.trim().length > 0, 'Please enter a course title.');
  const codeOk = validateField(codeEl, codeEl.value.trim().length > 0, 'Please enter a course code.');
  const catOk = validateField(catEl, catEl.value.trim().length > 0, 'Please enter a category.');
  const descOk = validateField(descEl, descEl.value.trim().length > 0, 'Please enter a short description.');
  if (!titleOk || !codeOk || !catOk || !descOk) return;

  const id = document.getElementById('courseId').value;
  const courses = store.get(DB.COURSES);

  if (id) {
    const c = courses.find(c => c.id === id);
    Object.assign(c, {
      title: titleEl.value.trim(),
      code: codeEl.value.trim(),
      category: catEl.value.trim(),
      description: descEl.value.trim(),
      materials: document.getElementById('courseMaterials').value.trim()
    });
    showToast('Course updated.', 'success');
  } else {
    courses.push({
      id: store.uid('c'),
      title: titleEl.value.trim(),
      code: codeEl.value.trim(),
      category: catEl.value.trim(),
      description: descEl.value.trim(),
      materials: document.getElementById('courseMaterials').value.trim(),
      instructorId: currentUser.id,
      instructorName: currentUser.name
    });
    showToast('Course published.', 'success');
  }

  store.set(DB.COURSES, courses);
  closeCourseModal();
  refreshAll();
});

function deleteCourse(courseId) {
  if (!confirm('Delete this course? Enrolled students will lose access.')) return;
  store.set(DB.COURSES, store.get(DB.COURSES).filter(c => c.id !== courseId));
  store.set(DB.ENROLLMENTS, store.get(DB.ENROLLMENTS).filter(e => e.courseId !== courseId));
  showToast('Course deleted.', 'success');
  refreshAll();
}

function refreshAll() {
  renderStats();
  renderCourseList();
  renderStudentTable();
}
refreshAll();
