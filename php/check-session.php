<?php

session_start();

header("Content-Type: application/json");

if (!isset($_SESSION["user_id"])) {

    echo json_encode([
        "success" => false,
        "message" => "Not logged in."
    ]);

    exit;
}

echo json_encode([
    "success" => true,
    "user" => [
        "id" => $_SESSION["user_id"],
        "name" => $_SESSION["name"],
        "email" => $_SESSION["email"],
        "role" => $_SESSION["role"]
    ]
]);

?>