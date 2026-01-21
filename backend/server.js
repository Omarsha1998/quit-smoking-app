const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Error connecting to database:", err.stack);
  } else {
    console.log("✅ Database connected successfully");
    release();
  }
});

// Initialize database tables with deviceId
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
  `;

  try {
    await pool.query(createTableQuery);
    console.log("✅ Database tables initialized");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
  }
};

initDB();

// Routes

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Register new user (FIXED - Now properly handles updates)
app.post("/api/users/register", async (req, res) => {
  const { deviceId, userName } = req.body;

  console.log("📝 Registration request:", { deviceId, userName });

  if (!deviceId || !userName) {
    return res
      .status(400)
      .json({ error: "deviceId and userName are required" });
  }

  try {
    // FIXED: Use UPSERT instead of checking first
    const result = await pool.query(
      `INSERT INTO users (device_id, name, created_at, updated_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (device_id) 
       DO UPDATE SET 
         name = EXCLUDED.name,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [deviceId, userName],
    );

    const isNewUser = result.rows[0].created_at === result.rows[0].updated_at;

    console.log(
      isNewUser ? "✅ New device registered:" : "✅ Existing device updated:",
      deviceId,
    );

    res.json({
      success: true,
      deviceId,
      userName,
      isNewUser,
      message: isNewUser
        ? "Device registered successfully"
        : "Device information updated",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error registering device:", error);
    res.status(500).json({
      error: "Failed to register device",
      details: error.message,
    });
  }
});

// Start tracking (FIXED - Better logging and response)
app.post("/api/users/start", async (req, res) => {
  const { deviceId, userName, quitDate, cigarettesPerDay, pricePerPack } =
    req.body;

  console.log("🚀 Start tracking request:", {
    deviceId,
    userName,
    quitDate,
    cigarettesPerDay,
    pricePerPack,
  });

  if (
    !deviceId ||
    !userName ||
    !quitDate ||
    !cigarettesPerDay ||
    !pricePerPack
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Update device with quit data (or insert if doesn't exist)
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
      [deviceId, userName, quitDate, cigarettesPerDay, pricePerPack],
    );

    const userData = result.rows[0];
    const isNewTracking = userData.created_at === userData.updated_at;

    console.log(
      isNewTracking
        ? "✅ New tracking started for device:"
        : "✅ Tracking updated for device:",
      deviceId,
    );
    console.log("📊 User data:", userData);

    res.json({
      success: true,
      message: isNewTracking
        ? "Tracking started successfully"
        : "Tracking updated successfully",
      isNewTracking,
      user: userData,
    });
  } catch (error) {
    console.error("❌ Error starting tracking:", error);
    res.status(500).json({
      error: "Failed to start tracking",
      details: error.message,
    });
  }
});

// Get user data by deviceId
app.get("/api/users/:deviceId", async (req, res) => {
  const { deviceId } = req.params;

  console.log("🔍 Get user request:", deviceId);

  try {
    const result = await pool.query(
      `SELECT u.*, 
              COALESCE(p.days_smoke_free, 0) as days_smoke_free,
              COALESCE(p.cigarettes_avoided, 0) as cigarettes_avoided,
              COALESCE(p.money_saved, 0) as money_saved,
              COALESCE(p.last_updated, u.updated_at) as progress_updated
       FROM users u
       LEFT JOIN user_progress p ON u.device_id = p.device_id
       WHERE u.device_id = $1`,
      [deviceId],
    );

    if (result.rows.length === 0) {
      console.log("⚠️ Device not found:", deviceId);
      return res.status(404).json({ error: "Device not found" });
    }

    console.log("✅ Device found:", result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error fetching device:", error);
    res.status(500).json({
      error: "Failed to fetch device data",
      details: error.message,
    });
  }
});

// Update progress by deviceId (FIXED - Better validation)
app.post("/api/users/:deviceId/progress", async (req, res) => {
  const { deviceId } = req.params;
  const { daysSmokeeFree, cigarettesAvoided, moneySaved } = req.body;

  console.log("📈 Progress update request:", {
    deviceId,
    daysSmokeeFree,
    cigarettesAvoided,
    moneySaved,
  });

  if (
    daysSmokeeFree === undefined ||
    cigarettesAvoided === undefined ||
    moneySaved === undefined
  ) {
    return res.status(400).json({ error: "All progress fields are required" });
  }

  try {
    // First check if device exists
    const userCheck = await pool.query(
      "SELECT device_id FROM users WHERE device_id = $1",
      [deviceId],
    );

    if (userCheck.rows.length === 0) {
      console.log("⚠️ Device not found for progress update:", deviceId);
      return res.status(404).json({
        error: "Device not found",
        message: "Please register and start tracking first",
      });
    }

    // Update or insert progress
    const result = await pool.query(
      `INSERT INTO user_progress (device_id, days_smoke_free, cigarettes_avoided, money_saved, last_updated)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (device_id)
       DO UPDATE SET 
         days_smoke_free = EXCLUDED.days_smoke_free,
         cigarettes_avoided = EXCLUDED.cigarettes_avoided,
         money_saved = EXCLUDED.money_saved,
         last_updated = CURRENT_TIMESTAMP
       RETURNING *`,
      [deviceId, daysSmokeeFree, cigarettesAvoided, moneySaved],
    );

    console.log("✅ Progress updated successfully:", result.rows[0]);

    res.json({
      success: true,
      message: "Progress updated",
      progress: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error updating progress:", error);
    res.status(500).json({
      error: "Failed to update progress",
      details: error.message,
    });
  }
});

// Get all users (for admin)
app.get("/api/users", async (req, res) => {
  console.log("👥 Get all users request");

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
        COALESCE(p.days_smoke_free, 0) as days_smoke_free,
        COALESCE(p.cigarettes_avoided, 0) as cigarettes_avoided,
        COALESCE(p.money_saved, 0) as money_saved,
        COALESCE(p.last_updated, u.updated_at) as last_updated
      FROM users u
      LEFT JOIN user_progress p ON u.device_id = p.device_id
      ORDER BY p.days_smoke_free DESC NULLS LAST
    `);

    console.log(`✅ Found ${result.rows.length} users`);
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching all users:", error);
    res.status(500).json({
      error: "Failed to fetch users",
      details: error.message,
    });
  }
});

// Delete user by deviceId
app.delete("/api/users/:deviceId", async (req, res) => {
  const { deviceId } = req.params;

  console.log("🗑️ Delete device request:", deviceId);

  try {
    const result = await pool.query(
      "DELETE FROM users WHERE device_id = $1 RETURNING *",
      [deviceId],
    );

    if (result.rows.length === 0) {
      console.log("⚠️ Device not found for deletion:", deviceId);
      return res.status(404).json({ error: "Device not found" });
    }

    console.log("✅ Device deleted successfully:", deviceId);
    res.json({
      success: true,
      message: "Device data deleted",
      deletedUser: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error deleting device:", error);
    res.status(500).json({
      error: "Failed to delete device",
      details: error.message,
    });
  }
});

// Debug endpoint
app.get("/api/debug/stats", async (req, res) => {
  try {
    const userCount = await pool.query("SELECT COUNT(*) FROM users");
    const progressCount = await pool.query(
      "SELECT COUNT(*) FROM user_progress",
    );
    const recentUsers = await pool.query(
      "SELECT device_id, name, created_at FROM users ORDER BY created_at DESC LIMIT 5",
    );

    res.json({
      totalUsers: parseInt(userCount.rows[0].count),
      totalProgress: parseInt(progressCount.rows[0].count),
      recentUsers: recentUsers.rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API Base URL: http://localhost:${PORT}/api`);
});
