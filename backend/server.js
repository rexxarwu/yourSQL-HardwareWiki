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
      cpu: "CPU",
      gpu: "GPU",
      laptop: "Laptop",
      mobile: "Mobile",
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

// ✅ Start backend server
app.listen(5000, () => console.log("🚀 Server running on port 5000"));
