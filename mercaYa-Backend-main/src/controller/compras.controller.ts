import { Request, Response } from "express";
import { pool } from "../config/db";

export async function getAll(req: Request, res: Response) {
  const [compras]: any = await pool.query(
    "SELECT * FROM compras ORDER BY created_at DESC",
  );
  for (const c of compras) {
    const [prods]: any = await pool.query(
      "SELECT nombre as n, precio as p, cantidad as q, descuento as d FROM compra_productos WHERE compra_id = ?",
      [c.id],
    );
    c.prods = prods.map((p: any) => ({
      ...p,
      p: Number(p.p),
      q: Number(p.q),
      d: Number(p.d),
    }));
    c.total = Number(c.total);
    c.estadoPago = c.estado_pago;
    c.fechaCompra = c.fecha_compra;
    c.fechaEntrega = c.fecha_entrega;
    c.fechaPago = c.fecha_pago;
  }
  res.json(compras);
}

export async function getOne(req: Request, res: Response) {
  const { id } = req.params;
  const [rows]: any = await pool.query("SELECT * FROM compras WHERE id = ?", [
    id,
  ]);
  if (!rows[0])
    return res.status(404).json({ message: "Compra no encontrada" });
  const [prods]: any = await pool.query(
    "SELECT nombre as n, precio as p, cantidad as q, descuento as d FROM compra_productos WHERE compra_id = ?",
    [id],
  );
  const c = rows[0];
  res.json({
    ...c,
    total: Number(c.total),
    estadoPago: c.estado_pago,
    fechaCompra: c.fecha_compra,
    fechaEntrega: c.fecha_entrega,
    fechaPago: c.fecha_pago,
    prods: prods.map((p: any) => ({
      ...p,
      p: Number(p.p),
      q: Number(p.q),
      d: Number(p.d),
    })),
  });
}

export async function create(req: Request, res: Response) {
  const {
    empresa,
    metodo,
    cuotas,
    fechaCompra,
    fechaEntrega,
    fechaPago,
    total,
    estado,
    estadoPago,
    notas,
    prods,
  } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [last]: any = await conn.query(
      "SELECT id FROM compras ORDER BY created_at DESC LIMIT 1",
    );
    const num = last[0] ? parseInt(last[0].id.split("-")[1]) + 1 : 1;
    const id = `OC-${String(num).padStart(4, "0")}`;

    await conn.query(
      `INSERT INTO compras (id, empresa, metodo, cuotas, fecha_compra, fecha_entrega, fecha_pago, total, estado, estado_pago, notas)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [
        id,
        empresa,
        metodo,
        cuotas || 1,
        fechaCompra,
        fechaEntrega,
        fechaPago,
        total,
        estado || "pendiente",
        estadoPago || "no-pagado",
        notas,
      ],
    );
    for (const p of prods || []) {
      await conn.query(
        "INSERT INTO compra_productos (compra_id, nombre, precio, cantidad, descuento) VALUES (?,?,?,?,?)",
        [id, p.n, p.p, p.q, p.d || 0],
      );
    }
    await conn.commit();
    res.status(201).json({ id, message: "Compra creada" });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: "Error al crear compra", err });
  } finally {
    conn.release();
  }
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  const {
    empresa,
    metodo,
    cuotas,
    fechaCompra,
    fechaEntrega,
    fechaPago,
    total,
    estado,
    estadoPago,
    notas,
    prods,
  } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      `UPDATE compras SET empresa=?, metodo=?, cuotas=?, fecha_compra=?, fecha_entrega=?,
       fecha_pago=?, total=?, estado=?, estado_pago=?, notas=? WHERE id=?`,
      [
        empresa,
        metodo,
        cuotas,
        fechaCompra,
        fechaEntrega,
        fechaPago,
        total,
        estado,
        estadoPago,
        notas,
        id,
      ],
    );
    await conn.query("DELETE FROM compra_productos WHERE compra_id = ?", [id]);
    for (const p of prods || []) {
      await conn.query(
        "INSERT INTO compra_productos (compra_id, nombre, precio, cantidad, descuento) VALUES (?,?,?,?,?)",
        [id, p.n, p.p, p.q, p.d || 0],
      );
    }
    await conn.commit();
    res.json({ message: "Compra actualizada" });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: "Error al actualizar compra", err });
  } finally {
    conn.release();
  }
}

export async function registrarPago(req: Request, res: Response) {
  const { id } = req.params;
  const { monto, metodo } = req.body;
  const [rows]: any = await pool.query("SELECT * FROM compras WHERE id = ?", [
    id,
  ]);
  const compra = rows[0];
  if (!compra) return res.status(404).json({ message: "Compra no encontrada" });

  const nuevoEstado = monto >= Number(compra.total) ? "pagado" : "parcial";
  await pool.query(
    "UPDATE compras SET estado_pago = ?, metodo = ? WHERE id = ?",
    [nuevoEstado, metodo, id],
  );
  res.json({ message: "Pago registrado", estadoPago: nuevoEstado });
}

export async function remove(req: Request, res: Response) {
  const { id } = req.params;
  await pool.query("DELETE FROM compra_productos WHERE compra_id = ?", [id]);
  await pool.query("DELETE FROM compras WHERE id = ?", [id]);
  res.json({ message: "Compra eliminada" });
}
