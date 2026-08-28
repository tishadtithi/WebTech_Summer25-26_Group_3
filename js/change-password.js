
function changePassword() {

    let currentPassword =
        document.getElementById("currentPassword")
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


  

    if (currentPassword === "") {

        showMessage(
            "Please enter your current password."
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
            "New password must be at least 6 characters."
        );

        return;
    }


    if (currentPassword === newPassword) {

        showMessage(
            "New password must be different from the current password."
        );

        return;
    }


  

    let xhr = new XMLHttpRequest();

    xhr.open(
        "POST",
        "php/change-password.php",
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
                        "Password changed successfully!"
                    );


                    /*
                     * Clear password fields
                     */

                    document.getElementById(
                        "currentPassword"
                    ).value = "";

                    document.getElementById(
                        "newPassword"
                    ).value = "";

                    document.getElementById(
                        "confirmPassword"
                    ).value = "";

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

        "currentPassword=" +
        encodeURIComponent(currentPassword) +

        "&newPassword=" +
        encodeURIComponent(newPassword)

    );

}




function showMessage(message) {

    document.getElementById("message")
        .textContent = message;

}