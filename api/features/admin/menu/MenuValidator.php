<?php

final class MenuValidator
{
    private const MAX_ERRORS = 50;
    private const MAX_CATEGORIES = 50;
    private const MAX_ADDONS = 50;
    private const MAX_PRODUCTS = 200;
    private const MAX_SIGNATURES = 12;
    private const MAX_PAIRINGS = 100;
    private const MAX_PRICE = 99999999;

    private array $errors = [];

    public static function validate($value): array
    {
        $validator = new self();
        $menu = $validator->normalize($value);
        $validator->validateReferences($menu);
        return ['menu' => $menu, 'errors' => $validator->errors];
    }

    private function normalize($value): array
    {
        if (!is_array($value) || self::isList($value)) {
            $this->error('menu', 'object');
            $value = [];
        }
        if (($value['schemaVersion'] ?? null) !== 1) {
            $this->error('schemaVersion', 'unsupported');
        }

        $revision = $this->integer($value['revision'] ?? null, 'revision', 0, 2147483647);
        $updatedAt = $this->text($value['updatedAt'] ?? null, 'updatedAt', 64);

        $categories = [];
        $categoryRows = $this->rows($value['categories'] ?? null, 'categories', self::MAX_CATEGORIES);
        foreach ($categoryRows as $index => $row) {
            $path = "categories.$index";
            if (!is_array($row) || self::isList($row)) {
                $this->error($path, 'object');
                continue;
            }
            $categories[] = [
                'id' => $this->id($row['id'] ?? null, "$path.id"),
                'kind' => $this->choice($row['kind'] ?? null, "$path.kind", ['drink', 'food']),
                'pill' => $this->localized($row['pill'] ?? null, "$path.pill", 24),
                'title' => $this->localized($row['title'] ?? null, "$path.title", 60, true),
                'subtitle' => $this->localized($row['subtitle'] ?? null, "$path.subtitle", 120),
                'image' => $this->safeUrl($row['image'] ?? null, "$path.image", 2048),
                'sortOrder' => $this->integer($row['sortOrder'] ?? null, "$path.sortOrder", 0, 10000),
            ];
        }
        $this->uniqueIds($categories, 'categories');

        $addOns = [];
        $addOnRows = $this->rows($value['addOns'] ?? null, 'addOns', self::MAX_ADDONS);
        foreach ($addOnRows as $index => $row) {
            $path = "addOns.$index";
            if (!is_array($row) || self::isList($row)) {
                $this->error($path, 'object');
                continue;
            }
            $addOns[] = [
                'id' => $this->id($row['id'] ?? null, "$path.id"),
                'name' => $this->localized($row['name'] ?? null, "$path.name", 60, true),
                'price' => $this->integer($row['price'] ?? null, "$path.price", 0, self::MAX_PRICE),
                'appliesTo' => $this->choice($row['appliesTo'] ?? null, "$path.appliesTo", ['all', 'drink', 'food']),
                'enabled' => $this->boolean($row['enabled'] ?? null, "$path.enabled"),
                'sortOrder' => $this->integer($row['sortOrder'] ?? null, "$path.sortOrder", 0, 10000),
            ];
        }
        $this->uniqueIds($addOns, 'addOns');

        $products = [];
        $productRows = $this->rows($value['products'] ?? null, 'products', self::MAX_PRODUCTS);
        foreach ($productRows as $index => $row) {
            $path = "products.$index";
            if (!is_array($row) || self::isList($row)) {
                $this->error($path, 'object');
                continue;
            }
            if (!array_key_exists('price', $row)) {
                $this->error("$path.price", 'integer_range');
                $price = null;
            } else {
                $price = $row['price'];
                if ($price !== null) {
                    $price = $this->integer($price, "$path.price", 0, self::MAX_PRICE);
                }
            }
            $sizes = [];
            $sizeRows = $this->rows($row['sizes'] ?? null, "$path.sizes", 6);
            foreach ($sizeRows as $sizeIndex => $size) {
                $sizePath = "$path.sizes.$sizeIndex";
                if (!is_array($size) || self::isList($size)) {
                    $this->error($sizePath, 'object');
                    continue;
                }
                $sizes[] = [
                    'id' => $this->id($size['id'] ?? null, "$sizePath.id"),
                    'name' => $this->localized($size['name'] ?? null, "$sizePath.name", 30, true),
                    'mode' => $this->choice($size['mode'] ?? null, "$sizePath.mode", ['delta', 'standalone']),
                    'value' => $this->integer($size['value'] ?? null, "$sizePath.value", 0, self::MAX_PRICE),
                ];
            }
            $this->uniqueIds($sizes, "$path.sizes");

            $products[] = [
                'id' => $this->id($row['id'] ?? null, "$path.id"),
                'categoryId' => $this->id($row['categoryId'] ?? null, "$path.categoryId"),
                'name' => $this->localized($row['name'] ?? null, "$path.name", 60, true),
                'description' => $this->localized($row['description'] ?? null, "$path.description", 400),
                'price' => $price,
                'sizes' => $sizes,
                'image' => $this->safeUrl($row['image'] ?? null, "$path.image", 2048),
                'baristaAddOns' => $this->idList($row['baristaAddOns'] ?? null, "$path.baristaAddOns", 50),
                'excludedAddOns' => $this->idList($row['excludedAddOns'] ?? null, "$path.excludedAddOns", 50),
                'oftenOrderedWith' => $this->idList($row['oftenOrderedWith'] ?? null, "$path.oftenOrderedWith", 6),
                'isNew' => $this->boolean($row['isNew'] ?? null, "$path.isNew"),
                'inStock' => $this->boolean($row['inStock'] ?? null, "$path.inStock"),
                'sortOrder' => $this->integer($row['sortOrder'] ?? null, "$path.sortOrder", 0, 10000),
            ];
        }
        $this->uniqueIds($products, 'products');

        $signatures = $this->idList($value['signatures'] ?? null, 'signatures', self::MAX_SIGNATURES);

        $pairings = [];
        $pairingRows = $this->rows($value['pairings'] ?? null, 'pairings', self::MAX_PAIRINGS);
        foreach ($pairingRows as $index => $row) {
            $path = "pairings.$index";
            if (!is_array($row) || self::isList($row)) {
                $this->error($path, 'object');
                continue;
            }
            $items = $row['items'] ?? null;
            if (!is_array($items) || !self::isList($items) || count($items) !== 2) {
                $this->error("$path.items", 'two_products_required');
                $items = [];
            }
            if (!array_key_exists('price', $row)) {
                $this->error("$path.price", 'integer_range');
                $pairingPrice = null;
            } else {
                $pairingPrice = $row['price'];
                if ($pairingPrice !== null) {
                    $pairingPrice = $this->integer($pairingPrice, "$path.price", 0, self::MAX_PRICE);
                }
            }
            $pairings[] = [
                'id' => $this->id($row['id'] ?? null, "$path.id"),
                'title' => $this->localized($row['title'] ?? null, "$path.title", 60, true),
                'items' => [
                    $this->id($items[0] ?? null, "$path.items.0"),
                    $this->id($items[1] ?? null, "$path.items.1"),
                ],
                'price' => $pairingPrice,
                'enabled' => $this->boolean($row['enabled'] ?? null, "$path.enabled"),
                'sortOrder' => $this->integer($row['sortOrder'] ?? null, "$path.sortOrder", 0, 10000),
            ];
        }
        $this->uniqueIds($pairings, 'pairings');

        $popupRow = $value['popup'] ?? [];
        if (!is_array($popupRow) || self::isList($popupRow)) {
            $this->error('popup', 'object');
            $popupRow = [];
        }
        $popupEnabled = $this->boolean($popupRow['enabled'] ?? null, 'popup.enabled');
        $popup = [
            'enabled' => $popupEnabled,
            'title' => $this->localized($popupRow['title'] ?? null, 'popup.title', 60, $popupEnabled),
            'body' => $this->localized($popupRow['body'] ?? null, 'popup.body', 240, $popupEnabled),
            'image' => $this->safeUrl($popupRow['image'] ?? null, 'popup.image', 2048),
            'ctaLabel' => $this->localized($popupRow['ctaLabel'] ?? null, 'popup.ctaLabel', 30, $popupEnabled),
            'ctaUrl' => $this->safeUrl($popupRow['ctaUrl'] ?? null, 'popup.ctaUrl', 2048),
            'delaySeconds' => $this->integer($popupRow['delaySeconds'] ?? null, 'popup.delaySeconds', 1, 20),
        ];
        if ($popupEnabled && $popup['ctaUrl'] === '') {
            $this->error('popup.ctaUrl', 'required');
        }

        return [
            'schemaVersion' => 1,
            'revision' => $revision,
            'updatedAt' => $updatedAt,
            'categories' => $categories,
            'addOns' => $addOns,
            'products' => $products,
            'signatures' => $signatures,
            'pairings' => $pairings,
            'popup' => $popup,
        ];
    }

