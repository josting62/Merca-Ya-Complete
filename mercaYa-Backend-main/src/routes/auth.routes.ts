import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { login, logout, me, verifyPin } from "../controller/auth.controller";

const router = Router();

router.post("/login",  login);
router.post("/logout", logout);           
router.get("/me",      authMiddleware, me);
router.post("/verify-pin", verifyPin);

export default router;