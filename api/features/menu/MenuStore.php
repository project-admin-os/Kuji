<?php

require_once __DIR__ . '/../admin/menu/MenuValidator.php';

final class MenuStore
{
    private const MAX_FILE_BYTES = 262144;

    private static function directory(): string
    {
        return __DIR__ . '/../../storage';
    }

    private static function menuPath(): string
    {
        return self::directory() . '/menu.json';
    }

    private static function backupPath(): string
    {
        return self::directory() . '/menu.json.bak';
    }

    private static function lockPath(): string
    {
        return self::directory() . '/.menu.lock';
    }

    public static function read(): ?array
    {
        self::ensureDirectory();
        $lock = self::acquireLock(LOCK_SH);
        try {
            [$menu] = self::readCurrent();
            return $menu;
        } finally {
            flock($lock, LOCK_UN);
            fclose($lock);
        }
    }

    public static function save(array $menu, int $expectedRevision): array
    {
        self::ensureDirectory();
        $lock = self::acquireLock(LOCK_EX);
        try {
            [$current, $source] = self::readCurrent();
            $currentRevision = $current['revision'] ?? 0;
            if ($currentRevision !== $expectedRevision) {
                return ['status' => 'conflict', 'revision' => $currentRevision];
            }

            $menu['revision'] = $currentRevision + 1;
            $menu['updatedAt'] = gmdate('c');
            $result = MenuValidator::validate($menu);
            if ($result['errors'] !== []) {
                throw new RuntimeException('Validated menu became invalid during save');
            }
            $json = json_encode(
                $result['menu'],
                JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR
            );
            if (strlen($json) > self::MAX_FILE_BYTES) {
                throw new RuntimeException('Menu file exceeds the storage limit');
            }

            if ($source === 'menu') {
                $previous = @file_get_contents(self::menuPath());
                if (!is_string($previous) || $previous === '') {
                    throw new RuntimeException('Unable to read the previous menu for backup');
                }
                self::writeAtomic(self::backupPath(), $previous, '.menu-backup-');
            }

            self::writeAtomic(self::menuPath(), $json . "\n", '.menu-write-');
            return ['status' => 'saved', 'menu' => $result['menu']];
        } finally {
            flock($lock, LOCK_UN);
            fclose($lock);
        }
    }

    private static function readCurrent(): array
    {
        $menuPath = self::menuPath();
        $backupPath = self::backupPath();
        $menuExists = file_exists($menuPath) || is_link($menuPath);
        $backupExists = file_exists($backupPath) || is_link($backupPath);

        if (is_link($menuPath) || is_link($backupPath)) {
            throw new RuntimeException('Menu storage cannot be a symbolic link');
        }

        $menu = self::readValidated($menuPath);
        if ($menu !== null) {
            return [$menu, 'menu'];
        }

        $backup = self::readValidated($backupPath);
        if ($backup !== null) {
            return [$backup, 'backup'];
        }

        if ($menuExists || $backupExists) {
            throw new RuntimeException('Menu storage and its backup are invalid');
        }
        return [null, null];
    }

    private static function readValidated(string $path): ?array
    {
        if (!file_exists($path)) {
            return null;
        }
        if (is_link($path)) {
            throw new RuntimeException('Menu storage cannot be a symbolic link');
        }
        $size = @filesize($path);
        if ($size === false || $size > self::MAX_FILE_BYTES) {
            return null;
        }
        $raw = @file_get_contents($path);
        if (!is_string($raw) || $raw === '') {
            return null;
        }
        try {
            $decoded = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException $error) {
            return null;
        }
        $result = MenuValidator::validate($decoded);
        return $result['errors'] === [] ? $result['menu'] : null;
    }

    private static function ensureDirectory(): void
    {
        $directory = self::directory();
        if (!is_dir($directory) && !@mkdir($directory, 0700, true) && !is_dir($directory)) {
            throw new RuntimeException('Menu storage directory is unavailable');
        }
        if (!is_writable($directory)) {
            throw new RuntimeException('Menu storage directory is not writable');
        }
    }

    /** @return resource */
    private static function acquireLock(int $mode)
    {
        $path = self::lockPath();
        if (is_link($path)) {
            throw new RuntimeException('Menu lock cannot be a symbolic link');
        }
        $handle = @fopen($path, 'c');
        if ($handle === false) {
            throw new RuntimeException('Unable to open menu lock');
        }
        @chmod($path, 0600);
        if (!flock($handle, $mode)) {
            fclose($handle);
            throw new RuntimeException('Unable to lock menu storage');
        }
        return $handle;
    }

    private static function writeAtomic(string $destination, string $contents, string $prefix): void
    {
        $temporary = @tempnam(self::directory(), $prefix);
        if ($temporary === false || dirname($temporary) !== self::directory()) {
            if (is_string($temporary)) {
                @unlink($temporary);
            }
            throw new RuntimeException('Unable to create a menu temporary file');
        }

        try {
            $written = @file_put_contents($temporary, $contents, LOCK_EX);
            if ($written !== strlen($contents)) {
                throw new RuntimeException('Unable to write menu storage');
            }
            @chmod($temporary, 0600);
            if (!@rename($temporary, $destination)) {
                throw new RuntimeException('Unable to atomically replace menu storage');
            }
            @chmod($destination, 0600);
        } finally {
            if (file_exists($temporary)) {
                @unlink($temporary);
            }
        }
    }
}
