<?php
/**
 * One-time setup: creates every feature's table(s).
 * Run from a terminal:   php api/database/migrate.php
 * Not reachable from the web (CLI only, and blocked by .htaccess).
 *
 * A feature either has 'table' + 'schema' (one table) or 'migrations' => [ ['table'=>..,'schema'=>..], ... ].
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require __DIR__ . '/../core/Env.php';
require __DIR__ . '/../core/Database.php';

Env::load(__DIR__ . '/../.env');
$config = require __DIR__ . '/../config.php';
$pdo    = Database::connect($config['db']);

foreach ($config['features'] as $name => $feature) {
    $jobs = $feature['migrations'] ?? (isset($feature['table'], $feature['schema']) ? [$feature] : []);
    foreach ($jobs as $job) {
        Database::createTable($pdo, $job);
        echo "OK  table '{$job['table']}' ready (feature: $name)\n";
    }
}
