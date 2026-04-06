import { Router } from "express";
import { getCustomers, createCustomer } from "./customer.controller.js";
import { authenticateJWT } from "../../middleware/auth.js"; // 確保已登入

const router: Router = Router();

router.get("/", authenticateJWT, getCustomers);
router.post("/", authenticateJWT, createCustomer);

export default router;