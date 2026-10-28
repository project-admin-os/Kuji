<?php

abstract class Controller
{
    public function __construct(protected array $config)
    {
    }

    protected function db(): PDO
    {
        return Database::connect($this->config['db']);
    }

    public static function dispatch(array $config): void
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $path   = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
        $path   = preg_replace('#^.*?/api(?=/|$)#', '', $path);
        $path   = '/' . trim($path, '/');

        $route = $config['routes']["$method $path"] ?? null;
        if ($route === null) {
            // Known path, wrong method -> 405 instead of 404.
            foreach (array_keys($config['routes']) as $key) {
                if (str_ends_with($key, " $path")) {
                    header('Allow: ' . substr($key, 0, strpos($key, ' ')));
                    Http::fail(405, 'Method not allowed');
                }
            }
            Http::fail(404, 'Not found');
        }

        [$file, $class, $action] = $route;

        try {
            require_once __DIR__ . '/../' . $file;
            (new $class($config))->$action();
        } catch (Throwable $error) {
            error_log($error->getMessage());
            Http::fail(500, 'Server error');
        }
    }
}
