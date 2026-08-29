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




$currentPassword =
    isset($_POST["currentPassword"])
    ? $_POST["currentPassword"]
    : "";


$newPassword =
    isset($_POST["newPassword"])
    ? $_POST["newPassword"]
    : "";


if (
    $currentPassword === "" ||
    $newPassword === ""
) {

    echo json_encode([
        "success" => false,
        "message" => "All fields are required."
    ]);

    exit;
}


if (strlen($newPassword) < 6) {

    echo json_encode([
        "success" => false,
        "message" =>
            "New password must be at least 6 characters."
    ]);

    exit;
}


if ($currentPassword === $newPassword) {

    echo json_encode([
        "success" => false,
        "message" =>
            "New password must be different from the current password."
    ]);

    exit;
}




$sql = "SELECT password
        FROM users
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
    "i",
    $user_id
);


$stmt->execute();


$result = $stmt->get_result();


if ($result->num_rows !== 1) {

    echo json_encode([
        "success" => false,
        "message" => "User not found."
    ]);

    $stmt->close();

    $conn->close();

    exit;
}


$user = $result->fetch_assoc();


$stmt->close();



if (
    !password_verify(
        $currentPassword,
        $user["password"]
    )
) {

    echo json_encode([
        "success" => false,
        "message" => "Current password is incorrect."
    ]);

    $conn->close();

    exit;
}



$hashedPassword =
    password_hash(
        $newPassword,
        PASSWORD_DEFAULT
    );




$sql = "UPDATE users
        SET password = ?
        WHERE id = ?";


$stmt = $conn->prepare($sql);


if (!$stmt) {

    echo json_encode([
        "success" => false,
        "message" => "Database error."
    ]);

    $conn->close();

    exit;
}


$stmt->bind_param(
    "si",
    $hashedPassword,
    $user_id
);


if ($stmt->execute()) {

    echo json_encode([
        "success" => true,
        "message" =>
            "Password changed successfully."
    ]);

}

else {

    echo json_encode([
        "success" => false,
        "message" =>
            "Failed to change password."
    ]);

}


$stmt->close();

$conn->close();

?>