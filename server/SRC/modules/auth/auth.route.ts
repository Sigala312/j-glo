import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { authenticateJWT } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js"; // 這是通用的 Zod 驗證中間件
import { SocialAuthSchema,LocalRegisterSchema, LocalLoginSchema } from "./auth.schema.js";

const router: Router = Router();

console.log("Microsoft Method:", AuthController.microsoftLogin); // 🚀 檢查這行！
// 登入接口

router.post("/register", validate(LocalRegisterSchema), AuthController.register);

// 訪客登入
router.post("/login", validate(LocalLoginSchema), AuthController.login);

router.post("/google-login", validate(SocialAuthSchema), AuthController.googleLogin);

router.post("/microsoft-login", validate(SocialAuthSchema), AuthController.microsoftLogin);

// 獲取當前資訊 (需要驗證 JWT)
router.get("/me", authenticateJWT, AuthController.getMe);

router.get("/users", AuthController.handleGetUsers);

// 管理員審核或停權 (離職)
router.patch("/users/status", AuthController.handleUpdateStatus);

export default router;