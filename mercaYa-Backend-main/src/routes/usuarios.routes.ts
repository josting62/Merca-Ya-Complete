import { Router } from "express";
import {
  getAll,
  getOne,
  create,
  update,
  remove,
  changePassword,
  changePin,
  generarPinAleatorio,
} from "../controller/usuarios.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { soloAdmin } from "../middleware/role.middleware";

const router = Router();
router.use(authMiddleware);

router.get("/", soloAdmin, getAll);
router.get("/:id", soloAdmin, getOne);
router.post("/", soloAdmin, create);
router.post("/generar-pin", soloAdmin, generarPinAleatorio);
router.put("/:id", soloAdmin, update);
router.put("/:id/password", changePassword); // el propio usuario cambia su contraseña
router.put("/:id/pin", soloAdmin, changePin);
router.delete("/:id", soloAdmin, remove);

export default router;
