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
        'message' => 'Only instructors can manage courses.'
    ]);

    exit;
}

$instructorId = $_SESSION['user_id'];
$instructorName = $_SESSION['name'];

$courseId = trim($_POST['course_id'] ?? '');
$title = trim($_POST['title'] ?? '');
$code = trim($_POST['code'] ?? '');
$category = trim($_POST['category'] ?? '');
$description = trim($_POST['description'] ?? '');
$materials = trim($_POST['materials'] ?? '');


/*
|--------------------------------------------------------------------------
| Validate Input
|--------------------------------------------------------------------------
*/

if ($title === '' || $code === '' || $category === '' || $description === '') {

    echo json_encode([
        'success' => false,
        'message' => 'Title, code, category and description are required.'
    ]);

    exit;
}


try {

    if ($courseId !== '') {

        /*
        |--------------------------------------------------------------------------
        | Update Existing Course (must belong to this instructor)
        |--------------------------------------------------------------------------
        */

        $stmt = $pdo->prepare("
            SELECT id
            FROM courses
            WHERE id = :course_id
            AND instructorId = :instructor_id
            LIMIT 1
        ");

        $stmt->execute([
            ':course_id' => $courseId,
            ':instructor_id' => $instructorId
        ]);

        if (!$stmt->fetch()) {

            echo json_encode([
                'success' => false,
                'message' => 'Course not found.'
            ]);

            exit;
        }

        $stmt = $pdo->prepare("
            UPDATE courses
            SET
                title = :title,
                code = :code,
                category = :category,
                description = :description,
                materials = :materials
            WHERE id = :course_id
            AND instructorId = :instructor_id
        ");

        $stmt->execute([
            ':title' => $title,
            ':code' => $code,
            ':category' => $category,
            ':description' => $description,
            ':materials' => $materials,
            ':course_id' => $courseId,
            ':instructor_id' => $instructorId
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'Course updated.',
            'course_id' => $courseId
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Create New Course
    |--------------------------------------------------------------------------
    */

    $newCourseId = 'c-' . uniqid();

    $stmt = $pdo->prepare("
        INSERT INTO courses
        (
            id,
            title,
            code,
            instructorId,
            instructorName,
            category,
            description,
            materials
        )
        VALUES
        (
            :id,
            :title,
            :code,
            :instructor_id,
            :instructor_name,
            :category,
            :description,
            :materials
        )
    ");

    $stmt->execute([
        ':id' => $newCourseId,
        ':title' => $title,
        ':code' => $code,
        ':instructor_id' => $instructorId,
        ':instructor_name' => $instructorName,
        ':category' => $category,
        ':description' => $description,
        ':materials' => $materials
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Course published.',
        'course_id' => $newCourseId
    ]);

} catch (PDOException $e) {

    echo json_encode([
        'success' => false,
        'message' => 'Database error.'
    ]);
}

?>
