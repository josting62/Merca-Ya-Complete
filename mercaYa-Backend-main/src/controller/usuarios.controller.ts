import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../config/db";

// ── Helpers ──
function generarPin(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin O,0,I,1 para evitar confusiones
  let pin = "";
  for (let i = 0; i < 6; i++)
    pin += chars[Math.floor(Math.random() * chars.length)];
  return pin;
}

// GET /api/usuarios
export async function getAll(req: Request, res: Response) {
  const [rows]: any = await pool.query(
    "SELECT id, nombre, email, rol, estado, created_at FROM usuarios ORDER BY nombre",
  );
  res.json(rows);
}

// GET /api/usuarios/:id
export async function getOne(req: Request, res: Response) {
  const { id } = req.params;
  const [rows]: any = await pool.query(
    "SELECT id, nombre, email, rol, estado FROM usuarios WHERE id = ?",
    [id],
  );
  if (!rows[0])
    return res.status(404).json({ message: "Usuario no encontrado" });
  res.json(rows[0]);
}

// POST /api/usuarios  (solo admin)
export async function create(req: Request, res: Response) {
  const { nombre, email, password, rol, pin } = req.body;

  if (!nombre || !email || !password)
    return res
      .status(400)
      .json({ message: "Nombre, email y contraseña son requeridos" });

  if (!pin || pin.length !== 6)
    return res
      .status(400)
      .json({ message: "El PIN debe tener exactamente 6 caracteres" });

  const [existe]: any = await pool.query(
    "SELECT id FROM usuarios WHERE email = ?",
    [email],
  );
  if (existe[0])
    return res.status(400).json({ message: "El email ya está registrado" });

  const hashPassword = await bcrypt.hash(password, 10);
  const hashPin = await bcrypt.hash(pin.toUpperCase(), 10);

  const [result]: any = await pool.query(
    "INSERT INTO usuarios (nombre, email, password, pin, rol) VALUES (?,?,?,?,?)",
    [nombre, email, hashPassword, hashPin, rol || "vendedor"],
  );

  res.status(201).json({
    id: result.insertId,
    message: "Usuario creado",
    pin, // devuelve el PIN en texto plano solo en la creación para que el admin lo anote
  });
}

// PUT /api/usuarios/:id
export async function update(req: Request, res: Response) {
  const { id } = req.params;
  const { nombre, email, rol, estado } = req.body;
  await pool.query(
    "UPDATE usuarios SET nombre=?, email=?, rol=?, estado=? WHERE id=?",
    [nombre, email, rol, estado, id],
  );
  res.json({ message: "Usuario actualizado" });
}

// PUT /api/usuarios/:id/password
export async function changePassword(req: Request, res: Response) {
  const { id } = req.params;
  const { passwordActual, passwordNueva } = req.body;

  const [rows]: any = await pool.query("SELECT * FROM usuarios WHERE id = ?", [
    id,
  ]);
  const user = rows[0];
  if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

  const valid = await bcrypt.compare(passwordActual, user.password);
  if (!valid)
    return res.status(400).json({ message: "Contraseña actual incorrecta" });

  const hash = await bcrypt.hash(passwordNueva, 10);
  await pool.query("UPDATE usuarios SET password = ? WHERE id = ?", [hash, id]);
  res.json({ message: "Contraseña actualizada" });
}

// PUT /api/usuarios/:id/pin  (solo admin)
export async function changePin(req: Request, res: Response) {
  const { id } = req.params;
  const { pin } = req.body;

  if (!pin || pin.length !== 6)
    return res.status(400).json({ message: "PIN debe tener 6 caracteres" });

  const hash = await bcrypt.hash(pin.toUpperCase(), 10);
  await pool.query("UPDATE usuarios SET pin = ? WHERE id = ?", [hash, id]);
  res.json({ message: "PIN actualizado" });
}

// DELETE /api/usuarios/:id  (solo admin — desactiva)
export async function remove(req: Request, res: Response) {
  const { id } = req.params;
  await pool.query('UPDATE usuarios SET estado = "inactivo" WHERE id = ?', [
    id,
  ]);
  res.json({ message: "Usuario desactivado" });
}

// POST /api/usuarios/generar-pin  — genera un PIN aleatorio (solo admin, útil en el form)
export async function generarPinAleatorio(req: Request, res: Response) {
  const pin = generarPin();
  res.json({ pin });
}
