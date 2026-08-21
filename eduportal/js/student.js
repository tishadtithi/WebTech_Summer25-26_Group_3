
// =====================================================
// EDU PORTAL - STUDENT DASHBOARD
// PHP SESSION + MYSQL VERSION
// =====================================================

let currentUser = null;
let courses = [];
let enrollments = [];


// =====================================================
// GET CURRENT USER FROM PHP SESSION
// =====================================================

async function loadCurrentUser() {
    try {
        const response = await fetch(
            'backend/api/check-session.php',
            {
                method: 'GET',
                credentials: 'include',
                cache: 'no-store'
            }
        );

        if (!response.ok) {
            throw new Error(
                `Session request failed: ${response.status}`
            );
        }

        const data = await response.json();

        console.log('SESSION API:', data);

        if (!data.success || !data.user) {
            window.location.replace('index.html');
            return false;
        }

        // Student dashboard should only be accessed by students
        if (data.user.role !== 'student') {
            window.location.replace(
                data.user.role + '-dashboard.html'
            );
            return false;
        }

        currentUser = data.user;

        console.log('Current student:', currentUser);

        return true;

    } catch (error) {

        console.error('Session error:', error);

        window.location.replace('index.html');

        return false;
    }
}


// =====================================================
// GET ALL COURSES
// =====================================================

async function getCourses() {
    try {

        const response = await fetch(
            'backend/api/courses.php',
            {
                method: 'GET',
                credentials: 'include',
                cache: 'no-store'
            }
        );

        if (!response.ok) {
            throw new Error(
                `Courses request failed: ${response.status}`
            );
        }

        const data = await response.json();

        console.log('COURSES API:', data);

        if (!data.success) {
            showToast(
                data.message || 'Failed to load courses.',
                'danger'
            );

            return [];
        }

        return data.courses || [];

    } catch (error) {

        console.error('Courses error:', error);

        showToast(
            'Failed to connect to server.',
            'danger'
        );

        return [];
    }
}


// =====================================================
// GET MY ENROLLMENTS
// =====================================================

async function getEnrollments() {
    try {

        const response = await fetch(
            'backend/api/enrollments.php',
            {
                method: 'GET',
                credentials: 'include',
                cache: 'no-store'
            }
        );

        if (!response.ok) {
            throw new Error(
                `Enrollments request failed: ${response.status}`
            );
        }

        const data = await response.json();

        console.log('ENROLLMENTS API:', data);

        if (!data.success) {
            showToast(
                data.message || 'Failed to load enrollments.',
                'danger'
            );

            return [];
        }

        return data.enrollments || [];

    } catch (error) {

        console.error('Enrollment error:', error);

        showToast(
            'Failed to load enrollments.',
            'danger'
        );

        return [];
    }
}


// =====================================================
// RENDER USER INFORMATION
// =====================================================

function renderUserInformation() {

    if (!currentUser) {
        return;
    }

    const firstName = currentUser.name
        ? currentUser.name.split(' ')[0]
        : 'Student';

    // Welcome text
    const welcomeText =
        document.getElementById('welcomeText');

    if (welcomeText) {
        welcomeText.textContent =
            `Welcome back, ${firstName}. Here's what's happening in your courses.`;
    }

    // User chip
    renderUserChip(
        'userChip',
        currentUser
    );
}


// =====================================================
// RENDER STATISTICS
// =====================================================

function renderStats() {

    const enrolledIds =
        enrollments.map(
            enrollment => String(enrollment.course_id)
        );

    // Available courses
    const available =
        courses.filter(
            course =>
                !enrolledIds.includes(
                    String(course.id)
                )
        ).length;

    // Average progress
    const averageProgress =
        enrollments.length
            ? Math.round(
                enrollments.reduce(
                    (sum, enrollment) =>
                        sum +
                        Number(enrollment.progress || 0),
                    0
                ) / enrollments.length
            )
            : 0;

    // Update HTML
    const enrolledElement =
        document.getElementById('statEnrolled');

    const availableElement =
        document.getElementById('statAvailable');

    const progressElement =
        document.getElementById('statAvgProgress');

    if (enrolledElement) {
        enrolledElement.textContent =
            enrollments.length;
    }

    if (availableElement) {
        availableElement.textContent =
            available;
    }

    if (progressElement) {
        progressElement.textContent =
            averageProgress + '%';
    }
}


// =====================================================
// RENDER MY ENROLLED COURSES
// =====================================================

