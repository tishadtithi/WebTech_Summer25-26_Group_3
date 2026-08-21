<?php

session_start();

header('Content-Type: application/json');

require_once '../config/database.php';


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
        'message' => 'Only admins can view users.'
    ]);

    exit;
}


try {

    $stmt = $pdo->query("
        SELECT
            id,
            name,
            email,
            role
        FROM users
        ORDER BY id ASC
    ");

    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'users' => $users
    ]);

} catch (PDOException $e) {

    echo json_encode([
        'success' => false,
        'message' => 'Database error.'
    ]);
}

?>
