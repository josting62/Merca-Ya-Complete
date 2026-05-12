import { Request, Response } from "express";
import { pool } from "../config/db";

export async function getAll(req: Request, res: Response) {
  const [rows]: any = await pool.query(
    "SELECT * FROM productos ORDER BY cat, nombre",
  );
  res.json(rows.map(mapProducto));
}

export async function getOne(req: Request, res: Response) {
  const { id } = req.params;
  const [rows]: any = await pool.query("SELECT * FROM productos WHERE id = ?", [
    id,
  ]);
  if (!rows[0])
    return res.status(404).json({ message: "Producto no encontrado" });
  res.json(mapProducto(rows[0]));
}

export async function create(req: Request, res: Response) {
  const {
    nombre,
    marca,
    cat,
    descripcion,
    barcode,
    sku,
    pventa,
    pcompra,
    stock,
    stockMin,
    unidad,
    iva,
    foto,
  } = req.body;

  const [last]: any = await pool.query(
    "SELECT id FROM productos ORDER BY created_at DESC LIMIT 1",
  );
  const num = last[0] ? parseInt(last[0].id.split("-")[1]) + 1 : 1;
  const id = `P-${String(num).padStart(3, "0")}`;

  await pool.query(
    `INSERT INTO productos (id, nombre, marca, cat, descripcion, barcode, sku, pventa, pcompra, stock, stock_min, unidad, iva, foto)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      id,
      nombre,
      marca,
      cat,
      descripcion,
      barcode,
      sku,
      pventa,
      pcompra,
      stock || 0,
      stockMin || 5,
      unidad,
      iva || 0,
      foto || "",
    ],
  );
  res.status(201).json({ id, message: "Producto creado" });
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  const {
    nombre,
    marca,
    cat,
    descripcion,
    barcode,
    sku,
    pventa,
    pcompra,
    stock,
    stockMin,
    unidad,
    iva,
    foto,
  } = req.body;

  await pool.query(
    `UPDATE productos SET nombre=?, marca=?, cat=?, descripcion=?, barcode=?, sku=?,
     pventa=?, pcompra=?, stock=?, stock_min=?, unidad=?, iva=?, foto=? WHERE id=?`,
    [
      nombre,
      marca,
      cat,
      descripcion,
      barcode,
      sku,
      pventa,
      pcompra,
      stock,
      stockMin,
      unidad,
      iva,
      foto,
      id,
    ],
  );
  res.json({ message: "Producto actualizado" });
}

export async function updateStock(req: Request, res: Response) {
  const { id } = req.params;
  const { stock } = req.body;
  await pool.query("UPDATE productos SET stock = ? WHERE id = ?", [stock, id]);
  res.json({ message: "Stock actualizado" });
}

export async function remove(req: Request, res: Response) {
  const { id } = req.params;
  await pool.query("DELETE FROM productos WHERE id = ?", [id]);
  res.json({ message: "Producto eliminado" });
}

function mapProducto(p: any) {
  return {
    id: p.id,
    nombre: p.nombre,
    marca: p.marca,
    cat: p.cat,
    desc: p.descripcion,
    barcode: p.barcode,
    sku: p.sku,
    pventa: parseFloat(p.pventa),
    pcompra: parseFloat(p.pcompra),
    stock: p.stock,
    stockMin: p.stock_min,
    unidad: p.unidad,
    iva: p.iva,
    foto: p.foto,
  };
}
