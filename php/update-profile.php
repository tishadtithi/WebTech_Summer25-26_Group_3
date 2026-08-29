<?php

session_start();

header("Content-Type: application/json");

require_once "db.php";



if (!isset($_SESSION["user_id"])) {

    echo json_encode([
        "success" => false,
        "message" => "You are not logged in."
    ]);

    exit;
}


$user_id = $_SESSION["user_id"];




$name = isset($_POST["name"])
    ? trim($_POST["name"])
    : "";


$email = isset($_POST["email"])
    ? trim($_POST["email"])
    : "";



if ($name === "" || $email === "") {

    echo json_encode([
        "success" => false,
        "message" => "Name and email are required."
    ]);

    exit;
}


if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid email address."
    ]);

    exit;
}



$sql = "UPDATE users
        SET name = ?, email = ?
        WHERE id = ?";


$stmt = $conn->prepare($sql);


if (!$stmt) {

    echo json_encode([
        "success" => false,
        "message" => "Database error."
    ]);

    exit;
}


$stmt->bind_param(
    "ssi",
    $name,
    $email,
    $user_id
);


if ($stmt->execute()) {

    echo json_encode([

        "success" => true,

        "message" =>
            "Profile updated successfully.",

        "user" => [

            "name" => $name,

            "email" => $email

        ]

    ]);

}

else {

    echo json_encode([

        "success" => false,

        "message" =>
            "Failed to update profile."

    ]);

}


$stmt->close();

$conn->close();

?>