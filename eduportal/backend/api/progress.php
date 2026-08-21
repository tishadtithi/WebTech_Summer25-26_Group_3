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


/*
|--------------------------------------------------------------------------
| Check Student Role
|--------------------------------------------------------------------------
*/

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'student') {

    echo json_encode([
        'success' => false,
        'message' => 'Only students can update progress.'
    ]);

    exit;
}


$studentId = $_SESSION['user_id'];

$enrollmentId = trim($_POST['enrollment_id'] ?? '');


/*
|--------------------------------------------------------------------------
| Validate Enrollment ID
|--------------------------------------------------------------------------
*/

if ($enrollmentId === '') {

    echo json_encode([
        'success' => false,
        'message' => 'Enrollment ID is required.'
    ]);

    exit;
}


try {

    /*
    |--------------------------------------------------------------------------
    | Find Enrollment Belonging to Logged-in Student
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT id, progress
        FROM enrollments
        WHERE id = :enrollment_id
        AND student_id = :student_id
        LIMIT 1
    ");

    $stmt->execute([
        ':enrollment_id' => $enrollmentId,
        ':student_id' => $studentId
    ]);

    $enrollment = $stmt->fetch(PDO::FETCH_ASSOC);


    if (!$enrollment) {

        echo json_encode([
            'success' => false,
            'message' => 'Enrollment not found.'
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Increase Progress by 20
    |--------------------------------------------------------------------------
    */

    $newProgress = min(
        100,
        (int)$enrollment['progress'] + 20
    );


    /*
    |--------------------------------------------------------------------------
    | Update Database
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        UPDATE enrollments
        SET progress = :progress
        WHERE id = :enrollment_id
        AND student_id = :student_id
    ");

    $stmt->execute([
        ':progress' => $newProgress,
        ':enrollment_id' => $enrollmentId,
        ':student_id' => $studentId
    ]);


    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    echo json_encode([
        'success' => true,
        'message' => $newProgress >= 100
            ? 'Course completed!'
            : 'Progress updated.',
        'progress' => $newProgress
    ]);

} catch (PDOException $e) {

    echo json_encode([
        'success' => false,
        'message' => 'Database error.'
    ]);
}

?>