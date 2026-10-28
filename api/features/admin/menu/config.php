<?php

return [
    'limits' => [
        'max_saves' => 20,
        'save_window_seconds' => 600,
    ],
    'routes' => [
        'GET /admin/menu' => ['features/admin/menu/AdminMenuController.php', 'AdminMenuController', 'index'],
        'POST /admin/menu/save' => ['features/admin/menu/AdminMenuController.php', 'AdminMenuController', 'save'],
    ],
];
