<?php
// POST /api/admin/settings/language   { language: "en" | "ar" }                       -> { ok, user }
// POST /api/admin/settings/username   { username, current_password }                  -> { ok, user }
// POST /api/admin/settings/password   { current_password, new_password }              -> { ok }
//
// Failures return { ok:false, error, code }. 401 is reserved for "session expired",
// so a wrong current password is 422 with code "wrong_password".

require_once __DIR__ . '/../auth/Auth.php';

class SettingsController extends Controller
{
    public function language(): void
    {
        $user = Auth::requireAdmin($this->config);
        $cfg  = $this->settings();

        $language = Http::text(Http::input(), 'language');
        if (!in_array($language, $cfg['languages'], true)) {
            Http::fail(422, 'Invalid language', 'invalid_language');
        }

        $this->db()->prepare("UPDATE {$this->table()} SET language = ? WHERE id = ?")->execute([$language, $user['id']]);

        Http::json(['ok' => true, 'user' => ['username' => $user['username'], 'language' => $language]]);
    }

    public function username(): void
    {
        $user = Auth::requireAdmin($this->config);
        $cfg  = $this->settings();

        $this->assertNotLocked();
        $input    = Http::input();
        $username = strtolower(Http::text($input, 'username'));

        if (!preg_match($cfg['limits']['username_pattern'], $username)) {
            Http::fail(422, 'Invalid username', 'invalid_username');
        }
        if ($username === $user['username']) {
            Http::fail(422, 'Username unchanged', 'unchanged');
        }

        $this->confirmCurrentPassword($user['id'], $this->rawString($input, 'current_password'));

        try {
            $this->db()->prepare("UPDATE {$this->table()} SET username = ? WHERE id = ?")->execute([$username, $user['id']]);
        } catch (PDOException $error) {
            // 23505 = Postgres unique violation, 23000 = MySQL/SQLite. Covers the race the UNIQUE column guards.
            if (in_array((string) $error->getCode(), ['23505', '23000'], true)) {
                Http::fail(409, 'Username already taken', 'username_taken');
            }
            throw $error;
        }

        Http::json(['ok' => true, 'user' => ['username' => $username, 'language' => $user['language']]]);
    }

    public function password(): void
    {
        $user = Auth::requireAdmin($this->config);
        $cfg  = $this->settings();

        $this->assertNotLocked();
        $input    = Http::input();
        $current  = $this->rawString($input, 'current_password');
        $new      = $this->rawString($input, 'new_password');
        $limits   = $cfg['limits'];

        if (strlen($new) < $limits['password_min'] || strlen($new) > $limits['password_max'] || strtolower($new) === $user['username']) {
            Http::fail(422, 'Password does not meet the rules', 'weak_password');
        }
        if ($new === $current) {
            Http::fail(422, 'New password must be different', 'same_password');
        }

        $this->confirmCurrentPassword($user['id'], $current);

        $hash = password_hash($new, PASSWORD_DEFAULT);
        $this->db()->prepare("UPDATE {$this->table()} SET password_hash = ? WHERE id = ?")->execute([$hash, $user['id']]);

        // The session stamp is derived from the hash, so every OTHER session is now logged out.
        // Re-issue this one so the admin who just changed the password stays signed in.
        Auth::login(['id' => $user['id'], 'password_hash' => $hash]);

        Http::json(['ok' => true]);
    }

    // ---- helpers ----

    private function settings(): array
    {
        return $this->config['features']['admin']['settings'];
    }

    private function table(): string
    {
        return $this->config['features']['admin']['auth']['table'];
    }

    /** Passwords are never trimmed. */
    private function rawString(array $input, string $key): string
    {
        return is_string($input[$key] ?? null) ? $input[$key] : '';
    }

    private function assertNotLocked(): void
    {
        $limit = $this->settings()['reauth_limit'];
        $wait  = RateLimit::blocked('admin_reauth', $limit['max'], $limit['window']);
        if ($wait > 0) {
            header('Retry-After: ' . $wait);
            Http::fail(429, 'Too many attempts', 'too_many_attempts');
        }
    }

    private function confirmCurrentPassword(int $userId, string $password): void
    {
        $cfg   = $this->settings();
        $limit = $cfg['reauth_limit'];

        $stmt = $this->db()->prepare("SELECT password_hash FROM {$this->table()} WHERE id = ?");
        $stmt->execute([$userId]);
        $hash = $stmt->fetchColumn();

        $ok = $hash !== false
            && $password !== ''
            && strlen($password) <= $cfg['limits']['current_max']
            && password_verify($password, (string) $hash);

        if (!$ok) {
            RateLimit::record('admin_reauth', $limit['window']);
            Http::fail(422, 'Wrong current password', 'wrong_password');
        }
        RateLimit::reset('admin_reauth');
    }
}
