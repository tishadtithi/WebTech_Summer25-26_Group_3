function checkSession(requiredRole) {

    let xhr = new XMLHttpRequest();

    xhr.open("GET", "../php/check-session.php", true);

    xhr.onreadystatechange = function() {

        if (xhr.readyState === 4 && xhr.status === 200) {

            let response = JSON.parse(xhr.responseText);

            if (!response.success) {

                window.location.href = "../login.html";

                return;
            }

            if (response.user.role !== requiredRole) {

                alert("Access denied.");

                window.location.href = "../login.html";

                return;
            }

            console.log("Logged in user:", response.user);
        }
    };

    xhr.send();
}