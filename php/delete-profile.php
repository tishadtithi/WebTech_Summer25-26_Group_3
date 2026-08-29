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


$sql = "DELETE FROM users WHERE id = ?";

$stmt = $conn->prepare($sql);


if (!$stmt) {

    echo json_encode([
        "success" => false,
        "message" => "Prepare failed: " . $conn->error
    ]);

    exit;
}


$stmt->bind_param("i", $user_id);


if ($stmt->execute()) {

    if ($stmt->affected_rows > 0) {

        session_unset();
        session_destroy();

        echo json_encode([
            "success" => true,
            "message" => "Account deleted successfully."
        ]);

    } else {

        echo json_encode([
            "success" => false,
            "message" => "No user was deleted. User ID: " . $user_id
        ]);

    }

} else {

    echo json_encode([
        "success" => false,
        "message" => "Delete failed: " . $stmt->error
    ]);

}


$stmt->close();

$conn->close();

?>