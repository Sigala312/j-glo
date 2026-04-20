import { Router } from "express";
import { PurchaseInvoiceController } from "./purchaseInvoice.Controller.js";
// import { authMiddleware } from "../middleware/auth"; // 如果你有寫驗證的話

const router: Router = Router();

// 這裡的路徑會是 /api/purchase-invoice
router.post("/", PurchaseInvoiceController.create);
router.get("/", PurchaseInvoiceController.getAll);
router.patch("/:id/status", PurchaseInvoiceController.updateStatus);

export default router;