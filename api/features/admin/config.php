<?php
/**
 * Admin feature = auth/ (login, session) + feedback/ (list and delete reviews) + settings/ (language, username, password).
 * /api/config.php picks this file up automatically; the sub-folder configs are merged here.
 * Add the next admin section (menu) the same way: a folder + one line below.
 */

$auth     = require __DIR__ . '/auth/config.php';
$feedback = require __DIR__ . '/feedback/config.php';
$settings = require __DIR__ . '/settings/config.php';
$menu = require __DIR__ . '/menu/config.php';

return [
    'auth'     => $auth,
    'feedback' => $feedback,
    'settings' => $settings,
    'menu'     => $menu,

    'routes' => array_merge($auth['routes'], $feedback['routes'], $settings['routes'], $menu['routes']),

    // tables created by database/migrate.php
    'migrations' => [
        ['table' => $auth['table'], 'schema' => $auth['schema']],
    ],
];
