document.getElementById("registerForm").addEventListener("submit", function(event) {

    event.preventDefault();

    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let role = document.getElementById("role").value;

    let xhr = new XMLHttpRequest();

    xhr.open("POST", "php/register.php", true);

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
                document.getElementById("registerForm").reset();
            }
        }
    };

    let data =
        "name=" + encodeURIComponent(name) +
        "&email=" + encodeURIComponent(email) +
        "&password=" + encodeURIComponent(password) +
        "&role=" + encodeURIComponent(role);

    xhr.send(data);

});