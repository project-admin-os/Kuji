<?php

require_once __DIR__ . '/MenuStore.php';

class MenuController extends Controller
{
    public function show(): void
    {
        $menu = MenuStore::read();
        if ($menu === null) {
            Http::fail(404, 'Menu has not been published', 'menu_not_published');
        }

        $etag = '"' . hash('sha256', json_encode($menu, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)) . '"';
        header('ETag: ' . $etag);
        header('Cache-Control: no-cache, max-age=0, must-revalidate');
        if (trim($_SERVER['HTTP_IF_NONE_MATCH'] ?? '') === $etag) {
            http_response_code(304);
            exit;
        }

        Http::json(['ok' => true, 'menu' => $menu], 200, [
            'Cache-Control' => 'no-cache, max-age=0, must-revalidate',
            'ETag' => $etag,
        ]);
    }
}
