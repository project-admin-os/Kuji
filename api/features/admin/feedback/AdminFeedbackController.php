<?php
// GET  /api/admin/feedback?page=1&per_page=20   -> { ok, items, page, per_page, total, total_pages }
// POST /api/admin/feedback/delete               Body: { "ids": [3, 5, 9] }   -> { ok, deleted }

require_once __DIR__ . '/../auth/Auth.php';

class AdminFeedbackController extends Controller
{
    public function index(): void
    {
        Auth::requireAdmin($this->config);

        $limits = $this->config['features']['admin']['feedback']['limits'];
        $table  = $this->config['features']['feedback']['table'];

        $page    = max(1, min(100000, (int) ($_GET['page'] ?? 1)));
        $perPage = (int) ($_GET['per_page'] ?? $limits['default_per_page']);
        $perPage = max(1, min($limits['max_per_page'], $perPage ?: $limits['default_per_page']));
        $offset  = ($page - 1) * $perPage; // both values are validated integers

        $pdo   = $this->db();
        $total = (int) $pdo->query("SELECT COUNT(*) FROM $table")->fetchColumn();
        $rows  = $pdo->query(
            "SELECT id, name, contact, message, created_at FROM $table ORDER BY id DESC LIMIT $perPage OFFSET $offset"
        )->fetchAll();

        foreach ($rows as &$row) {
            $row['id'] = (int) $row['id'];
        }
        unset($row);

        Http::json([
            'ok'          => true,
            'items'       => $rows,
            'page'        => $page,
            'per_page'    => $perPage,
            'total'       => $total,
            'total_pages' => max(1, (int) ceil($total / $perPage)),
        ]);
    }

    public function destroy(): void
    {
        Auth::requireAdmin($this->config);

        $max   = $this->config['features']['admin']['feedback']['limits']['max_delete_batch'];
        $table = $this->config['features']['feedback']['table'];
        $ids   = Http::input()['ids'] ?? null;

        if (!is_array($ids) || $ids === [] || count($ids) > $max) {
            Http::fail(422, 'Invalid input');
        }

        $clean = [];
        foreach ($ids as $id) {
            if (!is_int($id) || $id < 1) {
                Http::fail(422, 'Invalid input');
            }
            $clean[$id] = $id;
        }
        $clean = array_values($clean);

        $marks = implode(',', array_fill(0, count($clean), '?'));
        $stmt  = $this->db()->prepare("DELETE FROM $table WHERE id IN ($marks)");
        foreach ($clean as $i => $id) {
            $stmt->bindValue($i + 1, $id, PDO::PARAM_INT);
        }
        $stmt->execute();

        Http::json(['ok' => true, 'deleted' => $stmt->rowCount()]);
    }
}
