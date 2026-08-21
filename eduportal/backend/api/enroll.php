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
        'message' => 'Only students can enroll in courses.'
    ]);

    exit;
}


$studentId = $_SESSION['user_id'];

$courseId = trim($_POST['course_id'] ?? '');


/*
|--------------------------------------------------------------------------
| Validate Course ID
|--------------------------------------------------------------------------
*/

if ($courseId === '') {

    echo json_encode([
        'success' => false,
        'message' => 'Course ID is required.'
    ]);

    exit;
}


try {

    /*
    |--------------------------------------------------------------------------
    | Check Course Exists
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT id
        FROM courses
        WHERE id = :course_id
        LIMIT 1
    ");

    $stmt->execute([
        ':course_id' => $courseId
    ]);

    $course = $stmt->fetch(PDO::FETCH_ASSOC);


    if (!$course) {

        echo json_encode([
            'success' => false,
            'message' => 'Course not found.'
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Check Already Enrolled
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT id
        FROM enrollments
        WHERE student_id = :student_id
        AND course_id = :course_id
        LIMIT 1
    ");

    $stmt->execute([
        ':student_id' => $studentId,
        ':course_id' => $courseId
    ]);

    if ($stmt->fetch()) {

        echo json_encode([
            'success' => false,
            'message' => 'Already enrolled in this course.'
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Create Enrollment
    |--------------------------------------------------------------------------
    */

    $enrollmentId = 'e-' . uniqid();

    $stmt = $pdo->prepare("
        INSERT INTO enrollments
        (
            id,
            student_id,
            course_id,
            progress
        )
        VALUES
        (
            :id,
            :student_id,
            :course_id,
            0
        )
    ");

    $stmt->execute([
        ':id' => $enrollmentId,
        ':student_id' => $studentId,
        ':course_id' => $courseId
    ]);


    /*
    |--------------------------------------------------------------------------
    | Success
    |--------------------------------------------------------------------------
    */

    echo json_encode([
        'success' => true,
        'message' => 'Enrolled successfully.',
        'enrollment_id' => $enrollmentId
    ]);

} catch (PDOException $e) {

    echo json_encode([
        'success' => false,
        'message' => 'Database error.'
    ]);
}

?>