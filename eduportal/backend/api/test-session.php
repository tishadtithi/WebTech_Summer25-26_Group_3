<?php

session_start();

$_SESSION['test'] = 'hello';

echo json_encode([
    'session_id' => session_id(),
    'test' => $_SESSION['test']
]);

?>