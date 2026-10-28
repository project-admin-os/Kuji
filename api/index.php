<?php

define('API_ENTRY', true);

require __DIR__ . '/core/Env.php';
require __DIR__ . '/core/Http.php';
require __DIR__ . '/core/Cors.php';
require __DIR__ . '/core/RateLimit.php';
require __DIR__ . '/core/Database.php';
require __DIR__ . '/core/Controller.php';

Env::load(__DIR__ . '/.env');

Http::securityHeaders();
Cors::handle();   // answers preflight (OPTIONS) and rejects unknown browser origins

Controller::dispatch(require __DIR__ . '/config.php');
