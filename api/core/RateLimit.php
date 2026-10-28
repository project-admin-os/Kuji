<?php

/**
 * Small per-IP limiter stored in temp files (no extra table, no extra service).
 *
 *  check()   -> count this request, reject with 429 when over the limit (public form).
 *  blocked() / record() / reset() -> count only FAILURES (admin login).
 */
class RateLimit
{
    public static function check(string $bucket, int $max, int $windowSeconds): void
    {
        if ($max <= 0) {
            return;
        }
        $fh = self::open($bucket);
        if ($fh === null) {
            return; // never block real users because the temp dir is unavailable
        }

        flock($fh, LOCK_EX);
        $hits = self::read($fh, $windowSeconds);

        if (count($hits) >= $max) {
            $retry = self::retryAfter($hits, $windowSeconds);
            flock($fh, LOCK_UN);
            fclose($fh);
            header('Retry-After: ' . $retry);
            Http::fail(429, 'Too many requests');
        }

        $hits[] = time();
        self::write($fh, $hits);
        flock($fh, LOCK_UN);
        fclose($fh);
    }

    /** Seconds the caller must wait, or 0 when allowed. Does not count a hit. */
    public static function blocked(string $bucket, int $max, int $windowSeconds): int
    {
        $fh = self::open($bucket);
        if ($fh === null) {
            return 0;
        }
        flock($fh, LOCK_SH);
        $hits = self::read($fh, $windowSeconds);
        flock($fh, LOCK_UN);
        fclose($fh);

        return count($hits) >= $max ? self::retryAfter($hits, $windowSeconds) : 0;
    }

    public static function record(string $bucket, int $windowSeconds): void
    {
        $fh = self::open($bucket);
        if ($fh === null) {
            return;
        }
        flock($fh, LOCK_EX);
        $hits   = self::read($fh, $windowSeconds);
        $hits[] = time();
        self::write($fh, $hits);
        flock($fh, LOCK_UN);
        fclose($fh);
    }

    public static function reset(string $bucket): void
    {
        @unlink(self::file($bucket));
    }

    private static function file(string $bucket): string
    {
        return sys_get_temp_dir() . '/api_ratelimit/' . hash('sha256', $bucket . '|' . self::clientIp()) . '.json';
    }

    /** @return resource|null */
    private static function open(string $bucket)
    {
        $dir = sys_get_temp_dir() . '/api_ratelimit';
        if (!is_dir($dir)) {
            @mkdir($dir, 0700, true);
        }
        $fh = @fopen(self::file($bucket), 'c+');
        return $fh === false ? null : $fh;
    }

    private static function read($fh, int $windowSeconds): array
    {
        $now  = time();
        $hits = json_decode(stream_get_contents($fh) ?: '[]', true);
        return array_values(array_filter(
            is_array($hits) ? $hits : [],
            fn($t) => is_int($t) && $t > $now - $windowSeconds
        ));
    }

    private static function write($fh, array $hits): void
    {
        ftruncate($fh, 0);
        rewind($fh);
        fwrite($fh, json_encode($hits));
    }

    private static function retryAfter(array $hits, int $windowSeconds): int
    {
        return max(1, $windowSeconds - (time() - min($hits)));
    }

    private static function clientIp(): string
    {
        if (Env::get('TRUST_PROXY') === '1' && !empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $first = trim(explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0]);
            if (filter_var($first, FILTER_VALIDATE_IP)) {
                return $first;
            }
        }
        return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    }
}
