<?php

/**
 * Session handling and the guard used by every protected admin endpoint:
 *     $admin = Auth::requireAdmin($this->config);
 *
 * Why it is safe:
 *  - cookie is HttpOnly + SameSite=Strict (+ Secure on HTTPS); session id is regenerated on login
 *  - sessions live in a private temp folder, not in the web root
 *  - the session stores a stamp of the password hash, so changing the password
 *    (or resetting it with create-admin.php) logs every other session out
 *  - idle and absolute timeouts are enforced on the server
 */
class Auth
{
    public static function start(array $config): void
    {
        if (session_status() === PHP_SESSION_ACTIVE) {
            return;
        }
        $opt = $config['features']['admin']['auth']['session'];

        $dir = sys_get_temp_dir() . '/api_sessions';
        if (!is_dir($dir)) {
            @mkdir($dir, 0700, true);
        }
        if (is_dir($dir) && is_writable($dir)) {
            session_save_path($dir);
        }

        ini_set('session.use_strict_mode', '1');
        ini_set('session.use_only_cookies', '1');
        ini_set('session.use_trans_sid', '0');
        ini_set('session.gc_maxlifetime', (string) $opt['absolute']);

        session_name($opt['name']);
        session_set_cookie_params([
            'lifetime' => 0,
            'path'     => '/',
            'secure'   => self::isHttps(),
            'httponly' => true,
            'samesite' => 'Strict',
        ]);
        session_start();
    }

    /** Returns the logged-in admin row (without the hash), or null. */
    public static function user(array $config): ?array
    {
        self::start($config);

        $uid = $_SESSION['uid'] ?? null;
        if (!is_int($uid)) {
            return null;
        }

        $opt = $config['features']['admin']['auth']['session'];
        $now = time();
        if (
            $now - (int) ($_SESSION['at'] ?? 0)   > $opt['absolute'] ||
            $now - (int) ($_SESSION['seen'] ?? 0) > $opt['idle']
        ) {
            self::destroy();
            return null;
        }

        $table = $config['features']['admin']['auth']['table'];
        $stmt  = Database::connect($config['db'])->prepare("SELECT id, username, language, password_hash FROM $table WHERE id = ?");
        $stmt->execute([$uid]);
        $row = $stmt->fetch();

        if (!$row || !hash_equals((string) ($_SESSION['stamp'] ?? ''), self::stamp($row['password_hash']))) {
            self::destroy();
            return null;
        }

        $_SESSION['seen'] = $now;
        unset($row['password_hash']);
        $row['id'] = (int) $row['id'];
        return $row;
    }

    /** Use at the top of every protected endpoint. */
    public static function requireAdmin(array $config): array
    {
        self::csrfGuard();
        $user = self::user($config);
        if ($user === null) {
            Http::fail(401, 'Unauthorized');
        }
        return $user;
    }

    public static function login(array $user): void
    {
        session_regenerate_id(true);
        $_SESSION = [
            'uid'   => (int) $user['id'],
            'stamp' => self::stamp($user['password_hash']),
            'at'    => time(),
            'seen'  => time(),
        ];
    }

    public static function destroy(): void
    {
        if (session_status() === PHP_SESSION_ACTIVE) {
            $_SESSION = [];
            setcookie(session_name(), '', [
                'expires'  => time() - 3600,
                'path'     => '/',
                'secure'   => self::isHttps(),
                'httponly' => true,
                'samesite' => 'Strict',
            ]);
            session_destroy();
        }
    }

    /**
     * Extra CSRF layer for anything that changes data. The real defences are SameSite=Strict,
     * the JSON-only content type and the Origin check in Cors; this also rejects browsers that
     * say the request came from another site but sent no Origin header.
     */
    public static function csrfGuard(): void
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        if (in_array($method, ['GET', 'HEAD', 'OPTIONS'], true)) {
            return;
        }
        if (($_SERVER['HTTP_ORIGIN'] ?? '') !== '') {
            return; // already validated by Cors::handle()
        }
        $site = $_SERVER['HTTP_SEC_FETCH_SITE'] ?? '';
        if ($site !== '' && $site !== 'same-origin' && $site !== 'none') {
            Http::fail(403, 'Forbidden');
        }
    }

    private static function stamp(string $passwordHash): string
    {
        return hash('sha256', $passwordHash);
    }

    private static function isHttps(): bool
    {
        if (!empty($_SERVER['HTTPS']) && strtolower((string) $_SERVER['HTTPS']) !== 'off') {
            return true;
        }
        return Env::get('TRUST_PROXY') === '1'
            && strtolower($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
    }
}
