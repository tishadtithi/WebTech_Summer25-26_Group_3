function logout() {

    let xhr = new XMLHttpRequest();

    xhr.open("GET", "../php/logout.php", true);

    xhr.onreadystatechange = function() {

        if (xhr.readyState === 4 && xhr.status === 200) {

            let response = JSON.parse(xhr.responseText);

            if (response.success) {

                window.location.href = "../login.html";

            }
        }
    };

    xhr.send();
}