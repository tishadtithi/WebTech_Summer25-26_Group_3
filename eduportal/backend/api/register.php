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
| Get Registration Data
|--------------------------------------------------------------------------
*/

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$role = trim($_POST['role'] ?? '');


/*
|--------------------------------------------------------------------------
| Validate Input
|--------------------------------------------------------------------------
*/

if ($name === '' || $email === '' || $password === '' || $role === '') {

    echo json_encode([
        'success' => false,
        'message' => 'All fields are required.'
    ]);

    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

    echo json_encode([
        'success' => false,
        'message' => 'Please enter a valid email address.'
    ]);

    exit;
}

if (strlen($password) < 6) {

    echo json_encode([
        'success' => false,
        'message' => 'Password must be at least 6 characters.'
    ]);

    exit;
}

$allowedRoles = ['student', 'instructor', 'admin'];

if (!in_array($role, $allowedRoles, true)) {

    echo json_encode([
        'success' => false,
        'message' => 'Invalid role.'
    ]);

    exit;
}


try {

    /*
    |--------------------------------------------------------------------------
    | Check Email Not Already Used
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT id
        FROM users
        WHERE email = :email
        LIMIT 1
    ");

    $stmt->execute([
        ':email' => $email
    ]);

    if ($stmt->fetch()) {

        echo json_encode([
            'success' => false,
            'message' => 'An account with this email already exists.'
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Create User
    |--------------------------------------------------------------------------
    */

    $userId = 'u-' . uniqid();

    $stmt = $pdo->prepare("
        INSERT INTO users
        (
            id,
            name,
            email,
            password,
            role
        )
        VALUES
        (
            :id,
            :name,
            :email,
            :password,
            :role
        )
    ");

    $stmt->execute([
        ':id' => $userId,
        ':name' => $name,
        ':email' => $email,
        ':password' => $password,
        ':role' => $role
    ]);


    /*
    |--------------------------------------------------------------------------
    | Success
    |--------------------------------------------------------------------------
    */

    echo json_encode([
        'success' => true,
        'message' => 'Account created successfully.'
    ]);

    exit;


} catch (PDOException $e) {

    echo json_encode([
        'success' => false,
        'message' => 'Database error.'
    ]);

    exit;
}

?>