function renderMyCourses() {

    const container =
        document.getElementById('myCourses');

    if (!container) {
        return;
    }

    // No enrollments
    if (!enrollments.length) {

        container.innerHTML = `
            <div
                class="empty-state"
                style="grid-column:1/-1;"
            >
                <div class="icon">📚</div>

                <p>
                    You haven't enrolled in any course yet.
                    Browse available courses below.
                </p>
            </div>
        `;

        return;
    }

    // Render enrolled courses
    container.innerHTML =
        enrollments.map(enrollment => {

            const progress =
                Math.min(
                    100,
                    Math.max(
                        0,
                        Number(enrollment.progress) || 0
                    )
                );

            return `
                <div class="course-card">

                    <span class="badge badge-blue">
                        ${enrollment.category || ''}
                    </span>

                    <h3>
                        ${enrollment.title || ''}
                    </h3>

                    <div class="course-meta">
                        <span>
                            ${enrollment.code || ''}
                        </span>
                        ·
                        <span>
                            ${enrollment.instructorName || ''}
                        </span>
                    </div>

                    <div>

                        <div
                            style="
                                display:flex;
                                justify-content:space-between;
                                font-size:0.8rem;
                                color:var(--text-muted);
                                margin-bottom:5px;
                            "
                        >
                            <span>
                                Progress
                            </span>

                            <span>
                                ${progress}%
                            </span>
                        </div>

                        <div class="progress-track">
                            <div
                                class="progress-fill"
                                style="width:${progress}%"
                            ></div>
                        </div>

                    </div>

                    <div class="course-actions">

                        ${
                            progress >= 100

                            ? `
                                <button
                                    class="btn btn-outline btn-sm"
                                    disabled
                                >
                                    Course Completed ✓
                                </button>
                            `

                            : `
                                <button
                                    class="btn btn-outline btn-sm"
                                    onclick="bumpProgress('${enrollment.id}')"
                                >
                                    Mark progress +20%
                                </button>
                            `
                        }

                    </div>

                </div>
            `;

        }).join('');
}


// =====================================================
// RENDER AVAILABLE COURSES
// =====================================================

function renderAvailableCourses() {

    const container =
        document.getElementById(
            'availableCourses'
        );

    if (!container) {
        return;
    }

    // Get enrolled course IDs
    const enrolledIds =
        enrollments.map(
            enrollment =>
                String(enrollment.course_id)
        );

    // Remove already enrolled courses
    const availableCourses =
        courses.filter(
            course =>
                !enrolledIds.includes(
                    String(course.id)
                )
        );

    // Search input
    const searchInput =
        document.getElementById(
            'searchInput'
        );

    // Category filter
    const categoryFilter =
        document.getElementById(
            'categoryFilter'
        );

    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : '';

    const category =
        categoryFilter
            ? categoryFilter.value
            : '';

    // Filter courses
    const filtered =
        availableCourses.filter(course => {

            const title =
                String(course.title || '')
                    .toLowerCase();

            const code =
                String(course.code || '')
                    .toLowerCase();

            const matchesSearch =
                !search ||
                title.includes(search) ||
                code.includes(search);

            const matchesCategory =
                !category ||
                course.category === category;

            return (
                matchesSearch &&
                matchesCategory
            );
        });

    // No matching courses
    if (!filtered.length) {

        container.innerHTML = `
            <div
                class="empty-state"
                style="grid-column:1/-1;"
            >
                <div class="icon">
                    🔍
                </div>

                <p>
                    No courses match your search.
                </p>
            </div>
        `;

        return;
    }

    // Render available courses
    container.innerHTML =
        filtered.map(course => {

            return `
                <div class="course-card">

                    <span class="badge badge-amber">
                        ${course.category || ''}
                    </span>

                    <h3>
                        ${course.title || ''}
                    </h3>

                    <div class="course-meta">
                        <span>
                            ${course.code || ''}
                        </span>
                        ·
                        <span>
                            ${course.instructorName || ''}
                        </span>
                    </div>

                    <p class="course-desc">
                        ${course.description || ''}
                    </p>

                    <div class="course-actions">

                        <button
                            class="btn btn-primary btn-sm"
                            onclick="enroll('${course.id}')"
                        >
                            Enroll now
                        </button>

                    </div>

                </div>
            `;

        }).join('');
}


// =====================================================
// CATEGORY FILTER
// =====================================================

