import { Router } from "express";
import * as poController from "./purchaseOrder.controller.js";
import { authenticateJWT } from "../../middleware/auth.js"; // 假設你有身份驗證

const router: Router = Router();

// 所有 PO 路由都建議加上 auth 檢查
router.use(authenticateJWT);

// 基礎 CRUD 路由
router.post("/", poController.addPurchaseOrder);      // 新增
router.get("/", poController.getProjectPOs);          // 列表 (可用 ?projectId=xxx 進行過濾)
router.patch("/:id", poController.updatePO);          // 更新部分欄位
router.delete("/:id", poController.removePO);        // 刪除

export default router;