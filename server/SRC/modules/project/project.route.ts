import { Router } from "express";
import { ProjectController } from "./project.controller.js";
import { authenticateJWT } from "../../middleware/auth.js";

const router: Router = Router();

// 建立專案需要登入
router.post("/", authenticateJWT, ProjectController.create);

export default router;