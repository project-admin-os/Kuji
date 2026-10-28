<?php
// Public endpoint: POST /api/feedback
// Body: { "message": "...", "name": "...", "contact": "...", "website": "" }

class FeedbackController extends Controller
{
    public function submit(): void
    {
        $feature = $this->config['features']['feedback'];
        $limits  = $feature['limits'];
        $rate    = $this->config['rate_limit'];

        RateLimit::check('feedback', $rate['max'], $rate['window']);

        $input = Http::input();

        // Hidden "website" field: people never fill it, bots do. Pretend success and drop it.
        if (Http::text($input, 'website') !== '') {
            Http::json(['ok' => true]);
        }

        $message = Http::text($input, 'message');
        $name    = Http::text($input, 'name');
        $contact = Http::text($input, 'contact');

        if (
            mb_strlen($message) < $limits['min_message'] ||
            mb_strlen($message) > $limits['max_message'] ||
            mb_strlen($name)    > $limits['max_name'] ||
            mb_strlen($contact) > $limits['max_contact']
        ) {
            Http::fail(422, 'Invalid input');
        }

        // The table is created once by database/migrate.php, not here.
        $sql = "INSERT INTO {$feature['table']} (name, contact, message) VALUES (?, ?, ?)";
        $this->db()->prepare($sql)->execute([$name, $contact, $message]);

        Http::json(['ok' => true], 201);
    }
}
