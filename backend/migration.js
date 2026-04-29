const runMigrations = async (pool) => {
  console.log("⏳ Running migrations…");

  const migrations = [
    // ── Create tables ──────────────────────────────────────────────────────────
    {
      name: "create_users",
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          device_id           VARCHAR(120) PRIMARY KEY,
          name                VARCHAR(100) NOT NULL,
          quit_date           TIMESTAMP,
          cigarettes_per_day  INTEGER CHECK (cigarettes_per_day > 0 AND cigarettes_per_day <= 1000),
          price_per_pack      DECIMAL(10, 2) CHECK (price_per_pack > 0 AND price_per_pack <= 10000),
          is_admin            BOOLEAN DEFAULT FALSE,
          created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `,
    },
    {
      name: "create_user_progress",
      sql: `
        CREATE TABLE IF NOT EXISTS user_progress (
          id                  SERIAL PRIMARY KEY,
          device_id           VARCHAR(120) REFERENCES users(device_id) ON DELETE CASCADE,
          days_smoke_free     INTEGER DEFAULT 0 CHECK (days_smoke_free >= 0),
          cigarettes_avoided  INTEGER DEFAULT 0 CHECK (cigarettes_avoided >= 0),
          money_saved         DECIMAL(10, 2) DEFAULT 0 CHECK (money_saved >= 0),
          last_updated        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(device_id)
        );
      `,
    },
    {
      name: "create_app_opens",
      sql: `
        CREATE TABLE IF NOT EXISTS app_opens (
          id          SERIAL PRIMARY KEY,
          device_id   VARCHAR(120) REFERENCES users(device_id) ON DELETE CASCADE,
          opened_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          is_online   BOOLEAN DEFAULT TRUE
        );
      `,
    },
    {
      name: "create_daily_logs",
      sql: `
        CREATE TABLE IF NOT EXISTS daily_logs (
          id            SERIAL PRIMARY KEY,
          device_id     VARCHAR(120) REFERENCES users(device_id) ON DELETE CASCADE,
          date          DATE NOT NULL,
          smoked        BOOLEAN NOT NULL,
          smoked_count  INTEGER DEFAULT 0 CHECK (smoked_count >= 0 AND smoked_count <= 1000),
          created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(device_id, date)
        );
      `,
    },
    {
      name: "create_community_messages",
      sql: `
        CREATE TABLE IF NOT EXISTS community_messages (
          id          SERIAL PRIMARY KEY,
          device_id   VARCHAR(120) REFERENCES users(device_id) ON DELETE CASCADE,
          alias       VARCHAR(64) NOT NULL,
          message     TEXT NOT NULL,
          created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `,
    },
    {
      name: "create_community_challenge",
      sql: `
        CREATE TABLE IF NOT EXISTS community_challenge (
          id          SERIAL PRIMARY KEY,
          device_id   VARCHAR(120) REFERENCES users(device_id) ON DELETE CASCADE,
          alias       VARCHAR(64) NOT NULL,
          joined_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(device_id)
        );
      `,
    },

    // ── Create indexes ─────────────────────────────────────────────────────────
    {
      name: "create_indexes",
      sql: `
        CREATE INDEX IF NOT EXISTS idx_app_opens_device_date
          ON app_opens(device_id, DATE(opened_at));
        CREATE INDEX IF NOT EXISTS idx_app_opens_date
          ON app_opens(DATE(opened_at));
        CREATE INDEX IF NOT EXISTS idx_daily_logs_device_date
          ON daily_logs(device_id, date);
        CREATE INDEX IF NOT EXISTS idx_community_messages_created
          ON community_messages(created_at DESC);
      `,
    },

    // ── Alter existing tables (applied once, idempotent) ───────────────────────
    {
      name: "shrink_device_id_columns",
      sql: `
        ALTER TABLE users               ALTER COLUMN device_id TYPE VARCHAR(120);
        ALTER TABLE user_progress       ALTER COLUMN device_id TYPE VARCHAR(120);
        ALTER TABLE app_opens           ALTER COLUMN device_id TYPE VARCHAR(120);
        ALTER TABLE daily_logs          ALTER COLUMN device_id TYPE VARCHAR(120);
        ALTER TABLE community_messages  ALTER COLUMN device_id TYPE VARCHAR(120);
        ALTER TABLE community_challenge ALTER COLUMN device_id TYPE VARCHAR(120);
      `,
    },
    {
      name: "shrink_name_column",
      sql: `ALTER TABLE users ALTER COLUMN name TYPE VARCHAR(100);`,
    },
    {
      name: "users_cigarettes_per_day_check",
      sql: `
        ALTER TABLE users DROP CONSTRAINT IF EXISTS users_cigarettes_per_day_check;
        ALTER TABLE users ADD CONSTRAINT users_cigarettes_per_day_check
          CHECK (cigarettes_per_day > 0 AND cigarettes_per_day <= 1000);
      `,
    },
    {
      name: "users_price_per_pack_check",
      sql: `
        ALTER TABLE users DROP CONSTRAINT IF EXISTS users_price_per_pack_check;
        ALTER TABLE users ADD CONSTRAINT users_price_per_pack_check
          CHECK (price_per_pack > 0 AND price_per_pack <= 10000);
      `,
    },
    {
      name: "user_progress_checks",
      sql: `
        ALTER TABLE user_progress DROP CONSTRAINT IF EXISTS user_progress_days_smoke_free_check;
        ALTER TABLE user_progress ADD CONSTRAINT user_progress_days_smoke_free_check
          CHECK (days_smoke_free >= 0);

        ALTER TABLE user_progress DROP CONSTRAINT IF EXISTS user_progress_cigarettes_avoided_check;
        ALTER TABLE user_progress ADD CONSTRAINT user_progress_cigarettes_avoided_check
          CHECK (cigarettes_avoided >= 0);

        ALTER TABLE user_progress DROP CONSTRAINT IF EXISTS user_progress_money_saved_check;
        ALTER TABLE user_progress ADD CONSTRAINT user_progress_money_saved_check
          CHECK (money_saved >= 0);
      `,
    },
    {
      name: "daily_logs_smoked_count_check",
      sql: `
        ALTER TABLE daily_logs DROP CONSTRAINT IF EXISTS daily_logs_smoked_count_check;
        ALTER TABLE daily_logs ADD CONSTRAINT daily_logs_smoked_count_check
          CHECK (smoked_count >= 0 AND smoked_count <= 1000);
      `,
    },

    // ── Convert quit_date from TIMESTAMP to DATE ───────────────────────────────
    {
      name: "convert_quit_date_to_date",
      sql: `
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name  = 'users'
              AND column_name = 'quit_date'
              AND data_type   = 'timestamp without time zone'
          ) THEN
            ALTER TABLE users
              ALTER COLUMN quit_date TYPE DATE
              USING quit_date::DATE;
          END IF;
        END
        $$;
      `,
    },
  ];

  for (const { name, sql } of migrations) {
    try {
      await pool.query(sql);
      console.log(`  ✅ ${name}`);
    } catch (err) {
      console.warn(`  ⚠️  ${name} skipped: ${err.message}`);
    }
  }

  console.log("✅ Migrations complete");
};

module.exports = { runMigrations };
