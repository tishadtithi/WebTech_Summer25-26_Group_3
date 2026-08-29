<?php

session_start();

header("Content-Type: application/json");

require_once "db.php";



$email = isset($_POST["email"])
    ? trim($_POST["email"])
    : "";


$resetCode = isset($_POST["resetCode"])
    ? trim($_POST["resetCode"])
    : "";


$newPassword = isset($_POST["newPassword"])
    ? $_POST["newPassword"]
    : "";



if (
    $email === "" ||
    $resetCode === "" ||
    $newPassword === ""
) {

    echo json_encode([
        "success" => false,
        "message" => "All fields are required."
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


if (strlen($newPassword) < 6) {

    echo json_encode([
        "success" => false,
        "message" =>
            "Password must be at least 6 characters."
    ]);

    exit;
}



$sql = "SELECT id, reset_code
        FROM users
        WHERE email = ?";


$stmt = $conn->prepare($sql);


if (!$stmt) {

    echo json_encode([
        "success" => false,
        "message" => "Database error."
    ]);

    exit;
}


$stmt->bind_param(
    "s",
    $email
);


$stmt->execute();


$result = $stmt->get_result();


if ($result->num_rows !== 1) {

    echo json_encode([
        "success" => false,
        "message" => "Account not found."
    ]);

    $stmt->close();
    $conn->close();

    exit;
}


$user = $result->fetch_assoc();


$stmt->close();



if (
    empty($user["reset_code"]) ||
    !hash_equals(
        $user["reset_code"],
        $resetCode
    )
) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid reset code."
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
        SET password = ?, reset_code = NULL
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
    $user["id"]
);


if ($stmt->execute()) {

    echo json_encode([
        "success" => true,
        "message" =>
            "Password reset successfully."
    ]);

}

else {

    echo json_encode([
        "success" => false,
        "message" =>
            "Failed to reset password."
    ]);

}


$stmt->close();

$conn->close();

?>