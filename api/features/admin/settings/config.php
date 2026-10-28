<?php
/**
 * Admin settings: preferred language, username, password.
 * Username and password changes re-ask for the CURRENT password; wrong guesses count toward
 * reauth_limit (per IP) so a stolen session cannot be used to brute-force the password.
 */

return [

    'languages' => ['en', 'ar'],

    'limits' => [
        'username_pattern' => '/^[a-z0-9._-]{3,50}$/',   // same rule as create-admin.php
        'password_min'     => 10,
        'password_max'     => 72,                         // bcrypt only reads 72 bytes
        'current_max'      => 200,
    ],

    'reauth_limit' => ['max' => 5, 'window' => 15 * 60],

    'routes' => [
        'POST /admin/settings/language' => ['features/admin/settings/SettingsController.php', 'SettingsController', 'language'],
        'POST /admin/settings/username' => ['features/admin/settings/SettingsController.php', 'SettingsController', 'username'],
        'POST /admin/settings/password' => ['features/admin/settings/SettingsController.php', 'SettingsController', 'password'],
    ],
];
