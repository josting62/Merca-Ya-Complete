import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { id: number; email: string; rol: string };
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  // Primero busca en cookie HttpOnly
  const tokenFromCookie = req.cookies?.merka_token;

  // Fallback: también acepta Bearer token (para Postman/testing)
  const authHeader = req.headers.authorization;
  const tokenFromHeader =
    authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  const token = tokenFromCookie || tokenFromHeader;

  if (!token) {
    return res.status(401).json({ message: "No autenticado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
}