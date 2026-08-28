document.getElementById("loginForm").addEventListener("submit", function(event) {

    event.preventDefault();

    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    let xhr = new XMLHttpRequest();

    xhr.open("POST", "php/login.php", true);

    xhr.setRequestHeader(
        "Content-Type",
        "application/x-www-form-urlencoded"
    );

    xhr.onreadystatechange = function() {

        if (xhr.readyState === 4 && xhr.status === 200) {

            let response = JSON.parse(xhr.responseText);

            let message = document.getElementById("message");

            message.innerHTML = response.message;

            if (response.success) {

                if (response.role === "admin") {

                    window.location.href = "admin/dashboard.html";

                } else if (response.role === "staff") {

                    window.location.href = "staff/dashboard.html";

                } else if (response.role === "student") {

                    window.location.href = "student/dashboard.html";
                }
            }
        }
    };

    let data =
        "email=" + encodeURIComponent(email) +
        "&password=" + encodeURIComponent(password);

    xhr.send(data);

});