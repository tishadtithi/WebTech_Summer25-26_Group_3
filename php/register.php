<?php

include "db.php";

header("Content-Type: application/json");

$name = $_POST["name"];
$email = $_POST["email"];
$password = $_POST["password"];

$hashedPassword = password_hash(
    $password,
    PASSWORD_DEFAULT
);
$role = $_POST["role"];

if (empty($name) || empty($email) || empty($password) || empty($role)) {

    echo json_encode([
        "success" => false,
        "message" => "All fields are required."
    ]);

    exit;
}

$check = $conn->prepare(
    "SELECT id FROM users WHERE email = ?"
);

$check->bind_param("s", $email);

$check->execute();

$result = $check->get_result();

if ($result->num_rows > 0) {

    echo json_encode([
        "success" => false,
        "message" => "Email already exists."
    ]);

    exit;
}

$stmt = $conn->prepare(
    "INSERT INTO users (name, email, password, role)
     VALUES (?, ?, ?, ?)"
);

$stmt->bind_param(
    "ssss",
    $name,
    $email,
    $hashedPassword,
    $role
);

if ($stmt->execute()) {

    echo json_encode([
        "success" => true,
        "message" => "Registration successful!"
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Registration failed."
    ]);
}

$stmt->close();
$check->close();
$conn->close();

?>