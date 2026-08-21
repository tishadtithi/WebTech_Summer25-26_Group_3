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
| Check Login + Admin Role
|--------------------------------------------------------------------------
*/

if (!isset($_SESSION['user_id'])) {

    echo json_encode([
        'success' => false,
        'message' => 'Not logged in.'
    ]);

    exit;
}

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {

    echo json_encode([
        'success' => false,
        'message' => 'Only admins can remove users.'
    ]);

    exit;
}

$userId = trim($_POST['user_id'] ?? '');

if ($userId === '') {

    echo json_encode([
        'success' => false,
        'message' => 'User ID is required.'
    ]);

    exit;
}

if ($userId === $_SESSION['user_id']) {

    echo json_encode([
        'success' => false,
        'message' => 'You cannot remove your own admin account.'
    ]);

    exit;
}


try {

    // Related courses and enrollments are removed automatically
    // via ON DELETE CASCADE foreign keys (see database/schema.sql).

    $stmt = $pdo->prepare("
        DELETE FROM users
        WHERE id = :user_id
    ");

    $stmt->execute([
        ':user_id' => $userId
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'User removed.'
    ]);

} catch (PDOException $e) {

    echo json_encode([
        'success' => false,
        'message' => 'Database error.'
    ]);
}

?>
