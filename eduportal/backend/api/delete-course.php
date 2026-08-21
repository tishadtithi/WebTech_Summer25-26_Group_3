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
        'message' => 'Only instructors can delete courses.'
    ]);

    exit;
}

$instructorId = $_SESSION['user_id'];
$courseId = trim($_POST['course_id'] ?? '');

if ($courseId === '') {

    echo json_encode([
        'success' => false,
        'message' => 'Course ID is required.'
    ]);

    exit;
}


try {

    // Enrollments for this course are removed automatically
    // via ON DELETE CASCADE (see database/schema.sql).

    $stmt = $pdo->prepare("
        DELETE FROM courses
        WHERE id = :course_id
        AND instructorId = :instructor_id
    ");

    $stmt->execute([
        ':course_id' => $courseId,
        ':instructor_id' => $instructorId
    ]);

    if ($stmt->rowCount() === 0) {

        echo json_encode([
            'success' => false,
            'message' => 'Course not found.'
        ]);

        exit;
    }

    echo json_encode([
        'success' => true,
        'message' => 'Course deleted.'
    ]);

} catch (PDOException $e) {

    echo json_encode([
        'success' => false,
        'message' => 'Database error.'
    ]);
}

?>
