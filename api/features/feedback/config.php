<?php
/**
 * Everything the feedback slice needs to know about itself.
 * Loaded automatically by /api/config.php: no need to register it anywhere else.
 *
 * - limits : feedback length limits (keep in sync with src/features/rate/data/config.ts)
 * - routes : 'METHOD /path' => [file inside api/, class name, method name]
 * - schema : the table, created ONCE by database/migrate.php (never during a web request).
 *            One CREATE statement per database driver; {table} is replaced by `table`.
 */

return [

    'table'  => 'feedback',

    'limits' => [
        'min_message' => 3,
        'max_message' => 1000,
        'max_name'    => 80,
        'max_contact' => 120,
    ],

    'routes' => [
        'POST /feedback' => ['features/feedback/FeedbackController.php', 'FeedbackController', 'submit'],
    ],

    'schema' => [
        'pgsql' => "CREATE TABLE IF NOT EXISTS {table} (
            id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            name       VARCHAR(80)   NOT NULL DEFAULT '',
            contact    VARCHAR(120)  NOT NULL DEFAULT '',
            message    VARCHAR(1000) NOT NULL,
            created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
        )",
        'mysql' => "CREATE TABLE IF NOT EXISTS {table} (
            id         INT AUTO_INCREMENT PRIMARY KEY,
            name       VARCHAR(80)   NOT NULL DEFAULT '',
            contact    VARCHAR(120)  NOT NULL DEFAULT '',
            message    VARCHAR(1000) NOT NULL,
            created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) DEFAULT CHARSET=utf8mb4",
        'sqlite' => "CREATE TABLE IF NOT EXISTS {table} (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            name       TEXT NOT NULL DEFAULT '',
            contact    TEXT NOT NULL DEFAULT '',
            message    TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )",
        // NVARCHAR so Arabic works
        'sqlsrv' => "IF OBJECT_ID(N'{table}', N'U') IS NULL
            CREATE TABLE {table} (
                id         INT IDENTITY(1,1) PRIMARY KEY,
                name       NVARCHAR(80)   NOT NULL DEFAULT '',
                contact    NVARCHAR(120)  NOT NULL DEFAULT '',
                message    NVARCHAR(1000) NOT NULL,
                created_at DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME()
            )",
    ],
];
