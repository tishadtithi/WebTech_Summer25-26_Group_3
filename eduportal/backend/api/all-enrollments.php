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
        'message' => 'Only admins can view all enrollments.'
    ]);

    exit;
}


try {

    $stmt = $pdo->query("
        SELECT
            id,
            student_id,
            course_id,
            progress
        FROM enrollments
        ORDER BY id ASC
    ");

    $enrollments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'enrollments' => $enrollments
    ]);

} catch (PDOException $e) {

    echo json_encode([
        'success' => false,
        'message' => 'Database error.'
    ]);
}

?>
