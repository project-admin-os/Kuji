<?php

/**
 * Strict CORS:
 *  - Same-origin requests (production: site and /api on one domain) need nothing.
 *  - Other origins must be listed in CORS_ORIGINS. No wildcard "*".
 *  - Browser requests from any other origin are rejected with 403.
 *  - Requests with no Origin header (curl, server-to-server) pass through.
 */
class Cors
{
    public static function handle(): void
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

        if ($origin === '') {
            if ($method === 'OPTIONS') {
                http_response_code(204);
                exit;
            }
            return;
        }

        header('Vary: Origin');

        if (self::isSameOrigin($origin)) {
            if ($method === 'OPTIONS') {
                http_response_code(204);
                exit;
            }
            return;
        }

        $allowed = (require __DIR__ . '/../config.php')['cors']['origins'];
        if (!in_array($origin, $allowed, true)) {
            Http::fail(403, 'Origin not allowed');
        }

        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Credentials: true'); // admin cookie; safe: origin is on the allow-list

        if ($method === 'OPTIONS') {
            header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type');
            header('Access-Control-Max-Age: 600');
            http_response_code(204);
            exit;
        }
    }

    private static function isSameOrigin(string $origin): bool
    {
        $host = parse_url($origin, PHP_URL_HOST);
        $port = parse_url($origin, PHP_URL_PORT);
        if (!$host) {
            return false;
        }
        $originHost = $port ? "$host:$port" : $host;
        return strcasecmp($originHost, $_SERVER['HTTP_HOST'] ?? '') === 0;
    }
}
