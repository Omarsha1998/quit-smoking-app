const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Error connecting to database:", err.stack);
  } else {
    console.log("✅ Database connected successfully");
    release();
  }
});

const initDB = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      device_id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      quit_date TIMESTAMP,
      cigarettes_per_day INTEGER,
      price_per_pack DECIMAL(10, 2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_progress (
      id SERIAL PRIMARY KEY,
      device_id VARCHAR(255) REFERENCES users(device_id) ON DELETE CASCADE,
      days_smoke_free INTEGER DEFAULT 0,
      cigarettes_avoided INTEGER DEFAULT 0,
      money_saved DECIMAL(10, 2) DEFAULT 0,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(device_id)
    );

    CREATE TABLE IF NOT EXISTS app_opens (
      id SERIAL PRIMARY KEY,
      device_id VARCHAR(255) REFERENCES users(device_id) ON DELETE CASCADE,
      opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_online BOOLEAN DEFAULT TRUE
    );

    CREATE TABLE IF NOT EXISTS daily_logs (
      id SERIAL PRIMARY KEY,
      device_id VARCHAR(255) REFERENCES users(device_id) ON DELETE CASCADE,
      date DATE NOT NULL,
      smoked BOOLEAN NOT NULL,
      smoked_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(device_id, date)
    );

    CREATE TABLE IF NOT EXISTS community_messages (
      id SERIAL PRIMARY KEY,
      device_id VARCHAR(255) REFERENCES users(device_id) ON DELETE CASCADE,
      alias VARCHAR(64) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS community_challenge (
      id SERIAL PRIMARY KEY,
      device_id VARCHAR(255) REFERENCES users(device_id) ON DELETE CASCADE,
      alias VARCHAR(64) NOT NULL,
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(device_id)
    );

    CREATE INDEX IF NOT EXISTS idx_app_opens_device_date
      ON app_opens(device_id, DATE(opened_at));

    CREATE INDEX IF NOT EXISTS idx_app_opens_date
      ON app_opens(DATE(opened_at));

    CREATE INDEX IF NOT EXISTS idx_daily_logs_device_date
      ON daily_logs(device_id, date);

    CREATE INDEX IF NOT EXISTS idx_community_messages_created
      ON community_messages(created_at DESC);
  `;

  try {
    await pool.query(createTableQuery);
    console.log("✅ Database tables initialized");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
  }
};

initDB();

// ─────────────────────────────────────────────────────────────────────────────
// Admin middleware
// ─────────────────────────────────────────────────────────────────────────────
const requireAdmin = async (req, res, next) => {
  const deviceId = req.headers["x-device-id"];
  if (!deviceId) return res.status(403).json({ error: "Forbidden" });

  try {
    const result = await pool.query(
      "SELECT is_admin FROM users WHERE device_id = $1",
      [deviceId]
    );
    if (!result.rows[0] || result.rows[0].is_admin !== true) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  } catch (error) {
    console.error("❌ Admin check failed:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────────────────────

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// ── App opens ─────────────────────────────────────────────────────────────────

app.post("/api/users/:deviceId/app-open", async (req, res) => {
  const { deviceId } = req.params;
  const { isOnline } = req.body;
  console.log("📱 App opened:", { deviceId, isOnline });
  try {
    const userCheck = await pool.query(
      "SELECT device_id FROM users WHERE device_id = $1", [deviceId]
    );
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: "Device not found", message: "Please register first" });
    }
    const result = await pool.query(
      `INSERT INTO app_opens (device_id, opened_at, is_online)
       VALUES ($1, CURRENT_TIMESTAMP, $2) RETURNING *`,
      [deviceId, isOnline !== false]
    );
    res.json({ success: true, message: "App open recorded", appOpen: result.rows[0] });
  } catch (error) {
    console.error("❌ Error recording app open:", error);
    res.status(500).json({ error: "Failed to record app open", details: error.message });
  }
});

app.get("/api/users/:deviceId/app-opens", async (req, res) => {
  const { deviceId } = req.params;
  try {
    const result = await pool.query(
      `SELECT
        COUNT(*) FILTER (WHERE DATE(opened_at) = CURRENT_DATE) AS opens_today,
        COUNT(*) FILTER (WHERE DATE_TRUNC('month', opened_at) = DATE_TRUNC('month', CURRENT_DATE)) AS opens_this_month,
        COUNT(*) AS total_opens,
        MAX(opened_at) AS last_opened
       FROM app_opens WHERE device_id = $1`,
      [deviceId]
    );
    res.json({
      success: true,
      stats: {
        opensToday:     parseInt(result.rows[0].opens_today)      || 0,
        opensThisMonth: parseInt(result.rows[0].opens_this_month) || 0,
        totalOpens:     parseInt(result.rows[0].total_opens)      || 0,
        lastOpened:     result.rows[0].last_opened,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching app opens:", error);
    res.status(500).json({ error: "Failed to fetch app opens", details: error.message });
  }
});

// ── Registration & setup ──────────────────────────────────────────────────────

app.post("/api/users/register", async (req, res) => {
  const { deviceId, userName } = req.body;
  console.log("📝 Registration request:", { deviceId, userName });
  if (!deviceId || !userName) {
    return res.status(400).json({ error: "deviceId and userName are required" });
  }
  try {
    const result = await pool.query(
      `INSERT INTO users (device_id, name, created_at, updated_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (device_id)
       DO UPDATE SET name = EXCLUDED.name, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [deviceId, userName]
    );
    const isNewUser = result.rows[0].created_at === result.rows[0].updated_at;
    res.json({
      success: true, deviceId, userName, isNewUser,
      message: isNewUser ? "Device registered successfully" : "Device information updated",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error registering device:", error);
    res.status(500).json({ error: "Failed to register device", details: error.message });
  }
});

app.post("/api/users/start", async (req, res) => {
  const { deviceId, userName, quitDate, cigarettesPerDay, pricePerPack } = req.body;
  console.log("🚀 Start tracking request:", { deviceId, userName, quitDate, cigarettesPerDay, pricePerPack });
  if (!deviceId || !userName || !quitDate || !cigarettesPerDay || !pricePerPack) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    const result = await pool.query(
      `INSERT INTO users (device_id, name, quit_date, cigarettes_per_day, price_per_pack, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (device_id)
       DO UPDATE SET
         name = EXCLUDED.name,
         quit_date = EXCLUDED.quit_date,
         cigarettes_per_day = EXCLUDED.cigarettes_per_day,
         price_per_pack = EXCLUDED.price_per_pack,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [deviceId, userName, quitDate, cigarettesPerDay, pricePerPack]
    );
    const userData = result.rows[0];
    const isNewTracking = userData.created_at === userData.updated_at;
    res.json({
      success: true,
      message: isNewTracking ? "Tracking started successfully" : "Tracking updated successfully",
      isNewTracking, user: userData,
    });
  } catch (error) {
    console.error("❌ Error starting tracking:", error);
    res.status(500).json({ error: "Failed to start tracking", details: error.message });
  }
});

// ── User data & progress ──────────────────────────────────────────────────────

app.get("/api/users/:deviceId", async (req, res) => {
  const { deviceId } = req.params;
  try {
    const result = await pool.query(
      `SELECT u.*,
              COALESCE(p.days_smoke_free, 0)    AS days_smoke_free,
              COALESCE(p.cigarettes_avoided, 0) AS cigarettes_avoided,
              COALESCE(p.money_saved, 0)         AS money_saved,
              COALESCE(p.last_updated, u.updated_at) AS progress_updated
       FROM users u
       LEFT JOIN user_progress p ON u.device_id = p.device_id
       WHERE u.device_id = $1`,
      [deviceId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Device not found" });
    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error fetching device:", error);
    res.status(500).json({ error: "Failed to fetch device data", details: error.message });
  }
});

app.post("/api/users/:deviceId/progress", async (req, res) => {
  const { deviceId } = req.params;
  const { daysSmokeeFree, cigarettesAvoided, moneySaved } = req.body;
  if (daysSmokeeFree === undefined || cigarettesAvoided === undefined || moneySaved === undefined) {
    return res.status(400).json({ error: "All progress fields are required" });
  }
  try {
    const userCheck = await pool.query(
      "SELECT device_id FROM users WHERE device_id = $1", [deviceId]
    );
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: "Device not found", message: "Please register and start tracking first" });
    }
    const result = await pool.query(
      `INSERT INTO user_progress (device_id, days_smoke_free, cigarettes_avoided, money_saved, last_updated)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (device_id)
       DO UPDATE SET
         days_smoke_free    = EXCLUDED.days_smoke_free,
         cigarettes_avoided = EXCLUDED.cigarettes_avoided,
         money_saved        = EXCLUDED.money_saved,
         last_updated       = CURRENT_TIMESTAMP
       RETURNING *`,
      [deviceId, daysSmokeeFree, cigarettesAvoided, moneySaved]
    );
    res.json({ success: true, message: "Progress updated", progress: result.rows[0] });
  } catch (error) {
    console.error("❌ Error updating progress:", error);
    res.status(500).json({ error: "Failed to update progress", details: error.message });
  }
});

// ── Daily log ─────────────────────────────────────────────────────────────────

app.post("/api/users/:deviceId/daily-log", async (req, res) => {
  const { deviceId } = req.params;
  const { date, smoked, smokedCount } = req.body;
  if (!date || smoked === undefined) {
    return res.status(400).json({ error: "date and smoked are required" });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: "date must be in YYYY-MM-DD format" });
  }
  try {
    const userCheck = await pool.query(
      "SELECT device_id FROM users WHERE device_id = $1", [deviceId]
    );
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: "Device not found", message: "Please register first" });
    }
    const count = smoked ? (parseInt(smokedCount) || 0) : 0;
    const result = await pool.query(
      `INSERT INTO daily_logs (device_id, date, smoked, smoked_count, created_at, updated_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (device_id, date)
       DO UPDATE SET
         smoked       = EXCLUDED.smoked,
         smoked_count = EXCLUDED.smoked_count,
         updated_at   = CURRENT_TIMESTAMP
       RETURNING *`,
      [deviceId, date, smoked, count]
    );
    res.json({ success: true, message: "Daily log saved", log: result.rows[0] });
  } catch (error) {
    console.error("❌ Error saving daily log:", error);
    res.status(500).json({ error: "Failed to save daily log", details: error.message });
  }
});

app.get("/api/users/:deviceId/daily-logs", async (req, res) => {
  const { deviceId } = req.params;
  try {
    const userCheck = await pool.query(
      "SELECT device_id FROM users WHERE device_id = $1", [deviceId]
    );
    if (userCheck.rows.length === 0) return res.status(404).json({ error: "Device not found" });
    const result = await pool.query(
      `SELECT
         date::text                AS date,
         smoked,
         COALESCE(smoked_count, 0) AS "smokedCount"
       FROM daily_logs
       WHERE device_id = $1
       ORDER BY date DESC`,
      [deviceId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching daily logs:", error);
    res.status(500).json({ error: "Failed to fetch daily logs", details: error.message });
  }
});

// ── Community ─────────────────────────────────────────────────────────────────

// POST a message to the encouragement wall (stored anonymously with alias)
app.post("/api/community/messages", async (req, res) => {
  const { deviceId, alias, message } = req.body;

  if (!deviceId || !alias || !message) {
    return res.status(400).json({ error: "deviceId, alias, and message are required" });
  }
  if (message.trim().length < 3 || message.trim().length > 120) {
    return res.status(400).json({ error: "Message must be between 3 and 120 characters" });
  }

  console.log("💬 Community message from:", alias);

  try {
    const userCheck = await pool.query(
      "SELECT device_id FROM users WHERE device_id = $1", [deviceId]
    );
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: "Device not found" });
    }

    const result = await pool.query(
      `INSERT INTO community_messages (device_id, alias, message, created_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       RETURNING id, alias, message, created_at`,
      [deviceId, alias.trim(), message.trim()]
    );

    console.log("✅ Community message saved:", result.rows[0].id);
    res.json({ success: true, message: result.rows[0] });
  } catch (error) {
    console.error("❌ Error saving community message:", error);
    res.status(500).json({ error: "Failed to save message", details: error.message });
  }
});

// GET recent encouragement wall messages (latest 30, anonymous — no device_id returned)
app.get("/api/community/messages", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, alias, message, created_at
       FROM community_messages
       ORDER BY created_at DESC
       LIMIT 30`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching community messages:", error);
    res.status(500).json({ error: "Failed to fetch messages", details: error.message });
  }
});

// POST join the 7-day challenge (upsert — idempotent)
app.post("/api/community/challenge/join", async (req, res) => {
  const { deviceId, alias } = req.body;

  if (!deviceId || !alias) {
    return res.status(400).json({ error: "deviceId and alias are required" });
  }

  console.log("🏆 Challenge join:", { deviceId, alias });

  try {
    const userCheck = await pool.query(
      "SELECT device_id FROM users WHERE device_id = $1", [deviceId]
    );
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: "Device not found" });
    }

    await pool.query(
      `INSERT INTO community_challenge (device_id, alias, joined_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (device_id) DO NOTHING`,
      [deviceId, alias.trim()]
    );

    console.log("✅ Challenge joined:", deviceId);
    res.json({ success: true, message: "Challenge joined" });
  } catch (error) {
    console.error("❌ Error joining challenge:", error);
    res.status(500).json({ error: "Failed to join challenge", details: error.message });
  }
});

