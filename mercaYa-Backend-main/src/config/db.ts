import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "merca_ya",
  waitForConnections: true,
  connectionLimit: 10,
});

export async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log("MySQL conectado correctamente");
    conn.release();
  } catch (err) {
    console.error("Error al conectar MySQL:", err);
    process.exit(1);
  }
}
