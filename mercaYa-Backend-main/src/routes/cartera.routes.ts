import { Router } from "express";
import {
  getCuentasCobrar,
  getCuentasPagar,
  getHistorial,
  cobrar,
  pagar,
} from "../controller/cartera.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
router.use(authMiddleware);

router.get("/cobrar", getCuentasCobrar);
router.get("/pagar", getCuentasPagar);
router.get("/historial", getHistorial);
router.post("/cobrar", cobrar);
router.post("/pagar", pagar);

export default router;