    private function validateReferences(array $menu): void
    {
        $categoryIds = array_column($menu['categories'], 'id');
        $addOnIds = array_column($menu['addOns'], 'id');
        $productIds = array_column($menu['products'], 'id');

        foreach ($menu['products'] as $index => $product) {
            if (!in_array($product['categoryId'], $categoryIds, true)) {
                $this->error("products.$index.categoryId", 'unknown_category');
            }
            if (array_intersect($product['baristaAddOns'], $product['excludedAddOns']) !== []) {
                $this->error("products.$index.excludedAddOns", 'conflicting_addon');
            }
            foreach (['baristaAddOns', 'excludedAddOns'] as $field) {
                foreach ($product[$field] as $id) {
                    if (!in_array($id, $addOnIds, true)) {
                        $this->error("products.$index.$field", 'unknown_addon');
                        break;
                    }
                }
            }
            foreach ($product['oftenOrderedWith'] as $id) {
                if ($id === $product['id'] || !in_array($id, $productIds, true)) {
                    $this->error("products.$index.oftenOrderedWith", 'unknown_product');
                    break;
                }
            }
        }
        foreach ($menu['signatures'] as $index => $id) {
            if (!in_array($id, $productIds, true)) {
                $this->error("signatures.$index", 'unknown_product');
            }
        }
        foreach ($menu['pairings'] as $index => $pairing) {
            foreach ($pairing['items'] as $id) {
                if (!in_array($id, $productIds, true)) {
                    $this->error("pairings.$index.items", 'unknown_product');
                    break;
                }
            }
            if ($pairing['items'][0] === $pairing['items'][1]) {
                $this->error("pairings.$index.items", 'distinct_products_required');
            }
        }
    }

