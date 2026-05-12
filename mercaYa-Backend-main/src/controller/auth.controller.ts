import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/db";
import { AuthRequest } from "../middleware/auth.middleware";

const COOKIE_NAME = "merka_token";
const IS_PROD = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: "lax" as const,
  maxAge: 8 * 60 * 60 * 1000,
  path: "/",
};

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email y contraseña requeridos" });

  const [rows]: any = await pool.query(
    'SELECT * FROM usuarios WHERE email = ? AND estado = "activo"',
    [email],
  );
  const user = rows[0];
  if (!user)
    return res.status(401).json({ message: "Credenciales incorrectas" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid)
    return res.status(401).json({ message: "Credenciales incorrectas" });

  const token = jwt.sign(
    { id: user.id, email: user.email, rol: user.rol },
    process.env.JWT_SECRET!,
    { expiresIn: "8h" },
  );

  res.cookie(COOKIE_NAME, token, cookieOptions);
  res.json({
    user: {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
    },
  });
}

export async function logout(_req: Request, res: Response) {
  res.cookie(COOKIE_NAME, "", { ...cookieOptions, maxAge: 0 });
  res.json({ message: "Sesión cerrada" });
}

export async function me(req: AuthRequest, res: Response) {
  const [rows]: any = await pool.query(
    "SELECT id, nombre, email, rol FROM usuarios WHERE id = ?",
    [req.user!.id],
  );
  if (!rows[0])
    return res.status(404).json({ message: "Usuario no encontrado" });
  res.json(rows[0]);
}

// Verifica que el PIN corresponde a cualquier admin activo
// No revela a quién pertenece — solo responde válido/inválido
export async function verifyPin(req: Request, res: Response) {
  const { pin } = req.body;
  if (!pin || pin.length !== 6)
    return res.status(400).json({ valid: false, message: "PIN inválido" });

  const [admins]: any = await pool.query(
    'SELECT pin FROM usuarios WHERE rol = "admin" AND estado = "activo" AND pin IS NOT NULL',
  );

  for (const admin of admins) {
    const match = await bcrypt.compare(pin.toUpperCase(), admin.pin);
    if (match) return res.json({ valid: true });
  }

  return res.status(401).json({ valid: false, message: "PIN incorrecto" });
}