function populateCategoryFilter() {

    const select =
        document.getElementById(
            'categoryFilter'
        );

    if (!select) {
        return;
    }

    const categories = [
        ...new Set(
            courses
                .map(course => course.category)
                .filter(Boolean)
        )
    ];

    select.innerHTML =
        '<option value="">All categories</option>' +

        categories.map(category => {

            return `
                <option value="${category}">
                    ${category}
                </option>
            `;

        }).join('');
}


// =====================================================
// ENROLL IN COURSE
// =====================================================

async function enroll(courseId) {

    try {

        const formData =
            new FormData();

        formData.append(
            'course_id',
            courseId
        );

        const response =
            await fetch(
                'backend/api/enroll.php',
                {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                }
            );

        if (!response.ok) {
            throw new Error(
                `Enrollment request failed: ${response.status}`
            );
        }

        const data =
            await response.json();

        console.log(
            'ENROLL RESPONSE:',
            data
        );

        if (!data.success) {

            showToast(
                data.message ||
                'Enrollment failed.',
                'danger'
            );

            return;
        }

        showToast(
            'Enrolled successfully!',
            'success'
        );

        await refreshAll();

    } catch (error) {

        console.error(
            'Enroll error:',
            error
        );

        showToast(
            'Failed to enroll in course.',
            'danger'
        );
    }
}


// =====================================================
// UPDATE COURSE PROGRESS
// =====================================================

async function bumpProgress(enrollmentId) {

    try {

        const formData =
            new FormData();

        formData.append(
            'enrollment_id',
            enrollmentId
        );

        const response =
            await fetch(
                'backend/api/progress.php',
                {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                }
            );

        if (!response.ok) {
            throw new Error(
                `Progress request failed: ${response.status}`
            );
        }

        const data =
            await response.json();

        console.log(
            'PROGRESS RESPONSE:',
            data
        );

        if (!data.success) {

            showToast(
                data.message ||
                'Failed to update progress.',
                'danger'
            );

            return;
        }

        if (Number(data.progress) >= 100) {

            showToast(
                'Course completed! 🎉',
                'success'
            );

        } else {

            showToast(
                'Progress updated.',
                'success'
            );
        }

        await refreshAll();

    } catch (error) {

        console.error(
            'Progress error:',
            error
        );

        showToast(
            'Failed to update progress.',
            'danger'
        );
    }
}


// =====================================================
// REFRESH EVERYTHING
// =====================================================

async function refreshAll() {

    courses =
        await getCourses();

    enrollments =
        await getEnrollments();

    console.log(
        'COURSES:',
        courses
    );

    console.log(
        'MY ENROLLMENTS:',
        enrollments
    );

    renderStats();
    renderMyCourses();
    renderAvailableCourses();
}


// =====================================================
// LOGOUT
// =====================================================

async function logout() {

    try {

        const response =
            await fetch(
                'backend/api/logout.php',
                {
                    method: 'POST',
                    credentials: 'include',
                    cache: 'no-store'
                }
            );

        if (!response.ok) {
            throw new Error(
                `Logout request failed: ${response.status}`
            );
        }

        const data =
            await response.json();

        console.log(
            'LOGOUT RESPONSE:',
            data
        );

        if (data.success) {

            window.location.replace(
                'index.html'
            );

            return;
        }

        showToast(
            data.message ||
            'Logout failed.',
            'danger'
        );

    } catch (error) {

        console.error(
            'Logout error:',
            error
        );

        window.location.replace(
            'index.html'
        );
    }
}


// =====================================================
// INITIALIZE DASHBOARD
// =====================================================

async function initializeDashboard() {

    console.log(
        'Initializing student dashboard...'
    );

    // Check PHP session
    const loggedIn =
        await loadCurrentUser();

    if (!loggedIn) {
        return;
    }

    // Display user information
    renderUserInformation();

    // Load courses and enrollments
    await refreshAll();

    // Populate category filter
    populateCategoryFilter();

    // Render available courses again
    renderAvailableCourses();

    console.log(
        'Student dashboard initialized successfully.'
    );
}


// =====================================================
// DOM READY
// =====================================================

document.addEventListener(
    'DOMContentLoaded',
    function () {

        console.log(
            'Student dashboard DOM loaded.'
        );

        // Search
        const searchInput =
            document.getElementById(
                'searchInput'
            );

        if (searchInput) {

            searchInput.addEventListener(
                'input',
                renderAvailableCourses
            );
        }

        // Category filter
        const categoryFilter =
            document.getElementById(
                'categoryFilter'
            );

        if (categoryFilter) {

            categoryFilter.addEventListener(
                'change',
                renderAvailableCourses
            );
        }

        // Start dashboard
        initializeDashboard();
    }
);
