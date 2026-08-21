<?php

session_start();

header('Content-Type: application/json');

require_once '../config/database.php';


try {

    $stmt = $pdo->query("
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
        ORDER BY id ASC
    ");

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