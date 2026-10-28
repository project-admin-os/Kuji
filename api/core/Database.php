<?php

class Database
{
    private static ?PDO $pdo = null;

    public static function connect(array $db): PDO
    {
        if (self::$pdo === null) {
            if (empty($db['dsn'])) {
                throw new RuntimeException('DB_DSN is not set (see api/.env.example)');
            }
            self::$pdo = new PDO($db['dsn'], $db['user'] ?? null, $db['password'] ?? null, ($db['options'] ?? []) + [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_TIMEOUT            => 5,
            ]);
        }
        return self::$pdo;
    }

    /**
     * Creates a feature's table. Called ONLY by database/migrate.php, never during a web request.
     * The CREATE statements are idempotent, so running it twice is harmless.
     */
    public static function createTable(PDO $pdo, array $feature): void
    {
        $table  = $feature['table'];
        $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
        $sql    = $feature['schema'][$driver] ?? null;
        if ($sql === null) {
            throw new RuntimeException("No schema for driver '$driver' (table $table)");
        }
        $pdo->exec(str_replace('{table}', $table, $sql));
    }
}
