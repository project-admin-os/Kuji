<?php
/**
 * Admin side of the feedback table (the table itself is defined in features/feedback/config.php).
 * Both routes require a logged-in admin.
 */

return [

    'limits' => [
        'default_per_page' => 20,
        'max_per_page'     => 100,
        'max_delete_batch' => 100,
    ],

    'routes' => [
        'GET /admin/feedback'         => ['features/admin/feedback/AdminFeedbackController.php', 'AdminFeedbackController', 'index'],
        'POST /admin/feedback/delete' => ['features/admin/feedback/AdminFeedbackController.php', 'AdminFeedbackController', 'destroy'],
    ],
];
