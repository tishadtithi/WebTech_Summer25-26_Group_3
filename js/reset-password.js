

function resetPassword() {

    let email =
        document.getElementById("email")
        .value
        .trim();


    let resetCode =
        document.getElementById("resetCode")
        .value
        .trim();


    let newPassword =
        document.getElementById("newPassword")
        .value
        .trim();


    let confirmPassword =
        document.getElementById("confirmPassword")
        .value
        .trim();


    if (email === "") {

        showMessage(
            "Please enter your email."
        );

        return;
    }


    if (resetCode === "") {

        showMessage(
            "Please enter the reset code."
        );

        return;
    }


    if (newPassword === "") {

        showMessage(
            "Please enter a new password."
        );

        return;
    }


    if (confirmPassword === "") {

        showMessage(
            "Please confirm your new password."
        );

        return;
    }


    if (newPassword !== confirmPassword) {

        showMessage(
            "New passwords do not match."
        );

        return;
    }


    if (newPassword.length < 6) {

        showMessage(
            "Password must be at least 6 characters."
        );

        return;
    }


  

    let xhr = new XMLHttpRequest();

    xhr.open(
        "POST",
        "php/reset-password.php",
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

                    showMessage(
                        "Password reset successfully!"
                    );


                    /*
                     * Clear fields
                     */

                    document.getElementById(
                        "email"
                    ).value = "";

                    document.getElementById(
                        "resetCode"
                    ).value = "";

                    document.getElementById(
                        "newPassword"
                    ).value = "";

                    document.getElementById(
                        "confirmPassword"
                    ).value = "";


                    /*
                     * Go to login after a short delay
                     */

                    setTimeout(function () {

                        window.location.href =
                            "login.html";

                    }, 1500);

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

        "email=" +
        encodeURIComponent(email) +

        "&resetCode=" +
        encodeURIComponent(resetCode) +

        "&newPassword=" +
        encodeURIComponent(newPassword)

    );

}




function showMessage(message) {

    document.getElementById("message")
        .textContent = message;

}