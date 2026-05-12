import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

// ── Solo administrador ──
export function soloAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.rol !== "admin")
    return res.status(403).json({ message: "Acceso restringido — solo administradores" });
  next();
}

// ── Admin o vendedor ──
export function adminOVendedor(req: AuthRequest, res: Response, next: NextFunction) {
  if (!["admin", "vendedor"].includes(req.user?.rol || ""))
    return res.status(403).json({ message: "Acceso restringido" });
  next();
}

// ── Admin o bodega ──
export function adminOBodega(req: AuthRequest, res: Response, next: NextFunction) {
  if (!["admin", "bodega"].includes(req.user?.rol || ""))
    return res.status(403).json({ message: "Acceso restringido" });
  next();
}

// ── Cualquier rol autenticado ──
export function cualquierRol(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user)
    return res.status(401).json({ message: "No autenticado" });
  next();
}