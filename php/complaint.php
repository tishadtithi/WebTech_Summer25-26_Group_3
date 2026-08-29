<?php

session_start();

include "db.php";

header("Content-Type: application/json");



if (!isset($_SESSION["user_id"])) {

    echo json_encode([
        "success" => false,
        "message" => "You must login first."
    ]);

    exit;
}


$user_id = $_SESSION["user_id"];

$action = $_REQUEST["action"] ?? "";




if ($action === "create") {

    $subject = $_POST["subject"] ?? "";
    $category = $_POST["category"] ?? "";
    $location = $_POST["location"] ?? "";
    $description = $_POST["description"] ?? "";


    if (
        empty($subject) ||
        empty($category) ||
        empty($location) ||
        empty($description)
    ) {

        echo json_encode([
            "success" => false,
            "message" => "All fields are required."
        ]);

        exit;
    }


    $stmt = $conn->prepare(
        "INSERT INTO complaints
        (user_id, subject, category, description, location)
        VALUES (?, ?, ?, ?, ?)"
    );


    $stmt->bind_param(
        "issss",
        $user_id,
        $subject,
        $category,
        $description,
        $location
    );


    if ($stmt->execute()) {

        echo json_encode([
            "success" => true,
            "message" => "Complaint submitted successfully."
        ]);

    } else {

        echo json_encode([
            "success" => false,
            "message" => "Failed to submit complaint."
        ]);
    }


    $stmt->close();

    exit;
}




if ($action === "my_complaints") {

    $stmt = $conn->prepare(
        "SELECT
            id,
            subject,
            category,
            description,
            location,
            status,
            response,
            created_at
        FROM complaints
        WHERE user_id = ?
        ORDER BY id DESC"
    );


    $stmt->bind_param(
        "i",
        $user_id
    );


    $stmt->execute();


    $result = $stmt->get_result();


    $complaints = [];


    while ($row = $result->fetch_assoc()) {

        $complaints[] = $row;

    }


    echo json_encode([
        "success" => true,
        "complaints" => $complaints
    ]);


    $stmt->close();

    exit;
}




echo json_encode([
    "success" => false,
    "message" => "Invalid action."
]);


$conn->close();

?>