import { Router } from "express";
import { OrderController } from "./order.controller.js";
import { authenticateJWT, isAdmin } from "../../middleware/auth.js"; // 假設你有管理員權限中間件

const router: Router = Router();

router.use(authenticateJWT, isAdmin);

router.get("/", OrderController.getOrders);
router.post("/finalize", OrderController.finalizeOrder);
router.patch("/:id", OrderController.updateAmount);
router.delete("/:id", OrderController.deleteOrder);

export default router;