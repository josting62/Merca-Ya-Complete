import { Router } from "express";
import {
  getAll, getByCodigo, create,
  updateEstado, updatePosicion, remove,
} from "../controller/despacho.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Rastreo público (sin auth, para el QR)
router.get("/rastreo/:codigo", getByCodigo);

// Rutas protegidas
router.use(authMiddleware);
router.get("/", getAll);
router.post("/", create);
router.put("/:id/estado", updateEstado);
router.put("/:id/posicion", updatePosicion);
router.delete("/:id", remove);

export default router;