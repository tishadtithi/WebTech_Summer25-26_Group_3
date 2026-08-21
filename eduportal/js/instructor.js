// =====================================================
// EDU PORTAL - INSTRUCTOR DASHBOARD
// PHP SESSION + MYSQL VERSION
// =====================================================

let currentUser = null;
let myCourseList = [];
let myStudents = [];


// =====================================================
// GET CURRENT USER FROM PHP SESSION
// =====================================================

async function loadCurrentUser() {
    try {
        const response = await fetch('backend/api/check-session.php', {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`Session request failed: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success || !data.user) {
            window.location.replace('index.html');
            return false;
        }

        // Instructor dashboard should only be accessed by instructors
        if (data.user.role !== 'instructor') {
            window.location.replace(data.user.role + '-dashboard.html');
            return false;
        }

        currentUser = data.user;
        return true;

    } catch (error) {
        console.error('Session error:', error);
        window.location.replace('index.html');
        return false;
    }
}


// =====================================================
// DATA LOADERS
// =====================================================

async function getMyCourses() {
    try {
        const response = await fetch('backend/api/instructor-courses.php', {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store'
        });

        const data = await response.json();

        if (!data.success) {
            showToast(data.message || 'Failed to load courses.', 'danger');
            return [];
        }

        return data.courses || [];

    } catch (error) {
        console.error('Courses error:', error);
        showToast('Failed to connect to server.', 'danger');
        return [];
    }
}

async function getMyStudents() {
    try {
        const response = await fetch('backend/api/instructor-students.php', {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store'
        });

        const data = await response.json();

        if (!data.success) {
            showToast(data.message || 'Failed to load students.', 'danger');
            return [];
        }

        return data.students || [];

    } catch (error) {
        console.error('Students error:', error);
        showToast('Failed to connect to server.', 'danger');
        return [];
    }
}


// =====================================================
// RENDER STATS
// =====================================================

function renderStats() {
    document.getElementById('statCourses').textContent = myCourseList.length;
    document.getElementById('statStudents').textContent = myStudents.length;
}


// =====================================================
// RENDER COURSE LIST
// =====================================================

function renderCourseList() {
    const container = document.getElementById('courseList');

    if (!myCourseList.length) {
        container.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
      <div class="icon">🗂️</div>
      <p>You haven't published any course yet. Click "+ Add course" to create one.</p>
    </div>`;
        return;
    }

    container.innerHTML = myCourseList.map(c => {
        const enrolled = myStudents.filter(s => s.course_title === c.title).length;
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


// =====================================================
// RENDER STUDENT TABLE
// =====================================================

function renderStudentTable() {
    const wrap = document.getElementById('studentTableWrap');

    if (!myStudents.length) {
        wrap.innerHTML = `<div class="empty-state">
      <div class="icon">🎓</div>
      <p>No students have enrolled in your courses yet.</p>
    </div>`;
        return;
    }

    const rows = myStudents.map(s => {
        return `
      <tr>
        <td>${s.student_name}</td>
        <td>${s.student_email}</td>
        <td>${s.course_title}</td>
        <td><span class="badge ${s.progress >= 100 ? 'badge-green' : 'badge-amber'}">${s.progress}%</span></td>
      </tr>`;
    }).join('');

    wrap.innerHTML = `
    <table>
      <thead><tr><th>Student</th><th>Email</th><th>Course</th><th>Progress</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}


// =====================================================
// COURSE MODAL
// =====================================================

const backdrop = document.getElementById('courseModalBackdrop');

function openCourseModal(courseId) {
    document.getElementById('courseForm').reset();
    document.querySelectorAll('#courseForm .field').forEach(f => f.classList.remove('invalid'));
    document.getElementById('courseId').value = '';
    document.getElementById('modalTitle').textContent = 'Add a new course';

    if (courseId) {
        const c = myCourseList.find(c => c.id === courseId);
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

document.getElementById('courseForm').addEventListener('submit', async function (e) {
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

    try {
        const formData = new FormData();
        formData.append('course_id', id);
        formData.append('title', titleEl.value.trim());
        formData.append('code', codeEl.value.trim());
        formData.append('category', catEl.value.trim());
        formData.append('description', descEl.value.trim());
        formData.append('materials', document.getElementById('courseMaterials').value.trim());

        const response = await fetch('backend/api/save-course.php', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        const data = await response.json();

        if (!data.success) {
            showToast(data.message || 'Failed to save course.', 'danger');
            return;
        }

        showToast(id ? 'Course updated.' : 'Course published.', 'success');
        closeCourseModal();
        await refreshAll();

    } catch (error) {
        console.error('Save course error:', error);
        showToast('Failed to save course.', 'danger');
    }
});

async function deleteCourse(courseId) {
    if (!confirm('Delete this course? Enrolled students will lose access.')) return;

    try {
        const formData = new FormData();
        formData.append('course_id', courseId);

        const response = await fetch('backend/api/delete-course.php', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        const data = await response.json();

        if (!data.success) {
            showToast(data.message || 'Failed to delete course.', 'danger');
            return;
        }

        showToast('Course deleted.', 'success');
        await refreshAll();

    } catch (error) {
        console.error('Delete course error:', error);
        showToast('Failed to delete course.', 'danger');
    }
}


// =====================================================
// REFRESH EVERYTHING
// =====================================================

async function refreshAll() {
    myCourseList = await getMyCourses();
    myStudents = await getMyStudents();

    renderStats();
    renderCourseList();
    renderStudentTable();
}


// =====================================================
// INITIALIZE DASHBOARD
// =====================================================

async function initializeDashboard() {
    const loggedIn = await loadCurrentUser();
    if (!loggedIn) return;

    renderUserChip('userChip', currentUser);

    document.getElementById('welcomeText').textContent =
        `Welcome back, ${currentUser.name.split(' ')[0]}. Manage your courses below.`;

    await refreshAll();
}


// =====================================================
// DOM READY
// =====================================================

document.addEventListener('DOMContentLoaded', function () {
    initializeDashboard();
});
