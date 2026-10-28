<?php

require_once __DIR__ . '/../auth/Auth.php';
require_once __DIR__ . '/MenuValidator.php';
require_once __DIR__ . '/../../menu/MenuStore.php';

class AdminMenuController extends Controller
{
    public function index(): void
    {
        Auth::requireAdmin($this->config);
        $menu = MenuStore::read();
        if ($menu === null) {
            Http::fail(404, 'Menu has not been published', 'menu_not_published');
        }
        Http::json(['ok' => true, 'menu' => $menu]);
    }

    public function save(): void
    {
        Auth::requireAdmin($this->config);
        $limits = $this->config['features']['admin']['menu']['limits'];
        RateLimit::check('admin_menu_save', $limits['max_saves'], $limits['save_window_seconds']);

        $input = Http::input();
        $revision = $input['revision'] ?? null;
        if (!is_int($revision) || $revision < 0) {
            Http::fail(422, 'Invalid menu revision', 'invalid_menu');
        }

        $result = MenuValidator::validate($input['menu'] ?? null);
        if ($result['errors'] !== []) {
            Http::json([
                'ok' => false,
                'error' => 'Menu validation failed',
                'code' => 'invalid_menu',
                'errors' => $result['errors'],
            ], 422);
        }

        $saved = MenuStore::save($result['menu'], $revision);
        if ($saved['status'] === 'conflict') {
            Http::json([
                'ok' => false,
                'error' => 'The menu was changed by another editor',
                'code' => 'menu_conflict',
                'revision' => $saved['revision'],
            ], 409);
        }

        Http::json(['ok' => true, 'menu' => $saved['menu']]);
    }
}
