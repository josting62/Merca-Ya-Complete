import { Request, Response } from "express";
import { pool } from "../config/db";

export async function getDashboard(req: Request, res: Response) {
  try {
    // KPIs ventas
    const [ventasData]: any = await pool.query(`
      SELECT
        COUNT(*) as total,
        SUM(total) as monto_total,
        SUM(CASE WHEN estado_pago = 'pagado' THEN 1 ELSE 0 END) as pagadas,
        SUM(CASE WHEN estado_pago != 'pagado' THEN 1 ELSE 0 END) as no_pagadas,
        SUM(CASE WHEN estado_pago != 'pagado' THEN total ELSE 0 END) as por_cobrar
      FROM ventas
    `);

    // KPIs compras
    const [comprasData]: any = await pool.query(`
      SELECT COUNT(*) as total, SUM(total) as monto_total
      FROM compras
    `);

    // KPIs inventario
    const [invData]: any = await pool.query(`
      SELECT
        COUNT(*) as total_productos,
        SUM(pventa * stock) as valor_inventario,
        SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) as sin_stock,
        SUM(CASE WHEN stock > 0 AND stock <= stock_min THEN 1 ELSE 0 END) as stock_bajo
      FROM productos
    `);

    // Últimas 6 ventas
    const [ultimasVentas]: any = await pool.query(`
      SELECT v.id, v.cliente, v.total, v.estado_pago,
             GROUP_CONCAT(vp.nombre SEPARATOR ', ') as productos
      FROM ventas v
      LEFT JOIN venta_productos vp ON vp.venta_id = v.id
      GROUP BY v.id
      ORDER BY v.created_at DESC
      LIMIT 6
    `);

    // Ventas vs Compras últimos 6 meses
    const [barVentas]: any = await pool.query(`
      SELECT
        YEAR(created_at) as anio,
        MONTH(created_at) as mes,
        SUM(total) as total
      FROM ventas
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY YEAR(created_at), MONTH(created_at)
      ORDER BY anio, mes
    `);

    const [barCompras]: any = await pool.query(`
      SELECT
        YEAR(created_at) as anio,
        MONTH(created_at) as mes,
        SUM(total) as total
      FROM compras
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY YEAR(created_at), MONTH(created_at)
      ORDER BY anio, mes
    `);

    // Inventario por categoría
    const [categorias]: any = await pool.query(`
      SELECT cat, SUM(pventa * stock) as valor, SUM(stock) as unidades
      FROM productos
      GROUP BY cat
      ORDER BY cat
    `);

    // Alertas de stock
    const [alertas]: any = await pool.query(`
      SELECT id, nombre, cat, sku, stock, stock_min
      FROM productos
      WHERE stock = 0 OR stock <= stock_min
      ORDER BY stock ASC
      LIMIT 8
    `);

    res.json({
      ventas: {
        total: ventasData[0].total,
        montoTotal: parseFloat(ventasData[0].monto_total) || 0,
        pagadas: ventasData[0].pagadas,
        noPagadas: ventasData[0].no_pagadas,
        porCobrar: parseFloat(ventasData[0].por_cobrar) || 0,
      },
      compras: {
        total: comprasData[0].total,
        montoTotal: parseFloat(comprasData[0].monto_total) || 0,
      },
      inventario: {
        totalProductos: invData[0].total_productos,
        valorInventario: parseFloat(invData[0].valor_inventario) || 0,
        sinStock: invData[0].sin_stock,
        stockBajo: invData[0].stock_bajo,
      },
      ultimasVentas: ultimasVentas.map((v: any) => ({
        id: v.id,
        cliente: v.cliente,
        total: parseFloat(v.total),
        estadoPago: v.estado_pago,
        productos: v.productos,
      })),
      grafico: { ventas: barVentas, compras: barCompras },
      categorias: categorias.map((c: any) => ({
        cat: c.cat,
        valor: parseFloat(c.valor) || 0,
        unidades: c.unidades,
      })),
      alertas: alertas.map((p: any) => ({
        id: p.id,
        nombre: p.nombre,
        cat: p.cat,
        sku: p.sku,
        stock: p.stock,
        stockMin: p.stock_min,
        tipo: p.stock === 0 ? "out" : "low",
      })),
    });
  } catch (err) {
    res.status(500).json({ message: "Error al obtener dashboard", err });
  }
}
