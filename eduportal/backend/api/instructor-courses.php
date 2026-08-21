<?php

session_start();

header('Content-Type: application/json');

require_once '../config/database.php';


/*
|--------------------------------------------------------------------------
| Check Login + Instructor Role
|--------------------------------------------------------------------------
*/

if (!isset($_SESSION['user_id'])) {

    echo json_encode([
        'success' => false,
        'message' => 'Not logged in.'
    ]);

    exit;
}

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'instructor') {

    echo json_encode([
        'success' => false,
        'message' => 'Only instructors can view this.'
    ]);

    exit;
}

$instructorId = $_SESSION['user_id'];


try {

    $stmt = $pdo->prepare("
        SELECT
            id,
            title,
            code,
            instructorId,
            instructorName,
            category,
            description,
            materials
        FROM courses
        WHERE instructorId = :instructor_id
        ORDER BY id ASC
    ");

    $stmt->execute([
        ':instructor_id' => $instructorId
    ]);

    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'courses' => $courses
    ]);

} catch (PDOException $e) {

    echo json_encode([
        'success' => false,
        'message' => 'Database error.'
    ]);
}

?>
