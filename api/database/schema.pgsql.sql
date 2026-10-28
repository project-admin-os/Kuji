-- No terminal? Paste this into the Neon "SQL Editor" and click Run (once).
CREATE TABLE IF NOT EXISTS feedback (
    id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name       VARCHAR(80)   NOT NULL DEFAULT '',
    contact    VARCHAR(120)  NOT NULL DEFAULT '',
    message    VARCHAR(1000) NOT NULL,
    created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_users (
    id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    language      VARCHAR(5)   NOT NULL DEFAULT 'en',
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- The admin user itself is created with:  php api/database/create-admin.php <username>
