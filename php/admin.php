<?php

session_start();

include "db.php";

header("Content-Type: application/json");




if (!isset($_SESSION["user_id"])) {

    echo json_encode([
        "success" => false,
        "message" => "Please login first."
    ]);

    exit;
}


if ($_SESSION["role"] !== "admin") {

    echo json_encode([
        "success" => false,
        "message" => "Access denied."
    ]);

    exit;
}


$action = $_REQUEST["action"] ?? "";


=

if ($action === "get_staff") {

    $result = $conn->query(
        "SELECT id, name
         FROM users
         WHERE role = 'staff'
         ORDER BY name"
    );


    $staff = [];


    while ($row = $result->fetch_assoc()) {

        $staff[] = $row;

    }


    echo json_encode([
        "success" => true,
        "staff" => $staff
    ]);

    exit;
}




if ($action === "get_complaints") {

    $sql = "
        SELECT
            c.id,
            c.subject,
            c.category,
            c.description,
            c.location,
            c.status,
            c.assigned_to,
            c.created_at,
            u.name AS student_name

        FROM complaints c

        INNER JOIN users u
        ON c.user_id = u.id

        ORDER BY c.id DESC
    ";


    $result = $conn->query($sql);


    $complaints = [];


    while ($row = $result->fetch_assoc()) {

        $complaints[] = $row;

    }


    echo json_encode([
        "success" => true,
        "complaints" => $complaints
    ]);

    exit;
}




if ($action === "assign_staff") {

    $complaint_id =
        $_POST["complaint_id"] ?? 0;

    $staff_id =
        $_POST["staff_id"] ?? 0;


    if (
        empty($complaint_id) ||
        empty($staff_id)
    ) {

        echo json_encode([
            "success" => false,
            "message" => "Invalid data."
        ]);

        exit;
    }


  

    $check = $conn->prepare(
        "SELECT id
         FROM users
         WHERE id = ?
         AND role = 'staff'"
    );


    $check->bind_param(
        "i",
        $staff_id
    );


    $check->execute();


    $result = $check->get_result();


    if ($result->num_rows === 0) {

        echo json_encode([
            "success" => false,
            "message" => "Invalid staff member."
        ]);

        exit;
    }


   

    $stmt = $conn->prepare(
        "UPDATE complaints
         SET assigned_to = ?,
             status = 'In Progress'
         WHERE id = ?"
    );


    $stmt->bind_param(
        "ii",
        $staff_id,
        $complaint_id
    );


    if ($stmt->execute()) {

        echo json_encode([
            "success" => true,
            "message" => "Staff assigned successfully."
        ]);

    } else {

        echo json_encode([
            "success" => false,
            "message" => "Failed to assign staff."
        ]);
    }


    $stmt->close();

    exit;
}




if ($action === "delete_complaint") {

    $complaint_id =
        $_POST["complaint_id"] ?? 0;


    if (empty($complaint_id)) {

        echo json_encode([
            "success" => false,
            "message" => "Invalid complaint ID."
        ]);

        exit;
    }


    $stmt = $conn->prepare(
        "DELETE FROM complaints
         WHERE id = ?"
    );


    $stmt->bind_param(
        "i",
        $complaint_id
    );


    if ($stmt->execute()) {

        echo json_encode([
            "success" => true,
            "message" => "Complaint deleted successfully."
        ]);

    } else {

        echo json_encode([
            "success" => false,
            "message" => "Failed to delete complaint."
        ]);
    }


    $stmt->close();

    exit;
}


$conn->close();

?>