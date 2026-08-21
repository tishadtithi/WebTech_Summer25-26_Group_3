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

$userId = $_SESSION['user_id'];

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');


/*
|--------------------------------------------------------------------------
| Validate Input
|--------------------------------------------------------------------------
*/

if (strlen($name) < 2) {

    echo json_encode([
        'success' => false,
        'message' => 'Please enter your full name.'
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


try {

    /*
    |--------------------------------------------------------------------------
    | Make Sure Email Isn't Already Used By Someone Else
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT id
        FROM users
        WHERE email = :email
        AND id != :user_id
        LIMIT 1
    ");

    $stmt->execute([
        ':email' => $email,
        ':user_id' => $userId
    ]);

    if ($stmt->fetch()) {

        echo json_encode([
            'success' => false,
            'message' => 'This email is already in use.'
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Update User
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        UPDATE users
        SET name = :name, email = :email
        WHERE id = :user_id
    ");

    $stmt->execute([
        ':name' => $name,
        ':email' => $email,
        ':user_id' => $userId
    ]);

    // Keep the PHP session in sync with the new values
    $_SESSION['name'] = $name;
    $_SESSION['email'] = $email;

    echo json_encode([
        'success' => true,
        'message' => 'Profile updated.',
        'user' => [
            'id' => $userId,
            'name' => $name,
            'email' => $email,
            'role' => $_SESSION['role']
        ]
    ]);

} catch (PDOException $e) {

    echo json_encode([
        'success' => false,
        'message' => 'Database error.'
    ]);
}

?>
