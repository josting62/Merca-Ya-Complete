import { Request, Response } from "express";
import { pool } from "../config/db";

// Formatea fecha ISO a YYYY-MM-DD limpio
function formatFecha(f: any): string | null {
  if (!f) return null;
  if (typeof f === "string" && f.length === 10) return f; // ya es YYYY-MM-DD
  const d = new Date(f);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

// ── Cuentas por cobrar ──
export async function getCuentasCobrar(req: Request, res: Response) {
  const [rows]: any = await pool.query(`
    SELECT v.id, v.cliente, v.total, v.estado_pago, v.fecha_pago, v.metodo
    FROM ventas v
    WHERE v.estado_pago != 'pagado' AND v.estado != 'cancelado'
    ORDER BY v.fecha_pago ASC
  `);
  res.json(rows.map((r: any) => ({
    ...r,
    total:      Number(r.total),
    estadoPago: r.estado_pago,
    fechaPago:  formatFecha(r.fecha_pago),
  })));
}

// ── Cuentas por pagar ──
export async function getCuentasPagar(req: Request, res: Response) {
  const [rows]: any = await pool.query(`
    SELECT c.id, c.empresa, c.total, c.estado_pago, c.fecha_pago, c.metodo, c.cuotas
    FROM compras c
    WHERE c.estado_pago != 'pagado' AND c.estado != 'cancelado'
    ORDER BY c.fecha_pago ASC
  `);
  res.json(rows.map((r: any) => ({
    ...r,
    total:      Number(r.total),
    estadoPago: r.estado_pago,
    fechaPago:  formatFecha(r.fecha_pago),
  })));
}

// ── Historial de pagos ──
export async function getHistorial(req: Request, res: Response) {
  const [rows]: any = await pool.query(
    "SELECT * FROM pagos ORDER BY fecha DESC LIMIT 100"
  );
  res.json(rows.map((r: any) => ({
    ...r,
    monto: Number(r.monto),
    fecha: formatFecha(r.fecha),
  })));
}

// ── Registrar cobro ──
export async function cobrar(req: Request, res: Response) {
  const { ventaId, monto, metodo, referencia } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows]: any = await conn.query("SELECT * FROM ventas WHERE id = ?", [ventaId]);
    const venta = rows[0];
    if (!venta) return res.status(404).json({ message: "Venta no encontrada" });

    const nuevoEstado = Number(monto) >= Number(venta.total) ? "pagado" : "parcial";
    await conn.query(
      "UPDATE ventas SET estado_pago = ?, metodo = ? WHERE id = ?",
      [nuevoEstado, metodo, ventaId],
    );
    await conn.query(
      "UPDATE clientes SET deuda = GREATEST(0, deuda - ?) WHERE nombre = ?",
      [monto, venta.cliente],
    );
    await conn.query(
      `INSERT INTO pagos (tipo, referencia_id, nombre, concepto, metodo, monto, fecha)
       VALUES ('cobro', ?, ?, ?, ?, ?, CURDATE())`,
      [ventaId, venta.cliente, `Cobro venta ${ventaId}`, metodo, monto],
    );
    await conn.commit();
    res.json({ message: "Cobro registrado", estadoPago: nuevoEstado });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: "Error al registrar cobro", err });
  } finally {
    conn.release();
  }
}

// ── Registrar pago a proveedor ──
export async function pagar(req: Request, res: Response) {
  const { compraId, monto, metodo, referencia } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows]: any = await conn.query("SELECT * FROM compras WHERE id = ?", [compraId]);
    const compra = rows[0];
    if (!compra) return res.status(404).json({ message: "Compra no encontrada" });

    const nuevoEstado = Number(monto) >= Number(compra.total) ? "pagado" : "parcial";
    await conn.query(
      "UPDATE compras SET estado_pago = ?, metodo = ? WHERE id = ?",
      [nuevoEstado, metodo, compraId],
    );
    await conn.query(
      `INSERT INTO pagos (tipo, referencia_id, nombre, concepto, metodo, monto, fecha)
       VALUES ('pago', ?, ?, ?, ?, ?, CURDATE())`,
      [compraId, compra.empresa, `Pago compra ${compraId}`, metodo, monto],
    );
    await conn.commit();
    res.json({ message: "Pago registrado", estadoPago: nuevoEstado });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: "Error al registrar pago", err });
  } finally {
    conn.release();
  }
}