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


try {

    // Owned courses and enrollments are removed automatically
    // via ON DELETE CASCADE (see database/schema.sql).

    $stmt = $pdo->prepare("
        DELETE FROM users
        WHERE id = :user_id
    ");

    $stmt->execute([
        ':user_id' => $userId
    ]);

    session_unset();
    session_destroy();

    echo json_encode([
        'success' => true,
        'message' => 'Account deleted.'
    ]);

} catch (PDOException $e) {

    echo json_encode([
        'success' => false,
        'message' => 'Database error.'
    ]);
}

?>
