<?php

$data = [
    'email' => 'tithi@eduportal.com',
    'password' => 'pass123'
];

$options = [
    'http' => [
        'method'  => 'POST',
        'header'  => 'Content-Type: application/x-www-form-urlencoded',
        'content' => http_build_query($data)
    ]
];

$context = stream_context_create($options);

$response = file_get_contents(
    'http://localhost/eduportal/backend/api/login.php',
    false,
    $context
);

echo $response;

?>