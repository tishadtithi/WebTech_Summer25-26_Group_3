<?php

session_start();

echo json_encode([
    'session_id' => session_id(),
    'test' => $_SESSION['test'] ?? 'NO SESSION'
]);

?>