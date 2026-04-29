import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { authenticateJWT } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js"; // 這是通用的 Zod 驗證中間件
import { LoginSchema } from "./auth.schema.js";

const router: Router = Router();

console.log("Microsoft Method:", AuthController.microsoftLogin); // 🚀 檢查這行！
// 登入接口
router.post("/google-login", validate(LoginSchema), AuthController.googleLogin);

router.post("/microsoft-login", AuthController.microsoftLogin);

// 獲取當前資訊 (需要驗證 JWT)
router.get("/me", authenticateJWT, AuthController.getMe);

export default router;