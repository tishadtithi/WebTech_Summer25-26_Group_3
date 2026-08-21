<?php

session_start();

header('Content-Type: application/json');

require_once '../config/database.php';

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

$studentId = $_SESSION['user_id'];


/*
|--------------------------------------------------------------------------
| Only GET is allowed
|--------------------------------------------------------------------------
*/

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {

    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method.'
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Get Enrollments
|--------------------------------------------------------------------------
*/

try {

    $sql = "
        SELECT
            e.id,
            e.student_id,
            e.course_id,
            e.progress,
            c.title,
            c.code,
            c.instructorName,
            c.category,
            c.description,
            c.materials
        FROM enrollments e
        INNER JOIN courses c
            ON e.course_id = c.id
        WHERE e.student_id = :student_id
        ORDER BY e.id ASC
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ':student_id' => $studentId
    ]);

    $enrollments = $stmt->fetchAll(PDO::FETCH_ASSOC);


    /*
    |--------------------------------------------------------------------------
    | Return JSON
    |--------------------------------------------------------------------------
    */

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