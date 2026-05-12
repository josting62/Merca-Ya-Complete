import { Request, Response } from "express";
import { pool } from "../config/db";
import { io } from "../index"; // ← importa el socket

// ── Helpers ──
function ventaId(n: number) {
  return `VT-${String(n).padStart(4, "0")}`;
}

export async function getAll(_req: Request, res: Response) {
  const [rows]: any = await pool.query(`
    SELECT id, cliente, metodo, fecha_entrega, fecha_pago,
           total, estado, estado_pago, notas, prods, created_at
    FROM ventas ORDER BY created_at DESC
  `);
  const mapped = rows.map((r: any) => ({
    id: r.id,
    cliente: r.cliente,
    metodo: r.metodo,
    fechaEntrega: r.fecha_entrega,
    fechaPago: r.fecha_pago,
    total: Number(r.total), // ← agrega Number()
    estado: r.estado,
    estadoPago: r.estado_pago,
    notas: r.notas,
    prods: typeof r.prods === "string" ? JSON.parse(r.prods) : r.prods,
  }));
  res.json(mapped);
}

export async function getOne(req: Request, res: Response) {
  const { id } = req.params;
  const [rows]: any = await pool.query("SELECT * FROM ventas WHERE id = ?", [
    id,
  ]);
  if (!rows[0]) return res.status(404).json({ message: "Venta no encontrada" });
  const r = rows[0];
  res.json({
    id: r.id,
    cliente: r.cliente,
    metodo: r.metodo,
    fechaEntrega: r.fecha_entrega,
    fechaPago: r.fecha_pago,
    total: r.total,
    estado: r.estado,
    estadoPago: r.estado_pago,
    notas: r.notas,
    prods: typeof r.prods === "string" ? JSON.parse(r.prods) : r.prods,
  });
}

export async function create(req: Request, res: Response) {
  const {
    cliente,
    metodo,
    fechaEntrega,
    fechaPago,
    estado,
    estadoPago,
    notas,
    prods,
    total,
  } = req.body;
  if (!cliente || !metodo)
    return res.status(400).json({ message: "Cliente y método son requeridos" });

  const [count]: any = await pool.query("SELECT COUNT(*) as n FROM ventas");
  const id = ventaId(count[0].n + 1);

  await pool.query(
    `INSERT INTO ventas (id, cliente, metodo, fecha_entrega, fecha_pago, estado, estado_pago, notas, prods, total)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [
      id,
      cliente,
      metodo,
      fechaEntrega || null,
      fechaPago || null,
      estado || "pendiente",
      estadoPago || "no-pagado",
      notas || "",
      JSON.stringify(prods || []),
      total || 0,
    ],
  );

  const venta = {
    id,
    cliente,
    metodo,
    fechaEntrega,
    fechaPago,
    estado: estado || "pendiente",
    estadoPago: estadoPago || "no-pagado",
    notas,
    prods,
    total,
  };

  // ── Emite evento a todos los clientes conectados ──
  io.emit("venta:nueva", venta);

  res.status(201).json(venta);
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  const {
    cliente,
    metodo,
    fechaEntrega,
    fechaPago,
    estado,
    estadoPago,
    notas,
    prods,
    total,
  } = req.body;

  await pool.query(
    `UPDATE ventas SET cliente=?, metodo=?, fecha_entrega=?, fecha_pago=?,
     estado=?, estado_pago=?, notas=?, prods=?, total=? WHERE id=?`,
    [
      cliente,
      metodo,
      fechaEntrega || null,
      fechaPago || null,
      estado,
      estadoPago,
      notas || "",
      JSON.stringify(prods || []),
      total || 0,
      id,
    ],
  );

  // ── Emite actualización ──
  io.emit("venta:actualizada", {
    id,
    cliente,
    metodo,
    fechaEntrega,
    fechaPago,
    estado,
    estadoPago,
    notas,
    prods,
    total,
  });

  res.json({ message: "Venta actualizada" });
}

export async function remove(req: Request, res: Response) {
  const { id } = req.params;
  await pool.query("DELETE FROM ventas WHERE id = ?", [id]);

  // ── Emite eliminación ──
  io.emit("venta:eliminada", { id });

  res.json({ message: "Venta eliminada" });
}

export async function registrarPago(req: Request, res: Response) {
  const { id } = req.params;
  const { monto, metodo } = req.body;

  const [rows]: any = await pool.query("SELECT * FROM ventas WHERE id = ?", [
    id,
  ]);
  const venta = rows[0];
  if (!venta) return res.status(404).json({ message: "Venta no encontrada" });

  const nuevoEstado = monto >= venta.total ? "pagado" : "parcial";
  const fechaPago = new Date().toISOString().slice(0, 10);

  await pool.query(
    "UPDATE ventas SET estado_pago=?, fecha_pago=?, metodo=? WHERE id=?",
    [nuevoEstado, fechaPago, metodo, id],
  );

  // ── Emite pago registrado ──
  io.emit("venta:pagada", {
    id,
    estadoPago: nuevoEstado,
    fechaPago,
    metodo,
    monto,
  });

  res.json({ message: "Pago registrado", estadoPago: nuevoEstado });
}
