<?php
/**
 * Admin login. Everything under /api/admin/* (except login) requires a valid session.
 *
 * - session     : cookie name and lifetimes in seconds (idle = no activity, absolute = since login)
 * - login_limit : max FAILED logins per IP inside the window (seconds)
 * - schema      : created once by database/migrate.php
 */

return [

    'table' => 'admin_users',

    'session' => [
        'name'     => 'kuji_sid',
        'idle'     => 2 * 60 * 60,
        'absolute' => 12 * 60 * 60,
    ],

    'login_limit' => ['max' => 5, 'window' => 15 * 60],

    'routes' => [
        'POST /admin/login'  => ['features/admin/auth/AuthController.php', 'AuthController', 'login'],
        'POST /admin/logout' => ['features/admin/auth/AuthController.php', 'AuthController', 'logout'],
        'GET /admin/me'      => ['features/admin/auth/AuthController.php', 'AuthController', 'me'],
    ],

    'schema' => [
        'pgsql' => "CREATE TABLE IF NOT EXISTS {table} (
            id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            username      VARCHAR(50)  NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            language      VARCHAR(5)   NOT NULL DEFAULT 'en',
            created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
        )",
        'mysql' => "CREATE TABLE IF NOT EXISTS {table} (
            id            INT AUTO_INCREMENT PRIMARY KEY,
            username      VARCHAR(50)  NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            language      VARCHAR(5)   NOT NULL DEFAULT 'en',
            created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) DEFAULT CHARSET=utf8mb4",
        'sqlite' => "CREATE TABLE IF NOT EXISTS {table} (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            username      TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            language      TEXT NOT NULL DEFAULT 'en',
            created_at    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )",
    ],
];
