// =====================================================
// EDU PORTAL - PROFILE PAGE
// PHP SESSION + MYSQL VERSION
// =====================================================

let currentUser = null;

const dashboardByRole = {
    admin: 'admin-dashboard.html',
    instructor: 'instructor-dashboard.html',
    student: 'student-dashboard.html'
};


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

        currentUser = data.user;
        return true;

    } catch (error) {
        console.error('Session error:', error);
        window.location.replace('index.html');
        return false;
    }
}


// =====================================================
// RENDER SIDEBAR + PROFILE CARD
// =====================================================

function renderSidebar() {
    document.getElementById('sideRole').textContent = currentUser.role + ' menu';
    document.getElementById('sideNav').innerHTML = `
  <a href="${dashboardByRole[currentUser.role]}">
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
    Dashboard
  </a>
  <a href="profile.html" class="active">
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>
    My Profile
  </a>
`;
}

function renderCard() {
    document.getElementById('bigAvatar').textContent = initials(currentUser.name);
    document.getElementById('cardName').textContent = currentUser.name;
    document.getElementById('cardRole').textContent = currentUser.role;
    document.getElementById('cardEmail').textContent = currentUser.email;
    document.getElementById('fullName').value = currentUser.name;
    document.getElementById('emailField').value = currentUser.email;
}


// =====================================================
// EDIT NAME / EMAIL
// =====================================================

document.getElementById('editForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    document.getElementById('editSuccess').classList.remove('show');

    const nameEl = document.getElementById('fullName');
    const emailEl = document.getElementById('emailField');

    const nameOk = validateField(nameEl, nameEl.value.trim().length >= 2, 'Please enter your full name.');
    const emailOk = validateField(emailEl, isValidEmail(emailEl.value.trim()), 'Please enter a valid email address.');
    if (!nameOk || !emailOk) return;

    try {
        const formData = new FormData();
        formData.append('name', nameEl.value.trim());
        formData.append('email', emailEl.value.trim());

        const response = await fetch('backend/api/update-profile.php', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        const data = await response.json();

        if (!data.success) {
            showToast(data.message || 'Failed to update profile.', 'danger');
            return;
        }

        currentUser = data.user;

        document.getElementById('editSuccess').classList.add('show');
        renderCard();
        renderUserChip('userChip', currentUser);
        showToast('Profile updated.', 'success');

    } catch (error) {
        console.error('Update profile error:', error);
        showToast('Failed to update profile.', 'danger');
    }
});


// =====================================================
// CHANGE PASSWORD
// =====================================================

document.getElementById('pwForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    document.getElementById('pwSuccess').classList.remove('show');
    document.getElementById('pwError').classList.remove('show');

    const currentEl = document.getElementById('currentPw');
    const newEl = document.getElementById('newPw');

    const currentOk = validateField(currentEl, currentEl.value.length > 0, 'Please enter your current password.');
    const newOk = validateField(newEl, newEl.value.length >= 6, 'New password must be at least 6 characters.');
    if (!currentOk || !newOk) return;

    try {
        const formData = new FormData();
        formData.append('current_password', currentEl.value);
        formData.append('new_password', newEl.value);

        const response = await fetch('backend/api/change-password.php', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        const data = await response.json();

        if (!data.success) {
            document.getElementById('pwError').textContent = data.message || 'Failed to change password.';
            document.getElementById('pwError').classList.add('show');
            return;
        }

        document.getElementById('pwSuccess').classList.add('show');
        document.getElementById('pwForm').reset();
        showToast('Password changed.', 'success');

    } catch (error) {
        console.error('Change password error:', error);
        document.getElementById('pwError').textContent = 'Failed to connect to server.';
        document.getElementById('pwError').classList.add('show');
    }
});


// =====================================================
// DELETE ACCOUNT
// =====================================================

async function deleteAccount() {
    if (!confirm('This will permanently delete your account. Continue?')) return;

    try {
        const response = await fetch('backend/api/delete-account.php', {
            method: 'POST',
            credentials: 'include'
        });

        const data = await response.json();

        if (!data.success) {
            showToast(data.message || 'Failed to delete account.', 'danger');
            return;
        }

        alert('Your account has been deleted.');
        window.location.href = 'index.html';

    } catch (error) {
        console.error('Delete account error:', error);
        showToast('Failed to delete account.', 'danger');
    }
}


// =====================================================
// INITIALIZE PAGE
// =====================================================

async function initializeProfile() {
    const loggedIn = await loadCurrentUser();
    if (!loggedIn) return;

    renderSidebar();
    renderUserChip('userChip', currentUser);
    renderCard();
}

document.addEventListener('DOMContentLoaded', function () {
    initializeProfile();
});
