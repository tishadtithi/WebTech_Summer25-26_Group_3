// =====================================================
// EDU PORTAL - SHARED MAIN JAVASCRIPT
// PHP SESSION + MYSQL VERSION
// =====================================================


// =====================================================
// SHOW TOAST MESSAGE
// =====================================================

function showToast(message, type = 'default') {

    let toast =
        document.querySelector('.toast');

    if (!toast) {

        toast =
            document.createElement('div');

        toast.className = 'toast';

        document.body.appendChild(toast);
    }


    toast.textContent = message;


    toast.className =
        'toast show' +
        (
            type === 'success'
                ? ' toast-success'
                : type === 'danger'
                    ? ' toast-danger'
                    : ''
        );


    clearTimeout(toast._timer);


    toast._timer =
        setTimeout(() => {

            toast.classList.remove('show');

        }, 2600);
}


// =====================================================
// GET INITIALS
// =====================================================

function initials(name) {

    if (!name) {
        return '';
    }


    return name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(
            namePart =>
                namePart[0].toUpperCase()
        )
        .join('');
}


// =====================================================
// RENDER USER CHIP
// =====================================================

function renderUserChip(elementId, user) {

    const element =
        document.getElementById(elementId);


    if (!element) {
        return;
    }


    if (!user) {

        element.innerHTML = '';

        return;
    }


    element.innerHTML = `
        <div class="avatar">
            ${initials(user.name)}
        </div>

        <div>

            <div
                style="
                    font-weight:600;
                    font-size:0.85rem;
                "
            >
                ${user.name}
            </div>

            <div
                style="
                    font-size:0.72rem;
                    color:var(--text-muted);
                    text-transform:capitalize;
                "
            >
                ${user.role}
            </div>

        </div>
    `;
}


// =====================================================
// VALIDATE FIELD
// =====================================================

function validateField(
    fieldElement,
    condition,
    message
) {

    if (!fieldElement) {
        return false;
    }


    const wrapper =
        fieldElement.closest('.field');


    if (!wrapper) {
        return condition;
    }


    const errorElement =
        wrapper.querySelector(
            '.field-error'
        );


    if (!condition) {

        wrapper.classList.add(
            'invalid'
        );


        if (errorElement) {

            errorElement.textContent =
                message;
        }


        return false;
    }


    wrapper.classList.remove(
        'invalid'
    );


    if (errorElement) {

        errorElement.textContent = '';
    }


    return true;
}


// =====================================================
// VALIDATE EMAIL
// =====================================================

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);
}