// backend/server.js
import express from "express";
import cors from "cors";
import { db } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Test route
app.get("/", (_, res) => res.send("Backend is running!"));

// ✅ Universal data retrieval route (case-insensitive)
app.get("/api/:table", async (req, res) => {
  try {
    // Normalize the param
    const tableParam = req.params.table.toLowerCase();

    // Map lowercase → actual MySQL table names
    const tableMap = {
      cpu: "CPU_clean",
      gpu: "GPU_clean",
      laptop: "Laptop_clean",
      mobile: "Mobile_clean",
      company: "Company",
      user: "User",
      comment: "Comment",
    };

    const table = tableMap[tableParam];
    if (!table) {
      return res.status(400).json({ error: "Invalid table name" });
    }

    // Query safely
    const [rows] = await db.query(`SELECT * FROM \`${table}\` LIMIT 10;`);
    res.json(rows);
  } catch (err) {
    console.error("❌ DB Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 🔍 Search in any table (CPU, GPU, Mobile, Laptop)
app.get("/api/search/:table", async (req, res) => {
  try {
    const { table } = req.params;
    const { q } = req.query;

    if (!q) return res.status(400).json({ error: "Missing search query" });

    // Whitelist for security
    const tableMap = {
      cpu: "CPU",
      gpu: "GPU",
      mobile: "Mobile",
      laptop: "Laptop",
    };

    const realTable = tableMap[table.toLowerCase()];
    if (!realTable) return res.status(400).json({ error: "Invalid table" });

    // Search all text columns using LIKE
    const [cols] = await db.query(`SHOW COLUMNS FROM \`${realTable}\``);

    // Build LIKE clauses dynamically
    const likeClauses = cols
      .filter((c) => c.Type.includes("varchar") || c.Type.includes("text"))
      .map((c) => `\`${c.Field}\` LIKE ?`)
      .join(" OR ");

    const likeParams = Array(cols.length).fill(`%${q}%`);

    const [rows] = await db.query(
      `SELECT * FROM \`${realTable}\` WHERE ${likeClauses}`,
      likeParams
    );

    res.json(rows);
  } catch (err) {
    console.error("❌ Search error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get comments for a specific product
app.get("/api/comment/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const [rows] = await db.query("SELECT * FROM Comment WHERE ProductID = ?", [productId]);
    res.json(rows);
  } catch (err) {
    console.error("❌ MySQL error in /api/comment/:productId ->", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Add a new comment
app.post("/api/comment", async (req, res) => {
  try {
    const { UserId, ProductID, Content, Stars } = req.body;
    const [result] = await db.query(
      "INSERT INTO Comment (UserId, ProductID, Content, Stars, Likes) VALUES (?, ?, ?, ?, 0)",
      [UserId, ProductID, Content, Stars]
    );
    res.json({ success: true, CommentID: result.insertId });
  } catch (err) {
    console.error("❌ MySQL error in POST /api/comment ->", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/comment/:commentId", async (req, res) => {
  try {
    const { commentId } = req.params;
    const { Content, Stars } = req.body;

    const [result] = await db.query(
      "UPDATE Comment SET Content = ?, Stars = ? WHERE CommentID = ?",
      [Content, Stars, commentId]
    );

    res.json({ success: true, updated: result.affectedRows });
  } catch (err) {
    console.error("❌ Update error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/comment/:commentId", async (req, res) => {
  try {
    const { commentId } = req.params;

    const [result] = await db.query(
      "DELETE FROM Comment WHERE CommentID = ?",
      [commentId]
    );

    res.json({ success: true, deleted: result.affectedRows });
  } catch (err) {
    console.error("❌ Delete error:", err.message);
    res.status(500).json({ error: err.message });
  }
});
// ✅ Start backend server
app.listen(5000, () => console.log("🚀 Server running on port 5000"));
