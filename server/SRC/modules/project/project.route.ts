import { Router } from "express";
import { ProjectController } from "./project.controller.js";
import { authenticateJWT } from "../../middleware/auth.js";

const router: Router = Router();

router.get("/all", authenticateJWT, ProjectController.getAllProjects);

router.get("/", authenticateJWT, ProjectController.getProjects);
// 建立專案需要登入
router.post("/", authenticateJWT, ProjectController.create);

router.patch("/:id/status", authenticateJWT, ProjectController.updateProjectStatus);

export default router;