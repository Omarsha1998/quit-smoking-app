const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const { runMigrations } = require("./migration");
const ADMIN_SECRET = process.env.ADMIN_SECRET;

const allowedOrigins = [
  "https://puff-proof.onrender.com",
  "http://localhost:9000",
  "https://quit-smoking-api-zr94.onrender.com",
];

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const app = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────────────────────────────────────
// Security middlewares
// ─────────────────────────────────────────────────────────────────────────────

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-device-id",
      "x-admin-token",
    ],
    credentials: true,
  }),
);

app.use(express.json({ limit: "10kb" }));

// Global — generous ceiling, just blocks abuse
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});
app.use(globalLimiter);

// Sync limiter — for endpoints fired in bursts on app open
// (app-open, register, start, progress, daily-log, challenge/join)
// 60 per 15 min = 4 per minute on average, plenty for normal use
const syncLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

// Strict limiter — destructive / sensitive actions only (delete)
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

// Community message spam guard
const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: "Too many messages. Please wait a moment." },
});

// ─────────────────────────────────────────────────────────────────────────────
// Input sanitization helpers
// ─────────────────────────────────────────────────────────────────────────────

const sanitizeString = (str, maxLen = 255) => {
  if (typeof str !== "string") return "";
  return str
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, maxLen);
};

const isValidDeviceId = (id) =>
  typeof id === "string" && /^[a-zA-Z0-9_-]{10,120}$/.test(id);

const isValidDate = (d) =>
  typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d);

// ─────────────────────────────────────────────────────────────────────────────
// Database
// ─────────────────────────────────────────────────────────────────────────────

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// ─────────────────────────────────────────────────────────────────────────────
// Admin middleware
// ─────────────────────────────────────────────────────────────────────────────

const requireAdmin = (req, res, next) => {
  const token = req.headers["x-admin-token"];
  if (!token || token !== ADMIN_SECRET) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
};

// ─────────────────────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────────────────────

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ── App opens ─────────────────────────────────────────────────────────────────

app.post("/admin/verify", (req, res) => {
  const { pin } = req.body;
  if (!pin || pin !== ADMIN_SECRET) {
    return res.status(401).json({ error: "Invalid PIN" });
  }
  res.json({ token: ADMIN_SECRET });
});

app.post("/users/:deviceId/app-open", syncLimiter, async (req, res) => {
  const { deviceId } = req.params;
  if (!isValidDeviceId(deviceId)) {
    return res.status(400).json({ error: "Invalid device ID" });
  }
  const { isOnline } = req.body;
  try {
    const userCheck = await pool.query(
      "SELECT device_id FROM users WHERE device_id = $1",
      [deviceId],
    );
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: "Device not found" });
    }
    const result = await pool.query(
      `INSERT INTO app_opens (device_id, opened_at, is_online)
       VALUES ($1, CURRENT_TIMESTAMP, $2) RETURNING *`,
      [deviceId, isOnline !== false],
    );
    res.json({ success: true, appOpen: result.rows[0] });
  } catch (error) {
    console.error("❌ Error recording app open:", error);
    res.status(500).json({ error: "Failed to record app open" });
  }
});

