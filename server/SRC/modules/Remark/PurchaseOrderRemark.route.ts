import { Router } from "express";
import { PurchaseOrderRemarkController } from "./PurchaseOrderRemark.controller.js";
// 假設你有寫驗證中間件
// import { authenticateJWT } from "../../middleware/auth.js";

const router: Router = Router();

// 注意：這裡的路徑建議統一
router.post("/", PurchaseOrderRemarkController.create);
router.get("/", PurchaseOrderRemarkController.getByPO); // 使用 /?poId=xxx
router.patch("/:id", PurchaseOrderRemarkController.update);
router.delete("/:id", PurchaseOrderRemarkController.delete);

export default router;