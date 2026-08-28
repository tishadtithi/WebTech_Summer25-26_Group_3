document.addEventListener("DOMContentLoaded", function () {

    loadProfile();

});




function loadProfile() {

    let xhr = new XMLHttpRequest();

    xhr.open(
        "GET",
        "php/profile.php",
        true
    );

    xhr.onreadystatechange = function () {

        if (
            xhr.readyState === 4 &&
            xhr.status === 200
        ) {

            try {

                let response =
                    JSON.parse(xhr.responseText);


                if (response.success) {

                    // Display information

                    document.getElementById("displayName")
                        .textContent = response.user.name;

                    document.getElementById("displayEmail")
                        .textContent = response.user.email;

                    document.getElementById("displayRole")
                        .textContent = response.user.role;


                    // Put current values in inputs

                    document.getElementById("name")
                        .value = response.user.name;

                    document.getElementById("email")
                        .value = response.user.email;

                }

                else {

                    showMessage(response.message);

                }

            }

            catch (error) {

                console.log(error);

                showMessage(
                    "Something went wrong."
                );

            }

        }

    };

    xhr.send();

}



function updateProfile() {

    let name =
        document.getElementById("name")
        .value
        .trim();


    let email =
        document.getElementById("email")
        .value
        .trim();


    /* VALIDATION */

    if (name === "") {

        showMessage(
            "Please enter your name."
        );

        return;
    }


    if (email === "") {

        showMessage(
            "Please enter your email."
        );

        return;
    }


    /* AJAX REQUEST */

    let xhr = new XMLHttpRequest();

    xhr.open(
        "POST",
        "php/update-profile.php",
        true
    );


    xhr.setRequestHeader(
        "Content-Type",
        "application/x-www-form-urlencoded"
    );


    xhr.onreadystatechange = function () {

        if (
            xhr.readyState === 4 &&
            xhr.status === 200
        ) {

            try {

                let response =
                    JSON.parse(xhr.responseText);


                if (response.success) {

                    document.getElementById(
                        "displayName"
                    ).textContent =
                        response.user.name;


                    document.getElementById(
                        "displayEmail"
                    ).textContent =
                        response.user.email;


                    showMessage(
                        "Profile updated successfully!"
                    );

                }

                else {

                    showMessage(
                        response.message
                    );

                }

            }

            catch (error) {

                console.log(error);

                showMessage(
                    "Invalid server response."
                );

            }

        }

    };


    xhr.send(
        "name=" +
        encodeURIComponent(name) +

        "&email=" +
        encodeURIComponent(email)
    );

}



function showMessage(message) {

    document.getElementById("message")
        .textContent = message;

}


function deleteAccount() {

    let confirmation = confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmation) {
        return;
    }

    let xhr = new XMLHttpRequest();

    xhr.open(
        "POST",
        "php/delete-profile.php",
        true
    );

    xhr.onreadystatechange = function () {

        if (
            xhr.readyState === 4 &&
            xhr.status === 200
        ) {

            try {

                let response =
                    JSON.parse(xhr.responseText);

                if (response.success) {

                    alert(
                        "Your account has been deleted successfully."
                    );

                    window.location.href =
                        "login.html";

                } else {

                    showMessage(response.message);

                }

            } catch (error) {

                console.log(error);

                showMessage(
                    "Invalid server response."
                );

            }

        }

    };

    xhr.send();

}
