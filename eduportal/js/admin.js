// =====================================================
// EDU PORTAL - ADMIN DASHBOARD
// PHP SESSION + MYSQL VERSION
// =====================================================

let currentUser = null;
let users = [];
let courses = [];
let enrollments = [];


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

        // Admin dashboard should only be accessed by admins
        if (data.user.role !== 'admin') {
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

async function getUsers() {
    try {
        const response = await fetch('backend/api/users.php', {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store'
        });

        const data = await response.json();

        if (!data.success) {
            showToast(data.message || 'Failed to load users.', 'danger');
            return [];
        }

        return data.users || [];

    } catch (error) {
        console.error('Users error:', error);
        showToast('Failed to connect to server.', 'danger');
        return [];
    }
}

async function getCourses() {
    try {
        const response = await fetch('backend/api/courses.php', {
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

async function getAllEnrollments() {
    try {
        const response = await fetch('backend/api/all-enrollments.php', {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store'
        });

        const data = await response.json();

        if (!data.success) {
            showToast(data.message || 'Failed to load enrollments.', 'danger');
            return [];
        }

        return data.enrollments || [];

    } catch (error) {
        console.error('Enrollments error:', error);
        showToast('Failed to connect to server.', 'danger');
        return [];
    }
}


// =====================================================
// RENDER STATS
// =====================================================

function renderStats() {
    document.getElementById('statInstructors').textContent =
        users.filter(u => u.role === 'instructor').length;

    document.getElementById('statStudents').textContent =
        users.filter(u => u.role === 'student').length;

    document.getElementById('statCourses').textContent = courses.length;

    document.getElementById('statEnrollments').textContent = enrollments.length;
}


// =====================================================
// RENDER INSTRUCTORS TABLE
// =====================================================

function renderInstructors() {
    const instructors = users.filter(u => u.role === 'instructor');
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


// =====================================================
// RENDER COURSES TABLE
// =====================================================

function renderCourses() {
    const wrap = document.getElementById('courseTableWrap');

    if (!courses.length) {
        wrap.innerHTML = `<div class="empty-state"><div class="icon">🗂️</div><p>No courses have been published yet.</p></div>`;
        return;
    }

    const rows = courses.map(c => {
        const enrolled = enrollments.filter(e => String(e.course_id) === String(c.id)).length;
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


// =====================================================
// RENDER STUDENTS TABLE
// =====================================================

function renderStudents() {
    const students = users.filter(u => u.role === 'student');
    const wrap = document.getElementById('studentTableWrap');

    if (!students.length) {
        wrap.innerHTML = `<div class="empty-state"><div class="icon">🎓</div><p>No students yet.</p></div>`;
        return;
    }

    const rows = students.map(s => {
        const count = enrollments.filter(e => String(e.student_id) === String(s.id)).length;
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


// =====================================================
// REMOVE USER
// =====================================================

async function removeUser(userId) {
    if (!confirm('Remove this user? This cannot be undone.')) return;

    try {
        const formData = new FormData();
        formData.append('user_id', userId);

        const response = await fetch('backend/api/remove-user.php', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        const data = await response.json();

        if (!data.success) {
            showToast(data.message || 'Failed to remove user.', 'danger');
            return;
        }

        showToast('User removed.', 'success');
        await refreshAll();

    } catch (error) {
        console.error('Remove user error:', error);
        showToast('Failed to remove user.', 'danger');
    }
}


// =====================================================
// REFRESH EVERYTHING
// =====================================================

async function refreshAll() {
    users = await getUsers();
    courses = await getCourses();
    enrollments = await getAllEnrollments();

    renderStats();
    renderInstructors();
    renderCourses();
    renderStudents();
}


// =====================================================
// INITIALIZE DASHBOARD
// =====================================================

async function initializeDashboard() {
    const loggedIn = await loadCurrentUser();
    if (!loggedIn) return;

    renderUserChip('userChip', currentUser);

    document.getElementById('welcomeText').textContent =
        `Welcome back, ${currentUser.name.split(' ')[0]}. Here's what's happening across EduPortal.`;

    await refreshAll();
}


// =====================================================
// DOM READY
// =====================================================

document.addEventListener('DOMContentLoaded', function () {
    initializeDashboard();
});
