let currentUser = null;


function loadStudent() {

    let xhr = new XMLHttpRequest();

    xhr.open("GET", "../php/check-session.php", true);

    xhr.onreadystatechange = function() {

        if (xhr.readyState === 4 && xhr.status === 200) {

            let response = JSON.parse(xhr.responseText);

            if (response.success) {

                currentUser = response.user;

                document.getElementById("welcome").innerHTML =
                    "Welcome, " + currentUser.name;

                loadComplaints();

            }
        }
    };

    xhr.send();
}




function loadComplaints() {

    let xhr = new XMLHttpRequest();

    xhr.open("GET", "../php/complaint.php?action=my_complaints", true);

    xhr.onreadystatechange = function() {

        if (xhr.readyState === 4 && xhr.status === 200) {

            let response = JSON.parse(xhr.responseText);

            if (response.success) {

                displayComplaints(response.complaints);

            }
        }
    };

    xhr.send();
}



function displayComplaints(complaints) {

    let table = document.getElementById("complaintTable");

    table.innerHTML = "";

    let total = complaints.length;

    let pending = 0;
    let progress = 0;
    let resolved = 0;


    complaints.forEach(function(complaint) {

        if (complaint.status === "Pending") {

            pending++;

        } else if (complaint.status === "In Progress") {

            progress++;

        } else if (complaint.status === "Resolved") {

            resolved++;

        }


        let row = document.createElement("tr");

        row.innerHTML = `
            <td>${complaint.id}</td>
            <td>${complaint.subject}</td>
            <td>${complaint.category}</td>
            <td>${complaint.location}</td>
            <td>${complaint.status}</td>
            <td>${complaint.created_at}</td>
        `;

        table.appendChild(row);

    });


    document.getElementById("totalComplaints").innerHTML = total;

    document.getElementById("pendingComplaints").innerHTML = pending;

    document.getElementById("progressComplaints").innerHTML = progress;

    document.getElementById("resolvedComplaints").innerHTML = resolved;
}



document.getElementById("complaintForm").addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        let subject =
            document.getElementById("subject").value;

        let category =
            document.getElementById("category").value;

        let location =
            document.getElementById("location").value;

        let description =
            document.getElementById("description").value;


        let xhr = new XMLHttpRequest();


        xhr.open(
            "POST",
            "../php/complaint.php",
            true
        );


        xhr.setRequestHeader(
            "Content-Type",
            "application/x-www-form-urlencoded"
        );


        xhr.onreadystatechange = function() {

            if (xhr.readyState === 4 && xhr.status === 200) {

                let response = JSON.parse(
                    xhr.responseText
                );


                document.getElementById(
                    "complaintMessage"
                ).innerHTML = response.message;


                if (response.success) {

                    document.getElementById(
                        "complaintForm"
                    ).reset();


                    loadComplaints();

                }

            }

        };


        let data =
            "action=create" +
            "&subject=" + encodeURIComponent(subject) +
            "&category=" + encodeURIComponent(category) +
            "&location=" + encodeURIComponent(location) +
            "&description=" + encodeURIComponent(description);


        xhr.send(data);

    }
);



loadStudent();