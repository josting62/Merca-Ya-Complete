import bcrypt from "bcryptjs";
import { pool } from "../config/db";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const hash = await bcrypt.hash("12345678", 10);

  // Verifica si ya existe
  const [rows]: any = await pool.query(
    "SELECT id FROM usuarios WHERE email = ?",
    ["admin@merka.com"]
  );

  if (rows[0]) {
    // Si existe, actualiza password Y estado
    await pool.query(
      "UPDATE usuarios SET password = ?, estado = 'activo' WHERE email = ?",
      [hash, "admin@merka.com"]
    );
    console.log("Admin actualizado correctamente");
  } else {
    // Si no existe, lo crea
    await pool.query(
      "INSERT INTO usuarios (nombre, email, password, rol, estado) VALUES (?,?,?,?,?)",
      ["Administrador", "admin@merka.com", hash, "admin", "activo"]
    );
    console.log("Admin creado correctamente");
  }

  process.exit(0);
}

main();