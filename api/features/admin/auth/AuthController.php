<?php
// POST /api/admin/login   Body: { "username": "...", "password": "..." }   -> { ok, user }
// POST /api/admin/logout                                                  -> { ok }
// GET  /api/admin/me                                                      -> { ok, user } or 401

require_once __DIR__ . '/Auth.php';

class AuthController extends Controller
{
    public function login(): void
    {
        $auth  = $this->config['features']['admin']['auth'];
        $limit = $auth['login_limit'];

        Auth::csrfGuard();

        // Only FAILED attempts are counted, so the real admin is never locked out by their own successes.
        $wait = RateLimit::blocked('admin_login', $limit['max'], $limit['window']);
        if ($wait > 0) {
            header('Retry-After: ' . $wait);
            Http::fail(429, 'Too many attempts');
        }

        $input    = Http::input();
        $username = strtolower(Http::text($input, 'username'));
        $password = is_string($input['password'] ?? null) ? $input['password'] : ''; // never trim passwords

        $user = null;
        if ($username !== '' && strlen($username) <= 50 && $password !== '' && strlen($password) <= 200) {
            $stmt = $this->db()->prepare("SELECT id, username, language, password_hash FROM {$auth['table']} WHERE username = ?");
            $stmt->execute([$username]);
            $user = $stmt->fetch() ?: null;
        }

        if ($user === null) {
            // Spend the same time as a real check so response time does not reveal which usernames exist.
            password_hash(bin2hex(random_bytes(8)), PASSWORD_DEFAULT);
            $ok = false;
        } else {
            $ok = password_verify($password, $user['password_hash']);
        }

        if (!$ok) {
            RateLimit::record('admin_login', $limit['window']);
            Http::fail(401, 'Invalid credentials');
        }

        if (password_needs_rehash($user['password_hash'], PASSWORD_DEFAULT)) {
            $user['password_hash'] = password_hash($password, PASSWORD_DEFAULT);
            $this->db()->prepare("UPDATE {$auth['table']} SET password_hash = ? WHERE id = ?")
                ->execute([$user['password_hash'], $user['id']]);
        }

        RateLimit::reset('admin_login');
        Auth::start($this->config);
        Auth::login($user);

        Http::json(['ok' => true, 'user' => ['username' => $user['username'], 'language' => $user['language']]]);
    }

    public function logout(): void
    {
        Auth::csrfGuard();
        Auth::start($this->config);
        Auth::destroy();
        Http::json(['ok' => true]);
    }

    public function me(): void
    {
        $user = Auth::requireAdmin($this->config);
        Http::json(['ok' => true, 'user' => ['username' => $user['username'], 'language' => $user['language']]]);
    }
}
