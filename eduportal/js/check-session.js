async function checkSession(requiredRole = null) {

    try {

        const response = await fetch(
            'backend/api/check-session.php',
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        const result = await response.json();

        console.log("Session response:", result);

        if (!result.success) {
            window.location.href = 'index.html';
            return null;
        }

        if (requiredRole && result.user.role !== requiredRole) {
            alert('You are not authorized to access this page.');
            window.location.href = 'index.html';
            return null;
        }

        return result.user;

    } catch (error) {

        console.error("Session check error:", error);

        window.location.href = 'index.html';

        return null;
    }
}