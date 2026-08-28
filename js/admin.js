let staffList = [];


function loadAdmin() {

    let xhr = new XMLHttpRequest();

    xhr.open("GET", "../php/check-session.php", true);

    xhr.onreadystatechange = function() {

        if (xhr.readyState === 4 && xhr.status === 200) {

            let response = JSON.parse(xhr.responseText);

            if (response.success) {

                document.getElementById("welcome").innerHTML =
                    "Welcome, " + response.user.name;

                loadStaff();

            }

        }

    };

    xhr.send();
}




function loadStaff() {

    let xhr = new XMLHttpRequest();

    xhr.open(
        "GET",
        "../php/admin.php?action=get_staff",
        true
    );

    xhr.onreadystatechange = function() {

        if (xhr.readyState === 4 && xhr.status === 200) {

            let response = JSON.parse(xhr.responseText);

            if (response.success) {

                staffList = response.staff;

                loadComplaints();

            }

        }

    };

    xhr.send();
}



function loadComplaints() {

    let xhr = new XMLHttpRequest();

    xhr.open(
        "GET",
        "../php/admin.php?action=get_complaints",
        true
    );

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

    let table =
        document.getElementById("complaintTable");

    table.innerHTML = "";

    let total = complaints.length;

    let pending = 0;
    let progress = 0;
    let resolved = 0;


    complaints.forEach(function(complaint) {

        if (complaint.status === "Pending") {

            pending++;

        }

        else if (complaint.status === "In Progress") {

            progress++;

        }

        else if (complaint.status === "Resolved") {

            resolved++;

        }


        let staffOptions =
            '<option value="">Select Staff</option>';


        staffList.forEach(function(staff) {

            let selected = "";

            if (
                complaint.assigned_to == staff.id
            ) {

                selected = "selected";

            }


            staffOptions += `
                <option
                    value="${staff.id}"
                    ${selected}
                >
                    ${staff.name}
                </option>
            `;

        });


        let row = document.createElement("tr");


        row.innerHTML = `

            <td>${complaint.id}</td>

            <td>${complaint.student_name}</td>

            <td>${complaint.subject}</td>

            <td>${complaint.category}</td>

            <td>${complaint.location}</td>

            <td>${complaint.status}</td>

            <td>

    <select
        onchange="assignStaff(
            ${complaint.id},
            this.value
        )"
    >

        ${staffOptions}

    </select>

    <button
        onclick="deleteComplaint(${complaint.id})"
    >
        Delete
    </button>

</td>

        `;


        table.appendChild(row);

    });


    document.getElementById(
        "totalComplaints"
    ).innerHTML = total;


    document.getElementById(
        "pendingComplaints"
    ).innerHTML = pending;


    document.getElementById(
        "progressComplaints"
    ).innerHTML = progress;


    document.getElementById(
        "resolvedComplaints"
    ).innerHTML = resolved;

}




function assignStaff(complaintId, staffId) {

    if (staffId === "") {

        return;

    }


    let xhr = new XMLHttpRequest();


    xhr.open(
        "POST",
        "../php/admin.php",
        true
    );


    xhr.setRequestHeader(
        "Content-Type",
        "application/x-www-form-urlencoded"
    );


    xhr.onreadystatechange = function() {

        if (
            xhr.readyState === 4 &&
            xhr.status === 200
        ) {

            let response =
                JSON.parse(xhr.responseText);


            alert(response.message);


            if (response.success) {

                loadComplaints();

            }

        }

    };


    let data =
        "action=assign_staff" +
        "&complaint_id=" +
        encodeURIComponent(complaintId) +
        "&staff_id=" +
        encodeURIComponent(staffId);


    xhr.send(data);

}


function deleteComplaint(complaintId) {

    let confirmDelete = confirm(
        "Are you sure you want to delete this complaint?"
    );


    if (!confirmDelete) {

        return;

    }


    let xhr = new XMLHttpRequest();


    xhr.open(
        "POST",
        "../php/admin.php",
        true
    );


    xhr.setRequestHeader(
        "Content-Type",
        "application/x-www-form-urlencoded"
    );


    xhr.onreadystatechange = function() {

        if (
            xhr.readyState === 4 &&
            xhr.status === 200
        ) {

            let response =
                JSON.parse(xhr.responseText);


            alert(response.message);


            if (response.success) {

                loadComplaints();

            }

        }

    };


    let data =
        "action=delete_complaint" +
        "&complaint_id=" +
        encodeURIComponent(complaintId);


    xhr.send(data);

}



loadAdmin();