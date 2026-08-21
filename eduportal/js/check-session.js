// =====================================================
// EDU PORTAL - PHP SESSION CHECK
// =====================================================

async function checkSession(requiredRole = null) {

    try {

        const response = await fetch(
            'backend/api/check-session.php',
            {
                method: 'GET',
                credentials: 'include',
                cache: 'no-store'
            }
        );

        console.log('Session HTTP status:', response.status);

        // -------------------------------------------------
        // Check HTTP response
        // -------------------------------------------------

        if (!response.ok) {

            console.error(
                'Session request failed:',
                response.status
            );

            return null;
        }

        const result = await response.json();

        console.log('Session response:', result);

        // -------------------------------------------------
        // Check whether user is logged in
        // -------------------------------------------------

        if (!result.success || !result.user) {

            console.log(
                'No valid PHP session found.'
            );

            return null;
        }

        // -------------------------------------------------
        // Check required role
        // -------------------------------------------------

        if (
            requiredRole &&
            result.user.role !== requiredRole
        ) {

            console.log(
                'Wrong role.',
                'Required:',
                requiredRole,
                'Actual:',
                result.user.role
            );

            return null;
        }

        // -------------------------------------------------
        // Session is valid
        // -------------------------------------------------

        console.log(
            'Valid session:',
            result.user
        );

        return result.user;

    } catch (error) {

        console.error(
            'Session check error:',
            error
        );

        return null;
    }
}