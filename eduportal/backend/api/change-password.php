<?php

session_start();

header('Content-Type: application/json');

require_once '../config/database.php';


/*
|--------------------------------------------------------------------------
| Only POST is allowed
|--------------------------------------------------------------------------
*/

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {

    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method.'
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Check Login
|--------------------------------------------------------------------------
*/

if (!isset($_SESSION['user_id'])) {

    echo json_encode([
        'success' => false,
        'message' => 'Not logged in.'
    ]);

    exit;
}

$userId = $_SESSION['user_id'];

$currentPassword = $_POST['current_password'] ?? '';
$newPassword = $_POST['new_password'] ?? '';

if (strlen($newPassword) < 6) {

    echo json_encode([
        'success' => false,
        'message' => 'New password must be at least 6 characters.'
    ]);

    exit;
}


try {

    /*
    |--------------------------------------------------------------------------
    | Verify Current Password
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT password
        FROM users
        WHERE id = :user_id
        LIMIT 1
    ");

    $stmt->execute([
        ':user_id' => $userId
    ]);

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || $user['password'] !== $currentPassword) {

        echo json_encode([
            'success' => false,
            'message' => 'Current password is incorrect.'
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Update Password
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        UPDATE users
        SET password = :password
        WHERE id = :user_id
    ");

    $stmt->execute([
        ':password' => $newPassword,
        ':user_id' => $userId
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Password changed.'
    ]);

} catch (PDOException $e) {

    echo json_encode([
        'success' => false,
        'message' => 'Database error.'
    ]);
}

?>
