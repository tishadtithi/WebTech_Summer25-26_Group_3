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

    $sql = "
        SELECT
            u.name AS student_name,
            u.email AS student_email,
            c.title AS course_title,
            e.progress
        FROM enrollments e
        INNER JOIN courses c
            ON e.course_id = c.id
        INNER JOIN users u
            ON e.student_id = u.id
        WHERE c.instructorId = :instructor_id
        ORDER BY e.id ASC
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ':instructor_id' => $instructorId
    ]);

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'students' => $rows
    ]);

} catch (PDOException $e) {

    echo json_encode([
        'success' => false,
        'message' => 'Database error.'
    ]);
}

?>
