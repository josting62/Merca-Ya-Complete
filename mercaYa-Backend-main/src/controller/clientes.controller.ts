import { Request, Response } from "express";
import { pool } from "../config/db";

export async function getAll(req: Request, res: Response) {
  const [rows]: any = await pool.query(
    "SELECT * FROM clientes ORDER BY nombre",
  );
  res.json(rows.map(mapCliente));
}

export async function getOne(req: Request, res: Response) {
  const { id } = req.params;
  const [rows]: any = await pool.query("SELECT * FROM clientes WHERE id = ?", [
    id,
  ]);
  if (!rows[0])
    return res.status(404).json({ message: "Cliente no encontrado" });
  res.json(mapCliente(rows[0]));
}

export async function create(req: Request, res: Response) {
  const {
    nombre,
    doc,
    tel,
    email,
    ciudad,
    direccion,
    tipo,
    estado,
    credito,
    diasCredito,
    notas,
  } = req.body;

  const [last]: any = await pool.query(
    "SELECT id FROM clientes ORDER BY created_at DESC LIMIT 1",
  );
  const num = last[0] ? parseInt(last[0].id.split("-")[1]) + 1 : 1;
  const id = `CLI-${String(num).padStart(3, "0")}`;

  await pool.query(
    `INSERT INTO clientes (id, nombre, doc, tel, email, ciudad, direccion, tipo, estado, credito, dias_credito, deuda, notas)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,0,?)`,
    [
      id,
      nombre,
      doc,
      tel,
      email,
      ciudad,
      direccion,
      tipo || "Nuevo",
      estado || "activo",
      credito || 0,
      diasCredito || 0,
      notas,
    ],
  );
  res.status(201).json({ id, message: "Cliente creado" });
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  const {
    nombre,
    doc,
    tel,
    email,
    ciudad,
    direccion,
    tipo,
    estado,
    credito,
    diasCredito,
    notas,
  } = req.body;

  await pool.query(
    `UPDATE clientes SET nombre=?, doc=?, tel=?, email=?, ciudad=?, direccion=?,
     tipo=?, estado=?, credito=?, dias_credito=?, notas=? WHERE id=?`,
    [
      nombre,
      doc,
      tel,
      email,
      ciudad,
      direccion,
      tipo,
      estado,
      credito,
      diasCredito,
      notas,
      id,
    ],
  );
  res.json({ message: "Cliente actualizado" });
}

export async function updateDeuda(req: Request, res: Response) {
  const { id } = req.params;
  const { deuda } = req.body;
  await pool.query("UPDATE clientes SET deuda = ? WHERE id = ?", [deuda, id]);
  res.json({ message: "Deuda actualizada" });
}

export async function remove(req: Request, res: Response) {
  const { id } = req.params;
  await pool.query("DELETE FROM clientes WHERE id = ?", [id]);
  res.json({ message: "Cliente eliminado" });
}

function mapCliente(c: any) {
  return {
    id: c.id,
    nombre: c.nombre,
    doc: c.doc,
    tel: c.tel,
    email: c.email,
    ciudad: c.ciudad,
    dir: c.direccion,
    tipo: c.tipo,
    estado: c.estado,
    credito: parseFloat(c.credito),
    dias: c.dias_credito,
    deuda: parseFloat(c.deuda),
    notas: c.notas,
  };
}
