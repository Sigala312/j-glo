import { Router } from "express";
import { AttachmentController } from "./attachment.controller.js";
import { fileUpload } from "../../middleware/upload.js"; // 你的 multer 配置
import { authenticateJWT, isAdmin } from "../../middleware/auth.js";

const router: Router = Router();


// attachment.routes.ts
router.get("/", authenticateJWT, AttachmentController.getFiles);
// 通用上傳路徑
// 前端 FormData 欄位名需為 "file"
router.post(
  "/upload", 
  authenticateJWT, 
  isAdmin, 
  fileUpload.single("file"), 
  AttachmentController.upload
);


export default router;