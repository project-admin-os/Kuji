<?php

class Http
{
    private const MAX_BODY = 16384; // 16 KB is far more than a feedback form needs

    public static function securityHeaders(): void
    {
        header('X-Content-Type-Options: nosniff');
        header('Referrer-Policy: no-referrer');
        header('X-Frame-Options: DENY');
    }

    public static function json(array $data, int $status = 200): never
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    /** $code is an optional machine-readable reason the frontend can switch on. */
    public static function fail(int $status, string $message, ?string $code = null): never
    {
        $body = ['ok' => false, 'error' => $message];
        if ($code !== null) {
            $body['code'] = $code;
        }
        self::json($body, $status);
    }

    public static function input(): array
    {
        $type = strtolower($_SERVER['CONTENT_TYPE'] ?? '');
        if (!str_starts_with($type, 'application/json')) {
            self::fail(415, 'Content-Type must be application/json');
        }
        if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > self::MAX_BODY) {
            self::fail(413, 'Payload too large');
        }
        $raw = file_get_contents('php://input', false, null, 0, self::MAX_BODY + 1) ?: '';
        if (strlen($raw) > self::MAX_BODY) {
            self::fail(413, 'Payload too large');
        }
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }

    public static function text(array $input, string $key): string
    {
        return is_string($input[$key] ?? null) ? trim($input[$key]) : '';
    }
}