// GET leaderboard — participants ranked by smoke-free days
// Returns real name (from users table) + days
// Encouragement wall stays alias-only; leaderboard uses real name so users can find themselves
app.get("/api/community/leaderboard", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         u.name,
         COALESCE(p.days_smoke_free, 0) AS days
       FROM community_challenge cc
       JOIN users u ON cc.device_id = u.device_id
       LEFT JOIN user_progress p ON cc.device_id = p.device_id
       ORDER BY days DESC
       LIMIT 20`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard", details: error.message });
  }
});

// GET total active challenge participants count
app.get("/api/community/participants", async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) FROM community_challenge");
    res.json({ count: parseInt(result.rows[0].count) || 0 });
  } catch (error) {
    console.error("❌ Error fetching participants:", error);
    res.status(500).json({ error: "Failed to fetch participants", details: error.message });
  }
});

// ── Admin ─────────────────────────────────────────────────────────────────────

app.get("/api/users/:deviceId/is-admin", async (req, res) => {
  const { deviceId } = req.params;
  try {
    const result = await pool.query(
      "SELECT is_admin FROM users WHERE device_id = $1", [deviceId]
    );
    const isAdmin = result.rows[0]?.is_admin === true;
    res.json({ isAdmin });
  } catch (error) {
    console.error("❌ Admin check failed:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/admin/users", requireAdmin, async (req, res) => {
  console.log("👥 Admin: get all users");
  try {
    const result = await pool.query(`
      SELECT
        u.device_id,
        u.name,
        u.quit_date,
        u.cigarettes_per_day,
        u.price_per_pack,
        u.created_at,
        u.updated_at,
        COALESCE(p.days_smoke_free, 0)         AS days_smoke_free,
        COALESCE(p.cigarettes_avoided, 0)      AS cigarettes_avoided,
        COALESCE(p.money_saved, 0)             AS money_saved,
        COALESCE(p.last_updated, u.updated_at) AS last_updated,
        COUNT(ao.id) FILTER (WHERE DATE(ao.opened_at) = CURRENT_DATE)                                     AS opens_today,
        COUNT(ao.id) FILTER (WHERE DATE_TRUNC('month', ao.opened_at) = DATE_TRUNC('month', CURRENT_DATE)) AS opens_this_month,
        COUNT(ao.id)                                                                                       AS total_opens,
        MAX(ao.opened_at)                                                                                  AS last_app_open,
        COUNT(dl.id) FILTER (WHERE dl.smoked = FALSE)                                                     AS smoke_free_days_logged,
        COUNT(dl.id) FILTER (WHERE dl.smoked = TRUE)                                                      AS smoked_days_logged,
        COUNT(dl.id)                                                                                       AS total_days_logged,
        COALESCE(SUM(dl.smoked_count) FILTER (WHERE dl.smoked = TRUE), 0)                                 AS total_cigarettes_smoked
      FROM users u
      LEFT JOIN user_progress p ON u.device_id = p.device_id
      LEFT JOIN app_opens ao    ON u.device_id = ao.device_id
      LEFT JOIN daily_logs dl   ON u.device_id = dl.device_id
      GROUP BY u.device_id, p.id
      ORDER BY p.days_smoke_free DESC NULLS LAST
    `);
    console.log(`✅ Admin: found ${result.rows.length} users`);
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching all users:", error);
    res.status(500).json({ error: "Failed to fetch users", details: error.message });
  }
});

app.delete("/api/users/:deviceId", async (req, res) => {
  const { deviceId } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM users WHERE device_id = $1 RETURNING *", [deviceId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Device not found" });
    res.json({ success: true, message: "Device data deleted", deletedUser: result.rows[0] });
  } catch (error) {
    console.error("❌ Error deleting device:", error);
    res.status(500).json({ error: "Failed to delete device", details: error.message });
  }
});

// ── Debug ─────────────────────────────────────────────────────────────────────

app.get("/api/debug/stats", async (req, res) => {
  try {
    const [userCount, progressCount, appOpensCount, dailyLogsCount, communityMsgCount, challengeCount, recentUsers, recentLogs] =
      await Promise.all([
        pool.query("SELECT COUNT(*) FROM users"),
        pool.query("SELECT COUNT(*) FROM user_progress"),
        pool.query("SELECT COUNT(*) FROM app_opens"),
        pool.query("SELECT COUNT(*) FROM daily_logs"),
        pool.query("SELECT COUNT(*) FROM community_messages"),
        pool.query("SELECT COUNT(*) FROM community_challenge"),
        pool.query("SELECT device_id, name, created_at FROM users ORDER BY created_at DESC LIMIT 5"),
        pool.query("SELECT device_id, date, smoked, smoked_count FROM daily_logs ORDER BY date DESC LIMIT 10"),
      ]);
    res.json({
      totalUsers:             parseInt(userCount.rows[0].count),
      totalProgress:          parseInt(progressCount.rows[0].count),
      totalAppOpens:          parseInt(appOpensCount.rows[0].count),
      totalDailyLogs:         parseInt(dailyLogsCount.rows[0].count),
      totalCommunityMessages: parseInt(communityMsgCount.rows[0].count),
      totalChallengeJoins:    parseInt(challengeCount.rows[0].count),
      recentUsers:            recentUsers.rows,
      recentDailyLogs:        recentLogs.rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API Base URL: http://localhost:${PORT}/api`);
});