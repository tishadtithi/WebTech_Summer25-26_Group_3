let currentStaff = null;

let selectedComplaintId = null;



function loadStaff() {

    let xhr = new XMLHttpRequest();

    xhr.open(
        "GET",
        "../php/check-session.php",
        true
    );


    xhr.onreadystatechange = function() {

        if (
            xhr.readyState === 4 &&
            xhr.status === 200
        ) {

            let response =
                JSON.parse(xhr.responseText);


            if (response.success) {

                currentStaff =
                    response.user;


                document.getElementById(
                    "welcome"
                ).innerHTML =
                    "Welcome, " +
                    currentStaff.name;


                loadAssignedComplaints();

            }

        }

    };


    xhr.send();
}




function loadAssignedComplaints() {

    let xhr = new XMLHttpRequest();


    xhr.open(
        "GET",
        "../php/staff.php?action=get_complaints",
        true
    );


    xhr.onreadystatechange = function() {

        if (
            xhr.readyState === 4 &&
            xhr.status === 200
        ) {

            let response =
                JSON.parse(xhr.responseText);


            if (response.success) {

                displayComplaints(
                    response.complaints
                );

            }

        }

    };


    xhr.send();
}



function displayComplaints(complaints) {

    let table =
        document.getElementById(
            "complaintTable"
        );


    table.innerHTML = "";


    let total = complaints.length;

    let pending = 0;

    let progress = 0;

    let resolved = 0;


    complaints.forEach(function(complaint) {


        if (complaint.status === "Pending") {

            pending++;

        }


        if (complaint.status === "In Progress") {

            progress++;

        }


        if (complaint.status === "Resolved") {

            resolved++;

        }


        let row =
            document.createElement("tr");


        row.innerHTML = `

            <td>${complaint.id}</td>

            <td>${complaint.student_name}</td>

            <td>${complaint.subject}</td>

            <td>${complaint.category}</td>

            <td>${complaint.location}</td>

            <td>${complaint.status}</td>

            <td>

                <button
                    onclick="openUpdateBox(
                        ${complaint.id},
                        '${complaint.status}',
                        '${escapeText(complaint.response || "")}'
                    )"
                >
                    Update
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



function escapeText(text) {

    return text
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "");

}




function openUpdateBox(
    complaintId,
    status,
    response
) {

    selectedComplaintId =
        complaintId;


    document.getElementById(
        "selectedComplaint"
    ).innerHTML =
        "Complaint ID: " +
        complaintId;


    document.getElementById(
        "updateStatus"
    ).value = status;


    document.getElementById(
        "responseText"
    ).value = response;


    document.getElementById(
        "updateMessage"
    ).innerHTML = "";


    document.getElementById(
        "updateBox"
    ).style.display = "flex";

}




function closeUpdateBox() {

    document.getElementById(
        "updateBox"
    ).style.display = "none";

}



function saveUpdate() {

    let status =
        document.getElementById(
            "updateStatus"
        ).value;


    let response =
        document.getElementById(
            "responseText"
        ).value;


    let xhr =
        new XMLHttpRequest();


    xhr.open(
        "POST",
        "../php/staff.php",
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

            let result =
                JSON.parse(
                    xhr.responseText
                );


            document.getElementById(
                "updateMessage"
            ).innerHTML =
                result.message;


            if (result.success) {

                setTimeout(
                    function() {

                        closeUpdateBox();

                        loadAssignedComplaints();

                    },
                    500
                );

            }

        }

    };


    let data =
        "action=update_complaint" +
        "&complaint_id=" +
        encodeURIComponent(
            selectedComplaintId
        ) +
        "&status=" +
        encodeURIComponent(status) +
        "&response=" +
        encodeURIComponent(response);


    xhr.send(data);

}



loadStaff();