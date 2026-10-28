<?php
/**
 * 1. DATABASE   -> values come from api/.env (or real environment variables). No secrets in code.
 * 2. FEATURES   -> each feature keeps its own limits, routes and table in
 *                  features/<name>/config.php. Add a folder, it is picked up here.
 */

$features = [];
foreach (glob(__DIR__ . '/features/*/config.php') ?: [] as $file) {
    $features[basename(dirname($file))] = require $file;
}

return [

    // ==== 1. DATABASE ====
    'db' => [
        'dsn'      => Env::get('DB_DSN'),
        'user'     => Env::get('DB_USER'),
        'password' => Env::get('DB_PASSWORD'),
        // Needed for Neon's pooled (pgbouncer) endpoint.
        'options'  => [PDO::ATTR_EMULATE_PREPARES => true],
    ],

    // ==== 2. CORS / RATE LIMIT ====
    'cors' => [
        'origins' => array_values(array_filter(array_map('trim', explode(',', Env::get('CORS_ORIGINS', ''))))),
    ],
    'rate_limit' => [
        'max'    => (int) Env::get('RATE_LIMIT_MAX', '5'),
        'window' => (int) Env::get('RATE_LIMIT_WINDOW', '600'),
    ],

    // ==== 3. FEATURES (loaded from features/*/config.php) ====
    'features' => $features,

    // ==== 4. ROUTES (collected from every feature) ====
    'routes' => array_merge(...array_map(
        fn(array $feature) => $feature['routes'] ?? [],
        array_values($features) ?: [[]]
    )),
];
