import { Request, Response } from "express";
import { pool } from "../config/db";

// Genera código único DSP-0001
async function generarCodigo(): Promise<string> {
  const [rows]: any = await pool.query(
    "SELECT COUNT(*) as total FROM despachos"
  );
  const num = rows[0].total + 1;
  return `DSP-${String(num).padStart(4, "0")}`;
}

// GET /despachos
export async function getAll(req: Request, res: Response) {
  const [rows]: any = await pool.query(
    "SELECT * FROM despachos ORDER BY created_at DESC"
  );
  res.json(rows);
}

// GET /despachos/:codigo  (rastreo público por código QR)
export async function getByCodigo(req: Request, res: Response) {
  const { codigo } = req.params;
  const [rows]: any = await pool.query(
    "SELECT * FROM despachos WHERE codigo = ?",
    [codigo]
  );
  if (!rows[0]) return res.status(404).json({ message: "Despacho no encontrado" });
  res.json(rows[0]);
}

// POST /despachos  (crear desde una venta)
export async function create(req: Request, res: Response) {
  const {
    venta_id, cliente_nombre, cliente_doc, cliente_tel,
    cliente_email, direccion, ciudad, notas,
    origen_lat, origen_lng, destino_lat, destino_lng,
  } = req.body;

  if (!venta_id || !cliente_nombre || !direccion || !ciudad)
    return res.status(400).json({ message: "Faltan campos obligatorios" });

  // Evitar duplicado por venta
  const [existe]: any = await pool.query(
    "SELECT id FROM despachos WHERE venta_id = ?", [venta_id]
  );
  if (existe[0])
    return res.status(400).json({ message: "Ya existe un despacho para esta venta" });

  const codigo = await generarCodigo();

  const [result]: any = await pool.query(
    `INSERT INTO despachos
      (codigo, venta_id, cliente_nombre, cliente_doc, cliente_tel,
       cliente_email, direccion, ciudad, notas,
       origen_lat, origen_lng, destino_lat, destino_lng)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      codigo, venta_id, cliente_nombre, cliente_doc, cliente_tel,
      cliente_email, direccion, ciudad, notas,
      origen_lat, origen_lng, destino_lat, destino_lng,
    ]
  );

  res.status(201).json({ id: result.insertId, codigo, message: "Despacho creado" });
}

// PUT /despachos/:id/estado  (cambiar estado)
export async function updateEstado(req: Request, res: Response) {
  const { id } = req.params;
  const { estado } = req.body;
  const estados = ["en_empresa", "en_ruta", "entregado", "cancelado"];
  if (!estados.includes(estado))
    return res.status(400).json({ message: "Estado inválido" });

  await pool.query("UPDATE despachos SET estado = ? WHERE id = ?", [estado, id]);
  res.json({ message: "Estado actualizado" });
}

// PUT /despachos/:id/posicion  (GPS del despachador)
export async function updatePosicion(req: Request, res: Response) {
  const { id } = req.params;
  const { lat, lng } = req.body;
  if (!lat || !lng)
    return res.status(400).json({ message: "lat y lng requeridos" });

  await pool.query(
    `UPDATE despachos
     SET despacho_lat = ?, despacho_lng = ?, ultima_pos = NOW()
     WHERE id = ?`,
    [lat, lng, id]
  );
  res.json({ message: "Posición actualizada" });
}

// DELETE /despachos/:id
export async function remove(req: Request, res: Response) {
  const { id } = req.params;
  await pool.query("DELETE FROM despachos WHERE id = ?", [id]);
  res.json({ message: "Despacho eliminado" });
}