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


$sql = "SELECT id, name, email, role
        FROM users
        WHERE id = ?";


$stmt = $conn->prepare($sql);

$stmt->bind_param("i", $user_id);

$stmt->execute();


$result = $stmt->get_result();


if ($result->num_rows === 1) {

    $user = $result->fetch_assoc();

    echo json_encode([
        "success" => true,
        "user" => [
            "id" => $user["id"],
            "name" => $user["name"],
            "email" => $user["email"],
            "role" => $user["role"]
        ]
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "User not found."
    ]);

}


$stmt->close();

$conn->close();

?>