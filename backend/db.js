import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: "34.132.161.224",
  user: "wyx",
  password: "wyx",
  database: "Hardware",          // your DB name (check exact case)
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

try {
  const conn = await db.getConnection();
  console.log(" Connected to MySQL successfully!");
  conn.release();
} catch (err) {
  console.error(" MySQL connection failed:", err.message);
}