import { Router } from "express";
import {
  getAll,
  getOne,
  create,
  update,
  remove,
  updateStock,
} from "../controller/inventario.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
router.use(authMiddleware);

router.get("/", getAll);
router.get("/:id", getOne);
router.post("/", create);
router.put("/:id", update);
router.patch("/:id/stock", updateStock);
router.delete("/:id", remove);

export default router;
