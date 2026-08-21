<?php

session_start();

header('Content-Type: application/json');


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
| Make sure required session data exists
|--------------------------------------------------------------------------
*/

if (
    !isset($_SESSION['name']) ||
    !isset($_SESSION['email']) ||
    !isset($_SESSION['role'])
) {

    echo json_encode([
        'success' => false,
        'message' => 'Invalid session data.'
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Return Logged-in User
|--------------------------------------------------------------------------
*/

echo json_encode([

    'success' => true,

    'user' => [

        'id' => $_SESSION['user_id'],

        'name' => $_SESSION['name'],

        'email' => $_SESSION['email'],

        'role' => $_SESSION['role']

    ]

]);

exit;

?>