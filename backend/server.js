const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

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
    console.error("Error connecting to database:", err.stack);
  } else {
    console.log("Database connected successfully");
    release();
  }
});

// Initialize database tables
const initDB = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      quit_date TIMESTAMP NOT NULL,
      cigarettes_per_day INTEGER NOT NULL,
      price_per_pack DECIMAL(10, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_progress (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
      days_smoke_free INTEGER,
      cigarettes_avoided INTEGER,
      money_saved DECIMAL(10, 2),
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id)
    );
  `;

  try {
    await pool.query(createTableQuery);
    console.log("Database tables initialized");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

initDB();

// Routes

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Register new user
app.post("/api/users/register", async (req, res) => {
  const { userId, userName } = req.body;

  try {
    // Check if user already exists
    const existingUser = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    res.json({
      success: true,
      userId,
      userName,
      message: "User ID created. Please complete your profile.",
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
});

// Save user quit data and start tracking
app.post("/api/users/start", async (req, res) => {
  const { userId, userName, quitDate, cigarettesPerDay, pricePerPack } =
    req.body;

  try {
    // Insert or update user
    await pool.query(
      `INSERT INTO users (id, name, quit_date, cigarettes_per_day, price_per_pack, updated_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       ON CONFLICT (id) 
       DO UPDATE SET 
         name = $2,
         quit_date = $3,
         cigarettes_per_day = $4,
         price_per_pack = $5,
         updated_at = CURRENT_TIMESTAMP`,
      [userId, userName, quitDate, cigarettesPerDay, pricePerPack],
    );

    res.json({ success: true, message: "Tracking started successfully" });
  } catch (error) {
    console.error("Error starting tracking:", error);
    res.status(500).json({ error: "Failed to start tracking" });
  }
});

// Get user data
app.get("/api/users/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

// Update user progress
app.post("/api/users/:userId/progress", async (req, res) => {
  const { userId } = req.params;
  const { daysSmokeeFree, cigarettesAvoided, moneySaved } = req.body;

  try {
    await pool.query(
      `INSERT INTO user_progress (user_id, days_smoke_free, cigarettes_avoided, money_saved, last_updated)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id)
       DO UPDATE SET 
         days_smoke_free = $2,
         cigarettes_avoided = $3,
         money_saved = $4,
         last_updated = CURRENT_TIMESTAMP`,
      [userId, daysSmokeeFree, cigarettesAvoided, moneySaved],
    );

    res.json({ success: true, message: "Progress updated" });
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({ error: "Failed to update progress" });
  }
});

// Get all users (for admin)
app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.quit_date,
        u.cigarettes_per_day,
        u.price_per_pack,
        u.updated_at,
        COALESCE(p.days_smoke_free, 0) as days_smoke_free,
        COALESCE(p.cigarettes_avoided, 0) as cigarettes_avoided,
        COALESCE(p.money_saved, 0) as money_saved,
        COALESCE(p.last_updated, u.updated_at) as last_updated
      FROM users u
      LEFT JOIN user_progress p ON u.id = p.user_id
      ORDER BY p.days_smoke_free DESC NULLS LAST
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Delete user (reset)
app.delete("/api/users/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);
    res.json({ success: true, message: "User data deleted" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
