<?php

session_start();

include "db.php";

header("Content-Type: application/json");

$email = $_POST["email"] ?? "";
$password = $_POST["password"] ?? "";

if (empty($email) || empty($password)) {

    echo json_encode([
        "success" => false,
        "message" => "Email and password are required."
    ]);

    exit;
}

$stmt = $conn->prepare(
    "SELECT id, name, email, password, role
     FROM users
     WHERE email = ?"
);

$stmt->bind_param("s", $email);

$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows === 0) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid email or password."
    ]);

    exit;
}

$user = $result->fetch_assoc();

if (!password_verify(
    $password,
    $user["password"]
)) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid email or password."
    ]);

    exit;
}

$_SESSION["user_id"] = $user["id"];
$_SESSION["name"] = $user["name"];
$_SESSION["email"] = $user["email"];
$_SESSION["role"] = $user["role"];

echo json_encode([
    "success" => true,
    "message" => "Login successful!",
    "role" => $user["role"]
]);

$stmt->close();
$conn->close();

?>