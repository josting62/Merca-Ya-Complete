import { Router } from "express";
import {
  getAll,
  getOne,
  create,
  update,
  remove,
  registrarPago,
} from "../controller/ventas.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
router.use(authMiddleware);

router.get("/", getAll);
router.get("/:id", getOne);
router.post("/", create);
router.put("/:id", update);
router.put("/:id/pago", registrarPago);
router.delete("/:id", remove);

export default router;
