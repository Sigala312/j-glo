import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authenticateJWT } from "../../middleware/auth";
import { validate } from "../../middleware/validate"; // 這是通用的 Zod 驗證中間件
import { LoginSchema } from "./auth.schema";

const router = Router();

// 登入接口
router.post("/google-login", validate(LoginSchema), AuthController.googleLogin);

// 獲取當前資訊 (需要驗證 JWT)
router.get("/me", authenticateJWT, AuthController.getMe);

export default router;