    private function rows($value, string $path, int $max): array
    {
        if (!is_array($value) || !self::isList($value)) {
            $this->error($path, 'array');
            return [];
        }
        if (count($value) > $max) {
            $this->error($path, 'too_many');
            return array_slice($value, 0, $max);
        }
        return $value;
    }

    private function localized($value, string $path, int $maxLength, bool $required = false): array
    {
        if (!is_array($value) || self::isList($value)) {
            $this->error($path, 'localized_pair');
            $value = [];
        }
        return [
            'en' => $this->text($value['en'] ?? null, "$path.en", $maxLength, $required),
            'ar' => $this->text($value['ar'] ?? null, "$path.ar", $maxLength, $required),
        ];
    }

    private function text($value, string $path, int $maxLength, bool $required = false): string
    {
        if (!is_string($value)) {
            $this->error($path, 'string');
            return '';
        }
        $value = trim($value);
        if ($required && $value === '') {
            $this->error($path, 'required');
        }
        if (preg_match('/[\x00-\x1F\x7F]/u', $value)) {
            $this->error($path, 'control_character');
        }
        $length = preg_match_all('/./us', $value, $unused);
        if ($length === false) {
            $length = strlen($value);
        }
        if ($length > $maxLength) {
            $this->error($path, 'too_long');
            $value = self::truncate($value, $maxLength);
        }
        return $value;
    }

    private function safeUrl($value, string $path, int $maxLength): string
    {
        $value = $this->text($value, $path, $maxLength);
        if ($value === '') {
            return '';
        }
        if (str_starts_with($value, '/') && !str_starts_with($value, '//')) {
            $decoded = rawurldecode($value);
            if (str_starts_with($decoded, '//') || str_contains($decoded, '\\') || preg_match('#(^|/)\.\.(?:/|$)#', $decoded)) {
                $this->error($path, 'unsafe_url');
                return '';
            }
            return $value;
        }
        $parts = parse_url($value);
        if (
            !is_array($parts) ||
            strtolower($parts['scheme'] ?? '') !== 'https' ||
            empty($parts['host']) ||
            isset($parts['user']) ||
            isset($parts['pass']) ||
            filter_var($value, FILTER_VALIDATE_URL) === false
        ) {
            $this->error($path, 'unsafe_url');
            return '';
        }
        return $value;
    }

    private function integer($value, string $path, int $min, int $max): int
    {
        if (!is_int($value) || $value < $min || $value > $max) {
            $this->error($path, 'integer_range');
            return 0;
        }
        return $value;
    }

    private function boolean($value, string $path): bool
    {
        if (!is_bool($value)) {
            $this->error($path, 'boolean');
            return false;
        }
        return $value;
    }

    private function choice($value, string $path, array $choices): string
    {
        if (!is_string($value) || !in_array($value, $choices, true)) {
            $this->error($path, 'choice');
            return (string) $choices[0];
        }
        return $value;
    }

    private function id($value, string $path): string
    {
        if (!is_string($value) || !preg_match('/^[a-z0-9][a-z0-9-]{0,63}$/', $value)) {
            $this->error($path, 'id');
            return '';
        }
        return $value;
    }

    private function idList($value, string $path, int $max): array
    {
        $rows = $this->rows($value, $path, $max);
        $ids = [];
        foreach ($rows as $index => $row) {
            $ids[] = $this->id($row, "$path.$index");
        }
        if (count(array_unique($ids)) !== count($ids)) {
            $this->error($path, 'duplicate_id');
        }
        return $ids;
    }

    private function uniqueIds(array $rows, string $path): void
    {
        $ids = array_column($rows, 'id');
        if (count(array_unique($ids)) !== count($ids)) {
            $this->error($path, 'duplicate_id');
        }
    }

    private function error(string $path, string $code): void
    {
        if (count($this->errors) < self::MAX_ERRORS) {
            $this->errors[] = ['path' => $path, 'code' => $code];
        }
    }

    private static function isList(array $value): bool
    {
        return $value === [] || array_keys($value) === range(0, count($value) - 1);
    }

    private static function truncate(string $value, int $maxLength): string
    {
        if (function_exists('mb_substr')) {
            return mb_substr($value, 0, $maxLength, 'UTF-8');
        }
        preg_match_all('/./us', $value, $chars);
        return implode('', array_slice($chars[0] ?? [], 0, $maxLength));
    }
}
