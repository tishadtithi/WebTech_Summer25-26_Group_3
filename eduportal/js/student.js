const currentUser = session.requireRole('student');
renderUserChip('userChip');
document.getElementById('welcomeText').textContent = `Welcome back, ${currentUser.name.split(' ')[0]}. Here's what's happening in your courses.`;

function myEnrollments() {
  return store.get(DB.ENROLLMENTS).filter(e => e.studentId === currentUser.id);
}

function renderStats() {
  const enrollments = myEnrollments();
  const courses = store.get(DB.COURSES);
  const enrolledIds = enrollments.map(e => e.courseId);
  const available = courses.filter(c => !enrolledIds.includes(c.id)).length;
  const avg = enrollments.length
    ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
    : 0;

  document.getElementById('statEnrolled').textContent = enrollments.length;
  document.getElementById('statAvailable').textContent = available;
  document.getElementById('statAvgProgress').textContent = avg + '%';
}

function renderMyCourses() {
  const enrollments = myEnrollments();
  const courses = store.get(DB.COURSES);
  const container = document.getElementById('myCourses');

  if (!enrollments.length) {
    container.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
      <div class="icon">📚</div>
      <p>You haven't enrolled in any course yet. Browse available courses below.</p>
    </div>`;
    return;
  }

  container.innerHTML = enrollments.map(en => {
    const c = courses.find(c => c.id === en.courseId);
    if (!c) return '';
    return `
      <div class="course-card">
        <span class="badge badge-blue">${c.category}</span>
        <h3>${c.title}</h3>
        <div class="course-meta"><span>${c.code}</span> · <span>${c.instructorName}</span></div>
        <div>
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-muted); margin-bottom:5px;">
            <span>Progress</span><span>${en.progress}%</span>
          </div>
          <div class="progress-track"><div class="progress-fill" style="width:${en.progress}%;"></div></div>
        </div>
        <div class="course-actions">
          <button class="btn btn-outline btn-sm" onclick="bumpProgress('${en.id}')">Mark progress +20%</button>
        </div>
      </div>`;
  }).join('');
}

function renderAvailableCourses() {
  const enrollments = myEnrollments();
  const enrolledIds = enrollments.map(e => e.courseId);
  const courses = store.get(DB.COURSES).filter(c => !enrolledIds.includes(c.id));

  const search = document.getElementById('searchInput').value.trim().toLowerCase();
  const category = document.getElementById('categoryFilter').value;

  const filtered = courses.filter(c => {
    const matchesSearch = !search || c.title.toLowerCase().includes(search) || c.code.toLowerCase().includes(search);
    const matchesCategory = !category || c.category === category;
    return matchesSearch && matchesCategory;
  });

  const container = document.getElementById('availableCourses');
  if (!filtered.length) {
    container.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
      <div class="icon">🔍</div>
      <p>No courses match your search.</p>
    </div>`;
    return;
  }

  container.innerHTML = filtered.map(c => `
    <div class="course-card">
      <span class="badge badge-amber">${c.category}</span>
      <h3>${c.title}</h3>
      <div class="course-meta"><span>${c.code}</span> · <span>${c.instructorName}</span></div>
      <p class="course-desc">${c.description}</p>
      <div class="course-actions">
        <button class="btn btn-primary btn-sm" onclick="enroll('${c.id}')">Enroll now</button>
      </div>
    </div>`).join('');
}

function populateCategoryFilter() {
  const categories = [...new Set(store.get(DB.COURSES).map(c => c.category))];
  const select = document.getElementById('categoryFilter');
  select.innerHTML = '<option value="">All categories</option>' +
    categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

function enroll(courseId) {
  const enrollments = store.get(DB.ENROLLMENTS);
  enrollments.push({ id: store.uid('e'), studentId: currentUser.id, courseId, progress: 0 });
  store.set(DB.ENROLLMENTS, enrollments);
  showToast('Enrolled successfully!', 'success');
  refreshAll();
}

function bumpProgress(enrollmentId) {
  const enrollments = store.get(DB.ENROLLMENTS);
  const en = enrollments.find(e => e.id === enrollmentId);
  if (en) en.progress = Math.min(100, en.progress + 20);
  store.set(DB.ENROLLMENTS, enrollments);
  showToast(en.progress >= 100 ? 'Course completed! 🎉' : 'Progress updated.', 'success');
  refreshAll();
}

function refreshAll() {
  renderStats();
  renderMyCourses();
  renderAvailableCourses();
}

document.getElementById('searchInput').addEventListener('input', renderAvailableCourses);
document.getElementById('categoryFilter').addEventListener('change', renderAvailableCourses);

populateCategoryFilter();
refreshAll();