app.get("/users/:deviceId/app-opens", async (req, res) => {
  const { deviceId } = req.params;
  if (!isValidDeviceId(deviceId)) {
    return res.status(400).json({ error: "Invalid device ID" });
  }
  try {
    const result = await pool.query(
      `SELECT
        COUNT(*) FILTER (WHERE DATE(opened_at) = CURRENT_DATE) AS opens_today,
        COUNT(*) FILTER (WHERE DATE_TRUNC('month', opened_at) = DATE_TRUNC('month', CURRENT_DATE)) AS opens_this_month,
        COUNT(*) AS total_opens,
        MAX(opened_at) AS last_opened
       FROM app_opens WHERE device_id = $1`,
      [deviceId],
    );
    res.json({
      success: true,
      stats: {
        opensToday: parseInt(result.rows[0].opens_today) || 0,
        opensThisMonth: parseInt(result.rows[0].opens_this_month) || 0,
        totalOpens: parseInt(result.rows[0].total_opens) || 0,
        lastOpened: result.rows[0].last_opened,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching app opens:", error);
    res.status(500).json({ error: "Failed to fetch app opens" });
  }
});

// ── Registration & setup ──────────────────────────────────────────────────────

app.post("/users/register", syncLimiter, async (req, res) => {
  const { deviceId, userName } = req.body;

  if (!deviceId || !userName) {
    return res
      .status(400)
      .json({ error: "deviceId and userName are required" });
  }
  if (!isValidDeviceId(deviceId)) {
    return res.status(400).json({ error: "Invalid device ID format" });
  }

  const cleanName = sanitizeString(userName, 100);
  if (!cleanName || cleanName.length < 1) {
    return res.status(400).json({ error: "Invalid user name" });
  }

  try {
    await pool.query(
      `INSERT INTO users (device_id, name, created_at, updated_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (device_id)
       DO UPDATE SET name = EXCLUDED.name, updated_at = CURRENT_TIMESTAMP`,
      [deviceId, cleanName],
    );
    res.json({
      success: true,
      deviceId,
      userName: cleanName,
      message: "Device registered successfully",
    });
  } catch (error) {
    console.error("❌ Error registering device:", error);
    res.status(500).json({ error: "Failed to register device" });
  }
});

app.post("/users/start", syncLimiter, async (req, res) => {
  const { deviceId, userName, quitDate, cigarettesPerDay, pricePerPack } =
    req.body;

  if (
    !deviceId ||
    !userName ||
    !quitDate ||
    !cigarettesPerDay ||
    !pricePerPack
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }
  if (!isValidDeviceId(deviceId)) {
    return res.status(400).json({ error: "Invalid device ID" });
  }
  if (!isValidDate(quitDate)) {
    return res.status(400).json({ error: "Invalid date format" });
  }

  const cpd = parseInt(cigarettesPerDay);
  const ppp = parseFloat(pricePerPack);

  if (isNaN(cpd) || cpd <= 0 || cpd > 1000) {
    return res
      .status(400)
      .json({ error: "Invalid cigarettes per day (max 1000)" });
  }
  if (isNaN(ppp) || ppp <= 0 || ppp > 10000) {
    return res
      .status(400)
      .json({ error: "Invalid price per pack (max ₱10,000)" });
  }

  const cleanName = sanitizeString(userName, 100);

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
       RETURNING device_id, name, quit_date, cigarettes_per_day, price_per_pack`,
      [deviceId, cleanName, quitDate, cpd, ppp],
    );
    res.json({
      success: true,
      message: "Tracking started",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error starting tracking:", error);
    res.status(500).json({ error: "Failed to start tracking" });
  }
});

// ── User data & progress ──────────────────────────────────────────────────────

app.get("/users/:deviceId", async (req, res) => {
  const { deviceId } = req.params;
  if (!isValidDeviceId(deviceId)) {
    return res.status(400).json({ error: "Invalid device ID" });
  }
  try {
    const result = await pool.query(
      `SELECT u.device_id, u.name, u.quit_date, u.cigarettes_per_day, u.price_per_pack,
              u.created_at, u.updated_at,
              COALESCE(p.days_smoke_free, 0)    AS days_smoke_free,
              COALESCE(p.cigarettes_avoided, 0) AS cigarettes_avoided,
              COALESCE(p.money_saved, 0)         AS money_saved
       FROM users u
       LEFT JOIN user_progress p ON u.device_id = p.device_id
       WHERE u.device_id = $1`,
      [deviceId],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Device not found" });
    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error fetching device:", error);
    res.status(500).json({ error: "Failed to fetch device data" });
  }
});

app.post("/users/:deviceId/progress", syncLimiter, async (req, res) => {
  const { deviceId } = req.params;
  if (!isValidDeviceId(deviceId)) {
    return res.status(400).json({ error: "Invalid device ID" });
  }
  const { daysSmokeeFree, cigarettesAvoided, moneySaved } = req.body;

  const days = parseInt(daysSmokeeFree);
  const cigs = parseInt(cigarettesAvoided);
  const money = parseFloat(moneySaved);

  if (isNaN(days) || days < 0) {
    return res.status(400).json({ error: "Invalid days value" });
  }
  if (isNaN(cigs) || cigs < 0) {
    return res.status(400).json({ error: "Invalid cigarettes value" });
  }
  if (isNaN(money) || money < 0) {
    return res.status(400).json({ error: "Invalid money value" });
  }

  try {
    const userCheck = await pool.query(
      "SELECT device_id FROM users WHERE device_id = $1",
      [deviceId],
    );
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: "Device not found" });
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
      [deviceId, days, cigs, money],
    );
    res.json({
      success: true,
      message: "Progress updated",
      progress: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error updating progress:", error);
    res.status(500).json({ error: "Failed to update progress" });
  }
});

// ── Daily log ─────────────────────────────────────────────────────────────────

app.post("/users/:deviceId/daily-log", syncLimiter, async (req, res) => {
  const { deviceId } = req.params;
  if (!isValidDeviceId(deviceId)) {
    return res.status(400).json({ error: "Invalid device ID" });
  }
  const { date, smoked, smokedCount } = req.body;

  if (!isValidDate(date)) {
    return res.status(400).json({ error: "date must be in YYYY-MM-DD format" });
  }
  if (typeof smoked !== "boolean") {
    return res.status(400).json({ error: "smoked must be a boolean" });
  }

  const today = new Date().toISOString().split("T")[0];
  if (date > today) {
    return res.status(400).json({ error: "Cannot log future dates" });
  }

  const count = smoked
    ? Math.min(Math.max(parseInt(smokedCount) || 0, 0), 1000)
    : 0;

  try {
    const userCheck = await pool.query(
      "SELECT device_id FROM users WHERE device_id = $1",
      [deviceId],
    );
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: "Device not found" });
    }
    const result = await pool.query(
      `INSERT INTO daily_logs (device_id, date, smoked, smoked_count, created_at, updated_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (device_id, date)
       DO UPDATE SET
         smoked       = EXCLUDED.smoked,
         smoked_count = EXCLUDED.smoked_count,
         updated_at   = CURRENT_TIMESTAMP
       RETURNING *`,
      [deviceId, date, smoked, count],
    );
    res.json({
      success: true,
      message: "Daily log saved",
      log: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error saving daily log:", error);
    res.status(500).json({ error: "Failed to save daily log" });
  }
});

app.get("/users/:deviceId/daily-logs", async (req, res) => {
  const { deviceId } = req.params;
  if (!isValidDeviceId(deviceId)) {
    return res.status(400).json({ error: "Invalid device ID" });
  }
  try {
    const userCheck = await pool.query(
      "SELECT device_id FROM users WHERE device_id = $1",
      [deviceId],
    );
    if (userCheck.rows.length === 0)
      return res.status(404).json({ error: "Device not found" });
    const result = await pool.query(
      `SELECT date::text AS date, smoked, COALESCE(smoked_count, 0) AS "smokedCount"
       FROM daily_logs WHERE device_id = $1 ORDER BY date DESC`,
      [deviceId],
    );
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching daily logs:", error);
    res.status(500).json({ error: "Failed to fetch daily logs" });
  }
});

// ── Community ─────────────────────────────────────────────────────────────────

app.post("/community/messages", messageLimiter, async (req, res) => {
  const { deviceId, alias, message } = req.body;

  if (!deviceId || !alias || !message) {
    return res
      .status(400)
      .json({ error: "deviceId, alias, and message are required" });
  }
  if (!isValidDeviceId(deviceId)) {
    return res.status(400).json({ error: "Invalid device ID" });
  }

  const cleanAlias = sanitizeString(alias, 64);
  const cleanMessage = sanitizeString(message, 120);

  if (!cleanAlias || cleanAlias.length < 1) {
    return res.status(400).json({ error: "Invalid alias" });
  }
  if (!cleanMessage || cleanMessage.length < 3) {
    return res
      .status(400)
      .json({ error: "Message must be between 3 and 120 characters" });
  }

  try {
    const userCheck = await pool.query(
      "SELECT device_id FROM users WHERE device_id = $1",
      [deviceId],
    );
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: "Device not found" });
    }
    const result = await pool.query(
      `INSERT INTO community_messages (device_id, alias, message, created_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       RETURNING id, alias, message, created_at`,
      [deviceId, cleanAlias, cleanMessage],
    );
    res.json({ success: true, message: result.rows[0] });
  } catch (error) {
    console.error("❌ Error saving community message:", error);
    res.status(500).json({ error: "Failed to save message" });
  }
});

app.get("/community/messages", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, alias, message, created_at
       FROM community_messages ORDER BY created_at DESC LIMIT 30`,
    );
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching community messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

app.post("/community/challenge/join", syncLimiter, async (req, res) => {
  const { deviceId, alias } = req.body;

  if (!deviceId || !alias) {
    return res.status(400).json({ error: "deviceId and alias are required" });
  }
  if (!isValidDeviceId(deviceId)) {
    return res.status(400).json({ error: "Invalid device ID" });
  }

  const cleanAlias = sanitizeString(alias, 64);

  try {
    const userCheck = await pool.query(
      "SELECT device_id FROM users WHERE device_id = $1",
      [deviceId],
    );
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: "Device not found" });
    }
    await pool.query(
      `INSERT INTO community_challenge (device_id, alias, joined_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (device_id) DO NOTHING`,
      [deviceId, cleanAlias],
    );
    res.json({ success: true, message: "Challenge joined" });
  } catch (error) {
    console.error("❌ Error joining challenge:", error);
    res.status(500).json({ error: "Failed to join challenge" });
  }
});

app.get("/community/leaderboard", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.name, COALESCE(p.days_smoke_free, 0) AS days
       FROM community_challenge cc
       JOIN users u ON cc.device_id = u.device_id
       LEFT JOIN user_progress p ON cc.device_id = p.device_id
       ORDER BY days DESC LIMIT 20`,
    );
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

app.get("/community/participants", async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) FROM community_challenge");
    res.json({ count: parseInt(result.rows[0].count) || 0 });
  } catch (error) {
    console.error("❌ Error fetching participants:", error);
    res.status(500).json({ error: "Failed to fetch participants" });
  }
});

// ── Admin ─────────────────────────────────────────────────────────────────────

app.get("/users/:deviceId/is-admin", async (req, res) => {
  const { deviceId } = req.params;
  if (!isValidDeviceId(deviceId)) {
    return res.status(400).json({ error: "Invalid device ID" });
  }
  try {
    const result = await pool.query(
      "SELECT is_admin FROM users WHERE device_id = $1",
      [deviceId],
    );
    const isAdmin = result.rows[0]?.is_admin === true;
    res.json({ isAdmin });
  } catch (error) {
    console.error("❌ Admin check failed:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/admin/users", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u.device_id, u.name, u.quit_date, u.cigarettes_per_day, u.price_per_pack,
        u.created_at, u.updated_at,
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
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching all users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.delete("/users/:deviceId", writeLimiter, async (req, res) => {
  const { deviceId } = req.params;
  if (!isValidDeviceId(deviceId)) {
    return res.status(400).json({ error: "Invalid device ID" });
  }
  try {
    const result = await pool.query(
      "DELETE FROM users WHERE device_id = $1 RETURNING device_id",
      [deviceId],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Device not found" });
    res.json({ success: true, message: "Device data deleted" });
  } catch (error) {
    console.error("❌ Error deleting device:", error);
    res.status(500).json({ error: "Failed to delete device" });
  }
});

// ── Debug — disabled in production ───────────────────────────────────────────

if (process.env.NODE_ENV !== "production") {
  app.get("/debug/stats", async (req, res) => {
    try {
      const [
        userCount,
        progressCount,
        appOpensCount,
        dailyLogsCount,
        communityMsgCount,
        challengeCount,
        recentUsers,
        recentLogs,
      ] = await Promise.all([
        pool.query("SELECT COUNT(*) FROM users"),
        pool.query("SELECT COUNT(*) FROM user_progress"),
        pool.query("SELECT COUNT(*) FROM app_opens"),
        pool.query("SELECT COUNT(*) FROM daily_logs"),
        pool.query("SELECT COUNT(*) FROM community_messages"),
        pool.query("SELECT COUNT(*) FROM community_challenge"),
        pool.query(
          "SELECT device_id, name, created_at FROM users ORDER BY created_at DESC LIMIT 5",
        ),
        pool.query(
          "SELECT device_id, date, smoked, smoked_count FROM daily_logs ORDER BY date DESC LIMIT 10",
        ),
      ]);
      res.json({
        totalUsers: parseInt(userCount.rows[0].count),
        totalProgress: parseInt(progressCount.rows[0].count),
        totalAppOpens: parseInt(appOpensCount.rows[0].count),
        totalDailyLogs: parseInt(dailyLogsCount.rows[0].count),
        totalCommunityMessages: parseInt(communityMsgCount.rows[0].count),
        totalChallengeJoins: parseInt(challengeCount.rows[0].count),
        recentUsers: recentUsers.rows,
        recentDailyLogs: recentLogs.rows,
      });
    } catch (error) {
      res.status(500).json({ error: "Stats unavailable" });
    }
  });
}

// ── 404 catch-all ─────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// ─────────────────────────────────────────────────────────────────────────────
// Startup
// ─────────────────────────────────────────────────────────────────────────────

const startServer = async () => {
  try {
    const client = await pool.connect();
    client.release();
    console.log("✅ Database connected successfully");

    await runMigrations(pool);

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
